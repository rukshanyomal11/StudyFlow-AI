"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  ListTodo,
  PlayCircle,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { studentSidebarLinks } from "@/data/sidebarLinks";
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
import { getTaskPriorityLabel } from "@/lib/task-utils";

interface TaskItem {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

interface ApiTask {
  _id: string;
  title: string;
  subjectName?: string;
  date: string;
  duration?: number;
  priority?: string;
  status?: string;
}

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  label: string;
  href: string;
}

interface DeadlineItem {
  id: string;
  title: string;
  subject: string;
  dueLabel: string;
  status: "Urgent" | "Upcoming" | "Planned";
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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
    <Card className="relative overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] shadow-[0_28px_72px_-40px_rgba(99,102,241,0.16)]">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.08),transparent_30%),radial-gradient(circle_at_center,rgba(251,191,36,0.05),transparent_36%)]" />
      <CardHeader className="relative pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-950">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              {description}
            </CardDescription>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">{children}</CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
  accentClassName,
  cardClassName,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  accentClassName: string;
  cardClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[30px] border border-white/80 shadow-[0_24px_56px_-34px_rgba(59,130,246,0.16)]",
        cardClassName,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.24),transparent_42%)]" />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-600">{label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">{detail}</p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_16px_30px_-16px_rgba(15,23,42,0.28)]",
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

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "rec-01",
    title: "Revisit mathematics tonight",
    description:
      "Your strongest momentum is in calculus right now. A short review session will help lock in retention before tomorrow.",
    label: "Open planner",
    href: "/student/planner",
  },
  {
    id: "rec-02",
    title: "Start a 45-minute focus session",
    description:
      "You usually perform best between 6:30 PM and 8:00 PM. A guided study sprint fits your current streak pattern.",
    label: "Start session",
    href: "/student/pomodoro",
  },
  {
    id: "rec-03",
    title: "Take a physics checkpoint quiz",
    description:
      "A quick quiz can help surface weak spots before your next mechanics deadline and improve confidence.",
    label: "Take quiz",
    href: "/student/quizzes",
  },
];

const DEADLINES: DeadlineItem[] = [
  {
    id: "deadline-01",
    title: "Physics lab report",
    subject: "Physics",
    dueLabel: "Due tomorrow at 10:00 AM",
    status: "Urgent",
  },
  {
    id: "deadline-02",
    title: "Mathematics worksheet submission",
    subject: "Mathematics",
    dueLabel: "Due in 2 days",
    status: "Upcoming",
  },
  {
    id: "deadline-03",
    title: "Chemistry quiz prep checklist",
    subject: "Chemistry",
    dueLabel: "Due in 4 days",
    status: "Planned",
  },
];

function getRecommendationTone(id: string) {
  if (id === "rec-01") {
    return {
      cardClassName:
        "border-sky-100/80 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_56%,#dbeafe_118%)] shadow-[0_18px_42px_-30px_rgba(37,99,235,0.18)]",
      iconClassName:
        "bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white shadow-[0_16px_34px_-18px_rgba(37,99,235,0.32)]",
      buttonClassName: "text-sky-700 hover:text-blue-700",
    };
  }

  if (id === "rec-02") {
    return {
      cardClassName:
        "border-violet-100/80 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_56%,#e0f2fe_118%)] shadow-[0_18px_42px_-30px_rgba(124,58,237,0.16)]",
      iconClassName:
        "bg-[linear-gradient(135deg,#8b5cf6_0%,#ec4899_100%)] text-white shadow-[0_16px_34px_-18px_rgba(139,92,246,0.3)]",
      buttonClassName: "text-violet-700 hover:text-fuchsia-700",
    };
  }

  return {
    cardClassName:
      "border-emerald-100/80 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_56%,#d1fae5_118%)] shadow-[0_18px_42px_-30px_rgba(13,148,136,0.18)]",
    iconClassName:
      "bg-[linear-gradient(135deg,#10b981_0%,#14b8a6_100%)] text-white shadow-[0_16px_34px_-18px_rgba(16,185,129,0.28)]",
    buttonClassName: "text-emerald-700 hover:text-teal-700",
  };
}

