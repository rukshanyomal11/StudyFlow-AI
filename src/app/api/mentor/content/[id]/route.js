import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Material from '@/models/Material';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const allowedTypes = new Set(['Notes', 'PDFs', 'Videos', 'Assignments']);
const allowedVisibility = new Set([
  'Assigned Students',
  'All Assigned Cohorts',
  'Private Draft',
]);

function createErrorResponse(error) {
  console.error('Mentor content detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'Material not found') {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    if (error.message === 'Subject not found') {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (
      error.message === 'Material ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one material field is required' ||
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

  return NextResponse.json(
    { error: 'Internal server error' },
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

async function ensureSubjectExists(subjectId) {
  const subject = await Subject.findById(subjectId).select('_id name').lean();

  if (!subject) {
    throw new Error('Subject not found');
  }
}

async function getMaterialId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('Material ID is invalid');
  }

  return id;
}

function buildMaterialFilter(materialId, currentUser) {
  if (currentUser.role === 'admin') {
    return { _id: materialId };
  }

  return {
    _id: materialId,
    mentorId: currentUser.id,
  };
}

async function buildUpdatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const updates = {};

  if ('title' in body) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';

    if (!title) {
      throw new Error('Material title is required');
    }

    updates.title = title;
  }

  if ('subjectId' in body) {
    const subjectId =
      typeof body.subjectId === 'string' ? body.subjectId.trim() : '';

    if (!subjectId) {
      throw new Error('Subject ID is required');
    }

    if (!isValidObjectId(subjectId)) {
      throw new Error('Subject ID is invalid');
    }

    await ensureSubjectExists(subjectId);
    updates.subjectId = subjectId;
  }

  if ('type' in body) {
    const type = normalizeType(body.type);

    if (!type) {
      throw new Error('Material type must be one of: Notes, PDFs, Videos, Assignments');
    }

    updates.type = type;
  }

  if ('description' in body) {
    if (
      body.description !== null &&
      body.description !== undefined &&
      typeof body.description !== 'string'
    ) {
      throw new Error('Description must be a string');
    }

    updates.description =
      typeof body.description === 'string' ? body.description.trim() : '';
  }

  if ('fileUrl' in body) {
    const fileUrl = typeof body.fileUrl === 'string' ? body.fileUrl.trim() : '';

    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    updates.fileUrl = fileUrl;
  }

  if ('visibility' in body) {
    const visibility = normalizeVisibility(body.visibility);

    if (!visibility) {
      throw new Error(
        'Visibility must be one of: Assigned Students, All Assigned Cohorts, Private Draft',
      );
    }

    updates.visibility = visibility;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one material field is required');
  }

  return updates;
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    ensureMentorAccess(currentUser);

    await connectDB();

    const materialId = await getMaterialId(context);
    const filter = buildMaterialFilter(materialId, currentUser);
    const material = await Material.findOne(filter)
      .populate({
        path: 'mentorId',
        select: 'name email role',
      })
      .populate({
        path: 'subjectId',
        select: 'name',
      })
      .lean();

    if (!material) {
      throw new Error('Material not found');
    }

    return NextResponse.json({ material }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const currentUser = await requireAuth();
    ensureMentorAccess(currentUser);

    await connectDB();

    const materialId = await getMaterialId(context);
    const filter = buildMaterialFilter(materialId, currentUser);
    const body = await readJsonBody(request);
    const updates = await buildUpdatePayload(body);
    const material = await Material.findOneAndUpdate(
      filter,
      { $set: updates },
      { new: true, runValidators: true },
    )
      .populate({
        path: 'mentorId',
        select: 'name email role',
      })
      .populate({
        path: 'subjectId',
        select: 'name',
      })
      .lean();

    if (!material) {
      throw new Error('Material not found');
    }

    return NextResponse.json(
      {
        message: 'Material updated successfully',
        material,
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
    ensureMentorAccess(currentUser);

    await connectDB();

    const materialId = await getMaterialId(context);
    const filter = buildMaterialFilter(materialId, currentUser);
    const material = await Material.findOneAndDelete(filter).lean();

    if (!material) {
      throw new Error('Material not found');
    }

    return NextResponse.json(
      { message: 'Material deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
