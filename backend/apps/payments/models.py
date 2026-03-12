from django.db import models
import uuid

class Payment(models.Model):
    PENDING  = 'pending'
    SUCCESS  = 'success'
    FAILED   = 'failed'
    REFUNDED = 'refunded'
    STATUS_CHOICES = [(PENDING,'Pending'),(SUCCESS,'Success'),(FAILED,'Failed'),(REFUNDED,'Refunded')]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application         = models.OneToOneField('passes.PassApplication', on_delete=models.CASCADE, related_name='payment')
    amount              = models.DecimalField(max_digits=10, decimal_places=2)
    currency            = models.CharField(max_length=5, default='INR')
    razorpay_order_id   = models.CharField(max_length=100, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature  = models.CharField(max_length=256, blank=True)
    status              = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    created_at          = models.DateTimeField(auto_now_add=True)
    paid_at             = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Payment {self.id} - {self.status}'
