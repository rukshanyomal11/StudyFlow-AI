import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Flashcard from '@/models/Flashcard';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedDifficulties = new Set(['easy', 'medium', 'hard']);

function createErrorResponse(error) {
  console.error('Flashcard review API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Flashcard not found') {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Flashcard ID is required' ||
      error.message === 'Flashcard ID is invalid' ||
      error.message === 'Difficulty must be one of: easy, medium, hard'
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

function getNextReviewDate(difficulty) {
  const nextReviewDate = new Date();

  if (difficulty === 'easy') {
    nextReviewDate.setDate(nextReviewDate.getDate() + 7);
    return nextReviewDate;
  }

  if (difficulty === 'medium') {
    nextReviewDate.setDate(nextReviewDate.getDate() + 3);
    return nextReviewDate;
  }

  nextReviewDate.setDate(nextReviewDate.getDate() + 1);
  return nextReviewDate;
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const body = await readJsonBody(request);

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Request body must be a JSON object');
    }

    const flashcardId =
      typeof body.flashcardId === 'string' ? body.flashcardId.trim() : '';

    if (!flashcardId) {
      throw new Error('Flashcard ID is required');
    }

    if (!isValidObjectId(flashcardId)) {
      throw new Error('Flashcard ID is invalid');
    }

    const difficulty = normalizeDifficulty(body.difficulty);

    if (!difficulty) {
      throw new Error('Difficulty must be one of: easy, medium, hard');
    }

    const flashcard = await Flashcard.findOne({
      _id: flashcardId,
      userId: currentUser.id,
    });

    if (!flashcard) {
      throw new Error('Flashcard not found');
    }

    flashcard.difficulty = difficulty;
    flashcard.reviewCount += 1;
    flashcard.nextReviewDate = getNextReviewDate(difficulty);

    await flashcard.save();

    return NextResponse.json(
      {
        message: 'Flashcard review updated successfully',
        flashcard: flashcard.toObject(),
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
