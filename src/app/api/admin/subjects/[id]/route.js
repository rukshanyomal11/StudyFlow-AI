import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Subject from '@/models/Subject';
import { requireAuth } from '@/lib/getSession';

const allowedPriorities = new Set(['low', 'medium', 'high']);
const allowedStatuses = new Set(['Active', 'Archived', 'Draft']);
const allowedDifficulties = new Set(['Beginner', 'Intermediate', 'Advanced']);

function createErrorResponse(error) {
  console.error('Admin subject detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'Subject not found') {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (
      error.message === 'Subject ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one subject field is required' ||
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
  if (!Array.isArray(value)) {
    throw new Error('Mentors must be an array of names');
  }

  return value
    .filter((mentor) => typeof mentor === 'string')
    .map((mentor) => mentor.trim())
    .filter(Boolean);
}

async function getSubjectId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('Subject ID is invalid');
  }

  return id;
}

function buildUpdatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const updates = {};

  if ('name' in body) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      throw new Error('Subject name is required');
    }

    updates.name = name;
  }

  if ('description' in body) {
    updates.description =
      typeof body.description === 'string' ? body.description.trim() : '';
  }

  if ('priority' in body) {
    const priority = normalizePriority(body.priority);

    if (!priority) {
      throw new Error('Priority must be one of: low, medium, high');
    }

    updates.priority = priority;
  }

  if ('examDate' in body) {
    const examDate = new Date(String(body.examDate));

    if (Number.isNaN(examDate.getTime())) {
      throw new Error('Exam date must be a valid date');
    }

    updates.examDate = examDate;
  }

  if ('progress' in body) {
    const progress = normalizeProgress(body.progress);

    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      throw new Error('Progress must be a number between 0 and 100');
    }

    updates.progress = progress;
  }

  if ('categoryId' in body) {
    updates.categoryId =
      typeof body.categoryId === 'string' && body.categoryId.trim()
        ? body.categoryId.trim()
        : 'general';
  }

  if ('status' in body) {
    const status = typeof body.status === 'string' ? body.status.trim() : '';

    if (!allowedStatuses.has(status)) {
      throw new Error('Status must be one of: Active, Archived, Draft');
    }

    updates.status = status;
  }

  if ('difficulty' in body) {
    const difficulty =
      typeof body.difficulty === 'string' ? body.difficulty.trim() : '';

    if (!allowedDifficulties.has(difficulty)) {
      throw new Error(
        'Difficulty must be one of: Beginner, Intermediate, Advanced',
      );
    }

    updates.difficulty = difficulty;
  }

  if ('mentors' in body) {
    updates.mentors = normalizeMentors(body.mentors);
  }

  if ('enrolledStudents' in body) {
    updates.enrolledStudents = normalizeCount(
      body.enrolledStudents,
      'Enrolled students',
    );
  }

  if ('quizzes' in body) {
    updates.quizzes = normalizeCount(body.quizzes, 'Quizzes');
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one subject field is required');
  }

  return updates;
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const subjectId = await getSubjectId(context);
    const subject = await Subject.findById(subjectId).lean();

    if (!subject) {
      throw new Error('Subject not found');
    }

    return NextResponse.json({ subject }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const subjectId = await getSubjectId(context);
    const body = await readJsonBody(request);
    const updates = buildUpdatePayload(body);
    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!subject) {
      throw new Error('Subject not found');
    }

    return NextResponse.json(
      {
        message: 'Subject updated successfully',
        subject,
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
    ensureAdmin(currentUser);

    await connectDB();

    const subjectId = await getSubjectId(context);
    const subject = await Subject.findByIdAndDelete(subjectId).lean();

    if (!subject) {
      throw new Error('Subject not found');
    }

    return NextResponse.json(
      { message: 'Subject deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
