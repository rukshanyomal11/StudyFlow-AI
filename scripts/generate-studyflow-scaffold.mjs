import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const staticPages = [
  ['src/app/pricing/page.jsx', 'public.pricing', 'PricingPage'],
  ['src/app/forgot-password/page.jsx', 'public.forgotPassword', 'ForgotPasswordPage'],
  ['src/app/student/profile/page.jsx', 'student.profile', 'StudentProfilePage'],
  ['src/app/student/planner/page.jsx', 'student.planner', 'StudentPlannerPage'],
  ['src/app/student/timetable/page.jsx', 'student.timetable', 'StudentTimetablePage'],
  ['src/app/student/sessions/page.jsx', 'student.sessions', 'StudentSessionsPage'],
  ['src/app/student/pomodoro/page.jsx', 'student.pomodoro', 'StudentPomodoroPage'],
  ['src/app/student/notes/page.jsx', 'student.notes', 'StudentNotesPage'],
  ['src/app/student/flashcards/page.jsx', 'student.flashcards', 'StudentFlashcardsPage'],
  ['src/app/student/quizzes/page.jsx', 'student.quizzes', 'StudentQuizzesPage'],
  ['src/app/student/progress/page.jsx', 'student.progress', 'StudentProgressPage'],
  ['src/app/student/recommendations/page.jsx', 'student.recommendations', 'StudentRecommendationsPage'],
  ['src/app/student/goals/page.jsx', 'student.goals', 'StudentGoalsPage'],
  ['src/app/student/groups/page.jsx', 'student.groups', 'StudentGroupsPage'],
  ['src/app/student/notifications/page.jsx', 'student.notifications', 'StudentNotificationsPage'],
  ['src/app/student/settings/page.jsx', 'student.settings', 'StudentSettingsPage'],
  ['src/app/mentor/dashboard/page.jsx', 'mentor.dashboard', 'MentorDashboardPage'],
  ['src/app/mentor/students/page.jsx', 'mentor.students', 'MentorStudentsPage'],
  ['src/app/mentor/content/page.jsx', 'mentor.content', 'MentorContentPage'],
  ['src/app/mentor/quizzes/page.jsx', 'mentor.quizzes', 'MentorQuizzesPage'],
  ['src/app/mentor/doubts/page.jsx', 'mentor.doubts', 'MentorDoubtsPage'],
  ['src/app/mentor/announcements/page.jsx', 'mentor.announcements', 'MentorAnnouncementsPage'],
  ['src/app/mentor/profile/page.jsx', 'mentor.profile', 'MentorProfilePage'],
  ['src/app/mentor/settings/page.jsx', 'mentor.settings', 'MentorSettingsPage'],
  ['src/app/admin/dashboard/page.jsx', 'admin.dashboard', 'AdminDashboardPage'],
  ['src/app/admin/users/page.jsx', 'admin.users', 'AdminUsersPage'],
  ['src/app/admin/subjects/page.jsx', 'admin.subjects', 'AdminSubjectsPage'],
  ['src/app/admin/reports/page.jsx', 'admin.reports', 'AdminReportsPage'],
  ['src/app/admin/analytics/page.jsx', 'admin.analytics', 'AdminAnalyticsPage'],
  ['src/app/admin/subscriptions/page.jsx', 'admin.subscriptions', 'AdminSubscriptionsPage'],
  ['src/app/admin/profile/page.jsx', 'admin.profile', 'AdminProfilePage'],
  ['src/app/admin/settings/page.jsx', 'admin.settings', 'AdminSettingsPage'],
];

const dynamicPages = [
  ['src/app/student/subjects/[id]/page.jsx', 'student.subjectDetail', 'Subject ID', 'StudentSubjectDetailPage'],
  ['src/app/student/notes/[id]/page.jsx', 'student.noteDetail', 'Note ID', 'StudentNoteDetailPage'],
  ['src/app/student/flashcards/[id]/page.jsx', 'student.flashcardDetail', 'Flashcard ID', 'StudentFlashcardDetailPage'],
  ['src/app/student/quizzes/[id]/page.jsx', 'student.quizDetail', 'Quiz ID', 'StudentQuizDetailPage'],
  ['src/app/student/quizzes/result/[id]/page.jsx', 'student.quizResult', 'Result ID', 'StudentQuizResultPage'],
  ['src/app/student/groups/[id]/page.jsx', 'student.groupDetail', 'Group ID', 'StudentGroupDetailPage'],
  ['src/app/mentor/students/[id]/page.jsx', 'mentor.studentDetail', 'Student ID', 'MentorStudentDetailPage'],
];

