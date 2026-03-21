// Dummy data for Mentor Dashboard

export interface Stat {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  studyLevel: string;
  progress: number;
  weakSubject: string;
  lastActive: string;
}

export interface Doubt {
  id: string;
  studentName: string;
  studentAvatar?: string;
  question: string;
  subject: string;
  time: string;
  isUnread: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  recipients: string;
}

export interface ChartData {
  name: string;
  engagement: number;
  progress: number;
}

export const dashboardStats: Stat[] = [
  {
    label: "Total Students",
    value: 156,
    icon: "Users",
    trend: { value: 12, isPositive: true },
  },
  {
    label: "Active Students",
    value: 142,
    icon: "UserCheck",
    trend: { value: 8, isPositive: true },
  },
  {
    label: "Pending Doubts",
    value: 23,
    icon: "MessageCircleQuestion",
    trend: { value: 5, isPositive: false },
  },
  {
    label: "Quizzes Created",
    value: 48,
    icon: "FileQuestion",
    trend: { value: 3, isPositive: true },
  },
  {
    label: "Study Materials",
    value: 127,
    icon: "BookOpen",
    trend: { value: 15, isPositive: true },
  },
  {
    label: "Announcements",
    value: 34,
    icon: "Megaphone",
    trend: { value: 2, isPositive: true },
  },
];

export const recentStudents: Student[] = [
  {
    id: "1",
    name: "Emma Thompson",
    email: "emma.t@email.com",
    studyLevel: "A-Level",
    progress: 78,
    weakSubject: "Physics",
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Oliver Smith",
    email: "oliver.s@email.com",
    studyLevel: "GCSE",
    progress: 92,
    weakSubject: "Chemistry",
    lastActive: "5 hours ago",
  },
  {
    id: "3",
    name: "Sophia Johnson",
    email: "sophia.j@email.com",
    studyLevel: "A-Level",
    progress: 65,
    weakSubject: "Mathematics",
    lastActive: "1 day ago",
  },
  {
    id: "4",
    name: "Noah Williams",
    email: "noah.w@email.com",
    studyLevel: "GCSE",
    progress: 45,
    weakSubject: "Biology",
    lastActive: "3 hours ago",
  },
  {
    id: "5",
    name: "Ava Brown",
    email: "ava.b@email.com",
    studyLevel: "A-Level",
    progress: 88,
    weakSubject: "English",
    lastActive: "1 hour ago",
  },
];

export const topPerformers: Student[] = [
  {
    id: "2",
    name: "Oliver Smith",
    email: "oliver.s@email.com",
    studyLevel: "GCSE",
    progress: 92,
    weakSubject: "Chemistry",
    lastActive: "5 hours ago",
  },
  {
    id: "5",
    name: "Ava Brown",
    email: "ava.b@email.com",
    studyLevel: "A-Level",
    progress: 88,
    weakSubject: "English",
    lastActive: "1 hour ago",
  },
  {
    id: "1",
    name: "Emma Thompson",
    email: "emma.t@email.com",
    studyLevel: "A-Level",
    progress: 78,
    weakSubject: "Physics",
    lastActive: "2 hours ago",
  },
];

export const studentsNeedingAttention: Student[] = [
  {
    id: "4",
    name: "Noah Williams",
    email: "noah.w@email.com",
    studyLevel: "GCSE",
    progress: 45,
    weakSubject: "Biology",
    lastActive: "3 hours ago",
  },
  {
    id: "3",
    name: "Sophia Johnson",
    email: "sophia.j@email.com",
    studyLevel: "A-Level",
    progress: 65,
    weakSubject: "Mathematics",
    lastActive: "1 day ago",
  },
];

export const recentDoubts: Doubt[] = [
  {
    id: "1",
    studentName: "Emma Thompson",
    question: "How do I solve quadratic equations using the formula?",
    subject: "Mathematics",
    time: "15 mins ago",
    isUnread: true,
  },
  {
    id: "2",
    studentName: "Noah Williams",
    question: "What is the difference between mitosis and meiosis?",
    subject: "Biology",
    time: "1 hour ago",
    isUnread: true,
  },
  {
    id: "3",
    studentName: "Sophia Johnson",
    question: "Can you explain Newton's third law with examples?",
    subject: "Physics",
    time: "2 hours ago",
    isUnread: false,
  },
  {
    id: "4",
    studentName: "Oliver Smith",
    question: "Help with balancing chemical equations",
    subject: "Chemistry",
    time: "3 hours ago",
    isUnread: false,
  },
  {
    id: "5",
    studentName: "Ava Brown",
    question: "What are the main themes in Shakespeare's Macbeth?",
    subject: "English",
    time: "5 hours ago",
    isUnread: false,
  },
];

export const recentAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Mid-term Examinations Schedule Released",
    content: "The mid-term exam schedule has been published. Please check your student portal for detailed timings.",
    date: "2026-03-20",
    recipients: "All Students",
  },
  {
    id: "2",
    title: "New Study Materials Available",
    content: "New comprehensive study guides for Mathematics and Physics are now available in the resources section.",
    date: "2026-03-18",
    recipients: "A-Level Students",
  },
  {
    id: "3",
    title: "Weekend Study Session - Mathematics",
    content: "Join us for an intensive revision session this Saturday covering all topics from the last term.",
    date: "2026-03-15",
    recipients: "GCSE Students",
  },
];

export const engagementChartData: ChartData[] = [
  { name: "Mon", engagement: 65, progress: 58 },
  { name: "Tue", engagement: 72, progress: 65 },
  { name: "Wed", engagement: 68, progress: 62 },
  { name: "Thu", engagement: 85, progress: 78 },
  { name: "Fri", engagement: 78, progress: 72 },
  { name: "Sat", engagement: 45, progress: 48 },
  { name: "Sun", engagement: 38, progress: 42 },
];

export const quickActions = [
  {
    title: "Create Quiz",
    description: "Design a new quiz for your students",
    icon: "FileQuestion",
    href: "/mentor/quiz/create",
    color: "bg-blue-500",
  },
  {
    title: "Upload Notes",
    description: "Share study materials and resources",
    icon: "Upload",
    href: "/mentor/materials/upload",
    color: "bg-green-500",
  },
  {
    title: "Assign Task",
    description: "Create and assign homework or projects",
    icon: "ClipboardList",
    href: "/mentor/tasks/assign",
    color: "bg-purple-500",
  },
  {
    title: "Manage Materials",
    description: "Organize your teaching resources",
    icon: "FolderOpen",
    href: "/mentor/materials",
    color: "bg-orange-500",
  },
];
