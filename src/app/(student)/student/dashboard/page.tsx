"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  BookOpen,
  Brain,
  CalendarDays,
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

interface TaskItem {
  id: string;
  title: string;
  subject: string;
  time: string;
  duration: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
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

function StatCard({
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

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-01",
    title: "Complete Physics motion revision",
    subject: "Physics",
    time: "4:30 PM",
    duration: "45 min",
    priority: "High",
    completed: false,
  },
  {
    id: "task-02",
    title: "Solve 20 calculus practice questions",
    subject: "Mathematics",
    time: "6:00 PM",
    duration: "60 min",
    priority: "High",
    completed: true,
  },
  {
    id: "task-03",
    title: "Review chemistry flashcards",
    subject: "Chemistry",
    time: "7:45 PM",
    duration: "30 min",
    priority: "Medium",
    completed: false,
  },
  {
    id: "task-04",
    title: "Write history summary notes",
    subject: "History",
    time: "8:30 PM",
    duration: "35 min",
    priority: "Low",
    completed: false,
  },
];

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

export default function StudentDashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const studyHours = 28.5;
  const streak = 18;
  const completedTasks = 36;
  const activeSubjects = 6;
  const dailyGoalHours = 4;
  const todayHours = 2.8;
  const goalProgress = Math.round((todayHours / dailyGoalHours) * 100);
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const handleToggleTask = (taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your dashboard..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_44%,#dbeafe_120%)] p-6 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_58%)]" />
          <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                Student Dashboard
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Welcome back, Nethmi
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/85 sm:text-base">
                  Your study momentum looks strong today. Keep your streak alive,
                  finish the most important tasks first, and let StudyFlow AI guide
                  the next best step.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-100/90">
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {todayLabel}
                </span>
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  Grade 12 - Advanced Level
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="h-11 rounded-2xl bg-white px-5 text-slate-950 shadow-lg shadow-slate-950/10 hover:bg-slate-100"
                  onClick={() => router.push("/student/planner")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
                <Button
                  className="h-11 rounded-2xl border border-white/15 bg-white/10 px-5 text-white hover:bg-white/15"
                  onClick={() => router.push("/student/pomodoro")}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Session
                </Button>
              </div>
            </div>

            <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-100/80">
                    Daily focus goal
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {todayHours} / {dailyGoalHours} hrs
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-white">
                  <Target className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-5">
                <Progress
                  className="h-3 bg-white/15"
                  indicatorClassName="bg-white"
                  value={goalProgress}
                />
                <div className="mt-3 flex items-center justify-between text-sm text-slate-100/80">
                  <span>{goalProgress}% completed</span>
                  <span>{dailyGoalHours - todayHours} hrs left today</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            accentClassName="from-sky-600 to-cyan-500"
            detail="This week's focused study time"
            icon={<Clock3 className="h-5 w-5" />}
            label="Study Hours"
            value={`${studyHours} hrs`}
          />
          <StatCard
            accentClassName="from-orange-500 to-rose-500"
            detail="Current daily streak"
            icon={<Flame className="h-5 w-5" />}
            label="Streak"
            value={`${streak} days`}
          />
          <StatCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Completed this week"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Tasks Completed"
            value={`${completedTasks}`}
          />
          <StatCard
            accentClassName="from-slate-900 to-slate-700"
            detail="Subjects currently active"
            icon={<BookOpen className="h-5 w-5" />}
            label="Active Subjects"
            value={`${activeSubjects}`}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 hover:bg-slate-50"
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
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Daily task progress
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {completedTaskCount} of {tasks.length} tasks completed today
                    </p>
                  </div>
                  <div className="w-full max-w-xs">
                    <Progress
                      className="h-3"
                      indicatorClassName="bg-slate-950"
                      value={(completedTaskCount / tasks.length) * 100}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <button
                    className="flex w-full items-start gap-4 rounded-[24px] border border-slate-200/80 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm transition",
                        task.completed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-500",
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              task.completed
                                ? "text-slate-400 line-through"
                                : "text-slate-950",
                            )}
                          >
                            {task.title}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              {task.subject}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              {task.time}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              {task.duration}
                            </span>
                          </div>
                        </div>

                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                            task.priority === "High"
                              ? "bg-rose-100 text-rose-600"
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
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              description="Personalized suggestions generated from your study rhythm, task history, and upcoming workload."
              title="AI Recommendations"
            >
              <div className="space-y-4">
                {RECOMMENDATIONS.map((item) => (
                  <div
                    className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4"
                    key={item.id}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                        <Brain className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-950">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.description}
                        </p>
                        <button
                          className="mt-3 inline-flex items-center text-sm font-medium text-sky-700 transition hover:text-sky-800"
                          onClick={() => router.push(item.href)}
                          type="button"
                        >
                          {item.label}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              description="The deadlines that need attention soonest, so you can stay ahead instead of catching up."
              title="Upcoming Deadlines"
            >
              <div className="space-y-4">
                {DEADLINES.map((deadline) => (
                  <div
                    className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4"
                    key={deadline.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {deadline.title}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                            {deadline.subject}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                            {deadline.dueLabel}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                          deadline.status === "Urgent"
                            ? "border-transparent bg-rose-500 text-white"
                            : deadline.status === "Upcoming"
                              ? "border-transparent bg-amber-500 text-white"
                              : "border-transparent bg-slate-900 text-white",
                        )}
                      >
                        {deadline.status}
                      </Badge>
                    </div>
                  </div>
                ))}
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
              className="group rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_120%)] p-5 text-left shadow-[0_20px_50px_-40px_rgba(37,99,235,0.45)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_-36px_rgba(37,99,235,0.42)]"
              onClick={() => router.push("/student/planner")}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200">
                  <ListTodo className="h-5 w-5" />
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                Add Task
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Capture a new study task, set the right subject, and slot it into
                your planner in a few seconds.
              </p>
            </button>

            <button
              className="group rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_55%,#d1fae5_120%)] p-5 text-left shadow-[0_20px_50px_-40px_rgba(13,148,136,0.4)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_-36px_rgba(13,148,136,0.4)]"
              onClick={() => router.push("/student/pomodoro")}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                  <PlayCircle className="h-5 w-5" />
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                Start Session
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
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
