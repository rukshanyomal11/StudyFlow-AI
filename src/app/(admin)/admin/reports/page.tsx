"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  AlertTriangle,
  Ban,
  BookText,
  CalendarDays,
  Eye,
  FileWarning,
  Filter,
  Flag,
  MoreHorizontal,
  OctagonAlert,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserRoundX,
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

type ReportStatus = "Pending" | "Investigating" | "Resolved" | "Dismissed";
type ReportPriority = "Low" | "Medium" | "High" | "Critical";
type ReportType =
  | "Community"
  | "Content"
  | "Billing"
  | "Safety"
  | "Academic";
type DateFilter = "All dates" | "Today" | "Last 7 days" | "Last 30 days";
type StatusFilter = "All statuses" | ReportStatus;
type PriorityFilter = "All priorities" | ReportPriority;
type TypeFilter = "All types" | ReportType;
type ReviewAction = "Resolve" | "Dismiss" | "Remove Content" | "Suspend User";

interface ReporterInfo {
  name: string;
  email: string;
  role: "Student" | "Mentor" | "Moderator";
}

interface ReportRecord {
  id: string;
  title: string;
  type: ReportType;
  reportedBy: ReporterInfo;
  reportedItem: string;
  priority: ReportPriority;
  status: ReportStatus;
  createdAt: string;
  description: string;
  reportedContent: string;
  adminNote: string;
  targetUser: string;
  contentLocation: string;
}

interface ModerationActivityRecord {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  adminName: string;
}

const STATUS_OPTIONS: StatusFilter[] = [
  "All statuses",
  "Pending",
  "Investigating",
  "Resolved",
  "Dismissed",
];

const PRIORITY_OPTIONS: PriorityFilter[] = [
  "All priorities",
  "Low",
  "Medium",
  "High",
  "Critical",
];

const TYPE_OPTIONS: TypeFilter[] = [
  "All types",
  "Community",
  "Content",
  "Billing",
  "Safety",
  "Academic",
];

const DATE_OPTIONS: DateFilter[] = [
  "All dates",
  "Today",
  "Last 7 days",
  "Last 30 days",
];

const CURRENT_DATE = new Date("2026-03-24T09:30:00.000Z");

