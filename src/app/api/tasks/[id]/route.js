import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Task from '@/models/Task';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedPriorities = new Set(['low', 'medium', 'high']);
const statusAliases = new Map([
  ['todo', 'pending'],
  ['to do', 'pending'],
  ['to_do', 'pending'],
  ['pending', 'pending'],
  ['assigned', 'pending'],
  ['inprogress', 'in_progress'],
  ['in progress', 'in_progress'],
  ['in_progress', 'in_progress'],
  ['done', 'completed'],
  ['completed', 'completed'],
  ['complete', 'completed'],
  ['missed', 'missed'],
]);

function createErrorResponse(error) {
  console.error('Task detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Subject not found') {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (
      error.message === 'Task ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one task field is required' ||
      error.message === 'Subject ID is invalid' ||
      error.message === 'Task title is required' ||
      error.message === 'Task date must be a valid date' ||
      error.message === 'Duration must be a non-negative number' ||
      error.message === 'Priority must be one of: low, medium, high' ||
      error.message ===
        'Status must be one of: pending, in_progress, completed, missed'
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

function normalizePriority(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  return allowedPriorities.has(normalizedValue) ? normalizedValue : null;
}

function normalizeStatus(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  return statusAliases.get(normalizedValue) || null;
}

function normalizeDuration(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }

  return Number.NaN;
}

async function ensureOwnedSubject(subjectId, userId) {
  if (!isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  const subject = await Subject.findOne({ _id: subjectId, userId }).lean();

  if (!subject) {
    throw new Error('Subject not found');
  }
}

async function getTaskId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('Task ID is invalid');
  }

  return id;
}

async function buildUpdatePayload(body, userId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const updates = {};

  if ('subjectId' in body) {
    const subjectId =
      typeof body.subjectId === 'string' ? body.subjectId.trim() : '';

    await ensureOwnedSubject(subjectId, userId);
    updates.subjectId = subjectId;
  }

  if ('title' in body) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';

    if (!title) {
      throw new Error('Task title is required');
    }

    updates.title = title;
  }

  if ('topic' in body) {
    updates.topic = typeof body.topic === 'string' ? body.topic.trim() : '';
  }

  if ('date' in body) {
    const date = new Date(String(body.date));

    if (Number.isNaN(date.getTime())) {
      throw new Error('Task date must be a valid date');
    }

    updates.date = date;
  }

  if ('duration' in body) {
    const duration = normalizeDuration(body.duration);

    if (!Number.isFinite(duration) || duration < 0) {
      throw new Error('Duration must be a non-negative number');
    }

    updates.duration = duration;
  }

  if ('priority' in body) {
    const priority = normalizePriority(body.priority);

    if (!priority) {
      throw new Error('Priority must be one of: low, medium, high');
    }

    updates.priority = priority;
  }

  if ('status' in body) {
    const status = normalizeStatus(body.status);

    if (!status) {
      throw new Error(
        'Status must be one of: pending, in_progress, completed, missed',
      );
    }

    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one task field is required');
  }

  return updates;
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    const taskId = await getTaskId(context);

    await connectDB();

    const task = await Task.findOne({
      _id: taskId,
      userId: currentUser.id,
    }).lean();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const taskId = await getTaskId(context);
    const body = await readJsonBody(request);
    const updates = await buildUpdatePayload(body, currentUser.id);
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        userId: currentUser.id,
      },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Task updated successfully',
        task,
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
    const taskId = await getTaskId(context);

    await connectDB();

    const task = await Task.findOneAndDelete({
      _id: taskId,
      userId: currentUser.id,
    }).lean();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
