import { NextResponse } from 'next/server';
import Task from '@/models/Task';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Today tasks API error:', error);

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

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      userId: currentUser.id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .sort({ date: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
