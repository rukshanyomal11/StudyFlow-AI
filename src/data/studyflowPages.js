const createPage = ({
  eyebrow,
  title,
  description,
  metrics = [],
  actions = [],
  quickActions = [],
  sections = [],
  workflow = [],
}) => ({
  eyebrow,
  title,
  description,
  metrics,
  actions,
  quickActions,
  sections,
  workflow,
});

export const studyflowPages = {
  'public.pricing': createPage({
    eyebrow: 'Public Page',
    title: 'Pricing Plans',
    description:
      'Explain the Free, Pro, and Mentor plans with a clear upgrade path and feature limits.',
    metrics: [
      { label: 'Plans', value: '3', note: 'Free, Pro, Mentor' },
      { label: 'Trial CTA', value: '1', note: 'Lead users into registration' },
      { label: 'Billing Notes', value: '2', note: 'Monthly and annual copy' },
      { label: 'Upgrade Flow', value: 'Ready', note: 'Can connect to payments later' },
    ],
    sections: [
      {
        title: 'Plan comparison',
        items: [
          'Free plan for personal study planning and basic tracking',
          'Pro plan for AI recommendations, advanced analytics, and premium tools',
          'Mentor plan for coaching dashboards, quizzes, and announcements',
        ],
      },
      {
        title: 'Conversion content',
        items: [
          'Feature limit table',
          'Frequently asked billing questions',
          'Primary call to action for sign up and upgrade',
        ],
      },
    ],
    workflow: [
      'Show value quickly with a simple pricing table.',
      'Highlight the differences between student and mentor value.',
      'Route the user to registration with the selected plan prefilled later.',
    ],
  }),
  'public.forgotPassword': createPage({
    eyebrow: 'Public Page',
    title: 'Forgot Password',
    description:
      'Collect the user email, trigger a reset flow, and show confirmation with secure messaging.',
    sections: [
      {
        title: 'Reset flow',
        items: [
          'Email input with validation',
          'Send reset email action',
          'Confirmation state and resend support',
        ],
      },
      {
        title: 'Security guidance',
        items: [
          'Do not reveal whether the email exists',
          'Add token-based reset link expiration',
          'Log suspicious activity for admin review',
        ],
      },
    ],
    workflow: [
      'User enters email address.',
      'API sends a secure reset link.',
      'User resets password on a follow-up form.',
    ],
  }),
  'student.profile': createPage({
    eyebrow: 'Student Page',
    title: 'Profile',
    description:
      'Manage personal details, class level, goals, avatar, and preferred study preferences.',
    quickActions: ['Update bio', 'Upload avatar', 'Edit goals', 'Save preferences'],
    sections: [
      {
        title: 'Profile information',
        items: [
          'Edit full name and profile photo',
          'Set grade or learning level',
          'Track long-term learning goals',
        ],
      },
      {
        title: 'Study preferences',
        items: [
          'Preferred study hours',
          'Reminder preferences',
          'Favorite study window and subject interests',
        ],
      },
    ],
  }),
  'student.subjectDetail': createPage({
    eyebrow: 'Student Detail',
    title: 'Subject Detail',
    description:
      'Review one subject in depth with topics, task load, exam date, and progress trends.',
    sections: [
      {
        title: 'Overview',
        items: [
          'Priority level and exam date',
          'Completion percentage',
          'Linked goals and deadlines',
        ],
      },
      {
        title: 'Drill-down views',
        items: [
          'Topic list and weak concepts',
          'Recent tasks and study sessions',
          'Recommended revision actions',
        ],
      },
    ],
  }),
  'student.planner': createPage({
    eyebrow: 'Student Page',
    title: 'Study Planner',
    description:
      'Create study tasks, assign subjects and priorities, and organize the day with a clean plan view.',
    quickActions: ['Add task', 'Reschedule', 'Filter by subject', 'Mark complete'],
    sections: [
      {
        title: 'Task management',
        items: [
          'Create, edit, and delete tasks',
          'Set priority, duration, and topic',
          'Track pending, completed, and missed work',
        ],
      },
      {
        title: 'Planning experience',
        items: [
          'Daily and weekly views',
          'Drag-and-drop planning support later',
          'Upcoming deadlines and overdue reminders',
        ],
      },
    ],
    workflow: [
      'Create a task tied to a subject or goal.',
      'Schedule it into the current day or week.',
      'Mark it complete or reschedule when life changes.',
    ],
  }),
  'student.timetable': createPage({
    eyebrow: 'Student Page',
    title: 'Timetable',
    description:
      'Generate a weekly study routine that balances high-priority subjects, weak areas, and rest time.',
    sections: [
      {
        title: 'Planning engine',
        items: [
          'Auto-generate slots based on daily study hours',
          'Balance hard and easy subjects across the week',
          'Give more time to high-priority or weak subjects',
        ],
      },
      {
        title: 'Views and edits',
        items: [
          'Weekly view for planning',
          'Monthly preview for exam season',
          'Manual slot editing and lock important sessions',
        ],
      },
    ],
  }),
  'student.sessions': createPage({
    eyebrow: 'Student Page',
    title: 'Study Sessions',
    description:
      'Track focused study time with start, pause, resume, end, distractions, and session notes.',
    metrics: [
      { label: 'Session states', value: '4', note: 'Start, pause, resume, end' },
      { label: 'Tracked fields', value: '6+', note: 'Topic, focus, notes, and more' },
      { label: 'Focus score', value: 'Enabled', note: 'Can become analytics later' },
      { label: 'History view', value: 'Ready', note: 'Supports trend charts later' },
    ],
    sections: [
      {
        title: 'Session controls',
        items: [
          'Start timer for a selected task or subject',
          'Pause and resume active sessions',
          'End session and store study summary',
        ],
      },
      {
        title: 'Reflection and focus',
        items: [
          'Log distractions during study',
          'Add quick notes after each session',
          'Feed focus data into progress analytics',
        ],
      },
    ],
  }),
  'student.pomodoro': createPage({
    eyebrow: 'Student Page',
    title: 'Pomodoro Focus',
    description:
      'Run structured focus cycles with work intervals, breaks, session counts, and personalized timing.',
    sections: [
      {
        title: 'Timer modes',
        items: [
          'Classic 25 / 5 Pomodoro mode',
          'Custom work and break durations',
          'Session counter with short and long breaks',
        ],
      },
      {
        title: 'Habit building',
        items: [
          'Store completed focus rounds',
          'Track total break time',
          'Use session streaks to encourage consistency',
        ],
      },
    ],
  }),
  'student.notes': createPage({
    eyebrow: 'Student Page',
    title: 'Notes',
    description:
      'Organize subject-based notes with tags, markdown-style content, and quick search later.',
    quickActions: ['Create note', 'Filter by subject', 'Add tag', 'Attach file'],
    sections: [
      {
        title: 'Note management',
        items: [
          'Create, update, and delete notes',
          'Group notes by subject and tag',
          'Support rich text or markdown editing later',
        ],
      },
      {
        title: 'Study use cases',
        items: [
          'Lecture summaries',
          'Revision cheat sheets',
          'Session notes linked to tasks and subjects',
        ],
      },
    ],
  }),
  'student.noteDetail': createPage({
    eyebrow: 'Student Detail',
    title: 'Note Detail',
    description:
      'View one note with its subject tags, attachments, and revision history.',
    sections: [
      {
        title: 'Reading mode',
        items: [
          'Full note content',
          'Linked subject and tags',
          'Last edited timestamp',
        ],
      },
      {
        title: 'Follow-up actions',
        items: [
          'Edit note content',
          'Convert note into flashcards later',
          'Attach to a study session recap',
        ],
      },
    ],
  }),
  'student.flashcards': createPage({
    eyebrow: 'Student Page',
    title: 'Flashcards',
    description:
      'Review flashcards with spaced repetition, difficulty marking, and future review scheduling.',
    sections: [
      {
        title: 'Flashcard management',
        items: [
          'Create prompt and answer pairs',
          'Assign subject and tags',
          'Edit or delete any card set',
        ],
      },
      {
        title: 'Review loop',
        items: [
          'Mark cards easy, medium, or hard',
          'Schedule next review date automatically',
          'Build a revision queue from weak topics',
        ],
      },
    ],
  }),
  'student.flashcardDetail': createPage({
    eyebrow: 'Student Detail',
    title: 'Flashcard Detail',
    description:
      'Inspect a single flashcard with review history and next repetition schedule.',
    sections: [
      {
        title: 'Card data',
        items: [
          'Front and back content',
          'Difficulty and review count',
          'Next planned review date',
        ],
      },
      {
        title: 'Review actions',
        items: [
          'Edit content',
          'Reschedule review',
          'Move card into another deck later',
        ],
      },
    ],
  }),
  'student.quizzes': createPage({
    eyebrow: 'Student Page',
    title: 'Quizzes',
    description:
      'Take topic-based quizzes, submit answers, review results, and identify weak areas.',
    quickActions: ['Start quiz', 'Review mistakes', 'Filter by subject', 'See history'],
    sections: [
      {
        title: 'Quiz experience',
        items: [
          'Start a quiz for one subject or topic',
          'Answer multiple choice questions',
          'Submit and calculate results instantly',
        ],
      },
      {
        title: 'Performance review',
        items: [
          'Score summary with correct and wrong answers',
          'Weak topic detection',
          'Suggestions for revision after each quiz',
        ],
      },
    ],
  }),
  'student.quizDetail': createPage({
    eyebrow: 'Student Detail',
    title: 'Quiz Detail',
    description:
      'Display quiz instructions, questions, and timer context before submission.',
    sections: [
      {
        title: 'Quiz setup',
        items: [
          'Question list and answer options',
          'Time limit and attempt rules',
          'Assigned subject and difficulty level',
        ],
      },
      {
        title: 'Submission flow',
        items: [
          'Track unanswered items',
          'Submit responses',
          'Store the result in quiz history',
        ],
      },
    ],
  }),
  'student.quizResult': createPage({
    eyebrow: 'Student Result',
    title: 'Quiz Result',
    description:
      'Show quiz score, weak topics, corrected answers, and recommended next steps.',
    sections: [
      {
        title: 'Result summary',
        items: [
          'Score and percentage',
          'Correct versus wrong answers',
          'Weak topics detected from the attempt',
        ],
      },
      {
        title: 'Follow-up recommendations',
        items: [
          'Recommended revision topic',
          'Suggested flashcard deck',
          'Next quiz to take after review',
        ],
      },
    ],
  }),
  'student.progress': createPage({
    eyebrow: 'Student Page',
    title: 'Progress',
    description:
      'Track study hours, task completion, subject progress, focus trends, and streaks.',
    metrics: [
      { label: 'Core charts', value: '4', note: 'Hours, tasks, focus, subjects' },
      { label: 'Weak-area view', value: 'Enabled', note: 'Powered by quiz and task data' },
      { label: 'Streak tracking', value: 'Daily', note: 'Supports motivation loops' },
      { label: 'History depth', value: 'Weekly', note: 'Expandable to monthly later' },
    ],
    sections: [
      {
        title: 'Analytics',
        items: [
          'Total study hours',
          'Completed versus pending tasks',
          'Focus score trends over time',
        ],
      },
      {
        title: 'Academic insight',
        items: [
          'Subject progress percentages',
          'Weak topics from quizzes',
          'Consistency and streak analysis',
        ],
      },
    ],
  }),
  'student.recommendations': createPage({
    eyebrow: 'Student Page',
    title: 'AI Recommendations',
    description:
      'Translate performance data into practical next steps, revision topics, and study tips.',
    sections: [
      {
        title: 'Recommendation types',
        items: [
          'What to study next',
          'Suggested revision topics',
          'Recommended quizzes and shorter focus windows',
        ],
      },
      {
        title: 'Decision logic',
        items: [
          'Low quiz scores trigger revision suggestions',
          'Overdue tasks reduce daily load automatically',
          'Focus drops can trigger shorter sessions',
        ],
      },
    ],
  }),
  'student.goals': createPage({
    eyebrow: 'Student Page',
    title: 'Goals',
    description:
      'Set short-term and long-term study goals, track deadlines, and break them into tasks.',
    sections: [
      {
        title: 'Goal planning',
        items: [
          'Create milestone-based goals',
          'Add deadlines and success criteria',
          'Connect goals to subjects and exams',
        ],
      },
      {
        title: 'Execution support',
        items: [
          'Break goals into smaller tasks',
          'Track progress against milestones',
          'Surface at-risk goals on the dashboard',
        ],
      },
    ],
  }),
  'student.groups': createPage({
    eyebrow: 'Student Page',
    title: 'Study Groups',
    description:
      'Create or join study groups, chat with peers, and collaborate around a subject.',
    sections: [
      {
        title: 'Group management',
        items: [
          'Create groups and invite members',
          'Join subject-based public groups',
          'Leave or archive inactive groups',
        ],
      },
      {
        title: 'Collaboration tools',
        items: [
          'Shared discussions',
          'Group tasks and shared materials',
          'Mentor-moderated group workflows later',
        ],
      },
    ],
  }),
  'student.groupDetail': createPage({
    eyebrow: 'Student Detail',
    title: 'Group Detail',
    description:
      'Enter a single study group to view members, messages, and collaborative tasks.',
    sections: [
      {
        title: 'Group overview',
        items: [
          'Description and subject focus',
          'Member list and activity',
          'Shared announcements or files',
        ],
      },
      {
        title: 'Live collaboration',
        items: [
          'Group chat thread',
          'Shared study checklist',
          'Upcoming group sessions',
        ],
      },
    ],
  }),
  'student.notifications': createPage({
    eyebrow: 'Student Page',
    title: 'Notifications',
    description:
      'Review reminders, exam alerts, mentor feedback, and group updates in one inbox.',
    sections: [
      {
        title: 'Notification types',
        items: [
          'Task reminders and deadlines',
          'Exam countdown alerts',
          'Mentor comments and group invitations',
        ],
      },
      {
        title: 'Inbox controls',
        items: [
          'Mark read and unread',
          'Filter by notification type',
          'Adjust channels from settings later',
        ],
      },
    ],
  }),
  'student.settings': createPage({
    eyebrow: 'Student Page',
    title: 'Settings',
    description:
      'Control theme, account privacy, password updates, and notification preferences.',
    sections: [
      {
        title: 'Personal settings',
        items: [
          'Theme and display options',
          'Account privacy preferences',
          'Password and account deletion actions',
        ],
      },
      {
        title: 'Reminder settings',
        items: [
          'Enable or disable reminders',
          'Choose quiet hours',
          'Manage study notification preferences',
        ],
      },
    ],
  }),
  'mentor.dashboard': createPage({
    eyebrow: 'Mentor Page',
    title: 'Mentor Dashboard',
    description:
      'Monitor assigned students, recent submissions, pending doubts, and teaching activity.',
    metrics: [
      { label: 'Assigned students', value: '24', note: 'Placeholder mentor load' },
      { label: 'Pending doubts', value: '8', note: 'Needs reply queue' },
      { label: 'Quizzes created', value: '15', note: 'Draft and published' },
      { label: 'Recent activity', value: 'Live', note: 'Hooks into student data later' },
    ],
    sections: [
      {
        title: 'Overview',
        items: [
          'Total students and active students',
          'Pending doubts and submissions',
          'Latest announcements and tasks',
        ],
      },
      {
        title: 'Mentor actions',
        items: [
          'Create quizzes and materials',
          'Review student progress',
          'Send feedback and announcements',
        ],
      },
    ],
  }),
  'mentor.students': createPage({
    eyebrow: 'Mentor Page',
    title: 'Students',
    description:
      'Browse assigned students, filter by performance, and jump into individual progress views.',
    sections: [
      {
        title: 'Student management',
        items: [
          'Search and filter assigned students',
          'Sort by consistency or weak topics',
          'See recent study activity at a glance',
        ],
      },
      {
        title: 'Coaching flow',
        items: [
          'Open detailed student reports',
          'Leave feedback after reviewing analytics',
          'Assign quizzes or materials to selected students',
        ],
      },
    ],
  }),
  'mentor.studentDetail': createPage({
    eyebrow: 'Mentor Detail',
    title: 'Student Detail',
    description:
      'Review one student across study sessions, quiz scores, tasks, and mentor notes.',
    sections: [
      {
        title: 'Performance overview',
        items: [
          'Subject progress and weak topics',
          'Study session history and consistency',
          'Recent quiz results and task completion',
        ],
      },
      {
        title: 'Feedback tools',
        items: [
          'Add mentor comments',
          'Assign follow-up tasks',
          'Share study materials or revision advice',
        ],
      },
    ],
  }),
  'mentor.content': createPage({
    eyebrow: 'Mentor Page',
    title: 'Content',
    description:
      'Upload notes, create learning modules, and manage study resources for assigned students.',
    sections: [
      {
        title: 'Content library',
        items: [
          'Upload notes and resources',
          'Organize content by subject',
          'Tag material for classes or groups',
        ],
      },
      {
        title: 'Assignment flow',
        items: [
          'Publish materials to selected students',
          'Link content to quizzes or topics',
          'Track which materials need updates',
        ],
      },
    ],
  }),
  'mentor.quizzes': createPage({
    eyebrow: 'Mentor Page',
    title: 'Quiz Management',
    description:
      'Create, edit, assign, and review quizzes for students and study groups.',
    sections: [
      {
        title: 'Quiz authoring',
        items: [
          'Build questions and answer options',
          'Add explanations for correct answers',
          'Save drafts or publish quizzes',
        ],
      },
      {
        title: 'Distribution',
        items: [
          'Assign quizzes to specific students',
          'Reuse quizzes across groups',
          'Review completion and result trends',
        ],
      },
    ],
  }),
  'mentor.doubts': createPage({
    eyebrow: 'Mentor Page',
    title: 'Doubts and Messages',
    description:
      'Handle student questions, give feedback, and keep communication organized.',
    sections: [
      {
        title: 'Communication queue',
        items: [
          'Pending student doubts',
          'Reply threads and mentor notes',
          'Resolved versus unresolved filters',
        ],
      },
      {
        title: 'Support workflow',
        items: [
          'Respond with study advice',
          'Attach materials or quiz references',
          'Escalate repeated confusion into announcement content',
        ],
      },
    ],
  }),
  'mentor.announcements': createPage({
    eyebrow: 'Mentor Page',
    title: 'Announcements',
    description:
      'Post updates, schedule reminders, and broadcast coaching notes to students.',
    sections: [
      {
        title: 'Announcement tools',
        items: [
          'Create and schedule announcements',
          'Target a class, student set, or study group',
          'Highlight important deadlines or revision plans',
        ],
      },
      {
        title: 'Engagement',
        items: [
          'Track active announcement windows',
          'Use reminders before exams or quizzes',
          'Connect notifications to student inboxes',
        ],
      },
    ],
  }),
  'mentor.profile': createPage({
    eyebrow: 'Mentor Page',
    title: 'Mentor Profile',
    description:
      'Maintain mentor identity, teaching focus, and public profile information used across the platform.',
    sections: [
      {
        title: 'Identity',
        items: [
          'Profile photo and name',
          'Subject specialization',
          'Availability and coaching bio',
        ],
      },
      {
        title: 'Settings hooks',
        items: [
          'Notification preferences',
          'Dashboard defaults',
          'Announcement signature and contact preferences',
        ],
      },
    ],
  }),
  'mentor.settings': createPage({
    eyebrow: 'Mentor Page',
    title: 'Mentor Settings',
    description:
      'Configure mentor notifications, content defaults, and account security settings.',
    sections: [
      {
        title: 'Account controls',
        items: [
          'Update password',
          'Manage account privacy',
          'Set dashboard preferences',
        ],
      },
      {
        title: 'Communication settings',
        items: [
          'Announcement defaults',
          'Doubt notification settings',
          'Student assignment preferences',
        ],
      },
    ],
  }),
  'admin.dashboard': createPage({
    eyebrow: 'Admin Page',
    title: 'Admin Dashboard',
    description:
      'Monitor total users, premium usage, completed quizzes, moderation signals, and platform health.',
    metrics: [
      { label: 'Total students', value: '1,280', note: 'Sample platform count' },
      { label: 'Total mentors', value: '86', note: 'Active role accounts' },
      { label: 'Premium users', value: '312', note: 'Upgrade tracking' },
      { label: 'Quizzes completed', value: '9,540', note: 'Aggregate engagement' },
    ],
    sections: [
      {
        title: 'Platform overview',
        items: [
          'User growth and active usage',
          'Premium adoption',
          'Most-used learning features',
        ],
      },
      {
        title: 'Operations',
        items: [
          'Moderation alerts',
          'Plan management shortcuts',
          'Quick access to reports and analytics',
        ],
      },
    ],
  }),
  'admin.users': createPage({
    eyebrow: 'Admin Page',
    title: 'User Management',
    description:
      'Search, filter, block, unblock, and assign roles across all users in the platform.',
    sections: [
      {
        title: 'User operations',
        items: [
          'Search users by name or email',
          'Block or unblock accounts',
          'Promote mentors and manage access',
        ],
      },
      {
        title: 'Governance',
        items: [
          'Audit role changes',
          'Review account activity flags',
          'Handle abuse or support escalations',
        ],
      },
    ],
  }),
  'admin.subjects': createPage({
    eyebrow: 'Admin Page',
    title: 'Subject Management',
    description:
      'Maintain platform-wide subjects, categories, and learning taxonomy for planning and quizzes.',
    sections: [
      {
        title: 'Catalog management',
        items: [
          'Create and edit subject records',
          'Organize categories and levels',
          'Retire outdated subject entries safely',
        ],
      },
      {
        title: 'Quality control',
        items: [
          'Review duplicate categories',
          'Maintain subject naming consistency',
          'Support mentor content classification',
        ],
      },
    ],
  }),
  'admin.reports': createPage({
    eyebrow: 'Admin Page',
    title: 'Reports',
    description:
      'Moderate abuse reports, review flagged content, and keep public collaboration spaces healthy.',
    sections: [
      {
        title: 'Moderation inbox',
        items: [
          'Abuse reports from users',
          'Flagged messages or shared content',
          'Status filters for pending or resolved items',
        ],
      },
      {
        title: 'Resolution workflow',
        items: [
          'Warn or suspend abusive accounts',
          'Remove harmful content',
          'Escalate severe issues for follow-up',
        ],
      },
    ],
  }),
  'admin.analytics': createPage({
    eyebrow: 'Admin Page',
    title: 'Analytics',
    description:
      'Track daily active users, popular features, conversion trends, and revenue signals.',
    sections: [
      {
        title: 'Engagement',
        items: [
          'Daily and weekly active users',
          'Most used features and study patterns',
          'Quiz and study session volume',
        ],
      },
      {
        title: 'Business insights',
        items: [
          'Premium revenue tracking',
          'Plan conversion trends',
          'Retention indicators by user role',
        ],
      },
    ],
  }),
  'admin.subscriptions': createPage({
    eyebrow: 'Admin Page',
    title: 'Subscriptions',
    description:
      'Manage plan definitions, feature limits, and future billing integration points.',
    sections: [
      {
        title: 'Plan controls',
        items: [
          'Create or edit Free, Pro, and Mentor plans',
          'Define feature gates and limits',
          'Attach analytics and upgrade copy',
        ],
      },
      {
        title: 'Commerce readiness',
        items: [
          'Prepare payment provider integration',
          'Store plan metadata and perks',
          'Support future trial or coupon logic',
        ],
      },
    ],
  }),
  'admin.profile': createPage({
    eyebrow: 'Admin Page',
    title: 'Admin Profile',
    description:
      'Keep administrator details and visibility settings consistent across internal operations.',
    sections: [
      {
        title: 'Identity',
        items: [
          'Display name and avatar',
          'Contact information',
          'Administrative role summary',
        ],
      },
      {
        title: 'Operational settings',
        items: [
          'Moderation preferences',
          'Escalation contact defaults',
          'Alert visibility choices',
        ],
      },
    ],
  }),
  'admin.settings': createPage({
    eyebrow: 'Admin Page',
    title: 'Admin Settings',
    description:
      'Manage system defaults, notification preferences, AI feature toggles, and account security.',
    sections: [
      {
        title: 'Platform settings',
        items: [
          'Default notifications',
          'AI feature controls',
          'Global permission flags',
        ],
      },
      {
        title: 'Security',
        items: [
          'Password management',
          'Alert subscriptions',
          'Access review reminders',
        ],
      },
    ],
  }),
};
