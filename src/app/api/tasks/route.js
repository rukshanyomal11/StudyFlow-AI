import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Task from '@/models/Task';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';
import { serializeTask, serializeTasks } from '@/lib/task-utils';
import { sendTaskCreatedEmail } from '@/lib/task-email';

export const runtime = 'nodejs';

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
  console.error('Tasks API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Subject not found') {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Subject name is required' ||
      error.message === 'Subject ID is invalid' ||
      error.message === 'Task title is required' ||
      error.message === 'Task date is required' ||
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ensureOwnedSubject(subjectId, userId) {
  if (!isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  const subject = await Subject.findOne({ _id: subjectId, userId }).lean();

  if (!subject) {
    throw new Error('Subject not found');
  }

  return subject;
}

async function resolveSubjectInput(body, userId) {
  const subjectId =
    typeof body.subjectId === 'string' ? body.subjectId.trim() : '';
  const subjectNameInput =
    typeof body.subjectName === 'string'
      ? body.subjectName.trim()
      : typeof body.subject === 'string'
        ? body.subject.trim()
        : '';

  if (subjectId) {
    const subject = await ensureOwnedSubject(subjectId, userId);

    return {
      subjectId,
      subjectName: subject.name,
    };
  }

  if (!subjectNameInput) {
    throw new Error('Subject name is required');
  }

  const existingSubject = await Subject.findOne({
    userId,
    name: { $regex: new RegExp(`^${escapeRegExp(subjectNameInput)}$`, 'i') },
  })
    .select('_id name')
    .lean();

  return {
    subjectId: existingSubject?._id || null,
    subjectName: existingSubject?.name || subjectNameInput,
  };
}

async function buildCreatePayload(body, userId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const { subjectId, subjectName } = await resolveSubjectInput(body, userId);
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';

  if (!title) {
    throw new Error('Task title is required');
  }

  if (!body.date) {
    throw new Error('Task date is required');
  }

  const date = new Date(String(body.date));

  if (Number.isNaN(date.getTime())) {
    throw new Error('Task date must be a valid date');
  }

  const taskData = {
    userId,
    subjectId,
    subjectName,
    title,
    topic,
    date,
  };

  if (body.duration !== undefined) {
    const duration = normalizeDuration(body.duration);

    if (!Number.isFinite(duration) || duration < 0) {
      throw new Error('Duration must be a non-negative number');
    }

    taskData.duration = duration;
  }

  if (body.priority !== undefined) {
    const priority = normalizePriority(body.priority);

    if (!priority) {
      throw new Error('Priority must be one of: low, medium, high');
    }

    taskData.priority = priority;
  }

  if (body.status !== undefined) {
    const status = normalizeStatus(body.status);

    if (!status) {
      throw new Error(
        'Status must be one of: pending, in_progress, completed, missed',
      );
    }

    taskData.status = status;
  }

  return taskData;
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const tasks = await Task.find({ userId: currentUser.id })
      .populate({ path: 'subjectId', select: 'name' })
      .sort({ date: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ tasks: serializeTasks(tasks) }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const body = await readJsonBody(request);
    const taskData = await buildCreatePayload(body, currentUser.id);
    const createdTask = await Task.create(taskData);
    let emailSent = false;

    try {
      const emailResult = await sendTaskCreatedEmail({
        to: currentUser.email,
        userName: currentUser.name,
        task: createdTask.toObject(),
      });

      emailSent = Boolean(emailResult.sent);

      if (emailSent) {
        await Task.findByIdAndUpdate(createdTask._id, {
          $set: {
            creationEmailSentAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Task creation email failed:', error);
    }

    const task = await Task.findById(createdTask._id)
      .populate({ path: 'subjectId', select: 'name' })
      .lean();

    return NextResponse.json(
      {
        message: 'Task created successfully',
        task: serializeTask(task),
        emailSent,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
