import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Flashcard from '@/models/Flashcard';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedDifficulties = new Set(['easy', 'medium', 'hard']);

function createErrorResponse(error) {
  console.error('Flashcard detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Subject not found' || error.message === 'Flashcard not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === 'Flashcard ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one flashcard field is required' ||
      error.message === 'Subject ID is invalid' ||
      error.message === 'Question is required' ||
      error.message === 'Answer is required' ||
      error.message === 'Difficulty must be one of: easy, medium, hard' ||
      error.message === 'Next review date must be a valid date' ||
      error.message === 'Review count must be a non-negative number'
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

function normalizeDifficulty(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  return allowedDifficulties.has(normalizedValue) ? normalizedValue : null;
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

async function ensureOwnedSubject(subjectId, userId) {
  if (!isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  const subject = await Subject.findOne({ _id: subjectId, userId }).lean();

  if (!subject) {
    throw new Error('Subject not found');
  }
}

async function getFlashcardId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('Flashcard ID is invalid');
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

  if ('question' in body) {
    const question =
      typeof body.question === 'string' ? body.question.trim() : '';

    if (!question) {
      throw new Error('Question is required');
    }

    updates.question = question;
  }

  if ('answer' in body) {
    const answer = typeof body.answer === 'string' ? body.answer.trim() : '';

    if (!answer) {
      throw new Error('Answer is required');
    }

    updates.answer = answer;
  }

  if ('difficulty' in body) {
    const difficulty = normalizeDifficulty(body.difficulty);

    if (!difficulty) {
      throw new Error('Difficulty must be one of: easy, medium, hard');
    }

    updates.difficulty = difficulty;
  }

  if ('nextReviewDate' in body) {
    const nextReviewDate = new Date(String(body.nextReviewDate));

    if (Number.isNaN(nextReviewDate.getTime())) {
      throw new Error('Next review date must be a valid date');
    }

    updates.nextReviewDate = nextReviewDate;
  }

  if ('reviewCount' in body) {
    const reviewCount = normalizeNumber(body.reviewCount);

    if (!Number.isFinite(reviewCount) || reviewCount < 0) {
      throw new Error('Review count must be a non-negative number');
    }

    updates.reviewCount = reviewCount;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one flashcard field is required');
  }

  return updates;
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    const flashcardId = await getFlashcardId(context);

    await connectDB();

    const flashcard = await Flashcard.findOne({
      _id: flashcardId,
      userId: currentUser.id,
    }).lean();

    if (!flashcard) {
      throw new Error('Flashcard not found');
    }

    return NextResponse.json({ flashcard }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const currentUser = await requireAuth();
    const flashcardId = await getFlashcardId(context);

    await connectDB();

    const body = await readJsonBody(request);
    const updates = await buildUpdatePayload(body, currentUser.id);
    const flashcard = await Flashcard.findOneAndUpdate(
      {
        _id: flashcardId,
        userId: currentUser.id,
      },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!flashcard) {
      throw new Error('Flashcard not found');
    }

    return NextResponse.json(
      {
        message: 'Flashcard updated successfully',
        flashcard,
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
    const flashcardId = await getFlashcardId(context);

    await connectDB();

    const flashcard = await Flashcard.findOneAndDelete({
      _id: flashcardId,
      userId: currentUser.id,
    }).lean();

    if (!flashcard) {
      throw new Error('Flashcard not found');
    }

    return NextResponse.json(
      { message: 'Flashcard deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
