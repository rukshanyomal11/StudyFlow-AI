"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  ListTodo,
  Megaphone,
  PlayCircle,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { studentSidebarLinks } from "@/data/sidebarLinks";
import Alert from "@/components/ui/Alert";
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

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SectionCard({ title, description, action, children }) {
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

function getDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatAnnouncementDate(value) {
  if (!value) {
    return "Recently";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function getAnnouncementAudienceLabel(audienceType) {
  if (audienceType === "students") {
    return "Direct";
  }

  if (audienceType === "groups") {
    return "Group";
  }

  return "All Assigned";
}

function getAnnouncementBadgeClass(audienceType) {
  if (audienceType === "students") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (audienceType === "groups") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-sky-100 text-sky-700";
}

function mapApiAnnouncementToDashboardItem(announcement) {
  return {
    id: announcement.id || announcement._id,
    title: announcement.title || "Mentor announcement",
    message:
      typeof announcement.message === "string" && announcement.message.trim()
        ? announcement.message
        : "A mentor update is available for you.",
    mentorName:
      typeof announcement.mentorName === "string" && announcement.mentorName.trim()
        ? announcement.mentorName
        : "Mentor",
    audienceType:
      typeof announcement.audienceType === "string"
        ? announcement.audienceType
        : "all_assigned_students",
    deliveryAt: announcement.deliveryAt || announcement.scheduledAt || announcement.createdAt || "",
  };
}

function mapApiTaskToDashboardTask(task) {
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
    priority: getTaskPriorityLabel(task.priority),
    completed: task.status === "completed",
  };
}

async function readApiError(response, fallbackMessage) {
  try {
    const data = await response.json();

    if (
      data?.error === "Internal server error" &&
      typeof data?.details === "string" &&
      data.details.trim()
    ) {
      return data.details;
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (typeof data?.details === "string" && data.details.trim()) {
      return data.details;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [allTasks, setAllTasks] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTaskId, setPendingTaskId] = useState(null);
  const [statusTone, setStatusTone] = useState("info");
  const [statusMessage, setStatusMessage] = useState(
    "Loading your dashboard...",
  );
  const [statusHint, setStatusHint] = useState(
    "We are syncing your tasks and quiz availability.",
  );

  const updateStatus = (tone, message, hint) => {
    setStatusTone(tone);
    setStatusMessage(message);
    setStatusHint(hint ?? null);
  };

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      setIsLoading(true);

      try {
        const [tasksResponse, quizzesResponse, announcementsResponse] = await Promise.all([
          fetch("/api/tasks", { cache: "no-store" }),
          fetch("/api/quizzes", { cache: "no-store" }),
          fetch("/api/announcements", { cache: "no-store" }),
        ]);

        if (!tasksResponse.ok) {
          throw new Error(
            await readApiError(
              tasksResponse,
              "Unable to load your tasks right now.",
            ),
          );
        }

        if (!quizzesResponse.ok) {
          throw new Error(
            await readApiError(
              quizzesResponse,
              "Unable to load your quizzes right now.",
            ),
          );
        }

        if (!announcementsResponse.ok) {
          throw new Error(
            await readApiError(
              announcementsResponse,
              "Unable to load your announcements right now.",
            ),
          );
        }

        const tasksData = await tasksResponse.json();
        const quizzesData = await quizzesResponse.json();
        const announcementsData = await announcementsResponse.json();
        const nextTasks = Array.isArray(tasksData?.tasks)
          ? tasksData.tasks.map(mapApiTaskToDashboardTask)
          : [];
        const nextQuizzes = Array.isArray(quizzesData?.quizzes)
          ? quizzesData.quizzes
          : [];
        const nextAnnouncements = Array.isArray(announcementsData?.announcements)
          ? announcementsData.announcements.map(mapApiAnnouncementToDashboardItem)
          : [];

        if (!isActive) {
          return;
        }

        setAllTasks(nextTasks);
        setAllQuizzes(nextQuizzes);
        setAllAnnouncements(nextAnnouncements);

        const assignedCount = nextQuizzes.filter(
          (quiz) => quiz.isAssignedToCurrentStudent,
        ).length;
        const announcementCount = nextAnnouncements.length;

        if (assignedCount > 0 && announcementCount > 0) {
          updateStatus(
            "success",
            "New quiz and mentor announcement updates are ready.",
            `${assignedCount} assigned quiz${assignedCount > 1 ? "zes are" : " is"} available, and ${announcementCount} mentor announcement${announcementCount > 1 ? "s are" : " is"} visible on your account.`,
          );
          return;
        }

        if (assignedCount > 0) {
          updateStatus(
            "success",
            "New Quiz Available",
            `${assignedCount} mentor-assigned quiz${assignedCount > 1 ? "zes are" : " is"} ready for you right now.`,
          );
          return;
        }

        if (announcementCount > 0) {
          updateStatus(
            "success",
            "New mentor announcement alerts are ready.",
            `${announcementCount} mentor announcement${announcementCount > 1 ? "s are" : " is"} now visible in your dashboard and notifications page.`,
          );
          return;
        }

        updateStatus(
          "info",
          "Dashboard is synced with your latest tasks, quizzes, and announcements.",
          "Your study feed is up to date.",
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        updateStatus(
          "error",
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard right now.",
          "Refresh the page after checking your session.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const todayDate = getDateInputValue(new Date());
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const todayTasks = useMemo(
    () => allTasks.filter((task) => task.date === todayDate),
    [allTasks, todayDate],
  );

  const assignedQuizzes = useMemo(
    () => allQuizzes.filter((quiz) => quiz.isAssignedToCurrentStudent),
    [allQuizzes],
  );

  const visibleQuizzes = useMemo(() => {
    const assigned = allQuizzes.filter((quiz) => quiz.isAssignedToCurrentStudent);
    const subjectMatched = allQuizzes.filter(
      (quiz) => !quiz.isAssignedToCurrentStudent,
    );

    return [...assigned, ...subjectMatched];
  }, [allQuizzes]);

  const recentAnnouncementAlerts = useMemo(
    () => allAnnouncements.slice(0, 3),
    [allAnnouncements],
  );

  const recentAnnouncementCount = useMemo(
    () =>
      allAnnouncements.filter((announcement) => {
        const deliveryDate = new Date(announcement.deliveryAt);

        if (Number.isNaN(deliveryDate.getTime())) {
          return false;
        }

        return Date.now() - deliveryDate.getTime() <= 1000 * 60 * 60 * 24 * 7;
      }).length,
    [allAnnouncements],
  );

  const featuredQuiz = assignedQuizzes[0] ?? visibleQuizzes[0] ?? null;
  const completedTodayCount = todayTasks.filter((task) => task.completed).length;
  const completedTaskCount = allTasks.filter((task) => task.completed).length;

  const todayProgress = todayTasks.length
    ? Math.round((completedTodayCount / todayTasks.length) * 100)
    : 0;

  const handleToggleTask = async (taskId, completed) => {
    setPendingTaskId(taskId);
    updateStatus(
      "info",
      completed ? "Marking task as to do..." : "Marking task as done...",
      "Your dashboard task card is updating.",
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

      const data = await response.json();

      if (!data?.task) {
        throw new Error("Task update succeeded but no task was returned.");
      }

      const nextTask = mapApiTaskToDashboardTask(data.task);

      setAllTasks((current) =>
        current.map((task) => (task.id === taskId ? nextTask : task)),
      );

      updateStatus(
        "success",
        completed
          ? "Task moved back into your queue."
          : "Task marked as completed.",
        "The dashboard and planner stay in sync.",
      );
    } catch (error) {
      updateStatus(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to update this task right now.",
        "Try again in a moment.",
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
        <section className="relative overflow-hidden rounded-[36px] border border-white/85 bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_24%,#ecfeff_52%,#eef2ff_78%,#fff8e8_108%)] p-6 shadow-[0_32px_84px_-44px_rgba(56,189,248,0.22)] sm:p-8">
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(37,99,235,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_58%)]" />
          <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute right-10 top-4 h-36 w-36 rounded-full bg-fuchsia-200/24 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-36 w-36 rounded-full bg-amber-200/20 blur-3xl" />
          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_360px] xl:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-700" />
                Student Dashboard
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Your day is synced with real tasks and quizzes
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700">
                  See today&apos;s study workload, spot newly assigned quizzes, and
                  jump into the next meaningful action without leaving the dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-2xl border border-white/90 bg-white/88 px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(59,130,246,0.14)] backdrop-blur-sm">
                  {todayLabel}
                </span>
                <span className="rounded-2xl border border-white/90 bg-white/88 px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(99,102,241,0.14)] backdrop-blur-sm">
                  {todayTasks.length} tasks today
                </span>
                <span className="rounded-2xl border border-white/90 bg-white/88 px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(14,165,233,0.14)] backdrop-blur-sm">
                  {visibleQuizzes.length} quizzes available
                </span>
                <span className="rounded-2xl border border-white/90 bg-white/88 px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(249,115,22,0.14)] backdrop-blur-sm">
                  {allAnnouncements.length} mentor alerts
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="h-11 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_40%,#7c3aed_100%)] px-5 text-white shadow-[0_20px_40px_-22px_rgba(37,99,235,0.46)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                  onClick={() => router.push("/student/planner")}
                  type="button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
                <Button
                  className="h-11 rounded-2xl border border-white/90 bg-white/88 px-5 font-semibold text-sky-700 shadow-[0_16px_34px_-24px_rgba(56,189,248,0.2)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-50"
                  onClick={() => router.push("/student/quizzes")}
                  type="button"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Open Quizzes
                </Button>
                <Button
                  className="h-11 rounded-2xl border border-white/90 bg-white/88 px-5 font-semibold text-sky-700 shadow-[0_16px_34px_-24px_rgba(56,189,248,0.2)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-50"
                  onClick={() => router.push("/student/pomodoro")}
                  type="button"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Session
                </Button>
                <Button
                  className="h-11 rounded-2xl border border-white/90 bg-white/88 px-5 font-semibold text-sky-700 shadow-[0_16px_34px_-24px_rgba(56,189,248,0.2)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-50"
                  onClick={() => router.push("/student/notifications")}
                  type="button"
                >
                  <BellRing className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
              </div>

              <Alert
                className="max-w-3xl rounded-[24px] border p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]"
                type={statusTone}
              >
                <div className="space-y-1">
                  <p className="font-medium">{statusMessage}</p>
                  {statusHint ? <p>{statusHint}</p> : null}
                </div>
              </Alert>
            </div>

            <div className="w-full rounded-[30px] border border-white/90 bg-white/86 p-5 shadow-[0_24px_56px_-34px_rgba(37,99,235,0.18)] backdrop-blur-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">
                Quiz Availability
              </p>
              {featuredQuiz ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                        New Quiz Available
                      </Badge>
                      <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                        {featuredQuiz.title}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {featuredQuiz.description || "A new quiz is ready for you to start."}
                      </p>
                    </div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e0f2fe_0%,#ede9fe_100%)] text-sky-700 shadow-[0_18px_34px_-20px_rgba(99,102,241,0.2)]">
                      <Target className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 font-medium text-slate-600">
                      {featuredQuiz.subjectName || "Subject"}
                    </span>
                    <span className="rounded-full border border-white bg-white/90 px-3 py-1 font-medium text-slate-600 shadow-sm">
                      {featuredQuiz.questionCount} questions
                    </span>
                    <span className="rounded-full border border-white bg-white/90 px-3 py-1 font-medium text-slate-600 shadow-sm">
                      {featuredQuiz.isAssignedToCurrentStudent
                        ? "Assigned to you"
                        : "Subject match"}
                    </span>
                  </div>

                  <Button
                    className="h-11 w-full rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={() => router.push("/student/quizzes")}
                    type="button"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Quiz
                  </Button>
                </div>
              ) : (
                <div className="mt-4 rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] p-5 text-sm leading-7 text-slate-600 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]">
                  No quizzes are available for your account yet. Assigned or
                  subject-matching quizzes will appear here as soon as they are published.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            accentClassName="from-sky-600 to-cyan-500"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(224,242,254,0.84)_42%,rgba(217,249,255,0.72)_100%)]"
            detail="Tasks scheduled for today"
            icon={<ClipboardList className="h-5 w-5" />}
            label="Today's Tasks"
            value={`${todayTasks.length}`}
          />
          <StatCard
            accentClassName="from-emerald-600 to-teal-500"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(220,252,231,0.84)_42%,rgba(204,251,241,0.72)_100%)]"
            detail="Saved tasks marked complete"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Tasks Completed"
            value={`${completedTaskCount}`}
          />
          <StatCard
            accentClassName="from-indigo-700 to-sky-600"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(224,231,255,0.84)_42%,rgba(219,234,254,0.74)_100%)]"
            detail="Visible from assignments and subjects"
            icon={<BookOpen className="h-5 w-5" />}
            label="Quizzes Available"
            value={`${visibleQuizzes.length}`}
          />
          <StatCard
            accentClassName="from-orange-500 to-rose-500"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(255,237,213,0.84)_42%,rgba(254,205,211,0.72)_100%)]"
            detail="Announcements received in the last 7 days"
            icon={<BellRing className="h-5 w-5" />}
            label="Recent Alerts"
            value={`${recentAnnouncementCount}`}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-white/90 bg-white/88 px-4 font-semibold text-sky-700 shadow-[0_16px_34px_-24px_rgba(56,189,248,0.2)] backdrop-blur-sm hover:bg-sky-50"
                onClick={() => router.push("/student/planner")}
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            }
            description="Today's real planner tasks, with completion state synced back to the database."
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
                      {completedTodayCount} of {todayTasks.length} tasks completed today
                    </p>
                  </div>
                  <div className="w-full max-w-xs">
                    <Progress
                      className="h-3 bg-slate-100"
                      indicatorClassName="bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_60%,#7c3aed_100%)]"
                      value={todayProgress}
                    />
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="rounded-[24px] border border-dashed border-sky-200/80 bg-white/80 p-6 text-center text-sm font-medium text-slate-600 shadow-sm">
                  Loading your task list...
                </div>
              ) : todayTasks.length ? (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
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
                  ))}
                </div>
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
          </SectionCard>

          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-white/90 bg-white/88 px-4 font-semibold text-sky-700 shadow-[0_16px_34px_-24px_rgba(56,189,248,0.2)] backdrop-blur-sm hover:bg-sky-50"
                onClick={() => router.push("/student/quizzes")}
                type="button"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View All
              </Button>
            }
            description="Assigned quizzes are shown first, followed by quizzes that match your saved subjects."
            title="Available Quizzes"
          >
            {visibleQuizzes.length ? (
              <div className="space-y-4">
                {visibleQuizzes.slice(0, 3).map((quiz) => (
                  <div
                    className="rounded-[26px] border border-sky-100/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_56%,#eef2ff_118%)] p-4 shadow-[0_18px_38px_-26px_rgba(37,99,235,0.14)]"
                    key={quiz.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="border-transparent bg-sky-100 text-sky-700">
                            {quiz.subjectName || "Subject"}
                          </Badge>
                          <Badge
                            className={cn(
                              "border-transparent",
                              quiz.isAssignedToCurrentStudent
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700",
                            )}
                          >
                            {quiz.isAssignedToCurrentStudent
                              ? "New Quiz Available"
                              : "Subject match"}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm font-bold text-slate-950">
                          {quiz.title}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {quiz.description || "A quiz is ready to open from your quizzes page."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-white bg-white/90 px-3 py-1 font-medium text-slate-600 shadow-sm">
                            {quiz.questionCount} questions
                          </span>
                        </div>
                      </div>
                      <Button
                        className="h-10 rounded-2xl bg-sky-600 px-4 text-white hover:bg-sky-700"
                        onClick={() => router.push("/student/quizzes")}
                        type="button"
                      >
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-sky-200/80 bg-white/80 p-6 text-center shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  No quizzes available yet
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Assigned quizzes and subject-based quizzes will appear here automatically.
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          action={
            <Button
              className="h-10 rounded-2xl border border-white/90 bg-white/88 px-4 font-semibold text-sky-700 shadow-[0_16px_34px_-24px_rgba(56,189,248,0.2)] backdrop-blur-sm hover:bg-sky-50"
              onClick={() => router.push("/student/notifications")}
              type="button"
            >
              <BellRing className="mr-2 h-4 w-4" />
              View All
            </Button>
          }
          description="Recent mentor announcements relevant to your account, filtered by your current mentor assignments."
          title="Recent Announcements"
        >
          {recentAnnouncementAlerts.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {recentAnnouncementAlerts.map((announcement) => (
                <div
                  className="rounded-[26px] border border-sky-100/80 bg-[linear-gradient(135deg,#fffaf5_0%,#ffffff_56%,#eef2ff_118%)] p-4 shadow-[0_18px_38px_-26px_rgba(249,115,22,0.14)]"
                  key={announcement.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={cn("border-transparent", getAnnouncementBadgeClass(announcement.audienceType))}>
                          {getAnnouncementAudienceLabel(announcement.audienceType)}
                        </Badge>
                        <Badge className="border-transparent bg-white text-slate-600 shadow-sm">
                          {announcement.mentorName}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-950">
                        {announcement.title}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fb923c_0%,#f97316_100%)] text-white shadow-[0_18px_34px_-20px_rgba(249,115,22,0.26)]">
                      <Megaphone className="h-4 w-4" />
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {announcement.message}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-white bg-white/90 px-3 py-1 font-medium text-slate-600 shadow-sm">
                      {formatAnnouncementDate(announcement.deliveryAt)}
                    </span>
                  </div>

                  <Button
                    className="mt-4 h-10 w-full rounded-2xl bg-sky-600 px-4 text-white hover:bg-sky-700"
                    onClick={() => router.push("/student/notifications")}
                    type="button"
                  >
                    Open Notifications
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-sky-200/80 bg-white/80 p-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                No mentor announcements yet
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Relevant mentor announcements will appear here as soon as they are sent to you.
              </p>
            </div>
          )}
        </SectionCard>

        <SectionCard
          description="Jump straight into the next action without digging through the rest of the workspace."
          title="Quick Actions"
        >
          <div className="grid gap-4 md:grid-cols-3">
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
                Capture a new study task and drop it straight into your planner.
              </p>
            </button>

            <button
              className="group rounded-[30px] border border-white/85 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_55%,#d1fae5_120%)] p-5 text-left shadow-[0_20px_46px_-30px_rgba(13,148,136,0.2)] transition hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-32px_rgba(13,148,136,0.24)]"
              onClick={() => router.push("/student/quizzes")}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10b981_0%,#059669_100%)] text-white shadow-lg">
                  <BookOpen className="h-5 w-5" />
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Open Quizzes
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                View assigned quizzes first, then explore any subject-matching ones.
              </p>
            </button>

            <button
              className="group rounded-[30px] border border-white/85 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#ffedd5_120%)] p-5 text-left shadow-[0_20px_46px_-30px_rgba(249,115,22,0.18)] transition hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-32px_rgba(249,115,22,0.22)]"
              onClick={() => router.push("/student/pomodoro")}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#ea580c_100%)] text-white shadow-lg">
                  <PlayCircle className="h-5 w-5" />
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Start Session
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Launch a focused study block and keep your momentum moving.
              </p>
            </button>
          </div>
        </SectionCard>
      </div>
    </ProtectedDashboardLayout>
  );
}
