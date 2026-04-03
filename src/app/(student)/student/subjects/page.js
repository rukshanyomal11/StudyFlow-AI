'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  ExternalLink,
  FolderOpen,
  PencilLine,
  Plus,
  Save,
  Target,
  Trash2,
  Users,
} from 'lucide-react';
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout';
import { studentSidebarLinks } from '@/data/sidebarLinks';
import Alert from '@/components/ui/Alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const EMPTY_FORM = {
  name: '',
  progress: '0',
  examDate: '',
  priority: 'medium',
  description: '',
};

const inputClassName =
  'h-11 w-full rounded-2xl border border-sky-200 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.14)] focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function normalizeKey(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function formatExamDate(value) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'No exam date';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function formatShortDate(value) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Recently';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(parsedDate);
}

function toDateInputValue(value) {
  if (!value) {
    return '';
  }
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }
  return parsedDate.toISOString().slice(0, 10);
}

function mapSubject(subject) {
  return {
    id: subject?._id || '',
    name: typeof subject?.name === 'string' ? subject.name : 'Untitled subject',
    progress:
      typeof subject?.progress === 'number' && Number.isFinite(subject.progress)
        ? Math.min(Math.max(subject.progress, 0), 100)
        : 0,
    examDate: toDateInputValue(subject?.examDate),
    priority:
      subject?.priority === 'high' || subject?.priority === 'low'
        ? subject.priority
        : 'medium',
    description:
      typeof subject?.description === 'string' && subject.description.trim()
        ? subject.description
        : 'No notes added for this subject yet.',
  };
}

function mapMaterial(material) {
  return {
    id: material?.id || material?._id || '',
    title: typeof material?.title === 'string' ? material.title : 'Untitled material',
    subjectName:
      typeof material?.subjectName === 'string' && material.subjectName.trim()
        ? material.subjectName
        : 'General',
    type: typeof material?.type === 'string' ? material.type : 'Notes',
    mentorName:
      typeof material?.mentorName === 'string' && material.mentorName.trim()
        ? material.mentorName
        : 'Mentor upload',
    description:
      typeof material?.description === 'string' && material.description.trim()
        ? material.description
        : 'No extra description provided for this material yet.',
    fileUrl: typeof material?.fileUrl === 'string' ? material.fileUrl : '',
    createdAt: material?.createdAt || '',
  };
}

async function readApiError(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (typeof data?.error === 'string' && data.error.trim()) {
      return data.error;
    }
  } catch {
    return fallbackMessage;
  }
  return fallbackMessage;
}

function getStatusDetails(message, defaultTone = 'info') {
  if (message === 'Unauthorized' || message === 'Forbidden') {
    return {
      tone: 'error',
      message: 'You need to be signed in to manage subjects.',
      hint: 'Refresh the page and sign in again if needed.',
    };
  }
  if (message === 'Subject name is required') {
    return {
      tone: 'warning',
      message: 'Add a subject name before saving.',
      hint: 'A short clear name like Mathematics or Physics works best.',
    };
  }
  if (message === 'Exam date is required') {
    return {
      tone: 'warning',
      message: 'Choose an exam date before saving.',
      hint: 'The timetable generator uses exam dates to decide urgency.',
    };
  }
  if (message === 'Progress must be a number between 0 and 100') {
    return {
      tone: 'warning',
      message: 'Progress must stay between 0 and 100.',
      hint: 'Use a percentage between 0 and 100.',
    };
  }
  if (message === 'Subject not found') {
    return {
      tone: 'warning',
      message: 'That subject could not be found anymore.',
      hint: 'Refresh the page to sync your latest saved subjects.',
    };
  }
  return { tone: defaultTone, message, hint: undefined };
}

