import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import StudySession from '@/models/StudySession';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('End session API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Study session not found') {
      return NextResponse.json({ error: 'Study session not found' }, { status: 404 });
    }

    if (error.message === 'Study session has already ended') {
      return NextResponse.json(
        { error: 'Study session has already ended' },
        { status: 409 },
      );
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Session ID is required' ||
      error.message === 'Session ID is invalid' ||
      error.message === 'End time must be a valid date' ||
      error.message === 'End time must be later than or equal to start time' ||
      error.message === 'Focus score must be a number between 0 and 100' ||
      error.message === 'Distractions must be a non-negative number' ||
      error.message === 'Notes must be a string'
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

function normalizeNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }

  return Number.NaN;
}

function calculateDurationInMinutes(startTime, endTime) {
  return Math.max(
    0,
    Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)),
  );
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const body = await readJsonBody(request);

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Request body must be a JSON object');
    }

    const sessionId =
      typeof body.sessionId === 'string' ? body.sessionId.trim() : '';

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    if (!isValidObjectId(sessionId)) {
      throw new Error('Session ID is invalid');
    }

    const session = await StudySession.findOne({
      _id: sessionId,
      userId: currentUser.id,
    });

    if (!session) {
      throw new Error('Study session not found');
    }

    if (session.endTime) {
      throw new Error('Study session has already ended');
    }

    let endTime = new Date();

    if (body.endTime !== undefined && body.endTime !== null && body.endTime !== '') {
      endTime = new Date(String(body.endTime));

      if (Number.isNaN(endTime.getTime())) {
        throw new Error('End time must be a valid date');
      }
    }

    if (endTime.getTime() < session.startTime.getTime()) {
      throw new Error('End time must be later than or equal to start time');
    }

    if (body.focusScore !== undefined) {
      const focusScore = normalizeNumber(body.focusScore);

      if (!Number.isFinite(focusScore) || focusScore < 0 || focusScore > 100) {
        throw new Error('Focus score must be a number between 0 and 100');
      }

      session.focusScore = focusScore;
    }

    if (body.distractions !== undefined) {
      const distractions = normalizeNumber(body.distractions);

      if (!Number.isFinite(distractions) || distractions < 0) {
        throw new Error('Distractions must be a non-negative number');
      }

      session.distractions = distractions;
    }

    if (body.notes !== undefined) {
      if (body.notes !== null && typeof body.notes !== 'string') {
        throw new Error('Notes must be a string');
      }

      session.notes = typeof body.notes === 'string' ? body.notes.trim() : '';
    }

    session.endTime = endTime;
    session.duration = calculateDurationInMinutes(session.startTime, endTime);

    await session.save();

    return NextResponse.json(
      {
        message: 'Study session ended successfully',
        session: session.toObject(),
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
