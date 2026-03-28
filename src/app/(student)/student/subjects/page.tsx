"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  PencilLine,
  Plus,
  Save,
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

type SubjectPriority = "High" | "Medium" | "Low";

interface SubjectItem {
  id: string;
  slug: string;
  name: string;
  progress: number;
  examDate: string;
  priority: SubjectPriority;
  description: string;
}

interface SubjectFormState {
  name: string;
  progress: string;
  examDate: string;
  priority: SubjectPriority;
  description: string;
}

const INITIAL_SUBJECTS: SubjectItem[] = [
  {
    id: "subject-01",
    slug: "mathematics",
    name: "Mathematics",
    progress: 78,
    examDate: "2026-04-18",
    priority: "High",
    description: "Calculus, algebra, and weekly problem-solving drills.",
  },
  {
    id: "subject-02",
    slug: "physics",
    name: "Physics",
    progress: 64,
    examDate: "2026-04-21",
    priority: "High",
    description: "Mechanics revision, lab preparation, and concept reinforcement.",
  },
  {
    id: "subject-03",
    slug: "chemistry",
    name: "Chemistry",
    progress: 52,
    examDate: "2026-04-28",
    priority: "Medium",
    description: "Organic chemistry review and reaction-based flashcard practice.",
  },
  {
    id: "subject-04",
    slug: "history",
    name: "History",
    progress: 86,
    examDate: "2026-05-05",
    priority: "Low",
    description: "Essay structure, timeline recall, and chapter summaries.",
  },
];

const inputClassName =
  "h-11 w-full rounded-2xl border border-sky-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.14)] transition placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[112px] w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.14)] transition placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100";

const selectClassName =
  "h-11 w-full rounded-2xl border border-sky-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.14)] transition focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatExamDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    <Card className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] shadow-[0_24px_64px_-36px_rgba(56,189,248,0.14)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.06),transparent_30%)]" />
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

