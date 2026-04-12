import os
import sys
import django
import json

# Setup Django environment
sys.path.append(r'C:\Users\Hp\OneDrive\Desktop\Bus pass management\buspasspro\buspasspro\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.payments.models import Payment

# Define a minimal function mirroring CreateOrderView logic
def test_logic(purpose):
    valid_purposes = {choice[0] for choice in Payment.PURPOSE_CHOICES}
    if purpose not in valid_purposes:
        return 'Invalid payment purpose.'
    return 'Valid'

print(f'Model Purpose Choices: {Payment.PURPOSE_CHOICES}')
print(f'Testing for TICKET: {test_logic("TICKET")}')
