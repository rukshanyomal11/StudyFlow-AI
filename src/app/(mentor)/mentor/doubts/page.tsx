"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock3,
  Filter,
  MessageSquare,
  Paperclip,
  Send,
  ShieldAlert,
  Sparkles,
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

type DoubtPriority = "Urgent" | "High" | "Normal";
type DoubtStatus = "Pending" | "Reviewing" | "Answered";
type PriorityFilter = "all" | DoubtPriority;
type StatusFilter = "all" | DoubtStatus;

interface DoubtItem {
  id: string;
  studentName: string;
  studentEmail: string;
  level: string;
  subject: string;
  questionTitle: string;
  message: string;
  priority: DoubtPriority;
  status: DoubtStatus;
  createdTime: string;
  attachedContent: string;
  reply: string;
  replyTimeHours?: number;
}

const INITIAL_DOUBTS: DoubtItem[] = [
  {
    id: "doubt-01",
    studentName: "Kavin Dias",
    studentEmail: "kavin.d@studyflow.ai",
    level: "Grade 12 - Advanced Level",
    subject: "Physics",
    questionTitle: "Why is this force diagram marked wrong?",
    message:
      "I followed the same direction arrows from the worked example, but the platform still marks my free-body diagram as incorrect. I am not sure whether the issue is the direction or the number of forces I included.",
    priority: "Urgent",
    status: "Pending",
    createdTime: "14 minutes ago",
    attachedContent: "force-diagram-attempt.png",
    reply: "",
  },
  {
    id: "doubt-02",
    studentName: "Ishara Silva",
    studentEmail: "ishara.s@studyflow.ai",
    level: "Grade 11",
    subject: "Mathematics",
    questionTitle: "Fast way to factor this quadratic?",
    message:
      "I can solve it with trial and error, but I keep taking too long. Is there a quicker pattern for spotting the factors when the middle value is large?",
    priority: "High",
    status: "Reviewing",
    createdTime: "39 minutes ago",
    attachedContent: "quadratic-working.jpg",
    reply: "",
  },
  {
    id: "doubt-03",
    studentName: "Nethmi Jayawardena",
    studentEmail: "nethmi.j@studyflow.ai",
    level: "Grade 12 - Advanced Level",
    subject: "Chemistry",
    questionTitle: "How do I remember reaction pathway order?",
    message:
      "I understand each separate reaction, but I lose track when several steps are linked together in one long conversion problem. Is there a better way to organize the pathway in my notes?",
    priority: "High",
    status: "Answered",
    createdTime: "2 hours ago",
    attachedContent: "organic-pathway-notes.pdf",
    reply:
      "Break the pathway into mini-conversions and annotate each step with reagent, condition, and product family. I also recommend redrawing the chain as a flow map before memorizing it.",
    replyTimeHours: 1.8,
  },
  {
    id: "doubt-04",
    studentName: "Anudi Ramanayake",
    studentEmail: "anudi.r@studyflow.ai",
    level: "Grade 10",
    subject: "Literature",
    questionTitle: "Does this thesis sound too broad?",
    message:
      "I wrote an introduction for the timed essay task, but my thesis feels too general and I am worried it will not guide the rest of the response clearly enough.",
    priority: "Normal",
    status: "Answered",
    createdTime: "Yesterday",
    attachedContent: "essay-introduction-draft.docx",
    reply:
      "Your opening idea is strong, but tighten the thesis by naming the main argument and the two supporting points you plan to develop. That will make the essay direction much clearer.",
    replyTimeHours: 3.2,
  },
  {
    id: "doubt-05",
    studentName: "Savin De Costa",
    studentEmail: "savin.d@studyflow.ai",
    level: "Grade 11",
    subject: "Chemistry",
    questionTitle: "Why do ionic bonds form here instead of covalent?",
    message:
      "I understand the basic rule about electron transfer, but this example still confuses me because both atoms look reactive. I need help deciding what clue matters most in the question.",
    priority: "Urgent",
    status: "Pending",
    createdTime: "Today, 9:20 AM",
    attachedContent: "bonding-question-screenshot.png",
    reply: "",
  },
  {
    id: "doubt-06",
    studentName: "Mihiri Perera",
    studentEmail: "mihiri.p@studyflow.ai",
    level: "Grade 10",
    subject: "English",
    questionTitle: "How can I find the main idea faster?",
    message:
      "I keep rereading the whole passage to understand the main idea, and it takes too much time in comprehension tasks. Is there a faster strategy I can practice?",
    priority: "Normal",
    status: "Reviewing",
    createdTime: "Today, 7:45 AM",
    attachedContent: "reading-passage-highlighted.png",
    reply: "",
  },
];

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[148px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

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

function previewMessage(message: string) {
  return message.length <= 118 ? message : `${message.slice(0, 115)}...`;
}

const SURFACE_CARD_CLASS_NAME =
  "rounded-[30px] border border-slate-200/90 bg-white/95 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.16)] backdrop-blur-sm dark:!border-slate-200 dark:!bg-white dark:!text-slate-950";

const PRIMARY_BUTTON_CLASS_NAME =
  "bg-blue-700 text-white shadow-[0_16px_32px_-20px_rgba(29,78,216,0.62)] hover:bg-blue-800 dark:!bg-blue-700 dark:!text-white dark:hover:!bg-blue-800";

const SECONDARY_BUTTON_CLASS_NAME =
  "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:!border-slate-200 dark:!bg-white dark:!text-slate-900 dark:hover:!bg-slate-50";

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
    <Card className={SURFACE_CARD_CLASS_NAME}>
      <CardHeader className="pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950 dark:!text-slate-950">{title}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:!text-slate-600">
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
    <Card className={cn(SURFACE_CARD_CLASS_NAME, "rounded-[28px]")}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:!text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:!text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:!text-slate-500">{detail}</p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_14px_28px_-16px_rgba(15,23,42,0.4)] -mt-8",
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

function InsightMetric({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/90 bg-white/92 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)]">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-[0_16px_26px_-18px_rgba(37,99,235,0.44)]">
        {icon}
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function priorityBadgeClass(priority: DoubtPriority) {
  if (priority === "Urgent") return "border-rose-200 bg-rose-50 text-rose-800";
  if (priority === "High") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-300 bg-slate-100 text-slate-800";
}

function statusBadgeClass(status: DoubtStatus) {
  if (status === "Answered") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "Reviewing") return "border-cyan-200 bg-cyan-50 text-cyan-800";
  return "border-blue-200 bg-blue-50 text-blue-800";
}

