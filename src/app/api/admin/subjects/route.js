import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Subject from '@/models/Subject';
import { requireAuth } from '@/lib/getSession';

const allowedPriorities = new Set(['low', 'medium', 'high']);
const allowedStatuses = new Set(['Active', 'Archived', 'Draft']);
const allowedDifficulties = new Set(['Beginner', 'Intermediate', 'Advanced']);

function createErrorResponse(error) {
  console.error('Admin subjects API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Subject name is required' ||
      error.message === 'Priority must be one of: low, medium, high' ||
      error.message === 'Exam date must be a valid date' ||
      error.message === 'Progress must be a number between 0 and 100' ||
      error.message === 'Status must be one of: Active, Archived, Draft' ||
      error.message ===
        'Difficulty must be one of: Beginner, Intermediate, Advanced' ||
      error.message === 'Mentors must be an array of names' ||
      error.message === 'Enrolled students must be a non-negative number' ||
      error.message === 'Quizzes must be a non-negative number'
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

function ensureAdmin(user) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
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

function normalizeCount(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }

  return Math.round(parsed);
}

function normalizeMentors(value) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error('Mentors must be an array of names');
  }

  return value
    .filter((mentor) => typeof mentor === 'string')
    .map((mentor) => mentor.trim())
    .filter(Boolean);
}

function buildCreatePayload(body, userId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!name) {
    throw new Error('Subject name is required');
  }

  const examDateInput =
    body.examDate === undefined || body.examDate === null || body.examDate === ''
      ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      : new Date(String(body.examDate));

  if (Number.isNaN(examDateInput.getTime())) {
    throw new Error('Exam date must be a valid date');
  }

  const subjectData = {
    userId,
    name,
    examDate: examDateInput,
  };

  if (body.description !== undefined) {
    subjectData.description =
      typeof body.description === 'string' ? body.description.trim() : '';
  }

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

  if (body.categoryId !== undefined) {
    subjectData.categoryId =
      typeof body.categoryId === 'string' && body.categoryId.trim()
        ? body.categoryId.trim()
        : 'general';
  }

  if (body.status !== undefined) {
    const status = typeof body.status === 'string' ? body.status.trim() : '';

    if (!allowedStatuses.has(status)) {
      throw new Error('Status must be one of: Active, Archived, Draft');
    }

    subjectData.status = status;
  }

  if (body.difficulty !== undefined) {
    const difficulty =
      typeof body.difficulty === 'string' ? body.difficulty.trim() : '';

    if (!allowedDifficulties.has(difficulty)) {
      throw new Error(
        'Difficulty must be one of: Beginner, Intermediate, Advanced',
      );
    }

    subjectData.difficulty = difficulty;
  }

  const mentors = normalizeMentors(body.mentors);
  if (mentors !== undefined) {
    subjectData.mentors = mentors;
  }

  const enrolledStudents = normalizeCount(body.enrolledStudents, 'Enrolled students');
  if (enrolledStudents !== undefined) {
    subjectData.enrolledStudents = enrolledStudents;
  }

  const quizzes = normalizeCount(body.quizzes, 'Quizzes');
  if (quizzes !== undefined) {
    subjectData.quizzes = quizzes;
  }

  return subjectData;
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const subjects = await Subject.find({})
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
    ensureAdmin(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const subjectData = buildCreatePayload(body, currentUser.id);
    const subject = await Subject.create(subjectData);

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
