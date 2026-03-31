import { NextResponse } from 'next/server';
import StudySession from '@/models/StudySession';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Session history API error:', error);

  if (error instanceof Error && error.message === 'Unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const sessions = await StudySession.find({ userId: currentUser.id })
      .sort({ startTime: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
