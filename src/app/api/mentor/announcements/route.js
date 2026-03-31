import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Announcement from '@/models/Announcement';
import MentorStudent from '@/models/MentorStudent';
import User from '@/models/User';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedAudienceTypes = new Set([
  'all_assigned_students',
  'students',
  'groups',
]);
const allowedStatuses = new Set(['Draft', 'Scheduled', 'Sent']);

function createErrorResponse(error) {
  console.error('Mentor announcements API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      error.message === 'Mentor not found' ||
      error.message === 'Some target students are not assigned to this mentor'
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Mentor ID is required' ||
      error.message === 'Mentor ID is invalid' ||
      error.message === 'Announcement title is required' ||
      error.message === 'Announcement message is required' ||
      error.message ===
        'Audience type must be one of: all_assigned_students, students, groups' ||
      error.message === 'Target IDs must be an array of strings' ||
      error.message === 'Student target IDs must be valid IDs' ||
      error.message === 'At least one target ID is required for this audience type' ||
      error.message === 'Scheduled date must be a valid date' ||
      error.message === 'Status must be one of: Draft, Scheduled, Sent'
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

function ensureAnnouncementAccess(user) {
  if (user.role !== 'mentor' && user.role !== 'admin') {
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

async function ensureMentorExists(mentorId) {
  const mentor = await User.findOne({ _id: mentorId, role: 'mentor' })
    .select('_id name email role')
    .lean();

  if (!mentor) {
    throw new Error('Mentor not found');
  }
}

async function resolveMentorIdForGet(request, currentUser) {
  if (currentUser.role === 'mentor') {
    return currentUser.id;
  }

  const mentorId = request.nextUrl.searchParams.get('mentorId')?.trim() || '';

  if (!mentorId) {
    return null;
  }

  if (!isValidObjectId(mentorId)) {
    throw new Error('Mentor ID is invalid');
  }

  await ensureMentorExists(mentorId);

  return mentorId;
}

async function resolveMentorIdForCreate(body, currentUser) {
  if (currentUser.role === 'mentor') {
    return currentUser.id;
  }

  const mentorId = typeof body.mentorId === 'string' ? body.mentorId.trim() : '';

  if (!mentorId) {
    throw new Error('Mentor ID is required');
  }

  if (!isValidObjectId(mentorId)) {
    throw new Error('Mentor ID is invalid');
  }

  await ensureMentorExists(mentorId);

  return mentorId;
}

function normalizeAudienceType(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return allowedAudienceTypes.has(trimmedValue) ? trimmedValue : null;
}

function normalizeStatus(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return allowedStatuses.has(trimmedValue) ? trimmedValue : null;
}

function normalizeTargetIds(value) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('Target IDs must be an array of strings');
  }

  const targetIds = value
    .filter((targetId) => typeof targetId === 'string')
    .map((targetId) => targetId.trim())
    .filter(Boolean);

  if (targetIds.length !== value.length) {
    throw new Error('Target IDs must be an array of strings');
  }

  return [...new Set(targetIds)];
}

async function ensureAssignedStudents(mentorId, targetIds) {
  if (!targetIds.every((targetId) => isValidObjectId(targetId))) {
    throw new Error('Student target IDs must be valid IDs');
  }

  const assignedStudentIds = await MentorStudent.distinct('studentId', {
    mentorId,
    studentId: { $in: targetIds },
  });

  if (assignedStudentIds.length !== targetIds.length) {
    throw new Error('Some target students are not assigned to this mentor');
  }
}

async function buildCreatePayload(body, currentUser) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const mentorId = await resolveMentorIdForCreate(body, currentUser);
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!title) {
    throw new Error('Announcement title is required');
  }

  if (!message) {
    throw new Error('Announcement message is required');
  }

  const audienceType = normalizeAudienceType(body.audienceType);

  if (!audienceType) {
    throw new Error(
      'Audience type must be one of: all_assigned_students, students, groups',
    );
  }

  const targetIds = normalizeTargetIds(body.targetIds);

  if (audienceType !== 'all_assigned_students' && targetIds.length === 0) {
    throw new Error('At least one target ID is required for this audience type');
  }

  if (audienceType === 'students') {
    await ensureAssignedStudents(mentorId, targetIds);
  }

  let scheduledAt = null;

  if (body.scheduledAt !== undefined && body.scheduledAt !== null && body.scheduledAt !== '') {
    scheduledAt = new Date(String(body.scheduledAt));

    if (Number.isNaN(scheduledAt.getTime())) {
      throw new Error('Scheduled date must be a valid date');
    }
  }

  let status = scheduledAt ? 'Scheduled' : 'Draft';

  if (body.status !== undefined) {
    const normalizedStatus = normalizeStatus(body.status);

    if (!normalizedStatus) {
      throw new Error('Status must be one of: Draft, Scheduled, Sent');
    }

    status = normalizedStatus;
  }

  return {
    mentorId,
    title,
    message,
    audienceType,
    targetIds,
    scheduledAt,
    status,
  };
}

export async function GET(request) {
  try {
    const currentUser = await requireAuth();
    ensureAnnouncementAccess(currentUser);

    await connectDB();

    const mentorId = await resolveMentorIdForGet(request, currentUser);
    const filter = mentorId ? { mentorId } : {};
    const announcements = await Announcement.find(filter)
      .populate({
        path: 'mentorId',
        select: 'name email role',
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ announcements }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();
    ensureAnnouncementAccess(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const announcementData = await buildCreatePayload(body, currentUser);
    const announcement = await Announcement.create(announcementData);
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate({
        path: 'mentorId',
        select: 'name email role',
      })
      .lean();

    return NextResponse.json(
      {
        message: 'Announcement created successfully',
        announcement: populatedAnnouncement,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
