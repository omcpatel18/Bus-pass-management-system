from django.urls import path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Bus, BusLocation

class BusListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        buses = Bus.objects.filter(is_active=True).select_related('route')
        data = []
        for bus in buses:
            try:
                loc = bus.locations.latest()
                data.append({'bus_number': bus.bus_number,'route_name': str(bus.route) if bus.route else '','speed_kmh': loc.speed_kmh,'stop_name': loc.stop_name,'latitude': loc.latitude,'longitude': loc.longitude,'last_seen': loc.timestamp.isoformat()})
            except BusLocation.DoesNotExist:
                data.append({'bus_number': bus.bus_number,'route_name': str(bus.route) if bus.route else ''})
        return Response(data)

urlpatterns = [path('', BusListView.as_view(), name='bus_list')]
