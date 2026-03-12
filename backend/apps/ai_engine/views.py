"""AI Engine - Views & URLs"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .engine import route_optimizer, demand_predictor
from apps.passes.models import Route


class OptimizeRouteView(APIView):
    """Find optimal route between two stops"""

    def post(self, request):
        source      = request.data.get('source', '').strip()
        destination = request.data.get('destination', '').strip()
        optimize_for = request.data.get('optimize_for', 'distance')

        if not source or not destination:
            return Response({'error': 'source and destination are required.'}, status=400)

        # Rebuild graph from current routes
        routes = list(Route.objects.filter(is_active=True).values(
            'id', 'source', 'destination', 'stops', 'distance_km', 'fare'
        ))
        route_optimizer.build_graph(routes)

        result = route_optimizer.find_optimal_route(source, destination, optimize_for)

        if 'error' in result:
            return Response(result, status=404)
        return Response(result)


class PredictDemandView(APIView):
    """Predict ridership demand for a route"""

    def get(self, request, route_id):
        try:
            prediction = demand_predictor.predict(int(route_id))
            return Response(prediction)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class WeeklyForecastView(APIView):
    """Get 7-day demand forecast for a route"""

    def get(self, request, route_id):
        try:
            forecast = demand_predictor.predict_week_ahead(int(route_id))
            return Response({'route_id': route_id, 'forecast': forecast})
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class AvailableStopsView(APIView):
    """List all available bus stops for route planner UI"""

    def get(self, request):
        routes = Route.objects.filter(is_active=True).values('source', 'destination', 'stops')
        stops = set()
        for r in routes:
            stops.add(r['source'])
            stops.add(r['destination'])
            stops.update(r.get('stops') or [])
        return Response({'stops': sorted(list(stops))})


# ─── URLs ─────────────────────────────────────────────────────────────────────

from django.urls import path

urlpatterns = [
    path('optimize-route/',             OptimizeRouteView.as_view(),         name='optimize_route'),
    path('demand/<int:route_id>/',      PredictDemandView.as_view(),         name='predict_demand'),
    path('forecast/<int:route_id>/',    WeeklyForecastView.as_view(),        name='weekly_forecast'),
    path('stops/',                      AvailableStopsView.as_view(),        name='available_stops'),
]
