import { NextResponse } from 'next/server';
import { dispatchTaskReminderEmails } from '@/lib/task-reminders';

export const runtime = 'nodejs';

function isAuthorized(request) {
  const configuredSecret =
    process.env.TASK_REMINDER_CRON_SECRET || process.env.CRON_SECRET || '';
  const authorizationHeader = request.headers.get('authorization') || '';
  const bearerToken = authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7).trim()
    : '';
  const headerSecret = request.headers.get('x-reminder-secret') || '';

  if (!configuredSecret) {
    throw new Error('Reminder cron secret is not configured');
  }

  return bearerToken === configuredSecret || headerSecret === configuredSecret;
}

export async function GET(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await dispatchTaskReminderEmails();

    return NextResponse.json(
      {
        message: 'Task reminder dispatch completed',
        summary,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Task reminder dispatch error:', error);

    if (
      error instanceof Error &&
      error.message === 'Reminder cron secret is not configured'
    ) {
      return NextResponse.json(
        { error: 'Reminder cron secret is not configured' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to dispatch task reminders' },
      { status: 500 },
    );
  }
}
