/**
 * BusPassPro — Taxi Service
 * Nearby taxi finder + booking functionality
 */

import api from "./api";

const TaxiService = {
  /**
   * Get all nearby taxis based on user's current location
   * @param {number} lat - User's latitude
   * @param {number} lng - User's longitude
   * @param {number} radius - Search radius in km (default: 5)
   */
  getNearbyTaxis: async (lat, lng, radius = 5) => {
    const { data } = await api.get("/taxis/taxis/nearby/", {
      params: { lat, lng, radius }
    });
    return data;
  },

  /**
   * Get latest locations of all active taxis
   */
  getTaxiLocations: async () => {
    const { data } = await api.get("/taxis/taxis/locations/");
    return data;
  },

  /**
   * Get all taxi bookings for current student
   */
  getMyBookings: async () => {
    const { data } = await api.get("/taxis/bookings/");
    return data;
  },

  /**
   * Get a specific booking details
   * @param {number} bookingId - Booking ID
   */
  getBookingDetail: async (bookingId) => {
    const { data } = await api.get(`/taxis/bookings/${bookingId}/`);
    return data;
  },

  /**
   * Create a new taxi booking
   * @param {Object} bookingData
   * @param {number} bookingData.pickup_lat - Pickup latitude
   * @param {number} bookingData.pickup_lng - Pickup longitude
   * @param {number} bookingData.dropoff_lat - Dropoff latitude (optional)
   * @param {number} bookingData.dropoff_lng - Dropoff longitude (optional)
   * @param {string} bookingData.pickup_name - Pickup location name
   * @param {string} bookingData.dropoff_name - Dropoff location name (optional)
   */
  createBooking: async (bookingData) => {
    const { data } = await api.post("/taxis/bookings/", bookingData);
    return data;
  },

  /**
   * Accept a booking (admin only)
   * @param {number} bookingId - Booking ID
   */
  acceptBooking: async (bookingId) => {
    const { data } = await api.post(`/taxis/bookings/${bookingId}/accept/`);
    return data;
  },

  /**
   * Cancel a booking
   * @param {number} bookingId - Booking ID
   */
  cancelBooking: async (bookingId) => {
    const { data } = await api.post(`/taxis/bookings/${bookingId}/cancel/`);
    return data;
  },
};

export default TaxiService;
