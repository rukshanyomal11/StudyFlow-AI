"use client";

import { useMemo, useState } from "react";
import type { DragEvent, ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  GripVertical,
  ListTodo,
  PencilLine,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
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

type TaskPriority = "High" | "Medium" | "Low";
type TaskStatus = "To Do" | "In Progress" | "Done";

interface PlannerTask {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  priority: TaskPriority;
  status: TaskStatus;
}

interface PlannerFormState {
  title: string;
  subject: string;
  date: string;
  time: string;
  priority: TaskPriority;
  status: TaskStatus;
}

const INITIAL_TASKS: PlannerTask[] = [
  {
    id: "task-01",
    title: "Finish mechanics revision notes",
    subject: "Physics",
    date: "2026-03-24",
    time: "16:30",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "task-02",
    title: "Complete derivatives problem set",
    subject: "Mathematics",
    date: "2026-03-24",
    time: "18:00",
    priority: "High",
    status: "To Do",
  },
  {
    id: "task-03",
    title: "Review bonding flashcards",
    subject: "Chemistry",
    date: "2026-03-25",
    time: "17:15",
    priority: "Medium",
    status: "To Do",
  },
  {
    id: "task-04",
    title: "Write history chapter summary",
    subject: "History",
    date: "2026-03-25",
    time: "19:00",
    priority: "Low",
    status: "Done",
  },
  {
    id: "task-05",
    title: "Practice essay structure outline",
    subject: "English",
    date: "2026-03-26",
    time: "15:45",
    priority: "Medium",
    status: "To Do",
  },
];

const EMPTY_FORM: PlannerFormState = {
  title: "",
  subject: "",
  date: "",
  time: "",
  priority: "Medium",
  status: "To Do",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-sky-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100";

const selectClassName =
  "h-11 w-full rounded-2xl border border-sky-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatTaskDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const taskDate = new Date(
    year,
    (month ?? 1) - 1,
    day ?? 1,
    hours ?? 0,
    minutes ?? 0,
  );

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(taskDate);
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
    <Card className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_48px_-30px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.05),transparent_30%)]" />
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

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2.5" htmlFor={htmlFor}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default function StudentPlannerPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [form, setForm] = useState<PlannerFormState>(EMPTY_FORM);
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [dateFilter, setDateFilter] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Drag task cards to reorder your study flow.",
  );
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  const subjectOptions = useMemo(
    () => ["All Subjects", ...new Set(tasks.map((task) => task.subject))],
    [tasks],
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesSubject =
          subjectFilter === "All Subjects" || task.subject === subjectFilter;
        const matchesDate = !dateFilter || task.date === dateFilter;

        return matchesSubject && matchesDate;
      }),
    [dateFilter, subjectFilter, tasks],
  );

  const completedCount = useMemo(
    () => tasks.filter((task) => task.status === "Done").length,
    [tasks],
  );
  const inProgressCount = useMemo(
    () => tasks.filter((task) => task.status === "In Progress").length,
    [tasks],
  );
  const highPriorityCount = useMemo(
    () => tasks.filter((task) => task.priority === "High").length,
    [tasks],
  );

  const openCreateModal = () => {
    setEditingTaskId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
    setStatusMessage("Create a new planner task.");
  };

  const openEditModal = (task: PlannerTask) => {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      subject: task.subject,
      date: task.date,
      time: task.time,
      priority: task.priority,
      status: task.status,
    });
    setIsModalOpen(true);
    setStatusMessage("Editing selected task.");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTaskId(null);
    setForm(EMPTY_FORM);
  };

  const handleSaveTask = () => {
    const title = form.title.trim();
    const subject = form.subject.trim();

    if (!title || !subject || !form.date || !form.time) {
      setStatusMessage("Fill in title, subject, date, and time before saving.");
      return;
    }

    if (editingTaskId) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title,
                subject,
                date: form.date,
                time: form.time,
                priority: form.priority,
                status: form.status,
              }
            : task,
        ),
      );
      setStatusMessage("Task updated successfully.");
    } else {
      setTasks((current) => [
        {
          id: `task-${Date.now()}`,
          title,
          subject,
          date: form.date,
          time: form.time,
          priority: form.priority,
          status: form.status,
        },
        ...current,
      ]);
      setStatusMessage("Task added to your planner.");
    }

    closeModal();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setStatusMessage("Task removed from your planner.");

    if (editingTaskId === taskId) {
      closeModal();
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
    setStatusMessage("Move the task over another card to reorder.");
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
    taskId: string,
  ) => {
    event.preventDefault();
    setDragOverTaskId(taskId);
  };

  const handleDrop = (targetTaskId: string) => {
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    setTasks((current) => {
      const next = [...current];
      const fromIndex = next.findIndex((task) => task.id === draggedTaskId);
      const toIndex = next.findIndex((task) => task.id === targetTaskId);

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      const [movedTask] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedTask);
      return next;
    });

    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setStatusMessage("Task order updated.");
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your planner..."
    >
      <div className="space-y-8 pb-8">
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_24%,#f6f3ff_56%,#fff8ef_82%,#fffdf9_100%)]" />
        <div className="fixed left-[-80px] top-[120px] -z-10 h-[260px] w-[260px] rounded-full bg-fuchsia-200/18 blur-3xl" />
        <div className="fixed right-[-60px] top-[220px] -z-10 h-[280px] w-[280px] rounded-full bg-cyan-200/18 blur-3xl" />
        <div className="fixed bottom-[30px] left-[30%] -z-10 h-[220px] w-[220px] rounded-full bg-amber-200/12 blur-3xl" />

        <section className="relative overflow-hidden rounded-[38px] border border-white/85 bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_22%,#ecfeff_46%,#eef2ff_74%,#fff8e8_108%)] p-6 shadow-[0_32px_84px_-44px_rgba(56,189,248,0.22)] sm:p-8">
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(37,99,235,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_58%)]" />
          <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-sky-200/24 blur-3xl" />
          <div className="absolute right-10 top-4 h-36 w-36 rounded-full bg-fuchsia-200/18 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-amber-200/20 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-white/88 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.16)] backdrop-blur-sm">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-700" />
                Study Planner
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  Plan your study flow
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">
                  Organize tasks, filter by subject or date, and keep your most
                  important study work moving with a clean, modern planner.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-2xl border border-sky-100/80 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_100%)] px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(59,130,246,0.14)] backdrop-blur-sm">
                  {tasks.length} total tasks
                </span>
                <span className="rounded-2xl border border-violet-100/80 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_100%)] px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(99,102,241,0.14)] backdrop-blur-sm">
                  {inProgressCount} in progress
                </span>
                <span className="rounded-2xl border border-amber-100/80 bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_100%)] px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(245,158,11,0.14)] backdrop-blur-sm">
                  {highPriorityCount} high priority
                </span>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/86 p-5 shadow-[0_24px_56px_-34px_rgba(37,99,235,0.18)] backdrop-blur-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">
                Planner Snapshot
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-[22px] border border-sky-100/80 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_100%)] px-4 py-3 shadow-[0_16px_34px_-24px_rgba(37,99,235,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white">
                      <ListTodo className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Open Tasks
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {tasks.length - completedCount} still in motion
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-violet-100/80 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_100%)] px-4 py-3 shadow-[0_16px_34px_-24px_rgba(99,102,241,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b5cf6_0%,#2563eb_100%)] text-white">
                      <Clock3 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Current Filters
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {subjectFilter} {dateFilter ? "· Date selected" : "· All dates"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-emerald-100/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_100%)] px-4 py-3 shadow-[0_16px_34px_-24px_rgba(16,185,129,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10b981_0%,#14b8a6_100%)] text-white">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Completed
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {completedCount} tasks already done
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="mt-5 h-11 w-full rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_42%,#7c3aed_72%,#ec4899_100%)] px-5 text-white shadow-[0_20px_40px_-22px_rgba(99,102,241,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                onClick={openCreateModal}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_48px_-30px_rgba(59,130,246,0.10)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    Planned Tasks
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                    {tasks.length}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Across your study week
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-700 to-sky-600 text-white shadow-[0_16px_30px_-16px_rgba(37,99,235,0.25)]">
                  <ListTodo className="h-5 w-5" />
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_48px_-30px_rgba(59,130,246,0.10)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    Completed
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                    {completedCount}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Tasks already finished
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-[0_16px_30px_-16px_rgba(5,150,105,0.24)]">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_48px_-30px_rgba(59,130,246,0.10)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    Focus Signal
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                    {filteredTasks.length}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Tasks match current filters
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-[0_16px_30px_-16px_rgba(14,165,233,0.24)]">
                  <Sparkles className="h-5 w-5" />
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        <SectionCard
          action={
            <Button
              className="h-10 rounded-2xl border border-sky-200 bg-white px-4 font-semibold text-sky-700 shadow-sm hover:bg-sky-50"
              onClick={() => {
                setSubjectFilter("All Subjects");
                setDateFilter("");
                setStatusMessage("Filters cleared.");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          }
          description="Filter tasks by subject and study date to focus on the work that matters right now."
          title="Planner Filters"
        >
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <label className="space-y-2.5">
              <span className="text-sm font-semibold text-slate-700">
                Subject
              </span>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <select
                  className={cn(selectClassName, "pl-11")}
                  onChange={(event) => setSubjectFilter(event.target.value)}
                  value={subjectFilter}
                >
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="space-y-2.5">
              <span className="text-sm font-semibold text-slate-700">Date</span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className={cn(inputClassName, "pl-11")}
                  onChange={(event) => setDateFilter(event.target.value)}
                  type="date"
                  value={dateFilter}
                />
              </div>
            </label>

            <div className="flex items-end">
              <div className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm md:w-auto">
                {statusMessage}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          description="Drag any task card to reorder your study plan. Use edit and delete actions to keep the queue clean."
          title="Task List"
        >
          <div className="hidden rounded-[24px] border border-slate-300 bg-slate-50 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-600 lg:grid lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] lg:gap-4">
            <span>Task</span>
            <span>Subject</span>
            <span>Date / Time</span>
            <span>Priority</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="mt-4 space-y-4">
            {filteredTasks.length ? (
              filteredTasks.map((task) => (
                <div
                  className={cn(
                    "rounded-[26px] border bg-white p-5 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.08)] transition",
                    dragOverTaskId === task.id
                      ? "border-sky-400 ring-4 ring-sky-100"
                      : "border-slate-200 hover:border-sky-200 hover:shadow-[0_16px_34px_-22px_rgba(14,165,233,0.14)]",
                    draggedTaskId === task.id && "opacity-70",
                  )}
                  draggable
                  key={task.id}
                  onDragEnd={handleDragEnd}
                  onDragOver={(event) => handleDragOver(event, task.id)}
                  onDragStart={() => handleDragStart(task.id)}
                  onDrop={() => handleDrop(task.id)}
                >
                  <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] lg:items-center lg:gap-4">
                    <div className="flex items-start gap-4">
                      <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                        <GripVertical className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-950">
                          {task.title}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-500 lg:hidden">
                          {task.subject}
                        </p>
                      </div>
                    </div>

                    <div className="text-base font-medium text-slate-800">
                      {task.subject}
                    </div>

                    <div className="flex items-center gap-2 text-base font-medium text-slate-800">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      {formatTaskDate(task.date, task.time)}
                    </div>

                    <div>
                      <Badge
                        className={cn(
                          "px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.18em]",
                          task.priority === "High"
                            ? "border-transparent bg-rose-500 text-white"
                            : task.priority === "Medium"
                              ? "border-transparent bg-slate-900 text-white"
                              : "border-transparent bg-slate-900 text-white",
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    <div>
                      <Badge
                        className={cn(
                          "px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.18em]",
                          task.status === "Done"
                            ? "border-transparent bg-emerald-600 text-white"
                            : task.status === "In Progress"
                              ? "border-transparent bg-sky-200 text-sky-900"
                              : "border-transparent bg-slate-200 text-slate-700",
                        )}
                      >
                        {task.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                      <Button
                        className="h-10 rounded-2xl bg-slate-950 px-4 font-semibold text-white hover:bg-slate-800"
                        onClick={() => openEditModal(task)}
                        size="sm"
                      >
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        className="h-10 rounded-2xl border border-rose-200 bg-rose-50 px-4 font-semibold text-rose-700 hover:bg-rose-100"
                        onClick={() => handleDeleteTask(task.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#e0f2fe_0%,#ede9fe_100%)] text-sky-700 shadow-[0_12px_28px_-18px_rgba(14,165,233,0.22)]">
                  <ListTodo className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  No tasks match these filters
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
                  Adjust the selected subject or date filter, or add a fresh task
                  to keep your planner moving.
                </p>
                <Button
                  className="mt-6 h-11 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_45%,#7c3aed_100%)] px-5 text-white shadow-[0_18px_34px_-20px_rgba(37,99,235,0.42)] hover:brightness-110"
                  onClick={openCreateModal}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            )}
          </div>
        </SectionCard>

        {isModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white shadow-[0_32px_80px_-34px_rgba(56,189,248,0.22)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {editingTaskId ? "Edit Task" : "Add Task"}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Set the task details, priority, timing, and status in one clean modal.
                  </p>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                  onClick={closeModal}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field htmlFor="task-title" label="Title">
                    <input
                      className={inputClassName}
                      id="task-title"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Finish chapter review"
                      value={form.title}
                    />
                  </Field>

                  <Field htmlFor="task-subject" label="Subject">
                    <input
                      className={inputClassName}
                      id="task-subject"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          subject: event.target.value,
                        }))
                      }
                      placeholder="Physics"
                      value={form.subject}
                    />
                  </Field>

                  <Field htmlFor="task-date" label="Date">
                    <input
                      className={inputClassName}
                      id="task-date"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                      type="date"
                      value={form.date}
                    />
                  </Field>

                  <Field htmlFor="task-time" label="Time">
                    <input
                      className={inputClassName}
                      id="task-time"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          time: event.target.value,
                        }))
                      }
                      type="time"
                      value={form.time}
                    />
                  </Field>

                  <Field htmlFor="task-priority" label="Priority">
                    <select
                      className={selectClassName}
                      id="task-priority"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          priority: event.target.value as TaskPriority,
                        }))
                      }
                      value={form.priority}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </Field>

                  <Field htmlFor="task-status" label="Status">
                    <select
                      className={selectClassName}
                      id="task-status"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value as TaskStatus,
                        }))
                      }
                      value={form.status}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Planner tasks stay local for now and are ready to connect to MongoDB later.
                </p>
                <div className="flex gap-3">
                  <Button
                    className="h-11 rounded-2xl border border-sky-200 bg-white px-5 font-semibold text-sky-700 shadow-sm hover:bg-sky-50"
                    onClick={closeModal}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_45%,#7c3aed_100%)] px-5 text-white shadow-[0_18px_34px_-20px_rgba(37,99,235,0.42)] hover:brightness-110"
                    onClick={handleSaveTask}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {editingTaskId ? "Save Changes" : "Add Task"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedDashboardLayout>
  );
}
