from rest_framework import serializers
from .models import Taxi, TaxiLocation, TaxiBooking


class TaxiLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxiLocation
        fields = ['id', 'latitude', 'longitude', 'speed_kmh', 'stop_name', 'is_available', 'timestamp']


class TaxiSerializer(serializers.ModelSerializer):
    latest_location = serializers.SerializerMethodField()
    
    class Meta:
        model = Taxi
        fields = ['id', 'driver_name', 'driver_phone', 'vehicle_type', 'vehicle_number', 
                  'rating', 'total_trips', 'is_active', 'latest_location']
    
    def get_latest_location(self, obj):
        latest = obj.locations.first()
        if latest:
            return TaxiLocationSerializer(latest).data
        return None


class TaxiBookingSerializer(serializers.ModelSerializer):
    taxi_details = TaxiSerializer(source='taxi', read_only=True)
    effective_fare = serializers.SerializerMethodField()

    def get_effective_fare(self, obj):
        if obj.fare_estimate is not None:
            return float(obj.fare_estimate)

        # Fallback for older bookings where fare_estimate was not persisted.
        try:
            from apps.payments.models import Payment

            payment = (
                Payment.objects.filter(
                    status=Payment.PAID,
                    purpose='TAXI_BOOKING',
                    metadata__taxi_booking_id=str(obj.id),
                )
                .order_by('-created_at')
                .first()
            )
            if payment is not None:
                return round(payment.amount / 100, 2)
        except Exception:
            return 0

        return 0
    
    class Meta:
        model = TaxiBooking
        fields = ['id', 'student', 'taxi', 'taxi_details', 'pickup_lat', 'pickup_lng', 
                  'dropoff_lat', 'dropoff_lng', 'pickup_name', 'dropoff_name', 
                  'status', 'fare_estimate', 'effective_fare', 'created_at']
        read_only_fields = ['student', 'created_at']


class TaxiBookingCreateSerializer(serializers.ModelSerializer):
    def validate_fare_estimate(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Fare estimate must be non-negative.')
        return value

    class Meta:
        model = TaxiBooking
        fields = ['pickup_lat', 'pickup_lng', 'dropoff_lat', 'dropoff_lng', 
                  'pickup_name', 'dropoff_name', 'fare_estimate']
        extra_kwargs = {
            'fare_estimate': {'required': False, 'allow_null': True},
        }
