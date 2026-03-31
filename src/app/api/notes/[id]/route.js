import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Note from '@/models/Note';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Note detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Subject not found' || error.message === 'Note not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === 'Note ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one note field is required' ||
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
  if (!isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  const subject = await Subject.findOne({ _id: subjectId, userId }).lean();

  if (!subject) {
    throw new Error('Subject not found');
  }
}

async function getNoteId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('Note ID is invalid');
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
      throw new Error('Note title is required');
    }

    updates.title = title;
  }

  if ('content' in body) {
    const content =
      typeof body.content === 'string' ? body.content.trim() : '';

    if (!content) {
      throw new Error('Note content is required');
    }

    updates.content = content;
  }

  if ('tags' in body) {
    updates.tags = normalizeTags(body.tags);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one note field is required');
  }

  return updates;
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    const noteId = await getNoteId(context);

    await connectDB();

    const note = await Note.findOne({
      _id: noteId,
      userId: currentUser.id,
    }).lean();

    if (!note) {
      throw new Error('Note not found');
    }

    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const currentUser = await requireAuth();
    const noteId = await getNoteId(context);

    await connectDB();

    const body = await readJsonBody(request);
    const updates = await buildUpdatePayload(body, currentUser.id);
    const note = await Note.findOneAndUpdate(
      {
        _id: noteId,
        userId: currentUser.id,
      },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!note) {
      throw new Error('Note not found');
    }

    return NextResponse.json(
      {
        message: 'Note updated successfully',
        note,
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
    const noteId = await getNoteId(context);

    await connectDB();

    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: currentUser.id,
    }).lean();

    if (!note) {
      throw new Error('Note not found');
    }

    return NextResponse.json(
      { message: 'Note deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
