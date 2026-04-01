import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Material from '@/models/Material';
import Subject from '@/models/Subject';
import User from '@/models/User';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedTypes = new Set(['Notes', 'PDFs', 'Videos', 'Assignments']);
const allowedVisibility = new Set([
  'Assigned Students',
  'All Assigned Cohorts',
  'Private Draft',
]);

function createErrorResponse(error) {
  console.error('Mentor content API error:', error);

  const errorMessage = error instanceof Error ? error.message : '';

  if (
    errorMessage.includes('querySrv') ||
    errorMessage.includes('ENOTFOUND') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('Mongo')
  ) {
    return NextResponse.json(
      {
        error:
          'Database is unavailable. Check your internet connection and MongoDB Atlas network access.',
      },
      { status: 503 },
    );
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'Mentor not found') {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    if (error.message === 'Subject not found') {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Mentor ID is required' ||
      error.message === 'Mentor ID is invalid' ||
      error.message === 'Material title is required' ||
      error.message === 'Subject ID is required' ||
      error.message === 'Subject ID is invalid' ||
      error.message === 'Material type must be one of: Notes, PDFs, Videos, Assignments' ||
      error.message === 'Description must be a string' ||
      error.message === 'File URL is required' ||
      error.message ===
        'Visibility must be one of: Assigned Students, All Assigned Cohorts, Private Draft'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  const fallbackMessage =
    error instanceof Error ? error.message : 'Internal server error';

  return NextResponse.json(
    { error: fallbackMessage || 'Internal server error' },
    { status: 500 },
  );
}

function ensureMentorAccess(user) {
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

function normalizeType(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return allowedTypes.has(trimmedValue) ? trimmedValue : null;
}

function normalizeVisibility(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return allowedVisibility.has(trimmedValue) ? trimmedValue : null;
}

async function ensureMentorExists(mentorId) {
  const mentor = await User.findOne({ _id: mentorId, role: 'mentor' })
    .select('_id name email role')
    .lean();

  if (!mentor) {
    throw new Error('Mentor not found');
  }
}

async function ensureSubjectExists(subjectId) {
  const subject = await Subject.findById(subjectId).select('_id name').lean();

  if (!subject) {
    throw new Error('Subject not found');
  }
}

async function resolveFilterMentorId(request, currentUser) {
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

async function resolveCreateMentorId(body, currentUser) {
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

async function buildCreatePayload(body, currentUser) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const mentorId = await resolveCreateMentorId(body, currentUser);
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const subjectId =
    typeof body.subjectId === 'string' ? body.subjectId.trim() : '';
  const fileUrl = typeof body.fileUrl === 'string' ? body.fileUrl.trim() : '';

  if (!title) {
    throw new Error('Material title is required');
  }

  if (!subjectId) {
    throw new Error('Subject ID is required');
  }

  if (!isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  if (!fileUrl) {
    throw new Error('File URL is required');
  }

  const type = normalizeType(body.type);

  if (!type) {
    throw new Error('Material type must be one of: Notes, PDFs, Videos, Assignments');
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== 'string'
  ) {
    throw new Error('Description must be a string');
  }

  let visibility = 'Assigned Students';

  if (body.visibility !== undefined) {
    const normalizedVisibility = normalizeVisibility(body.visibility);

    if (!normalizedVisibility) {
      throw new Error(
        'Visibility must be one of: Assigned Students, All Assigned Cohorts, Private Draft',
      );
    }

    visibility = normalizedVisibility;
  }

  await ensureSubjectExists(subjectId);

  return {
    mentorId,
    title,
    subjectId,
    type,
    description:
      typeof body.description === 'string' ? body.description.trim() : '',
    fileUrl,
    visibility,
  };
}

export async function GET(request) {
  try {
    const currentUser = await requireAuth();
    ensureMentorAccess(currentUser);

    await connectDB();

    const mentorId = await resolveFilterMentorId(request, currentUser);
    const filter = mentorId ? { mentorId } : {};
    const materials = await Material.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const subjectIds = Array.from(
      new Set(
        materials
          .map((item) => item.subjectId?.toString?.() || '')
          .filter((id) => isValidObjectId(id)),
      ),
    );

    const subjects = subjectIds.length
      ? await Subject.find({ _id: { $in: subjectIds } })
          .select('_id name')
          .lean()
      : [];

    const subjectNameById = new Map(
      subjects.map((subject) => [subject._id.toString(), subject.name]),
    );

    const normalizedMaterials = materials.map((item) => ({
      ...item,
      subjectName: subjectNameById.get(item.subjectId?.toString?.() || '') || '',
    }));

    return NextResponse.json({ materials: normalizedMaterials }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();
    ensureMentorAccess(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const materialData = await buildCreatePayload(body, currentUser);
    const material = await Material.create(materialData);
    const populatedMaterial = await Material.findById(material._id)
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
        message: 'Material created successfully',
        material: populatedMaterial,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