const INITIAL_REPORTS: ReportRecord[] = [
  {
    id: "rpt-1001",
    title: "Spam links posted inside A/L Physics group discussion",
    type: "Community",
    reportedBy: {
      name: "Sadia Nazeer",
      email: "sadia.n@studyflow.ai",
      role: "Student",
    },
    reportedItem: "Group thread message",
    priority: "High",
    status: "Pending",
    createdAt: "2026-03-24T07:15:00.000Z",
    description:
      "A student flagged a burst of repeated external promo links posted in the Physics revision group within a ten-minute window.",
    reportedContent:
      "Join this exam leak channel now: bit.ly/fast-pass. Limited seats, guaranteed answers, DM before link expires.",
    adminNote:
      "Monitor for repeat activity across other STEM groups before taking final action.",
    targetUser: "Kane Rodrigo",
    contentLocation: "Physics Group / Week 12 Revision Thread",
  },
  {
    id: "rpt-1002",
    title: "Chemistry explanation marked inaccurate by mentors",
    type: "Content",
    reportedBy: {
      name: "Dilan Fernando",
      email: "dilan.f@studyflow.ai",
      role: "Mentor",
    },
    reportedItem: "AI-generated quiz explanation",
    priority: "Critical",
    status: "Investigating",
    createdAt: "2026-03-23T15:40:00.000Z",
    description:
      "Multiple mentors reported that the oxidation-state explanation in a top-performing quiz conflicts with the official syllabus guide.",
    reportedContent:
      "The explanation states manganese changes from +7 to +3 in this step, which does not align with the reaction path used in the accepted answer.",
    adminNote:
      "Escalated to content QA and flagged for hotfix if validated.",
    targetUser: "System content block #QZ-2081",
    contentLocation: "Quiz Builder / Chemistry / Redox Reactions",
  },
  {
    id: "rpt-1003",
    title: "Repeated failed payment retry on premium renewals",
    type: "Billing",
    reportedBy: {
      name: "Finance Monitor",
      email: "payments@studyflow.ai",
      role: "Moderator",
    },
    reportedItem: "Subscription billing workflow",
    priority: "Medium",
    status: "Pending",
    createdAt: "2026-03-22T11:20:00.000Z",
    description:
      "A batch of premium renewals entered a retry loop and triggered duplicate failure notices for a segment of users.",
    reportedContent:
      "Renewal queue retried card authorization three times for the same invoice, producing duplicate alert emails.",
    adminNote:
      "Coordinate with billing engineering before sending follow-up comms.",
    targetUser: "18 premium accounts",
    contentLocation: "Subscriptions / Renewal Queue / Batch 03-22",
  },
  {
    id: "rpt-1004",
    title: "Harassment complaint in mentor direct chat",
    type: "Safety",
    reportedBy: {
      name: "Trust & Safety Desk",
      email: "safety@studyflow.ai",
      role: "Moderator",
    },
    reportedItem: "Private message thread",
    priority: "Critical",
    status: "Resolved",
    createdAt: "2026-03-21T13:05:00.000Z",
    description:
      "The complaint includes threatening language and repeated attempts to pressure a mentor outside the platform.",
    reportedContent:
      "If you don't send the answer sheet tonight, I'll post your profile everywhere and make sure no one studies with you again.",
    adminNote:
      "Account suspended and content escalated to trust and safety protocol.",
    targetUser: "Nadeesha K",
    contentLocation: "Mentor Inbox / Case 4819",
  },
  {
    id: "rpt-1005",
    title: "Essay prompt duplicated across history practice set",
    type: "Academic",
    reportedBy: {
      name: "Amina Perera",
      email: "amina.p@studyflow.ai",
      role: "Moderator",
    },
    reportedItem: "Practice prompt bank",
    priority: "Low",
    status: "Dismissed",
    createdAt: "2026-03-19T08:30:00.000Z",
    description:
      "A duplicate prompt was reported in a history set, but the second item was confirmed to use a different marking rubric and source pack.",
    reportedContent:
      "Discuss the long-term impact of industrialization on urban labour conditions in 19th century Europe.",
    adminNote:
      "Confirmed as intentional variant. No change required.",
    targetUser: "History prompt library",
    contentLocation: "Humanities / History / Essay Practice Pack",
  },
  {
    id: "rpt-1006",
    title: "Leaderboard manipulation suspected in timed quiz sprint",
    type: "Academic",
    reportedBy: {
      name: "Marcus Perera",
      email: "marcus.p@studyflow.ai",
      role: "Mentor",
    },
    reportedItem: "Timed quiz attempt record",
    priority: "High",
    status: "Investigating",
    createdAt: "2026-03-24T05:45:00.000Z",
    description:
      "An account posted perfect scores across multiple advanced quiz sets in implausibly short completion windows.",
    reportedContent:
      "Three Advanced Mathematics quizzes completed within 90 seconds each with 100% accuracy and no recorded answer revisions.",
    adminNote:
      "Cross-check with session telemetry and answer event logs.",
    targetUser: "Ruwan Liyanage",
    contentLocation: "Quiz Arena / Advanced Mathematics / Sprint Board",
  },
];

const INITIAL_ACTIVITY: ModerationActivityRecord[] = [
  {
    id: "act-1001",
    action: "Resolved safety report",
    target: "Harassment complaint in mentor direct chat",
    timestamp: "Today, 8:42 AM",
    adminName: "Amina Perera",
  },
  {
    id: "act-1002",
    action: "Requested QA review",
    target: "Chemistry explanation marked inaccurate by mentors",
    timestamp: "Today, 7:18 AM",
    adminName: "Ishara Senanayake",
  },
  {
    id: "act-1003",
    action: "Dismissed duplicate content report",
    target: "Essay prompt duplicated across history practice set",
    timestamp: "Mar 23, 2026",
    adminName: "Amina Perera",
  },
];

