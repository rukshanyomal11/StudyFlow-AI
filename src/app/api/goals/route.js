import { NextResponse } from 'next/server';
import Goal from '@/models/Goal';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedStatuses = new Set(['pending', 'in_progress', 'completed']);

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
      error.message === 'Progress must be a number between 0 and 100' ||
      error.message === 'Status must be one of: pending, in_progress, completed'
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

function normalizeNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }

  return Number.NaN;
}

function getStatusFromProgress(progress) {
  if (progress >= 100) {
    return 'completed';
  }

  if (progress > 0) {
    return 'in_progress';
  }

  return 'pending';
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

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== 'string'
  ) {
    throw new Error('Description must be a string');
  }

  let progress = 0;

  if (body.progress !== undefined) {
    progress = normalizeNumber(body.progress);

    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      throw new Error('Progress must be a number between 0 and 100');
    }
  }

  let status = getStatusFromProgress(progress);

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
    description:
      typeof body.description === 'string' ? body.description.trim() : '',
    deadline,
    progress,
    status,
  };
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const goals = await Goal.find({ userId: currentUser.id })
      .sort({ deadline: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ goals }, { status: 200 });
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
        goal: goal.toObject(),
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
