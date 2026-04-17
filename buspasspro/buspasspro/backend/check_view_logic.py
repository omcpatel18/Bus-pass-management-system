import os
import sys
import django
from django.test import RequestFactory
from django.contrib.auth import get_user_model
import json

# Setup Django environment
sys.path.append(r'C:\Users\Hp\OneDrive\Desktop\Bus pass management\buspasspro\buspasspro\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.payments.views import CreateOrderView
User = get_user_model()
user = User.objects.first()

factory = RequestFactory()
request = factory.post('/payments/create-order/', data=json.dumps({
    'amount': 5000, 
    'purpose': 'TICKET'
}), content_type='application/json')
request.user = user

view = CreateOrderView.as_view()
response = view(request)
print(f'Response status: {response.status_code}')
print(f'Response content: {response.data}')
