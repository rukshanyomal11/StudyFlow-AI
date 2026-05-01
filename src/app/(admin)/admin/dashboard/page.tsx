"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  RefreshCcw,
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
import {
  buildAdminDashboardViewModel,
  loadAdminDashboardData,
} from "@/lib/admin-dashboard-client";

type HeroAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  variant: "default" | "outline" | "secondary";
  className: string;
};

type QuickSetting = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accentClassName: string;
};

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

const statIcons: Record<string, LucideIcon> = {
  Users,
  GraduationCap,
  Briefcase,
  Activity,
  Crown,
  ClipboardCheck,
};

const analyticsIcons: Record<string, LucideIcon> = {
  Sparkles,
  Clock3,
  BookOpen,
};

const reportStatusClasses: Record<string, string> = {
  Open: "!border-amber-300 !bg-amber-100 !text-amber-900",
  Investigating: "!border-sky-300 !bg-sky-100 !text-sky-900",
  Resolved: "!border-emerald-300 !bg-emerald-100 !text-emerald-900",
};

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
    const compact = value >= 10000 ? (value / 1000).toFixed(0) : (value / 1000).toFixed(1);
    return `${compact.replace(".0", "")}k`;
  }

  return `${value}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercentLabel(value: string) {
  return value;
}

function parseCount(value: string) {
  return Number.parseInt(value.replace(/,/g, ""), 10) || 0;
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
      className={`rounded-4xl border border-slate-200/90 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${className}`}
    >
      <CardHeader className="gap-4 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
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

function RoleBadge({ role }: { role: "Student" | "Mentor" | "Admin" }) {
  const className =
    role === "Admin"
      ? "!border-violet-300 !bg-violet-100 !text-violet-900"
      : role === "Mentor"
        ? "!border-emerald-300 !bg-emerald-100 !text-emerald-900"
        : "!border-sky-300 !bg-sky-100 !text-sky-900";

  return (
    <Badge className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold ${className}`}>
      {role}
    </Badge>
  );
}

