"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BookOpen,
  CalendarDays,
  ChartBarStacked,
  Clock3,
  Crown,
  Download,
  Filter,
  GraduationCap,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { adminSidebarLinks } from "@/data/sidebarLinks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TimeRange = "today" | "7d" | "30d" | "90d";

interface SummaryStats {
  totalUsers: string;
  dailyActiveUsers: string;
  weeklySignups: string;
  premiumConversions: string;
  totalStudySessions: string;
  quizzesCompleted: string;
}

interface GrowthPoint {
  label: string;
  totalUsers: number;
  premiumUsers: number;
}

interface ActivityPoint {
  label: string;
  activeUsers: number;
  studySessions: number;
}

interface BreakdownPoint {
  name: string;
  value: number;
  color: string;
}

interface PopularityPoint {
  subject: string;
  learners: number;
}

interface Insights {
  mostActiveFeature: string;
  mostPopularSubject: string;
  averageSessionDuration: string;
  retentionRate: string;
}

interface PerformanceTrend {
  label: string;
  value: string;
  change: string;
  description: string;
  tone: "positive" | "steady";
}

interface AnalyticsDataset {
  summary: SummaryStats;
  userGrowth: GrowthPoint[];
  dailyActivity: ActivityPoint[];
  subscriptionBreakdown: BreakdownPoint[];
  subjectPopularity: PopularityPoint[];
  insights: Insights;
  performance: PerformanceTrend[];
}

const RANGE_LABELS: Record<TimeRange, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

