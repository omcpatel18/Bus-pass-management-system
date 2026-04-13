import api from "./api";

const NotificationService = {
  list: async () => {
    const { data } = await api.get("/notifications/");
    return Array.isArray(data) ? data : (data?.results || []);
  },

  markRead: async (id) => {
    const { data } = await api.post(`/notifications/${id}/mark-read/`);
    return data;
  },

  markAllRead: async () => {
    const { data } = await api.post("/notifications/mark-all-read/");
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/notifications/${id}/`);
    return data;
  },

  broadcast: async ({ title, message, audience = "ALL", notif_type = "email" }) => {
    const { data } = await api.post("/notifications/broadcast/", {
      title,
      message,
      audience,
      notif_type,
    });
    return data;
  },
};

export default NotificationService;
