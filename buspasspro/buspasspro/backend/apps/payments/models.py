from django.db import models
from django.db.models import Q
from django.conf import settings
import uuid

class Payment(models.Model):
    CREATED  = 'CREATED'
    PAID     = 'PAID'
    FAILED   = 'FAILED'
    REFUNDED = 'REFUNDED'
    STATUS_CHOICES = [
        (CREATED, 'Created'),
        (PAID, 'Paid'),
        (FAILED, 'Failed'),
        (REFUNDED, 'Refunded')
    ]

    PASS_PURCHASE = 'PASS_PURCHASE'
    PASS_RENEWAL  = 'PASS_RENEWAL'
    WALLET_TOPUP  = 'WALLET_TOPUP'
    TICKET        = 'TICKET'
    PURPOSE_CHOICES = [
        (PASS_PURCHASE, 'Pass Purchase'),
        (PASS_RENEWAL, 'Pass Renewal'),
        (WALLET_TOPUP, 'Wallet Topup'),
        (TICKET, 'Ticket'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user                = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    razorpay_order_id   = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature  = models.CharField(max_length=256, blank=True, null=True)
    amount              = models.IntegerField(help_text="Amount in paise")
    currency            = models.CharField(max_length=5, default='INR')
    purpose             = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    status              = models.CharField(max_length=20, choices=STATUS_CHOICES, default=CREATED)
    metadata            = models.JSONField(default=dict, blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=Q(amount__gt=0),
                name='ck_payment_amount_positive',
            ),
            models.UniqueConstraint(
                fields=['razorpay_payment_id'],
                condition=Q(razorpay_payment_id__isnull=False),
                name='uq_payment_razorpay_payment_id_non_null',
            ),
        ]

    def __str__(self):
        return f"Payment {self.id} | {self.status} | ₹{self.amount / 100}"

class Refund(models.Model):
    PENDING   = 'PENDING'
    PROCESSED = 'PROCESSED'
    FAILED    = 'FAILED'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (PROCESSED, 'Processed'),
        (FAILED, 'Failed')
    ]

    id                 = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment            = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    razorpay_refund_id = models.CharField(max_length=100, blank=True, null=True)
    amount             = models.IntegerField(help_text="Amount in paise")
    reason             = models.TextField()
    status             = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    initiated_by       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='initiated_refunds')
    created_at         = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=Q(amount__gt=0),
                name='ck_refund_amount_positive',
            ),
        ]

    def __str__(self):
        return f"Refund {self.id} | {self.status} | ₹{self.amount / 100}"