const apiRoutes = [
  ['src/app/api/auth/forgot-password/route.js', 'auth.forgotPassword', ['POST']],
  ['src/app/api/users/[id]/route.js', 'users.item', ['GET', 'PUT', 'DELETE']],
  ['src/app/api/subjects/route.js', 'subjects.root', ['GET', 'POST']],
  ['src/app/api/subjects/[id]/route.js', 'subjects.item', ['GET', 'PUT', 'DELETE']],
  ['src/app/api/tasks/route.js', 'tasks.root', ['GET', 'POST']],
  ['src/app/api/tasks/[id]/route.js', 'tasks.item', ['GET', 'PUT', 'DELETE']],
  ['src/app/api/tasks/today/route.js', 'tasks.today', ['GET']],
  ['src/app/api/tasks/upcoming/route.js', 'tasks.upcoming', ['GET']],
  ['src/app/api/tasks/[id]/complete/route.js', 'tasks.complete', ['POST']],
  ['src/app/api/timetable/route.js', 'timetable.root', ['GET', 'PUT']],
  ['src/app/api/timetable/generate/route.js', 'timetable.generate', ['POST']],
  ['src/app/api/sessions/start/route.js', 'sessions.start', ['POST']],
  ['src/app/api/sessions/pause/route.js', 'sessions.pause', ['POST']],
  ['src/app/api/sessions/resume/route.js', 'sessions.resume', ['POST']],
  ['src/app/api/sessions/end/route.js', 'sessions.end', ['POST']],
  ['src/app/api/sessions/history/route.js', 'sessions.history', ['GET']],
  ['src/app/api/notes/route.js', 'notes.root', ['GET', 'POST']],
  ['src/app/api/notes/[id]/route.js', 'notes.item', ['GET', 'PUT', 'DELETE']],
  ['src/app/api/notes/search/route.js', 'notes.search', ['GET']],
  ['src/app/api/flashcards/route.js', 'flashcards.root', ['GET', 'POST']],
  ['src/app/api/flashcards/[id]/route.js', 'flashcards.item', ['GET', 'PUT', 'DELETE']],
  ['src/app/api/flashcards/review/route.js', 'flashcards.review', ['POST']],
  ['src/app/api/quizzes/route.js', 'quizzes.root', ['GET', 'POST']],
  ['src/app/api/quizzes/[id]/route.js', 'quizzes.item', ['GET', 'PUT', 'DELETE']],
  ['src/app/api/quizzes/[id]/submit/route.js', 'quizzes.submit', ['POST']],
  ['src/app/api/quizzes/results/route.js', 'quizzes.results', ['GET']],
  ['src/app/api/progress/overview/route.js', 'progress.overview', ['GET']],
  ['src/app/api/progress/subjects/route.js', 'progress.subjects', ['GET']],
  ['src/app/api/progress/streak/route.js', 'progress.streak', ['GET']],
  ['src/app/api/progress/weak-areas/route.js', 'progress.weakAreas', ['GET']],
  ['src/app/api/recommendations/route.js', 'recommendations.root', ['GET']],
  ['src/app/api/recommendations/generate/route.js', 'recommendations.generate', ['POST']],
  ['src/app/api/goals/route.js', 'goals.root', ['GET', 'POST']],
  ['src/app/api/goals/[id]/route.js', 'goals.item', ['GET', 'PUT', 'DELETE']],
  ['src/app/api/groups/route.js', 'groups.root', ['GET', 'POST']],
  ['src/app/api/groups/[id]/route.js', 'groups.item', ['GET', 'PUT', 'DELETE']],
  ['src/app/api/groups/[id]/join/route.js', 'groups.join', ['POST']],
  ['src/app/api/groups/[id]/leave/route.js', 'groups.leave', ['POST']],
  ['src/app/api/groups/[id]/messages/route.js', 'groups.messages', ['GET', 'POST']],
  ['src/app/api/notifications/route.js', 'notifications.root', ['GET']],
  ['src/app/api/notifications/[id]/read/route.js', 'notifications.read', ['POST']],
  ['src/app/api/notifications/unread-count/route.js', 'notifications.unreadCount', ['GET']],
  ['src/app/api/admin/users/route.js', 'admin.users', ['GET']],
  ['src/app/api/admin/analytics/route.js', 'admin.analytics', ['GET']],
  ['src/app/api/admin/reports/route.js', 'admin.reports', ['GET']],
  ['src/app/api/admin/subscriptions/route.js', 'admin.subscriptions', ['GET']],
];

