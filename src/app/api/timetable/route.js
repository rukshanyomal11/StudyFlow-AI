import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import Subject from '@/models/Subject';
import Timetable from '@/models/Timetable';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const VALID_DAYS = new Set(DAY_ORDER);
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function createErrorResponse(error) {
  console.error('Timetable API error:', error);

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

    if (
      error.message === 'Invalid JSON body' ||
      error.message ===
        'Request body must be a timetable array, a timetable object, or a single day object' ||
      error.message === 'Timetable day is required' ||
      error.message === 'Timetable day is invalid' ||
      error.message === 'Duplicate days are not allowed in timetable payload' ||
      error.message === 'Slots must be an array' ||
      error.message === 'Subject ID is required' ||
      error.message === 'Subject ID is invalid' ||
      error.message === 'Slot title is required' ||
      error.message === 'Start time is required' ||
      error.message === 'End time is required' ||
      error.message === 'Start time must use HH:MM 24-hour format' ||
      error.message === 'End time must use HH:MM 24-hour format' ||
      error.message === 'End time must be later than start time' ||
      error.message === 'Timetable slots cannot overlap within the same day'
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

async function requireStudentUser() {
  const currentUser = await requireAuth();

  if (currentUser.role && currentUser.role !== 'student') {
    throw new Error('Forbidden');
  }

  return currentUser;
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function sortTimetableEntries(entries) {
  return [...entries]
    .sort((first, second) => DAY_ORDER.indexOf(first.day) - DAY_ORDER.indexOf(second.day))
    .map((entry) => ({
      ...entry,
      slots: [...entry.slots].sort((first, second) =>
        first.startTime.localeCompare(second.startTime),
      ),
    }));
}

function getRawEntries(body) {
  if (Array.isArray(body)) {
    return body;
  }

  if (body && typeof body === 'object' && Array.isArray(body.timetable)) {
    return body.timetable;
  }

  if (body && typeof body === 'object' && typeof body.day === 'string') {
    return [body];
  }

  throw new Error(
    'Request body must be a timetable array, a timetable object, or a single day object',
  );
}

function normalizeSlot(slot) {
  if (!slot || typeof slot !== 'object' || Array.isArray(slot)) {
    throw new Error('Slots must be an array');
  }

  const subjectId =
    typeof slot.subjectId === 'string' ? slot.subjectId.trim() : '';
  const title = typeof slot.title === 'string' ? slot.title.trim() : '';
  const startTime =
    typeof slot.startTime === 'string' ? slot.startTime.trim() : '';
  const endTime = typeof slot.endTime === 'string' ? slot.endTime.trim() : '';

  if (!subjectId) {
    throw new Error('Subject ID is required');
  }

  if (!isValidObjectId(subjectId)) {
    throw new Error('Subject ID is invalid');
  }

  if (!title) {
    throw new Error('Slot title is required');
  }

  if (!startTime) {
    throw new Error('Start time is required');
  }

  if (!endTime) {
    throw new Error('End time is required');
  }

  if (!TIME_PATTERN.test(startTime)) {
    throw new Error('Start time must use HH:MM 24-hour format');
  }

  if (!TIME_PATTERN.test(endTime)) {
    throw new Error('End time must use HH:MM 24-hour format');
  }

  if (endTime <= startTime) {
    throw new Error('End time must be later than start time');
  }

  return {
    subjectId,
    title,
    startTime,
    endTime,
  };
}

function normalizeTimetableEntries(body) {
  const rawEntries = getRawEntries(body);
  const seenDays = new Set();

  return sortTimetableEntries(
    rawEntries.map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new Error(
          'Request body must be a timetable array, a timetable object, or a single day object',
        );
      }

      const day = typeof entry.day === 'string' ? entry.day.trim() : '';

      if (!day) {
        throw new Error('Timetable day is required');
      }

      if (!VALID_DAYS.has(day)) {
        throw new Error('Timetable day is invalid');
      }

      if (seenDays.has(day)) {
        throw new Error('Duplicate days are not allowed in timetable payload');
      }

      seenDays.add(day);

      if (!Array.isArray(entry.slots)) {
        throw new Error('Slots must be an array');
      }

      const slots = [...entry.slots]
        .map((slot) => normalizeSlot(slot))
        .sort((first, second) => first.startTime.localeCompare(second.startTime));

      for (let index = 1; index < slots.length; index += 1) {
        if (slots[index - 1].endTime > slots[index].startTime) {
          throw new Error('Timetable slots cannot overlap within the same day');
        }
      }

      return {
        day,
        slots,
      };
    }),
  );
}

async function ensureOwnedSubjects(entries, userId) {
  const subjectIds = [
    ...new Set(
      entries.flatMap((entry) => entry.slots.map((slot) => slot.subjectId)),
    ),
  ];

  if (!subjectIds.length) {
    return;
  }

  const subjects = await Subject.find({
    _id: { $in: subjectIds },
    userId,
  })
    .select('_id')
    .lean();

  if (subjects.length !== subjectIds.length) {
    throw new Error('Subject not found');
  }
}

async function replaceTimetable(entries, userId) {
  await Timetable.deleteMany({ userId });

  if (!entries.length) {
    return [];
  }

  const createdEntries = await Timetable.insertMany(
    entries.map((entry) => ({
      userId,
      day: entry.day,
      slots: entry.slots,
    })),
  );

  return sortTimetableEntries(
    createdEntries.map((entry) => entry.toObject()),
  );
}

export async function GET() {
  try {
    const currentUser = await requireStudentUser();

    await connectDB();

    const timetable = sortTimetableEntries(
      await Timetable.find({ userId: currentUser.id }).lean(),
    );

    return NextResponse.json({ timetable }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireStudentUser();

    await connectDB();

    const body = await readJsonBody(request);
    const entries = normalizeTimetableEntries(body);
    const existingTimetable = await Timetable.exists({ userId: currentUser.id });

    await ensureOwnedSubjects(entries, currentUser.id);

    const timetable = await replaceTimetable(entries, currentUser.id);

    return NextResponse.json(
      {
        message: existingTimetable
          ? 'Timetable saved successfully'
          : 'Timetable created successfully',
        timetable,
      },
      { status: existingTimetable ? 200 : 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request) {
  try {
    const currentUser = await requireStudentUser();

    await connectDB();

    const body = await readJsonBody(request);
    const entries = normalizeTimetableEntries(body);

    await ensureOwnedSubjects(entries, currentUser.id);

    const timetable = await replaceTimetable(entries, currentUser.id);

    return NextResponse.json(
      {
        message: 'Timetable updated successfully',
        timetable,
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
