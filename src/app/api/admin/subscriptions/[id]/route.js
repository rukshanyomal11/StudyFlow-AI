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
  console.error('Admin subscription detail API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      error.message === 'Subscription not found' ||
      error.message === 'User not found'
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === 'Subscription ID is invalid' ||
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one subscription field is required' ||
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

function parseDate(value, fieldName) {
  const parsedDate = new Date(String(value));

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }

  return parsedDate;
}

async function ensureUserExists(userId) {
  const user = await User.findById(userId)
    .select('_id name email role isActive')
    .lean();

  if (!user) {
    throw new Error('User not found');
  }
}

async function getSubscriptionId(context) {
  const params = await context.params;
  const { id } = params;

  if (!isValidObjectId(id)) {
    throw new Error('Subscription ID is invalid');
  }

  return id;
}

async function getExistingSubscription(subscriptionId) {
  const subscription = await Subscription.findById(subscriptionId).lean();

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  return subscription;
}

function buildUpdatePayload(body, existingSubscription) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object');
  }

  const updates = {};

  if ('userId' in body) {
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!isValidObjectId(userId)) {
      throw new Error('User ID is invalid');
    }

    updates.userId = userId;
  }

  if ('plan' in body) {
    const plan = normalizePlan(body.plan);

    if (!plan) {
      throw new Error('Plan must be one of: Free, Pro, Mentor Pro');
    }

    updates.plan = plan;
  }

  if ('billingCycle' in body) {
    const billingCycle = normalizeBillingCycle(body.billingCycle);

    if (!billingCycle) {
      throw new Error('Billing cycle must be one of: Monthly, Yearly');
    }

    updates.billingCycle = billingCycle;
  }

  if ('status' in body) {
    const status = normalizeStatus(body.status);

    if (!status) {
      throw new Error(
        'Status must be one of: Paid, Overdue, Trialing, Canceled',
      );
    }

    updates.status = status;
  }

  if ('startDate' in body) {
    updates.startDate = parseDate(body.startDate, 'Start date');
  }

  if ('endDate' in body) {
    if (body.endDate === null || body.endDate === '') {
      updates.endDate = null;
    } else {
      updates.endDate = parseDate(body.endDate, 'End date');
    }
  }

  if ('amount' in body) {
    const amount = normalizeAmount(body.amount);

    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error('Amount must be a non-negative number');
    }

    updates.amount = amount;
  }

  const nextStartDate = updates.startDate ?? existingSubscription.startDate;
  const nextEndDate =
    Object.prototype.hasOwnProperty.call(updates, 'endDate')
      ? updates.endDate
      : existingSubscription.endDate;

  if (
    nextEndDate &&
    new Date(nextEndDate).getTime() < new Date(nextStartDate).getTime()
  ) {
    throw new Error('End date must be later than or equal to start date');
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one subscription field is required');
  }

  return updates;
}

async function findSubscriptionById(subscriptionId) {
  return await Subscription.findById(subscriptionId)
    .populate({
      path: 'userId',
      select: 'name email role avatar isActive',
    })
    .lean();
}

export async function GET(_request, context) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const subscriptionId = await getSubscriptionId(context);
    const subscription = await findSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const currentUser = await requireAuth();
    ensureAdmin(currentUser);

    await connectDB();

    const subscriptionId = await getSubscriptionId(context);
    const existingSubscription = await getExistingSubscription(subscriptionId);
    const body = await readJsonBody(request);
    const updates = buildUpdatePayload(body, existingSubscription);

    if (updates.userId) {
      await ensureUserExists(updates.userId);
    }

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { $set: updates },
      { new: true, runValidators: true },
    )
      .populate({
        path: 'userId',
        select: 'name email role avatar isActive',
      })
      .lean();

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return NextResponse.json(
      {
        message: 'Subscription updated successfully',
        subscription,
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

    const subscriptionId = await getSubscriptionId(context);
    const subscription = await Subscription.findByIdAndDelete(subscriptionId).lean();

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return NextResponse.json(
      { message: 'Subscription deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
