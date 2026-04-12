"""Passes App - Bus Pass Models"""

from django.db import models
from django.db.models import Q, F
from django.utils import timezone
import uuid, qrcode, json, hmac, hashlib
from io import BytesIO
from django.core.files import File
from django.conf import settings


class Route(models.Model):
    name         = models.CharField(max_length=200)
    source       = models.CharField(max_length=100)
    destination  = models.CharField(max_length=100)
    stops        = models.JSONField(default=list)  # list of stop names
    distance_km  = models.FloatField()
    duration_min = models.IntegerField()
    fare         = models.DecimalField(max_digits=8, decimal_places=2)
    is_active    = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'source', 'destination'],
                name='uq_route_name_source_destination',
            ),
            models.CheckConstraint(condition=Q(distance_km__gt=0),
                name='ck_route_distance_positive',
            ),
            models.CheckConstraint(condition=Q(duration_min__gt=0),
                name='ck_route_duration_positive',
            ),
            models.CheckConstraint(condition=Q(fare__gt=0),
                name='ck_route_fare_positive',
            ),
        ]

    def __str__(self):
        return f'{self.name}: {self.source} → {self.destination}'


class PassApplication(models.Model):
    PENDING  = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    STATUS_CHOICES = [(PENDING,'Pending'), (APPROVED,'Approved'), (REJECTED,'Rejected')]

    MONTHLY   = 'monthly'
    QUARTERLY = 'quarterly'
    ANNUAL    = 'annual'
    DURATION_CHOICES = [(MONTHLY,'Monthly'), (QUARTERLY,'Quarterly'), (ANNUAL,'Annual')]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student         = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='applications')
    route           = models.ForeignKey(Route, on_delete=models.PROTECT)
    duration_type   = models.CharField(max_length=20, choices=DURATION_CHOICES)
    boarding_stop   = models.CharField(max_length=100)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    applied_at      = models.DateTimeField(auto_now_add=True)
    reviewed_at     = models.DateTimeField(null=True, blank=True)
    reviewed_by     = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    rejection_note  = models.TextField(blank=True)
    documents       = models.JSONField(default=dict)  # uploaded doc URLs

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'route', 'duration_type'],
                condition=Q(status='pending'),
                name='uq_pending_application_student_route_duration',
            ),
        ]

    def __str__(self):
        return f'{self.student.email} - {self.route} ({self.status})'


class BusPass(models.Model):
    ACTIVE   = 'active'
    EXPIRED  = 'expired'
    REVOKED  = 'revoked'
    STATUS_CHOICES = [(ACTIVE,'Active'), (EXPIRED,'Expired'), (REVOKED,'Revoked')]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application  = models.OneToOneField(PassApplication, on_delete=models.CASCADE, related_name='bus_pass')
    pass_number  = models.CharField(max_length=20, unique=True)
    valid_from   = models.DateField()
    valid_until  = models.DateField()
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default=ACTIVE)
    qr_code      = models.ImageField(upload_to='qr_codes/', blank=True)
    qr_token     = models.CharField(max_length=256, blank=True)
    issued_at    = models.DateTimeField(auto_now_add=True)
    last_scanned = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=Q(valid_until__gte=F('valid_from')),
                name='ck_buspass_valid_until_after_valid_from',
            ),
        ]

    @property
    def is_valid(self):
        return self.status == self.ACTIVE and timezone.now().date() <= self.valid_until

    def generate_qr_token(self):
        """Create HMAC-signed token for tamper-proof QR"""
        payload = json.dumps({
            'pass_id': str(self.id),
            'pass_number': self.pass_number,
            'student_id': str(self.application.student.id),
            'valid_until': str(self.valid_until),
        })
        token = hmac.new(
            settings.QR_CODE_SECRET.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        self.qr_token = f'{payload}|{token}'
        return self.qr_token

    def generate_qr_image(self):
        """Generate QR code image and save to model"""
        token = self.generate_qr_token()
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(token)
        qr.make(fit=True)
        img = qr.make_image(fill_color='#1a1a2e', back_color='white')
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        self.qr_code.save(f'pass_{self.pass_number}.png', File(buffer), save=False)

    def save(self, *args, **kwargs):
        if not self.qr_token:
            self.generate_qr_image()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Pass #{self.pass_number} - {self.status}'


class PassScanLog(models.Model):
    VALID   = 'valid'
    INVALID = 'invalid'
    EXPIRED = 'expired'
    RESULT_CHOICES = [(VALID,'Valid'), (INVALID,'Invalid'), (EXPIRED,'Expired')]

    bus_pass   = models.ForeignKey(BusPass, on_delete=models.CASCADE, related_name='scan_logs')
    scanned_at = models.DateTimeField(auto_now_add=True)
    result     = models.CharField(max_length=20, choices=RESULT_CHOICES)
    bus_number = models.CharField(max_length=20, blank=True)
    location   = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f'Scan: {self.bus_pass.pass_number} → {self.result}'

