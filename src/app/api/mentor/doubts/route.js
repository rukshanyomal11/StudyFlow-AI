import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Doubt from '@/models/Doubt';
import MentorStudent from '@/models/MentorStudent';
import Subject from '@/models/Subject';
import User from '@/models/User';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedStatuses = new Set(['Pending', 'Reviewing', 'Answered']);
const allowedPriorities = new Set(['Urgent', 'High', 'Normal']);

function createErrorResponse(error) {
  console.error('Mentor doubts API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      error.message === 'Forbidden' ||
      error.message === 'Only students can create doubts' ||
      error.message === 'Mentor is not assigned to this student for the selected subject'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (
      error.message === 'Mentor not found' ||
      error.message === 'Subject not found'
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Mentor ID is required' ||
      error.message === 'Mentor ID is invalid' ||
      error.message === 'Subject ID is required' ||
      error.message === 'Subject ID is invalid' ||
      error.message === 'Doubt title is required' ||
      error.message === 'Doubt message is required' ||
      error.message === 'Priority must be one of: Urgent, High, Normal' ||
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

function ensureDoubtViewer(user) {
  if (user.role !== 'mentor' && user.role !== 'admin' && user.role !== 'student') {
    throw new Error('Forbidden');
  }
}

function ensureStudent(user) {
  if (user.role !== 'student') {
    throw new Error('Only students can create doubts');
  }
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function normalizePriority(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return allowedPriorities.has(normalizedValue) ? normalizedValue : null;
}

function normalizeStatus(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return allowedStatuses.has(normalizedValue) ? normalizedValue : null;
}

async function resolveMentorFilter(request, currentUser) {
  if (currentUser.role === 'mentor') {
    return currentUser.id;
  }

  if (currentUser.role === 'student') {
    return null;
  }

  const mentorId = request.nextUrl.searchParams.get('mentorId')?.trim() || '';

  if (!mentorId) {
    return null;
  }

  if (!isValidObjectId(mentorId)) {
    throw new Error('Mentor ID is invalid');
  }

  const mentor = await User.findOne({ _id: mentorId, role: 'mentor' })
    .select('_id')
    .lean();

  if (!mentor) {
    throw new Error('Mentor not found');
  }

  return mentorId;
}

async function ensureStudentSubject(subjectId, studentId) {
  const subject = await Subject.findOne({ _id: subjectId, userId: studentId })
    .select('_id name')
    .lean();

  if (!subject) {
    throw new Error('Subject not found');
  }
}

async function ensureMentorExists(mentorId) {
  const mentor = await User.findOne({ _id: mentorId, role: 'mentor' })
    .select('_id')
    .lean();

  if (!mentor) {
    throw new Error('Mentor not found');
  }
}

async function ensureAssignmentExists(mentorId, studentId, subjectId) {
  const assignment = await MentorStudent.findOne({
    mentorId,
    studentId,
    $or: [{ subjectId }, { subjectId: null }],
  }).lean();

  if (!assignment) {
    throw new Error('Mentor is not assigned to this student for the selected subject');
  }
}

async function buildCreatePayload(body, currentUser) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const mentorId = typeof body.mentorId === 'string' ? body.mentorId.trim() : '';
  const subjectId = typeof body.subjectId === 'string' ? body.subjectId.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!mentorId) {
    throw new Error('Mentor ID is required');
  }

  if (!isValidObjectId(mentorId)) {
    throw new Error('Mentor ID is invalid');
  }

  if (!subjectId) {
    throw new Error('Subject ID is required');
  }

  if (!isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  if (!title) {
    throw new Error('Doubt title is required');
  }

  if (!message) {
    throw new Error('Doubt message is required');
  }

  await ensureMentorExists(mentorId);
  await ensureStudentSubject(subjectId, currentUser.id);
  await ensureAssignmentExists(mentorId, currentUser.id, subjectId);

  let priority = 'Normal';

  if (body.priority !== undefined) {
    const normalizedPriority = normalizePriority(body.priority);

    if (!normalizedPriority) {
      throw new Error('Priority must be one of: Urgent, High, Normal');
    }

    priority = normalizedPriority;
  }

  let status = 'Pending';

  if (body.status !== undefined) {
    const normalizedStatus = normalizeStatus(body.status);

    if (!normalizedStatus) {
      throw new Error('Status must be one of: Pending, Reviewing, Answered');
    }

    status = normalizedStatus;
  }

  return {
    studentId: currentUser.id,
    mentorId,
    subjectId,
    title,
    message,
    priority,
    status,
  };
}

export async function GET(request) {
  try {
    const currentUser = await requireAuth();
    ensureDoubtViewer(currentUser);

    await connectDB();

    const mentorId = await resolveMentorFilter(request, currentUser);
    let filter = {};

    if (currentUser.role === 'student') {
      filter = { studentId: currentUser.id };
    } else if (mentorId) {
      filter = { mentorId };
    }

    const doubts = await Doubt.find(filter)
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
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ doubts }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();
    ensureStudent(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const doubtData = await buildCreatePayload(body, currentUser);
    const doubt = await Doubt.create(doubtData);
    const populatedDoubt = await Doubt.findById(doubt._id)
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

    return NextResponse.json(
      {
        message: 'Doubt created successfully',
        doubt: populatedDoubt,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
