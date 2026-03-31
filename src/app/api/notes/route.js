import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Note from '@/models/Note';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Notes API error:', error);

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
      error.message === 'Subject ID is required' ||
      error.message === 'Subject ID is invalid' ||
      error.message === 'Note title is required' ||
      error.message === 'Note content is required' ||
      error.message === 'Tags must be an array of strings or a comma-separated string'
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

function normalizeTags(value) {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((tag) => typeof tag === 'string')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  throw new Error('Tags must be an array of strings or a comma-separated string');
}

async function ensureOwnedSubject(subjectId, userId) {
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
}

async function buildCreatePayload(body, userId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const subjectId =
    typeof body.subjectId === 'string' ? body.subjectId.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content =
    typeof body.content === 'string' ? body.content.trim() : '';

  if (!title) {
    throw new Error('Note title is required');
  }

  if (!content) {
    throw new Error('Note content is required');
  }

  await ensureOwnedSubject(subjectId, userId);

  return {
    userId,
    subjectId,
    title,
    content,
    tags: normalizeTags(body.tags),
  };
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const notes = await Note.find({ userId: currentUser.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const body = await readJsonBody(request);
    const noteData = await buildCreatePayload(body, currentUser.id);
    const note = await Note.create(noteData);

    return NextResponse.json(
      {
        message: 'Note created successfully',
        note: note.toObject(),
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
