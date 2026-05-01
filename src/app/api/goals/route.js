import { NextResponse } from 'next/server';
import Goal from '@/models/Goal';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';
import {
  calculateGoalTaskProgress,
  getGoalStatusFromProgress,
  serializeGoal,
  serializeGoals,
} from '@/lib/goal-utils';

const allowedStatuses = new Set(['pending', 'in_progress', 'completed']);
const allowedTimeframes = new Map([
  ['short_term', 'short_term'],
  ['short-term', 'short_term'],
  ['short term', 'short_term'],
  ['shortterm', 'short_term'],
  ['long_term', 'long_term'],
  ['long-term', 'long_term'],
  ['long term', 'long_term'],
  ['longterm', 'long_term'],
]);

function createErrorResponse(error) {
  console.error('Goals API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Goal title is required' ||
      error.message === 'Goal deadline is required' ||
      error.message === 'Goal deadline must be a valid date' ||
      error.message === 'Description must be a string' ||
      error.message === 'Subject must be a string' ||
      error.message === 'Target must be a string' ||
      error.message === 'Notes must be a string' ||
      error.message === 'Progress must be a number between 0 and 100' ||
      error.message === 'Timeframe must be one of: short_term, long_term' ||
      error.message === 'Status must be one of: pending, in_progress, completed'
      || error.message === 'Tasks must be an array'
      || error.message === 'Each goal task must be an object'
      || error.message === 'Each goal task title is required'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function normalizeStatus(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  return allowedStatuses.has(normalizedValue) ? normalizedValue : null;
}

function normalizeTimeframe(value) {
  if (typeof value !== 'string') {
    return null;
  }

  return allowedTimeframes.get(value.trim().toLowerCase()) || null;
}

function normalizeNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }

  return Number.NaN;
}

function normalizeOptionalTextField(value, label) {
  if (value === undefined) {
    return undefined;
  }

  if (value !== null && typeof value !== 'string') {
    throw new Error(`${label} must be a string`);
  }

  return typeof value === 'string' ? value.trim() : '';
}

function normalizeGoalTasks(value) {
  if (!Array.isArray(value)) {
    throw new Error('Tasks must be an array');
  }

  return value.map((task) => {
    if (!task || typeof task !== 'object' || Array.isArray(task)) {
      throw new Error('Each goal task must be an object');
    }

    const title = typeof task.title === 'string' ? task.title.trim() : '';

    if (!title) {
      throw new Error('Each goal task title is required');
    }

    return {
      title,
      completed: Boolean(task.completed),
    };
  });
}

function buildCreatePayload(body, userId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';

  if (!title) {
    throw new Error('Goal title is required');
  }

  if (body.deadline === undefined || body.deadline === null || body.deadline === '') {
    throw new Error('Goal deadline is required');
  }

  const deadline = new Date(String(body.deadline));

  if (Number.isNaN(deadline.getTime())) {
    throw new Error('Goal deadline must be a valid date');
  }

  const description = normalizeOptionalTextField(body.description, 'Description') || '';
  const subject = normalizeOptionalTextField(body.subject, 'Subject') || '';
  const target =
    normalizeOptionalTextField(body.target, 'Target') || description;
  const notes = normalizeOptionalTextField(body.notes, 'Notes') || '';
  const tasks =
    body.tasks !== undefined ? normalizeGoalTasks(body.tasks) : [];
  const derivedProgress = tasks.length
    ? calculateGoalTaskProgress(tasks)
    : null;
  const timeframe =
    body.timeframe === undefined
      ? 'short_term'
      : normalizeTimeframe(body.timeframe);

  if (!timeframe) {
    throw new Error('Timeframe must be one of: short_term, long_term');
  }

  let progress = derivedProgress ?? 0;

  if (body.progress !== undefined) {
    progress = normalizeNumber(body.progress);

    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      throw new Error('Progress must be a number between 0 and 100');
    }
  }

  let status = getGoalStatusFromProgress(progress);

  if (body.status !== undefined) {
    const normalizedStatus = normalizeStatus(body.status);

    if (!normalizedStatus) {
      throw new Error('Status must be one of: pending, in_progress, completed');
    }

    status = normalizedStatus;
  }

  return {
    userId,
    title,
    description: description || target,
    subject,
    target,
    notes,
    timeframe,
    deadline,
    progress,
    status,
    tasks,
  };
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const goals = await Goal.find({ userId: currentUser.id })
      .sort({ deadline: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ goals: serializeGoals(goals) }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const body = await readJsonBody(request);
    const goalData = buildCreatePayload(body, currentUser.id);
    const goal = await Goal.create(goalData);

    return NextResponse.json(
      {
        message: 'Goal created successfully',
        goal: serializeGoal(goal),
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