function StatusBadge({
  status,
}: {
  status: "Active" | "Pending" | "Suspended" | "Open" | "Investigating" | "Resolved";
}) {
  const className =
    status === "Active" || status === "Resolved"
      ? "!border-emerald-300 !bg-emerald-100 !text-emerald-900"
      : status === "Pending" || status === "Investigating" || status === "Open"
        ? "!border-amber-300 !bg-amber-100 !text-amber-900"
        : "!border-rose-300 !bg-rose-100 !text-rose-900";

  return (
    <Badge className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold ${className}`}>
      {status}
    </Badge>
  );
}

function reportTypeClass(type: string) {
  if (type === "Community") {
    return "!border-fuchsia-200 !bg-fuchsia-50 !text-fuchsia-800";
  }

  if (type === "Content") {
    return "!border-indigo-200 !bg-indigo-50 !text-indigo-800";
  }

  if (type === "Billing") {
    return "!border-amber-200 !bg-amber-50 !text-amber-800";
  }

  return "!border-rose-200 !bg-rose-50 !text-rose-800";
}

function LoadingState() {
  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading admin dashboard..."
    >
      <div className="mx-auto max-w-400 space-y-8 pb-8">
        <Card className="rounded-[34px] border border-sky-100 bg-white text-slate-950 shadow-[0_30px_100px_rgba(14,165,233,0.16)]">
          <CardContent className="p-8 md:p-10 xl:p-12">
            <div className="flex items-center gap-3 text-slate-600">
              <RefreshCcw className="h-5 w-5 animate-spin text-sky-600" />
              Loading live admin metrics...
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedDashboardLayout>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading admin dashboard..."
    >
      <div className="mx-auto max-w-400 space-y-8 pb-8">
        <Card className="rounded-[34px] border border-rose-100 bg-white text-slate-950 shadow-[0_30px_100px_rgba(244,63,94,0.1)]">
          <CardContent className="space-y-4 p-8 md:p-10 xl:p-12">
            <div className="flex items-center gap-3 text-rose-700">
              <Settings2 className="h-5 w-5" />
              Failed to load live admin data
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">{message}</p>
            <Button
              type="button"
              className="rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white hover:bg-sky-700"
              onClick={onRetry}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedDashboardLayout>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [sourceData, setSourceData] = useState<Awaited<ReturnType<typeof loadAdminDashboardData>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);

      try {
        const data = await loadAdminDashboardData();

        if (!cancelled) {
          setSourceData(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load admin dashboard.");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const dashboard = useMemo(() => {
    if (!sourceData) {
      return null;
    }

    const adminName = session?.user?.name?.trim() || "Admin";
    return buildAdminDashboardViewModel(sourceData, adminName);
  }, [session?.user?.name, sourceData]);

  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  if (!dashboard && !error) {
    return <LoadingState />;
  }

  if (!dashboard && error) {
    return <ErrorState message={error} onRetry={() => setRefreshKey((value) => value + 1)} />;
  }

  const totalSubscribers = parseCount(dashboard.revenueSummary.freeUsers) + parseCount(dashboard.revenueSummary.premiumUsers);
  const premiumShare = totalSubscribers > 0 ? Math.round((parseCount(dashboard.revenueSummary.premiumUsers) / totalSubscribers) * 100) : 0;
  const freeShare = 100 - premiumShare;
  const adminName = dashboard.adminName;

  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading admin dashboard..."
    >
      <div className="mx-auto max-w-400 space-y-8 pb-8">
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
                  <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/95 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-sky-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    Admin command center
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                    <CalendarDays className="h-4 w-4" />
                    <span>{currentDate}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    {getGreeting()}, {adminName}
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                    {dashboard.summary}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {dashboard.heroHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-sky-100 bg-white/90 p-4 shadow-[0_18px_40px_rgba(14,165,233,0.08)]"
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

              <div className="flex flex-wrap gap-3 xl:max-w-130 xl:justify-end">
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
          {dashboard.stats.map((stat) => {
            const Icon = statIcons[stat.icon];

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
                          {formatPercentLabel(stat.delta)}
                        </span>
                        <span className="text-slate-500">{stat.detail}</span>
                      </div>
                    </div>

                    <div
                      className={`inline-flex rounded-2xl bg-linear-to-br ${stat.accentClassName} p-3 text-white shadow-lg`}
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
                  className="rounded-2xl border-slate-300! bg-white! px-4 text-slate-900! hover:bg-slate-50! dark:border-slate-300! dark:bg-white! dark:text-slate-900!"
                  onClick={() => router.push("/admin/users")}
                >
                  Open user hub
                </Button>
              }
            >
              <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_auto] gap-4 px-2 pb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 md:grid">
                <span>User</span>
                <span>Role</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="space-y-3">
                {dashboard.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid gap-4 rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:grid-cols-[minmax(0,2fr)_1fr_1fr_auto] md:items-center"
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
                        <p className="truncate text-sm text-slate-600">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500 md:hidden">
                          Last seen {user.lastSeen}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:justify-start">
                      <RoleBadge role={user.role} />
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-start">
                      <StatusBadge status={user.status} />
                      <span className="hidden text-sm text-slate-500 xl:inline">
                        {user.lastSeen}
                      </span>
                    </div>

                    <div className="flex justify-start md:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl border-slate-300! bg-white! px-4 text-slate-900! hover:bg-slate-50! dark:border-slate-300! dark:bg-white! dark:text-slate-900!"
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
              description="Monitor monthly new user growth alongside daily active participation to spot momentum across the platform."
              action={
                <Badge className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-600">
                  Last 6 months
                </Badge>
              }
            >
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#eb6b39]" />
                  New users
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2b7a78]" />
                  Active users
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboard.chartData}
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
                      dataKey="period"
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
                        name === "newUsers" ? "New users" : "Active users",
                      ]}
                      labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                    />

                    <Area
                      dataKey="activeUsers"
                      fill="url(#activeUsersFill)"
                      name="Active users"
                      stroke="#2b7a78"
                      strokeWidth={3}
                      type="monotone"
                    />

                    <Area
                      dataKey="newUsers"
                      fill="url(#totalUsersFill)"
                      name="New users"
                      stroke="#eb6b39"
                      strokeWidth={3}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {dashboard.analyticsHighlights.map((item) => {
                  const Icon = analyticsIcons[item.icon];

                  return (
                    <div
                      key={item.label}
                      className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-600">
                            {item.label}
                          </p>
                          <p className="text-2xl font-semibold tracking-tight text-slate-900">
                            {item.value}
                          </p>
                        </div>

                        <div
                          className={`inline-flex rounded-2xl bg-linear-to-br ${item.accentClassName} p-3 text-white shadow-lg`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
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
              className="border-sky-200/80 bg-linear-to-br from-white via-sky-50/35 to-cyan-50/45"
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-sky-300! bg-sky-600! px-4 text-white! hover:bg-sky-700! dark:border-sky-300! dark:bg-sky-600! dark:text-white!"
                  onClick={() => router.push("/admin/reports")}
                >
                  View all reports
                </Button>
              }
            >
              <div className="space-y-3">
                {dashboard.reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-[26px] border border-sky-100 bg-linear-to-br from-white to-sky-50/45 p-5 shadow-[0_12px_30px_rgba(14,165,233,0.08)]"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <p className="text-base font-semibold leading-6 text-slate-900">
                            {report.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold ${reportTypeClass(
                                report.type,
                              )}`}
                            >
                              {report.type}
                            </Badge>
                            <StatusBadge status={report.status} />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-sky-300! bg-white! px-4 text-sky-800! hover:bg-sky-50! dark:border-sky-300! dark:bg-white! dark:text-sky-800!"
                          onClick={() => router.push(report.reviewHref)}
                        >
                          Review
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4" />
                        <span>{report.submittedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>

            <Card className="relative overflow-hidden rounded-4xl border border-sky-100 bg-white text-slate-950 shadow-[0_24px_80px_rgba(14,165,233,0.14)]">
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
                      {dashboard.revenueSummary.monthlyRevenue}
                    </h2>
                    <p className="text-sm leading-6 text-slate-600">
                      {dashboard.revenueSummary.note}
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
                        {dashboard.revenueSummary.freeUsers} ({freeShare}%)
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
                        {dashboard.revenueSummary.premiumUsers} ({premiumShare}%)
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
                  <div className="rounded-3xl border border-sky-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                      Conversion rate
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {dashboard.revenueSummary.conversionRate}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4">
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <BarChart3 className="h-4 w-4" />
                      Revenue summary
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {dashboard.revenueSummary.annualRunRate}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {dashboard.revenueSummary.premiumGrowthLabel}
                </p>
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
                      className="group rounded-[28px] border border-slate-200/80 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
                      onClick={() => router.push(item.href)}
                    >
                      <div className="flex h-full flex-col">
                        <div className="mb-5 flex items-start justify-between gap-3">
                          <div
                            className={`inline-flex rounded-2xl bg-linear-to-br ${item.accentClassName} p-3 text-white shadow-lg`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <ArrowRight className="h-5 w-5 text-slate-500 transition duration-300 group-hover:translate-x-1 group-hover:text-slate-800" />
                        </div>

                        <p className="text-lg font-semibold tracking-tight text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
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