const MODERATION_RULES = [
  "Critical safety and harassment reports must be reviewed within 30 minutes.",
  "Content accuracy flags affecting quizzes require mentor or QA confirmation before dismissal.",
  "Billing and payment reports should preserve audit context before any customer-facing action.",
  "Repeat abuse patterns trigger account suspension review after moderator confirmation.",
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function closeParentDetails(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  target.closest("details")?.removeAttribute("open");
}

function isWithinDateFilter(reportDate: string, filter: DateFilter) {
  if (filter === "All dates") {
    return true;
  }

  const created = new Date(reportDate);
  const diffMs = CURRENT_DATE.getTime() - created.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (filter === "Today") {
    return diffDays < 1;
  }

  if (filter === "Last 7 days") {
    return diffDays <= 7;
  }

  return diffDays <= 30;
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
  icon: typeof FileWarning;
  accentClassName: string;
}) {
  return (
    <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {value}
            </p>
            <p className="mt-3 text-sm text-slate-500">{helper}</p>
          </div>

          <div
            className={cn(
              "inline-flex rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg -mt-8",
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
        "rounded-[32px] border border-sky-200/80 bg-gradient-to-br from-white via-sky-50/25 to-cyan-50/35 shadow-[0_24px_80px_rgba(15,23,42,0.08)]",
        className,
      )}
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

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const statusClassName =
    status === "Resolved"
      ? "!border-emerald-300 !bg-emerald-100 !text-emerald-900"
      : status === "Dismissed"
        ? "!border-slate-300 !bg-slate-200 !text-slate-900"
        : status === "Investigating"
          ? "!border-sky-300 !bg-sky-100 !text-sky-900"
          : "!border-amber-300 !bg-amber-100 !text-amber-900";

  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[0.72rem] font-semibold", statusClassName)}>
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: ReportPriority }) {
  const priorityClassName =
    priority === "Critical"
      ? "!border-rose-300 !bg-rose-100 !text-rose-900"
      : priority === "High"
        ? "!border-orange-300 !bg-orange-100 !text-orange-900"
        : priority === "Medium"
          ? "!border-amber-300 !bg-amber-100 !text-amber-900"
          : "!border-slate-300 !bg-slate-200 !text-slate-900";

  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[0.72rem] font-semibold", priorityClassName)}>
      {priority}
    </Badge>
  );
}

