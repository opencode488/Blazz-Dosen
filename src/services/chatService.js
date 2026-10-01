import api from './api';

export const chatService = {
  // POST /api/chat/generate
  generateDraft: async ({ prompt, lecturerId, courseId, context }) => {
    return api.post('/chat/generate', { prompt, lecturerId, courseId, context });
  },

  // GET /api/chat/history
  getHistory: async () => {
    return api.get('/chat/history');
  },

  // POST /api/chat/send
  sendMessage: async (data) => {
    return api.post('/chat/send', data);
  }
};
