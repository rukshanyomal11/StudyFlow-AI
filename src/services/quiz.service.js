const API_BASE = '/api/mentor';

export const quizService = {
  // Get all quizzes for mentor
  async getQuizzes() {
    try {
      const response = await fetch(`${API_BASE}/quizzes`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to fetch quizzes: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  // Create a new quiz
  async createQuiz(quizData) {
    try {
      const response = await fetch(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      });
      if (!response.ok) throw new Error(`Failed to create quiz: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  // Update quiz
  async updateQuiz(quizId, quizData) {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      });
      if (!response.ok) throw new Error(`Failed to update quiz: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  // Delete quiz
  async deleteQuiz(quizId) {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete quiz: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  // Submit quiz
  async submitQuiz(quizId, answers) {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error(`Failed to submit quiz: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  },

  // Get quiz history
  async getQuizHistory() {
    try {
      const response = await fetch('/api/quizzes/history', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to fetch quiz history: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      throw error;
    }
  },
};

export default quizService;