function TypeBadge({ type }: { type: ReportType }) {
  const typeClassName =
    type === "Safety"
      ? "!border-rose-300 !bg-rose-100 !text-rose-900"
      : type === "Content"
        ? "!border-violet-300 !bg-violet-100 !text-violet-900"
        : type === "Community"
          ? "!border-sky-300 !bg-sky-100 !text-sky-900"
          : type === "Billing"
            ? "!border-emerald-300 !bg-emerald-100 !text-emerald-900"
            : "!border-slate-300 !bg-slate-200 !text-slate-900";

  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[0.72rem] font-semibold", typeClassName)}>
      {type}
    </Badge>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon: typeof Shield;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>(INITIAL_REPORTS);
  const [activity, setActivity] =
    useState<ModerationActivityRecord[]>(INITIAL_ACTIVITY);
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All statuses");
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("All priorities");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All types");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All dates");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [reviewReportId, setReviewReportId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [noteFeedback, setNoteFeedback] = useState("");

  const activeReport =
    reports.find((report) => report.id === reviewReportId) ?? null;

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const matchesStatus =
          statusFilter === "All statuses" || report.status === statusFilter;
        const matchesPriority =
          priorityFilter === "All priorities" ||
          report.priority === priorityFilter;
        const matchesType =
          typeFilter === "All types" || report.type === typeFilter;
        const matchesDate = isWithinDateFilter(report.createdAt, dateFilter);

        return matchesStatus && matchesPriority && matchesType && matchesDate;
      }),
    [dateFilter, priorityFilter, reports, statusFilter, typeFilter],
  );

  useEffect(() => {
    if (!reviewReportId && !rulesOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setReviewReportId(null);
        setRulesOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reviewReportId, rulesOpen]);

  const summaryCards = [
    {
      title: "Total Reports",
      value: reports.length.toLocaleString(),
      helper: "All moderation and platform reports",
      icon: FileWarning,
      accentClassName: "from-indigo-700 to-sky-600",
    },
    {
      title: "Pending Reports",
      value: reports
        .filter(
          (report) =>
            report.status === "Pending" || report.status === "Investigating",
        )
        .length.toLocaleString(),
      helper: "Awaiting action or under review",
      icon: ShieldAlert,
      accentClassName: "from-amber-500 to-orange-500",
    },
    {
      title: "Resolved Reports",
      value: reports
        .filter((report) => report.status === "Resolved")
        .length.toLocaleString(),
      helper: "Closed with moderation action",
      icon: Shield,
      accentClassName: "from-emerald-700 to-teal-500",
    },
    {
      title: "Critical Reports",
      value: reports
        .filter((report) => report.priority === "Critical")
        .length.toLocaleString(),
      helper: "Highest risk items requiring admin attention",
      icon: OctagonAlert,
      accentClassName: "from-rose-600 to-red-500",
    },
  ];

  function openReview(report: ReportRecord) {
    setReviewReportId(report.id);
    setReviewNote(report.adminNote);
    setNoteFeedback("");
  }

  function closeReview() {
    setReviewReportId(null);
    setReviewNote("");
    setNoteFeedback("");
  }

  function addActivityEntry(action: string, target: string) {
    setActivity((current) => [
      {
        id: `act-${current.length + 1004}`,
        action,
        target,
        timestamp: "Just now",
        adminName: "Amina Perera",
      },
      ...current,
    ]);
  }

  function saveAdminNote() {
    if (!activeReport) {
      return;
    }

    setReports((current) =>
      current.map((report) =>
        report.id === activeReport.id
          ? { ...report, adminNote: reviewNote.trim() }
          : report,
      ),
    );
    addActivityEntry("Updated admin note", activeReport.title);
    setNoteFeedback("Admin note saved.");
  }

  function handleReviewAction(action: ReviewAction) {
    if (!activeReport) {
      return;
    }

    const nextStatus: ReportStatus =
      action === "Resolve" || action === "Remove Content" || action === "Suspend User"
        ? "Resolved"
        : "Dismissed";

    const appendedNote =
      reviewNote.trim().length > 0
        ? `${reviewNote.trim()}\n\nAction: ${action}`
        : `Action: ${action}`;

    setReports((current) =>
      current.map((report) =>
        report.id === activeReport.id
          ? { ...report, status: nextStatus, adminNote: appendedNote }
          : report,
      ),
    );

    addActivityEntry(action, activeReport.title);
    setReviewNote(appendedNote);
    setNoteFeedback(`${action} completed.`);
  }

  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading reports and moderation workspace..."
    >
      <div className="mx-auto max-w-[1600px] space-y-8 pb-8">
        <Card className="relative overflow-hidden rounded-[34px] border border-sky-100 bg-transparent text-slate-950 shadow-[0_30px_100px_rgba(14,165,233,0.16)]">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 24%), radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.14), transparent 24%), radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.12), transparent 28%), linear-gradient(135deg, rgba(255,255,255,1), rgba(240,249,255,0.98) 52%, rgba(236,253,245,0.98))",
            }}
          />
          <CardContent className="relative p-8 md:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-5">
                <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/95 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-sky-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                  <ShieldAlert className="mr-2 h-3.5 w-3.5" />
                  Admin moderation center
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    Reports
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                    Review safety, content, academic, and billing reports from one
                    premium moderation workspace built for fast admin response.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <div className="rounded-full border border-sky-100 bg-white px-4 py-2 shadow-sm">
                    {reports.filter((report) => report.priority === "Critical").length} critical cases
                  </div>
                  <div className="rounded-full border border-sky-100 bg-white px-4 py-2 shadow-sm">
                    {reports.filter((report) => report.status === "Pending").length} new today
                  </div>
                  <div className="rounded-full border border-sky-100 bg-white px-4 py-2 shadow-sm">
                    {activity.length} moderation log entries
                  </div>
                </div>
              </div>

              <div className="flex justify-start xl:justify-end">
                <Button
                  type="button"
                  className="h-12 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white hover:bg-sky-700"
                  onClick={() => setRulesOpen(true)}
                >
                  <BookText className="mr-2 h-4 w-4" />
                  Moderation Rules
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
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

        <SectionShell
          title="Filters"
          description="Narrow the moderation queue by status, severity, report type, and reporting window."
        >
          <div className="grid gap-4 lg:grid-cols-4">
            <FilterSelect
              label="Status"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            />
            <FilterSelect
              label="Priority"
              value={priorityFilter}
              options={PRIORITY_OPTIONS}
              onChange={(event) =>
                setPriorityFilter(event.target.value as PriorityFilter)
              }
            />
            <FilterSelect
              label="Type"
              value={typeFilter}
              options={TYPE_OPTIONS}
              onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
            />
            <FilterSelect
              label="Date"
              value={dateFilter}
              options={DATE_OPTIONS}
              onChange={(event) => setDateFilter(event.target.value as DateFilter)}
            />
          </div>
        </SectionShell>

        <div className="grid gap-8 2xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)]">
          <SectionShell
            title="Reports Queue"
            description="Open reports prioritized for admin review, with full context on reporter, target item, and severity."
            className="h-fit"
          >
            {filteredReports.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center">
                <div className="mx-auto inline-flex rounded-2xl bg-sky-600 p-3 text-white shadow-lg shadow-sky-100">
                  <Filter className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  No reports match these filters
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Adjust one or more filters to bring additional reports back
                  into the moderation queue.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden xl:block">
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          <th className="pb-2 pl-3">Report title</th>
                          <th className="pb-2">Reported by</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Reported item</th>
                          <th className="pb-2">Priority</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Created date</th>
                          <th className="pb-2 pr-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map((report) => (
                          <tr key={report.id}>
                            <td className="rounded-l-[24px] border border-r-0 border-slate-200/80 bg-white py-4 pl-3 align-top">
                              <div className="max-w-[320px]">
                                <p className="font-semibold text-slate-900">
                                  {report.title}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                  {report.description}
                                </p>
                              </div>
                            </td>
                            <td className="border border-l-0 border-r-0 border-slate-200/80 bg-white py-4 align-top">
                              <div className="text-sm font-semibold text-slate-900">
                                {report.reportedBy.name}
                              </div>
                              <div className="mt-1 text-sm text-slate-600">
                                {report.reportedBy.email}
                              </div>
                            </td>
                            <td className="border border-l-0 border-r-0 border-slate-200/80 bg-white py-4 align-top">
                              <TypeBadge type={report.type} />
                            </td>
                            <td className="border border-l-0 border-r-0 border-slate-200/80 bg-white py-4 align-top text-sm text-slate-700">
                              {report.reportedItem}
                            </td>
                            <td className="border border-l-0 border-r-0 border-slate-200/80 bg-white py-4 align-top">
                              <PriorityBadge priority={report.priority} />
                            </td>
                            <td className="border border-l-0 border-r-0 border-slate-200/80 bg-white py-4 align-top">
                              <StatusBadge status={report.status} />
                            </td>
                            <td className="border border-l-0 border-r-0 border-slate-200/80 bg-white py-4 align-top text-sm text-slate-700">
                              {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }).format(new Date(report.createdAt))}
                            </td>
                            <td className="rounded-r-[24px] border border-l-0 border-slate-200/80 bg-white py-4 pr-3 align-top">
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="rounded-2xl !border-sky-300 !bg-white px-4 !text-sky-800 hover:!bg-sky-50 dark:!border-sky-300 dark:!bg-white dark:!text-sky-800"
                                  onClick={() => openReview(report)}
                                >
                                  Review
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4 xl:hidden">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-lg font-semibold tracking-tight text-slate-900">
                            {report.title}
                          </p>
                          <p className="text-sm text-slate-600">
                            Reported by {report.reportedBy.name}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl !border-sky-300 !bg-white px-4 !text-sky-800 hover:!bg-sky-50 dark:!border-sky-300 dark:!bg-white dark:!text-sky-800"
                          onClick={() => openReview(report)}
                        >
                          Review
                        </Button>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {report.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <TypeBadge type={report.type} />
                        <PriorityBadge priority={report.priority} />
                        <StatusBadge status={report.status} />
                      </div>

                      <div className="mt-4 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Item:</span>{" "}
                        {report.reportedItem}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SectionShell>

          <SectionShell
            title="Moderation Activity"
            description="A rolling feed of recent admin moderation decisions, escalations, and note updates."
          >
            <div className="space-y-4">
              {activity.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[26px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex rounded-2xl bg-gradient-to-br from-indigo-700 to-sky-600 p-3 text-white shadow-lg">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-slate-900">
                        {entry.action}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {entry.target}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        <span>{entry.timestamp}</span>
                        <span>{entry.adminName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionShell>
        </div>

        {reviewReportId && activeReport ? (
          <div className="fixed inset-0 z-50 flex justify-end">
            <button
              type="button"
              aria-label="Close review panel"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
              onClick={closeReview}
            />

            <div className="relative z-10 h-full w-full max-w-2xl overflow-y-auto border-l border-white/20 bg-[#fcfaf6] shadow-[-30px_0_80px_rgba(15,23,42,0.18)]">
              <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-[#fcfaf6]/95 px-6 py-5 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600">
                      Review report
                    </Badge>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        {activeReport.title}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Review reporter context, flagged content, and moderation notes before taking action.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-3 hover:bg-slate-50"
                    onClick={closeReview}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="inline-flex rounded-2xl bg-gradient-to-br from-indigo-700 to-sky-600 p-3 text-white shadow-lg">
                          <Flag className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                            {activeReport.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {activeReport.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <TypeBadge type={activeReport.type} />
                        <PriorityBadge priority={activeReport.priority} />
                        <StatusBadge status={activeReport.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                      Full Report Details
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-500">
                      Complete context for the flagged item, reporter, and moderation scope.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <InfoItem
                      label="Reported by"
                      value={activeReport.reportedBy.name}
                      icon={Shield}
                    />
                    <InfoItem
                      label="Reporter email"
                      value={activeReport.reportedBy.email}
                      icon={BookText}
                    />
                    <InfoItem
                      label="Reported item"
                      value={activeReport.reportedItem}
                      icon={FileWarning}
                    />
                    <InfoItem
                      label="Reported user"
                      value={activeReport.targetUser}
                      icon={UserRoundX}
                    />
                    <InfoItem
                      label="Created date"
                      value={new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(activeReport.createdAt))}
                      icon={CalendarDays}
                    />
                    <InfoItem
                      label="Location"
                      value={activeReport.contentLocation}
                      icon={BookText}
                    />
                  </CardContent>
                </Card>

                <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                      Reported Content
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-500">
                      Content snapshot captured at the time of the report.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-[24px] border border-rose-100 bg-rose-50/80 p-5">
                      <p className="text-sm leading-7 text-slate-700">
                        {activeReport.reportedContent}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                      Admin Note
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-500">
                      Record the investigation summary, evidence, or moderation context.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      rows={6}
                      value={reviewNote}
                      onChange={(event) => {
                        setReviewNote(event.target.value);
                        setNoteFeedback("");
                      }}
                      className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                    />

                    {noteFeedback ? (
                      <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {noteFeedback}
                      </div>
                    ) : null}

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                      onClick={saveAdminNote}
                    >
                      Save Note
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    className="rounded-2xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                    onClick={() => handleReviewAction("Resolve")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Resolve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-5 hover:bg-slate-50"
                    onClick={() => handleReviewAction("Dismiss")}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Dismiss
                  </Button>
                  <Button
                    type="button"
                    className="rounded-2xl bg-[color:var(--accent)] px-5 text-white hover:bg-[color:var(--accent-strong)]"
                    onClick={() => handleReviewAction("Remove Content")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Content
                  </Button>
                  <Button
                    type="button"
                    className="rounded-2xl bg-rose-600 px-5 text-white hover:bg-rose-700"
                    onClick={() => handleReviewAction("Suspend User")}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend User
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {rulesOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              type="button"
              aria-label="Close moderation rules"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
              onClick={() => setRulesOpen(false)}
            />

            <Card className="relative z-10 w-full max-w-2xl rounded-[32px] border border-white/50 bg-[#fcfaf6] shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600">
                      Moderation rules
                    </Badge>
                    <div>
                      <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                        Core moderation guidelines
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                        Working rules used by the StudyFlow AI admin team for consistent moderation.
                      </CardDescription>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-3 hover:bg-slate-50"
                    onClick={() => setRulesOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {MODERATION_RULES.map((rule, index) => (
                  <div
                    key={rule}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="inline-flex rounded-2xl bg-gradient-to-br from-indigo-700 to-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-lg">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-7 text-slate-700">{rule}</p>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={() => setRulesOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </ProtectedDashboardLayout>
  );
}
