from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExpenseViewSet,
    CategoryViewSet,
    SignupView,
    LoginView,
    VerifyOTPView,
    ForgotPasswordOTPView,
    ResetPasswordView,
    UserProfileView,
    DashboardDataView,
    UpdateBudgetView,
    AdminDashboardView,
    AdminDeleteUserView,
    AdminPromoteUserView,
    AdminDemoteUserView,
    ExpenseGroupViewSet,
    GroupMemberViewSet,
    GroupExpenseViewSet,
    GroupSettlementAPIView,
    ScanReceiptView,
    InvestmentViewSet,
    MLPredictCategoryView,
    MLAnalyzeExpenseView,
    MLBudgetForecastView,
    SubscriptionViewSet,
    DeleteAccountView,
    JoinGroupView,
    FeedbackCreateView,
    PublicStatsView,
    SavingsGoalViewSet,
    ExportDataView,
    AIChatbotView,
    SocialAuthView,
)
from .plaid_views import CreateLinkTokenView, SetAccessTokenView, GetAccountsView, ConnectMockBankView

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'categories', CategoryViewSet)
router.register(r'groups', ExpenseGroupViewSet, basename='expensegroup')
router.register(r'group-members', GroupMemberViewSet, basename='groupmember')
router.register(r'group-expenses', GroupExpenseViewSet, basename='groupexpense')
router.register(r'investments', InvestmentViewSet, basename='investment')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'savings-goals', SavingsGoalViewSet, basename='savingsgoal')

urlpatterns = [
    path('expenses/scan-receipt/', ScanReceiptView.as_view(), name='scan-receipt'),
    path('groups/join/', JoinGroupView.as_view(), name='join-group'),
    path('', include(router.urls)),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/social/', SocialAuthView.as_view(), name='social-auth'),
    path('auth/forgot-password/', ForgotPasswordOTPView.as_view(), name='forgot-password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/update-budget/', UpdateBudgetView.as_view(), name='update-budget'),
    path('auth/delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('dashboard-data/', DashboardDataView.as_view(), name='dashboard-data'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/user/<int:pk>/', AdminDeleteUserView.as_view(), name='admin-delete-user'),
    path('admin/user/<int:pk>/promote/', AdminPromoteUserView.as_view(), name='admin-promote-user'),
    path('admin/user/<int:pk>/demote/', AdminDemoteUserView.as_view(), name='admin-demote-user'),
    path('groups/<int:group_id>/settlements/', GroupSettlementAPIView.as_view(), name='group-settlements'),
    path('ml/predict-category/', MLPredictCategoryView.as_view(), name='ml-predict-category'),
    path('ml/analyze-expense/', MLAnalyzeExpenseView.as_view(), name='ml-analyze-expense'),
    path('ml/budget-forecast/', MLBudgetForecastView.as_view(), name='ml-budget-forecast'),
    path('feedback/', FeedbackCreateView.as_view(), name='submit-feedback'),
    path('public-stats/', PublicStatsView.as_view(), name='public-stats'),
    path('export-data/', ExportDataView.as_view(), name='export-data'),
    path('ai-chat/', AIChatbotView.as_view(), name='ai-chat'),
    path('plaid/create-link-token/', CreateLinkTokenView.as_view(), name='plaid-create-link-token'),
    path('plaid/set-access-token/', SetAccessTokenView.as_view(), name='plaid-set-access-token'),
    path('plaid/accounts/', GetAccountsView.as_view(), name='plaid-accounts'),
    path('mock-banks/connect/', ConnectMockBankView.as_view(), name='connect-mock-bank'),
]
