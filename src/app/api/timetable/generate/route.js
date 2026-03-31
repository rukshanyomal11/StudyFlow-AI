import { NextResponse } from 'next/server';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOT_TEMPLATES = [
  { startTime: '07:30', endTime: '09:00' },
  { startTime: '09:30', endTime: '11:00' },
  { startTime: '15:00', endTime: '16:30' },
  { startTime: '18:00', endTime: '19:30' },
];

function createErrorResponse(error) {
  console.error('Timetable generation API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'No subjects found to generate timetable') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}

async function requireStudentUser() {
  const currentUser = await requireAuth();

  if (currentUser.role && currentUser.role !== 'student') {
    throw new Error('Forbidden');
  }

  return currentUser;
}

function getDaysUntilExam(examDate) {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const exam = new Date(examDate);
  const examStart = new Date(
    exam.getFullYear(),
    exam.getMonth(),
    exam.getDate(),
  );

  return Math.ceil(
    (examStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getPriorityWeight(priority) {
  if (priority === 'high') {
    return 6;
  }

  if (priority === 'medium') {
    return 4;
  }

  return 2;
}

function getUrgencyWeight(daysUntilExam) {
  if (daysUntilExam <= 0) {
    return 6;
  }

  if (daysUntilExam <= 7) {
    return 5;
  }

  if (daysUntilExam <= 14) {
    return 4;
  }

  if (daysUntilExam <= 30) {
    return 3;
  }

  if (daysUntilExam <= 60) {
    return 2;
  }

  return 1;
}

function getProgressWeight(progress) {
  if (progress < 25) {
    return 4;
  }

  if (progress < 50) {
    return 3;
  }

  if (progress < 75) {
    return 2;
  }

  return 1;
}

function buildSessionTitle(subject, daysUntilExam) {
  if (daysUntilExam <= 7) {
    return `${subject.name} Exam Prep`;
  }

  if (subject.priority === 'high') {
    return `${subject.name} Priority Review`;
  }

  if (subject.progress < 50) {
    return `${subject.name} Deep Revision`;
  }

  return `${subject.name} Study Session`;
}

function buildWeightedSubjectPlan(subjects, totalSlots) {
  const rankedSubjects = subjects.map((subject) => {
    const daysUntilExam = getDaysUntilExam(subject.examDate);
    const score =
      getPriorityWeight(subject.priority) +
      getUrgencyWeight(daysUntilExam) +
      getProgressWeight(subject.progress ?? 0);

    return {
      subject,
      daysUntilExam,
      score,
      assignedCount: 0,
    };
  });

  const plan = [];

  for (let index = 0; index < totalSlots; index += 1) {
    let bestCandidate = null;

    for (const candidate of rankedSubjects) {
      let candidateScore = candidate.score / (candidate.assignedCount + 1);

      if (
        plan.length &&
        rankedSubjects.length > 1 &&
        String(plan[plan.length - 1].subject._id) === String(candidate.subject._id)
      ) {
        candidateScore *= 0.65;
      }

      if (
        !bestCandidate ||
        candidateScore > bestCandidate.candidateScore ||
        (candidateScore === bestCandidate.candidateScore &&
          candidate.daysUntilExam < bestCandidate.daysUntilExam)
      ) {
        bestCandidate = {
          ...candidate,
          candidateScore,
        };
      }
    }

    if (!bestCandidate) {
      break;
    }

    plan.push({
      subject: bestCandidate.subject,
      daysUntilExam: bestCandidate.daysUntilExam,
    });

    const matchedSubject = rankedSubjects.find(
      (candidate) =>
        String(candidate.subject._id) === String(bestCandidate.subject._id),
    );

    if (matchedSubject) {
      matchedSubject.assignedCount += 1;
    }
  }

  return plan;
}

export async function POST() {
  try {
    const currentUser = await requireStudentUser();

    await connectDB();

    const subjects = await Subject.find({ userId: currentUser.id })
      .sort({ priority: 1, examDate: 1, createdAt: -1 })
      .lean();

    if (!subjects.length) {
      throw new Error('No subjects found to generate timetable');
    }

    const totalSlots = WEEK_DAYS.length * SLOT_TEMPLATES.length;
    const plan = buildWeightedSubjectPlan(subjects, totalSlots);

    const timetable = WEEK_DAYS.map((day, dayIndex) => ({
      day,
      slots: SLOT_TEMPLATES.map((slot, slotIndex) => {
        const plannedSubject = plan[dayIndex * SLOT_TEMPLATES.length + slotIndex];

        return {
          subjectId: plannedSubject.subject._id,
          title: buildSessionTitle(
            plannedSubject.subject,
            plannedSubject.daysUntilExam,
          ),
          startTime: slot.startTime,
          endTime: slot.endTime,
        };
      }),
    }));

    return NextResponse.json(
      {
        message: 'Timetable generated successfully',
        timetable,
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