const modelStubs = [
  ['src/models/Timetable.js', 'Timetable', ['userId', 'weekStart', 'entries']],
  ['src/models/Goal.js', 'Goal', ['userId', 'title', 'deadline', 'status']],
  ['src/models/Message.js', 'Message', ['groupId', 'senderId', 'text', 'createdAt']],
  ['src/models/Announcement.js', 'Announcement', ['mentorId', 'title', 'message', 'audience']],
  ['src/models/Report.js', 'Report', ['reporterId', 'targetId', 'reason', 'status']],
];

const serviceStubs = [
  ['src/services/auth.service.js', 'auth', ['registerUser', 'loginUser', 'logoutUser']],
  ['src/services/user.service.js', 'user', ['getProfile', 'updateProfile', 'setPreferences']],
  ['src/services/subject.service.js', 'subject', ['createSubject', 'getSubjects', 'updateSubject']],
  ['src/services/task.service.js', 'task', ['createTask', 'markTaskComplete', 'getTodayTasks']],
  ['src/services/timetable.service.js', 'timetable', ['generateTimetable', 'updateTimetable', 'getWeeklyTimetable']],
  ['src/services/session.service.js', 'session', ['startSession', 'pauseSession', 'endSession']],
  ['src/services/note.service.js', 'note', ['createNote', 'updateNote', 'searchNotes']],
  ['src/services/flashcard.service.js', 'flashcard', ['createFlashcard', 'reviewFlashcards', 'scheduleNextReview']],
  ['src/services/quiz.service.js', 'quiz', ['createQuiz', 'submitQuiz', 'getQuizHistory']],
  ['src/services/progress.service.js', 'progress', ['getStudyHours', 'getCompletionRate', 'getWeakAreas']],
  ['src/services/recommendation.service.js', 'recommendation', ['recommendNextTopic', 'recommendRevisionPlan', 'generateStudyTips']],
  ['src/services/goal.service.js', 'goal', ['createGoal', 'updateGoal', 'trackGoal']],
  ['src/services/group.service.js', 'group', ['createGroup', 'joinGroup', 'sendMessage']],
  ['src/services/notification.service.js', 'notification', ['sendReminder', 'sendDeadlineAlert', 'sendGroupInvite']],
  ['src/services/admin.service.js', 'admin', ['getPlatformStats', 'manageUsers', 'reviewReports']],
];

const hookStubs = [
  ['src/hooks/useAuth.js', 'useAuth'],
  ['src/hooks/useUser.js', 'useUser'],
  ['src/hooks/useTasks.js', 'useTasks'],
  ['src/hooks/useSubjects.js', 'useSubjects'],
  ['src/hooks/useProgress.js', 'useProgress'],
  ['src/hooks/useNotifications.js', 'useNotifications'],
  ['src/hooks/usePomodoro.js', 'usePomodoro'],
];

const storeStubs = [
  ['src/store/authStore.js', 'authStore', { user: null, status: 'idle' }],
  ['src/store/plannerStore.js', 'plannerStore', { filters: {}, tasks: [] }],
  ['src/store/sessionStore.js', 'sessionStore', { activeSession: null, history: [] }],
  ['src/store/uiStore.js', 'uiStore', { sidebarOpen: true, theme: 'light' }],
];

