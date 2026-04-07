import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { requireAuth } from '@/lib/getSession';

const allowedRoles = new Set(['student', 'mentor', 'admin']);
const allowedPlans = new Set(['free', 'pro', 'mentor']);

function createErrorResponse(error) {
  console.error('Admin user detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (
      error.message === 'User ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one user field is required' ||
      error.message === 'Name is required' ||
      error.message === 'Email is required' ||
      error.message === 'Email must be valid' ||
      error.message === 'Role must be one of: student, mentor, admin' ||
      error.message === 'Plan must be one of: free, pro, mentor' ||
      error.message === 'isActive must be a boolean' ||
      error.message === 'isEmailVerified must be a boolean' ||
      error.message === 'Subjects must be an array of strings or a comma-separated string' ||
      error.message === 'You cannot change your own admin role' ||
      error.message === 'You cannot deactivate your own account' ||
      error.message === 'Email is already in use'
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

function ensureAdmin(user) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function normalizeRole(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  return allowedRoles.has(normalizedValue) ? normalizedValue : null;
}

function normalizePlan(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  return allowedPlans.has(normalizedValue) ? normalizedValue : null;
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  return null;
}

function normalizeSubjects(value) {
  if (Array.isArray(value)) {
    if (!value.every((item) => typeof item === 'string')) {
      throw new Error(
        'Subjects must be an array of strings or a comma-separated string',
      );
    }

    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  throw new Error('Subjects must be an array of strings or a comma-separated string');
}

async function getUserId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('User ID is invalid');
  }

  return id;
}

function buildUpdatePayload(body, currentUser, targetUserId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const updates = {};

  if ('name' in body) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      throw new Error('Name is required');
    }

    updates.name = name;
  }

  if ('email' in body) {
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) {
      throw new Error('Email is required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email must be valid');
    }

    updates.email = email;
  }

  if ('role' in body) {
    const role = normalizeRole(body.role);

    if (!role) {
      throw new Error('Role must be one of: student, mentor, admin');
    }

    if (String(currentUser.id) === String(targetUserId) && role !== 'admin') {
      throw new Error('You cannot change your own admin role');
    }

    updates.role = role;
  }

  if ('isActive' in body) {
    const isActive = normalizeBoolean(body.isActive);

    if (isActive === null) {
      throw new Error('isActive must be a boolean');
    }

    if (String(currentUser.id) === String(targetUserId) && isActive === false) {
      throw new Error('You cannot deactivate your own account');
    }

    updates.isActive = isActive;
  }

  if ('isEmailVerified' in body) {
    const isEmailVerified = normalizeBoolean(body.isEmailVerified);

    if (isEmailVerified === null) {
      throw new Error('isEmailVerified must be a boolean');
    }

    updates.isEmailVerified = isEmailVerified;
  }

  if ('plan' in body) {
    const plan = normalizePlan(body.plan);

    if (!plan) {
      throw new Error('Plan must be one of: free, pro, mentor');
    }

    updates.plan = plan;
  }

  if ('subjects' in body || 'subjectExpertise' in body) {
    updates.subjectExpertise = normalizeSubjects(
      body.subjects ?? body.subjectExpertise,
    );
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one user field is required');
  }

  return updates;
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const userId = await getUserId(context);
    const user = await User.findById(userId).lean();

    if (!user) {
      throw new Error('User not found');
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const userId = await getUserId(context);
    const body = await readJsonBody(request);
    const updates = buildUpdatePayload(body, currentUser, userId);

    if (updates.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: userId },
      })
        .select('_id')
        .lean();

      if (existingUser) {
        throw new Error('Email is already in use');
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!user) {
      throw new Error('User not found');
    }

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(_request, context) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const userId = await getUserId(context);

    if (String(currentUser.id) === String(userId)) {
      throw new Error('You cannot deactivate your own account');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: false } },
      { new: true, runValidators: true },
    ).lean();

    if (!user) {
      throw new Error('User not found');
    }

    return NextResponse.json(
      {
        message: 'User deactivated successfully',
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
