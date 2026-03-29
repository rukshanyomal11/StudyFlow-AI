"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BookOpen,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { studentSidebarLinks } from "@/data/sidebarLinks";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type StudyHoursPoint = {
  day: string;
  hours: number;
  target: number;
};

type SubjectProgressPoint = {
  subject: string;
  progress: number;
};

type CompletionRatePoint = {
  week: string;
  rate: number;
};

type WeakArea = {
  topic: string;
  subject: string;
  mastery: number;
  note: string;
};

const studyHoursData: StudyHoursPoint[] = [
  { day: "Mon", hours: 2.4, target: 3.5 },
  { day: "Tue", hours: 3.1, target: 3.5 },
  { day: "Wed", hours: 2.8, target: 3.5 },
  { day: "Thu", hours: 4.2, target: 3.5 },
  { day: "Fri", hours: 3.6, target: 3.5 },
  { day: "Sat", hours: 4.6, target: 4 },
  { day: "Sun", hours: 3.9, target: 4 },
];

const subjectProgressData: SubjectProgressPoint[] = [
  { subject: "Mathematics", progress: 82 },
  { subject: "Physics", progress: 74 },
  { subject: "Chemistry", progress: 68 },
  { subject: "History", progress: 88 },
  { subject: "English", progress: 79 },
];

const completionRateData: CompletionRatePoint[] = [
  { week: "Week 1", rate: 58 },
  { week: "Week 2", rate: 64 },
  { week: "Week 3", rate: 71 },
  { week: "Week 4", rate: 76 },
  { week: "Week 5", rate: 82 },
];

const weakAreas: WeakArea[] = [
  {
    topic: "Trigonometric Limits",
    subject: "Mathematics",
    mastery: 46,
    note: "Needs one more practice block with worked examples.",
  },
  {
    topic: "Force Diagrams",
    subject: "Physics",
    mastery: 52,
    note: "Most mistakes happen when labeling directions under time pressure.",
  },
  {
    topic: "Organic Reaction Paths",
    subject: "Chemistry",
    mastery: 57,
    note: "Better recall now, but still inconsistent on mechanism matching.",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_30px_70px_-40px_rgba(56,189,248,0.18)]">
      <CardHeader className="pb-5">
        <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
        <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {description}
        </CardDescription>
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
    <Card className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_28px_64px_-42px_rgba(59,130,246,0.2)]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{detail}</p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-200/70 -mt-8",
              accentClassName,
            )}
          >
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentProgressPage() {
  const weeklyProgress = completionRateData.at(-1)?.rate ?? 0;
  const streak = 18;

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your progress dashboard..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[36px] border border-sky-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_22%,#eefcff_54%,#f8fbff_76%,#fff7e8_100%)] p-6 shadow-[0_40px_110px_-52px_rgba(56,189,248,0.28)] sm:p-8">
          <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_32%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[1.06fr_0.94fr] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                <BookOpen className="h-4 w-4 text-blue-700" />
                <span>Progress Analytics</span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Progress dashboard
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Track your study rhythm, see how each subject is moving, and spot
                  the weak areas that need a little more attention this week.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Weekly progress {weeklyProgress}%
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  {subjectProgressData.length} active subjects
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Flame className="h-4 w-4 text-amber-500" />
                  {streak} day streak
                </span>
              </div>
              <div className="rounded-[28px] border border-sky-100/80 bg-white/78 p-5 shadow-[0_24px_56px_-42px_rgba(56,189,248,0.42)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Growth Insight
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Study consistency is improving. Keep leaning into math and history
                  while giving more recovery time to physics and chemistry topics.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.3)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Progress Pulse
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Turn momentum into steady weekly improvement
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.22)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <TrendingUp className="h-4 w-4" />
                    Weekly Progress
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {weeklyProgress}%
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest completion rate across your recent weeks
                  </p>
                </div>
                <div className="rounded-[24px] border border-blue-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(37,99,235,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    <BookOpen className="h-4 w-4" />
                    Subjects
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {subjectProgressData.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Active subjects currently tracked in your charts
                  </p>
                </div>
                <div className="rounded-[24px] border border-amber-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#fff9eb_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(245,158,11,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                    <Flame className="h-4 w-4" />
                    Current Streak
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {streak} days
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Ongoing consistency in your study routine
                  </p>
                </div>
                <div className="rounded-[24px] border border-rose-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f2_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(244,63,94,0.18)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                    <AlertTriangle className="h-4 w-4" />
                    Weak Areas
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {weakAreas.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Topics that still need a little more focused revision
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
          <SectionCard
            title="Study Hours"
            description="Your current week's study pattern compared against the daily target."
          >
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studyHoursData}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#0f172a"
                    strokeWidth={3}
                    dot={{ fill: "#0f172a", strokeWidth: 0, r: 4 }}
                    name="Study Hours"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#0f766e"
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    dot={false}
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Weak Areas"
            description="The topics currently slowing your overall momentum."
          >
            <div className="space-y-4">
              {weakAreas.map((area) => (
                <div
                  className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4"
                  key={area.topic}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {area.topic}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{area.subject}</p>
                    </div>
                    <Badge className="border-transparent bg-rose-100 text-rose-700">
                      {area.mastery}%
                    </Badge>
                  </div>
                  <Progress
                    className="mt-4 h-3"
                    indicatorClassName="bg-rose-500"
                    value={area.mastery}
                  />
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {area.note}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.98fr_1.02fr]">
          <SectionCard
            title="Subject Progress"
            description="A clear comparison of how each active subject is moving right now."
          >
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectProgressData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="subject"
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="progress"
                    fill="#0f172a"
                    radius={[0, 12, 12, 0]}
                    name="Progress %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Completion Rate"
            description="Your task completion rate is trending upward week by week."
          >
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={completionRateData}>
                  <defs>
                    <linearGradient id="completionRateFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#0f766e"
                    strokeWidth={3}
                    fill="url(#completionRateFill)"
                    name="Completion Rate %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 shadow-[0_12px_28px_-18px_rgba(14,165,233,0.3)]">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Strongest Subject
                    </p>
                    <p className="text-sm text-slate-500">History at 88%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 shadow-[0_12px_28px_-18px_rgba(14,165,233,0.3)]">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Best Gain
                    </p>
                    <p className="text-sm text-slate-500">Completion rate up 24 pts</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}





