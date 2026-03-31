import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Quiz from '@/models/Quiz';
import QuizResult from '@/models/QuizResult';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Quiz submission API error:', error);

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
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Quiz ID is required' ||
      error.message === 'Quiz ID is invalid' ||
      error.message === 'Answers must be a non-empty array' ||
      error.message === 'Each answer must include a valid question index' ||
      error.message === 'Each answer must include a valid selected option index'
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

function ensureStudent(user) {
  if (user.role !== 'student') {
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

function normalizeAnswers(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('Answers must be a non-empty array');
  }

  return value.map((answer, index) => {
    if (typeof answer === 'number' || typeof answer === 'string') {
      const selectedAnswer = Number(answer);

      if (!Number.isInteger(selectedAnswer) || selectedAnswer < 0) {
        throw new Error('Each answer must include a valid selected option index');
      }

      return {
        questionIndex: index,
        selectedAnswer,
      };
    }

    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
      throw new Error('Answers must be a non-empty array');
    }

    const questionIndex = Number(answer.questionIndex);
    const selectedAnswer = Number(answer.selectedAnswer);

    if (!Number.isInteger(questionIndex) || questionIndex < 0) {
      throw new Error('Each answer must include a valid question index');
    }

    if (!Number.isInteger(selectedAnswer) || selectedAnswer < 0) {
      throw new Error('Each answer must include a valid selected option index');
    }

    return {
      questionIndex,
      selectedAnswer,
    };
  });
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();
    ensureStudent(currentUser);

    await connectDB();

    const body = await readJsonBody(request);

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Request body must be a JSON object');
    }

    const quizId = typeof body.quizId === 'string' ? body.quizId.trim() : '';

    if (!quizId) {
      throw new Error('Quiz ID is required');
    }

    if (!isValidObjectId(quizId)) {
      throw new Error('Quiz ID is invalid');
    }

    const normalizedAnswers = normalizeAnswers(body.answers);
    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const answerMap = new Map(
      normalizedAnswers.map((answer) => [answer.questionIndex, answer.selectedAnswer]),
    );

    let correctAnswers = 0;
    let wrongAnswers = 0;
    const weakTopics = [];

    quiz.questions.forEach((question, index) => {
      const selectedAnswer = answerMap.get(index);

      if (selectedAnswer === question.correctAnswer) {
        correctAnswers += 1;
        return;
      }

      wrongAnswers += 1;
      weakTopics.push(question.question);
    });

    const score = quiz.questions.length
      ? Math.round((correctAnswers / quiz.questions.length) * 100)
      : 0;

    const result = await QuizResult.create({
      userId: currentUser.id,
      quizId: quiz._id,
      score,
      correctAnswers,
      wrongAnswers,
      weakTopics: [...new Set(weakTopics)],
      submittedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: 'Quiz submitted successfully',
        result: result.toObject(),
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
