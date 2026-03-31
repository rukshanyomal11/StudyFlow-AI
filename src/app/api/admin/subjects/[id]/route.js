import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Subject from '@/models/Subject';
import { requireAuth } from '@/lib/getSession';

const allowedPriorities = new Set(['low', 'medium', 'high']);

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
