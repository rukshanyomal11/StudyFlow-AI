const API_BASE = '/api/goals';

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

export const goalService = {
  async getGoals() {
    const payload = await requestJson(
      API_BASE,
      { method: 'GET' },
      'Unable to load goals right now.',
    );

    return payload?.goals ?? [];
  },

  async getGoal(goalId) {
    const payload = await requestJson(
      `${API_BASE}/${goalId}`,
      { method: 'GET' },
      'Unable to load this goal right now.',
    );

    return payload?.goal ?? null;
  },

  async createGoal(goalData) {
    return requestJson(
      API_BASE,
      {
        method: 'POST',
        body: JSON.stringify(goalData),
      },
      'Unable to create this goal right now.',
    );
  },

  async updateGoal(goalId, updates) {
    return requestJson(
      `${API_BASE}/${goalId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      'Unable to update this goal right now.',
    );
  },

  async deleteGoal(goalId) {
    return requestJson(
      `${API_BASE}/${goalId}`,
      { method: 'DELETE' },
      'Unable to delete this goal right now.',
    );
  },
};

export default goalService;
