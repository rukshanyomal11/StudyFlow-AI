import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Doubt from '@/models/Doubt';
import Notification from '@/models/Notification';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedStatuses = new Set(['Pending', 'Reviewing', 'Answered']);

function createErrorResponse(error) {
  console.error('Doubt reply API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      error.message === 'Forbidden' ||
      error.message === 'Only mentors can reply to doubts'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message === 'Doubt not found') {
      return NextResponse.json({ error: 'Doubt not found' }, { status: 404 });
    }

    if (error.message === 'Doubt student not found') {
      return NextResponse.json({ error: 'Doubt student not found' }, { status: 404 });
    }

    if (
      error.message === 'Doubt ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Reply is required' ||
      error.message === 'Status must be one of: Pending, Reviewing, Answered'
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

function ensureMentor(user) {
  if (user.role !== 'mentor') {
    throw new Error('Only mentors can reply to doubts');
  }
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function normalizeStatus(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return allowedStatuses.has(normalizedValue) ? normalizedValue : null;
}

async function getDoubtId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('Doubt ID is invalid');
  }

  return id;
}

export async function POST(request, context) {
  try {
    const currentUser = await requireAuth();
    ensureMentor(currentUser);

    await connectDB();

    const doubtId = await getDoubtId(context);
    const body = await readJsonBody(request);

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Request body must be a JSON object');
    }

    const reply = typeof body.reply === 'string' ? body.reply.trim() : '';

    if (!reply) {
      throw new Error('Reply is required');
    }

    let status = 'Answered';

    if (body.status !== undefined) {
      const normalizedStatus = normalizeStatus(body.status);

      if (!normalizedStatus) {
        throw new Error('Status must be one of: Pending, Reviewing, Answered');
      }

      status = normalizedStatus;
    }

    const doubt = await Doubt.findOneAndUpdate(
      {
        _id: doubtId,
        mentorId: currentUser.id,
      },
      {
        $set: {
          reply,
          status,
          replyAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    )
      .populate({
        path: 'studentId',
        select: 'name email role avatar level',
      })
      .populate({
        path: 'mentorId',
        select: 'name email role',
      })
      .populate({
        path: 'subjectId',
        select: 'name',
      })
      .lean();

    if (!doubt) {
      throw new Error('Doubt not found');
    }

    const studentId = doubt?.studentId?._id?.toString() || '';
    const subjectName = doubt?.subjectId?.name || 'your subject';
    const doubtTitle = typeof doubt.title === 'string' ? doubt.title.trim() : 'Your doubt';

    if (!studentId) {
      throw new Error('Doubt student not found');
    }

    await Notification.create({
      userId: studentId,
      type: 'doubt_reply',
      title: `Mentor replied: ${doubtTitle}`,
      message: `Your mentor replied to your doubt in ${subjectName}: ${reply}`,
      senderId: currentUser.id,
      relatedDoubtId: doubt._id,
      isRead: false,
    });

    return NextResponse.json(
      {
        message: 'Doubt reply saved successfully',
        doubt,
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
