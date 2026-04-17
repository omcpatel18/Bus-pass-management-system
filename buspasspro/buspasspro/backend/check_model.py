import os
import sys
import django
import json

# Setup Django environment
sys.path.append(r'C:\Users\Hp\OneDrive\Desktop\Bus pass management\buspasspro\buspasspro\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.payments.models import Payment

print(f'Allowed choices in DB model: {[c[0] for c in Payment.PURPOSE_CHOICES]}')
