import { NextResponse } from 'next/server';
import StudySession from '@/models/StudySession';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Progress streak API error:', error);

  if (error instanceof Error && error.message === 'Unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}

function toDateKey(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function diffInDays(firstDateKey, secondDateKey) {
  const firstDate = new Date(`${firstDateKey}T00:00:00`);
  const secondDate = new Date(`${secondDateKey}T00:00:00`);
  return Math.round(
    (secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function calculateCurrentStreak(activeDateSet) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = toDateKey(today);
  const yesterday = addDays(today, -1);
  const yesterdayKey = toDateKey(yesterday);

  let checkDate = null;

  if (activeDateSet.has(todayKey)) {
    checkDate = today;
  } else if (activeDateSet.has(yesterdayKey)) {
    checkDate = yesterday;
  }

  if (!checkDate) {
    return 0;
  }

  let streak = 0;
  let checkKey = toDateKey(checkDate);

  while (activeDateSet.has(checkKey)) {
    streak += 1;
    checkDate = addDays(checkDate, -1);
    checkKey = toDateKey(checkDate);
  }

  return streak;
}

function calculateLongestStreak(sortedDateKeys) {
  if (!sortedDateKeys.length) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let index = 1; index < sortedDateKeys.length; index += 1) {
    const previousDateKey = sortedDateKeys[index - 1];
    const currentDateKey = sortedDateKeys[index];

    if (diffInDays(previousDateKey, currentDateKey) === 1) {
      current += 1;
      if (current > longest) {
        longest = current;
      }
    } else {
      current = 1;
    }
  }

  return longest;
}

export async function GET() {
  try {
    const currentUser = await requireAuth();

    await connectDB();

    const sessions = await StudySession.find({ userId: currentUser.id })
      .select('startTime createdAt')
      .sort({ startTime: -1, createdAt: -1 })
      .lean();

    const uniqueDateKeys = [
      ...new Set(
        sessions.map((session) => toDateKey(session.startTime || session.createdAt)),
      ),
    ].sort();

    const activeDateSet = new Set(uniqueDateKeys);
    const currentStreak = calculateCurrentStreak(activeDateSet);
    const longestStreak = calculateLongestStreak(uniqueDateKeys);
    const lastStudyDate = uniqueDateKeys.length
      ? uniqueDateKeys[uniqueDateKeys.length - 1]
      : null;

    return NextResponse.json(
      {
        streak: {
          current: currentStreak,
          longest: longestStreak,
          activeDays: uniqueDateKeys.length,
          lastStudyDate,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
