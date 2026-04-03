import { NextResponse } from 'next/server';
import Notification from '@/models/Notification';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function ensureNotificationReader(user) {
  if (user.role !== 'student' && user.role !== 'mentor' && user.role !== 'admin') {
    throw new Error('Forbidden');
  }
}

function createErrorResponse(error) {
  console.error('Notifications API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Notification type is required' ||
      error.message === 'Notification title is required' ||
      error.message === 'Notification message is required' ||
      error.message === 'isRead must be a boolean'
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

function buildCreatePayload(body, userId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!type) {
    throw new Error('Notification type is required');
  }

  if (!title) {
    throw new Error('Notification title is required');
  }

  if (!message) {
    throw new Error('Notification message is required');
  }

  const notificationData = {
    userId,
    type,
    title,
    message,
  };

  if (body.isRead !== undefined) {
    if (typeof body.isRead !== 'boolean') {
      throw new Error('isRead must be a boolean');
    }

    notificationData.isRead = body.isRead;
  }

  return notificationData;
}

export async function GET(request) {
  try {
    const currentUser = await requireAuth();
    ensureNotificationReader(currentUser);

    await connectDB();

    const typeFilter = request.nextUrl.searchParams.get('type')?.trim() || '';
    const filter = { userId: currentUser.id };

    if (typeFilter) {
      filter.type = typeFilter;
    }

    const notifications = await Notification.find(filter)
      .populate({
        path: 'senderId',
        select: 'name email role avatar',
      })
      .populate({
        path: 'relatedDoubtId',
        select: 'title message reply status subjectId replyAt updatedAt',
        populate: {
          path: 'subjectId',
          select: 'name',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const body = await readJsonBody(request);
    const notificationData = buildCreatePayload(body, currentUser.id);
    const notification = await Notification.create(notificationData);

    return NextResponse.json(
      {
        message: 'Notification created successfully',
        notification: notification.toObject(),
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
