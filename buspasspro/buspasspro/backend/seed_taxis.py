"""
Seed sample taxi data for testing the nearby taxi feature
Run: python manage.py shell < seed_taxis.py
"""
from apps.taxis.models import Taxi, TaxiLocation
from datetime import datetime
import random

# Sample taxi data
taxis_data = [
    {
        'driver_name': 'Rajesh Kumar',
        'driver_phone': '+91 9876543210',
        'vehicle_type': 'sedan',
        'vehicle_number': 'KA-01-TXI-001',
        'rating': 4.8,
    },
    {
        'driver_name': 'Amit Patel',
        'driver_phone': '+91 9876543211',
        'vehicle_type': 'suv',
        'vehicle_number': 'KA-01-TXI-002',
        'rating': 4.6,
    },
    {
        'driver_name': 'Vikram Singh',
        'driver_phone': '+91 9876543212',
        'vehicle_type': 'auto',
        'vehicle_number': 'KA-01-TXI-003',
        'rating': 4.5,
    },
    {
        'driver_name': 'Pradeep Kumar',
        'driver_phone': '+91 9876543213',
        'vehicle_type': 'sedan',
        'vehicle_number': 'KA-01-TXI-004',
        'rating': 4.7,
    },
    {
        'driver_name': 'Hassan Ahmed',
        'driver_phone': '+91 9876543214',
        'vehicle_type': 'sedan',
        'vehicle_number': 'KA-01-TXI-005',
        'rating': 4.4,
    },
]

# Sample locations (around Bengaluru - using realistic coordinates)
sample_locations = [
    {'latitude': 13.0827, 'longitude': 80.2707, 'stop_name': 'IT Hub - Whitefield'},
    {'latitude': 13.1939, 'longitude': 77.7064, 'stop_name': 'Indiranagar Bus Stop'},
    {'latitude': 13.2084, 'longitude': 77.6269, 'stop_name': 'Koramangala Market'},
    {'latitude': 13.1986, 'longitude': 77.5499, 'stop_name': 'MG Road Metro'},
    {'latitude': 13.0332, 'longitude': 77.5863, 'stop_name': 'Airport Road'},
]

# Create taxis
for taxi_data in taxis_data:
    taxi, created = Taxi.objects.get_or_create(
        vehicle_number=taxi_data['vehicle_number'],
        defaults={
            'driver_name': taxi_data['driver_name'],
            'driver_phone': taxi_data['driver_phone'],
            'vehicle_type': taxi_data['vehicle_type'],
            'rating': taxi_data['rating'],
            'is_active': True,
            'total_trips': random.randint(50, 500),
        }
    )
    
    if created:
        # Add some locations for the taxi
        for i in range(2):
            loc = sample_locations[random.randint(0, len(sample_locations)-1)]
            TaxiLocation.objects.create(
                taxi=taxi,
                latitude=loc['latitude'] + random.uniform(-0.01, 0.01),
                longitude=loc['longitude'] + random.uniform(-0.01, 0.01),
                speed_kmh=random.randint(20, 60),
                stop_name=loc['stop_name'],
                is_available=True if random.random() > 0.3 else False,
            )
        print(f"✓ Created taxi: {taxi.driver_name} ({taxi.vehicle_number})")
    else:
        print(f"✗ Taxi already exists: {taxi.vehicle_number}")

print(f"\n✓ Seeded {Taxi.objects.count()} taxis with locations!")