function SectionCard({ title, description, action, children }) {
  return (
    <Card className="rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_24px_64px_-36px_rgba(56,189,248,0.14)]">
      <CardHeader className="pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-950">{title}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
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

function SubjectCard({ subject, materials, onEdit, onDelete, isDeleting, isBusy }) {
  const previewMaterials = materials.slice(0, 2);
  const remaining = Math.max(materials.length - previewMaterials.length, 0);

  return (
    <Card className="rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_20px_56px_-34px_rgba(56,189,248,0.14)]">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-slate-950">{subject.name}</h3>
              <Badge
                className={cn(
                  'px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]',
                  subject.priority === 'high'
                    ? 'border-transparent bg-rose-500 text-white'
                    : subject.priority === 'low'
                      ? 'border-transparent bg-emerald-500 text-white'
                      : 'border-transparent bg-amber-500 text-white',
                )}
              >
                {subject.priority}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{subject.description}</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <BookOpen className="h-5 w-5" />
          </span>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-600">Progress</span>
            <span className="font-bold text-slate-900">{subject.progress}%</span>
          </div>
          <Progress
            className="h-3 bg-slate-100"
            indicatorClassName="bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_60%,#7c3aed_100%)]"
            value={subject.progress}
          />
        </div>

        <div className="flex items-center justify-between rounded-[22px] border border-slate-200/80 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Exam Date</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{formatExamDate(subject.examDate)}</p>
          </div>
          <CalendarDays className="h-5 w-5 text-slate-500" />
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Mentor Materials</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {materials.length} resource{materials.length === 1 ? '' : 's'}
              </p>
            </div>
            <FolderOpen className="h-5 w-5 text-sky-700" />
          </div>

          {previewMaterials.length ? (
            <div className="mt-4 space-y-3">
              {previewMaterials.map((material) => (
                <div key={material.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{material.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {material.mentorName} · {material.type} · {formatShortDate(material.createdAt)}
                      </p>
                    </div>
                    {material.fileUrl ? (
                      <a
                        className="inline-flex shrink-0 items-center text-sm font-semibold text-sky-700 hover:text-sky-800"
                        href={material.fileUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{material.description}</p>
                </div>
              ))}
              {remaining ? (
                <p className="text-sm text-slate-500">+{remaining} more resource{remaining === 1 ? '' : 's'} on the Notes page.</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              No mentor materials have been shared for this subject yet.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            className="h-10 rounded-2xl border border-sky-200 bg-white px-4 font-semibold text-sky-700 hover:bg-sky-50"
            disabled={isBusy}
            onClick={() => onEdit(subject)}
            variant="outline"
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            className="h-10 rounded-2xl border border-rose-200 bg-rose-50 px-4 font-semibold text-rose-700 hover:bg-rose-100"
            disabled={isBusy}
            onClick={() => onDelete(subject.id)}
            variant="outline"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentSubjectsPage() {
  const mountedRef = useRef(true);
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [statusTone, setStatusTone] = useState('info');
  const [statusMessage, setStatusMessage] = useState('Loading your saved subjects...');
  const [statusHint, setStatusHint] = useState('We are fetching your current subject list.');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const updateStatus = (tone, message, hint) => {
    setStatusTone(tone);
    setStatusMessage(message);
    setStatusHint(hint ?? null);
  };

  const refreshMaterials = async () => {
    try {
      const response = await fetch('/api/materials', { cache: 'no-store' });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (mountedRef.current) {
        setMaterials(Array.isArray(data?.materials) ? data.materials.map(mapMaterial) : []);
      }
    } catch {
      // Keep current material state.
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [subjectsResponse, materialsResponse] = await Promise.all([
          fetch('/api/subjects', { cache: 'no-store' }),
          fetch('/api/materials', { cache: 'no-store' }),
        ]);

        if (!subjectsResponse.ok) {
          throw new Error(await readApiError(subjectsResponse, 'Unable to load your subjects right now.'));
        }

        const subjectsData = await subjectsResponse.json();
        const nextSubjects = Array.isArray(subjectsData?.subjects) ? subjectsData.subjects.map(mapSubject) : [];
        let nextMaterials = [];
        let materialWarning = '';

        if (materialsResponse.ok) {
          const materialsData = await materialsResponse.json();
          nextMaterials = Array.isArray(materialsData?.materials) ? materialsData.materials.map(mapMaterial) : [];
        } else {
          materialWarning = await readApiError(materialsResponse, 'Mentor materials could not be loaded right now.');
        }

        if (!mountedRef.current) {
          return;
        }

        setSubjects(nextSubjects);
        setMaterials(nextMaterials);

        if (materialWarning) {
          updateStatus('warning', 'Subjects loaded, but mentor materials could not be refreshed.', materialWarning);
        } else {
          updateStatus(
            nextSubjects.length ? 'success' : 'info',
            nextSubjects.length ? 'Your saved subjects are ready.' : 'You do not have any saved subjects yet.',
            nextSubjects.length
              ? 'Each subject card now shows mentor notes and study materials matched to that subject.'
              : 'Add your first subject to unlock planner, timetable, and mentor material matching.',
          );
        }
      } catch (error) {
        if (mountedRef.current) {
          const status = getStatusDetails(
            error instanceof Error ? error.message : 'Unable to load your subjects right now.',
            'error',
          );
          updateStatus(status.tone, status.message, status.hint);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const materialsBySubjectKey = useMemo(() => {
    const nextMap = new Map();
    for (const material of materials) {
      const key = normalizeKey(material.subjectName);
      if (!key) {
        continue;
      }
      if (!nextMap.has(key)) {
        nextMap.set(key, []);
      }
      nextMap.get(key).push(material);
    }
    return nextMap;
  }, [materials]);

  const highPriorityCount = useMemo(
    () => subjects.filter((subject) => subject.priority === 'high').length,
    [subjects],
  );

  const averageProgress = useMemo(() => {
    if (!subjects.length) {
      return 0;
    }
    return Math.round(subjects.reduce((sum, subject) => sum + subject.progress, 0) / subjects.length);
  }, [subjects]);

  const nextExamSubject = useMemo(() => {
    return (
      [...subjects]
        .filter((subject) => subject.examDate)
        .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0] || null
    );
  }, [subjects]);

  const subjectsWithMaterialsCount = useMemo(
    () => subjects.filter((subject) => materialsBySubjectKey.has(normalizeKey(subject.name))).length,
    [materialsBySubjectKey, subjects],
  );

  const mentorCount = useMemo(
    () => new Set(materials.map((material) => normalizeKey(material.mentorName)).filter(Boolean)).size,
    [materials],
  );

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingSubjectId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
    updateStatus('info', 'Ready to add a new subject.', 'Save it once and it will stay synced with your account.');
  };

  const openEditForm = (subject) => {
    setForm({
      name: subject.name,
      progress: String(subject.progress),
      examDate: subject.examDate,
      priority: subject.priority,
      description: subject.description,
    });
    setEditingSubjectId(subject.id);
    setIsFormOpen(true);
    updateStatus('info', `Editing ${subject.name}.`, 'Update progress, exam date, or notes, then save your changes.');
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = async (subjectId) => {
    setDeletingSubjectId(subjectId);
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(await readApiError(response, 'Unable to delete this subject right now.'));
      }
      setSubjects((current) => current.filter((subject) => subject.id !== subjectId));
      updateStatus('success', 'Subject deleted successfully.', 'It will no longer be used for tasks, timetable, or material matching.');
      if (editingSubjectId === subjectId) {
        closeForm();
      }
      await refreshMaterials();
    } catch (error) {
      const status = getStatusDetails(
        error instanceof Error ? error.message : 'Unable to delete this subject right now.',
        'error',
      );
      updateStatus(status.tone, status.message, status.hint);
    } finally {
      setDeletingSubjectId(null);
    }
  };

  const handleSubmit = async () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      updateStatus('warning', 'Add a subject name before saving.', 'A short clear name like Mathematics or Physics works best.');
      return;
    }
    if (!form.examDate) {
      updateStatus('warning', 'Choose an exam date before saving.', 'The timetable generator uses exam dates to decide urgency.');
      return;
    }

    const parsedProgress = Number(form.progress);
    const safeProgress = Number.isFinite(parsedProgress) ? Math.min(Math.max(parsedProgress, 0), 100) : 0;

    setIsSaving(true);
    try {
      const response = await fetch(editingSubjectId ? `/api/subjects/${editingSubjectId}` : '/api/subjects', {
        method: editingSubjectId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          progress: safeProgress,
          examDate: form.examDate,
          priority: form.priority,
          description: form.description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Unable to save this subject right now.'));
      }

      const data = await response.json();
      if (!data?.subject) {
        throw new Error('Unable to save this subject right now.');
      }

      const savedSubject = mapSubject(data.subject);
      if (editingSubjectId) {
        setSubjects((current) => current.map((subject) => (subject.id === editingSubjectId ? savedSubject : subject)));
        updateStatus('success', 'Subject updated successfully.', 'Your latest progress, exam date, notes, and material matching are now refreshed.');
      } else {
        setSubjects((current) => [savedSubject, ...current]);
        updateStatus('success', 'New subject added to your study plan.', 'It is now available for planner, timetable, and mentor material matching.');
      }

      closeForm();
      await refreshMaterials();
    } catch (error) {
      const status = getStatusDetails(
        error instanceof Error ? error.message : 'Unable to save this subject right now.',
        'error',
      );
      updateStatus(status.tone, status.message, status.hint);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your subjects..."
    >
      <div className="space-y-8 pb-8">
        <section className="rounded-[36px] border border-white/85 bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_18%,#ecfeff_42%,#eef2ff_68%,#fff8e8_108%)] p-6 shadow-[0_36px_92px_-48px_rgba(56,189,248,0.24)] sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.08fr_320px] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-white/88 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                Study Subjects
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">My Subjects</h1>
                <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">
                  Track your subjects, manage progress, and see mentor-uploaded notes and study materials directly on each subject card.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-2xl border border-sky-100/80 bg-white px-4 py-2 font-medium text-slate-700">{subjects.length} active subjects</span>
                <span className="rounded-2xl border border-violet-100/80 bg-white px-4 py-2 font-medium text-slate-700">{highPriorityCount} high priority</span>
                <span className="rounded-2xl border border-amber-100/80 bg-white px-4 py-2 font-medium text-slate-700">{materials.length} mentor resources</span>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/90 bg-white/90 p-5 shadow-[0_26px_60px_-34px_rgba(37,99,235,0.2)]">
              <div className="space-y-3">
                <div className="rounded-[22px] border border-sky-100/80 bg-sky-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Average Progress</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{averageProgress}% across subjects</p>
                </div>
                <div className="rounded-[22px] border border-violet-100/80 bg-violet-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Material Coverage</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{subjectsWithMaterialsCount} subjects with mentor resources</p>
                </div>
                <div className="rounded-[22px] border border-amber-100/80 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Next Exam</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {nextExamSubject ? `${nextExamSubject.name} · ${formatExamDate(nextExamSubject.examDate)}` : 'No exam dates added yet'}
                  </p>
                </div>
              </div>

              <Button
                className="mt-5 h-11 w-full rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_42%,#7c3aed_72%,#ec4899_100%)] px-5 text-white"
                disabled={isSaving}
                onClick={openCreateForm}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>

              <Alert className="mt-4 rounded-[22px] border px-4 py-3 shadow-sm" type={statusTone}>
                <div className="space-y-1">
                  <p className="font-medium">{statusMessage}</p>
                  {statusHint ? <p>{statusHint}</p> : null}
                </div>
              </Alert>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-[28px] border-white/80 bg-white/95 shadow-[0_24px_64px_-42px_rgba(37,99,235,0.16)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Mentor Materials</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{materials.length}</p>
                </div>
                <FolderOpen className="h-6 w-6 text-sky-700" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border-white/80 bg-white/95 shadow-[0_24px_64px_-42px_rgba(37,99,235,0.16)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Subjects Covered</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{subjectsWithMaterialsCount}</p>
                </div>
                <Target className="h-6 w-6 text-violet-700" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border-white/80 bg-white/95 shadow-[0_24px_64px_-42px_rgba(37,99,235,0.16)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Mentors Sharing</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{mentorCount}</p>
                </div>
                <Users className="h-6 w-6 text-emerald-700" />
              </div>
            </CardContent>
          </Card>
        </div>

        {isFormOpen ? (
          <SectionCard
            title={editingSubjectId ? 'Edit Subject' : 'Add Subject'}
            description="Add a new subject or update an existing one with the latest progress, exam date, and notes."
            action={
              <Button
                className="h-10 rounded-2xl border border-sky-200 bg-white px-4 font-semibold text-sky-700 hover:bg-sky-50"
                disabled={isSaving}
                onClick={closeForm}
                variant="outline"
              >
                Cancel
              </Button>
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              <input
                className={inputClassName}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Subject name"
                value={form.name}
              />
              <select
                className={inputClassName}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                value={form.priority}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                className={inputClassName}
                max="100"
                min="0"
                onChange={(event) => setForm((current) => ({ ...current, progress: event.target.value }))}
                placeholder="Progress"
                type="number"
                value={form.progress}
              />
              <input
                className={inputClassName}
                onChange={(event) => setForm((current) => ({ ...current, examDate: event.target.value }))}
                type="date"
                value={form.examDate}
              />
              <textarea
                className="min-h-[120px] w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.14)] focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100 md:col-span-2"
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Description"
                rows={5}
                value={form.description}
              />
              <div className="md:col-span-2 flex justify-end">
                <Button
                  className="h-11 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_45%,#7c3aed_100%)] px-5 text-white"
                  disabled={isSaving}
                  onClick={handleSubmit}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : editingSubjectId ? 'Save Subject' : 'Add Subject'}
                </Button>
              </div>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          title="Subject Library"
          description="Each subject card now shows your progress, exam timing, and mentor-uploaded materials connected to that subject."
        >
          {isLoading ? (
            <div className="rounded-[28px] border border-dashed border-sky-200 bg-sky-50 p-12 text-center text-sm text-slate-600">
              Loading your saved subjects...
            </div>
          ) : subjects.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  isBusy={isSaving || deletingSubjectId === subject.id}
                  isDeleting={deletingSubjectId === subject.id}
                  materials={materialsBySubjectKey.get(normalizeKey(subject.name)) || []}
                  onDelete={handleDelete}
                  onEdit={openEditForm}
                  subject={subject}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-sky-200 bg-sky-50 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-sky-700 shadow-[0_12px_28px_-18px_rgba(14,165,233,0.22)]">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950">No subjects yet</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Add your first subject to start tracking progress and receive mentor materials matched to that subject.
              </p>
              <Button
                className="mt-6 h-11 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_45%,#7c3aed_100%)] px-5 text-white"
                disabled={isSaving || Boolean(deletingSubjectId)}
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
