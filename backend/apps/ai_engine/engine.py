"""
AI Engine - Route Optimization & Demand Prediction
Uses NetworkX for graph-based routing + scikit-learn for demand forecasting
"""

import numpy as np
import networkx as nx
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime


# ─── Route Graph Optimizer ────────────────────────────────────────────────────

class RouteOptimizer:
    """
    Graph-based route optimization using NetworkX.
    Finds the shortest/optimal path between source and destination.
    """

    def __init__(self):
        self.graph = nx.DiGraph()

    def build_graph(self, routes):
        """
        Build a directed graph from route data.
        routes: list of dicts with {source, destination, stops, distance_km, fare}
        """
        self.graph.clear()
        for route in routes:
            stops = [route['source']] + route.get('stops', []) + [route['destination']]
            for i in range(len(stops) - 1):
                self.graph.add_edge(
                    stops[i], stops[i + 1],
                    weight=route['distance_km'] / max(len(stops) - 1, 1),
                    route_id=route['id'],
                    fare=float(route['fare']),
                )
        return self

    def find_optimal_route(self, source: str, destination: str, optimize_for='distance'):
        """
        Find optimal route between two stops.
        optimize_for: 'distance' | 'fare' | 'stops'
        """
        if not self.graph.has_node(source):
            return {'error': f'Source stop "{source}" not found in network'}
        if not self.graph.has_node(destination):
            return {'error': f'Destination stop "{destination}" not found in network'}

        try:
            if optimize_for == 'fare':
                path = nx.shortest_path(self.graph, source, destination, weight='fare')
            else:
                path = nx.shortest_path(self.graph, source, destination, weight='weight')

            total_distance = nx.shortest_path_length(self.graph, source, destination, weight='weight')
            total_fare     = nx.shortest_path_length(self.graph, source, destination, weight='fare')

            return {
                'path': path,
                'stops_count': len(path),
                'total_distance_km': round(total_distance, 2),
                'estimated_fare': round(total_fare, 2),
                'estimated_duration_min': int(total_distance * 3),  # ~20km/h average
            }
        except nx.NetworkXNoPath:
            return {'error': f'No route found from {source} to {destination}'}

    def get_all_routes_from(self, source: str):
        """Get all reachable destinations from a source stop"""
        if not self.graph.has_node(source):
            return []
        return [
            {'destination': dest, 'hops': len(path) - 1}
            for dest, path in nx.single_source_shortest_path(self.graph, source).items()
            if dest != source
        ]


# ─── Demand Prediction Model ──────────────────────────────────────────────────

class DemandPredictor:
    """
    Predict ridership demand for routes using Random Forest.
    Features: hour, day_of_week, month, is_exam_season, route_id
    """

    MODEL_PATH = 'ml_model/models/demand_model.pkl'
    SCALER_PATH = 'ml_model/models/demand_scaler.pkl'

    def __init__(self):
        self.model  = None
        self.scaler = None
        self._load_or_create()

    def _load_or_create(self):
        if os.path.exists(self.MODEL_PATH):
            self.model  = joblib.load(self.MODEL_PATH)
            self.scaler = joblib.load(self.SCALER_PATH)
        else:
            self._train_with_synthetic_data()

    def _train_with_synthetic_data(self):
        """Train on synthetic data until real data is available"""
        np.random.seed(42)
        n_samples = 2000
        hours       = np.random.randint(6, 22, n_samples)
        days        = np.random.randint(0, 7, n_samples)
        months      = np.random.randint(1, 13, n_samples)
        exam_season = np.where((months >= 4) & (months <= 5) | (months >= 10) & (months <= 11), 1, 0)
        route_ids   = np.random.randint(1, 10, n_samples)

        # Simulate realistic demand patterns
        demand = (
            30 * np.sin(np.pi * (hours - 7) / 5) * ((hours >= 7) & (hours <= 10)) +
            25 * np.sin(np.pi * (hours - 16) / 4) * ((hours >= 16) & (hours <= 20)) +
            exam_season * 15 +
            np.random.normal(0, 5, n_samples)
        ).clip(0, 100)

        X = np.column_stack([hours, days, months, exam_season, route_ids])
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_scaled, demand)

        os.makedirs('ml_model/models', exist_ok=True)
        joblib.dump(self.model, self.MODEL_PATH)
        joblib.dump(self.scaler, self.SCALER_PATH)

    def predict(self, route_id: int, dt: datetime = None) -> dict:
        """Predict demand for a route at a given time"""
        if dt is None:
            dt = datetime.now()

        is_exam = 1 if dt.month in (4, 5, 10, 11) else 0
        features = np.array([[dt.hour, dt.weekday(), dt.month, is_exam, route_id]])
        features_scaled = self.scaler.transform(features)
        predicted = float(self.model.predict(features_scaled)[0])

        level = 'low' if predicted < 30 else 'medium' if predicted < 65 else 'high'
        return {
            'route_id':        route_id,
            'predicted_demand': round(predicted, 1),
            'demand_level':    level,
            'hour':            dt.hour,
            'day':             dt.strftime('%A'),
            'recommendation':  self._get_recommendation(level, predicted),
        }

    def _get_recommendation(self, level, demand):
        if level == 'high':
            return f'🚌 High demand ({demand:.0f} passengers expected). Consider adding extra bus.'
        elif level == 'medium':
            return f'🟡 Moderate demand ({demand:.0f} passengers). Regular schedule should suffice.'
        else:
            return f'🟢 Low demand ({demand:.0f} passengers). Single bus adequate.'

    def predict_week_ahead(self, route_id: int) -> list:
        """Predict demand for next 7 days, hourly"""
        from datetime import timedelta
        now = datetime.now().replace(minute=0, second=0, microsecond=0)
        predictions = []
        for day_offset in range(7):
            for hour in [7, 8, 9, 12, 16, 17, 18, 20]:
                dt = (now + timedelta(days=day_offset)).replace(hour=hour)
                pred = self.predict(route_id, dt)
                pred['datetime'] = dt.isoformat()
                predictions.append(pred)
        return predictions


# ─── Singleton instances ──────────────────────────────────────────────────────
route_optimizer  = RouteOptimizer()
demand_predictor = DemandPredictor()
