"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  Crown,
  FileText,
  GraduationCap,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { adminSidebarLinks } from "@/data/sidebarLinks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type HeroAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  variant: "default" | "outline" | "secondary";
  className: string;
};

type StatItem = {
  label: string;
  value: string;
  delta: string;
  detail: string;
  icon: LucideIcon;
  accentClassName: string;
};

type RecentUser = {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Mentor" | "Admin";
  status: "Active" | "Pending" | "Suspended";
  lastSeen: string;
  manageHref: string;
};

type GrowthPoint = {
  month: string;
  totalUsers: number;
  activeUsers: number;
};

type HighlightItem = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
};

type ReportItem = {
  id: string;
  title: string;
  type: string;
  status: "Open" | "Investigating" | "Resolved";
  submittedAt: string;
  reviewHref: string;
};

type QuickSetting = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accentClassName: string;
};

const adminProfile = {
  name: "Amina Perera",
  summary:
    "StudyFlow AI is trending upward across signups, active study sessions, and premium upgrades. Keep moderation, growth, and platform controls moving from one clean command center.",
};

const heroHighlights = [
  { label: "Open moderation queue", value: "14 items" },
  { label: "Premium conversion", value: "27.8%" },
  { label: "Study sessions this week", value: "12.6k" },
];

const heroActions: HeroAction[] = [
  {
    label: "Manage Users",
    href: "/admin/users",
    icon: Users,
    variant: "default",
    className:
      "border-[color:var(--accent)] bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-strong)]",
  },
  {
    label: "View Reports",
    href: "/admin/reports",
    icon: FileText,
    variant: "outline",
    className:
      "border-sky-200 bg-white text-sky-700 hover:bg-sky-50 hover:text-sky-800",
  },
  {
    label: "Platform Settings",
    href: "/admin/settings",
    icon: Settings2,
    variant: "secondary",
    className: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  },
];

const stats: StatItem[] = [
  {
    label: "Total Users",
    value: "15,420",
    delta: "+8.4%",
    detail: "vs last 7 days",
    icon: Users,
    accentClassName: "from-indigo-700 to-sky-600",
  },
  {
    label: "Total Students",
    value: "12,860",
    delta: "+6.1%",
    detail: "weekly learner growth",
    icon: GraduationCap,
    accentClassName: "from-sky-600 to-cyan-500",
  },
  {
    label: "Total Mentors",
    value: "1,148",
    delta: "+3.7%",
    detail: "mentor network expansion",
    icon: Briefcase,
    accentClassName: "from-teal-700 to-emerald-500",
  },
  {
    label: "Active Users Today",
    value: "3,942",
    delta: "+11.2%",
    detail: "higher than yesterday",
    icon: Activity,
    accentClassName: "from-emerald-600 to-teal-500",
  },
  {
    label: "Premium Users",
    value: "4,286",
    delta: "+9.5%",
    detail: "month-over-month growth",
    icon: Crown,
    accentClassName: "from-amber-500 to-orange-500",
  },
  {
    label: "Quizzes Completed",
    value: "182,430",
    delta: "+14.8%",
    detail: "completed this month",
    icon: ClipboardCheck,
    accentClassName: "from-orange-500 to-rose-500",
  },
];

