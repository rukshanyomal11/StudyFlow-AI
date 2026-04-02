import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import StudySession from '@/models/StudySession';
import Subject from '@/models/Subject';
import Task from '@/models/Task';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';
import { serializeStudySession } from '@/lib/session-utils';

export const runtime = 'nodejs';

function getErrorDetails(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Internal server error';
}

function createErrorResponse(error) {
  console.error('Start session API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Subject not found' || error.message === 'Task not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Subject ID is required' ||
      error.message === 'Subject ID is invalid' ||
      error.message === 'Goal is required' ||
      error.message === 'Task ID is invalid' ||
      error.message === 'Task does not belong to the selected subject' ||
      error.message === 'Start time must be a valid date' ||
      error.message === 'Notes must be a string'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid database identifier' },
        { status: 400 },
      );
    }
  }

  return NextResponse.json(
    {
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development'
        ? { details: getErrorDetails(error) }
        : {}),
    },
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

async function buildSessionPayload(body, userId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const subjectId =
    typeof body.subjectId === 'string' ? body.subjectId.trim() : '';
  const taskId = typeof body.taskId === 'string' ? body.taskId.trim() : '';

  if (!subjectId) {
    throw new Error('Subject ID is required');
  }

  if (!isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  const subject = await Subject.findOne({ _id: subjectId, userId }).lean();

  if (!subject) {
    throw new Error('Subject not found');
  }

  let resolvedTaskId = null;

  if (taskId) {
    if (!isValidObjectId(taskId)) {
      throw new Error('Task ID is invalid');
    }

    const task = await Task.findOne({ _id: taskId, userId }).lean();

    if (!task) {
      throw new Error('Task not found');
    }

    if (String(task.subjectId) !== subjectId) {
      throw new Error('Task does not belong to the selected subject');
    }

    resolvedTaskId = taskId;
  }

  let startTime = new Date();
  const goal = typeof body.goal === 'string' ? body.goal.trim() : '';

  if (!goal) {
    throw new Error('Goal is required');
  }

  if (body.startTime !== undefined && body.startTime !== null && body.startTime !== '') {
    startTime = new Date(String(body.startTime));

    if (Number.isNaN(startTime.getTime())) {
      throw new Error('Start time must be a valid date');
    }
  }

  if (
    body.notes !== undefined &&
    body.notes !== null &&
    typeof body.notes !== 'string'
  ) {
    throw new Error('Notes must be a string');
  }

  return {
    userId,
    subjectId,
    taskId: resolvedTaskId,
    goal,
    startTime,
    notes: typeof body.notes === 'string' ? body.notes.trim() : '',
  };
}

function getUserId(currentUser) {
  const userId =
    currentUser && typeof currentUser.id === 'string'
      ? currentUser.id.trim()
      : '';

  if (!userId || !isValidObjectId(userId)) {
    throw new Error('Unauthorized');
  }

  return userId;
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();
    const userId = getUserId(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const sessionData = await buildSessionPayload(body, userId);
    const session = await StudySession.create(sessionData);
    await session.populate({ path: 'subjectId', select: 'name' });

    return NextResponse.json(
      {
        message: 'Study session started successfully',
        session: serializeStudySession(session.toObject()),
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
