import api from './api';

export const lecturerService = {
  // GET /api/lecturers
  getAll: async () => {
    return api.get('/lecturers');
  },

  // GET /api/lecturers/:id
  getById: async (id) => {
    return api.get(`/lecturers/${id}`);
  },

  // POST /api/lecturers
  create: async (data) => {
    return api.post('/lecturers', data);
  },

  // PUT /api/lecturers/:id
  update: async (id, data) => {
    return api.put(`/lecturers/${id}`, data);
  },

  // DELETE /api/lecturers/:id
  delete: async (id) => {
    return api.delete(`/lecturers/${id}`);
  }
};
