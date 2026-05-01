async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function ensureSuccess(response, fallbackMessage) {
  if (response.ok) {
    return readJson(response);
  }

  const payload = await readJson(response);
  const message =
    typeof payload?.error === 'string' && payload.error.trim()
      ? payload.error
      : typeof payload?.message === 'string' && payload.message.trim()
        ? payload.message
        : fallbackMessage;

  throw new Error(message);
}

const API_BASE = '/api/subjects';

export const subjectService = {
  async getSubjects() {
    const response = await fetch(API_BASE, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = await ensureSuccess(
      response,
      'Unable to load subjects right now.',
    );

    return payload?.subjects ?? [];
  },

  async createSubject(data) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const payload = await ensureSuccess(
      response,
      'Unable to create this subject right now.',
    );

    return payload?.subject ?? null;
  },

  async updateSubject(id, updates) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const payload = await ensureSuccess(
      response,
      'Unable to update this subject right now.',
    );

    return payload?.subject ?? null;
  },

  async deleteSubject(id) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    await ensureSuccess(
      response,
      'Unable to delete this subject right now.',
    );

    return true;
  },
};

export default subjectService;
