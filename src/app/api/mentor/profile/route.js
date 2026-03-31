import { NextResponse } from 'next/server';
import Announcement from '@/models/Announcement';
import Material from '@/models/Material';
import MentorStudent from '@/models/MentorStudent';
import Quiz from '@/models/Quiz';
import User from '@/models/User';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createErrorResponse(error) {
  console.error('Mentor profile API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Only mentors can access mentor profile') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message === 'Mentor not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one profile field is required' ||
      error.message === 'Full name is required' ||
      error.message === 'Email is required' ||
      error.message === 'Email must be valid' ||
      error.message === 'Email is already in use' ||
      error.message === 'Phone must be a string' ||
      error.message === 'Qualification must be a string' ||
      error.message === 'Specialization must be a string' ||
      error.message === 'Bio must be a string' ||
      error.message === 'Avatar URL must be a string or null' ||
      error.message === 'Subject expertise must be an array of strings or a comma-separated string'
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
    throw new Error('Only mentors can access mentor profile');
  }
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function normalizeEmail(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

function normalizeOptionalString(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return '';
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  return value.trim();
}

function normalizeSubjectExpertise(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    const topics = value
      .filter((topic) => typeof topic === 'string')
      .map((topic) => topic.trim())
      .filter(Boolean);

    if (topics.length !== value.length) {
      throw new Error(
        'Subject expertise must be an array of strings or a comma-separated string',
      );
    }

    return topics;
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((topic) => topic.trim())
      .filter(Boolean);
  }

  throw new Error(
    'Subject expertise must be an array of strings or a comma-separated string',
  );
}

async function ensureUniqueEmail(email, userId) {
  const existingUser = await User.findOne({
    email,
    _id: { $ne: userId },
  })
    .select('_id')
    .lean();

  if (existingUser) {
    throw new Error('Email is already in use');
  }
}

function buildProfileResponse(user, counts) {
  const preferences = user.preferences || {};

  return {
    id: user._id.toString(),
    fullName: user.name,
    email: user.email,
    phone: user.phone || '',
    qualification: user.qualification || '',
    specialization: user.specialization || '',
    bio: user.bio || '',
    role: 'Mentor',
    subjectExpertise: user.subjectExpertise || [],
    totalStudents: counts.totalStudents,
    quizzesCreated: counts.quizzesCreated,
    materialsUploaded: counts.materialsUploaded,
    announcementsSent: counts.announcementsSent,
    twoFactorEnabled: preferences.twoFactorAuth ?? false,
    theme: preferences.themeMode ?? 'System',
    notifications: preferences.reminderEnabled ?? true,
    timezone: preferences.timezone ?? 'Asia/Colombo (GMT+5:30)',
    language: preferences.language ?? 'English',
    avatarUrl: user.avatar || null,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    plan: user.plan,
    level: user.level,
    goals: user.goals || [],
  };
}

async function getMentorCounts(mentorId) {
  const [studentIds, quizzesCreated, materialsUploaded, announcementsSent] =
    await Promise.all([
      MentorStudent.distinct('studentId', { mentorId }),
      Quiz.countDocuments({ createdBy: mentorId }),
      Material.countDocuments({ mentorId }),
      Announcement.countDocuments({ mentorId }),
    ]);

  return {
    totalStudents: studentIds.length,
    quizzesCreated,
    materialsUploaded,
    announcementsSent,
  };
}

function buildUpdatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const updates = {};

  if ('fullName' in body || 'name' in body) {
    const fullName =
      typeof (body.fullName ?? body.name) === 'string'
        ? String(body.fullName ?? body.name).trim()
        : '';

    if (!fullName) {
      throw new Error('Full name is required');
    }

    updates.name = fullName;
  }

  if ('email' in body) {
    const email = normalizeEmail(body.email);

    if (!email) {
      throw new Error('Email is required');
    }

    if (!emailPattern.test(email)) {
      throw new Error('Email must be valid');
    }

    updates.email = email;
  }

  if ('phone' in body) {
    updates.phone = normalizeOptionalString(body.phone, 'Phone');
  }

  if ('qualification' in body) {
    updates.qualification = normalizeOptionalString(
      body.qualification,
      'Qualification',
    );
  }

  if ('specialization' in body) {
    updates.specialization = normalizeOptionalString(
      body.specialization,
      'Specialization',
    );
  }

  if ('bio' in body) {
    updates.bio = normalizeOptionalString(body.bio, 'Bio');
  }

  if ('avatarUrl' in body || 'avatar' in body) {
    const avatarValue = body.avatarUrl ?? body.avatar;

    if (avatarValue !== null && avatarValue !== undefined && typeof avatarValue !== 'string') {
      throw new Error('Avatar URL must be a string or null');
    }

    updates.avatar =
      typeof avatarValue === 'string' ? avatarValue.trim() : null;
  }

  if ('subjectExpertise' in body) {
    updates.subjectExpertise = normalizeSubjectExpertise(body.subjectExpertise);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one profile field is required');
  }

  return updates;
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    ensureMentor(currentUser);

    await connectDB();

    const mentor = await User.findById(currentUser.id).lean();

    if (!mentor || mentor.role !== 'mentor') {
      throw new Error('Mentor not found');
    }

    const counts = await getMentorCounts(mentor._id);

    return NextResponse.json(
      {
        profile: buildProfileResponse(mentor, counts),
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request) {
  try {
    const currentUser = await requireAuth();
    ensureMentor(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const updates = buildUpdatePayload(body);

    if (updates.email) {
      await ensureUniqueEmail(updates.email, currentUser.id);
    }

    const mentor = await User.findByIdAndUpdate(
      currentUser.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!mentor || mentor.role !== 'mentor') {
      throw new Error('Mentor not found');
    }

    const counts = await getMentorCounts(mentor._id);

    return NextResponse.json(
      {
        message: 'Mentor profile updated successfully',
        profile: buildProfileResponse(mentor, counts),
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
