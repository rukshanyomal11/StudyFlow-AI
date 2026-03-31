import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import StudySession from '@/models/StudySession';
import Subject from '@/models/Subject';
import Task from '@/models/Task';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Progress overview API error:', error);

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

    const userObjectId = new mongoose.Types.ObjectId(currentUser.id);

    const [studyDurationResult, completedTasksCount, pendingTasksCount, activeSubjectsCount] =
      await Promise.all([
        StudySession.aggregate([
          { $match: { userId: userObjectId } },
          {
            $group: {
              _id: null,
              totalStudyMinutes: { $sum: '$duration' },
            },
          },
        ]),
        Task.countDocuments({ userId: currentUser.id, status: 'completed' }),
        Task.countDocuments({ userId: currentUser.id, status: 'pending' }),
        Subject.countDocuments({ userId: currentUser.id }),
      ]);

    const totalStudyMinutes = studyDurationResult[0]?.totalStudyMinutes ?? 0;
    const totalStudyHours = Number((totalStudyMinutes / 60).toFixed(2));

    return NextResponse.json(
      {
        overview: {
          totalStudyHours,
          completedTasksCount,
          pendingTasksCount,
          activeSubjectsCount,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