function getDeadlineTone(status: DeadlineItem["status"]) {
  if (status === "Urgent") {
    return {
      cardClassName:
        "border-rose-100/80 bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_62%,#ffe4e6_118%)] shadow-[0_18px_42px_-30px_rgba(244,63,94,0.16)]",
      badgeClassName: "border-transparent bg-rose-500 text-white",
      chipClassName:
        "rounded-full border border-rose-100 bg-white px-3 py-1 font-medium text-slate-600 shadow-sm",
    };
  }

  if (status === "Upcoming") {
    return {
      cardClassName:
        "border-amber-100/80 bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_62%,#fef3c7_118%)] shadow-[0_18px_42px_-30px_rgba(245,158,11,0.16)]",
      badgeClassName: "border-transparent bg-amber-500 text-white",
      chipClassName:
        "rounded-full border border-amber-100 bg-white px-3 py-1 font-medium text-slate-600 shadow-sm",
    };
  }

  return {
    cardClassName:
      "border-sky-100/80 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_62%,#e0f2fe_118%)] shadow-[0_18px_42px_-30px_rgba(37,99,235,0.14)]",
    badgeClassName: "border-transparent bg-sky-100 text-sky-700",
    chipClassName:
      "rounded-full border border-sky-100 bg-white px-3 py-1 font-medium text-slate-600 shadow-sm",
  };
}

function getDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function mapApiTaskToDashboardTask(task: ApiTask): TaskItem {
  const parsedDate = new Date(task.date);

  return {
    id: task._id,
    title: task.title,
    subject: task.subjectName?.trim() || "General",
    date: getDateInputValue(parsedDate),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(parsedDate),
    duration: `${typeof task.duration === "number" ? task.duration : 60} min`,
    priority: getTaskPriorityLabel(task.priority) as TaskItem["priority"],
    completed: task.status === "completed",
  };
}

