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
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

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
    badge: "border-transparent bg-slate-900 text-white",
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
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.22)]">
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
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_44%,#ecfccb_120%)] p-6 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                Goal Tracker
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Study goals
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/85 sm:text-base">
                  Track long-term academic targets, keep progress visible, and stay
                  ahead of the deadlines that matter most this term.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-100/90">
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {goals.length} active goals
                </span>
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {averageProgress}% average progress
                </span>
              </div>
            </div>

            <Button
              className="h-11 rounded-2xl bg-white px-5 text-slate-950 shadow-lg shadow-slate-950/10 hover:bg-slate-100"
              onClick={openCreateMode}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            accentClassName="from-slate-900 to-slate-700"
            detail="Tracked in your dashboard"
            icon={<Target className="h-5 w-5" />}
            label="Goals"
            value={`${goals.length}`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Reached or fully complete"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completed"
            value={`${completedCount}`}
          />
          <SummaryCard
            accentClassName="from-amber-500 to-orange-500"
            detail="Due within the next 7 days"
            icon={<CalendarDays className="h-5 w-5" />}
            label="Due Soon"
            value={`${dueSoonCount}`}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[0.98fr_1.02fr]">
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 hover:bg-slate-50"
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
                          : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
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
                            {goal.subject} • Due {formatDeadline(goal.deadline)}
                          </p>
                        </div>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
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
                          indicatorClassName="bg-slate-950"
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
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-slate-800 shadow-sm">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">
                    No goals yet
                  </h3>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    Add your first study goal to start tracking progress and deadlines in one clean place.
                  </p>
                  <Button
                    className="mt-6 h-11 rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800"
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
                    className="h-10 rounded-2xl bg-slate-950 px-4 text-white hover:bg-slate-800"
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

                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
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
                      className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4"
                      key={goal.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {goal.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {goal.subject} • Due {formatDeadline(goal.deadline)}
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