const recentUsers: RecentUser[] = [
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

const growthData: GrowthPoint[] = [
  { month: "Oct", totalUsers: 10620, activeUsers: 2520 },
  { month: "Nov", totalUsers: 11240, activeUsers: 2740 },
  { month: "Dec", totalUsers: 11890, activeUsers: 2965 },
  { month: "Jan", totalUsers: 12760, activeUsers: 3210 },
  { month: "Feb", totalUsers: 13940, activeUsers: 3560 },
  { month: "Mar", totalUsers: 15420, activeUsers: 3942 },
];

const analyticsHighlights: HighlightItem[] = [
  {
    label: "Most Active Feature",
    value: "AI Quiz Builder",
    description: "Drives 38% of all weekly admin-approved activity.",
    icon: Sparkles,
    accentClassName: "from-indigo-700 to-sky-600",
  },
  {
    label: "Total Study Sessions",
    value: "48,320",
    description: "Up 14% from the previous 30-day window.",
    icon: Clock3,
    accentClassName: "from-teal-700 to-emerald-500",
  },
  {
    label: "Most Popular Subject",
    value: "Mathematics",
    description: "Leads 21% of active study plans this month.",
    icon: BookOpen,
    accentClassName: "from-amber-500 to-orange-500",
  },
];

const reports: ReportItem[] = [
  {
    id: "report-01",
    title: "Spam links shared inside a student group thread",
    type: "Community",
    status: "Open",
    submittedAt: "Mar 22, 2026",
    reviewHref: "/admin/reports?report=report-01",
  },
  {
    id: "report-02",
    title: "Incorrect chemistry answer explanation flagged by mentors",
    type: "Content",
    status: "Investigating",
    submittedAt: "Mar 21, 2026",
    reviewHref: "/admin/reports?report=report-02",
  },
  {
    id: "report-03",
    title: "Repeated failed payments on premium renewal queue",
    type: "Billing",
    status: "Investigating",
    submittedAt: "Mar 21, 2026",
    reviewHref: "/admin/reports?report=report-03",
  },
  {
    id: "report-04",
    title: "Harassment complaint escalated from direct mentor chat",
    type: "Safety",
    status: "Resolved",
    submittedAt: "Mar 20, 2026",
    reviewHref: "/admin/reports?report=report-04",
  },
];

const subscriptionSummary = {
  freeUsers: 11134,
  premiumUsers: 4286,
  revenue: "$48,650 MRR",
  annualRunRate: "$583,800 ARR",
  conversionRate: "27.8%",
  note:
    "Premium growth is strongest among students using weekly plans, quiz streaks, and AI coaching recommendations together.",
};

const quickSettings: QuickSetting[] = [
  {
    title: "Manage Subjects",
    description: "Curate subjects, tags, and catalog visibility.",
    href: "/admin/subjects",
    icon: BookOpen,
    accentClassName: "from-sky-600 to-cyan-500",
  },
  {
    title: "Manage Plans",
    description: "Adjust pricing, limits, and premium entitlements.",
    href: "/admin/subscriptions",
    icon: Wallet,
    accentClassName: "from-amber-500 to-orange-500",
  },
  {
    title: "Manage Permissions",
    description: "Review role scopes and platform-level access rules.",
    href: "/admin/settings?tab=permissions",
    icon: ShieldCheck,
    accentClassName: "from-indigo-700 to-sky-600",
  },
  {
    title: "App Settings",
    description: "Tune notifications, feature flags, and defaults.",
    href: "/admin/settings",
    icon: SlidersHorizontal,
    accentClassName: "from-teal-700 to-emerald-500",
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatChartTick(value: number) {
  if (value >= 1000) {
    const compact =
      value >= 10000 ? (value / 1000).toFixed(0) : (value / 1000).toFixed(1);
    return `${compact.replace(".0", "")}k`;
  }

  return `${value}`;
}

function SectionShell({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`card-surface rounded-[32px] border border-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${className}`}
    >
      <CardHeader className="gap-4 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </CardDescription>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function RoleBadge({ role }: { role: RecentUser["role"] }) {
  const className =
    role === "Admin"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : role === "Mentor"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <Badge className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold ${className}`}>
      {role}
    </Badge>
  );
}

function StatusBadge({
  status,
}: {
  status: RecentUser["status"] | ReportItem["status"];
}) {
  const className =
    status === "Active" || status === "Resolved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Pending" || status === "Investigating"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <Badge className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold ${className}`}>
      {status}
    </Badge>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const totalSubscribers =
    subscriptionSummary.freeUsers + subscriptionSummary.premiumUsers;
  const premiumShare = Math.round(
    (subscriptionSummary.premiumUsers / totalSubscribers) * 100,
  );
  const freeShare = 100 - premiumShare;

  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading admin dashboard..."
    >
      <div className="mx-auto max-w-[1600px] space-y-8 pb-8">
        <Card className="relative overflow-hidden rounded-[34px] border border-sky-100 bg-transparent text-slate-950 shadow-[0_30px_100px_rgba(14,165,233,0.16)]">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 26%), radial-gradient(circle at 88% 18%, rgba(16, 185, 129, 0.16), transparent 24%), radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.12), transparent 28%), linear-gradient(135deg, rgba(255,255,255,1), rgba(240,249,255,0.98) 52%, rgba(236,253,245,0.98))",
            }}
          />
          <div className="soft-grid absolute inset-0 opacity-[0.12]" />

          <CardContent className="relative p-8 md:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl space-y-6">
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <Badge className="rounded-full border border-sky-100 bg-white px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm">
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    Admin command center
                  </Badge>

                  <div className="flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                    <CalendarDays className="h-4 w-4" />
                    <span>{currentDate}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    {getGreeting()}, {adminProfile.name}
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                    {adminProfile.summary}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {heroHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[24px] border border-sky-100 bg-white/90 p-4 shadow-[0_18px_40px_rgba(14,165,233,0.08)]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 xl:max-w-[520px] xl:justify-end">
                {heroActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Button
                      key={action.label}
                      type="button"
                      variant={action.variant}
                      className={`h-12 rounded-2xl border px-5 text-sm font-semibold shadow-none transition duration-200 hover:-translate-y-0.5 ${action.className}`}
                      onClick={() => router.push(action.href)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.label}
                className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>
                      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                        {stat.value}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                          {stat.delta}
                        </span>
                        <span className="text-slate-500">{stat.detail}</span>
                      </div>
                    </div>

                    <div
                      className={`inline-flex rounded-2xl bg-gradient-to-br ${stat.accentClassName} p-3 text-white shadow-lg`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="grid gap-8 2xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)]">
          <div className="space-y-8">
            <SectionShell
              title="Recent Users Preview"
              description="A live snapshot of who recently joined or interacted with StudyFlow AI, including role and account health."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                  onClick={() => router.push("/admin/users")}
                >
                  Open user hub
                </Button>
              }
            >
              <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_auto] gap-4 px-2 pb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 md:grid">
                <span>User</span>
                <span>Role</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid gap-4 rounded-[26px] border border-white/55 bg-white/70 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:grid-cols-[minmax(0,2fr)_1fr_1fr_auto] md:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                        <AvatarFallback className="bg-sky-600 text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400 md:hidden">
                          Last seen {user.lastSeen}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:justify-start">
                      <RoleBadge role={user.role} />
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-start">
                      <StatusBadge status={user.status} />
                      <span className="hidden text-sm text-slate-400 xl:inline">
                        {user.lastSeen}
                      </span>
                    </div>

                    <div className="flex justify-start md:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                        onClick={() => router.push(user.manageHref)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>

            <SectionShell
              title="Platform Analytics"
              description="Monitor total user growth alongside daily active participation to spot momentum across the platform."
              action={
                <Badge className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-600">
                  Last 6 months
                </Badge>
              }
            >
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#eb6b39]" />
                  Total users
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2b7a78]" />
                  Active users
                </div>
              </div>

              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={growthData}
                    margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="totalUsersFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eb6b39" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#eb6b39" stopOpacity={0.04} />
                      </linearGradient>
                      <linearGradient id="activeUsersFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2b7a78" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2b7a78" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(15, 23, 42, 0.08)"
                      strokeDasharray="4 4"
                    />

                    <XAxis
                      axisLine={false}
                      dataKey="month"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickLine={false}
                      tickMargin={12}
                    />

                    <YAxis
                      axisLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={formatChartTick}
                      tickLine={false}
                      width={58}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.98)",
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        borderRadius: "18px",
                        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
                        padding: "12px 14px",
                      }}
                      formatter={(value: number | string, name: string) => [
                        typeof value === "number"
                          ? new Intl.NumberFormat("en-US").format(value)
                          : value,
                        name === "totalUsers" ? "Total users" : "Active users",
                      ]}
                      labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                    />

                    <Area
                      dataKey="totalUsers"
                      fill="url(#totalUsersFill)"
                      name="Total users"
                      stroke="#eb6b39"
                      strokeWidth={3}
                      type="monotone"
                    />

                    <Area
                      dataKey="activeUsers"
                      fill="url(#activeUsersFill)"
                      name="Active users"
                      stroke="#2b7a78"
                      strokeWidth={3}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {analyticsHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-[26px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-500">
                            {item.label}
                          </p>
                          <p className="text-2xl font-semibold tracking-tight text-slate-900">
                            {item.value}
                          </p>
                        </div>

                        <div
                          className={`inline-flex rounded-2xl bg-gradient-to-br ${item.accentClassName} p-3 text-white shadow-lg`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </SectionShell>
          </div>
          <div className="space-y-8">
            <SectionShell
              title="Reports Preview"
              description="Recent moderation and platform health reports that need visibility from the admin team."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                  onClick={() => router.push("/admin/reports")}
                >
                  View all reports
                </Button>
              }
            >
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-[26px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <p className="text-base font-semibold leading-6 text-slate-900">
                            {report.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.7rem] font-semibold text-slate-700">
                              {report.type}
                            </Badge>
                            <StatusBadge status={report.status} />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                          onClick={() => router.push(report.reviewHref)}
                        >
                          Review
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        <span>{report.submittedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>

            <Card className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-white text-slate-950 shadow-[0_24px_80px_rgba(14,165,233,0.14)]">
              <div
                className="absolute inset-0 opacity-95"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at top left, rgba(14, 165, 233, 0.14), transparent 28%), radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.14), transparent 28%), linear-gradient(145deg, rgba(255,255,255,1), rgba(240,249,255,0.98), rgba(236,253,245,0.94))",
                }}
              />

              <CardContent className="relative p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Badge className="rounded-full border border-sky-100 bg-white px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm">
                      Subscription summary
                    </Badge>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                      {subscriptionSummary.revenue}
                    </h2>
                    <p className="text-sm leading-6 text-slate-600">
                      {subscriptionSummary.note}
                    </p>
                  </div>

                  <div className="inline-flex rounded-2xl border border-sky-100 bg-white p-3 text-sky-700 shadow-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 space-y-4 rounded-[26px] border border-sky-100 bg-white/85 p-5 shadow-[0_18px_40px_rgba(14,165,233,0.08)]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500">Free users</span>
                      <span className="font-semibold text-slate-950">
                        {subscriptionSummary.freeUsers.toLocaleString()} ({freeShare}%)
                      </span>
                    </div>
                    <Progress
                      value={freeShare}
                      className="h-2.5 bg-sky-100"
                      indicatorClassName="bg-sky-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500">Premium users</span>
                      <span className="font-semibold text-slate-950">
                        {subscriptionSummary.premiumUsers.toLocaleString()} ({premiumShare}%)
                      </span>
                    </div>
                    <Progress
                      value={premiumShare}
                      className="h-2.5 bg-sky-100"
                      indicatorClassName="bg-[color:var(--gold)]"
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                      Conversion rate
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {subscriptionSummary.conversionRate}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 p-4">
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <BarChart3 className="h-4 w-4" />
                      Revenue summary
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {subscriptionSummary.annualRunRate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SectionShell
              title="Quick Settings Actions"
              description="Jump straight into the platform controls that admins use most often."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {quickSettings.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      className="group rounded-[28px] border border-white/55 bg-white/70 p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
                      onClick={() => router.push(item.href)}
                    >
                      <div className="flex h-full flex-col">
                        <div className="mb-5 flex items-start justify-between gap-3">
                          <div
                            className={`inline-flex rounded-2xl bg-gradient-to-br ${item.accentClassName} p-3 text-white shadow-lg`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <ArrowRight className="h-5 w-5 text-slate-400 transition duration-300 group-hover:translate-x-1 group-hover:text-slate-700" />
                        </div>

                        <p className="text-lg font-semibold tracking-tight text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionShell>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
