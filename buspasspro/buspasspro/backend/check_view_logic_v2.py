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
data = {'amount': 5000, 'purpose': 'TICKET'}

# Mock the session/authentication logic
from rest_framework.request import Request
from rest_framework.response import Response

request_factory = RequestFactory()
raw_request = request_factory.post('/payments/create-order/', data=json.dumps(data), content_type='application/json')
raw_request.user = user  # Assign first user
raw_request.data = data # Directly inject data since RF.post doesn't populate REST request.data
rf_request = Request(raw_request)

view_instance = CreateOrderView()
view_instance.request = rf_request
response = view_instance.post(rf_request)
print(f'Final Response: {response.data}')
