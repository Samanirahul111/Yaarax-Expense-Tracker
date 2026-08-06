import calendar
import random
import traceback

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Expense, UserProfile
from .serializers import (
    CategorySerializer,
    ExpenseSerializer,
    UserProfileSerializer,
    UserSerializer,
)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).order_by('-date')

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # Items might be sent as a list of dicts
        items_data = data.pop('items', [])
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        expense = serializer.save(user=self.request.user)
        
        from .models import ExpenseItem
        for item in items_data:
            name = item.get('name')
            price = item.get('price')
            if name and price is not None:
                try:
                    ExpenseItem.objects.create(
                        expense=expense,
                        name=str(name),
                        price=float(price)
                    )
                except (ValueError, TypeError):
                    pass
            
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ScanReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'receipt' not in request.FILES:
            return Response({'error': 'No receipt image uploaded'}, status=400)
            
        import os
        import json
        import requests
        from dotenv import load_dotenv
        from django.conf import settings
        
        load_dotenv(os.path.join(settings.BASE_DIR, '.env'))
        
        receipt_file = request.FILES['receipt']
        image_bytes = receipt_file.read()
        
        groq_api_key = os.environ.get("GROQ_API_KEY")
        if not groq_api_key:
            return Response({'error': 'GROQ_API_KEY is not configured in .env'}, status=500)
            
        try:
            from PIL import Image
            import io
            
            # Compress image before sending to OCR API (1MB limit for free tier)
            img = Image.open(receipt_file)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.thumbnail((1200, 1200))
            
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=75)
            compressed_bytes = output.getvalue()
            
            # Step 1: Extract Text using OCR.space (Free API)
            ocr_payload = {'isOverlayRequired': False, 'apikey': 'helloworld', 'language': 'eng'}
            ocr_response = requests.post(
                'https://api.ocr.space/parse/image',
                files={'file': ('receipt.jpg', compressed_bytes, 'image/jpeg')},
                data=ocr_payload
            )
            ocr_data = ocr_response.json()
            
            if ocr_data.get('IsErroredOnProcessing'):
                error_msg = ocr_data.get('ErrorMessage', ['Unknown OCR error'])[0]
                return Response({'error': f"OCR Error: {error_msg}"}, status=400)
                
            parsed_results = ocr_data.get('ParsedResults', [])
            if not parsed_results:
                return Response({'error': 'Could not extract text from the image.'}, status=500)
                
            extracted_text = parsed_results[0].get('ParsedText', '')
            
            # Step 2: Parse text to JSON using Groq (Free Text API)
            prompt = f"""
            Extract the items and prices from this OCR text of a receipt.
            Return ONLY a valid JSON array of objects, where each object has 'name' (string) and 'price' (number).
            If a price cannot be determined, omit the item.
            Example: [{{"name": "Milk", "price": 4.99}}, {{"name": "Bread", "price": 2.50}}]
            
            OCR TEXT:
            {extracted_text}
            """
            
            groq_headers = {
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            }
            
            groq_payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1
            }
            
            groq_response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=groq_headers, json=groq_payload)
            groq_data = groq_response.json()
            
            if groq_response.status_code != 200:
                return Response({'error': f"Groq API Error: {groq_data.get('error', {}).get('message', 'Unknown error')}"}, status=500)
                
            text = groq_data['choices'][0]['message']['content'].strip()
            
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
                
            items = json.loads(text.strip())
            
            valid_items = []
            for item in items:
                if 'name' in item and 'price' in item:
                    try:
                        valid_items.append({
                            'name': str(item['name']),
                            'price': float(item['price'])
                        })
                    except (ValueError, TypeError):
                        pass
                        
            total_amount = sum(item['price'] for item in valid_items)
            
            return Response({
                'items': valid_items,
                'total': total_amount
            })
            
        except Exception as e:
            print(f"Error scanning receipt: {e}")
            return Response({'error': f'Failed to process receipt: {str(e)}'}, status=500)


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response({"error": "Signup failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier')
        password = request.data.get('password')
        
        # Try to authenticate with username or email
        user = authenticate(username=identifier, password=password)
        if not user:
            # Check if it's an email
            user_obj = User.objects.filter(email=identifier).first()
            if user_obj:
                user = authenticate(username=user_obj.username, password=password)
            else:
                user = None

        if user:
            # Generate OTP
            otp = str(random.randint(100000, 999999))
            
            # Store in cache for 5 minutes
            cache.set(f'otp_{user.email}', otp, timeout=300)
            
            # For development purposes, print the OTP to the console
            print(f"\n{'='*50}")
            print(f"DEVELOPMENT OTP FOR {user.email}: {otp}")
            print(f"{'='*50}\n")
            
            # Send actual email
            try:
                send_mail(
                    subject="Your Yaarax Expense Tracker OTP",
                    message=f"Your One-Time Password is: {otp}\n\nThis OTP is valid for 5 minutes.",
                    from_email=None,  # Uses EMAIL_HOST_USER from settings
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"⚠️ Error sending email: {e}")
                print("Proceeding anyway since OTP is printed in the console.")
                # We do not return 500 here so the user can still proceed with the console OTP
            
            return Response({
                "message": "OTP processed (check console if email failed)", 
                "email": user.email
            }, status=status.HTTP_200_OK)
            
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        cached_otp = cache.get(f'otp_{email}')
        
        if cached_otp and cached_otp == otp:
            user = User.objects.filter(email=email).first()
            if user:
                refresh = RefreshToken.for_user(user)
            
            # Clear OTP
            cache.delete(f'otp_{email}')
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
            }, status=status.HTTP_200_OK)
            
        return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Generate OTP
        otp = str(random.randint(100000, 999999))
        
        # Store in cache for 5 minutes
        cache.set(f'forgot_otp_{user.email}', otp, timeout=300)
        
        # For development purposes, print the OTP to the console
        print(f"\n{'='*50}")
        print(f"DEVELOPMENT FORGOT PASSWORD OTP FOR {user.email}: {otp}")
        print(f"{'='*50}\n")
        
        # Send actual email
        try:
            send_mail(
                subject="Password Reset OTP - Yaarax Expense Tracker",
                message=f"Your One-Time Password for password reset is: {otp}\n\nThis OTP is valid for 5 minutes.",
                from_email=None,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"⚠️ Error sending email: {e}")
            print("Proceeding anyway since OTP is printed in the console.")
            # We do not return 500 here so the user can still proceed with the console OTP
        
        return Response({"message": "OTP processed (check console if email failed)"}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not all([email, otp, new_password]):
            return Response({"error": "Email, OTP, and new password are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        cached_otp = cache.get(f'forgot_otp_{email}')
        
        if cached_otp and cached_otp == otp:
            user = User.objects.filter(email=email).first()
            if user:
                user.set_password(new_password)
                user.save()
                # Clear OTP
                cache.delete(f'forgot_otp_{email}')
                return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        if user.is_superuser:
            return Response({"error": "Cannot delete admin account from here."}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({"message": "Account deleted successfully"}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile, context={'request': request})
            data = serializer.data
            data['username'] = request.user.username
            return Response(data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response({"error": "Profile not found", "username": request.user.username}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        except ObjectDoesNotExist:
            serializer = UserProfileSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(user=request.user)
            
            # Update username if provided
            new_username = request.data.get('username')
            if new_username and new_username != request.user.username:
                # Basic check for existing username
                if User.objects.filter(username=new_username).exclude(id=request.user.id).exists():
                    return Response({"error": "Username is already taken"}, status=status.HTTP_400_BAD_REQUEST)
                request.user.username = new_username
                request.user.save()

            response_data = serializer.data
            response_data['username'] = request.user.username
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            now = timezone.now().date()
            
            # 1. Total spends this month
            current_month_expenses = Expense.objects.filter(
                user=user,
                date__year=now.year,
                date__month=now.month
            )
            total_spends_this_month = current_month_expenses.aggregate(total=Sum('amount'))['total'] or 0

            # 2. Category Spends (Current Month)
            category_spends = current_month_expenses.values('category__name', 'category__id').annotate(
                total=Sum('amount'),
                transactions=Count('id')
            ).order_by('-total')

            # Payment Method Spends (Current Month)
            payment_method_spends = current_month_expenses.values('payment_method').annotate(
                total=Sum('amount'),
                transactions=Count('id')
            ).order_by('-total')

            # 3. Monthly Spends (Last 5 Months)
            monthly_spends = []
            for i in range(4, -1, -1):
                month = now.month - i
                year = now.year
                while month <= 0:
                    month += 12
                    year -= 1
                    
                month_expenses = Expense.objects.filter(
                    user=user,
                    date__year=year,
                    date__month=month
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                monthly_spends.append({
                    'month': calendar.month_abbr[month],
                    'total': month_expenses
                })

            try:
                user_profile = UserProfile.objects.get(user=user)
                monthly_budget = user_profile.monthly_budget
            except Exception:
                monthly_budget = 0

            return Response({
                'total_spends_this_month': total_spends_this_month,
                'category_spends': list(category_spends),
                'payment_method_spends': list(payment_method_spends),
                'monthly_spends': monthly_spends,
                'monthly_budget': monthly_budget,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(traceback.format_exc())
            return Response({"error": str(e), "traceback": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateBudgetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            budget = request.data.get('monthly_budget')
            if budget is None:
                return Response({"error": "monthly_budget is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            profile, created = UserProfile.objects.get_or_create(
                user=request.user,
                defaults={'date_of_birth': '2000-01-01', 'user_type': 'personal'}
            )
            profile.monthly_budget = budget
            profile.save()
            return Response({"message": "Budget updated successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            users = User.objects.all().order_by('-date_joined')
            total_users = users.count()
            
            user_data = []
            for user in users:
                user_data.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'date_joined': user.date_joined.strftime("%Y-%m-%d %H:%M:%S") if user.date_joined else None,
                    'is_superuser': user.is_superuser
                })
                
            payment_stats = list(Expense.objects.values('payment_method').annotate(
                total=Sum('amount'),
                count=Count('id'),
                average=Avg('amount')
            ).order_by('-total'))
                
            return Response({
                'current_user_id': request.user.id if request.user.is_authenticated else None,
                'total_users': total_users,
                'users': user_data,
                'payment_stats': payment_stats
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminDeleteUserView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            user_to_delete = User.objects.get(pk=pk)
            if user_to_delete.is_superuser:
                return Response({"error": "Cannot delete an admin user."}, status=status.HTTP_400_BAD_REQUEST)
                
            user_to_delete.delete()
            return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminPromoteUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user_to_promote = User.objects.get(pk=pk)
            if user_to_promote.is_superuser:
                return Response({"error": "User is already an admin."}, status=status.HTTP_400_BAD_REQUEST)
                
            user_to_promote.is_superuser = True
            user_to_promote.is_staff = True
            user_to_promote.save()
            
            return Response({"message": "User promoted to admin successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminDemoteUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user_to_demote = User.objects.get(pk=pk)
            if not user_to_demote.is_superuser:
                return Response({"error": "User is already a regular user."}, status=status.HTTP_400_BAD_REQUEST)
                
            user_to_demote.is_superuser = False
            user_to_demote.is_staff = False
            user_to_demote.save()
            
            return Response({"message": "User demoted to regular user successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from .models import ExpenseGroup, GroupMember, GroupExpense
from .serializers import ExpenseGroupSerializer, GroupExpenseSerializer

class ExpenseGroupViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExpenseGroup.objects.filter(Q(user=self.request.user) | Q(members__user=self.request.user)).distinct().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        try:
            name = request.data.get('name')
            group_type = request.data.get('group_type', 'other')
            start_date = request.data.get('start_date') or None
            end_date = request.data.get('end_date') or None
            rent_amount = request.data.get('rent_amount') or None
            rent_due_date = request.data.get('rent_due_date') or None
            anniversary_date = request.data.get('anniversary_date') or None
            description = request.data.get('description') or None

            if not name:
                return Response({"error": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)

            group = ExpenseGroup.objects.create(
                name=name,
                group_type=group_type,
                start_date=start_date,
                end_date=end_date,
                rent_amount=rent_amount,
                rent_due_date=rent_due_date,
                anniversary_date=anniversary_date,
                description=description,
                user=request.user
            )
            
            # Add the creator
            GroupMember.objects.create(group=group, name="You", user=request.user)
            
            # Handle multipart member data
            member_index = 0
            added_members = 0
            while True:
                name_key = f'member_name_{member_index}'
                if name_key in request.data:
                    member_name = request.data.get(name_key)
                    member_photo = request.FILES.get(f'member_photo_{member_index}')
                    if member_name and member_name.strip().lower() != 'you':
                        GroupMember.objects.create(group=group, name=member_name.strip(), photo=member_photo)
                        added_members += 1
                    member_index += 1
                else:
                    break
                    
            # Fallback to older json list style if no multipart members found
            if added_members == 0 and 'members' in request.data:
                members = request.data.get('members', [])
                if isinstance(members, str):
                    import json
                    try:
                        members = json.loads(members)
                    except:
                        members = []
                for member_name in members:
                    if member_name and member_name.strip().lower() != 'you':
                        GroupMember.objects.create(group=group, name=member_name.strip())

            serializer = self.get_serializer(group)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        group = self.get_object()
        if group.user != request.user:
            return Response({"error": "Only the group creator can delete this group."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        group = self.get_object()
        if group.user != request.user:
            return Response({"error": "Only the group creator can update this group."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        group = self.get_object()
        if group.user != request.user:
            return Response({"error": "Only the group creator can update this group."}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

class GroupExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = GroupExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group_id = self.request.query_params.get('group_id')
        if group_id:
            return GroupExpense.objects.filter(group__id=group_id).filter(Q(group__user=self.request.user) | Q(group__members__user=self.request.user)).distinct().order_by('-date', '-id')
        return GroupExpense.objects.filter(Q(group__user=self.request.user) | Q(group__members__user=self.request.user)).distinct().order_by('-date', '-id')

    def create(self, request, *args, **kwargs):
        splits_data = request.data.pop('splits', [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        group = serializer.validated_data.get('group')
        paid_by = serializer.validated_data.get('paid_by')
        
        if group.user != request.user and not group.members.filter(user=request.user).exists():
            return Response({"error": "You do not have permission to add expenses to this group."}, status=status.HTTP_403_FORBIDDEN)
            
        if paid_by and paid_by.group != group:
            return Response({"error": "The user who paid does not belong to this group."}, status=status.HTTP_400_BAD_REQUEST)
            
        self.perform_create(serializer)
        
        expense = serializer.instance
        if splits_data:
            from .models import ExpenseSplit, GroupMember
            for split in splits_data:
                member_id = split.get('member')
                amount_owed = split.get('amount_owed', 0)
                percentage = split.get('percentage', None)
                try:
                    member = GroupMember.objects.get(id=member_id, group=expense.group)
                    ExpenseSplit.objects.create(
                        expense=expense,
                        member=member,
                        amount_owed=amount_owed,
                        percentage=percentage
                    )
                except GroupMember.DoesNotExist:
                    pass
        else:
            # Fallback for old clients: split equally among all members
            from .models import ExpenseSplit
            members = expense.group.members.all()
            if members.count() > 0:
                share = float(expense.amount) / members.count()
                for m in members:
                    ExpenseSplit.objects.create(expense=expense, member=m, amount_owed=share)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class GroupSettlementAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        group = ExpenseGroup.objects.filter(id=group_id).filter(Q(user=request.user) | Q(members__user=request.user)).distinct().first()
        if not group:
            return Response({"error": "Group not found"}, status=404)
        
        try:
            members = group.members.all()
            expenses = group.expenses.all()

            total_spent = sum(exp.amount for exp in expenses)
            
            balances = {}
            for m in members:
                balances[m.id] = {
                    'id': m.id,
                    'name': m.name,
                    'paid': 0,
                    'balance': 0 # Positive means they are owed money, negative means they owe money
                }

            # If no expenses, per_person_share is undefined/0 (for backwards compat in frontend)
            # Actually, per_person_share is hard to calculate accurately if splits are unequal.
            # We'll just return total_spent / member count for display purposes if needed.
            member_count = members.count()
            per_person_share = float(total_spent) / member_count if member_count > 0 else 0

            for exp in expenses:
                # The person who paid gets a positive balance for the amount they paid
                paid_amount = float(exp.amount)
                balances[exp.paid_by.id]['paid'] += paid_amount
                balances[exp.paid_by.id]['balance'] += paid_amount
                
                # Each person owes what is specified in their ExpenseSplit
                for split in exp.splits.all():
                    amount_owed = float(split.amount_owed)
                    if split.member.id in balances:
                        balances[split.member.id]['balance'] -= amount_owed

            debtors = []
            creditors = []
            for b in balances.values():
                if b['balance'] < -0.01:
                    debtors.append({'name': b['name'], 'amount': -b['balance']})
                elif b['balance'] > 0.01:
                    creditors.append({'name': b['name'], 'amount': b['balance']})

            settlements = []
            i = 0
            j = 0
            while i < len(debtors) and j < len(creditors):
                d = debtors[i]
                c = creditors[j]
                
                amount = min(d['amount'], c['amount'])
                if amount > 0.01:
                    settlements.append(f"{d['name']} owes {c['name']} ₹{amount:.2f}")

                d['amount'] -= amount
                c['amount'] -= amount

                if d['amount'] < 0.01:
                    i += 1
                if c['amount'] < 0.01:
                    j += 1

            return Response({
                "total_spent": total_spent,
                "per_person_share": per_person_share,
                "balances": list(balances.values()),
                "settlements": settlements
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class JoinGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        invite_code = request.data.get('invite_code')
        if not invite_code:
            return Response({"error": "Invite code is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            group = ExpenseGroup.objects.get(invite_code=invite_code)
        except ExpenseGroup.DoesNotExist:
            return Response({"error": "Invalid invite code"}, status=status.HTTP_404_NOT_FOUND)
            
        if group.user == request.user or group.members.filter(user=request.user).exists():
            return Response({"error": "You are already in this group"}, status=status.HTTP_400_BAD_REQUEST)
            
        GroupMember.objects.create(
            group=group,
            name=request.user.username,
            user=request.user
        )
        
        return Response({"message": "Successfully joined the group", "group_id": group.id}, status=status.HTTP_200_OK)

from .models import Investment
from .serializers import InvestmentSerializer

class InvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Investment.objects.filter(user=self.request.user).order_by('reminder_date', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from .ml_services import predict_category, detect_anomaly, predict_next_month_budget, detect_recurring

class MLPredictCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        description = request.data.get('description', '')
        category = predict_category(description)
        return Response({'category': category}, status=status.HTTP_200_OK)

class MLAnalyzeExpenseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            amount = float(request.data.get('amount', 0))
        except ValueError:
            amount = 0.0
            
        description = request.data.get('description', '')
        
        # Get historical amounts for anomaly detection
        historical_expenses = Expense.objects.filter(user=request.user).order_by('-date')[:50]
        historical_amounts = [float(e.amount) for e in historical_expenses]
        
        is_anomaly = detect_anomaly(historical_amounts, amount)
        is_recurring = detect_recurring(description)
        
        return Response({
            'is_anomaly': is_anomaly,
            'is_recurring': is_recurring
        }, status=status.HTTP_200_OK)

class MLBudgetForecastView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Calculate monthly totals for the past 6 months
        now = timezone.now().date()
        monthly_totals = []
        for i in range(5, -1, -1):
            month = now.month - i
            year = now.year
            while month <= 0:
                month += 12
                year -= 1
            
            total = Expense.objects.filter(
                user=request.user,
                date__year=year,
                date__month=month
            ).aggregate(total=Sum('amount'))['total'] or 0
            monthly_totals.append(float(total))
            
        next_month_prediction = predict_next_month_budget(monthly_totals)
        
        return Response({
            'next_month_prediction': next_month_prediction
        }, status=status.HTTP_200_OK)

from .models import Subscription
from .serializers import SubscriptionSerializer

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user).order_by('next_billing_date', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework.generics import CreateAPIView
from .models import Feedback
from .serializers import FeedbackSerializer
from rest_framework.permissions import AllowAny

class FeedbackCreateView(CreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)

class PublicStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        total_users = User.objects.count()
        total_ratings = Feedback.objects.count()
        average_rating = Feedback.objects.aggregate(Avg('rating'))['rating__avg'] or 0
        return Response({
            'total_users': total_users,
            'total_ratings': total_ratings,
            'average_rating': round(average_rating, 1)
        }, status=status.HTTP_200_OK)

from .models import SavingsGoal
from .serializers import SavingsGoalSerializer

class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user).order_by('deadline', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

import csv
from django.http import HttpResponse

class ExportDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="expenses_export.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Category', 'Description', 'Amount', 'Payment Method'])

        expenses = Expense.objects.filter(user=request.user).order_by('-date')
        for expense in expenses:
            category_name = expense.category.name if expense.category else 'Uncategorized'
            writer.writerow([expense.date, category_name, expense.description, expense.amount, expense.payment_method])

        return response

import os
import requests
import json
from dotenv import load_dotenv
from django.conf import settings

class AIChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '')
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        load_dotenv(os.path.join(settings.BASE_DIR, '.env'))
        groq_api_key = os.environ.get("GROQ_API_KEY")
        if not groq_api_key:
            return Response({'error': 'GROQ API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Build prompt to extract expense data
        prompt = f"""
        You are an AI financial assistant. The user will say something about an expense they just made.
        Extract the following information:
        - description (string): what they bought
        - amount (number): how much they spent
        - category (string): guess the category from this list (Food, Transport, Utilities, Entertainment, Shopping, Other)

        Return ONLY a valid JSON object. If you cannot determine the amount, return {{"error": "Could not determine amount"}}.
        Example: {{"description": "Starbucks Coffee", "amount": 5.50, "category": "Food"}}

        User Message:
        {message}
        """

        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1
        }

        try:
            groq_response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
            groq_data = groq_response.json()
            
            text = groq_data['choices'][0]['message']['content'].strip()
            
            # Clean up markdown JSON formatting if present
            if text.startswith("```json"): text = text[7:]
            if text.startswith("```"): text = text[3:]
            if text.endswith("```"): text = text[:-3]
            
            parsed = json.loads(text.strip())
            
            if 'error' in parsed:
                return Response({'reply': "I couldn't quite catch the amount. Could you please specify how much you spent?"}, status=status.HTTP_200_OK)

            amount = float(parsed.get('amount', 0))
            description = parsed.get('description', 'AI Added Expense')
            category_name = parsed.get('category', 'Other')

            # Find or create category
            category, _ = Category.objects.get_or_create(name=category_name)
            
            # Create expense
            Expense.objects.create(
                user=request.user,
                amount=amount,
                description=description,
                category=category,
                payment_method='Other' # default
            )

            reply = f"I've logged ${amount:.2f} for {description} under {category_name}. Anything else?"
            return Response({'reply': reply, 'logged_expense': parsed}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

