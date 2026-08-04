import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expense_tracker.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute('DROP TABLE IF EXISTS expense_tracker1_investment CASCADE;')
    cursor.execute("DELETE FROM django_migrations WHERE app='expense_tracker1' AND name='0012_investment';")
    
print("Table dropped and migration removed.")
