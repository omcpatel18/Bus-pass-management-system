"""Users App - Serializers"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = StudentProfile
        fields = '__all__'
        read_only_fields = ('user',)


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model  = User
        fields = ('id', 'email', 'phone', 'role', 'is_verified', 'created_at', 'student_profile')
        read_only_fields = ('id', 'created_at', 'is_verified')


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    student_profile  = StudentProfileSerializer()

    class Meta:
        model  = User
        fields = ('email', 'phone', 'password', 'confirm_password', 'student_profile')

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError('Passwords do not match.')
        return data

    def create(self, validated_data):
        profile_data = validated_data.pop('student_profile')
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        StudentProfile.objects.create(user=user, **profile_data)
        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = (data['email'] or '').strip().lower()
        password = (data['password'] or '').strip()
        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        data['email'] = email
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value
