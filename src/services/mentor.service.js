const API_BASE = '/api/mentor';

export const mentorService = {
  // ============== STUDENTS ==============
  async getStudents() {
    try {
      const response = await fetch(`${API_BASE}/students`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to fetch students: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  async assignStudent(studentData) {
    try {
      const response = await fetch(`${API_BASE}/assign-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) throw new Error(`Failed to assign student: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error assigning student:', error);
      throw error;
    }
  },

  async updateStudent(studentId, updates) {
    try {
      const response = await fetch(`${API_BASE}/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(`Failed to update student: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  // ============== ANNOUNCEMENTS ==============
  async getAnnouncements() {
    try {
      const response = await fetch(`${API_BASE}/announcements`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to fetch announcements: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  async createAnnouncement(announcementData) {
    try {
      const response = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData),
      });
      if (!response.ok) throw new Error(`Failed to create announcement: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  async updateAnnouncement(announcementId, updates) {
    try {
      const response = await fetch(`${API_BASE}/announcements/${announcementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(`Failed to update announcement: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  async deleteAnnouncement(announcementId) {
    try {
      const response = await fetch(`${API_BASE}/announcements/${announcementId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete announcement: ${response.status}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  // ============== DOUBTS ==============
  async getDoubts(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE}/doubts?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to fetch doubts: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching doubts:', error);
      throw error;
    }
  },

  async resolveDoubt(doubtId, resolution) {
    try {
      const response = await fetch(`${API_BASE}/doubts/${doubtId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolution),
      });
      if (!response.ok) throw new Error(`Failed to resolve doubt: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error resolving doubt:', error);
      throw error;
    }
  },

  // ============== CONTENT ==============
  async getContent() {
    try {
      const response = await fetch(`${API_BASE}/content`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        let serverError = '';
        try {
          const errorBody = await response.json();
          serverError = errorBody?.error || '';
        } catch {
          serverError = '';
        }

        const message = serverError
          ? `Failed to fetch content: ${response.status} (${serverError})`
          : `Failed to fetch content: ${response.status}`;
        throw new Error(message);
      }
      const data = await response.json();
      return data?.materials || [];
    } catch (error) {
      throw error;
    }
  },

  async createContent(contentData) {
    try {
      const response = await fetch(`${API_BASE}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      });
      if (!response.ok) throw new Error(`Failed to create content: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  },

  async updateContent(contentId, updates) {
    try {
      const response = await fetch(`${API_BASE}/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(`Failed to update content: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  },

  async deleteContent(contentId) {
    try {
      const response = await fetch(`${API_BASE}/content/${contentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete content: ${response.status}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  },

  // ============== QUIZZES ==============
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

  async updateQuiz(quizId, updates) {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(`Failed to update quiz: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  async deleteQuiz(quizId) {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete quiz: ${response.status}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  // ============== PROFILE ==============
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to fetch profile: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateProfile(updates) {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(`Failed to update profile: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // ============== SETTINGS ==============
  async getSettings() {
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to fetch settings: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  async updateSettings(settings) {
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error(`Failed to update settings: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },
};

export default mentorService;
