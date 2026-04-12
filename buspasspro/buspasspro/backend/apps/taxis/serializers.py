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
    
    class Meta:
        model = TaxiBooking
        fields = ['id', 'student', 'taxi', 'taxi_details', 'pickup_lat', 'pickup_lng', 
                  'dropoff_lat', 'dropoff_lng', 'pickup_name', 'dropoff_name', 
                  'status', 'fare_estimate', 'created_at']
        read_only_fields = ['student', 'created_at']


class TaxiBookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxiBooking
        fields = ['pickup_lat', 'pickup_lng', 'dropoff_lat', 'dropoff_lng', 
                  'pickup_name', 'dropoff_name']
