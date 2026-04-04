/**
 * BusPassPro — AI Engine Service
 * Route optimization + demand prediction API calls
 */

import api from "./api";

const AIService = {

  /** Get all available stops for the route planner */
  getStops: async () => {
    const { data } = await api.get("/ai/stops/");
    return data.stops;
  },

  /**
   * Find optimal route between two stops
   * optimize_for: 'distance' | 'fare' | 'stops'
   */
  optimizeRoute: async (source, destination, optimize_for = "distance") => {
    const { data } = await api.post("/ai/optimize-route/", {
      source,
      destination,
      optimize_for,
    });
    return data;
    // Returns: { path, stops_count, total_distance_km, estimated_fare, estimated_duration_min }
  },

  /** Get current demand prediction for a route */
  getDemand: async (route_id) => {
    const { data } = await api.get(`/ai/demand/${route_id}/`);
    return data;
    // Returns: { predicted_demand, demand_level, recommendation }
  },

  /** Get 7-day demand forecast */
  getWeeklyForecast: async (route_id) => {
    const { data } = await api.get(`/ai/forecast/${route_id}/`);
    return data.forecast;
  },
};

export default AIService;
