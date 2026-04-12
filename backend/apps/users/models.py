"""Users App - Custom User Model"""

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
import uuid


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    STUDENT   = 'student'
    ADMIN     = 'admin'
    CONDUCTOR = 'conductor'
    ROLE_CHOICES = [(STUDENT, 'Student'), (ADMIN, 'Admin'), (CONDUCTOR, 'Conductor')]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email        = models.EmailField(unique=True)
    phone        = models.CharField(max_length=15, blank=True)
    role         = models.CharField(max_length=20, choices=ROLE_CHOICES, default=STUDENT)
    is_active    = models.BooleanField(default=True)
    is_staff     = models.BooleanField(default=False)
    is_verified  = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return f'{self.email} ({self.role})'


class StudentProfile(models.Model):
    MALE   = 'M'
    FEMALE = 'F'
    OTHER  = 'O'
    GENDER_CHOICES = [(MALE,'Male'), (FEMALE,'Female'), (OTHER,'Other')]

    user            = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id      = models.CharField(max_length=20, unique=True)
    full_name       = models.CharField(max_length=100)
    gender          = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth   = models.DateField()
    department      = models.CharField(max_length=100)
    year_of_study   = models.IntegerField()
    college_name    = models.CharField(max_length=200)
    home_address    = models.TextField()
    profile_photo   = models.ImageField(upload_to='profiles/', blank=True)
    aadhar_number   = models.CharField(max_length=12, blank=True)
    emergency_contact = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f'{self.full_name} ({self.student_id})'


class OTPVerification(models.Model):
    EMAIL = 'email'
    PHONE = 'phone'
    TYPE_CHOICES = [(EMAIL, 'Email'), (PHONE, 'Phone')]

    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    otp        = models.CharField(max_length=6)
    otp_type   = models.CharField(max_length=10, choices=TYPE_CHOICES)
    is_used    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f'OTP for {self.user.email}'
