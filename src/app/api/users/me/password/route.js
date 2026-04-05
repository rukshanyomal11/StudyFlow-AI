import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Update password API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      error.message === 'Current password is required' ||
      error.message === 'New password is required' ||
      error.message === 'Confirm password is required' ||
      error.message === 'New password and confirmation do not match' ||
      error.message === 'New password must be at least 6 characters long' ||
      error.message === 'Current password is incorrect'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === 'User not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
  }

  return NextResponse.json(
    { error: 'Failed to update password' },
    { status: 500 },
  );
}

export async function PUT(request) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();

    const currentPassword =
      typeof body?.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword =
      typeof body?.newPassword === 'string' ? body.newPassword : '';
    const confirmPassword =
      typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';

    if (!currentPassword) {
      throw new Error('Current password is required');
    }

    if (!newPassword) {
      throw new Error('New password is required');
    }

    if (!confirmPassword) {
      throw new Error('Confirm password is required');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirmation do not match');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    await connectDB();

    const user = await User.findById(currentUser.id).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
