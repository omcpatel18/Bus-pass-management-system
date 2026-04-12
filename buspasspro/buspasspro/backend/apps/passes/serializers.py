"""Passes App - Serializers"""

from rest_framework import serializers
from .models import Route, PassApplication, BusPass, PassScanLog


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'


class PassApplicationSerializer(serializers.ModelSerializer):
    student_name  = serializers.CharField(source='student.student_profile.full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    route_name    = serializers.CharField(source='route.name', read_only=True)
    route_fare    = serializers.DecimalField(source='route.fare', max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = PassApplication
        fields = '__all__'
        read_only_fields = ('student', 'status', 'reviewed_by', 'reviewed_at')

    def validate(self, attrs):
        request = self.context.get('request')
        route = attrs.get('route')
        boarding_stop = attrs.get('boarding_stop', '').strip()
        duration_type = attrs.get('duration_type')

        if route and not route.is_active:
            raise serializers.ValidationError({'route': 'Selected route is inactive.'})

        if route and boarding_stop:
            valid_stops = [route.source, *route.stops, route.destination]
            if boarding_stop not in valid_stops:
                raise serializers.ValidationError({
                    'boarding_stop': 'Boarding stop must belong to the selected route.'
                })

        if request and request.user and route and duration_type:
            has_pending = PassApplication.objects.filter(
                student=request.user,
                route=route,
                duration_type=duration_type,
                status=PassApplication.PENDING,
            ).exists()
            if has_pending:
                raise serializers.ValidationError(
                    'A pending application already exists for this route and duration.'
                )

        return attrs


class BusPassSerializer(serializers.ModelSerializer):
    student_name  = serializers.CharField(source='application.student.student_profile.full_name', read_only=True)
    student_id    = serializers.CharField(source='application.student.student_profile.student_id', read_only=True)
    route_name    = serializers.CharField(source='application.route.name', read_only=True)
    boarding_stop = serializers.CharField(source='application.boarding_stop', read_only=True)
    duration_type = serializers.CharField(source='application.duration_type', read_only=True)
    is_valid      = serializers.BooleanField(read_only=True)
    qr_code_url   = serializers.SerializerMethodField()

    class Meta:
        model  = BusPass
        fields = '__all__'
        read_only_fields = ('id', 'pass_number', 'qr_code', 'qr_token', 'issued_at')

    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code and request:
            return request.build_absolute_uri(obj.qr_code.url)
        return None


class PassScanSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PassScanLog
        fields = '__all__'


class QRScanInputSerializer(serializers.Serializer):
    qr_token   = serializers.CharField()
    bus_number = serializers.CharField(required=False, default='')
    location   = serializers.CharField(required=False, default='')
