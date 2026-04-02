import { isValidObjectId } from 'mongoose';

export const quizManagerRoles = new Set(['mentor', 'admin']);

export function stringifyId(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    if ('_id' in value) {
      return stringifyId(value._id);
    }

    if ('id' in value) {
      return stringifyId(value.id);
    }
  }

  return String(value);
}

function getRelatedName(value) {
  if (!value || typeof value !== 'object') {
    return '';
  }

  return typeof value.name === 'string' ? value.name : '';
}

export function getUserId(user) {
  const userId =
    user && typeof user.id === 'string' ? user.id.trim() : '';

  if (!userId || !isValidObjectId(userId)) {
    throw new Error('Unauthorized');
  }

  return userId;
}

export function ensureQuizManager(user) {
  if (!user || !quizManagerRoles.has(user.role)) {
    throw new Error('Forbidden');
  }
}

export function normalizeQuestion(question) {
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

export function normalizeQuestions(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('Questions must be a non-empty array');
  }

  return value.map((question) => normalizeQuestion(question));
}

export function normalizeAssignedTo(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('Assigned students must be an array');
  }

  const seen = new Set();
  const assignedTo = [];

  value.forEach((entry) => {
    const studentId =
      typeof entry === 'string'
        ? entry.trim()
        : entry &&
            typeof entry === 'object' &&
            typeof entry.id === 'string'
          ? entry.id.trim()
          : entry &&
              typeof entry === 'object' &&
              typeof entry._id === 'string'
            ? entry._id.trim()
            : '';

    if (!studentId || !isValidObjectId(studentId)) {
      throw new Error('Assigned student ID is invalid');
    }

    if (!seen.has(studentId)) {
      seen.add(studentId);
      assignedTo.push(studentId);
    }
  });

  return assignedTo;
}

export function getAssignedStudentIds(quiz) {
  if (!Array.isArray(quiz?.assignedTo)) {
    return [];
  }

  return quiz.assignedTo
    .map((student) => stringifyId(student))
    .filter(Boolean);
}

export function isQuizVisibleToStudent(quiz, studentId, studentSubjectIds) {
  const assignedStudentIds = getAssignedStudentIds(quiz);

  if (assignedStudentIds.length > 0) {
    return assignedStudentIds.includes(studentId);
  }

  const quizSubjectId = stringifyId(quiz.subjectId);

  return Boolean(quizSubjectId && studentSubjectIds.has(quizSubjectId));
}

export function serializeQuiz(
  quiz,
  { forStudent = false, currentStudentId = null } = {},
) {
  const quizId = stringifyId(quiz._id);
  const subjectId = stringifyId(quiz.subjectId);
  const createdById = stringifyId(quiz.createdBy);
  const assignedTo = getAssignedStudentIds(quiz);
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

  return {
    id: quizId,
    createdBy: createdById,
    createdByName: getRelatedName(quiz.createdBy),
    subjectId,
    subjectName: getRelatedName(quiz.subjectId),
    title: typeof quiz.title === 'string' ? quiz.title : '',
    description: typeof quiz.description === 'string' ? quiz.description : '',
    assignedTo: forStudent ? undefined : assignedTo,
    assignedToCount: assignedTo.length,
    isAssignedToCurrentStudent:
      currentStudentId ? assignedTo.includes(currentStudentId) : false,
    questionCount: questions.length,
    questions: questions.map((question, index) => ({
      id: `${quizId || 'quiz'}-question-${index + 1}`,
      prompt: typeof question.question === 'string' ? question.question : '',
      options: Array.isArray(question.options) ? question.options : [],
      ...(forStudent
        ? {}
        : {
            correctAnswer:
              typeof question.correctAnswer === 'number'
                ? question.correctAnswer
                : 0,
            explanation:
              typeof question.explanation === 'string'
                ? question.explanation
                : '',
          }),
    })),
    createdAt: quiz.createdAt
      ? new Date(quiz.createdAt).toISOString()
      : null,
    updatedAt: quiz.updatedAt
      ? new Date(quiz.updatedAt).toISOString()
      : null,
  };
}

export function serializeQuizzes(quizzes, options) {
  return quizzes.map((quiz) => serializeQuiz(quiz, options));
}
