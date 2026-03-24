"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Megaphone,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { mentorSidebarLinks } from "@/data/sidebarLinks";
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

interface StudentPreview {
  id: string;
  name: string;
  level: string;
  progress: number;
  weakSubject: string;
}

interface PerformancePoint {
  label: string;
  engagement: number;
  averageProgress: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  accentClassName: string;
  surfaceClassName: string;
}

interface DoubtItem {
  id: string;
  studentName: string;
  title: string;
  time: string;
  priority: "High" | "Medium" | "Low";
}

interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  audience: string;
  time: string;
}

const MENTOR_NAME = "Dr. Maya Fernando";

const STUDENT_OVERVIEW: StudentPreview[] = [
  { id: "student-01", name: "Nethmi Jayawardena", level: "Grade 12 - Advanced Level", progress: 84, weakSubject: "Organic Chemistry" },
  { id: "student-02", name: "Ishara Silva", level: "Grade 11", progress: 76, weakSubject: "Algebra" },
  { id: "student-03", name: "Kavin Dias", level: "Grade 12 - Advanced Level", progress: 68, weakSubject: "Mechanics" },
  { id: "student-04", name: "Anudi Ramanayake", level: "Grade 10", progress: 91, weakSubject: "Essay Structure" },
];

const TOP_PERFORMERS: StudentPreview[] = [
  { id: "top-01", name: "Anudi Ramanayake", level: "Grade 10", progress: 91, weakSubject: "None" },
  { id: "top-02", name: "Nethmi Jayawardena", level: "Grade 12 - Advanced Level", progress: 84, weakSubject: "Organic Chemistry" },
  { id: "top-03", name: "Dilan Perera", level: "Grade 11", progress: 82, weakSubject: "Probability" },
];

const NEEDS_ATTENTION: StudentPreview[] = [
  { id: "attention-01", name: "Kavin Dias", level: "Grade 12 - Advanced Level", progress: 68, weakSubject: "Mechanics" },
  { id: "attention-02", name: "Savin De Costa", level: "Grade 11", progress: 64, weakSubject: "Chemical Bonding" },
  { id: "attention-03", name: "Mihiri Perera", level: "Grade 10", progress: 61, weakSubject: "Comprehension" },
];

const PERFORMANCE_DATA: PerformancePoint[] = [
  { label: "Mon", engagement: 72, averageProgress: 61 },
  { label: "Tue", engagement: 75, averageProgress: 63 },
  { label: "Wed", engagement: 79, averageProgress: 66 },
  { label: "Thu", engagement: 82, averageProgress: 68 },
  { label: "Fri", engagement: 78, averageProgress: 70 },
  { label: "Sat", engagement: 84, averageProgress: 73 },
  { label: "Sun", engagement: 87, averageProgress: 76 },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Create Quiz",
    description: "Launch a new checkpoint or mock test for your assigned learners.",
    icon: <Plus className="h-5 w-5" />,
    href: "/mentor/quizzes",
    accentClassName: "bg-sky-600 text-white shadow-lg shadow-sky-200",
    surfaceClassName: "bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_120%)] shadow-[0_20px_50px_-40px_rgba(37,99,235,0.42)]",
  },
  {
    title: "Upload Notes",
    description: "Add study guides, notes, or handouts to your content library.",
    icon: <Upload className="h-5 w-5" />,
    href: "/mentor/content",
    accentClassName: "bg-emerald-600 text-white shadow-lg shadow-emerald-200",
    surfaceClassName: "bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#d1fae5_120%)] shadow-[0_20px_50px_-40px_rgba(5,150,105,0.34)]",
  },
  {
    title: "Assign Task",
    description: "Push a focused task to students who need a nudge this week.",
    icon: <CheckCircle2 className="h-5 w-5" />,
    href: "/mentor/students",
    accentClassName: "bg-amber-500 text-white shadow-lg shadow-amber-200",
    surfaceClassName: "bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_55%,#fde68a_125%)] shadow-[0_20px_50px_-40px_rgba(217,119,6,0.3)]",
  },
  {
    title: "Manage Content",
    description: "Review existing materials, organize modules, and refresh resources.",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/mentor/content",
    accentClassName: "bg-violet-600 text-white shadow-lg shadow-violet-200",
    surfaceClassName: "bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_55%,#ddd6fe_125%)] shadow-[0_20px_50px_-40px_rgba(109,40,217,0.28)]",
  },
];

