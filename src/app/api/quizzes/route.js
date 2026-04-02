import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import MentorStudent from '@/models/MentorStudent';
import Quiz from '@/models/Quiz';
import Subject from '@/models/Subject';
import User from '@/models/User';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';
import {
  ensureQuizManager,
  getUserId,
  normalizeAssignedTo,
  normalizeQuestions,
  serializeQuiz,
  serializeQuizzes,
} from '@/lib/quiz-utils';

export const runtime = 'nodejs';

function getErrorDetails(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Internal server error';
}

function createErrorResponse(error) {
  console.error('Quizzes API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'Subject not found') {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (error.message === 'Assigned student not found') {
      return NextResponse.json(
        { error: 'Assigned student not found' },
        { status: 404 },
      );
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Subject ID is required' ||
      error.message === 'Subject ID is invalid' ||
      error.message === 'Assigned student ID is invalid' ||
      error.message === 'Assigned students must be an array' ||
      error.message ===
        'Assigned student is not linked to this mentor for the selected subject' ||
      error.message === 'Quiz title is required' ||
      error.message === 'Description must be a string' ||
      error.message === 'Questions must be a non-empty array' ||
      error.message === 'Question text is required' ||
      error.message === 'Each question must include at least two options' ||
      error.message === 'Each option must be a non-empty string' ||
      error.message === 'Correct answer must be a valid option index' ||
      error.message === 'Explanation must be a string'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid database identifier' },
        { status: 400 },
      );
    }
  }

  return NextResponse.json(
    {
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development'
        ? { details: getErrorDetails(error) }
        : {}),
    },
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

function readSearchFilter(request, names) {
  const { searchParams } = new URL(request.url);

  for (const name of names) {
    const value = searchParams.get(name);

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

async function ensureQuizSubjectAccess(user, userId, subjectId) {
  if (!isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  const subject = await Subject.findById(subjectId)
    .select('_id name userId')
    .lean();

  if (!subject) {
    throw new Error('Subject not found');
  }

  if (user.role === 'admin' || String(subject.userId) === userId) {
    return subject;
  }

  const assignment = await MentorStudent.findOne({
    mentorId: userId,
    subjectId,
  }).lean();

  if (!assignment) {
    throw new Error('Forbidden');
  }

  return subject;
}

async function validateAssignedStudents(user, userId, subjectId, assignedTo) {
  if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
    return [];
  }

  const students = await User.find({
    _id: { $in: assignedTo },
    role: 'student',
  })
    .select('_id')
    .lean();

  if (students.length !== assignedTo.length) {
    throw new Error('Assigned student not found');
  }

  if (user.role !== 'mentor') {
    return assignedTo;
  }

  const assignedStudentIds = await MentorStudent.distinct('studentId', {
    mentorId: userId,
    subjectId,
    studentId: { $in: assignedTo },
  });
  const allowedStudentIds = new Set(
    assignedStudentIds.map((studentId) => String(studentId)),
  );

  const hasInvalidStudent = assignedTo.some(
    (studentId) => !allowedStudentIds.has(studentId),
  );

  if (hasInvalidStudent) {
    throw new Error(
      'Assigned student is not linked to this mentor for the selected subject',
    );
  }

  return assignedTo;
}

async function buildCreatePayload(body, currentUser, userId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const subjectId =
    typeof body.subjectId === 'string' ? body.subjectId.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';

  if (!subjectId) {
    throw new Error('Subject ID is required');
  }

  if (!title) {
    throw new Error('Quiz title is required');
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== 'string'
  ) {
    throw new Error('Description must be a string');
  }

  const assignedTo = normalizeAssignedTo(body.assignedTo) ?? [];

  await ensureQuizSubjectAccess(currentUser, userId, subjectId);

  return {
    createdBy: userId,
    subjectId,
    title,
    description:
      typeof body.description === 'string' ? body.description.trim() : '',
    assignedTo: await validateAssignedStudents(
      currentUser,
      userId,
      subjectId,
      assignedTo,
    ),
    questions: normalizeQuestions(body.questions),
  };
}

async function buildStudentQuizQuery(userId, subjectId, assignedStudentId) {
  if (assignedStudentId && assignedStudentId !== userId) {
    throw new Error('Forbidden');
  }

  const subjects = await Subject.find({ userId }).select('_id').lean();
  const subjectIds = subjects.map((subject) => subject._id);
  const visibilityClauses = [{ assignedTo: userId }];

  if (subjectIds.length > 0) {
    visibilityClauses.push({
      $and: [
        { subjectId: { $in: subjectIds } },
        {
          $or: [
            { assignedTo: { $exists: false } },
            { assignedTo: { $size: 0 } },
          ],
        },
      ],
    });
  }

  const query = {
    $or: visibilityClauses,
  };

  if (subjectId) {
    query.subjectId = subjectId;
  }

  return query;
}

async function buildQuizQuery(request, currentUser, userId) {
  const subjectId = readSearchFilter(request, ['subjectId']);
  const assignedStudentId = readSearchFilter(request, [
    'assignedStudentId',
    'studentId',
    'assignedTo',
  ]);

  if (subjectId && !isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  if (assignedStudentId && !isValidObjectId(assignedStudentId)) {
    throw new Error('Assigned student ID is invalid');
  }

  if (currentUser.role === 'student') {
    return buildStudentQuizQuery(userId, subjectId, assignedStudentId);
  }

  if (currentUser.role === 'mentor') {
    const query = { createdBy: userId };

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (assignedStudentId) {
      query.assignedTo = assignedStudentId;
    }

    return query;
  }

  if (currentUser.role === 'admin') {
    const query = {};

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (assignedStudentId) {
      query.assignedTo = assignedStudentId;
    }

    return query;
  }

  throw new Error('Forbidden');
}

export async function GET(request) {
  try {
    const currentUser = await requireAuth();
    const userId = getUserId(currentUser);

    await connectDB();

    const query = await buildQuizQuery(request, currentUser, userId);
    const quizzes = await Quiz.find(query)
      .populate({ path: 'subjectId', select: 'name' })
      .populate({ path: 'createdBy', select: 'name role' })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        quizzes: serializeQuizzes(quizzes, {
          forStudent: currentUser.role === 'student',
          currentStudentId: currentUser.role === 'student' ? userId : null,
        }),
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
    const userId = getUserId(currentUser);

    ensureQuizManager(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const quizData = await buildCreatePayload(body, currentUser, userId);
    const createdQuiz = await Quiz.create(quizData);
    const quiz = await Quiz.findById(createdQuiz._id)
      .populate({ path: 'subjectId', select: 'name' })
      .populate({ path: 'createdBy', select: 'name role' })
      .lean();

    return NextResponse.json(
      {
        message: 'Quiz created successfully',
        quiz: serializeQuiz(quiz),
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