function SubjectCard({
  subject,
  onEdit,
  onDelete,
}: {
  subject: SubjectItem;
  onEdit: (subject: SubjectItem) => void;
  onDelete: (subjectId: string) => void;
}) {
  return (
    <Card className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] shadow-[0_22px_56px_-34px_rgba(56,189,248,0.14)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_-34px_rgba(59,130,246,0.2)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.06),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.05),transparent_30%)]" />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-slate-950">
                {subject.name}
              </h3>
              <Badge
                className={cn(
                  "px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                  subject.priority === "High"
                    ? "border-transparent bg-rose-500 text-white"
                    : subject.priority === "Medium"
                      ? "border-transparent bg-amber-500 text-white"
                      : "border-transparent bg-emerald-500 text-white",
                )}
              >
                {subject.priority}
              </Badge>
            </div>

            <p className="text-sm leading-7 text-slate-600">
              {subject.description}
            </p>
          </div>

          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e0f2fe_0%,#ede9fe_100%)] text-sky-700 shadow-sm">
            <BookOpen className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-600">Progress</span>
              <span className="font-bold text-slate-900">
                {subject.progress}%
              </span>
            </div>
            <Progress
              className="h-3 bg-slate-100"
              indicatorClassName="bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_60%,#7c3aed_100%)]"
              value={subject.progress}
            />
          </div>

          <div className="flex items-center justify-between rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-3 shadow-[0_14px_30px_-24px_rgba(14,165,233,0.12)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Exam Date
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {formatExamDate(subject.examDate)}
              </p>
            </div>
            <CalendarDays className="h-5 w-5 text-slate-500" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/student/subjects/${subject.slug}`}>
            <Button className="h-10 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_60%,#7c3aed_100%)] px-4 text-white shadow-[0_16px_30px_-20px_rgba(37,99,235,0.35)] hover:brightness-110">
              View Details
            </Button>
          </Link>
          <Button
            className="h-10 rounded-2xl border border-sky-200 bg-white px-4 font-semibold text-sky-700 shadow-sm hover:bg-sky-50"
            onClick={() => onEdit(subject)}
            variant="outline"
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            className="h-10 rounded-2xl border border-rose-200 bg-rose-50 px-4 font-semibold text-rose-700 hover:bg-rose-100"
            onClick={() => onDelete(subject.id)}
            variant="outline"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [form, setForm] = useState<SubjectFormState>({
    name: "",
    progress: "0",
    examDate: "",
    priority: "Medium",
    description: "",
  });

  const highPriorityCount = useMemo(
    () => subjects.filter((subject) => subject.priority === "High").length,
    [subjects],
  );

  const averageProgress = useMemo(() => {
    if (!subjects.length) {
      return 0;
    }

    return Math.round(
      subjects.reduce((sum, subject) => sum + subject.progress, 0) /
        subjects.length,
    );
  }, [subjects]);

  const nextExamSubject = useMemo(() => {
    if (!subjects.length) {
      return null;
    }

    return [...subjects].sort(
      (a, b) =>
        new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
    )[0];
  }, [subjects]);

  const resetForm = () => {
    setForm({
      name: "",
      progress: "0",
      examDate: "",
      priority: "Medium",
      description: "",
    });
    setEditingSubjectId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
    setStatusMessage("");
  };

  const openEditForm = (subject: SubjectItem) => {
    setForm({
      name: subject.name,
      progress: String(subject.progress),
      examDate: subject.examDate,
      priority: subject.priority,
      description: subject.description,
    });
    setEditingSubjectId(subject.id);
    setIsFormOpen(true);
    setStatusMessage("");
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (subjectId: string) => {
    setSubjects((current) =>
      current.filter((subject) => subject.id !== subjectId),
    );
    setStatusMessage("Subject removed from your dashboard.");

    if (editingSubjectId === subjectId) {
      closeForm();
    }
  };

  const handleSubmit = () => {
    const trimmedName = form.name.trim();

    if (!trimmedName || !form.examDate) {
      setStatusMessage("Add a subject name and exam date before saving.");
      return;
    }

    const parsedProgress = Number(form.progress);
    const safeProgress = Number.isFinite(parsedProgress)
      ? Math.min(Math.max(parsedProgress, 0), 100)
      : 0;

    if (editingSubjectId) {
      setSubjects((current) =>
        current.map((subject) =>
          subject.id === editingSubjectId
            ? {
                ...subject,
                name: trimmedName,
                slug: toSlug(trimmedName) || subject.slug,
                progress: safeProgress,
                examDate: form.examDate,
                priority: form.priority,
                description: form.description.trim() || subject.description,
              }
            : subject,
        ),
      );
      setStatusMessage("Subject updated successfully.");
    } else {
      const createdSubject: SubjectItem = {
        id: `subject-${Date.now()}`,
        slug: toSlug(trimmedName) || `subject-${Date.now()}`,
        name: trimmedName,
        progress: safeProgress,
        examDate: form.examDate,
        priority: form.priority,
        description:
          form.description.trim() || "Custom subject added to your study plan.",
      };

      setSubjects((current) => [createdSubject, ...current]);
      setStatusMessage("New subject added to your study plan.");
    }

    closeForm();
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your subjects..."
    >
      <div className="space-y-8 pb-8">
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_24%,#f6f3ff_56%,#fff8ef_82%,#fffdf9_100%)]" />
        <div className="fixed left-[-80px] top-[120px] -z-10 h-[260px] w-[260px] rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="fixed right-[-60px] top-[220px] -z-10 h-[280px] w-[280px] rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="fixed bottom-[30px] left-[30%] -z-10 h-[220px] w-[220px] rounded-full bg-amber-200/15 blur-3xl" />

        <section className="relative overflow-hidden rounded-[40px] border border-white/85 bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_18%,#ecfeff_42%,#eef2ff_68%,#fdf2f8_88%,#fff8e8_108%)] p-6 shadow-[0_36px_92px_-48px_rgba(56,189,248,0.24)] sm:p-8">
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(37,99,235,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_58%)]" />
          <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-sky-200/32 blur-3xl" />
          <div className="absolute right-10 top-4 h-40 w-40 rounded-full bg-fuchsia-200/24 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-amber-200/24 blur-3xl" />
          <div className="absolute left-1/3 top-6 h-32 w-32 rounded-full bg-violet-200/20 blur-3xl" />
          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-white/88 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.16)] backdrop-blur-sm">
                <BookOpen className="mr-1.5 h-3.5 w-3.5 text-blue-700" />
                Study Subjects
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  My Subjects
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">
                  Track your core subjects, monitor progress, and keep the most
                  important exams visible while you plan the rest of your week.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-2xl border border-sky-100/80 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_100%)] px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(59,130,246,0.14)] backdrop-blur-sm">
                  {subjects.length} active subjects
                </span>
                <span className="rounded-2xl border border-violet-100/80 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_100%)] px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(99,102,241,0.14)] backdrop-blur-sm">
                  {highPriorityCount} high priority
                </span>
                <span className="rounded-2xl border border-amber-100/80 bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_100%)] px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(245,158,11,0.14)] backdrop-blur-sm">
                  {averageProgress}% average progress
                </span>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,250,252,0.86)_100%)] p-5 shadow-[0_26px_60px_-34px_rgba(37,99,235,0.2)] backdrop-blur-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">
                Subject Pulse
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-[22px] border border-sky-100/80 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_100%)] px-4 py-3 shadow-[0_16px_34px_-24px_rgba(37,99,235,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white">
                      <Target className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Average Progress
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {averageProgress}% across subjects
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-violet-100/80 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_100%)] px-4 py-3 shadow-[0_16px_34px_-24px_rgba(99,102,241,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b5cf6_0%,#2563eb_100%)] text-white">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Priority Load
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {highPriorityCount} high-priority subjects
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-amber-100/80 bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_100%)] px-4 py-3 shadow-[0_16px_34px_-24px_rgba(245,158,11,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_100%)] text-white">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Next Exam
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {nextExamSubject
                          ? `${nextExamSubject.name} · ${formatExamDate(nextExamSubject.examDate)}`
                          : "No exam dates added yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="mt-5 h-11 w-full rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_42%,#7c3aed_72%,#ec4899_100%)] px-5 text-white shadow-[0_20px_40px_-22px_rgba(99,102,241,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                onClick={openCreateForm}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </div>
          </div>
        </section>

        {isFormOpen ? (
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-sky-200 bg-white px-4 font-semibold text-sky-700 shadow-sm hover:bg-sky-50"
                onClick={closeForm}
                variant="outline"
              >
                Cancel
              </Button>
            }
            description="Add a new subject or update an existing one with the latest progress, exam date, and priority."
            title={editingSubjectId ? "Edit Subject" : "Add Subject"}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field htmlFor="subject-name" label="Subject name">
                <input
                  className={inputClassName}
                  id="subject-name"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Mathematics"
                  value={form.name}
                />
              </Field>

              <Field htmlFor="subject-priority" label="Priority">
                <select
                  className={selectClassName}
                  id="subject-priority"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority: event.target.value as SubjectPriority,
                    }))
                  }
                  value={form.priority}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </Field>

              <Field htmlFor="subject-progress" label="Progress %">
                <input
                  className={inputClassName}
                  id="subject-progress"
                  max="100"
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      progress: event.target.value,
                    }))
                  }
                  type="number"
                  value={form.progress}
                />
              </Field>

              <Field htmlFor="subject-exam-date" label="Exam date">
                <input
                  className={inputClassName}
                  id="subject-exam-date"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      examDate: event.target.value,
                    }))
                  }
                  type="date"
                  value={form.examDate}
                />
              </Field>

              <div className="md:col-span-2">
                <Field htmlFor="subject-description" label="Description">
                  <textarea
                    className={textareaClassName}
                    id="subject-description"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Focus areas, chapters, or revision notes"
                    rows={5}
                    value={form.description}
                  />
                </Field>
              </div>

              <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  {statusMessage || "Use dummy values now and wire to MongoDB later."}
                </div>
                <Button
                  className="h-11 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_45%,#7c3aed_100%)] px-5 text-white shadow-[0_18px_34px_-20px_rgba(37,99,235,0.45)] hover:brightness-110"
                  onClick={handleSubmit}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingSubjectId ? "Save Subject" : "Add Subject"}
                </Button>
              </div>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          description="Each subject card shows your current progress, exam timing, priority level, and a direct route to the detail page."
          title="Subject Library"
        >
          {subjects.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  onDelete={handleDelete}
                  onEdit={openEditForm}
                  subject={subject}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#e0f2fe_0%,#ede9fe_100%)] text-sky-700 shadow-[0_12px_28px_-18px_rgba(14,165,233,0.22)]">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950">
                No subjects yet
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Add your first subject to start tracking progress, organize exam
                timelines, and keep priorities visible in one clean workspace.
              </p>
              <Button
                className="mt-6 h-11 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_45%,#7c3aed_100%)] px-5 text-white shadow-[0_18px_34px_-20px_rgba(37,99,235,0.45)] hover:brightness-110"
                onClick={openCreateForm}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Subject
              </Button>
            </div>
          )}
        </SectionCard>
      </div>
    </ProtectedDashboardLayout>
  );
}
