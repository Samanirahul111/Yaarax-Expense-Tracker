import os
import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import status
import uuid
import random
from .models import PlaidItem

PLAID_CLIENT_ID = os.environ.get('PLAID_CLIENT_ID', 'your_plaid_client_id_here')
PLAID_SECRET = os.environ.get('PLAID_SECRET', 'your_plaid_secret_here')
PLAID_ENV = os.environ.get('PLAID_ENV', 'sandbox')

# Determine Plaid Environment
if PLAID_ENV == 'sandbox':
    host = plaid.Environment.Sandbox
elif PLAID_ENV == 'development':
    host = plaid.Environment.Development
else:
    host = plaid.Environment.Production

configuration = plaid.Configuration(
    host=host,
    api_key={
        'clientId': PLAID_CLIENT_ID,
        'secret': PLAID_SECRET,
    }
)
api_client = plaid.ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)

class CreateLinkTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request_data = LinkTokenCreateRequest(
                products=[Products('transactions')],
                client_name="Yaarax Expense Tracker",
                country_codes=[CountryCode('US')],
                language='en',
                user=LinkTokenCreateRequestUser(
                    client_user_id=str(request.user.id)
                )
            )
            response = client.link_token_create(request_data)
            return Response(response.to_dict(), status=status.HTTP_200_OK)
        except plaid.ApiException as e:
            import json
            return Response(json.loads(e.body), status=status.HTTP_400_BAD_REQUEST)

class SetAccessTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        public_token = request.data.get('public_token')
        if not public_token:
            return Response({"error": "public_token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            exchange_request = ItemPublicTokenExchangeRequest(public_token=public_token)
            exchange_response = client.item_public_token_exchange(exchange_request)
            access_token = exchange_response['access_token']
            item_id = exchange_response['item_id']

            # Save to database
            PlaidItem.objects.update_or_create(
                user=request.user,
                item_id=item_id,
                defaults={'access_token': access_token}
            )

            return Response({"message": "Access token saved securely"}, status=status.HTTP_200_OK)
        except plaid.ApiException as e:
            import json
            return Response(json.loads(e.body), status=status.HTTP_400_BAD_REQUEST)

class GetAccountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            items = PlaidItem.objects.filter(user=request.user)
            if not items.exists():
                return Response({"accounts": []}, status=status.HTTP_200_OK)
            
            all_accounts = []
            for item in items:
                if item.access_token.startswith('mock_'):
                    parts = item.access_token.split('_')
                    raw_name = parts[1] if len(parts) > 1 else 'indianbank'
                    
                    # Map the squashed or hyphenated name back to a beautiful formatted name
                    bank_map = {
                        'hdfcbank': 'HDFC Bank',
                        'statebankofindia': 'State Bank of India',
                        'icicibank': 'ICICI Bank',
                        'axisbank': 'Axis Bank',
                        'kotakmahindra': 'Kotak Mahindra',
                        'punjabnationalbank': 'Punjab National Bank'
                    }
                    bank_name = bank_map.get(raw_name.lower(), raw_name.replace('-', ' ').title())
                    
                    # Generate deterministic realistic mock data based on item_id
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
                else:
                    try:
                        accounts_request = AccountsGetRequest(access_token=item.access_token)
                        accounts_response = client.accounts_get(accounts_request)
                        for acc in accounts_response['accounts']:
                            all_accounts.append({
                                'account_id': acc['account_id'],
                                'name': acc['name'],
                                'type': str(acc['type']),
                                'subtype': str(acc['subtype']) if acc.get('subtype') else None,
                                'balance_available': acc['balances']['available'],
                                'balance_current': acc['balances']['current'],
                                'currency': acc['balances']['iso_currency_code'] or 'USD',
                            })
                    except plaid.ApiException as e:
                        print(f"Error fetching accounts for item {item.item_id}: {e}")
                    
            return Response({"accounts": all_accounts}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConnectMockBankView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        bank_name = request.data.get('bank_name')
        if not bank_name:
            return Response({"error": "bank_name is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate dummy tokens (using hyphen to preserve spaces for future connections)
        item_id = f"mock_item_{uuid.uuid4().hex[:10]}"
        safe_bank_name = bank_name.lower().replace(' ', '-')
        access_token = f"mock_{safe_bank_name}_{uuid.uuid4().hex[:10]}"

        PlaidItem.objects.create(
            user=request.user,
            item_id=item_id,
            access_token=access_token
        )

        return Response({"message": f"Successfully connected to {bank_name}"}, status=status.HTTP_200_OK)

