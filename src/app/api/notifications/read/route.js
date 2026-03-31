import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Notification from '@/models/Notification';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Notification read API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Notification not found') {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Notification ID is required' ||
      error.message === 'Notification ID is invalid'
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

export async function POST(request) {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const body = await readJsonBody(request);

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Request body must be a JSON object');
    }

    const notificationId =
      typeof body.notificationId === 'string' ? body.notificationId.trim() : '';

    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    if (!isValidObjectId(notificationId)) {
      throw new Error('Notification ID is invalid');
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId: currentUser.id,
      },
      { $set: { isRead: true } },
      { new: true, runValidators: true },
    ).lean();

    if (!notification) {
      throw new Error('Notification not found');
    }

    return NextResponse.json(
      {
        message: 'Notification marked as read',
        notification,
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
