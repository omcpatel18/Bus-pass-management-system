import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
print("RAZORPAY_KEY_ID:", settings.RAZORPAY_KEY_ID)
print("RAZORPAY_KEY_SECRET:", settings.RAZORPAY_KEY_SECRET)
