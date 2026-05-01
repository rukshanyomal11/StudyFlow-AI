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

const API_BASE = '/api/flashcards';

export const flashcardService = {
  async getFlashcards() {
    const response = await fetch(API_BASE, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = await ensureSuccess(
      response,
      'Unable to load flashcards right now.',
    );

    return payload?.flashcards ?? [];
  },

  async getFlashcard(id) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = await ensureSuccess(
      response,
      'Unable to load this flashcard right now.',
    );

    return payload?.flashcard ?? null;
  },

  async createFlashcard(data) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const payload = await ensureSuccess(
      response,
      'Unable to create this flashcard right now.',
    );

    return payload?.flashcard ?? null;
  },

  async updateFlashcard(id, updates) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const payload = await ensureSuccess(
      response,
      'Unable to update this flashcard right now.',
    );

    return payload?.flashcard ?? null;
  },

  async deleteFlashcard(id) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    await ensureSuccess(
      response,
      'Unable to delete this flashcard right now.',
    );

    return true;
  },

  async reviewFlashcard(flashcardId, difficulty) {
    const response = await fetch(`${API_BASE}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcardId, difficulty }),
    });
    const payload = await ensureSuccess(
      response,
      'Unable to save this review right now.',
    );

    return payload?.flashcard ?? null;
  },
};

export default flashcardService;
