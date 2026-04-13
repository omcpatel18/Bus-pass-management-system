from datetime import date

from django.conf import settings
from django.contrib.auth import get_user_model

from .models import StudentProfile


def _unique_student_id(user):
    base_id = 'TEST-STUDENT-001'
    conflict = StudentProfile.objects.filter(student_id=base_id).exclude(user=user).exists()
    if not conflict:
        return base_id
    return f"TEST-{str(user.id).split('-')[0].upper()}"


def _ensure_user(email, role, raw_password, phone=''):
    User = get_user_model()
    user, _ = User.objects.get_or_create(
        email=email,
        defaults={
            'role': role,
            'phone': phone,
            'is_active': True,
        },
    )

    dirty = False
    if user.role != role:
        user.role = role
        dirty = True
    if phone and user.phone != phone:
        user.phone = phone
        dirty = True
    if not user.is_active:
        user.is_active = True
        dirty = True
    if not user.check_password(raw_password):
        user.set_password(raw_password)
        dirty = True
    if dirty:
        user.save()
    return user


def ensure_demo_users():
    if not getattr(settings, 'ENABLE_DEMO_USERS', False):
        return

    User = get_user_model()
    admin = _ensure_user(
        email=settings.DEMO_ADMIN_EMAIL,
        role=User.ADMIN,
        raw_password=settings.DEMO_ADMIN_PASSWORD,
    )
    if not admin.is_staff or not admin.is_superuser:
        admin.is_staff = True
        admin.is_superuser = True
        admin.save(update_fields=['is_staff', 'is_superuser'])

    student = _ensure_user(
        email=settings.DEMO_STUDENT_EMAIL,
        role=User.STUDENT,
        raw_password=settings.DEMO_STUDENT_PASSWORD,
        phone='9999999999',
    )

    if not hasattr(student, 'student_profile'):
        StudentProfile.objects.create(
            user=student,
            student_id=_unique_student_id(student),
            full_name='Demo Student',
            gender=StudentProfile.OTHER,
            date_of_birth=date(2002, 1, 1),
            department='Computer Science',
            year_of_study=3,
            college_name='Demo College',
            home_address='Demo Address',
            emergency_contact='9999999999',
        )