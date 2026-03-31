import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Report from '@/models/Report';
import { requireAuth } from '@/lib/getSession';

const statusAliases = new Map([
  ['pending', 'Pending'],
  ['investigating', 'Investigating'],
  ['resolved', 'Resolved'],
  ['dismissed', 'Dismissed'],
]);

function createErrorResponse(error) {
  console.error('Admin report detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'Report not found') {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (
      error.message === 'Report ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one report field is required' ||
      error.message === 'Status must be one of: Pending, Investigating, Resolved, Dismissed' ||
      error.message === 'Admin note must be a string'
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

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function normalizeStatus(value) {
  if (typeof value !== 'string') {
    return null;
  }

  return statusAliases.get(value.trim().toLowerCase()) || null;
}

async function getReportId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('Report ID is invalid');
  }

  return id;
}

function buildUpdatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const updates = {};

  if ('status' in body) {
    const status = normalizeStatus(body.status);

    if (!status) {
      throw new Error(
        'Status must be one of: Pending, Investigating, Resolved, Dismissed',
      );
    }

    updates.status = status;
  }

  if ('adminNote' in body) {
    if (body.adminNote !== null && typeof body.adminNote !== 'string') {
      throw new Error('Admin note must be a string');
    }

    updates.adminNote =
      typeof body.adminNote === 'string' ? body.adminNote.trim() : '';
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one report field is required');
  }

  return updates;
}

async function findReportById(reportId) {
  return await Report.findById(reportId)
    .populate({
      path: 'reportedBy',
      select: 'name email role avatar isActive',
    })
    .lean();
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const reportId = await getReportId(context);
    const report = await findReportById(reportId);

    if (!report) {
      throw new Error('Report not found');
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const reportId = await getReportId(context);
    const body = await readJsonBody(request);
    const updates = buildUpdatePayload(body);
    const report = await Report.findByIdAndUpdate(
      reportId,
      { $set: updates },
      { new: true, runValidators: true },
    )
      .populate({
        path: 'reportedBy',
        select: 'name email role avatar isActive',
      })
      .lean();

    if (!report) {
      throw new Error('Report not found');
    }

    return NextResponse.json(
      {
        message: 'Report updated successfully',
        report,
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(_request, context) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const reportId = await getReportId(context);
    const report = await Report.findByIdAndDelete(reportId).lean();

    if (!report) {
      throw new Error('Report not found');
    }

    return NextResponse.json(
      { message: 'Report deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
