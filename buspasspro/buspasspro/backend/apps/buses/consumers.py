"""Bus Tracking WebSocket Consumer"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Bus, BusLocation


class BusTrackingConsumer(AsyncWebsocketConsumer):
    """Real-time bus location WebSocket consumer"""

    async def connect(self):
        self.route_id   = self.scope['url_route']['kwargs'].get('route_id', 'all')
        self.group_name = f'bus_tracking_{self.route_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Immediately send current positions
        locations = await self.get_current_locations()
        await self.send(text_data=json.dumps({
            'type': 'initial_positions',
            'data': locations
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        """Conductor/driver sends GPS update via WebSocket"""
        data = json.loads(text_data)
        if data.get('type') == 'location_update':
            await self.save_location(data)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type':       'bus_location_update',
                    'bus_number': data['bus_number'],
                    'latitude':   data['latitude'],
                    'longitude':  data['longitude'],
                    'speed_kmh':  data.get('speed_kmh', 0),
                    'stop_name':  data.get('stop_name', ''),
                    'timestamp':  data.get('timestamp', ''),
                }
            )

    async def bus_location_update(self, event):
        """Broadcast location update to all connected clients"""
        await self.send(text_data=json.dumps({
            'type': 'location_update',
            'data': event
        }))

    @database_sync_to_async
    def get_current_locations(self):
        buses = Bus.objects.filter(is_active=True).select_related('route')
        result = []
        for bus in buses:
            try:
                loc = bus.locations.latest()
                result.append({
                    'bus_number': bus.bus_number,
                    'route_name': str(bus.route) if bus.route else '',
                    'latitude':   loc.latitude,
                    'longitude':  loc.longitude,
                    'speed_kmh':  loc.speed_kmh,
                    'stop_name':  loc.stop_name,
                    'last_seen':  loc.timestamp.isoformat(),
                })
            except BusLocation.DoesNotExist:
                pass
        return result

    @database_sync_to_async
    def save_location(self, data):
        try:
            bus = Bus.objects.get(bus_number=data['bus_number'])
            BusLocation.objects.create(
                bus=bus,
                latitude=data['latitude'],
                longitude=data['longitude'],
                speed_kmh=data.get('speed_kmh', 0),
                stop_name=data.get('stop_name', ''),
            )
        except Bus.DoesNotExist:
            pass
