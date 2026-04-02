import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Task from '@/models/Task';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';
import { serializeTask } from '@/lib/task-utils';

export async function POST(_request, context) {
  try {
    const currentUser = await requireAuth();
    const params = await context.params;
    const taskId = params?.id;

    if (!isValidObjectId(taskId)) {
      return NextResponse.json({ error: 'Task ID is invalid' }, { status: 400 });
    }

    await connectDB();

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        userId: currentUser.id,
      },
      {
        $set: {
          status: 'completed',
        },
      },
      { new: true, runValidators: true },
    )
      .populate({ path: 'subjectId', select: 'name' })
      .lean();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Task marked as completed',
        task: serializeTask(task),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Task complete API error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 },
    );
  }
}
