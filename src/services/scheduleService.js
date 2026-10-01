import api from './api';

export const scheduleService = {
  // GET /api/schedules
  getAll: async () => {
    return api.get('/schedules');
  },

  // GET /api/schedules/:id
  getById: async (id) => {
    return api.get(`/schedules/${id}`);
  },

  // POST /api/schedules
  create: async (data) => {
    return api.post('/schedules', data);
  },

  // PUT /api/schedules/:id
  update: async (id, data) => {
    return api.put(`/schedules/${id}`, data);
  },

  // DELETE /api/schedules/:id
  delete: async (id) => {
    return api.delete(`/schedules/${id}`);
  }
};
