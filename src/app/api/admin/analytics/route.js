import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import QuizResult from '@/models/QuizResult';
import StudySession from '@/models/StudySession';
import Subject from '@/models/Subject';
import User from '@/models/User';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Admin analytics API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}

function ensureAdmin(user) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
}

function getFacetCount(result, key) {
  return result[0]?.[key]?.[0]?.count ?? 0;
}

function getAggregateCount(result) {
  return result[0]?.count ?? 0;
}

async function getUserAnalytics() {
  const [result] = await User.aggregate([
    {
      $facet: {
        totalUsers: [{ $count: 'count' }],
        totalStudents: [
          { $match: { role: 'student' } },
          { $count: 'count' },
        ],
        totalMentors: [
          { $match: { role: 'mentor' } },
          { $count: 'count' },
        ],
        activeUsers: [
          { $match: { isActive: true } },
          { $count: 'count' },
        ],
      },
    },
  ]);

  return {
    totalUsers: getFacetCount([result], 'totalUsers'),
    totalStudents: getFacetCount([result], 'totalStudents'),
    totalMentors: getFacetCount([result], 'totalMentors'),
    activeUsers: getFacetCount([result], 'activeUsers'),
  };
}

async function getMostPopularSubject() {
  const results = await StudySession.aggregate([
    {
      $group: {
        _id: '$subjectId',
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
      },
    },
    {
      $sort: {
        totalSessions: -1,
        totalDuration: -1,
      },
    },
    { $limit: 1 },
    {
      $lookup: {
        from: Subject.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'subject',
      },
    },
    {
      $unwind: {
        path: '$subject',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        subjectId: '$_id',
        name: '$subject.name',
        totalSessions: 1,
        totalDuration: 1,
      },
    },
  ]);

  if (!results.length) {
    return null;
  }

  const subject = results[0];

  return {
    subjectId: subject.subjectId,
    name: subject.name || 'Unknown Subject',
    totalSessions: subject.totalSessions,
    totalDuration: subject.totalDuration,
  };
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const [
      userAnalytics,
      studySessionCountResult,
      quizzesCompletedCountResult,
      mostPopularSubject,
    ] = await Promise.all([
      getUserAnalytics(),
      StudySession.aggregate([{ $count: 'count' }]),
      QuizResult.aggregate([{ $count: 'count' }]),
      getMostPopularSubject(),
    ]);

    const totalStudySessions = getAggregateCount(studySessionCountResult);
    const totalQuizzesCompleted = getAggregateCount(quizzesCompletedCountResult);

    return NextResponse.json(
      {
        analytics: {
          totalUsers: userAnalytics.totalUsers,
          totalStudents: userAnalytics.totalStudents,
          totalMentors: userAnalytics.totalMentors,
          activeUsers: userAnalytics.activeUsers,
          totalStudySessions,
          totalQuizzesCompleted,
          mostPopularSubject,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
