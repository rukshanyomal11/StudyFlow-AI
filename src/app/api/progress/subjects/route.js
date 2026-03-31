import { NextResponse } from 'next/server';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Progress subjects API error:', error);

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

    const subjectDocuments = await Subject.find({ userId: currentUser.id })
      .select('name progress')
      .sort({ name: 1 })
      .lean();

    const subjects = subjectDocuments.map((subject) => ({
      subjectId: subject._id.toString(),
      name: subject.name,
      progress: subject.progress,
    }));

    return NextResponse.json({ subjects }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