const RECENT_DOUBTS: DoubtItem[] = [
  { id: "doubt-01", studentName: "Ishara Silva", title: "Need help with quadratic factorization shortcuts", time: "14 minutes ago", priority: "High" },
  { id: "doubt-02", studentName: "Kavin Dias", title: "Why is this force diagram marked incorrect?", time: "42 minutes ago", priority: "High" },
  { id: "doubt-03", studentName: "Mihiri Perera", title: "How should I structure the literature response?", time: "1 hour ago", priority: "Medium" },
  { id: "doubt-04", studentName: "Anudi Ramanayake", title: "Can you review my organic reaction summary?", time: "2 hours ago", priority: "Low" },
];

const ANNOUNCEMENTS: AnnouncementItem[] = [
  { id: "announcement-01", title: "Weekend revision sprint starts Saturday", summary: "Students will receive a focused schedule covering timed quizzes, recap notes, and live Q&A blocks.", audience: "All assigned students", time: "Posted today" },
  { id: "announcement-02", title: "Mechanics checkpoint quiz opens tomorrow", summary: "The quiz will stay live for 48 hours and should be completed before the group review session.", audience: "Physics group", time: "Posted yesterday" },
  { id: "announcement-03", title: "New chemistry notes uploaded", summary: "Reaction pathway notes and worked examples are now available in the content library.", audience: "Chemistry students", time: "Posted 2 days ago" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[30px] border-slate-200/80 bg-white/95 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.22)]">
      <CardHeader className="pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </CardDescription>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
  accentClassName,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  accentClassName: string;
}) {
  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.24)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{detail}</p>
          </div>
          <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-200/70", accentClassName)}>
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function priorityBadgeClass(priority: DoubtItem["priority"]) {
  if (priority === "High") return "border-transparent bg-rose-100 text-rose-700";
  if (priority === "Medium") return "border-transparent bg-amber-100 text-amber-700";
  return "border-transparent bg-emerald-100 text-emerald-700";
}

