'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  FileText,
  Filter,
  FolderOpen,
  PlayCircle,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout';
import { studentSidebarLinks } from '@/data/sidebarLinks';
import Alert from '@/components/ui/Alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const MATERIAL_TYPE_OPTIONS = ['All Types', 'Notes', 'PDFs', 'Videos', 'Assignments'];

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function normalizeKey(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function formatDate(value) {
  if (!value) {
    return 'Recently added';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Recently added';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function formatRelativeDate(value) {
  if (!value) {
    return 'Recently';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Recently';
  }

  const diffMs = Date.now() - parsedDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  if (diffDays < 14) {
    return '1 week ago';
  }

  return `${Math.floor(diffDays / 7)} weeks ago`;
}

function getTypeBadgeClass(type) {
  if (type === 'Notes') {
    return 'border-transparent bg-sky-100 text-sky-700';
  }

  if (type === 'PDFs') {
    return 'border-transparent bg-amber-100 text-amber-700';
  }

  if (type === 'Videos') {
    return 'border-transparent bg-violet-100 text-violet-700';
  }

  return 'border-transparent bg-emerald-100 text-emerald-700';
}

function getStatusDetails(message, defaultTone = 'error') {
  if (message === 'Unauthorized' || message === 'Forbidden') {
    return {
      tone: 'error',
      message: 'You need to be signed in as a student to view study materials.',
      hint: 'Refresh the page and sign in again if your session expired.',
    };
  }

  return {
    tone: defaultTone,
    message,
    hint: undefined,
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

function mapSubject(subject) {
  return {
    id: subject?._id || '',
    name: typeof subject?.name === 'string' ? subject.name : 'Untitled subject',
  };
}

function mapMaterial(material) {
  return {
    id: material?.id || material?._id || '',
    title: typeof material?.title === 'string' ? material.title : 'Untitled material',
    subjectId: typeof material?.subjectId === 'string' ? material.subjectId : '',
    subjectName:
      typeof material?.subjectName === 'string' && material.subjectName.trim()
        ? material.subjectName
        : 'General',
    type: typeof material?.type === 'string' ? material.type : 'Notes',
    description:
      typeof material?.description === 'string' && material.description.trim()
        ? material.description
        : 'No extra description provided for this material yet.',
    fileUrl: typeof material?.fileUrl === 'string' ? material.fileUrl : '',
    mentorName:
      typeof material?.mentorName === 'string' && material.mentorName.trim()
        ? material.mentorName
        : 'Mentor upload',
    createdAt: material?.createdAt || '',
  };
}

function SectionCard({ title, description, action, children }) {
  return (
    <Card className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] shadow-[0_26px_70px_-42px_rgba(56,189,248,0.16)]">
      <CardHeader className="pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-950">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
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

function SummaryCard({ label, value, detail, icon, accentClassName }) {
  return (
    <Card className="rounded-[28px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] shadow-[0_24px_64px_-42px_rgba(37,99,235,0.16)]">
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
              'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_16px_36px_-18px_rgba(15,23,42,0.38)]',
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

function MaterialCard({ material }) {
  return (
    <Card className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_22px_56px_-34px_rgba(56,189,248,0.16)] transition hover:-translate-y-1 hover:shadow-[0_26px_70px_-34px_rgba(59,130,246,0.18)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold text-slate-950">
                {material.title}
              </h3>
              <Badge className={cn('px-3 py-1 text-xs font-semibold', getTypeBadgeClass(material.type))}>
                {material.type}
              </Badge>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              {material.description}
            </p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dbeafe_0%,#ecfeff_100%)] text-sky-700 shadow-sm">
            {material.type === 'Videos' ? (
              <PlayCircle className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <Badge className="border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
            {material.subjectName}
          </Badge>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
            {material.mentorName}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
            {formatRelativeDate(material.createdAt)}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-[0_14px_30px_-24px_rgba(14,165,233,0.12)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Uploaded
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDate(material.createdAt)}
            </p>
          </div>

          {material.fileUrl ? (
            <a
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_52%,#7c3aed_100%)] px-4 text-sm font-semibold text-white shadow-[0_18px_34px_-20px_rgba(37,99,235,0.45)] transition hover:brightness-110"
              href={material.fileUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open Material
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          ) : (
            <Button
              className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-slate-500"
              disabled
              variant="outline"
            >
              File unavailable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentNotesPage() {
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusTone, setStatusTone] = useState('info');
  const [statusMessage, setStatusMessage] = useState(
    'Loading your mentor study materials...',
  );
  const [statusHint, setStatusHint] = useState(
    'We are checking the materials shared with your account.',
  );

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setIsLoading(true);

      try {
        const [materialsResponse, subjectsResponse] = await Promise.all([
          fetch('/api/materials', { cache: 'no-store' }),
          fetch('/api/subjects', { cache: 'no-store' }),
        ]);

        if (!materialsResponse.ok) {
          throw new Error(
            await readApiError(
              materialsResponse,
              'Unable to load your mentor materials right now.',
            ),
          );
        }

        if (!subjectsResponse.ok) {
          throw new Error(
            await readApiError(
              subjectsResponse,
              'Unable to load your subjects right now.',
            ),
          );
        }

        const materialsData = await materialsResponse.json();
        const subjectsData = await subjectsResponse.json();
        const nextMaterials = Array.isArray(materialsData?.materials)
          ? materialsData.materials.map(mapMaterial)
          : [];
        const nextSubjects = Array.isArray(subjectsData?.subjects)
          ? subjectsData.subjects.map(mapSubject)
          : [];

        if (!isActive) {
          return;
        }

        setMaterials(nextMaterials);
        setSubjects(nextSubjects);
        setStatusTone(nextMaterials.length ? 'success' : 'info');
        setStatusMessage(
          nextMaterials.length
            ? 'Mentor materials are ready to review.'
            : 'No mentor materials are available for your current subjects yet.',
        );
        setStatusHint(
          nextMaterials.length
            ? 'Use the filters below to focus on one subject or one material type.'
            : 'Once your mentor uploads notes or study files for your assigned subjects, they will appear here.',
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        const status = getStatusDetails(
          error instanceof Error
            ? error.message
            : 'Unable to load your mentor materials right now.',
        );

        setStatusTone(status.tone);
        setStatusMessage(status.message);
        setStatusHint(status.hint || null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) || null,
    [selectedSubjectId, subjects],
  );

  const filteredMaterials = useMemo(() => {
    const selectedSubjectKey = normalizeKey(selectedSubject?.name);
    const searchKey = normalizeKey(searchTerm);

    return materials.filter((material) => {
      if (
        selectedSubjectKey &&
        normalizeKey(material.subjectName) !== selectedSubjectKey
      ) {
        return false;
      }

      if (selectedType !== 'All Types' && material.type !== selectedType) {
        return false;
      }

      if (!searchKey) {
        return true;
      }

      const haystack = normalizeKey(
        `${material.title} ${material.description} ${material.subjectName} ${material.mentorName}`,
      );

      return haystack.includes(searchKey);
    });
  }, [materials, searchTerm, selectedSubject, selectedType]);

  const subjectsCoveredCount = useMemo(
    () =>
      new Set(
        materials
          .map((material) => normalizeKey(material.subjectName))
          .filter(Boolean),
      ).size,
    [materials],
  );

  const mentorCount = useMemo(
    () =>
      new Set(
        materials.map((material) => normalizeKey(material.mentorName)).filter(Boolean),
      ).size,
    [materials],
  );

  const recentUploadsCount = useMemo(
    () =>
      materials.filter((material) => {
        const createdAt = new Date(material.createdAt);

        if (Number.isNaN(createdAt.getTime())) {
          return false;
        }

        return Date.now() - createdAt.getTime() <= 1000 * 60 * 60 * 24 * 7;
      }).length,
    [materials],
  );

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your notes and materials..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[36px] border border-sky-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_20%,#ecfeff_52%,#f8fbff_78%,#fff7ed_108%)] p-6 shadow-[0_40px_110px_-54px_rgba(56,189,248,0.24)] sm:p-8">
          <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.14),transparent_32%)]" />

          <div className="relative grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                <BookOpen className="h-4 w-4 text-blue-700" />
                <span>Study Library</span>
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Mentor notes and study materials
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Review every mentor-uploaded note, PDF, video, and assignment
                  that matches your current subjects in one clean library.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <FolderOpen className="h-4 w-4 text-sky-600" />
                  {materials.length} materials available
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  {subjectsCoveredCount} subjects covered
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Users className="h-4 w-4 text-emerald-600" />
                  {mentorCount} mentors sharing
                </span>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.28)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Library Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Stay ready with one updated study feed
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Total Materials
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {materials.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Notes and files matched to your account
                  </p>
                </div>
                <div className="rounded-[24px] border border-blue-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    Recent Uploads
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {recentUploadsCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Added in the last 7 days
                  </p>
                </div>
              </div>

              <Alert className="mt-5 rounded-[22px] border px-4 py-3 shadow-sm" type={statusTone}>
                <div className="space-y-1">
                  <p className="font-medium">{statusMessage}</p>
                  {statusHint ? <p>{statusHint}</p> : null}
                </div>
              </Alert>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <SummaryCard
            accentClassName="from-sky-600 to-blue-700"
            detail="All mentor-shared resources matched to your subjects"
            icon={<FolderOpen className="h-5 w-5" />}
            label="Materials"
            value={`${materials.length}`}
          />
          <SummaryCard
            accentClassName="from-violet-600 to-indigo-700"
            detail="Subjects with at least one shared mentor resource"
            icon={<BookOpen className="h-5 w-5" />}
            label="Covered Subjects"
            value={`${subjectsCoveredCount}`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-600"
            detail="Mentors currently contributing to your library"
            icon={<Users className="h-5 w-5" />}
            label="Mentors"
            value={`${mentorCount}`}
          />
        </div>

        <SectionCard
          action={
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative min-w-[210px]">
                <Filter className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <select
                  className="h-11 w-full rounded-2xl border border-sky-100 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100"
                  onChange={(event) => setSelectedSubjectId(event.target.value)}
                  value={selectedSubjectId}
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <select
                className="h-11 min-w-[160px] rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100"
                onChange={(event) => setSelectedType(event.target.value)}
                value={selectedType}
              >
                {MATERIAL_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <div className="relative min-w-[220px]">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  className="h-11 w-full rounded-2xl border border-sky-100 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search title, subject, or mentor"
                  value={searchTerm}
                />
              </div>
            </div>
          }
          description="Filter the library by subject, type, or keyword to quickly open the right revision material."
          title="Material Library"
        >
          {isLoading ? (
            <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-12 text-center text-sm leading-7 text-slate-600">
              Loading your mentor study materials...
            </div>
          ) : filteredMaterials.length ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {filteredMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-sky-50 text-sky-700 shadow-[0_12px_28px_-18px_rgba(14,165,233,0.3)]">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">
                No materials match this filter
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Try a different subject or remove the keyword filter to see all
                mentor study materials available to you.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </ProtectedDashboardLayout>
  );
}
