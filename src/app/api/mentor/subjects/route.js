import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import MentorStudent from '@/models/MentorStudent';
import Subject from '@/models/Subject';
import User from '@/models/User';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Mentor subjects API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      error.message === 'Mentor ID is required for admin requests' ||
      error.message === 'Mentor ID is invalid'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === 'Mentor not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
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

async function resolveMentorId(request, currentUser) {
  if (currentUser.role === 'mentor') {
    return currentUser.id;
  }

  const mentorId = request.nextUrl.searchParams.get('mentorId')?.trim() || '';

  if (!mentorId) {
    throw new Error('Mentor ID is required for admin requests');
  }

  if (!isValidObjectId(mentorId)) {
    throw new Error('Mentor ID is invalid');
  }

  const mentor = await User.findOne({ _id: mentorId, role: 'mentor' })
    .select('_id')
    .lean();

  if (!mentor) {
    throw new Error('Mentor not found');
  }

  return mentorId;
}

export async function GET(request) {
  try {
    const currentUser = await requireAuth();
    ensureMentorAccess(currentUser);

    await connectDB();

    const mentorId = await resolveMentorId(request, currentUser);
    const assignments = await MentorStudent.find({
      mentorId,
      subjectId: { $ne: null },
    })
      .populate({
        path: 'subjectId',
        select: 'name progress examDate userId',
      })
      .populate({
        path: 'studentId',
        select: 'name email level avatar',
      })
      .sort({ createdAt: -1 })
      .lean();

    const seenSubjects = new Set();
    const subjects = assignments
      .map((assignment) => {
        const subject = assignment.subjectId;
        const student = assignment.studentId;

        if (!subject || !student) {
          return null;
        }

        const subjectId = String(subject._id);

        if (seenSubjects.has(subjectId)) {
          return null;
        }

        seenSubjects.add(subjectId);

        return {
          id: subjectId,
          name: subject.name,
          progress:
            typeof subject.progress === 'number' ? subject.progress : null,
          examDate: subject.examDate ?? null,
          studentId: String(student._id),
          studentName: student.name,
          studentEmail: student.email,
          level: student.level ?? null,
        };
      })
      .filter(Boolean)
      .sort((first, second) => {
        const byName = first.name.localeCompare(second.name);
        return byName === 0
          ? first.studentName.localeCompare(second.studentName)
          : byName;
      });

    return NextResponse.json({ mentorId, subjects }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
