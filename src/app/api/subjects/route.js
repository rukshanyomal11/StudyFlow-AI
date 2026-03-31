import { NextResponse } from 'next/server';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedPriorities = new Set(['low', 'medium', 'high']);

function createErrorResponse(error) {
  console.error('Subjects API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Subject name is required' ||
      error.message === 'Priority must be one of: low, medium, high' ||
      error.message === 'Exam date is required' ||
      error.message === 'Exam date must be a valid date' ||
      error.message === 'Progress must be a number between 0 and 100'
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

function normalizeProgress(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }

  return Number.NaN;
}

function buildCreatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!name) {
    throw new Error('Subject name is required');
  }

  if (body.examDate === undefined || body.examDate === null || body.examDate === '') {
    throw new Error('Exam date is required');
  }

  const examDate = new Date(String(body.examDate));

  if (Number.isNaN(examDate.getTime())) {
    throw new Error('Exam date must be a valid date');
  }

  const subjectData = {
    name,
    examDate,
  };

  if (body.priority !== undefined) {
    const priority = normalizePriority(body.priority);

    if (!priority) {
      throw new Error('Priority must be one of: low, medium, high');
    }

    subjectData.priority = priority;
  }

  if (body.progress !== undefined) {
    const progress = normalizeProgress(body.progress);

    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      throw new Error('Progress must be a number between 0 and 100');
    }

    subjectData.progress = progress;
  }

  return subjectData;
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const subjects = await Subject.find({ userId: currentUser.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ subjects }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();
    const body = await readJsonBody(request);
    const subjectData = buildCreatePayload(body);

    await connectDB();

    const subject = await Subject.create({
      ...subjectData,
      userId: currentUser.id,
    });

    return NextResponse.json(
      {
        message: 'Subject created successfully',
        subject: subject.toObject(),
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