const typeStubs = [
  ['src/types/auth.types.js', 'authShape', ['email', 'password', 'role']],
  ['src/types/user.types.js', 'userShape', ['name', 'email', 'role', 'preferences']],
  ['src/types/subject.types.js', 'subjectShape', ['name', 'priority', 'examDate']],
  ['src/types/task.types.js', 'taskShape', ['title', 'subjectId', 'status', 'priority']],
  ['src/types/note.types.js', 'noteShape', ['title', 'content', 'tags']],
  ['src/types/flashcard.types.js', 'flashcardShape', ['question', 'answer', 'difficulty']],
  ['src/types/quiz.types.js', 'quizShape', ['title', 'questions', 'subjectId']],
  ['src/types/progress.types.js', 'progressShape', ['studyHours', 'streak', 'weakAreas']],
  ['src/types/group.types.js', 'groupShape', ['name', 'members', 'subjectId']],
];

const dataStubs = [
  [
    'src/data/dummySubjects.js',
    "export const dummySubjects = [\n  { id: 'sub_001', name: 'Mathematics', priority: 'high', progress: 72 },\n  { id: 'sub_002', name: 'Physics', priority: 'medium', progress: 58 },\n  { id: 'sub_003', name: 'History', priority: 'low', progress: 81 },\n];\n",
  ],
  [
    'src/data/plans.js',
    "export const plans = [\n  { id: 'free', name: 'Free', price: 0, features: ['Planner', 'Tasks', 'Basic progress'] },\n  { id: 'pro', name: 'Pro', price: 12, features: ['AI recommendations', 'Advanced analytics', 'Premium tools'] },\n  { id: 'mentor', name: 'Mentor', price: 29, features: ['Student management', 'Quizzes', 'Announcements'] },\n];\n",
  ],
];

const supportFiles = [
  [
    'src/app/loading.jsx',
    "import React from 'react';\nimport { PageLoader } from '@/components/common/Loader';\n\nexport default function Loading() {\n  return <PageLoader message=\"Loading StudyFlow AI...\" />;\n}\n",
  ],
  [
    'src/app/not-found.jsx',
    "import React from 'react';\nimport Link from 'next/link';\nimport Card, { CardContent } from '@/components/ui/Card';\nimport Button from '@/components/ui/Button';\n\nexport default function NotFound() {\n  return (\n    <div className=\"min-h-screen bg-gray-50 flex items-center justify-center p-6\">\n      <Card className=\"max-w-xl w-full\">\n        <CardContent className=\"p-8 text-center space-y-4\">\n          <p className=\"text-sm font-semibold uppercase tracking-[0.22em] text-blue-600\">StudyFlow AI</p>\n          <h1 className=\"text-3xl font-bold text-gray-900\">Page not found</h1>\n          <p className=\"text-gray-600\">This route is not part of the current study blueprint yet, or the URL is incorrect.</p>\n          <Link href=\"/\">\n            <Button variant=\"primary\">Return Home</Button>\n          </Link>\n        </CardContent>\n      </Card>\n    </div>\n  );\n}\n",
  ],
  [
    'src/app/unauthorized/page.jsx',
    "import React from 'react';\nimport Link from 'next/link';\nimport Card, { CardContent } from '@/components/ui/Card';\nimport Button from '@/components/ui/Button';\n\nexport default function UnauthorizedPage() {\n  return (\n    <div className=\"min-h-screen bg-gray-50 flex items-center justify-center p-6\">\n      <Card className=\"max-w-xl w-full\">\n        <CardContent className=\"p-8 text-center space-y-4\">\n          <p className=\"text-sm font-semibold uppercase tracking-[0.22em] text-blue-600\">Access Control</p>\n          <h1 className=\"text-3xl font-bold text-gray-900\">Unauthorized</h1>\n          <p className=\"text-gray-600\">Your current role does not have access to this workspace.</p>\n          <Link href=\"/login\">\n            <Button variant=\"primary\">Go to Login</Button>\n          </Link>\n        </CardContent>\n      </Card>\n    </div>\n  );\n}\n",
  ],
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
}

function writeIfMissing(filePath, content) {
  const absolutePath = path.join(root, filePath);
  if (fs.existsSync(absolutePath)) {
    return false;
  }

  ensureDir(filePath);
  fs.writeFileSync(absolutePath, content, 'utf8');
  return true;
}

