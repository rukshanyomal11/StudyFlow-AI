import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { requireAuth } from '@/lib/getSession';

const allowedRoles = new Set(['student', 'mentor', 'admin']);
const allowedPlans = new Set(['free', 'pro', 'mentor']);

function createErrorResponse(error) {
  console.error('Admin users API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === 'Email is already in use') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Name is required' ||
      error.message === 'Email is required' ||
      error.message === 'Email must be valid' ||
      error.message === 'Role must be one of: student, mentor, admin' ||
      error.message === 'Plan must be one of: free, pro, mentor' ||
      error.message === 'isActive must be a boolean' ||
      error.message === 'isEmailVerified must be a boolean' ||
      error.message === 'Subjects must be an array of strings or a comma-separated string'
    ) {
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

function normalizeBoolean(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

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

  throw new Error(`${fieldName} must be a boolean`);
}

function normalizeSubjects(value) {
  if (value === undefined) {
    return undefined;
  }

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

function buildCreatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!name) {
    throw new Error('Name is required');
  }

  if (!email) {
    throw new Error('Email is required');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Email must be valid');
  }

  const role =
    body.role === undefined ? 'student' : normalizeRole(body.role);

  if (!role) {
    throw new Error('Role must be one of: student, mentor, admin');
  }

  const plan = body.plan === undefined ? 'free' : normalizePlan(body.plan);

  if (!plan) {
    throw new Error('Plan must be one of: free, pro, mentor');
  }

  const isActive = normalizeBoolean(body.isActive, 'isActive');
  const isEmailVerified = normalizeBoolean(body.isEmailVerified, 'isEmailVerified');
  const subjectExpertise = normalizeSubjects(body.subjects ?? body.subjectExpertise);

  return {
    name,
    email,
    role,
    plan,
    password:
      typeof body.password === 'string' && body.password.trim().length >= 6
        ? body.password.trim()
        : 'StudyFlow@123',
    isActive: isActive ?? true,
    isEmailVerified: isEmailVerified ?? false,
    subjectExpertise: subjectExpertise ?? [],
  };
}

function ensureAdmin(user) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const userData = buildCreatePayload(body);

    const existingUser = await User.findOne({ email: userData.email })
      .select('_id')
      .lean();

    if (existingUser) {
      throw new Error('Email is already in use');
    }

    const user = await User.create(userData);

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: user.toObject(),
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
