import Task from '@/models/Task';
import connectDB from '@/lib/mongoose';
import { sendTaskReminderEmail } from '@/lib/task-email';

export async function dispatchTaskReminderEmails(referenceDate = new Date()) {
  await connectDB();

  const windowStart = new Date(referenceDate);
  const windowEnd = new Date(referenceDate.getTime() + 5 * 60 * 1000);

  const tasks = await Task.find({
    status: { $in: ['pending', 'in_progress'] },
    reminderSentFor: null,
    date: {
      $gte: windowStart,
      $lte: windowEnd,
    },
  })
    .populate({
      path: 'userId',
      select: 'name email isActive preferences.reminderEnabled',
    })
    .lean();

  const summary = {
    scanned: tasks.length,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const task of tasks) {
    const user = task.userId;

    if (
      !user ||
      typeof user !== 'object' ||
      !user.email ||
      user.isActive === false ||
      user.preferences?.reminderEnabled === false
    ) {
      summary.skipped += 1;
      continue;
    }

    try {
      const result = await sendTaskReminderEmail({
        to: user.email,
        userName: user.name,
        task,
      });

      if (!result.sent) {
        summary.failed += 1;
        continue;
      }

      await Task.findByIdAndUpdate(task._id, {
        $set: {
          reminderEmailSentAt: referenceDate,
          reminderSentFor: task.date,
        },
      });

      summary.sent += 1;
    } catch (error) {
      summary.failed += 1;
      console.error('Task reminder email failed:', error);
    }
  }

  return {
    windowStart,
    windowEnd,
    ...summary,
  };
}
