import api from './api';

export const automationService = {
  // GET /api/automation
  getAll: async (filter = {}) => {
    return api.get('/automation', { params: filter });
  },

  // POST /api/automation/:id/cancel
  cancel: async (id) => {
    return api.post(`/automation/${id}/cancel`);
  },

  // POST /api/automation/:id/reschedule
  reschedule: async (id, newScheduledAt) => {
    return api.post(`/automation/${id}/reschedule`, { scheduledAt: newScheduledAt });
  },

  // POST /api/automation/:id/send-now
  sendNow: async (id) => {
    return api.post(`/automation/${id}/send-now`);
  }
};
