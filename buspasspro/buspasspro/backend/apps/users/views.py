"""Users App - Views"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
import random, string

from .models import User, OTPVerification
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    StudentProfileSerializer, ChangePasswordSerializer
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['email'] = user.email
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


class RegisterView(generics.CreateAPIView):
    """Student self-registration with profile"""
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Registration successful! Please verify your email.',
            'user': UserSerializer(user).data,
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """JWT Login for all roles"""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Login successful!',
            'user': UserSerializer(user).data,
            'tokens': tokens
        })


class LogoutView(APIView):
    """Blacklist refresh token on logout"""
    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get/update current user profile"""
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class SendOTPView(APIView):
    """Send OTP for email verification"""
    def post(self, request):
        user = request.user
        otp = ''.join(random.choices(string.digits, k=6))
        OTPVerification.objects.create(
            user=user,
            otp=otp,
            otp_type='email',
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        # TODO: send email with OTP
        return Response({'message': f'OTP sent to {user.email}'})


class VerifyOTPView(APIView):
    """Verify OTP and mark user as verified"""
    def post(self, request):
        otp = request.data.get('otp')
        record = OTPVerification.objects.filter(
            user=request.user,
            otp=otp,
            is_used=False,
            expires_at__gt=timezone.now()
        ).last()

        if not record:
            return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        record.is_used = True
        record.save()
        request.user.is_verified = True
        request.user.save()
        return Response({'message': 'Email verified successfully!'})


class ChangePasswordView(APIView):
    """Change password for authenticated user"""
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully.'})
