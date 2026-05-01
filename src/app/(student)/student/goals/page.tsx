"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Flag,
  ListChecks,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { studentSidebarLinks } from "@/data/sidebarLinks";
import goalService from "@/services/goal.service";
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

type GoalTimeframe = "short_term" | "long_term";
type AlertTone = "info" | "success" | "warning" | "error";

interface ApiGoalTask {
  _id?: string;
  id?: string;
  title?: string;
  completed?: boolean;
}

interface ApiGoal {
  _id?: string;
  id?: string;
  title?: string;
  subject?: string;
  target?: string;
  notes?: string;
  description?: string;
  progress?: number;
  deadline?: string;
  status?: string;
  timeframe?: string;
  createdAt?: string;
  tasks?: ApiGoalTask[];
}

interface GoalTaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface GoalItem {
  id: string;
  title: string;
  subject: string;
  target: string;
  notes: string;
  progress: number;
  deadline: string;
  status: string;
  timeframe: GoalTimeframe;
  createdAt: string;
  tasks: GoalTaskItem[];
}

interface GoalDraft {
  title: string;
  subject: string;
  target: string;
  notes: string;
  progress: string;
  deadline: string;
  timeframe: GoalTimeframe;
  tasks: GoalTaskItem[];
}

const EMPTY_DRAFT: GoalDraft = {
  title: "",
  subject: "",
  target: "",
  notes: "",
  progress: "0",
  deadline: "",
  timeframe: "short_term",
  tasks: [],
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const selectClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clampProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(value), 0), 100);
}

