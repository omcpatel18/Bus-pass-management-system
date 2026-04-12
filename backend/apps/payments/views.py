from rest_framework import status as http_status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.conf import settings
from .models import Payment
from apps.passes.models import PassApplication
import hmac, hashlib

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        application_id = request.data.get('application_id')
        try:
            application = PassApplication.objects.get(id=application_id, student=request.user)
        except PassApplication.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=400)

        amount_paise = int(application.route.fare * 100)

        try:
            import razorpay
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            order = client.order.create({
                'amount': amount_paise,
                'currency': 'INR',
                'receipt': str(application_id),
            })
            razorpay_order_id = order['id']
        except Exception:
            razorpay_order_id = f'mock_order_{application_id}'

        payment = Payment.objects.create(
            application=application,
            amount=application.route.fare,
            razorpay_order_id=razorpay_order_id
        )

        return Response({
            'order_id':   razorpay_order_id,
            'amount':     amount_paise,
            'currency':   'INR',
            'key_id':     settings.RAZORPAY_KEY_ID,
            'payment_id': str(payment.id),
        })


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id   = request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpay_payment_id')
        signature  = request.data.get('razorpay_signature')

        try:
            payment = Payment.objects.get(razorpay_order_id=order_id)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=400)

        body = f'{order_id}|{payment_id}'
        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()

        if hmac.compare_digest(expected, signature):
            payment.razorpay_payment_id = payment_id
            payment.razorpay_signature  = signature
            payment.status  = Payment.SUCCESS
            payment.paid_at = timezone.now()
            payment.save()
            return Response({'message': 'Payment verified!'})
        else:
            payment.status = Payment.FAILED
            payment.save()
            return Response({'error': 'Payment verification failed.'}, status=400)
