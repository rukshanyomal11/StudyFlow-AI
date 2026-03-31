import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Quiz from '@/models/Quiz';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const quizManagerRoles = new Set(['mentor', 'admin']);

function createErrorResponse(error) {
  console.error('Quiz detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'Quiz not found') {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (
      error.message === 'Quiz ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one quiz field is required' ||
      error.message === 'Subject ID is required' ||
      error.message === 'Subject ID is invalid' ||
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
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}

function ensureQuizManager(user) {
  if (!quizManagerRoles.has(user.role)) {
    throw new Error('Forbidden');
  }
}

function canManageQuiz(user, quiz) {
  return user.role === 'admin' || String(quiz.createdBy) === String(user.id);
}

function sanitizeQuizForStudent(quiz) {
  return {
    ...quiz,
    questions: quiz.questions.map((question) => ({
      question: question.question,
      options: question.options,
    })),
  };
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function normalizeQuestion(question) {
  if (!question || typeof question !== 'object' || Array.isArray(question)) {
    throw new Error('Questions must be a non-empty array');
  }

  const questionText =
    typeof question.question === 'string' ? question.question.trim() : '';

  if (!questionText) {
    throw new Error('Question text is required');
  }

  if (!Array.isArray(question.options) || question.options.length < 2) {
    throw new Error('Each question must include at least two options');
  }

  const options = question.options.map((option) => {
    const optionText = typeof option === 'string' ? option.trim() : '';

    if (!optionText) {
      throw new Error('Each option must be a non-empty string');
    }

    return optionText;
  });

  const correctAnswer =
    typeof question.correctAnswer === 'number'
      ? question.correctAnswer
      : Number(question.correctAnswer);

  if (
    !Number.isInteger(correctAnswer) ||
    correctAnswer < 0 ||
    correctAnswer >= options.length
  ) {
    throw new Error('Correct answer must be a valid option index');
  }

  if (
    question.explanation !== undefined &&
    question.explanation !== null &&
    typeof question.explanation !== 'string'
  ) {
    throw new Error('Explanation must be a string');
  }

  return {
    question: questionText,
    options,
    correctAnswer,
    explanation:
      typeof question.explanation === 'string'
        ? question.explanation.trim()
        : '',
  };
}

function normalizeQuestions(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('Questions must be a non-empty array');
  }

  return value.map((question) => normalizeQuestion(question));
}

async function getQuizId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('Quiz ID is invalid');
  }

  return id;
}

function buildUpdatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const updates = {};

  if ('subjectId' in body) {
    const subjectId =
      typeof body.subjectId === 'string' ? body.subjectId.trim() : '';

    if (!subjectId) {
      throw new Error('Subject ID is required');
    }

    if (!isValidObjectId(subjectId)) {
      throw new Error('Subject ID is invalid');
    }

    updates.subjectId = subjectId;
  }

  if ('title' in body) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';

    if (!title) {
      throw new Error('Quiz title is required');
    }

    updates.title = title;
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

  if ('questions' in body) {
    updates.questions = normalizeQuestions(body.questions);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one quiz field is required');
  }

  return updates;
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    const quizId = await getQuizId(context);

    await connectDB();

    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const responseQuiz =
      currentUser.role === 'student' ? sanitizeQuizForStudent(quiz) : quiz;

    return NextResponse.json({ quiz: responseQuiz }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const currentUser = await requireAuth();
    ensureQuizManager(currentUser);

    const quizId = await getQuizId(context);

    await connectDB();

    const existingQuiz = await Quiz.findById(quizId);

    if (!existingQuiz) {
      throw new Error('Quiz not found');
    }

    if (!canManageQuiz(currentUser, existingQuiz)) {
      throw new Error('Forbidden');
    }

    const body = await readJsonBody(request);
    const updates = buildUpdatePayload(body);
    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    return NextResponse.json(
      {
        message: 'Quiz updated successfully',
        quiz,
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
    ensureQuizManager(currentUser);

    const quizId = await getQuizId(context);

    await connectDB();

    const existingQuiz = await Quiz.findById(quizId);

    if (!existingQuiz) {
      throw new Error('Quiz not found');
    }

    if (!canManageQuiz(currentUser, existingQuiz)) {
      throw new Error('Forbidden');
    }

    await Quiz.findByIdAndDelete(quizId);

    return NextResponse.json(
      { message: 'Quiz deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
