import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expense_tracker.settings')
django.setup()

from expense_tracker1.models import Category

categories = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Utilities",
    "Entertainment",
    "Healthcare",
    "Shopping",
    "Personal Care",
    "Education",
    "Travel",
    "Miscellaneous",
    "Groceries"
]

for name in categories:
    Category.objects.get_or_create(name=name)

print("Categories seeded successfully.")
