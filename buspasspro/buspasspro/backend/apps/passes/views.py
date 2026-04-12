"""Passes App - Views"""

from rest_framework import generics, status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
import json, hmac, hashlib
import uuid
from django.conf import settings

from .models import Route, PassApplication, BusPass, PassScanLog
from .serializers import (
    RouteSerializer, PassApplicationSerializer,
    BusPassSerializer, PassScanSerializer, QRScanInputSerializer
)


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'

class IsConductorUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ('conductor', 'admin')


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.filter(is_active=True)
    serializer_class = RouteSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]


class PassApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = PassApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return PassApplication.objects.all().select_related('student', 'route')
        return PassApplication.objects.filter(student=user).select_related('route')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    @transaction.atomic
    def approve(self, request, pk=None):
        """Admin approves application and creates BusPass"""
        application = PassApplication.objects.select_for_update().select_related('student', 'route').get(pk=pk)

        if application.status == PassApplication.APPROVED and hasattr(application, 'bus_pass'):
            return Response({
                'message': 'Application already approved.',
                'pass': BusPassSerializer(application.bus_pass, context={'request': request}).data
            })

        if application.status != PassApplication.PENDING:
            return Response({'error': 'Application already processed.'}, status=400)

        application.status = PassApplication.APPROVED
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save(update_fields=['status', 'reviewed_by', 'reviewed_at'])

        # Calculate validity
        from datetime import date
        from dateutil.relativedelta import relativedelta
        duration_map = {'monthly': 1, 'quarterly': 3, 'annual': 12}
        months = duration_map.get(application.duration_type, 1)
        valid_from  = date.today()
        valid_until = valid_from + relativedelta(months=months)

        # Keep at most one active pass for the same student-route pair.
        BusPass.objects.filter(
            application__student=application.student,
            application__route=application.route,
            status=BusPass.ACTIVE,
        ).update(status=BusPass.REVOKED)

        # Generate a collision-resistant pass number.
        pass_number = f'BPP{timezone.now().year}{uuid.uuid4().hex[:8].upper()}'
        while BusPass.objects.filter(pass_number=pass_number).exists():
            pass_number = f'BPP{timezone.now().year}{uuid.uuid4().hex[:8].upper()}'

        bus_pass = BusPass.objects.create(
            application=application,
            pass_number=pass_number,
            valid_from=valid_from,
            valid_until=valid_until,
        )

        return Response({
            'message': 'Application approved! Bus pass issued.',
            'pass': BusPassSerializer(bus_pass).data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    @transaction.atomic
    def reject(self, request, pk=None):
        """Admin rejects application with a note"""
        application = PassApplication.objects.select_for_update().get(pk=pk)

        if application.status == PassApplication.REJECTED:
            return Response({'message': 'Application already rejected.'})

        if application.status == PassApplication.APPROVED:
            return Response({'error': 'Approved applications cannot be rejected.'}, status=400)

        note = request.data.get('note', '')
        application.status = PassApplication.REJECTED
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.rejection_note = note
        application.save(update_fields=['status', 'reviewed_by', 'reviewed_at', 'rejection_note'])
        return Response({'message': 'Application rejected.'})


class BusPassViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BusPassSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return BusPass.objects.all().select_related('application__student', 'application__route')
        return BusPass.objects.filter(application__student=user)

    @action(detail=True, methods=['get'])
    def qr(self, request, pk=None):
        """Get QR code image URL for the pass"""
        bus_pass = self.get_object()
        if not bus_pass.is_valid:
            return Response({'error': 'Pass is not valid.'}, status=400)
        return Response({
            'qr_code_url': request.build_absolute_uri(bus_pass.qr_code.url),
            'pass_number': bus_pass.pass_number,
            'valid_until': bus_pass.valid_until,
        })


class QRScanView(generics.GenericAPIView):
    """Conductor scans QR code to validate pass"""
    permission_classes = [IsConductorUser]
    serializer_class = QRScanInputSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['qr_token']

        try:
            payload_str, signature = token.rsplit('|', 1)
            expected_sig = hmac.new(
                settings.QR_CODE_SECRET.encode(),
                payload_str.encode(),
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(signature, expected_sig):
                return Response({'result': 'invalid', 'message': '⛔ Tampered QR code!'}, status=400)

            payload = json.loads(payload_str)
            bus_pass = BusPass.objects.select_related(
                'application__student__student_profile',
                'application__route'
            ).get(id=payload['pass_id'])

            result = 'valid' if bus_pass.is_valid else 'expired'

            PassScanLog.objects.create(
                bus_pass=bus_pass,
                conductor=request.user,
                result=result,
                bus_number=request.data.get('bus_number', ''),
                location=request.data.get('location', '')
            )
            bus_pass.last_scanned = timezone.now()
            bus_pass.save(update_fields=['last_scanned'])

            student = bus_pass.application.student.student_profile
            return Response({
                'result': result,
                'message': '✅ Valid Pass!' if result == 'valid' else '⚠️ Pass Expired!',
                'student_name': student.full_name,
                'student_id': student.student_id,
                'route': str(bus_pass.application.route),
                'valid_until': bus_pass.valid_until,
                'pass_number': bus_pass.pass_number,
            })

        except (BusPass.DoesNotExist, ValueError, KeyError):
            return Response({'result': 'invalid', 'message': '⛔ Invalid QR code!'}, status=400)
