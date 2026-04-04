/**
 * BusPassPro — Bus Service
 * REST calls for buses + schedule data
 */

import api from "./api";

const BusService = {

  /** List all active buses */
  getBuses: async () => {
    const { data } = await api.get("/buses/");
    return data.results ?? data;
  },

  /** Get latest location of all buses */
  getBusLocations: async () => {
    const { data } = await api.get("/buses/locations/");
    return data;
  },

  /** Get schedule for a route */
  getSchedule: async (route_id) => {
    const { data } = await api.get(`/buses/schedule/${route_id}/`);
    return data;
  },
};

export default BusService;
