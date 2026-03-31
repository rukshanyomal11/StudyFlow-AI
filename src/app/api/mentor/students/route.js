import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import MentorStudent from '@/models/MentorStudent';
import User from '@/models/User';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

function createErrorResponse(error) {
  console.error('Mentor students API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'Mentor ID is required for admin requests') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === 'Mentor ID is invalid') {
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
    .select('_id name email role avatar')
    .lean();

  if (!mentor) {
    throw new Error('Mentor not found');
  }

  return mentorId;
}

function buildGroupedStudentResponse(assignments) {
  const groupedStudents = new Map();

  for (const assignment of assignments) {
    const student = assignment.studentId;

    if (!student) {
      continue;
    }

    const studentKey = String(student._id);

    if (!groupedStudents.has(studentKey)) {
      groupedStudents.set(studentKey, {
        studentId: studentKey,
        name: student.name,
        email: student.email,
        avatar: student.avatar ?? null,
        level: student.level ?? null,
        assignments: [],
      });
    }

    groupedStudents.get(studentKey).assignments.push({
      assignmentId: String(assignment._id),
      subject: assignment.subjectId
        ? {
            subjectId: String(assignment.subjectId._id),
            name: assignment.subjectId.name,
          }
        : null,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    });
  }

  return Array.from(groupedStudents.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

export async function GET(request) {
  try {
    const currentUser = await requireAuth();
    ensureMentorAccess(currentUser);

    await connectDB();

    const mentorId = await resolveMentorId(request, currentUser);
    const assignments = await MentorStudent.find({ mentorId })
      .populate({
        path: 'studentId',
        select: 'name email role avatar level',
        match: { role: 'student' },
      })
      .populate({
        path: 'subjectId',
        select: 'name',
      })
      .sort({ createdAt: -1 })
      .lean();

    const students = buildGroupedStudentResponse(assignments);

    return NextResponse.json(
      {
        mentorId,
        totalStudents: students.length,
        totalAssignments: assignments.length,
        students,
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
