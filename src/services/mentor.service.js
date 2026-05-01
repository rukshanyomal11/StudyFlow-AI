const API_BASE = '/api/mentor';

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson(path, options = {}, fallbackMessage = 'Request failed.') {
  const response = await fetch(path, {
    cache: options.method === 'GET' || !options.method ? 'no-store' : 'default',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const payload = await readJson(response);

  if (!response.ok) {
    const message =
      typeof payload?.error === 'string' && payload.error.trim()
        ? payload.error
        : typeof payload?.message === 'string' && payload.message.trim()
          ? payload.message
          : fallbackMessage;

    throw new Error(message);
  }

  return payload;
}

function buildQueryString(filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export const mentorService = {
  async getStudents(filters = {}) {
    const payload = await requestJson(
      `${API_BASE}/students${buildQueryString(filters)}`,
      { method: 'GET' },
      'Unable to load mentor students right now.',
    );

    return payload;
  },

  async getAssignableStudents(filters = {}) {
    const payload = await requestJson(
      `${API_BASE}/assign-student${buildQueryString(filters)}`,
      { method: 'GET' },
      'Unable to load assignable students right now.',
    );

    return payload?.students ?? [];
  },

  async assignStudent(studentData) {
    return requestJson(
      `${API_BASE}/assign-student`,
      {
        method: 'POST',
        body: JSON.stringify(studentData),
      },
      'Unable to assign this student right now.',
    );
  },

  async updateStudent(studentId, updates) {
    return requestJson(
      `${API_BASE}/students/${studentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      'Unable to update this student right now.',
    );
  },

  async getAnnouncements(filters = {}) {
    const payload = await requestJson(
      `${API_BASE}/announcements${buildQueryString(filters)}`,
      { method: 'GET' },
      'Unable to load mentor announcements right now.',
    );

    return payload?.announcements ?? [];
  },

  async createAnnouncement(announcementData) {
    return requestJson(
      `${API_BASE}/announcements`,
      {
        method: 'POST',
        body: JSON.stringify(announcementData),
      },
      'Unable to create this announcement right now.',
    );
  },

  async updateAnnouncement() {
    throw new Error('Announcement editing is not wired to a detail API route yet.');
  },

  async deleteAnnouncement() {
    throw new Error('Announcement deletion is not wired to a detail API route yet.');
  },

  async getDoubts(filters = {}) {
    const payload = await requestJson(
      `${API_BASE}/doubts${buildQueryString(filters)}`,
      { method: 'GET' },
      'Unable to load mentor doubts right now.',
    );

    return payload?.doubts ?? [];
  },

  async resolveDoubt(doubtId, resolution) {
    return requestJson(
      `${API_BASE}/doubts/${doubtId}/reply`,
      {
        method: 'POST',
        body: JSON.stringify(resolution),
      },
      'Unable to save this doubt reply right now.',
    );
  },

  async getSubjects(filters = {}) {
    const payload = await requestJson(
      `${API_BASE}/subjects${buildQueryString(filters)}`,
      { method: 'GET' },
      'Unable to load mentor subjects right now.',
    );

    return payload?.subjects ?? [];
  },

  async getContent(filters = {}) {
    const payload = await requestJson(
      `${API_BASE}/content${buildQueryString(filters)}`,
      { method: 'GET' },
      'Unable to load mentor content right now.',
    );

    return payload?.materials ?? [];
  },

  async createContent(contentData) {
    return requestJson(
      `${API_BASE}/content`,
      {
        method: 'POST',
        body: JSON.stringify(contentData),
      },
      'Unable to create this content right now.',
    );
  },

  async updateContent(contentId, updates) {
    return requestJson(
      `${API_BASE}/content/${contentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      'Unable to update this content right now.',
    );
  },

  async deleteContent(contentId) {
    await requestJson(
      `${API_BASE}/content/${contentId}`,
      { method: 'DELETE' },
      'Unable to delete this content right now.',
    );

    return { success: true };
  },

  async getQuizzes(filters = {}) {
    const payload = await requestJson(
      `/api/quizzes${buildQueryString(filters)}`,
      { method: 'GET' },
      'Unable to load quizzes right now.',
    );

    return payload?.quizzes ?? [];
  },

  async createQuiz(quizData) {
    return requestJson(
      '/api/quizzes',
      {
        method: 'POST',
        body: JSON.stringify(quizData),
      },
      'Unable to create this quiz right now.',
    );
  },

  async updateQuiz(quizId, updates) {
    return requestJson(
      `/api/quizzes/${quizId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      'Unable to update this quiz right now.',
    );
  },

  async deleteQuiz(quizId) {
    await requestJson(
      `/api/quizzes/${quizId}`,
      { method: 'DELETE' },
      'Unable to delete this quiz right now.',
    );

    return { success: true };
  },

  async getProfile() {
    return requestJson(
      `${API_BASE}/profile`,
      { method: 'GET' },
      'Unable to load mentor profile right now.',
    );
  },

  async updateProfile(updates) {
    return requestJson(
      `${API_BASE}/profile`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      'Unable to update mentor profile right now.',
    );
  },

  async getSettings() {
    return requestJson(
      `${API_BASE}/settings`,
      { method: 'GET' },
      'Unable to load mentor settings right now.',
    );
  },

  async updateSettings(settings) {
    return requestJson(
      `${API_BASE}/settings`,
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      },
      'Unable to update mentor settings right now.',
    );
  },
};

export default mentorService;
