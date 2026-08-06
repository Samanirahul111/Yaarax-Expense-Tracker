import os
import uuid
import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import PlaidItem


class CreateLinkTokenView(APIView):
    """Stub endpoint - real Plaid not used (mock bank system)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"link_token": "mock_link_token_not_used"}, status=status.HTTP_200_OK)


class SetAccessTokenView(APIView):
    """Stub endpoint - real Plaid not used (mock bank system)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"message": "Access token saved securely"}, status=status.HTTP_200_OK)


class GetAccountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            items = PlaidItem.objects.filter(user=request.user)
            if not items.exists():
                return Response({"accounts": []}, status=status.HTTP_200_OK)

            bank_map = {
                'hdfcbank': 'HDFC Bank',
                'hdfc-bank': 'HDFC Bank',
                'statebankofindia': 'State Bank of India',
                'state-bank-of-india': 'State Bank of India',
                'icicibank': 'ICICI Bank',
                'icici-bank': 'ICICI Bank',
                'axisbank': 'Axis Bank',
                'axis-bank': 'Axis Bank',
                'kotakmahindra': 'Kotak Mahindra',
                'kotak-mahindra': 'Kotak Mahindra',
                'punjabnationalbank': 'Punjab National Bank',
                'punjab-national-bank': 'Punjab National Bank',
            }

            all_accounts = []
            for item in items:
                parts = item.access_token.split('_')
                raw_name = parts[1] if len(parts) > 1 else 'indianbank'
                bank_name = bank_map.get(raw_name.lower(), raw_name.replace('-', ' ').title())

                seed = sum(ord(c) for c in item.item_id)
                random.seed(seed)

                all_accounts.append({
                    'account_id': f"{item.item_id}_savings",
                    'name': f"{bank_name} Savings",
                    'type': 'depository',
                    'subtype': 'savings',
                    'balance_available': random.randint(15000, 450000),
                    'balance_current': random.randint(15000, 450000),
                    'currency': 'INR',
                })
                all_accounts.append({
                    'account_id': f"{item.item_id}_checking",
                    'name': f"{bank_name} Salary",
                    'type': 'depository',
                    'subtype': 'checking',
                    'balance_available': random.randint(5000, 85000),
                    'balance_current': random.randint(5000, 85000),
                    'currency': 'INR',
                })

            return Response({"accounts": all_accounts}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConnectMockBankView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        bank_name = request.data.get('bank_name')
        if not bank_name:
            return Response({"error": "bank_name is required"}, status=status.HTTP_400_BAD_REQUEST)

        item_id = f"mock_item_{uuid.uuid4().hex[:10]}"
        safe_bank_name = bank_name.lower().replace(' ', '-')
        access_token = f"mock_{safe_bank_name}_{uuid.uuid4().hex[:10]}"

        PlaidItem.objects.create(
            user=request.user,
            item_id=item_id,
            access_token=access_token
        )

        return Response({"message": f"Successfully connected to {bank_name}"}, status=status.HTTP_200_OK)
