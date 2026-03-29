"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Flag,
  PencilLine,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
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

interface GoalItem {
  id: string;
  title: string;
  subject: string;
  progress: number;
  deadline: string;
  target: string;
  notes: string;
}

interface GoalDraft {
  title: string;
  subject: string;
  progress: string;
  deadline: string;
  target: string;
  notes: string;
}

const INITIAL_GOALS: GoalItem[] = [
  {
    id: "goal-01",
    title: "Reach 85% in Calculus revision",
    subject: "Mathematics",
    progress: 76,
    deadline: "2026-04-08",
    target: "Complete all derivatives, limits, and past-paper drills.",
    notes:
      "Need two more focused sessions on trigonometric limits before the next mock test.",
  },
  {
    id: "goal-02",
    title: "Finish Mechanics chapter review",
    subject: "Physics",
    progress: 58,
    deadline: "2026-04-03",
    target: "Cover motion, force diagrams, and one timed checkpoint quiz.",
    notes:
      "Biggest blocker is force diagram accuracy when solving multi-step problems.",
  },
  {
    id: "goal-03",
    title: "Complete organic chemistry flashcard deck",
    subject: "Chemistry",
    progress: 91,
    deadline: "2026-03-30",
    target: "Memorize reaction groups and classify mechanisms quickly.",
    notes:
      "Almost done. Final step is one review cycle for elimination reactions.",
  },
  {
    id: "goal-04",
    title: "Improve essay planning structure",
    subject: "History",
    progress: 64,
    deadline: "2026-04-12",
    target: "Practice three essay outlines with clear thesis and evidence flow.",
    notes:
      "Need to speed up paragraph planning and connect evidence back to argument more consistently.",
  },
];

