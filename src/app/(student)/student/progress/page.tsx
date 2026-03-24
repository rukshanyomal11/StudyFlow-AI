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
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.22)]">
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
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.25)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{detail}</p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-200/70",
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
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_44%,#dcfce7_120%)] p-6 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                Progress Analytics
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Progress dashboard
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/85 sm:text-base">
                  Track your study rhythm, see how each subject is moving, and spot
                  the weak areas that need a little more attention this week.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-100/90">
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  Weekly progress {weeklyProgress}%
                </span>
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  5 active subjects
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-white/10 px-5 py-4 text-sm text-slate-100/90 backdrop-blur">
              Study consistency is improving. Keep leaning into math and history
              while giving more recovery time to physics and chemistry topics.
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            accentClassName="from-orange-500 to-rose-500"
            detail="Current study streak"
            icon={<Flame className="h-5 w-5" />}
            label="Streak"
            value={`${streak} days`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Latest weekly completion rate"
            icon={<TrendingUp className="h-5 w-5" />}
            label="Weekly Progress"
            value={`${weeklyProgress}%`}
          />
          <SummaryCard
            accentClassName="from-amber-500 to-orange-500"
            detail="Topics currently below 60% mastery"
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Weak Areas"
            value={`${weakAreas.length}`}
          />
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
                  className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4"
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
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
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

              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
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
