import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import StudySession from '@/models/StudySession';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';
import { serializeStudySessions } from '@/lib/session-utils';

export const runtime = 'nodejs';

function getErrorDetails(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Internal server error';
}

function createErrorResponse(error) {
  console.error('Session history API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid database identifier' },
        { status: 400 },
      );
    }
  }

  return NextResponse.json(
    {
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development'
        ? { details: getErrorDetails(error) }
        : {}),
    },
    { status: 500 },
  );
}

function getUserId(currentUser) {
  const userId =
    currentUser && typeof currentUser.id === 'string'
      ? currentUser.id.trim()
      : '';

  if (!userId || !isValidObjectId(userId)) {
    throw new Error('Unauthorized');
  }

  return userId;
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    const userId = getUserId(currentUser);

    await connectDB();

    const sessions = await StudySession.find({ userId })
      .populate({ path: 'subjectId', select: 'name' })
      .sort({ startTime: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      { sessions: serializeStudySessions(sessions) },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