function createStaticPageTemplate(pageKey, componentName) {
  return `import React from 'react';\nimport ScaffoldPage from '@/components/common/ScaffoldPage';\n\nexport default function ${componentName}() {\n  return <ScaffoldPage pageKey=\"${pageKey}\" />;\n}\n`;
}

function createDynamicPageTemplate(pageKey, label, componentName) {
  return `import React from 'react';\nimport ScaffoldPage from '@/components/common/ScaffoldPage';\n\nexport default function ${componentName}({ params }) {\n  return (\n    <ScaffoldPage\n      pageKey=\"${pageKey}\"\n      context={{ label: '${label}', value: params.id }}\n    />\n  );\n}\n`;
}

function createApiRouteTemplate(key, methods) {
  const exportsBlock = methods
    .map(
      (method) =>
        `export async function ${method}(request) {\n  return createScaffoldResponse('${key}', '${method}');\n}`
    )
    .join('\n\n');

  return `import { createScaffoldResponse } from '@/lib/routeScaffold';\n\n${exportsBlock}\n`;
}

function createModelStub(name, fields) {
  return `export const ${name}Fields = ${JSON.stringify(fields, null, 2)};\n\nconst ${name} = {\n  name: '${name}',\n  status: 'scaffold',\n  fields: ${name}Fields,\n  note: 'Replace this placeholder with a full Mongoose schema.',\n};\n\nexport default ${name};\n`;
}

function createServiceStub(name, functionsList) {
  return `export const ${name}Service = {\n  name: '${name}',\n  status: 'scaffold',\n  functions: ${JSON.stringify(functionsList, null, 2)},\n};\n\nexport default ${name}Service;\n`;
}

function createHookStub(name) {
  return `export function ${name}() {\n  return {\n    status: 'scaffold',\n    message: 'Replace this placeholder hook with real client-side data logic.',\n  };\n}\n`;
}

function createStoreStub(name, initialState) {
  return `const ${name} = ${JSON.stringify(initialState, null, 2)};\n\nexport default ${name};\n`;
}

function createTypeStub(name, fields) {
  const shape = fields.reduce((acc, field) => {
    acc[field] = null;
    return acc;
  }, {});

  return `export const ${name} = ${JSON.stringify(shape, null, 2)};\n\nexport default ${name};\n`;
}

let createdCount = 0;

for (const [filePath, pageKey, componentName] of staticPages) {
  if (writeIfMissing(filePath, createStaticPageTemplate(pageKey, componentName))) {
    createdCount += 1;
  }
}

for (const [filePath, pageKey, label, componentName] of dynamicPages) {
  if (writeIfMissing(filePath, createDynamicPageTemplate(pageKey, label, componentName))) {
    createdCount += 1;
  }
}

for (const [filePath, key, methods] of apiRoutes) {
  if (writeIfMissing(filePath, createApiRouteTemplate(key, methods))) {
    createdCount += 1;
  }
}

for (const [filePath, name, fields] of modelStubs) {
  if (writeIfMissing(filePath, createModelStub(name, fields))) {
    createdCount += 1;
  }
}

for (const [filePath, name, functionsList] of serviceStubs) {
  if (writeIfMissing(filePath, createServiceStub(name, functionsList))) {
    createdCount += 1;
  }
}

for (const [filePath, name] of hookStubs) {
  if (writeIfMissing(filePath, createHookStub(name))) {
    createdCount += 1;
  }
}

for (const [filePath, name, initialState] of storeStubs) {
  if (writeIfMissing(filePath, createStoreStub(name, initialState))) {
    createdCount += 1;
  }
}

for (const [filePath, name, fields] of typeStubs) {
  if (writeIfMissing(filePath, createTypeStub(name, fields))) {
    createdCount += 1;
  }
}

for (const [filePath, content] of dataStubs) {
  if (writeIfMissing(filePath, content)) {
    createdCount += 1;
  }
}

for (const [filePath, content] of supportFiles) {
  if (writeIfMissing(filePath, content)) {
    createdCount += 1;
  }
}

console.log(`StudyFlow scaffold complete. Created ${createdCount} files.`);
