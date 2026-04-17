import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.payments.models import Payment

payments = Payment.objects.all().order_by('-created_at')[:10]
for p in payments:
    print(f"ID: {p.id}")
    print(f"  Order: {p.razorpay_order_id}")
    print(f"  Status: {p.status}")
    print(f"  Purpose: {p.purpose}")
    print(f"  Amount: {p.amount}")
    print(f"  Meta: {p.metadata}")
    print("---")
