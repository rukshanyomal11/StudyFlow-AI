import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Report from '@/models/Report';
import { requireAuth } from '@/lib/getSession';

const typeAliases = new Map([
  ['community', 'Community'],
  ['content', 'Content'],
  ['billing', 'Billing'],
  ['safety', 'Safety'],
  ['academic', 'Academic'],
]);
const priorityAliases = new Map([
  ['low', 'Low'],
  ['medium', 'Medium'],
  ['high', 'High'],
  ['critical', 'Critical'],
]);

function createErrorResponse(error) {
  console.error('Admin reports API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'Report type must be one of: Community, Content, Billing, Safety, Academic' ||
      error.message === 'Report title is required' ||
      error.message === 'Report description is required' ||
      error.message === 'Target ID must be a non-empty string' ||
      error.message === 'Priority must be one of: Low, Medium, High, Critical'
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

function ensureAdmin(user) {
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
}

function ensureCanCreateReport(user) {
  if (user.role !== 'student' && user.role !== 'mentor') {
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

function normalizeType(value) {
  if (typeof value !== 'string') {
    return null;
  }

  return typeAliases.get(value.trim().toLowerCase()) || null;
}

function normalizePriority(value) {
  if (typeof value !== 'string') {
    return null;
  }

  return priorityAliases.get(value.trim().toLowerCase()) || null;
}

function normalizeTargetId(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error('Target ID must be a non-empty string');
  }

  const targetId = value.trim();

  if (!targetId) {
    throw new Error('Target ID must be a non-empty string');
  }

  return targetId;
}

function buildCreatePayload(body, userId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const type = normalizeType(body.type);
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description =
    typeof body.description === 'string' ? body.description.trim() : '';

  if (!type) {
    throw new Error(
      'Report type must be one of: Community, Content, Billing, Safety, Academic',
    );
  }

  if (!title) {
    throw new Error('Report title is required');
  }

  if (!description) {
    throw new Error('Report description is required');
  }

  const reportData = {
    reportedBy: userId,
    type,
    title,
    description,
    targetId: normalizeTargetId(body.targetId),
  };

  if (body.priority !== undefined) {
    const priority = normalizePriority(body.priority);

    if (!priority) {
      throw new Error('Priority must be one of: Low, Medium, High, Critical');
    }

    reportData.priority = priority;
  }

  return reportData;
}

async function findReportById(reportId) {
  return await Report.findById(reportId)
    .populate({
      path: 'reportedBy',
      select: 'name email role avatar isActive',
    })
    .lean();
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const reports = await Report.find({})
      .populate({
        path: 'reportedBy',
        select: 'name email role avatar isActive',
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();
    ensureCanCreateReport(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const reportData = buildCreatePayload(body, currentUser.id);
    const report = await Report.create(reportData);
    const populatedReport = await findReportById(report._id);

    return NextResponse.json(
      {
        message: 'Report created successfully',
        report: populatedReport,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
