from rest_framework import serializers
from .models import Expense, Category, UserProfile
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


from .models import ExpenseItem

class ExpenseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseItem
        fields = ['id', 'name', 'price']

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    items = ExpenseItemSerializer(many=True, read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['user']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user_type', 'date_of_birth', 'perspective', 'profile_picture']


from .models import ExpenseGroup, GroupMember, GroupExpense, ExpenseSplit

class GroupMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMember
        fields = '__all__'


class ExpenseSplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseSplit
        fields = ['id', 'member', 'amount_owed', 'percentage']

class GroupExpenseSerializer(serializers.ModelSerializer):
    paid_by_name = serializers.CharField(source='paid_by.name', read_only=True)
    splits = ExpenseSplitSerializer(many=True, read_only=True)

    class Meta:
        model = GroupExpense
        fields = '__all__'


class ExpenseGroupSerializer(serializers.ModelSerializer):
    members = GroupMemberSerializer(many=True, read_only=True)
    expenses = GroupExpenseSerializer(many=True, read_only=True)

    class Meta:
        model = ExpenseGroup
        fields = '__all__'
        read_only_fields = ['user', 'invite_code']

from .models import Investment

class InvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        fields = '__all__'
        read_only_fields = ['user']

from .models import Subscription

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['user']

from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ['user']

from .models import SavingsGoal

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = '__all__'
        read_only_fields = ['user']