export default function MentorDashboardPage() {
  const router = useRouter();

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const averageStudentProgress = useMemo(
    () =>
      Math.round(
        STUDENT_OVERVIEW.reduce((total, student) => total + student.progress, 0) /
          STUDENT_OVERVIEW.length,
      ),
    [],
  );

  const unreadDoubts = useMemo(
    () => RECENT_DOUBTS.filter((item) => item.priority !== "Low").length,
    [],
  );

  const summaryCards = [
    { label: "Total Students", value: "284", detail: "Assigned across mentor cohorts", icon: <Users className="h-5 w-5" />, accentClassName: "from-slate-900 to-slate-700" },
    { label: "Active Students", value: "126", detail: "Learners active in the past 24 hours", icon: <GraduationCap className="h-5 w-5" />, accentClassName: "from-sky-600 to-cyan-500" },
    { label: "Pending Doubts", value: "18", detail: "Questions waiting for mentor response", icon: <MessageSquare className="h-5 w-5" />, accentClassName: "from-amber-500 to-orange-500" },
    { label: "Quizzes Created", value: "42", detail: "Published across all active subjects", icon: <CheckCircle2 className="h-5 w-5" />, accentClassName: "from-emerald-600 to-teal-500" },
    { label: "Study Materials", value: "128", detail: "Notes, guides, and revision uploads", icon: <FileText className="h-5 w-5" />, accentClassName: "from-violet-600 to-fuchsia-500" },
    { label: "Announcements", value: "24", detail: "Mentor updates shared this month", icon: <Megaphone className="h-5 w-5" />, accentClassName: "from-rose-600 to-pink-500" },
  ];

  return (
    <ProtectedDashboardLayout
      role="mentor"
      links={mentorSidebarLinks}
      loadingMessage="Loading your mentor dashboard..."
    >
      <div className="mx-auto max-w-[1600px] space-y-8 pb-8">
        <Card className="relative overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 text-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(59, 130, 246, 0.24), transparent 24%), radial-gradient(circle at 85% 15%, rgba(20, 184, 166, 0.22), transparent 24%), linear-gradient(135deg, rgba(15, 23, 42, 1), rgba(15, 118, 110, 0.96))",
            }}
          />
          <CardContent className="relative p-8 md:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-5">
                <Badge className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Mentor command center
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                    Welcome back, {MENTOR_NAME}
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
                    Your learners are building solid momentum today. Clear the
                    highest-priority doubts, publish one high-value resource, and
                    keep the strongest students moving while supporting the ones who
                    need extra attention.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {todayLabel}
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {averageStudentProgress}% average progress
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {unreadDoubts} priority doubts waiting
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <Button
                  className="h-12 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-100"
                  onClick={() => router.push("/mentor/content")}
                  type="button"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Content
                </Button>
                <Button
                  className="h-12 rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15"
                  onClick={() => router.push("/mentor/quizzes")}
                  type="button"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  View Quizzes
                </Button>
                <Button
                  className="h-12 rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15"
                  onClick={() => router.push("/mentor/students")}
                  type="button"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Students
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {summaryCards.map((item) => (
            <SummaryCard
              key={item.label}
              accentClassName={item.accentClassName}
              detail={item.detail}
              icon={item.icon}
              label={item.label}
              value={item.value}
            />
          ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-8">
            <SectionCard
              action={
                <Button
                  className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 hover:bg-slate-50"
                  onClick={() => router.push("/mentor/students")}
                  type="button"
                  variant="outline"
                >
                  View All Students
                </Button>
              }
              description="A quick snapshot of assigned learners, their current progress, and the weak area that may need coaching next."
              title="Students Overview"
            >
              <div className="space-y-4">
                {STUDENT_OVERVIEW.map((student) => (
                  <div
                    className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5"
                    key={student.id}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-slate-900 text-white">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-slate-950">
                              {student.name}
                            </p>
                            <Badge className="border-transparent bg-slate-100 text-slate-700">
                              {student.level}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            Weak subject: {student.weakSubject}
                          </p>
                        </div>
                      </div>

                      <div className="w-full max-w-[360px] space-y-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-slate-500">Progress</span>
                          <span className="font-semibold text-slate-950">
                            {student.progress}%
                          </span>
                        </div>
                        <Progress
                          className="h-3 bg-slate-200"
                          indicatorClassName="bg-slate-950"
                          value={student.progress}
                        />
                      </div>

                      <Button
                        className="h-10 rounded-2xl bg-slate-950 px-4 text-white hover:bg-slate-800"
                        onClick={() => router.push("/mentor/students")}
                        type="button"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              description="Track how learner engagement and average progress move through the week, then focus on the students at both ends of the curve."
              title="Performance"
            >
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={PERFORMANCE_DATA}
                    margin={{ top: 16, right: 10, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="mentorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="mentorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.36} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(15,23,42,0.08)"
                      strokeDasharray="4 4"
                    />
                    <XAxis
                      axisLine={false}
                      dataKey="label"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickLine={false}
                      tickMargin={12}
                    />
                    <YAxis
                      axisLine={false}
                      domain={[40, 100]}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                      tickLine={false}
                      width={58}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.98)",
                        border: "1px solid rgba(15,23,42,0.08)",
                        borderRadius: "18px",
                        boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
                        padding: "12px 14px",
                      }}
                      formatter={(value: number | string, name: string) => [
                        `${value}%`,
                        name === "engagement" ? "Engagement" : "Average progress",
                      ]}
                      labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                    />
                    <Area
                      dataKey="engagement"
                      fill="url(#mentorEngagement)"
                      name="engagement"
                      stroke="#0f766e"
                      strokeWidth={3}
                      type="monotone"
                    />
                    <Area
                      dataKey="averageProgress"
                      fill="url(#mentorProgress)"
                      name="averageProgress"
                      stroke="#2563eb"
                      strokeWidth={3}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                      <TrendingUp className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-slate-950">
                        Top Performing Students
                      </p>
                      <p className="text-sm text-slate-600">
                        Learners sustaining the strongest momentum.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {TOP_PERFORMERS.map((student) => (
                      <div
                        className="flex items-center justify-between rounded-[22px] border border-emerald-200 bg-white px-4 py-3 shadow-sm"
                        key={student.id}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {student.name}
                            </p>
                            <p className="text-sm text-slate-500">{student.level}</p>
                          </div>
                        </div>
                        <Badge className="border-transparent bg-emerald-600 text-white">
                          {student.progress}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-amber-200 bg-amber-50/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
                      <AlertCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-slate-950">
                        Students Needing Attention
                      </p>
                      <p className="text-sm text-slate-600">
                        The next set of learners to support proactively.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {NEEDS_ATTENTION.map((student) => (
                      <div
                        className="flex items-center justify-between rounded-[22px] border border-amber-200 bg-white px-4 py-3 shadow-sm"
                        key={student.id}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-amber-100 text-amber-700">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {student.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              Weak: {student.weakSubject}
                            </p>
                          </div>
                        </div>
                        <Badge className="border-transparent bg-amber-500 text-white">
                          {student.progress}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-8">
            <SectionCard
              description="High-value teaching actions that keep your content, assessments, and support loop moving."
              title="Quick Actions"
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    className={cn(
                      "group rounded-[28px] border border-slate-200/80 p-5 text-left transition hover:-translate-y-1 hover:shadow-[0_24px_55px_-36px_rgba(15,23,42,0.16)]",
                      action.surfaceClassName,
                    )}
                    key={action.title}
                    onClick={() => router.push(action.href)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl",
                          action.accentClassName,
                        )}
                      >
                        {action.icon}
                      </span>
                      <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-950">
                      {action.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              action={
                <Badge className="border-transparent bg-rose-100 text-rose-700">
                  {unreadDoubts} urgent
                </Badge>
              }
              description="The newest learner questions that are still waiting for a reply."
              title="Recent Doubts and Messages"
            >
              <div className="space-y-4">
                {RECENT_DOUBTS.map((doubt) => (
                  <div
                    className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4"
                    key={doubt.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">
                            {doubt.studentName}
                          </p>
                          <Badge className={priorityBadgeClass(doubt.priority)}>
                            {doubt.priority}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {doubt.title}
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {doubt.time}
                        </div>
                      </div>

                      <Button
                        className="h-10 rounded-2xl bg-slate-950 px-4 text-white hover:bg-slate-800"
                        onClick={() => router.push("/mentor/doubts")}
                        type="button"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              action={
                <Button
                  className="h-10 rounded-2xl bg-slate-950 px-4 text-white hover:bg-slate-800"
                  onClick={() => router.push("/mentor/announcements")}
                  type="button"
                >
                  <Megaphone className="mr-2 h-4 w-4" />
                  Create Announcement
                </Button>
              }
              description="Recent mentor announcements and course-wide updates shared with learners."
              title="Announcements Preview"
            >
              <div className="space-y-4">
                {ANNOUNCEMENTS.map((announcement) => (
                  <div
                    className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4"
                    key={announcement.id}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                        <Megaphone className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">
                            {announcement.title}
                          </p>
                          <Badge className="border-transparent bg-slate-100 text-slate-700">
                            {announcement.audience}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {announcement.summary}
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {announcement.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
