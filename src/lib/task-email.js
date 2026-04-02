import { sendEmail } from '@/lib/email';

function formatTaskDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(date));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildTaskDetailLines(task) {
  return [
    `Task: ${task.title}`,
    `Subject: ${task.subjectName || 'General'}`,
    `When: ${formatTaskDate(task.date)}`,
    `Priority: ${task.priority || 'medium'}`,
    `Status: ${task.status || 'pending'}`,
  ];
}

function buildCreatedEmail({ userName, task }) {
  const detailLines = buildTaskDetailLines(task);
  const safeName = escapeHtml(userName || 'Student');

  return {
    subject: `Task created: ${task.title}`,
    text: [
      `Hi ${userName || 'Student'},`,
      '',
      'Your planner task was created successfully.',
      '',
      ...detailLines,
      '',
      'StudyFlow AI will remind you again 5 minutes before the task starts.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="margin-bottom:12px">Task created successfully</h2>
        <p>Hi ${safeName},</p>
        <p>Your planner task was created successfully.</p>
        <ul>
          ${detailLines
            .map((line) => `<li>${escapeHtml(line)}</li>`)
            .join('')}
        </ul>
        <p>StudyFlow AI will remind you again 5 minutes before the task starts.</p>
      </div>
    `,
  };
}

function buildReminderEmail({ userName, task }) {
  const detailLines = buildTaskDetailLines(task);
  const safeName = escapeHtml(userName || 'Student');

  return {
    subject: `Reminder: ${task.title} starts in 5 minutes`,
    text: [
      `Hi ${userName || 'Student'},`,
      '',
      'This is your 5-minute reminder for an upcoming study task.',
      '',
      ...detailLines,
      '',
      'Open StudyFlow AI and get ready to start.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="margin-bottom:12px">Your task starts in 5 minutes</h2>
        <p>Hi ${safeName},</p>
        <p>This is your 5-minute reminder for an upcoming study task.</p>
        <ul>
          ${detailLines
            .map((line) => `<li>${escapeHtml(line)}</li>`)
            .join('')}
        </ul>
        <p>Open StudyFlow AI and get ready to start.</p>
      </div>
    `,
  };
}

export async function sendTaskCreatedEmail({ to, userName, task }) {
  if (!to) {
    return { sent: false, reason: 'Recipient email is missing' };
  }

  const email = buildCreatedEmail({ userName, task });
  return await sendEmail({
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}

export async function sendTaskReminderEmail({ to, userName, task }) {
  if (!to) {
    return { sent: false, reason: 'Recipient email is missing' };
  }

  const email = buildReminderEmail({ userName, task });
  return await sendEmail({
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}
