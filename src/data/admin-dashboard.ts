export interface DashboardAction {
  label: string;
  href: string;
  icon: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export interface AdminStat {
  label: string;
  value: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  helperText?: string;
  accentClassName?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Mentor" | "Admin";
  status: "Active" | "Pending" | "Suspended";
  lastSeen: string;
  manageHref: string;
}

export interface AdminAnalyticsPoint {
  period: string;
  newUsers: number;
  activeUsers: number;
}

export interface AdminAnalyticsHighlight {
  label: string;
  value: string;
  description: string;
  icon: string;
  accentClassName?: string;
}

export interface AdminReport {
  id: string;
  title: string;
  type: string;
  status: "Open" | "Investigating" | "Resolved";
  reportedBy: string;
  submittedAt: string;
  reviewHref: string;
}

export interface AdminRevenueSummary {
  freeUsers: string;
  premiumUsers: string;
  monthlyRevenue: string;
  annualRunRate: string;
  conversionRate: string;
  note: string;
  premiumGrowthLabel: string;
  planActionHref: string;
  planActionLabel: string;
  secondaryActionHref: string;
}

export interface SystemSettingAction {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  badge?: string;
  footerLabel?: string;
}

export const adminDashboardProfile = {
  adminName: "Amina Perera",
  badge: "Admin Command Center",
  overview:
    "StudyFlow AI is trending upward across signups, daily engagement, and premium adoption. This dashboard keeps the most important moderation, growth, and platform controls in one place.",
};

export const adminHeaderActions: DashboardAction[] = [
  {
    label: "Manage Users",
    href: "/admin/users",
    icon: "Users",
    variant: "default",
    className:
      "border-[color:var(--accent)] bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-strong)]",
  },
  {
    label: "View Reports",
    href: "/admin/reports",
    icon: "ShieldAlert",
    variant: "outline",
    className:
      "border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white",
  },
  {
    label: "Platform Settings",
    href: "/admin/settings",
    icon: "Settings",
    variant: "secondary",
    className: "bg-white text-slate-950 hover:bg-slate-100",
  },
];

export const adminDashboardStats: AdminStat[] = [
  {
    label: "Total Users",
    value: "15,420",
    icon: "Users",
    trend: { value: 8.4, isPositive: true, label: "vs last 7 days" },
    accentClassName: "bg-gradient-to-br from-slate-900 to-slate-700",
  },
  {
    label: "Total Students",
    value: "12,860",
    icon: "GraduationCap",
    trend: { value: 6.1, isPositive: true, label: "vs last 7 days" },
    accentClassName: "bg-gradient-to-br from-sky-600 to-cyan-500",
  },
  {
    label: "Total Mentors",
    value: "1,148",
    icon: "Briefcase",
    trend: { value: 3.7, isPositive: true, label: "vs last 7 days" },
    accentClassName: "bg-gradient-to-br from-teal-700 to-emerald-500",
  },
  {
    label: "Active Users Today",
    value: "3,942",
    icon: "Activity",
    trend: { value: 11.2, isPositive: true, label: "daily engagement" },
    accentClassName: "bg-gradient-to-br from-emerald-600 to-teal-500",
  },
  {
    label: "Premium Users",
    value: "4,286",
    icon: "Crown",
    trend: { value: 9.5, isPositive: true, label: "month over month" },
    accentClassName: "bg-gradient-to-br from-amber-500 to-orange-500",
  },
  {
    label: "Quizzes Completed",
    value: "182,430",
    icon: "ClipboardCheck",
    trend: { value: 14.8, isPositive: true, label: "this month" },
    accentClassName: "bg-gradient-to-br from-orange-500 to-rose-500",
  },
];

export const adminRecentUsers: AdminUser[] = [
  {
    id: "user-01",
    name: "Lena Jayasuriya",
    email: "lena.j@studyflow.ai",
    role: "Student",
    status: "Active",
    lastSeen: "5 mins ago",
    manageHref: "/admin/users?focus=user-01",
  },
  {
    id: "user-02",
    name: "Dilan Fernando",
    email: "dilan.f@studyflow.ai",
    role: "Mentor",
    status: "Active",
    lastSeen: "12 mins ago",
    manageHref: "/admin/users?focus=user-02",
  },
  {
    id: "user-03",
    name: "Maya Gunasekara",
    email: "maya.g@studyflow.ai",
    role: "Student",
    status: "Pending",
    lastSeen: "28 mins ago",
    manageHref: "/admin/users?focus=user-03",
  },
  {
    id: "user-04",
    name: "Kavin De Silva",
    email: "kavin.d@studyflow.ai",
    role: "Admin",
    status: "Active",
    lastSeen: "42 mins ago",
    manageHref: "/admin/users?focus=user-04",
  },
  {
    id: "user-05",
    name: "Nethmi Peris",
    email: "nethmi.p@studyflow.ai",
    role: "Student",
    status: "Suspended",
    lastSeen: "1 hour ago",
    manageHref: "/admin/users?focus=user-05",
  },
];

export const adminAnalyticsData: AdminAnalyticsPoint[] = [
  { period: "Jan", newUsers: 380, activeUsers: 2100 },
  { period: "Feb", newUsers: 420, activeUsers: 2380 },
  { period: "Mar", newUsers: 465, activeUsers: 2510 },
  { period: "Apr", newUsers: 520, activeUsers: 2890 },
  { period: "May", newUsers: 610, activeUsers: 3260 },
  { period: "Jun", newUsers: 685, activeUsers: 3942 },
];

export const adminAnalyticsHighlights: AdminAnalyticsHighlight[] = [
  {
    label: "Most Active Feature",
    value: "AI Quiz Builder",
    description: "Drives 38% of all weekly admin-approved activity.",
    icon: "Sparkles",
    accentClassName: "bg-gradient-to-br from-slate-900 to-teal-700",
  },
  {
    label: "Total Study Sessions",
    value: "48,320",
    description: "Up 14% from the previous 30-day window.",
    icon: "Clock3",
    accentClassName: "bg-gradient-to-br from-teal-700 to-emerald-500",
  },
  {
    label: "Most Popular Subject",
    value: "Mathematics",
    description: "Leading 21% of all active study plans this month.",
    icon: "BookOpen",
    accentClassName: "bg-gradient-to-br from-amber-500 to-orange-500",
  },
];

export const adminReports: AdminReport[] = [
  {
    id: "report-01",
    title: "Spam links shared inside a student group thread",
    type: "Community",
    status: "Open",
    reportedBy: "Group moderator",
    submittedAt: "Mar 22, 2026",
    reviewHref: "/admin/reports?report=report-01",
  },
  {
    id: "report-02",
    title: "Incorrect chemistry answer explanation flagged by mentors",
    type: "Content",
    status: "Investigating",
    reportedBy: "Mentor council",
    submittedAt: "Mar 21, 2026",
    reviewHref: "/admin/reports?report=report-02",
  },
  {
    id: "report-03",
    title: "Repeated failed payments on premium renewal queue",
    type: "Billing",
    status: "Investigating",
    reportedBy: "Finance monitor",
    submittedAt: "Mar 21, 2026",
    reviewHref: "/admin/reports?report=report-03",
  },
  {
    id: "report-04",
    title: "Harassment complaint escalated from direct mentor chat",
    type: "Safety",
    status: "Resolved",
    reportedBy: "Trust & safety",
    submittedAt: "Mar 20, 2026",
    reviewHref: "/admin/reports?report=report-04",
  },
];

export const adminRevenueSummary: AdminRevenueSummary = {
  freeUsers: "11,134",
  premiumUsers: "4,286",
  monthlyRevenue: "$48,650",
  annualRunRate: "$583,800 ARR",
  conversionRate: "27.8%",
  note:
    "Premium growth is accelerating as quiz completion and planner retention continue to rise across the platform.",
  premiumGrowthLabel: "+312 premium upgrades in the last 30 days.",
  planActionHref: "/admin/subscriptions",
  planActionLabel: "Manage Plans",
  secondaryActionHref: "/admin/subscriptions",
};

export const adminSystemSettings: SystemSettingAction[] = [
  {
    title: "Manage Subjects",
    description:
      "Curate subjects, categories, and discovery rules across the platform.",
    href: "/admin/subjects",
    icon: "BookOpenCheck",
    color: "bg-gradient-to-br from-sky-600 to-cyan-500",
    badge: "Catalog",
    footerLabel: "Open subject manager",
  },
  {
    title: "Manage Plans",
    description:
      "Adjust pricing, feature limits, and premium entitlements for users.",
    href: "/admin/subscriptions",
    icon: "CreditCard",
    color: "bg-gradient-to-br from-amber-500 to-orange-500",
    badge: "Revenue",
    footerLabel: "Open plan controls",
  },
  {
    title: "Manage Permissions",
    description:
      "Review access levels, role scopes, and admin-only capabilities.",
    href: "/admin/settings?tab=permissions",
    icon: "ShieldCheck",
    color: "bg-gradient-to-br from-slate-900 to-slate-700",
    badge: "Security",
    footerLabel: "Open permissions",
  },
  {
    title: "Update App Settings",
    description:
      "Tune notifications, feature flags, and global experience defaults.",
    href: "/admin/settings",
    icon: "Settings",
    color: "bg-gradient-to-br from-teal-700 to-emerald-500",
    badge: "Platform",
    footerLabel: "Open settings",
  },
];