const EMPTY_DRAFT: GoalDraft = {
  title: "",
  subject: "",
  progress: "0",
  deadline: "",
  target: "",
  notes: "",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDeadline(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getDaysRemaining(value: string) {
  const today = new Date();
  const deadline = new Date(value);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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

  if (goal.progress >= 100) {
    return {
      badge: "border-transparent bg-emerald-500 text-white",
      label: "Completed",
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
    label: "On Track",
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
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(
    INITIAL_GOALS[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<GoalDraft>({
    title: INITIAL_GOALS[0]?.title ?? "",
    subject: INITIAL_GOALS[0]?.subject ?? "",
    progress: String(INITIAL_GOALS[0]?.progress ?? 0),
    deadline: INITIAL_GOALS[0]?.deadline ?? "",
    target: INITIAL_GOALS[0]?.target ?? "",
    notes: INITIAL_GOALS[0]?.notes ?? "",
  });
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Select a goal to update its progress or create a new target for this term.",
  );

  const completedCount = useMemo(
    () => goals.filter((goal) => goal.progress >= 100).length,
    [goals],
  );
  const dueSoonCount = useMemo(
    () =>
      goals.filter((goal) => {
        const days = getDaysRemaining(goal.deadline);
        return days >= 0 && days <= 7 && goal.progress < 100;
      }).length,
    [goals],
  );
  const averageProgress = useMemo(() => {
    if (!goals.length) {
      return 0;
    }

    return Math.round(
      goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length,
    );
  }, [goals]);

  const deadlineSortedGoals = useMemo(
    () =>
      [...goals].sort(
        (first, second) =>
          new Date(first.deadline).getTime() - new Date(second.deadline).getTime(),
      ),
    [goals],
  );

  const selectGoal = (goal: GoalItem) => {
    setSelectedGoalId(goal.id);
    setDraft({
      title: goal.title,
      subject: goal.subject,
      progress: String(goal.progress),
      deadline: goal.deadline,
      target: goal.target,
      notes: goal.notes,
    });
    setIsCreateMode(false);
    setStatusMessage(`Editing ${goal.title}.`);
  };

  const openCreateMode = () => {
    setSelectedGoalId(null);
    setDraft(EMPTY_DRAFT);
    setIsCreateMode(true);
    setStatusMessage("Create a new study goal with a deadline and target progress.");
  };

  const handleSaveGoal = () => {
    const title = draft.title.trim();
    const subject = draft.subject.trim();
    const target = draft.target.trim();
    const notes = draft.notes.trim();
    const progress = Number(draft.progress);
    const safeProgress = Number.isFinite(progress)
      ? Math.min(Math.max(progress, 0), 100)
      : 0;

    if (!title || !subject || !draft.deadline || !target) {
      setStatusMessage("Add a title, subject, target, and deadline before saving.");
      return;
    }

    if (isCreateMode || !selectedGoalId) {
      const newGoal: GoalItem = {
        id: `goal-${Date.now()}`,
        title,
        subject,
        progress: safeProgress,
        deadline: draft.deadline,
        target,
        notes,
      };

      setGoals((current) => [newGoal, ...current]);
      setSelectedGoalId(newGoal.id);
      setDraft({
        title: newGoal.title,
        subject: newGoal.subject,
        progress: String(newGoal.progress),
        deadline: newGoal.deadline,
        target: newGoal.target,
        notes: newGoal.notes,
      });
      setIsCreateMode(false);
      setStatusMessage("New goal saved.");
      return;
    }

    const updatedGoals = goals.map((goal) =>
      goal.id === selectedGoalId
        ? {
            ...goal,
            title,
            subject,
            progress: safeProgress,
            deadline: draft.deadline,
            target,
            notes,
          }
        : goal,
    );

    setGoals(updatedGoals);
    setStatusMessage("Goal updated successfully.");
  };

  const handleDeleteGoal = () => {
    if (!selectedGoalId) {
      setStatusMessage("There is no selected goal to delete.");
      return;
    }

    const updatedGoals = goals.filter((goal) => goal.id !== selectedGoalId);
    const nextGoal = updatedGoals[0] ?? null;

    setGoals(updatedGoals);
    setSelectedGoalId(nextGoal?.id ?? null);
    setDraft(
      nextGoal
        ? {
            title: nextGoal.title,
            subject: nextGoal.subject,
            progress: String(nextGoal.progress),
            deadline: nextGoal.deadline,
            target: nextGoal.target,
            notes: nextGoal.notes,
          }
        : EMPTY_DRAFT,
    );
    setIsCreateMode(false);
    setStatusMessage("Goal deleted.");
  };

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
          <div className="relative grid gap-8 xl:grid-cols-[1.06fr_0.94fr] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                <Target className="h-4 w-4 text-blue-700" />
                <span>Goal Tracker</span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Study goals
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Track long-term academic targets, keep progress visible, and stay
                  ahead of the deadlines that matter most this term.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Flag className="h-4 w-4 text-sky-600" />
                  {goals.length} active goals
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Target className="h-4 w-4 text-indigo-600" />
                  {averageProgress}% average progress
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <CalendarDays className="h-4 w-4 text-amber-500" />
                  {dueSoonCount} due soon
                </span>
              </div>
              <div className="rounded-[28px] border border-sky-100/80 bg-white/78 p-5 shadow-[0_24px_56px_-42px_rgba(56,189,248,0.42)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Goal Focus
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Keep each target specific, measurable, and close to your current
                  revision priorities so progress feels steady instead of overwhelming.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.3)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Goal Pulse
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Turn your targets into calm weekly momentum
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.22)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <Flag className="h-4 w-4" />
                    Active Goals
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {goals.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Targets currently tracked in your study plan
                  </p>
                </div>
                <div className="rounded-[24px] border border-blue-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(37,99,235,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    <Target className="h-4 w-4" />
                    Avg. Progress
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {averageProgress}%
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Overall movement across your current goals
                  </p>
                </div>
                <div className="rounded-[24px] border border-emerald-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(16,185,129,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {completedCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Goals already reached or fully completed
                  </p>
                </div>
                <div className="rounded-[24px] border border-amber-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#fff9eb_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(245,158,11,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                    <CalendarDays className="h-4 w-4" />
                    Due Soon
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {dueSoonCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Targets that need attention within the next week
                  </p>
                </div>
              </div>

              <Button
                className="mt-5 h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] px-5 text-white shadow-[0_24px_50px_-26px_rgba(37,99,235,0.55)] transition hover:brightness-105"
                onClick={openCreateMode}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </div>
          </div>
        </section>
        
        <div className="grid gap-8 xl:grid-cols-[0.98fr_1.02fr]">
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                onClick={openCreateMode}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Button>
            }
            description="Each goal shows its live progress, deadline pressure, and the subject it belongs to."
            title="Goals List"
          >
            <div className="space-y-4">
              {goals.length ? (
                goals.map((goal) => {
                  const tone = getDeadlineTone(goal);

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
                            <Badge className={cn("px-3 py-1 text-[11px] uppercase tracking-[0.18em]", tone.badge)}>
                              {tone.label}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {goal.subject} â€¢ Due {formatDeadline(goal.deadline)}
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

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {goal.target}
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
                    Add your first study goal to start tracking progress and deadlines in one clean place.
                  </p>
                  <Button
                    className="mt-6 h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={openCreateMode}
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
                    onClick={handleDeleteGoal}
                    variant="outline"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button
                    className="h-10 rounded-2xl bg-sky-600 px-4 text-white hover:bg-sky-700"
                    onClick={handleSaveGoal}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Goal
                  </Button>
                </div>
              }
              description="Create a new goal or update the selected one with a fresh deadline and progress state."
              title={isCreateMode ? "Add Goal" : "Edit Goal"}
            >
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Goal title</span>
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
                    <span className="text-sm font-medium text-slate-700">Subject</span>
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
                    <span className="text-sm font-medium text-slate-700">Progress %</span>
                    <input
                      className={inputClassName}
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
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Deadline</span>
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
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Target outcome</span>
                  <textarea
                    className={textareaClassName}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        target: event.target.value,
                      }))
                    }
                    placeholder="Describe the goal you want to hit by the deadline."
                    rows={4}
                    value={draft.target}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Notes</span>
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

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Current status
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {statusMessage}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="Your upcoming deadlines, sorted so the most urgent goals stay visible."
              title="Deadline Tracking"
            >
              <div className="space-y-4">
                {deadlineSortedGoals.map((goal) => {
                  const tone = getDeadlineTone(goal);
                  const daysRemaining = getDaysRemaining(goal.deadline);

                  return (
                    <div
                      className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4"
                      key={goal.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {goal.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {goal.subject} â€¢ Due {formatDeadline(goal.deadline)}
                          </p>
                        </div>
                        <Badge className={cn("px-3 py-1 text-[11px] uppercase tracking-[0.18em]", tone.badge)}>
                          {tone.label}
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                        <span>{goal.progress}% complete</span>
                        <span>
                          {daysRemaining >= 0
                            ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`
                            : `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} overdue`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}





