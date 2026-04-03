import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Material from '@/models/Material';
import MentorStudent from '@/models/MentorStudent';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';
import {
  extractObjectId,
  getMaterialSubjectName,
  normalizeMaterialType,
  normalizeSubjectKey,
  serializeMaterial,
} from '@/lib/material-utils';

export const runtime = 'nodejs';

function createErrorResponse(error) {
  console.error('Student materials API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'Subject ID is invalid') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  const fallbackMessage =
    process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'Internal server error';

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

function ensureStudentAccess(user) {
  if (user.role !== 'student') {
    throw new Error('Forbidden');
  }
}

function buildStudentSubjects(subjects) {
  const subjectIds = new Set();
  const subjectKeys = new Set();
  const subjectKeyById = new Map();

  for (const subject of subjects) {
    const subjectId = extractObjectId(subject?._id);
    const subjectKey = normalizeSubjectKey(subject?.name);

    if (subjectId) {
      subjectIds.add(subjectId);
      subjectKeyById.set(subjectId, subjectKey);
    }

    if (subjectKey) {
      subjectKeys.add(subjectKey);
    }
  }

  return {
    subjectIds,
    subjectKeys,
    subjectKeyById,
  };
}

async function buildAssignments(studentId) {
  const assignments = await MentorStudent.find({ studentId })
    .select('_id mentorId subjectId')
    .lean();

  const assignmentSubjectIds = Array.from(
    new Set(
      assignments
        .map((assignment) => extractObjectId(assignment?.subjectId))
        .filter(Boolean),
    ),
  );

  const assignmentSubjects = assignmentSubjectIds.length
    ? await Subject.find({ _id: { $in: assignmentSubjectIds } })
        .select('_id name')
        .lean()
    : [];

  const assignmentSubjectKeyById = new Map(
    assignmentSubjects.map((subject) => [
      extractObjectId(subject?._id),
      normalizeSubjectKey(subject?.name),
    ]),
  );

  const normalizedAssignments = assignments.map((assignment) => {
    const mentorId = extractObjectId(assignment?.mentorId);
    const subjectId = extractObjectId(assignment?.subjectId);

    return {
      mentorId,
      subjectId,
      subjectKey: subjectId ? assignmentSubjectKeyById.get(subjectId) || '' : '',
    };
  });

  return {
    assignments: normalizedAssignments,
    mentorIds: new Set(
      normalizedAssignments.map((assignment) => assignment.mentorId).filter(Boolean),
    ),
  };
}

function isMaterialVisibleToStudent(material, context) {
  const mentorId = extractObjectId(material?.mentorId);
  const subjectId = extractObjectId(material?.subjectId);
  const subjectKey = normalizeSubjectKey(getMaterialSubjectName(material));

  if (!mentorId || !context.mentorIds.has(mentorId)) {
    return false;
  }

  if (
    !context.subjectIds.has(subjectId) &&
    (!subjectKey || !context.subjectKeys.has(subjectKey))
  ) {
    return false;
  }

  if (
    context.filterSubjectKey &&
    subjectId !== context.filterSubjectId &&
    subjectKey !== context.filterSubjectKey
  ) {
    return false;
  }

  if (context.filterType && material.type !== context.filterType) {
    return false;
  }

  if (material.visibility === 'All Assigned Cohorts') {
    return true;
  }

  return context.assignments.some((assignment) => {
    if (assignment.mentorId !== mentorId) {
      return false;
    }

    if (!assignment.subjectId && !assignment.subjectKey) {
      return true;
    }

    if (assignment.subjectId && assignment.subjectId === subjectId) {
      return true;
    }

    return Boolean(assignment.subjectKey && assignment.subjectKey === subjectKey);
  });
}

export async function GET(request) {
  try {
    const currentUser = await requireAuth();
    ensureStudentAccess(currentUser);

    await connectDB();

    const subjectId = request.nextUrl.searchParams.get('subjectId')?.trim() || '';
    const typeFilter = normalizeMaterialType(
      request.nextUrl.searchParams.get('type')?.trim() || '',
    );

    if (subjectId && !isValidObjectId(subjectId)) {
      throw new Error('Subject ID is invalid');
    }

    const studentSubjects = await Subject.find({ userId: currentUser.id })
      .select('_id name')
      .lean();

    const subjectContext = buildStudentSubjects(studentSubjects);

    if (subjectId && !subjectContext.subjectIds.has(subjectId)) {
      throw new Error('Forbidden');
    }

    const { assignments, mentorIds } = await buildAssignments(currentUser.id);

    if (!studentSubjects.length || mentorIds.size === 0) {
      return NextResponse.json({ materials: [] }, { status: 200 });
    }

    const materials = await Material.find({
      mentorId: { $in: Array.from(mentorIds) },
      visibility: { $ne: 'Private Draft' },
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

    const filterSubjectKey = subjectId
      ? subjectContext.subjectKeyById.get(subjectId) || ''
      : '';

    const visibleMaterials = materials
      .filter((material) =>
        isMaterialVisibleToStudent(material, {
          assignments,
          mentorIds,
          filterSubjectId: subjectId,
          filterSubjectKey,
          filterType: typeFilter,
          subjectIds: subjectContext.subjectIds,
          subjectKeys: subjectContext.subjectKeys,
        }),
      )
      .map(serializeMaterial);

    return NextResponse.json({ materials: visibleMaterials }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