async function readApiError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [taskStatusMessage, setTaskStatusMessage] = useState(
    "Loading your saved tasks...",
  );

  useEffect(() => {
    let isActive = true;

    const loadTasks = async () => {
      setIsLoadingTasks(true);

      try {
        const response = await fetch("/api/tasks", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(
            await readApiError(
              response,
              "Unable to load your planner tasks right now.",
            ),
          );
        }

        const data = (await response.json()) as { tasks?: ApiTask[] };
        const nextTasks = Array.isArray(data.tasks)
          ? data.tasks.map(mapApiTaskToDashboardTask)
          : [];

        if (!isActive) {
          return;
        }

        setAllTasks(nextTasks);
        setTaskStatusMessage(
          nextTasks.length
            ? "Today's task widget is synced with your planner."
            : "No saved tasks yet. Add one from the planner.",
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        setTaskStatusMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your planner tasks right now.",
        );
      } finally {
        if (isActive) {
          setIsLoadingTasks(false);
        }
      }
    };

    void loadTasks();

    return () => {
      isActive = false;
    };
  }, []);

  const todayDate = getDateInputValue(new Date());
  const tasks = useMemo(
    () => allTasks.filter((task) => task.date === todayDate),
    [allTasks, todayDate],
  );
  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const completedTasks = allTasks.filter((task) => task.completed).length;
  const activeSubjects = new Set(allTasks.map((task) => task.subject)).size;
  const studyHours = 28.5;
  const streak = 18;
  const dailyGoalHours = 4;
  const todayHours = 2.8;
  const goalProgress = Math.round((todayHours / dailyGoalHours) * 100);
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setPendingTaskId(taskId);
    setTaskStatusMessage(
      completed ? "Marking task as to do..." : "Marking task as done...",
    );

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: completed ? "pending" : "completed",
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Unable to update this task right now."),
        );
      }

      const data = (await response.json()) as { task?: ApiTask };

      if (!data.task) {
        throw new Error("Task update succeeded but no task was returned.");
      }

      const nextTask = mapApiTaskToDashboardTask(data.task);

      setAllTasks((current) =>
        current.map((task) => (task.id === taskId ? nextTask : task)),
      );
      setTaskStatusMessage(
        completed
          ? "Task moved back into your queue."
          : "Task marked as completed.",
      );
    } catch (error) {
      setTaskStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to update this task right now.",
      );
    } finally {
      setPendingTaskId(null);
    }
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your dashboard..."
    >
      <div className="space-y-8 pb-8">
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_18%,#f2f7ff_34%,#f6f3ff_58%,#fff8ef_82%,#fffdf9_100%)]" />
        <div className="fixed left-[-80px] top-[120px] -z-10 h-[260px] w-[260px] rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="fixed right-[-60px] top-[220px] -z-10 h-[280px] w-[280px] rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="fixed bottom-[30px] left-[30%] -z-10 h-[220px] w-[220px] rounded-full bg-amber-200/15 blur-3xl" />

        <section className="relative overflow-hidden rounded-[36px] border border-white/85 bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_24%,#ecfeff_52%,#eef2ff_78%,#fff8e8_108%)] p-6 shadow-[0_32px_84px_-44px_rgba(56,189,248,0.22)] sm:p-8">
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(37,99,235,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_58%)]" />
          <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute right-10 top-4 h-36 w-36 rounded-full bg-fuchsia-200/24 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-36 w-36 rounded-full bg-amber-200/20 blur-3xl" />
          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_340px] xl:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-700" />
                Student Dashboard
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Welcome back, Nethmi
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700">
                  Your study momentum looks strong today. Keep your streak alive,
                  finish the most important tasks first, and let StudyFlow AI guide
                  the next best step.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-2xl border border-white/90 bg-white/88 px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(59,130,246,0.14)] backdrop-blur-sm">
                  {todayLabel}
                </span>
                <span className="rounded-2xl border border-white/90 bg-white/88 px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(99,102,241,0.14)] backdrop-blur-sm">
                  Grade 12 - Advanced Level
                </span>
                <span className="rounded-2xl border border-white/90 bg-white/88 px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(14,165,233,0.14)] backdrop-blur-sm">
                  {allTasks.length} tasks queued
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="h-11 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_40%,#7c3aed_100%)] px-5 text-white shadow-[0_20px_40px_-22px_rgba(37,99,235,0.46)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                  onClick={() => router.push("/student/planner")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
                <Button
                  className="h-11 rounded-2xl border border-white/90 bg-white/88 px-5 font-semibold text-sky-700 shadow-[0_16px_34px_-24px_rgba(56,189,248,0.2)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-50"
                  onClick={() => router.push("/student/pomodoro")}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Session
                </Button>
              </div>
            </div>

            <div className="w-full max-w-md rounded-[30px] border border-white/90 bg-white/86 p-5 shadow-[0_24px_56px_-34px_rgba(37,99,235,0.18)] backdrop-blur-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">
                Focus Snapshot
              </p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    Daily focus goal
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {todayHours} / {dailyGoalHours} hrs
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e0f2fe_0%,#ede9fe_100%)] text-sky-700 shadow-[0_18px_34px_-20px_rgba(99,102,241,0.2)]">
                  <Target className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-5">
                <Progress
                  className="h-3 bg-sky-100"
                  indicatorClassName="bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_60%,#7c3aed_100%)]"
                  value={goalProgress}
                />
                <div className="mt-3 flex items-center justify-between text-sm font-medium text-slate-500">
                  <span>{goalProgress}% completed</span>
                  <span>{dailyGoalHours - todayHours} hrs left today</span>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Current streak
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {streak} days active
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Tasks today
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {completedTaskCount} of {tasks.length} completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            accentClassName="from-sky-600 to-cyan-500"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(224,242,254,0.84)_42%,rgba(217,249,255,0.72)_100%)]"
            detail="This week's focused study time"
            icon={<Clock3 className="h-5 w-5" />}
            label="Study Hours"
            value={`${studyHours} hrs`}
          />
          <StatCard
            accentClassName="from-orange-500 to-rose-500"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(255,237,213,0.84)_42%,rgba(254,205,211,0.72)_100%)]"
            detail="Current daily streak"
            icon={<Flame className="h-5 w-5" />}
            label="Streak"
            value={`${streak} days`}
          />
          <StatCard
            accentClassName="from-emerald-600 to-teal-500"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(220,252,231,0.84)_42%,rgba(204,251,241,0.72)_100%)]"
            detail="Saved tasks marked complete"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Tasks Completed"
            value={`${completedTasks}`}
          />
          <StatCard
            accentClassName="from-indigo-700 to-sky-600"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(224,231,255,0.84)_42%,rgba(219,234,254,0.74)_100%)]"
            detail="Subjects across your saved planner"
            icon={<BookOpen className="h-5 w-5" />}
            label="Active Subjects"
            value={`${activeSubjects}`}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-white/90 bg-white/88 px-4 font-semibold text-sky-700 shadow-[0_16px_34px_-24px_rgba(56,189,248,0.2)] backdrop-blur-sm hover:bg-sky-50"
                onClick={() => router.push("/student/planner")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            }
            description="Your highest-value tasks for today, organized by time, priority, and completion state."
            title="Today's Tasks"
          >
            <div className="space-y-4">
              <div className="rounded-[26px] border border-sky-100/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_56%,#eef2ff_118%)] p-4 shadow-[0_18px_38px_-26px_rgba(37,99,235,0.14)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      Daily task progress
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {completedTaskCount} of {tasks.length} tasks completed today
                    </p>
                  </div>
                  <div className="w-full max-w-xs">
                    <Progress
                      className="h-3 bg-slate-100"
                      indicatorClassName="bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_60%,#7c3aed_100%)]"
                      value={
                        tasks.length
                          ? (completedTaskCount / tasks.length) * 100
                          : 0
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                  {taskStatusMessage}
                </div>

                {isLoadingTasks ? (
                  <div className="rounded-[24px] border border-dashed border-sky-200/80 bg-white/80 p-6 text-center text-sm font-medium text-slate-600 shadow-sm">
                    Loading your task list...
                  </div>
                ) : tasks.length ? (
                  tasks.map((task) => (
                    <button
                      className="flex w-full items-start gap-4 rounded-[24px] border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                      disabled={pendingTaskId === task.id}
                      key={task.id}
                      onClick={() => void handleToggleTask(task.id, task.completed)}
                      type="button"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm transition",
                          task.completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-sky-100 bg-sky-50 text-sky-600",
                        )}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p
                              className={cn(
                                "text-sm font-bold",
                                task.completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-950",
                              )}
                            >
                              {task.title}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 font-medium text-slate-600">
                                {task.subject}
                              </span>
                              <span className="rounded-full border border-white bg-white/90 px-3 py-1 font-medium text-slate-600 shadow-sm">
                                {task.time}
                              </span>
                              <span className="rounded-full border border-white bg-white/90 px-3 py-1 font-medium text-slate-600 shadow-sm">
                                {task.duration}
                              </span>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                              task.priority === "High"
                                ? "bg-rose-100 text-rose-700"
                                : task.priority === "Medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700",
                            )}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-sky-200/80 bg-white/80 p-6 text-center shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      No tasks scheduled for today yet
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Add one in your planner and it will appear here automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              description="Personalized suggestions generated from your study rhythm, task history, and upcoming workload."
              title="AI Recommendations"
            >
              <div className="space-y-4">
                {RECOMMENDATIONS.map((item) => {
                  const tone = getRecommendationTone(item.id);

                  return (
                    <div
                      className={cn(
                        "rounded-[26px] p-4",
                        tone.cardClassName,
                      )}
                      key={item.id}
                    >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-2xl",
                          tone.iconClassName,
                        )}
                      >
                        <Brain className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-950">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {item.description}
                        </p>
                        <button
                          className={cn(
                            "mt-3 inline-flex items-center text-sm font-semibold transition",
                            tone.buttonClassName,
                          )}
                          onClick={() => router.push(item.href)}
                          type="button"
                        >
                          {item.label}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              description="The deadlines that need attention soonest, so you can stay ahead instead of catching up."
              title="Upcoming Deadlines"
            >
              <div className="space-y-4">
                {DEADLINES.map((deadline) => {
                  const tone = getDeadlineTone(deadline.status);

                  return (
                    <div
                      className={cn("rounded-[26px] p-4", tone.cardClassName)}
                      key={deadline.id}
                    >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          {deadline.title}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className={tone.chipClassName}>
                            {deadline.subject}
                          </span>
                          <span className={tone.chipClassName}>
                            {deadline.dueLabel}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                          tone.badgeClassName,
                        )}
                      >
                        {deadline.status}
                      </Badge>
                    </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </div>

        <SectionCard
          description="Jump straight into the next action without digging through the rest of the workspace."
          title="Quick Actions"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <button
              className="group rounded-[30px] border border-white/85 bg-[linear-gradient(135deg,#eef6ff_0%,#ffffff_55%,#dbeafe_120%)] p-5 text-left shadow-[0_20px_46px_-30px_rgba(37,99,235,0.2)] transition hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-32px_rgba(37,99,235,0.24)]"
              onClick={() => router.push("/student/planner")}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white shadow-lg">
                  <ListTodo className="h-5 w-5" />
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Add Task
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Capture a new study task, set the right subject, and slot it into
                your planner in a few seconds.
              </p>
            </button>

            <button
              className="group rounded-[30px] border border-white/85 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_55%,#d1fae5_120%)] p-5 text-left shadow-[0_20px_46px_-30px_rgba(13,148,136,0.2)] transition hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-32px_rgba(13,148,136,0.24)]"
              onClick={() => router.push("/student/pomodoro")}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10b981_0%,#059669_100%)] text-white shadow-lg">
                  <PlayCircle className="h-5 w-5" />
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Start Session
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Launch a focused study session, keep distractions low, and turn
                your momentum into completed work.
              </p>
            </button>
          </div>
        </SectionCard>
      </div>
    </ProtectedDashboardLayout>
  );
}
