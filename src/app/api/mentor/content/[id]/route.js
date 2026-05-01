import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Material from '@/models/Material';
import MentorStudent from '@/models/MentorStudent';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';
import {
  MATERIAL_TYPES,
  MATERIAL_VISIBILITY,
  normalizeMaterialType,
  normalizeMaterialVisibility,
  serializeMaterial,
} from '@/lib/material-utils';

export const runtime = 'nodejs';

function createErrorResponse(error) {
  console.error('Mentor content detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden' || error.message === 'Subject access denied') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message === 'Material not found' || error.message === 'Subject not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === 'Material ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one material field is required' ||
      error.message === 'Material title is required' ||
      error.message === 'Subject ID is required' ||
      error.message === 'Subject ID is invalid' ||
      error.message === `Material type must be one of: ${MATERIAL_TYPES.join(', ')}` ||
      error.message === 'Description must be a string' ||
      error.message === 'File URL is required' ||
      error.message ===
        `Visibility must be one of: ${MATERIAL_VISIBILITY.join(', ')}`
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  const fallbackMessage =
    process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'Internal server error';

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
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

async function ensureSubjectAccess(subjectId, mentorId) {
  const subject = await Subject.findById(subjectId).select('_id name userId').lean();

  if (!subject) {
    throw new Error('Subject not found');
  }

  const assignment = await MentorStudent.findOne({
    mentorId,
    studentId: subject.userId,
    $or: [{ subjectId }, { subjectId: null }],
  })
    .select('_id')
    .lean();

  if (!assignment) {
    throw new Error('Subject access denied');
  }
}

async function getMaterialId(context) {
  const params = await context.params;
  const materialId = params?.id;

  if (!isValidObjectId(materialId)) {
    throw new Error('Material ID is invalid');
  }

  return materialId;
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

function validateDescription(description) {
  if (
    description !== null &&
    description !== undefined &&
    typeof description !== 'string'
  ) {
    throw new Error('Description must be a string');
  }
}

async function buildUpdatePayload(body, existingMaterial) {
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
    const subjectId = typeof body.subjectId === 'string' ? body.subjectId.trim() : '';

    if (!subjectId) {
      throw new Error('Subject ID is required');
    }

    if (!isValidObjectId(subjectId)) {
      throw new Error('Subject ID is invalid');
    }

    await ensureSubjectAccess(subjectId, existingMaterial.mentorId.toString());
    updates.subjectId = subjectId;
  }

  if ('type' in body) {
    const type = normalizeMaterialType(body.type);

    if (!type) {
      throw new Error(`Material type must be one of: ${MATERIAL_TYPES.join(', ')}`);
    }

    updates.type = type;
  }

  if ('description' in body) {
    validateDescription(body.description);
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
    const visibility = normalizeMaterialVisibility(body.visibility);

    if (!visibility) {
      throw new Error(
        `Visibility must be one of: ${MATERIAL_VISIBILITY.join(', ')}`,
      );
    }

    updates.visibility = visibility;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one material field is required');
  }

  return updates;
}

async function populateMaterial(materialId) {
  const material = await Material.findById(materialId)
    .populate({
      path: 'mentorId',
      select: 'name email role',
    })
    .populate({
      path: 'subjectId',
      select: 'name',
    })
    .lean();

  return material ? serializeMaterial(material) : null;
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    ensureMentorAccess(currentUser);

    await connectDB();

    const materialId = await getMaterialId(context);
    const material = await Material.findOne(buildMaterialFilter(materialId, currentUser))
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

    return NextResponse.json({ material: serializeMaterial(material) }, { status: 200 });
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
    const materialFilter = buildMaterialFilter(materialId, currentUser);
    const existingMaterial = await Material.findOne(materialFilter).select('_id mentorId').lean();

    if (!existingMaterial) {
      throw new Error('Material not found');
    }

    const body = await readJsonBody(request);
    const updates = await buildUpdatePayload(body, existingMaterial);

    await Material.updateOne(
      { _id: materialId },
      { $set: updates },
      { runValidators: true },
    );

    const material = await populateMaterial(materialId);

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
    const material = await Material.findOneAndDelete(
      buildMaterialFilter(materialId, currentUser),
    ).lean();

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
