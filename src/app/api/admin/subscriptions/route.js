import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import { requireAuth } from '@/lib/getSession';

const planAliases = new Map([
  ['free', 'Free'],
  ['pro', 'Pro'],
  ['mentor pro', 'Mentor Pro'],
  ['mentor_pro', 'Mentor Pro'],
  ['mentorpro', 'Mentor Pro'],
]);
const billingCycleAliases = new Map([
  ['monthly', 'Monthly'],
  ['yearly', 'Yearly'],
  ['annual', 'Yearly'],
  ['yearly plan', 'Yearly'],
]);
const statusAliases = new Map([
  ['paid', 'Paid'],
  ['overdue', 'Overdue'],
  ['trialing', 'Trialing'],
  ['trial', 'Trialing'],
  ['canceled', 'Canceled'],
  ['cancelled', 'Canceled'],
]);

function createErrorResponse(error) {
  console.error('Admin subscriptions API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error.message === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'User ID is required' ||
      error.message === 'User ID is invalid' ||
      error.message === 'Plan must be one of: Free, Pro, Mentor Pro' ||
      error.message === 'Billing cycle must be one of: Monthly, Yearly' ||
      error.message === 'Status must be one of: Paid, Overdue, Trialing, Canceled' ||
      error.message === 'Start date must be a valid date' ||
      error.message === 'End date must be a valid date' ||
      error.message === 'End date must be later than or equal to start date' ||
      error.message === 'Amount must be a non-negative number'
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

function normalizePlan(value) {
  if (typeof value !== 'string') {
    return null;
  }

  return planAliases.get(value.trim().toLowerCase()) || null;
}

function normalizeBillingCycle(value) {
  if (typeof value !== 'string') {
    return null;
  }

  return billingCycleAliases.get(value.trim().toLowerCase()) || null;
}

function normalizeStatus(value) {
  if (typeof value !== 'string') {
    return null;
  }

  return statusAliases.get(value.trim().toLowerCase()) || null;
}

function normalizeAmount(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }

  return Number.NaN;
}

async function ensureUserExists(userId) {
  const user = await User.findById(userId)
    .select('_id name email role isActive')
    .lean();

  if (!user) {
    throw new Error('User not found');
  }
}

function parseDate(value, fieldName) {
  const parsedDate = new Date(String(value));

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }

  return parsedDate;
}

function buildCreatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';

  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!isValidObjectId(userId)) {
    throw new Error('User ID is invalid');
  }

  const plan = normalizePlan(body.plan);

  if (!plan) {
    throw new Error('Plan must be one of: Free, Pro, Mentor Pro');
  }

  const billingCycle = normalizeBillingCycle(body.billingCycle);

  if (!billingCycle) {
    throw new Error('Billing cycle must be one of: Monthly, Yearly');
  }

  const status = normalizeStatus(body.status);

  if (!status) {
    throw new Error('Status must be one of: Paid, Overdue, Trialing, Canceled');
  }

  const startDate = parseDate(
    body.startDate ?? new Date().toISOString(),
    'Start date',
  );

  let endDate = null;

  if (body.endDate !== undefined && body.endDate !== null && body.endDate !== '') {
    endDate = parseDate(body.endDate, 'End date');
  }

  if (endDate && endDate.getTime() < startDate.getTime()) {
    throw new Error('End date must be later than or equal to start date');
  }

  const amount = normalizeAmount(body.amount);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Amount must be a non-negative number');
  }

  return {
    userId,
    plan,
    billingCycle,
    status,
    startDate,
    endDate,
    amount,
  };
}

async function findSubscriptionById(subscriptionId) {
  return await Subscription.findById(subscriptionId)
    .populate({
      path: 'userId',
      select: 'name email role avatar isActive',
    })
    .lean();
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const subscriptions = await Subscription.find({})
      .populate({
        path: 'userId',
        select: 'name email role avatar isActive',
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ subscriptions }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const subscriptionData = buildCreatePayload(body);

    await ensureUserExists(subscriptionData.userId);

    const subscription = await Subscription.create(subscriptionData);
    const populatedSubscription = await findSubscriptionById(subscription._id);

    return NextResponse.json(
      {
        message: 'Subscription created successfully',
        subscription: populatedSubscription,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
