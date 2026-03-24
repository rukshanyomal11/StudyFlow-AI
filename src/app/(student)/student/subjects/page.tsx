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
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[112px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const selectClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

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
    <label className="space-y-2" htmlFor={htmlFor}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
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
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.24)] transition hover:-translate-y-1 hover:shadow-[0_26px_65px_-38px_rgba(15,23,42,0.26)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold text-slate-950">
                {subject.name}
              </h3>
              <Badge
                className={cn(
                  "px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
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

            <p className="text-sm leading-6 text-slate-600">
              {subject.description}
            </p>
          </div>

          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
            <BookOpen className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">Progress</span>
              <span className="font-semibold text-slate-900">
                {subject.progress}%
              </span>
            </div>
            <Progress
              className="h-3"
              indicatorClassName="bg-slate-950"
              value={subject.progress}
            />
          </div>

          <div className="flex items-center justify-between rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Exam Date
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {formatExamDate(subject.examDate)}
              </p>
            </div>
            <CalendarDays className="h-5 w-5 text-slate-500" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/student/subjects/${subject.slug}`}>
            <Button className="h-10 rounded-2xl bg-slate-950 px-4 text-white hover:bg-slate-800">
              View Details
            </Button>
          </Link>
          <Button
            className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 hover:bg-slate-50"
            onClick={() => onEdit(subject)}
            variant="outline"
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            className="h-10 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-rose-700 hover:bg-rose-100"
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
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_44%,#dcfce7_120%)] p-6 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                Study Subjects
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  My Subjects
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/85 sm:text-base">
                  Track your core subjects, monitor progress, and keep the most
                  important exams visible while you plan the rest of your week.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-100/90">
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {subjects.length} active subjects
                </span>
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {highPriorityCount} high priority
                </span>
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {averageProgress}% average progress
                </span>
              </div>
            </div>

            <Button
              className="h-11 rounded-2xl bg-white px-5 text-slate-950 shadow-lg shadow-slate-950/10 hover:bg-slate-100"
              onClick={openCreateForm}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </div>
        </section>

        {isFormOpen ? (
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 hover:bg-slate-50"
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
                <div className="text-sm text-slate-500">
                  {statusMessage || "Use dummy values now and wire to MongoDB later."}
                </div>
                <Button
                  className="h-11 rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800"
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
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-slate-800 shadow-sm">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">
                No subjects yet
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Add your first subject to start tracking progress, organize exam
                timelines, and keep priorities visible in one clean workspace.
              </p>
              <Button
                className="mt-6 h-11 rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800"
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
