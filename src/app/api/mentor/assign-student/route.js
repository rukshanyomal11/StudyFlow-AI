import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import MentorStudent from '@/models/MentorStudent';
import Subject from '@/models/Subject';
import User from '@/models/User';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Assign student API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'Mentor not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === 'Student not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === 'Subject not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === 'Mentor-student assignment already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Student ID is required' ||
      error.message === 'Student ID is invalid' ||
      error.message === 'Mentor ID is required' ||
      error.message === 'Mentor ID is invalid' ||
      error.message === 'Subject ID is invalid'
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

async function resolveMentorId(body, currentUser) {
  if (currentUser.role === 'mentor') {
    return currentUser.id;
  }

  const mentorId = typeof body?.mentorId === 'string' ? body.mentorId.trim() : '';

  if (!mentorId) {
    throw new Error('Mentor ID is required');
  }

  if (!isValidObjectId(mentorId)) {
    throw new Error('Mentor ID is invalid');
  }

  return mentorId;
}

async function resolveMentorIdForGet(request, currentUser) {
  if (currentUser.role === 'mentor') {
    return currentUser.id;
  }

  const mentorId = request.nextUrl.searchParams.get('mentorId')?.trim() || '';

  if (!mentorId) {
    throw new Error('Mentor ID is required');
  }

  if (!isValidObjectId(mentorId)) {
    throw new Error('Mentor ID is invalid');
  }

  return mentorId;
}

async function ensureMentorExists(mentorId) {
  const mentor = await User.findOne({ _id: mentorId, role: 'mentor' })
    .select('_id name email role')
    .lean();

  if (!mentor) {
    throw new Error('Mentor not found');
  }
}

async function buildAssignmentPayload(body, currentUser) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const mentorId = await resolveMentorId(body, currentUser);
  const studentId = typeof body.studentId === 'string' ? body.studentId.trim() : '';
  const subjectId = typeof body.subjectId === 'string' ? body.subjectId.trim() : '';

  if (!studentId) {
    throw new Error('Student ID is required');
  }

  if (!isValidObjectId(studentId)) {
    throw new Error('Student ID is invalid');
  }

  if (subjectId && !isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  const [mentor, student] = await Promise.all([
    User.findOne({ _id: mentorId, role: 'mentor' })
      .select('_id name email role')
      .lean(),
    User.findOne({ _id: studentId, role: 'student' })
      .select('_id name email role')
      .lean(),
  ]);

  if (!mentor) {
    throw new Error('Mentor not found');
  }

  if (!student) {
    throw new Error('Student not found');
  }

  if (subjectId) {
    const subject = await Subject.findOne({ _id: subjectId, userId: studentId })
      .select('_id name')
      .lean();

    if (!subject) {
      throw new Error('Subject not found');
    }
  }

  const existingAssignment = await MentorStudent.findOne({
    mentorId,
    studentId,
    subjectId: subjectId || null,
  }).lean();

  if (existingAssignment) {
    throw new Error('Mentor-student assignment already exists');
  }

  return {
    mentorId,
    studentId,
    subjectId: subjectId || null,
  };
}

function buildAssignableStudents(students, subjects, assignments) {
  const subjectsByStudentId = new Map();
  const assignmentKeys = new Set();
  const generalAssignments = new Set();

  subjects.forEach((subject) => {
    const studentKey = String(subject.userId);

    if (!subjectsByStudentId.has(studentKey)) {
      subjectsByStudentId.set(studentKey, []);
    }

    subjectsByStudentId.get(studentKey).push({
      subjectId: String(subject._id),
      name: subject.name,
      progress: typeof subject.progress === 'number' ? subject.progress : null,
    });
  });

  assignments.forEach((assignment) => {
    const studentKey = String(assignment.studentId);
    const subjectKey = assignment.subjectId ? String(assignment.subjectId) : null;

    if (subjectKey) {
      assignmentKeys.add(`${studentKey}:${subjectKey}`);
      return;
    }

    generalAssignments.add(studentKey);
  });

  return students.map((student) => {
    const studentId = String(student._id);
    const subjectOptions = (subjectsByStudentId.get(studentId) ?? [])
      .map((subject) => ({
        ...subject,
        isAssignedToMentor: assignmentKeys.has(`${studentId}:${subject.subjectId}`),
      }))
      .sort((first, second) => first.name.localeCompare(second.name));

    return {
      studentId,
      name: student.name,
      email: student.email,
      avatar: student.avatar ?? null,
      level: student.level ?? null,
      hasGeneralAssignment: generalAssignments.has(studentId),
      subjects: subjectOptions,
    };
  });
}

export async function GET(request) {
  try {
    const currentUser = await requireAuth();
    ensureMentorAccess(currentUser);

    await connectDB();

    const mentorId = await resolveMentorIdForGet(request, currentUser);
    await ensureMentorExists(mentorId);

    const students = await User.find({ role: 'student' })
      .select('_id name email avatar level')
      .sort({ name: 1 })
      .lean();
    const studentIds = students.map((student) => student._id);

    const [subjects, assignments] = await Promise.all([
      Subject.find({ userId: { $in: studentIds } })
        .select('_id name progress userId')
        .sort({ name: 1 })
        .lean(),
      MentorStudent.find({ mentorId })
        .select('studentId subjectId')
        .lean(),
    ]);

    return NextResponse.json(
      {
        mentorId,
        students: buildAssignableStudents(students, subjects, assignments),
      },
      { status: 200 },
    );
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
    const assignmentData = await buildAssignmentPayload(body, currentUser);
    const assignment = await MentorStudent.create(assignmentData);
    const populatedAssignment = await MentorStudent.findById(assignment._id)
      .populate({
        path: 'mentorId',
        select: 'name email role',
      })
      .populate({
        path: 'studentId',
        select: 'name email role',
      })
      .populate({
        path: 'subjectId',
        select: 'name',
      })
      .lean();

    return NextResponse.json(
      {
        message: 'Student assigned successfully',
        assignment: populatedAssignment,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
