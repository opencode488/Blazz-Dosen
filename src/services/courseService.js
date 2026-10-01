import api from './api';

export const courseService = {
  // GET /api/courses
  getAll: async () => {
    return api.get('/courses');
  },

  // GET /api/courses/:id
  getById: async (id) => {
    return api.get(`/courses/${id}`);
  },

  // POST /api/courses
  create: async (data) => {
    return api.post('/courses', data);
  },

  // PUT /api/courses/:id
  update: async (id, data) => {
    return api.put(`/courses/${id}`, data);
  },

  // DELETE /api/courses/:id
  delete: async (id) => {
    return api.delete(`/courses/${id}`);
  }
};
