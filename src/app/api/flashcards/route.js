import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Flashcard from '@/models/Flashcard';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedDifficulties = new Set(['easy', 'medium', 'hard']);

function createErrorResponse(error) {
  console.error('Flashcards API error:', error);

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
  const question =
    typeof body.question === 'string' ? body.question.trim() : '';
  const answer = typeof body.answer === 'string' ? body.answer.trim() : '';

  if (!question) {
    throw new Error('Question is required');
  }

  if (!answer) {
    throw new Error('Answer is required');
  }

  await ensureOwnedSubject(subjectId, userId);

  const flashcardData = {
    userId,
    subjectId,
    question,
    answer,
  };

  if (body.difficulty !== undefined) {
    const difficulty = normalizeDifficulty(body.difficulty);

    if (!difficulty) {
      throw new Error('Difficulty must be one of: easy, medium, hard');
    }

    flashcardData.difficulty = difficulty;
  }

  if (body.nextReviewDate !== undefined && body.nextReviewDate !== null && body.nextReviewDate !== '') {
    const nextReviewDate = new Date(String(body.nextReviewDate));

    if (Number.isNaN(nextReviewDate.getTime())) {
      throw new Error('Next review date must be a valid date');
    }

    flashcardData.nextReviewDate = nextReviewDate;
  }

  if (body.reviewCount !== undefined) {
    const reviewCount = normalizeNumber(body.reviewCount);

    if (!Number.isFinite(reviewCount) || reviewCount < 0) {
      throw new Error('Review count must be a non-negative number');
    }

    flashcardData.reviewCount = reviewCount;
  }

  return flashcardData;
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const flashcards = await Flashcard.find({ userId: currentUser.id })
      .sort({ nextReviewDate: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ flashcards }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const body = await readJsonBody(request);
    const flashcardData = await buildCreatePayload(body, currentUser.id);
    const flashcard = await Flashcard.create(flashcardData);

    return NextResponse.json(
      {
        message: 'Flashcard created successfully',
        flashcard: flashcard.toObject(),
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