export default function MentorDoubtsPage() {
  const [doubts, setDoubts] = useState(INITIAL_DOUBTS);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [selectedDoubtId, setSelectedDoubtId] = useState(
    INITIAL_DOUBTS[0]?.id ?? "",
  );
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(INITIAL_DOUBTS.map((item) => [item.id, item.reply])),
  );
  const [actionMessage, setActionMessage] = useState(
    "Select a question to review the full doubt and send a mentor reply.",
  );

  const subjectOptions = useMemo(
    () => Array.from(new Set(doubts.map((item) => item.subject))).sort(),
    [doubts],
  );

  const filteredDoubts = useMemo(
    () =>
      doubts.filter((item) => {
        const matchesSubject =
          subjectFilter === "all" || item.subject === subjectFilter;
        const matchesPriority =
          priorityFilter === "all" || item.priority === priorityFilter;
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;

        return matchesSubject && matchesPriority && matchesStatus;
      }),
    [doubts, priorityFilter, statusFilter, subjectFilter],
  );

  const selectedDoubt =
    filteredDoubts.length > 0
      ? filteredDoubts.find((item) => item.id === selectedDoubtId) ??
        filteredDoubts[0]
      : null;

  const totalDoubts = doubts.length;
  const pendingDoubts = doubts.filter((item) => item.status !== "Answered").length;
  const answeredDoubts = doubts.filter((item) => item.status === "Answered").length;
  const urgentDoubts = doubts.filter((item) => item.priority === "Urgent").length;

  const mostAskedSubject = useMemo(() => {
    const counts = doubts.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.subject] = (accumulator[item.subject] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None";
  }, [doubts]);

  const averageReplyTime = useMemo(() => {
    const answered = doubts.filter(
      (item) => item.status === "Answered" && item.replyTimeHours,
    );

    if (!answered.length) {
      return "0h";
    }

    const value =
      answered.reduce((sum, item) => sum + (item.replyTimeHours ?? 0), 0) /
      answered.length;

    return `${value.toFixed(1)}h`;
  }, [doubts]);

  const unresolvedQueue = useMemo(
    () =>
      doubts
        .filter((item) => item.status !== "Answered")
        .sort((a, b) => {
          const order: Record<DoubtPriority, number> = {
            Urgent: 0,
            High: 1,
            Normal: 2,
          };

          return order[a.priority] - order[b.priority];
        })
        .slice(0, 3),
    [doubts],
  );

  const selectedReply =
    selectedDoubt ? replyDrafts[selectedDoubt.id] ?? selectedDoubt.reply : "";

  const openDoubt = (id: string) => {
    const item = doubts.find((doubt) => doubt.id === id);

    if (!item) {
      return;
    }

    setSelectedDoubtId(id);
    setActionMessage(`Reviewing ${item.questionTitle}.`);
  };

  const clearFilters = () => {
    setSubjectFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
    setFiltersExpanded(true);
    setActionMessage("Showing all student doubts again.");
  };

  const handleSendReply = () => {
    if (!selectedDoubt) {
      return;
    }

    const reply = selectedReply.trim();

    if (!reply) {
      setActionMessage("Write a mentor reply before sending it.");
      return;
    }

    const defaultReplyTime =
      selectedDoubt.priority === "Urgent"
        ? 1.4
        : selectedDoubt.priority === "High"
          ? 2.6
          : 4.1;

    setDoubts((current) =>
      current.map((item) =>
        item.id === selectedDoubt.id
          ? {
              ...item,
              status: "Answered",
              reply,
              replyTimeHours: item.replyTimeHours ?? defaultReplyTime,
            }
          : item,
      ),
    );
    setReplyDrafts((current) => ({
      ...current,
      [selectedDoubt.id]: reply,
    }));
    setActionMessage(`Reply sent to ${selectedDoubt.studentName}.`);
  };

  return (
    <ProtectedDashboardLayout
      role="mentor"
      links={mentorSidebarLinks}
      loadingMessage="Loading your doubts workspace..."
    >
      <div className="mx-auto max-w-[1600px] space-y-8 pb-8 text-slate-950">
        <Card className="relative overflow-hidden rounded-[34px] border border-sky-100 bg-transparent text-slate-950 shadow-[0_30px_100px_-48px_rgba(15,23,42,0.24)] dark:!border-sky-100 dark:!bg-transparent dark:!text-slate-950">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(14, 165, 233, 0.2), transparent 24%), radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.16), transparent 24%), radial-gradient(circle at 70% 85%, rgba(245, 158, 11, 0.12), transparent 18%), linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.98) 48%, rgba(236, 253, 245, 0.98) 100%)",
            }}
          />
          <CardContent className="relative p-8 md:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-5">
                <Badge className="rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm dark:!border-sky-200 dark:!bg-white dark:!text-sky-700">
                  <MessageSquare className="mr-2 h-3.5 w-3.5" />
                  Mentor helpdesk queue
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:!text-slate-950">
                    Doubts
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base dark:!text-slate-600">
                    Review student questions, prioritize urgent blockers, and
                    send fast mentor guidance from one clean StudyFlow AI
                    support workspace.
                  </p>
                </div>
              </div>

              <Button
                className={cn("h-12 rounded-2xl px-5 text-sm font-semibold shadow-[0_18px_35px_-18px_rgba(2,132,199,0.45)]", PRIMARY_BUTTON_CLASS_NAME)}
                onClick={() => {
                  setFiltersExpanded((current) => !current);
                  setActionMessage(
                    "Filter questions by subject, priority, or status to narrow the queue.",
                  );
                }}
                type="button"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter Questions
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            accentClassName="from-indigo-700 to-sky-600"
            detail="Open and historical student questions in the queue"
            icon={<MessageSquare className="h-5 w-5" />}
            label="Total Doubts"
            value={`${totalDoubts}`}
          />
          <SummaryCard
            accentClassName="from-amber-500 to-orange-500"
            detail="Questions still waiting for a final mentor answer"
            icon={<Clock3 className="h-5 w-5" />}
            label="Pending"
            value={`${pendingDoubts}`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Doubts that already have a completed mentor reply"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Answered"
            value={`${answeredDoubts}`}
          />
          <SummaryCard
            accentClassName="from-rose-600 to-pink-500"
            detail="Questions marked as high-priority blockers"
            icon={<ShieldAlert className="h-5 w-5" />}
            label="Urgent"
            value={`${urgentDoubts}`}
          />
        </section>

        <SectionCard
          action={
            <Button
              className={cn("h-10 rounded-2xl px-4", SECONDARY_BUTTON_CLASS_NAME)}
              onClick={clearFilters}
              type="button"
              variant="outline"
            >
              Clear Filters
            </Button>
          }
          description="Narrow the doubt queue by subject, priority, and reply status to focus on the questions that matter most right now."
          title="Filters"
        >
          {filtersExpanded ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="subject-filter">
                  Subject
                </label>
                <select
                  className={inputClassName}
                  id="subject-filter"
                  onChange={(event) => {
                    setSubjectFilter(event.target.value);
                    setActionMessage("Subject filter updated.");
                  }}
                  value={subjectFilter}
                >
                  <option value="all">All subjects</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="priority-filter">
                  Priority
                </label>
                <select
                  className={inputClassName}
                  id="priority-filter"
                  onChange={(event) => {
                    setPriorityFilter(event.target.value as PriorityFilter);
                    setActionMessage("Priority filter updated.");
                  }}
                  value={priorityFilter}
                >
                  <option value="all">All priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="status-filter">
                  Status
                </label>
                <select
                  className={inputClassName}
                  id="status-filter"
                  onChange={(event) => {
                    setStatusFilter(event.target.value as StatusFilter);
                    setActionMessage("Status filter updated.");
                  }}
                  value={statusFilter}
                >
                  <option value="all">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Answered">Answered</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
              Filters are hidden right now. Use the button above whenever you
              want to narrow the mentor question queue.
            </div>
          )}
        </SectionCard>

        <div className="grid gap-8 xl:grid-cols-[1.14fr_0.86fr]">
          <SectionCard
            action={
              <Badge className="border-blue-200 bg-blue-50 text-blue-800">
                {filteredDoubts.length} visible
              </Badge>
            }
            description="A clean support queue for reviewing new student doubts, prioritizing blockers, and opening each question for a detailed response."
            title="Doubt Queue"
          >
            <div className="hidden xl:block">
              <div className="grid grid-cols-[1.18fr_0.8fr_1.08fr_1.5fr_0.72fr_0.78fr_0.88fr_0.92fr] gap-4 border-b border-blue-100 px-2 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                <span>Student</span>
                <span>Subject</span>
                <span>Question</span>
                <span>Preview</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Created</span>
                <span>Action</span>
              </div>

              <div className="mt-4 space-y-3">
                {filteredDoubts.map((item) => (
                  <div
                    className={cn(
                      "grid grid-cols-[1.18fr_0.8fr_1.08fr_1.5fr_0.72fr_0.78fr_0.88fr_0.92fr] items-start gap-4 rounded-[24px] border p-4 transition",
                      selectedDoubt?.id === item.id
                        ? "border-blue-300 bg-[linear-gradient(180deg,#eff6ff_0%,#eef8ff_100%)] ring-4 ring-blue-100"
                        : "border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] hover:border-blue-200 hover:shadow-[0_18px_36px_-28px_rgba(37,99,235,0.34)]",
                    )}
                    key={item.id}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-11 w-11 border border-blue-100 bg-white">
                        <AvatarFallback className="bg-blue-50 text-xs font-semibold text-blue-800">
                          {getInitials(item.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {item.studentName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.studentEmail}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.subject}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{item.level}</p>
                    </div>
                    <p className="text-sm font-semibold leading-6 text-slate-950">
                      {item.questionTitle}
                    </p>
                    <p className="text-sm leading-6 text-slate-500">
                      {previewMessage(item.message)}
                    </p>
                    <Badge className={priorityBadgeClass(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge className={statusBadgeClass(item.status)}>
                      {item.status}
                    </Badge>
                    <p className="text-sm text-slate-700">{item.createdTime}</p>
                    <Button
                      className={cn("h-9 rounded-2xl px-3", PRIMARY_BUTTON_CLASS_NAME)}
                      onClick={() => openDoubt(item.id)}
                      type="button"
                    >
                      Reply
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 xl:hidden">
              {filteredDoubts.map((item) => (
                <div
                  className={cn(
                    "rounded-[26px] border p-5 transition",
                    selectedDoubt?.id === item.id
                      ? "border-blue-300 bg-[linear-gradient(180deg,#eff6ff_0%,#eef8ff_100%)] ring-4 ring-blue-100"
                      : "border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] hover:border-blue-200 hover:shadow-[0_18px_36px_-28px_rgba(37,99,235,0.34)]",
                  )}
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-11 w-11 border border-blue-100 bg-white">
                        <AvatarFallback className="bg-blue-50 text-xs font-semibold text-blue-800">
                          {getInitials(item.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-base font-semibold text-slate-950">
                          {item.studentName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{item.subject}</p>
                      </div>
                    </div>
                    <Badge className={priorityBadgeClass(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>

                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-950">
                    {item.questionTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {previewMessage(item.message)}
                  </p>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Status
                      </p>
                      <Badge className={cn("mt-2", statusBadgeClass(item.status))}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Created
                      </p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {item.createdTime}
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Level
                      </p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {item.level}
                      </p>
                    </div>
                  </div>

                  <Button
                    className={cn("mt-4 h-9 rounded-2xl px-4", PRIMARY_BUTTON_CLASS_NAME)}
                    onClick={() => openDoubt(item.id)}
                    type="button"
                  >
                    Reply
                  </Button>
                </div>
              ))}
            </div>

            {filteredDoubts.length === 0 ? (
              <div className="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                No doubts match the current filter set. Clear filters to view the
                full queue again.
              </div>
            ) : null}
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              description="Open a question to review the student context, inspect attached content, and send a mentor response from the same panel."
              title="Doubt Detail"
            >
              {selectedDoubt ? (
                <div className="space-y-5">
                  <div className="rounded-[24px] border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-700">
                    {actionMessage}
                  </div>

                  <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 border border-slate-200/80 bg-white">
                        <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-700">
                          {getInitials(selectedDoubt.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-slate-950">
                            {selectedDoubt.studentName}
                          </h2>
                          <Badge className={statusBadgeClass(selectedDoubt.status)}>
                            {selectedDoubt.status}
                          </Badge>
                          <Badge className={priorityBadgeClass(selectedDoubt.priority)}>
                            {selectedDoubt.priority}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {selectedDoubt.studentEmail}
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              Subject
                            </p>
                            <p className="mt-2 font-semibold text-slate-950">
                              {selectedDoubt.subject}
                            </p>
                          </div>
                          <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              Level
                            </p>
                            <p className="mt-2 font-semibold text-slate-950">
                              {selectedDoubt.level}
                            </p>
                          </div>
                          <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              Created
                            </p>
                            <p className="mt-2 font-semibold text-slate-950">
                              {selectedDoubt.createdTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200/90 bg-white/92 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-[0_16px_26px_-18px_rgba(37,99,235,0.44)]">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Full Question
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedDoubt.questionTitle}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {selectedDoubt.message}
                    </p>
                  </div>

                  <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Paperclip className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Attached Content
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Preview unavailable in this demo workspace
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      {selectedDoubt.attachedContent}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Mentor Reply
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Draft or update the response that will be sent back to
                          the student.
                        </p>
                      </div>
                      {selectedDoubt.replyTimeHours ? (
                        <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                          Replied in {selectedDoubt.replyTimeHours.toFixed(1)}h
                        </Badge>
                      ) : null}
                    </div>

                    <textarea
                      className={cn("mt-4", textareaClassName)}
                      onChange={(event) =>
                        setReplyDrafts((current) => ({
                          ...current,
                          [selectedDoubt.id]: event.target.value,
                        }))
                      }
                      value={selectedReply}
                    />

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-500">
                        {selectedDoubt.status === "Answered"
                          ? "You can refine the reply and send an updated response."
                          : "Send a reply to mark this doubt as answered."}
                      </p>
                      <Button
                        className={cn("h-10 rounded-2xl px-4", PRIMARY_BUTTON_CLASS_NAME)}
                        onClick={handleSendReply}
                        type="button"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  No doubts match the current filters, so there is nothing to
                  inspect in the detail panel right now.
                </div>
              )}
            </SectionCard>

            <SectionCard
              description="Quick support metrics to help you spot the busiest subject areas and the doubts that still need a response."
              title="Quick Insights"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <InsightMetric
                  detail="Subject currently generating the most student help requests."
                  icon={<BookOpen className="h-5 w-5" />}
                  label="Most Asked Subject"
                  value={mostAskedSubject}
                />
                <InsightMetric
                  detail="Average turnaround time across answered doubts."
                  icon={<Clock3 className="h-5 w-5" />}
                  label="Avg Reply Time"
                  value={averageReplyTime}
                />
                <InsightMetric
                  detail="Open questions that still need a final mentor answer."
                  icon={<AlertTriangle className="h-5 w-5" />}
                  label="Unresolved"
                  value={`${pendingDoubts}`}
                />
              </div>

              <div className="mt-6 space-y-4">
                {unresolvedQueue.map((item) => (
                  <div
                    className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm"
                    key={item.id}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">
                            {item.questionTitle}
                          </p>
                          <Badge className={priorityBadgeClass(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {item.studentName} · {item.subject}
                        </p>
                      </div>
                      <Badge className={statusBadgeClass(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#e0f2fe_120%)] p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Support insight
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Science subjects are producing the highest doubt volume in
                      this demo set, and urgent questions are clustering around
                      concept-application tasks. A quick reply loop on physics
                      and chemistry doubts should reduce the open queue fastest.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