function calculateTaskProgress(tasks: GoalTaskItem[]) {
  if (!tasks.length) {
    return 0;
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  return clampProgress((completedCount / tasks.length) * 100);
}

function createTaskId() {
  return `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getDateInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDeadline(value: string) {
  const deadline = new Date(value);

  if (Number.isNaN(deadline.getTime())) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(deadline);
}

function getDaysRemaining(value: string) {
  const deadline = new Date(value);

  if (Number.isNaN(deadline.getTime())) {
    return null;
  }

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const deadlineStart = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate(),
  );

  return Math.round(
    (deadlineStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getDeadlineTone(goal: GoalItem) {
  const daysRemaining = getDaysRemaining(goal.deadline);

  if (goal.progress >= 100 || goal.status === "completed") {
    return {
      badge: "border-transparent bg-emerald-500 text-white",
      label: "Completed",
    };
  }

  if (daysRemaining === null) {
    return {
      badge: "border-transparent bg-slate-100 text-slate-700",
      label: "No date",
    };
  }

  if (daysRemaining < 0) {
    return {
      badge: "border-transparent bg-rose-500 text-white",
      label: "Overdue",
    };
  }

  if (daysRemaining <= 7) {
    return {
      badge: "border-transparent bg-amber-500 text-white",
      label: `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`,
    };
  }

  return {
    badge: "border-transparent bg-sky-100 text-sky-700",
    label: "On track",
  };
}

function getTimeframeLabel(timeframe: GoalTimeframe) {
  return timeframe === "long_term" ? "Long term" : "Short term";
}

function sortGoals(goals: GoalItem[]) {
  return [...goals].sort((first, second) => {
    const firstDeadline = new Date(first.deadline).getTime();
    const secondDeadline = new Date(second.deadline).getTime();
    const safeFirst = Number.isNaN(firstDeadline) ? Number.MAX_SAFE_INTEGER : firstDeadline;
    const safeSecond = Number.isNaN(secondDeadline)
      ? Number.MAX_SAFE_INTEGER
      : secondDeadline;

    if (safeFirst !== safeSecond) {
      return safeFirst - safeSecond;
    }

    return second.createdAt.localeCompare(first.createdAt);
  });
}

function mapApiGoalToGoalItem(goal: ApiGoal): GoalItem {
  const tasks = Array.isArray(goal.tasks)
    ? goal.tasks.map((task, index) => ({
        id: task._id || task.id || `${goal._id || goal.id || "goal"}-task-${index}`,
        title: typeof task.title === "string" ? task.title.trim() : "",
        completed: Boolean(task.completed),
      }))
    : [];

  const progress =
    typeof goal.progress === "number"
      ? clampProgress(goal.progress)
      : calculateTaskProgress(tasks);

  return {
    id: goal._id || goal.id || createTaskId(),
    title: typeof goal.title === "string" && goal.title.trim()
      ? goal.title.trim()
      : "Untitled goal",
    subject: typeof goal.subject === "string" ? goal.subject.trim() : "",
    target:
      typeof goal.target === "string" && goal.target.trim()
        ? goal.target.trim()
        : typeof goal.description === "string"
          ? goal.description.trim()
          : "",
    notes: typeof goal.notes === "string" ? goal.notes.trim() : "",
    progress,
    deadline: getDateInputValue(goal.deadline),
    status: typeof goal.status === "string" ? goal.status : "pending",
    timeframe: goal.timeframe === "long_term" ? "long_term" : "short_term",
    createdAt: typeof goal.createdAt === "string" ? goal.createdAt : "",
    tasks,
  };
}

function createDraftFromGoal(goal: GoalItem): GoalDraft {
  return {
    title: goal.title,
    subject: goal.subject,
    target: goal.target,
    notes: goal.notes,
    progress: String(goal.progress),
    deadline: goal.deadline,
    timeframe: goal.timeframe,
    tasks: goal.tasks,
  };
}

function buildGoalPayload(draft: GoalDraft) {
  return {
    title: draft.title.trim(),
    subject: draft.subject.trim(),
    target: draft.target.trim(),
    notes: draft.notes.trim(),
    description: draft.target.trim(),
    progress: clampProgress(Number(draft.progress)),
    deadline: draft.deadline,
    timeframe: draft.timeframe,
    tasks: draft.tasks.map((task) => ({
      title: task.title.trim(),
      completed: task.completed,
    })),
  };
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
    <Card className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_30px_70px_-40px_rgba(56,189,248,0.18)]">
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

export default function StudentGoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [draft, setDraft] = useState<GoalDraft>(EMPTY_DRAFT);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusTone, setStatusTone] = useState<AlertTone>("info");
  const [statusMessage, setStatusMessage] = useState(
    "Loading your saved goals...",
  );
  const [statusHint, setStatusHint] = useState(
    "Pulling targets, task breakdowns, and deadlines from the live backend.",
  );

  const updateStatus = (tone: AlertTone, message: string, hint?: string) => {
    setStatusTone(tone);
    setStatusMessage(message);
    setStatusHint(hint ?? "");
  };

  useEffect(() => {
    let isActive = true;

    const loadGoals = async () => {
      setIsLoading(true);

      try {
        const goalDocuments = await goalService.getGoals();
        const nextGoals = sortGoals(
          goalDocuments.map((goal: ApiGoal) => mapApiGoalToGoalItem(goal)),
        );

        if (!isActive) {
          return;
        }

        setGoals(nextGoals);

        if (nextGoals.length) {
          setSelectedGoalId(nextGoals[0].id);
          setDraft(createDraftFromGoal(nextGoals[0]));
          setIsCreateMode(false);
          updateStatus(
            "success",
            "Goals synced with your live StudyFlow data.",
            `${nextGoals.length} goal${nextGoals.length === 1 ? "" : "s"} loaded with real deadlines and achievement progress.`,
          );
        } else {
          setSelectedGoalId(null);
          setDraft(EMPTY_DRAFT);
          setIsCreateMode(true);
          updateStatus(
            "info",
            "No saved goals yet.",
            "Create your first short-term or long-term goal to start tracking achievement.",
          );
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        updateStatus(
          "error",
          error instanceof Error
            ? error.message
            : "Unable to load your goals right now.",
          "Refresh the page after checking your session.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadGoals();

    return () => {
      isActive = false;
    };
  }, []);

  const completedCount = useMemo(
    () => goals.filter((goal) => goal.progress >= 100).length,
    [goals],
  );

  const dueSoonCount = useMemo(
    () =>
      goals.filter((goal) => {
        const daysRemaining = getDaysRemaining(goal.deadline);
        return daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7 && goal.progress < 100;
      }).length,
    [goals],
  );

  const averageProgress = useMemo(() => {
    if (!goals.length) {
      return 0;
    }

    return Math.round(
      goals.reduce((total, goal) => total + goal.progress, 0) / goals.length,
    );
  }, [goals]);

  const shortTermCount = useMemo(
    () => goals.filter((goal) => goal.timeframe === "short_term").length,
    [goals],
  );

  const longTermCount = useMemo(
    () => goals.filter((goal) => goal.timeframe === "long_term").length,
    [goals],
  );

  const totalChecklistTasks = useMemo(
    () => goals.reduce((total, goal) => total + goal.tasks.length, 0),
    [goals],
  );

  const completedChecklistTasks = useMemo(
    () =>
      goals.reduce(
        (total, goal) =>
          total + goal.tasks.filter((task) => task.completed).length,
        0,
      ),
    [goals],
  );

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal.id === selectedGoalId) ?? null,
    [goals, selectedGoalId],
  );

  const deadlineSortedGoals = useMemo(() => sortGoals(goals), [goals]);

  const syncDraftTasks = (nextTasks: GoalTaskItem[]) => {
    setDraft((current) => ({
      ...current,
      tasks: nextTasks,
      progress: nextTasks.length
        ? String(calculateTaskProgress(nextTasks))
        : current.progress,
    }));
  };

  const selectGoal = (goal: GoalItem) => {
    setSelectedGoalId(goal.id);
    setDraft(createDraftFromGoal(goal));
    setIsCreateMode(false);
    setNewTaskTitle("");
    updateStatus(
      "info",
      `Editing ${goal.title}.`,
      "Adjust the target, checklist, or deadline and save when you are ready.",
    );
  };

  const openCreateMode = () => {
    setSelectedGoalId(null);
    setDraft(EMPTY_DRAFT);
    setIsCreateMode(true);
    setNewTaskTitle("");
    updateStatus(
      "info",
      "Create a new study goal.",
      "Set the target, add a deadline, and break it into smaller tasks if that helps.",
    );
  };

  const handleAddTask = () => {
    const title = newTaskTitle.trim();

    if (!title) {
      updateStatus(
        "warning",
        "Add a task title before inserting it into the checklist.",
      );
      return;
    }

    const nextTasks = [
      ...draft.tasks,
      {
        id: createTaskId(),
        title,
        completed: false,
      },
    ];

    syncDraftTasks(nextTasks);
    setNewTaskTitle("");
    updateStatus(
      "success",
      "Goal task added.",
      "This checklist can now drive progress for the selected goal.",
    );
  };

  const handleToggleTask = (taskId: string) => {
    const nextTasks = draft.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );

    syncDraftTasks(nextTasks);
  };

  const handleTaskTitleChange = (taskId: string, title: string) => {
    setDraft((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, title } : task,
      ),
    }));
  };

  const handleRemoveTask = (taskId: string) => {
    const nextTasks = draft.tasks.filter((task) => task.id !== taskId);
    syncDraftTasks(nextTasks);
  };

  const handleSaveGoal = async () => {
    const title = draft.title.trim();
    const target = draft.target.trim();

    if (!title || !draft.deadline || !target) {
      updateStatus(
        "warning",
        "Add a title, target, and deadline before saving.",
        "These fields keep the goal meaningful and trackable.",
      );
      return;
    }

    if (draft.tasks.some((task) => !task.title.trim())) {
      updateStatus(
        "warning",
        "Every checklist item needs a title before the goal can be saved.",
      );
      return;
    }

    setIsSaving(true);
    updateStatus(
      "info",
      isCreateMode ? "Saving new goal..." : "Saving goal changes...",
      "Your goal data is being written to the backend.",
    );

    try {
      const payload = buildGoalPayload(draft);
      const response =
        isCreateMode || !selectedGoalId
          ? await goalService.createGoal(payload)
          : await goalService.updateGoal(selectedGoalId, payload);

      if (!response?.goal) {
        throw new Error("Goal save succeeded but no goal was returned.");
      }

      const savedGoal = mapApiGoalToGoalItem(response.goal as ApiGoal);

      setGoals((current) => {
        const nextGoals =
          isCreateMode || !selectedGoalId
            ? [savedGoal, ...current]
            : current.map((goal) =>
                goal.id === selectedGoalId ? savedGoal : goal,
              );

        return sortGoals(nextGoals);
      });

      setSelectedGoalId(savedGoal.id);
      setDraft(createDraftFromGoal(savedGoal));
      setIsCreateMode(false);
      setNewTaskTitle("");
      updateStatus(
        "success",
        isCreateMode ? "New goal saved." : "Goal updated successfully.",
        "The goal list and deadline tracker are now in sync with the database.",
      );
    } catch (error) {
      updateStatus(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to save this goal right now.",
        "Try again in a moment.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!selectedGoalId || isCreateMode) {
      updateStatus(
        "warning",
        "Select a saved goal before trying to delete it.",
      );
      return;
    }

    setIsDeleting(true);
    updateStatus(
      "info",
      "Deleting selected goal...",
      "Removing the goal and its checklist from the backend.",
    );

    try {
      await goalService.deleteGoal(selectedGoalId);

      const remainingGoals = goals.filter((goal) => goal.id !== selectedGoalId);
      const nextGoals = sortGoals(remainingGoals);
      const nextGoal = nextGoals[0] ?? null;

      setGoals(nextGoals);
      setSelectedGoalId(nextGoal?.id ?? null);
      setDraft(nextGoal ? createDraftFromGoal(nextGoal) : EMPTY_DRAFT);
      setIsCreateMode(!nextGoal);
      setNewTaskTitle("");
      updateStatus(
        "success",
        "Goal deleted.",
        nextGoal
          ? `You can continue editing ${nextGoal.title}.`
          : "Create another goal whenever you are ready.",
      );
    } catch (error) {
      updateStatus(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to delete this goal right now.",
        "Try again in a moment.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const draftCompletedTaskCount = draft.tasks.filter((task) => task.completed).length;

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your goals..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[36px] border border-sky-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_22%,#eefcff_54%,#f8fbff_76%,#fff7e8_100%)] p-6 shadow-[0_40px_110px_-52px_rgba(56,189,248,0.28)] sm:p-8">
          <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_32%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                <Target className="h-4 w-4 text-blue-700" />
                <span>Goal Tracker</span>
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Track short-term and long-term goals
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Set a target, break it into smaller tasks, and stay ahead of
                  the deadlines that matter most this term.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Flag className="h-4 w-4 text-sky-600" />
                  {goals.length} active goals
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  {shortTermCount} short term
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Target className="h-4 w-4 text-cyan-600" />
                  {longTermCount} long term
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <CalendarDays className="h-4 w-4 text-amber-500" />
                  {dueSoonCount} due soon
                </span>
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

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.3)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Achievement Pulse
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Turn targets into steady weekly momentum
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.22)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Avg. progress
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {averageProgress}%
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Overall movement across your current goals
                  </p>
                </div>
                <div className="rounded-[24px] border border-emerald-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(16,185,129,0.2)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Checklist tasks
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {completedChecklistTasks}/{totalChecklistTasks}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Smaller steps completed across saved goals
                  </p>
                </div>
              </div>

              <Button
                className="mt-5 h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] px-5 text-white shadow-[0_24px_50px_-26px_rgba(37,99,235,0.55)] transition hover:brightness-105"
                onClick={openCreateMode}
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            accentClassName="from-sky-600 to-cyan-500"
            detail="Goals currently tracked"
            icon={<Flag className="h-5 w-5" />}
            label="Active Goals"
            value={`${goals.length}`}
          />
          <SummaryCard
            accentClassName="from-indigo-700 to-sky-600"
            detail="Average goal completion"
            icon={<Target className="h-5 w-5" />}
            label="Progress"
            value={`${averageProgress}%`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Targets already reached"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completed"
            value={`${completedCount}`}
          />
          <SummaryCard
            accentClassName="from-amber-500 to-orange-500"
            detail="Deadlines within the next 7 days"
            icon={<CalendarDays className="h-5 w-5" />}
            label="Due Soon"
            value={`${dueSoonCount}`}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[0.98fr_1.02fr]">
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                onClick={openCreateMode}
                type="button"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Button>
            }
            description="Each saved goal shows live progress, timeframe, task breakdown, and deadline pressure from the backend."
            title="Goals List"
          >
            <div className="space-y-4">
              {isLoading ? (
                <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-sky-50 text-sky-700 shadow-[0_12px_28px_-18px_rgba(14,165,233,0.3)]">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">
                    Loading saved goals
                  </h3>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    Pulling your targets, progress, and deadlines from MongoDB now.
                  </p>
                </div>
              ) : goals.length ? (
                goals.map((goal) => {
                  const tone = getDeadlineTone(goal);
                  const completedTaskCount = goal.tasks.filter(
                    (task) => task.completed,
                  ).length;

                  return (
                    <button
                      className={cn(
                        "w-full rounded-[24px] border p-4 text-left transition",
                        goal.id === selectedGoalId && !isCreateMode
                          ? "border-emerald-300 bg-emerald-50/70 ring-4 ring-emerald-100"
                          : "border-sky-100/80 bg-white/95 hover:border-sky-200 hover:shadow-[0_18px_40px_-24px_rgba(59,130,246,0.16)]",
                      )}
                      key={goal.id}
                      onClick={() => selectGoal(goal)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-950">
                              {goal.title}
                            </p>
                            <Badge className="border-transparent bg-indigo-100 text-indigo-700">
                              {getTimeframeLabel(goal.timeframe)}
                            </Badge>
                            <Badge
                              className={cn(
                                "px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                                tone.badge,
                              )}
                            >
                              {tone.label}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {goal.subject || "General"} - Due {formatDeadline(goal.deadline)}
                          </p>
                        </div>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                          <Flag className="h-4 w-4" />
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-600">Progress</span>
                          <span className="font-semibold text-slate-900">
                            {goal.progress}%
                          </span>
                        </div>
                        <Progress
                          className="mt-3 h-3"
                          indicatorClassName="bg-sky-600"
                          value={goal.progress}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 font-medium">
                          {completedTaskCount}/{goal.tasks.length} tasks done
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
                          {goal.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {goal.target || "Add a target outcome to keep this goal specific."}
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-sky-50 text-sky-700 shadow-[0_12px_28px_-18px_rgba(14,165,233,0.3)]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">
                    No goals yet
                  </h3>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    Add your first study goal to start tracking achievement and deadlines in one clean place.
                  </p>
                  <Button
                    className="mt-6 h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={openCreateMode}
                    type="button"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Goal
                  </Button>
                </div>
              )}
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              action={
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="h-10 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-rose-700 hover:bg-rose-100"
                    disabled={isDeleting || isCreateMode || !selectedGoalId}
                    onClick={() => void handleDeleteGoal()}
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                  <Button
                    className="h-10 rounded-2xl bg-sky-600 px-4 text-white hover:bg-sky-700"
                    disabled={isSaving}
                    onClick={() => void handleSaveGoal()}
                    type="button"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Goal"}
                  </Button>
                </div>
              }
              description="Set the target, choose the timeframe, and use checklist tasks when you want progress to be broken into smaller pieces."
              title={isCreateMode ? "Add Goal" : "Edit Goal"}
            >
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Goal title
                    </span>
                    <input
                      className={inputClassName}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Reach 85% in Calculus revision"
                      value={draft.title}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Timeframe
                    </span>
                    <select
                      className={selectClassName}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          timeframe: event.target.value as GoalTimeframe,
                        }))
                      }
                      value={draft.timeframe}
                    >
                      <option value="short_term">Short term</option>
                      <option value="long_term">Long term</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Subject
                    </span>
                    <input
                      className={inputClassName}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          subject: event.target.value,
                        }))
                      }
                      placeholder="Mathematics"
                      value={draft.subject}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Deadline
                    </span>
                    <input
                      className={inputClassName}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          deadline: event.target.value,
                        }))
                      }
                      type="date"
                      value={draft.deadline}
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">
                      Progress %
                    </span>
                    <input
                      className={inputClassName}
                      disabled={draft.tasks.length > 0}
                      max="100"
                      min="0"
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          progress: event.target.value,
                        }))
                      }
                      type="number"
                      value={draft.progress}
                    />
                    <p className="text-xs text-slate-500">
                      {draft.tasks.length
                        ? "Progress is currently calculated from the checklist below."
                        : "Use manual progress when you are not breaking the goal into tasks."}
                    </p>
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Target outcome
                  </span>
                  <textarea
                    className={textareaClassName}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        target: event.target.value,
                      }))
                    }
                    placeholder="Describe the measurable target you want to hit by the deadline."
                    rows={4}
                    value={draft.target}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Notes
                  </span>
                  <textarea
                    className={textareaClassName}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Capture blockers, reminders, or the next action."
                    rows={4}
                    value={draft.notes}
                  />
                </label>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Task breakdown
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Break the goal into smaller tasks so achievement stays visible.
                        </p>
                      </div>
                      <Badge className="border-transparent bg-sky-100 text-sky-700">
                        {draftCompletedTaskCount}/{draft.tasks.length} done
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        className={inputClassName}
                        onChange={(event) => setNewTaskTitle(event.target.value)}
                        placeholder="Add a smaller task like Finish derivatives revision"
                        value={newTaskTitle}
                      />
                      <Button
                        className="h-11 rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                        onClick={handleAddTask}
                        type="button"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    </div>

                    {draft.tasks.length ? (
                      <div className="space-y-3">
                        {draft.tasks.map((task) => (
                          <div
                            className="flex items-center gap-3 rounded-[20px] border border-sky-100 bg-white p-3 shadow-sm"
                            key={task.id}
                          >
                            <button
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition",
                                task.completed
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-sky-100 bg-sky-50 text-sky-600",
                              )}
                              onClick={() => handleToggleTask(task.id)}
                              type="button"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <input
                              className={cn(inputClassName, "h-10 flex-1")}
                              onChange={(event) =>
                                handleTaskTitleChange(task.id, event.target.value)
                              }
                              value={task.title}
                            />
                            <Button
                              className="h-10 w-10 rounded-2xl border border-rose-200 bg-rose-50 p-0 text-rose-700 hover:bg-rose-100"
                              onClick={() => handleRemoveTask(task.id)}
                              type="button"
                              variant="outline"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[20px] border border-dashed border-sky-200 bg-white/80 p-4 text-sm text-slate-600">
                        No checklist tasks yet. You can still save the goal and track progress manually.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="Urgent deadlines stay visible here so you can see which goal needs attention next."
              title="Deadline Tracking"
            >
              <div className="space-y-4">
                {deadlineSortedGoals.length ? (
                  deadlineSortedGoals.map((goal) => {
                    const tone = getDeadlineTone(goal);
                    const daysRemaining = getDaysRemaining(goal.deadline);

                    return (
                      <div
                        className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]"
                        key={goal.id}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-950">
                                {goal.title}
                              </p>
                              <Badge className="border-transparent bg-indigo-100 text-indigo-700">
                                {getTimeframeLabel(goal.timeframe)}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              {goal.subject || "General"} - Due {formatDeadline(goal.deadline)}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              "px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                              tone.badge,
                            )}
                          >
                            {tone.label}
                          </Badge>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                          <span>{goal.progress}% complete</span>
                          <span>
                            {daysRemaining === null
                              ? "No deadline set"
                              : daysRemaining >= 0
                                ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`
                                : `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} overdue`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-sky-200 bg-white/80 p-6 text-sm text-slate-600">
                    Saved goal deadlines will appear here as soon as you create one.
                  </div>
                )}
              </div>
            </SectionCard>

            {selectedGoal ? (
              <SectionCard
                description="A quick view of the selected goal's task completion and current achievement level."
                title="Achievement Snapshot"
              >
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-950">
                          {selectedGoal.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedGoal.subject || "General"} - {getTimeframeLabel(selectedGoal.timeframe)}
                        </p>
                      </div>
                      <Badge className="border-transparent bg-sky-100 text-sky-700">
                        {selectedGoal.progress}%
                      </Badge>
                    </div>
                    <Progress
                      className="mt-4 h-3 bg-slate-100"
                      indicatorClassName="bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_60%,#7c3aed_100%)]"
                      value={selectedGoal.progress}
                    />
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 font-medium">
                        {selectedGoal.tasks.filter((task) => task.completed).length}/{selectedGoal.tasks.length} tasks complete
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
                        Due {formatDeadline(selectedGoal.deadline)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/80 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-950">
                      Target
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {selectedGoal.target || "No target outcome added yet."}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-slate-950">
                      Notes
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {selectedGoal.notes || "No notes added yet."}
                    </p>
                  </div>
                </div>
              </SectionCard>
            ) : null}
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
