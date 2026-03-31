import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Goal from '@/models/Goal';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedStatuses = new Set(['pending', 'in_progress', 'completed']);

function createErrorResponse(error) {
  console.error('Goal detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Goal not found') {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (
      error.message === 'Goal ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one goal field is required' ||
      error.message === 'Goal title is required' ||
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

async function getGoalId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('Goal ID is invalid');
  }

  return id;
}

function buildUpdatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const updates = {};
  let normalizedProgress;
  let hasProgressUpdate = false;

  if ('title' in body) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';

    if (!title) {
      throw new Error('Goal title is required');
    }

    updates.title = title;
  }

  if ('description' in body) {
    if (
      body.description !== null &&
      body.description !== undefined &&
      typeof body.description !== 'string'
    ) {
      throw new Error('Description must be a string');
    }

    updates.description =
      typeof body.description === 'string' ? body.description.trim() : '';
  }

  if ('deadline' in body) {
    const deadline = new Date(String(body.deadline));

    if (Number.isNaN(deadline.getTime())) {
      throw new Error('Goal deadline must be a valid date');
    }

    updates.deadline = deadline;
  }

  if ('progress' in body) {
    normalizedProgress = normalizeNumber(body.progress);

    if (
      !Number.isFinite(normalizedProgress) ||
      normalizedProgress < 0 ||
      normalizedProgress > 100
    ) {
      throw new Error('Progress must be a number between 0 and 100');
    }

    updates.progress = normalizedProgress;
    hasProgressUpdate = true;
  }

  if ('status' in body) {
    const status = normalizeStatus(body.status);

    if (!status) {
      throw new Error('Status must be one of: pending, in_progress, completed');
    }

    updates.status = status;
  } else if (hasProgressUpdate) {
    updates.status = getStatusFromProgress(normalizedProgress);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one goal field is required');
  }

  return updates;
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    const goalId = await getGoalId(context);

    await connectDB();

    const goal = await Goal.findOne({
      _id: goalId,
      userId: currentUser.id,
    }).lean();

    if (!goal) {
      throw new Error('Goal not found');
    }

    return NextResponse.json({ goal }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const currentUser = await requireAuth();
    const goalId = await getGoalId(context);

    await connectDB();

    const body = await readJsonBody(request);
    const updates = buildUpdatePayload(body);
    const goal = await Goal.findOneAndUpdate(
      {
        _id: goalId,
        userId: currentUser.id,
      },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!goal) {
      throw new Error('Goal not found');
    }

    return NextResponse.json(
      {
        message: 'Goal updated successfully',
        goal,
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(_request, context) {
  try {
    const currentUser = await requireAuth();
    const goalId = await getGoalId(context);

    await connectDB();

    const goal = await Goal.findOneAndDelete({
      _id: goalId,
      userId: currentUser.id,
    }).lean();

    if (!goal) {
      throw new Error('Goal not found');
    }

    return NextResponse.json(
      { message: 'Goal deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
