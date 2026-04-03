import { NextResponse } from 'next/server';
import Announcement from '@/models/Announcement';
import MentorStudent from '@/models/MentorStudent';
import Subject from '@/models/Subject';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';
import {
  ANNOUNCEMENT_AUDIENCE_TYPES,
  extractObjectId,
  isAnnouncementPublished,
  normalizeAnnouncementAudienceType,
  normalizeAnnouncementKey,
  serializeAnnouncement,
} from '@/lib/announcement-utils';

export const runtime = 'nodejs';

function createErrorResponse(error) {
  console.error('Student announcements API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      error.message ===
      `Audience type must be one of: ${ANNOUNCEMENT_AUDIENCE_TYPES.join(', ')}`
    ) {
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

async function buildStudentContext(studentId) {
  const [studentSubjects, mentorAssignments] = await Promise.all([
    Subject.find({ userId: studentId }).select('_id name').lean(),
    MentorStudent.find({ studentId }).select('_id mentorId subjectId').lean(),
  ]);

  const subjectIds = new Set();
  const subjectKeys = new Set();
  const mentorIds = new Set();

  for (const subject of studentSubjects) {
    const subjectId = extractObjectId(subject?._id);
    const subjectKey = normalizeAnnouncementKey(subject?.name);

    if (subjectId) {
      subjectIds.add(subjectId);
    }

    if (subjectKey) {
      subjectKeys.add(subjectKey);
    }
  }

  for (const assignment of mentorAssignments) {
    const mentorId = extractObjectId(assignment?.mentorId);
    const subjectId = extractObjectId(assignment?.subjectId);

    if (mentorId) {
      mentorIds.add(mentorId);
    }

    if (subjectId) {
      subjectIds.add(subjectId);
    }
  }

  return {
    mentorIds,
    studentId,
    subjectIds,
    subjectKeys,
  };
}

function matchesGroupTarget(targetId, context) {
  if (!targetId) {
    return false;
  }

  if (context.subjectIds.has(targetId)) {
    return true;
  }

  const normalizedTarget = normalizeAnnouncementKey(targetId);

  if (!normalizedTarget) {
    return false;
  }

  for (const subjectKey of context.subjectKeys) {
    if (
      normalizedTarget === subjectKey ||
      normalizedTarget.includes(subjectKey) ||
      subjectKey.includes(normalizedTarget)
    ) {
      return true;
    }
  }

  return false;
}

function isAnnouncementRelevantToStudent(announcement, context) {
  const mentorId = extractObjectId(announcement?.mentorId);

  if (!mentorId || !context.mentorIds.has(mentorId)) {
    return false;
  }

  if (!isAnnouncementPublished(announcement)) {
    return false;
  }

  if (
    context.filterAudienceType &&
    announcement.audienceType !== context.filterAudienceType
  ) {
    return false;
  }

  if (announcement.audienceType === 'all_assigned_students') {
    return true;
  }

  if (announcement.audienceType === 'students') {
    return announcement.targetIds.includes(context.studentId);
  }

  return announcement.targetIds.some((targetId) =>
    matchesGroupTarget(targetId, context),
  );
}

export async function GET(request) {
  try {
    const currentUser = await requireAuth();
    ensureStudentAccess(currentUser);

    await connectDB();

    const audienceTypeParam =
      request.nextUrl.searchParams.get('audienceType')?.trim() || '';
    const filterAudienceType = audienceTypeParam
      ? normalizeAnnouncementAudienceType(audienceTypeParam)
      : null;

    if (audienceTypeParam && !filterAudienceType) {
      throw new Error(
        `Audience type must be one of: ${ANNOUNCEMENT_AUDIENCE_TYPES.join(', ')}`,
      );
    }

    const limitParam = Number.parseInt(
      request.nextUrl.searchParams.get('limit') || '',
      10,
    );
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : null;

    const context = await buildStudentContext(currentUser.id);

    if (!context.mentorIds.size) {
      return NextResponse.json({ announcements: [] }, { status: 200 });
    }

    const announcements = await Announcement.find({
      mentorId: { $in: Array.from(context.mentorIds) },
      status: { $in: ['Sent', 'Scheduled'] },
    })
      .populate({
        path: 'mentorId',
        select: 'name email role',
      })
      .sort({ scheduledAt: -1, createdAt: -1 })
      .lean();

    const visibleAnnouncements = announcements
      .map((announcement) => {
        const serializedAnnouncement = serializeAnnouncement(announcement);

        if (serializedAnnouncement.status === 'Scheduled') {
          return {
            ...serializedAnnouncement,
            status: 'Sent',
          };
        }

        return serializedAnnouncement;
      })
      .filter((announcement) =>
        isAnnouncementRelevantToStudent(announcement, {
          ...context,
          filterAudienceType,
        }),
      );

    return NextResponse.json(
      {
        announcements: limit ? visibleAnnouncements.slice(0, limit) : visibleAnnouncements,
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