const ANALYTICS_DATA: Record<TimeRange, AnalyticsDataset> = {
  today: {
    summary: {
      totalUsers: "15,420",
      dailyActiveUsers: "3,942",
      weeklySignups: "124",
      premiumConversions: "34",
      totalStudySessions: "1,286",
      quizzesCompleted: "482",
    },
    userGrowth: [
      { label: "12a", totalUsers: 15120, premiumUsers: 4162 },
      { label: "3a", totalUsers: 15164, premiumUsers: 4170 },
      { label: "6a", totalUsers: 15218, premiumUsers: 4182 },
      { label: "9a", totalUsers: 15302, premiumUsers: 4201 },
      { label: "12p", totalUsers: 15388, premiumUsers: 4218 },
      { label: "3p", totalUsers: 15412, premiumUsers: 4239 },
      { label: "6p", totalUsers: 15420, premiumUsers: 4286 },
    ],
    dailyActivity: [
      { label: "6a", activeUsers: 780, studySessions: 140 },
      { label: "8a", activeUsers: 1210, studySessions: 225 },
      { label: "10a", activeUsers: 1840, studySessions: 336 },
      { label: "12p", activeUsers: 2360, studySessions: 422 },
      { label: "2p", activeUsers: 2890, studySessions: 515 },
      { label: "4p", activeUsers: 3420, studySessions: 614 },
      { label: "6p", activeUsers: 3942, studySessions: 706 },
    ],
    subscriptionBreakdown: [
      { name: "Free", value: 11134, color: "#94a3b8" },
      { name: "Pro", value: 2710, color: "#eb6b39" },
      { name: "Team", value: 948, color: "#2b7a78" },
      { name: "Enterprise", value: 628, color: "#1e293b" },
    ],
    subjectPopularity: [
      { subject: "Mathematics", learners: 3820 },
      { subject: "Chemistry", learners: 3015 },
      { subject: "Physics", learners: 2740 },
      { subject: "Biology", learners: 2480 },
      { subject: "Computer Science", learners: 2140 },
    ],
    insights: {
      mostActiveFeature: "AI Quiz Builder",
      mostPopularSubject: "Mathematics",
      averageSessionDuration: "48 mins",
      retentionRate: "72.4%",
    },
    performance: [
      {
        label: "Signups trend",
        value: "+12.4%",
        change: "+34 signups today",
        description: "Higher than the same weekday last week.",
        tone: "positive",
      },
      {
        label: "Engagement trend",
        value: "+9.8%",
        change: "+188 active users",
        description: "Steady gains through planner and quiz usage.",
        tone: "positive",
      },
      {
        label: "Premium growth trend",
        value: "+3.1%",
        change: "+34 conversions",
        description: "Strongest lift from quiz-driven upgrade paths.",
        tone: "steady",
      },
    ],
  },
  "7d": {
    summary: {
      totalUsers: "15,420",
      dailyActiveUsers: "3,781",
      weeklySignups: "542",
      premiumConversions: "126",
      totalStudySessions: "8,942",
      quizzesCompleted: "3,680",
    },
    userGrowth: [
      { label: "Mon", totalUsers: 14912, premiumUsers: 4140 },
      { label: "Tue", totalUsers: 14988, premiumUsers: 4162 },
      { label: "Wed", totalUsers: 15082, premiumUsers: 4190 },
      { label: "Thu", totalUsers: 15194, premiumUsers: 4211 },
      { label: "Fri", totalUsers: 15296, premiumUsers: 4238 },
      { label: "Sat", totalUsers: 15374, premiumUsers: 4262 },
      { label: "Sun", totalUsers: 15420, premiumUsers: 4286 },
    ],
    dailyActivity: [
      { label: "Mon", activeUsers: 3340, studySessions: 1190 },
      { label: "Tue", activeUsers: 3460, studySessions: 1248 },
      { label: "Wed", activeUsers: 3522, studySessions: 1274 },
      { label: "Thu", activeUsers: 3618, studySessions: 1310 },
      { label: "Fri", activeUsers: 3710, studySessions: 1354 },
      { label: "Sat", activeUsers: 3584, studySessions: 1286 },
      { label: "Sun", activeUsers: 3781, studySessions: 1280 },
    ],
    subscriptionBreakdown: [
      { name: "Free", value: 11134, color: "#94a3b8" },
      { name: "Pro", value: 2710, color: "#eb6b39" },
      { name: "Team", value: 948, color: "#2b7a78" },
      { name: "Enterprise", value: 628, color: "#1e293b" },
    ],
    subjectPopularity: [
      { subject: "Mathematics", learners: 3820 },
      { subject: "Chemistry", learners: 3015 },
      { subject: "Physics", learners: 2740 },
      { subject: "Biology", learners: 2480 },
      { subject: "Computer Science", learners: 2140 },
    ],
    insights: {
      mostActiveFeature: "Study Planner",
      mostPopularSubject: "Mathematics",
      averageSessionDuration: "46 mins",
      retentionRate: "74.1%",
    },
    performance: [
      {
        label: "Signups trend",
        value: "+16.7%",
        change: "+542 weekly signups",
        description: "Strong acquisition lift from organic referrals.",
        tone: "positive",
      },
      {
        label: "Engagement trend",
        value: "+11.2%",
        change: "+7.8k weekly active sessions",
        description: "Daily habit streaks are climbing steadily.",
        tone: "positive",
      },
      {
        label: "Premium growth trend",
        value: "+8.9%",
        change: "+126 upgrades",
        description: "Mentor-backed quiz packs are converting well.",
        tone: "positive",
      },
    ],
  },
  "30d": {
    summary: {
      totalUsers: "15,420",
      dailyActiveUsers: "3,608",
      weeklySignups: "2,182",
      premiumConversions: "312",
      totalStudySessions: "48,320",
      quizzesCompleted: "18,240",
    },
    userGrowth: [
      { label: "Week 1", totalUsers: 13640, premiumUsers: 3870 },
      { label: "Week 2", totalUsers: 14220, premiumUsers: 3982 },
      { label: "Week 3", totalUsers: 14760, premiumUsers: 4094 },
      { label: "Week 4", totalUsers: 15120, premiumUsers: 4182 },
      { label: "Now", totalUsers: 15420, premiumUsers: 4286 },
    ],
    dailyActivity: [
      { label: "Mon", activeUsers: 3410, studySessions: 1450 },
      { label: "Tue", activeUsers: 3528, studySessions: 1510 },
      { label: "Wed", activeUsers: 3608, studySessions: 1584 },
      { label: "Thu", activeUsers: 3560, studySessions: 1542 },
      { label: "Fri", activeUsers: 3498, studySessions: 1486 },
      { label: "Sat", activeUsers: 3320, studySessions: 1394 },
      { label: "Sun", activeUsers: 3388, studySessions: 1430 },
    ],
    subscriptionBreakdown: [
      { name: "Free", value: 11134, color: "#94a3b8" },
      { name: "Pro", value: 2710, color: "#eb6b39" },
      { name: "Team", value: 948, color: "#2b7a78" },
      { name: "Enterprise", value: 628, color: "#1e293b" },
    ],
    subjectPopularity: [
      { subject: "Mathematics", learners: 3820 },
      { subject: "Chemistry", learners: 3015 },
      { subject: "Physics", learners: 2740 },
      { subject: "Biology", learners: 2480 },
      { subject: "Computer Science", learners: 2140 },
    ],
    insights: {
      mostActiveFeature: "AI Quiz Builder",
      mostPopularSubject: "Mathematics",
      averageSessionDuration: "49 mins",
      retentionRate: "76.8%",
    },
    performance: [
      {
        label: "Signups trend",
        value: "+21.3%",
        change: "+2,182 monthly signups",
        description: "The acquisition curve continues to accelerate.",
        tone: "positive",
      },
      {
        label: "Engagement trend",
        value: "+14.0%",
        change: "+48.3k study sessions",
        description: "Higher planner retention is lifting total activity.",
        tone: "positive",
      },
      {
        label: "Premium growth trend",
        value: "+9.5%",
        change: "+312 premium conversions",
        description: "Upgrade intent is strongest after quiz streak milestones.",
        tone: "positive",
      },
    ],
  },
  "90d": {
    summary: {
      totalUsers: "15,420",
      dailyActiveUsers: "3,442",
      weeklySignups: "6,486",
      premiumConversions: "892",
      totalStudySessions: "132,880",
      quizzesCompleted: "54,930",
    },
    userGrowth: [
      { label: "Jan", totalUsers: 11240, premiumUsers: 3280 },
      { label: "Feb", totalUsers: 12780, premiumUsers: 3574 },
      { label: "Mar", totalUsers: 13940, premiumUsers: 3892 },
      { label: "Apr", totalUsers: 14780, premiumUsers: 4096 },
      { label: "May", totalUsers: 15260, premiumUsers: 4218 },
      { label: "Jun", totalUsers: 15420, premiumUsers: 4286 },
    ],
    dailyActivity: [
      { label: "Week 1", activeUsers: 2860, studySessions: 1184 },
      { label: "Week 4", activeUsers: 3015, studySessions: 1276 },
      { label: "Week 8", activeUsers: 3224, studySessions: 1388 },
      { label: "Week 12", activeUsers: 3442, studySessions: 1496 },
    ],
    subscriptionBreakdown: [
      { name: "Free", value: 11134, color: "#94a3b8" },
      { name: "Pro", value: 2710, color: "#eb6b39" },
      { name: "Team", value: 948, color: "#2b7a78" },
      { name: "Enterprise", value: 628, color: "#1e293b" },
    ],
    subjectPopularity: [
      { subject: "Mathematics", learners: 3820 },
      { subject: "Chemistry", learners: 3015 },
      { subject: "Physics", learners: 2740 },
      { subject: "Biology", learners: 2480 },
      { subject: "Computer Science", learners: 2140 },
    ],
    insights: {
      mostActiveFeature: "Study Planner",
      mostPopularSubject: "Mathematics",
      averageSessionDuration: "51 mins",
      retentionRate: "78.9%",
    },
    performance: [
      {
        label: "Signups trend",
        value: "+28.6%",
        change: "+6,486 signups in 90 days",
        description: "Sustained growth through referrals and mentor demand.",
        tone: "positive",
      },
      {
        label: "Engagement trend",
        value: "+18.4%",
        change: "+132.8k total sessions",
        description: "Long-term retention is compounding session volume.",
        tone: "positive",
      },
      {
        label: "Premium growth trend",
        value: "+13.2%",
        change: "+892 premium conversions",
        description: "Enterprise and team plans are accelerating the mix shift.",
        tone: "positive",
      },
    ],
  },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatCompactNumber(value: number) {
  if (value >= 1000) {
    const compact =
      value >= 10000 ? (value / 1000).toFixed(0) : (value / 1000).toFixed(1);
    return `${compact.replace(".0", "")}k`;
  }

  return `${value}`;
}

function exportAnalyticsReport(range: TimeRange, dataset: AnalyticsDataset) {
  const payload = {
    app: "StudyFlow AI",
    range: RANGE_LABELS[range],
    exportedAt: "2026-03-24T09:30:00.000Z",
    summary: dataset.summary,
    insights: dataset.insights,
    performance: dataset.performance,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `studyflow-analytics-${range}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function SummaryCard({
  title,
  value,
  helper,
  icon: Icon,
  accentClassName,
}: {
  title: string;
  value: string;
  helper: string;
  icon: typeof Users;
  accentClassName: string;
}) {
  return (
    <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {value}
            </p>
            <p className="mt-3 text-sm text-slate-500">{helper}</p>
          </div>

          <div
            className={cn(
              "inline-flex rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg",
              accentClassName,
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
      className={cn(
        "card-surface rounded-[32px] border border-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.08)]",
        className,
      )}
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

function InsightCard({
  title,
  value,
  helper,
  icon: Icon,
  accentClassName,
}: {
  title: string;
  value: string;
  helper: string;
  icon: typeof Sparkles;
  accentClassName: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={cn(
            "inline-flex rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg",
            accentClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{helper}</p>
    </div>
  );
}

function PerformanceCard({
  trend,
}: {
  trend: PerformanceTrend;
}) {
  return (
    <div className="rounded-[28px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-medium text-slate-500">{trend.label}</p>
      <div className="mt-3 flex items-center gap-3">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-semibold",
            trend.tone === "positive"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700",
          )}
        >
          {trend.value}
        </span>
        <span className="text-sm font-semibold text-slate-900">{trend.change}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{trend.description}</p>
    </div>
  );
}

function DateRangeMenu({
  activeRange,
  onSelect,
}: {
  activeRange: TimeRange;
  onSelect: (range: TimeRange) => void;
}) {
  return (
    <details className="group relative [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex h-12 cursor-pointer list-none items-center rounded-2xl border border-white/12 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15">
        <CalendarDays className="mr-2 h-4 w-4" />
        Date Range Filter
      </summary>

      <div className="absolute right-0 top-14 z-30 w-52 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        {(
          Object.entries(RANGE_LABELS) as Array<[TimeRange, string]>
        ).map(([range, label]) => (
          <button
            key={range}
            type="button"
            className={cn(
              "flex w-full items-center rounded-2xl px-3 py-2 text-left text-sm transition",
              activeRange === range
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100",
            )}
            onClick={(event) => {
              if (event.currentTarget.parentElement?.parentElement instanceof HTMLElement) {
                event.currentTarget.parentElement.parentElement.removeAttribute("open");
              }
              onSelect(range);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}

export default function AdminAnalyticsPage() {
  const [activeRange, setActiveRange] = useState<TimeRange>("30d");

  const dataset = ANALYTICS_DATA[activeRange];
  const summaryCards = [
    {
      title: "Total Users",
      value: dataset.summary.totalUsers,
      helper: "Accounts across students, mentors, and admins",
      icon: Users,
      accentClassName: "from-slate-900 via-slate-800 to-slate-700",
    },
    {
      title: "Daily Active Users",
      value: dataset.summary.dailyActiveUsers,
      helper: `Active users for ${RANGE_LABELS[activeRange].toLowerCase()}`,
      icon: Activity,
      accentClassName: "from-emerald-700 to-teal-500",
    },
    {
      title: "Weekly Signups",
      value: dataset.summary.weeklySignups,
      helper: "New user acquisition this reporting window",
      icon: UserPlus,
      accentClassName: "from-sky-600 to-cyan-500",
    },
    {
      title: "Premium Conversions",
      value: dataset.summary.premiumConversions,
      helper: "Users upgraded into paid plans",
      icon: Crown,
      accentClassName: "from-amber-500 to-orange-500",
    },
    {
      title: "Total Study Sessions",
      value: dataset.summary.totalStudySessions,
      helper: "Planner and focus session volume",
      icon: Clock3,
      accentClassName: "from-violet-600 to-indigo-500",
    },
    {
      title: "Quizzes Completed",
      value: dataset.summary.quizzesCompleted,
      helper: "Completed practice and assessment runs",
      icon: BookOpen,
      accentClassName: "from-rose-600 to-red-500",
    },
  ];

  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading analytics workspace..."
    >
      <div className="mx-auto max-w-[1600px] space-y-8 pb-8">
        <Card className="relative overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 text-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(241, 184, 75, 0.24), transparent 24%), radial-gradient(circle at 85% 15%, rgba(45, 212, 191, 0.18), transparent 24%), linear-gradient(135deg, rgba(15, 23, 42, 1), rgba(30, 41, 59, 0.96))",
            }}
          />
          <CardContent className="relative p-8 md:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-5">
                <Badge className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white">
                  <TrendingUp className="mr-2 h-3.5 w-3.5" />
                  Admin analytics
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                    Analytics
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
                    Track StudyFlow AI growth, engagement, monetization, and subject adoption from a premium SaaS analytics command center.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    Reporting range: {RANGE_LABELS[activeRange]}
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {dataset.insights.retentionRate} retention rate
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {dataset.insights.averageSessionDuration} avg session time
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <Button
                  type="button"
                  className="h-12 rounded-2xl border-[color:var(--accent)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[color:var(--accent-strong)]"
                  onClick={() => exportAnalyticsReport(activeRange, dataset)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
                <DateRangeMenu
                  activeRange={activeRange}
                  onSelect={setActiveRange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <SectionShell
          title="Filters"
          description="Switch the analytics window to compare short-term spikes against longer-term growth and retention."
        >
          <div className="flex flex-wrap gap-3">
            {(Object.entries(RANGE_LABELS) as Array<[TimeRange, string]>).map(
              ([range, label]) => (
                <Button
                  key={range}
                  type="button"
                  variant={activeRange === range ? "default" : "outline"}
                  className={cn(
                    "rounded-2xl px-5",
                    activeRange === range
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                  onClick={() => setActiveRange(range)}
                >
                  {label}
                </Button>
              ),
            )}
          </div>
        </SectionShell>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {summaryCards.map((item) => (
            <SummaryCard
              key={item.title}
              title={item.title}
              value={item.value}
              helper={item.helper}
              icon={item.icon}
              accentClassName={item.accentClassName}
            />
          ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-2">
          <SectionShell
            title="User Growth"
            description="Total users and premium users over the selected range."
            action={
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <LineChartIcon className="h-4 w-4" />
                Line chart
              </div>
            }
          >
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataset.userGrowth}
                  margin={{ top: 12, right: 10, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(15, 23, 42, 0.08)"
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
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={formatCompactNumber}
                    tickLine={false}
                    width={56}
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
                      typeof value === "number"
                        ? new Intl.NumberFormat("en-US").format(value)
                        : value,
                      name === "totalUsers" ? "Total users" : "Premium users",
                    ]}
                    labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                  />
                  <Legend verticalAlign="top" height={28} />
                  <Line
                    type="monotone"
                    dataKey="totalUsers"
                    name="Total users"
                    stroke="#eb6b39"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#eb6b39" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="premiumUsers"
                    name="Premium users"
                    stroke="#2b7a78"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#2b7a78" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionShell>

          <SectionShell
            title="Daily Activity"
            description="Active users and study session volume across the current reporting window."
            action={
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <ChartBarStacked className="h-4 w-4" />
                Bar chart
              </div>
            }
          >
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataset.dailyActivity}
                  margin={{ top: 12, right: 10, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(15, 23, 42, 0.08)"
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
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={formatCompactNumber}
                    tickLine={false}
                    width={56}
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
                      typeof value === "number"
                        ? new Intl.NumberFormat("en-US").format(value)
                        : value,
                      name === "activeUsers" ? "Active users" : "Study sessions",
                    ]}
                    labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                  />
                  <Legend verticalAlign="top" height={28} />
                  <Bar
                    dataKey="activeUsers"
                    fill="#2b7a78"
                    name="Active users"
                    radius={[10, 10, 0, 0]}
                  />
                  <Bar
                    dataKey="studySessions"
                    fill="#eb6b39"
                    name="Study sessions"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionShell>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <SectionShell
            title="Subscription Breakdown"
            description="Current plan mix across free and paid subscriptions."
            action={
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <PieChartIcon className="h-4 w-4" />
                Pie chart
              </div>
            }
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataset.subscriptionBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={118}
                      paddingAngle={4}
                    >
                      {dataset.subscriptionBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.98)",
                        border: "1px solid rgba(15,23,42,0.08)",
                        borderRadius: "18px",
                        boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
                        padding: "12px 14px",
                      }}
                      formatter={(value: number | string) => [
                        typeof value === "number"
                          ? new Intl.NumberFormat("en-US").format(value)
                          : value,
                        "Users",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {dataset.subscriptionBreakdown.map((entry) => (
                  <div
                    key={entry.name}
                    className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {entry.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {entry.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionShell>

          <SectionShell
            title="Subject Popularity"
            description="Top subjects ranked by active learner demand in the selected range."
          >
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={dataset.subjectPopularity}
                  margin={{ top: 8, right: 18, left: 30, bottom: 0 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="rgba(15, 23, 42, 0.08)"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={formatCompactNumber}
                    tickLine={false}
                    type="number"
                  />
                  <YAxis
                    axisLine={false}
                    dataKey="subject"
                    tick={{ fill: "#334155", fontSize: 12 }}
                    tickLine={false}
                    type="category"
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.98)",
                      border: "1px solid rgba(15,23,42,0.08)",
                      borderRadius: "18px",
                      boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
                      padding: "12px 14px",
                    }}
                    formatter={(value: number | string) => [
                      typeof value === "number"
                        ? new Intl.NumberFormat("en-US").format(value)
                        : value,
                      "Learners",
                    ]}
                  />
                  <Bar
                    dataKey="learners"
                    fill="#eb6b39"
                    radius={[0, 10, 10, 0]}
                    name="Learners"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionShell>
        </div>

        <SectionShell
          title="Insight Cards"
          description="Fast signals from the current analytics range to guide admin decisions."
        >
          <div className="grid gap-4 lg:grid-cols-4">
            <InsightCard
              title="Most Active Feature"
              value={dataset.insights.mostActiveFeature}
              helper="Feature driving the most repeat engagement in this range."
              icon={Sparkles}
              accentClassName="from-slate-900 to-teal-700"
            />
            <InsightCard
              title="Most Popular Subject"
              value={dataset.insights.mostPopularSubject}
              helper="Highest learner demand across active study plans."
              icon={GraduationCap}
              accentClassName="from-sky-600 to-cyan-500"
            />
            <InsightCard
              title="Average Session Duration"
              value={dataset.insights.averageSessionDuration}
              helper="Typical focused learning time per completed session."
              icon={Clock3}
              accentClassName="from-amber-500 to-orange-500"
            />
            <InsightCard
              title="Retention Rate"
              value={dataset.insights.retentionRate}
              helper="Share of users returning during the current period."
              icon={TrendingUp}
              accentClassName="from-emerald-700 to-teal-500"
            />
          </div>
        </SectionShell>

        <SectionShell
          title="Recent Performance Summary"
          description="Trend summaries for acquisition, engagement, and premium growth in the selected range."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {dataset.performance.map((trend) => (
              <PerformanceCard key={trend.label} trend={trend} />
            ))}
          </div>
        </SectionShell>
      </div>
    </ProtectedDashboardLayout>
  );
}
