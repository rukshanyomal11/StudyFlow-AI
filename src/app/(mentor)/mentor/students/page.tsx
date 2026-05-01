"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Mail,
  MessageSquare,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { mentorSidebarLinks } from "@/data/sidebarLinks";
import mentorService from "@/services/mentor.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

type ProgressFilter = "all" | "high" | "medium" | "low";

interface MentorStudentItem {
  studentId: string;
  name: string;
  email: string;
  avatar: string | null;
  level: string | null;
  assignedSubjectCount: number;
  averageProgress: number | null;
  weakSubject: {
    subjectId: string;
    name: string;
    progress: number | null;
    examDate: string | null;
  } | null;
  assignedSubjects: Array<{
    subjectId: string;
    name: string;
    progress: number | null;
    examDate: string | null;
  }>;
  assignments: Array<{
    assignmentId: string;
    subject: {
      subjectId: string;
      name: string;
      progress: number | null;
      examDate: string | null;
    } | null;
    createdAt: string;
  }>;
}

interface DoubtItem {
  _id?: string;
  id?: string;
  title?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
  studentId?: {
    _id?: string;
    name?: string;
  };
  subjectId?: {
    _id?: string;
    name?: string;
  };
}

interface AssignableStudentOption {
  studentId: string;
  name: string;
  email: string;
  avatar: string | null;
  level: string | null;
  hasGeneralAssignment: boolean;
  subjects: Array<{
    subjectId: string;
    name: string;
    progress: number | null;
    isAssignedToMentor: boolean;
  }>;
}

interface AssignStudentForm {
  studentId: string;
  subjectId: string;
}

const EMPTY_ASSIGN_FORM: AssignStudentForm = {
  studentId: "",
  subjectId: "",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatRelativeTime(value?: string | null) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "Yesterday";
  }

  return `${diffDays} days ago`;
}

function priorityBadgeClass(priority?: string) {
  if (priority === "Urgent") {
    return "border-transparent bg-rose-100 text-rose-700";
  }

  if (priority === "High") {
    return "border-transparent bg-amber-100 text-amber-700";
  }

  return "border-transparent bg-slate-100 text-slate-700";
}

const SURFACE_CARD_CLASS_NAME =
  "rounded-[30px] border border-slate-200/90 bg-white/95 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.16)] backdrop-blur-sm dark:!border-slate-200 dark:!bg-white dark:!text-slate-950";

const SOFT_PANEL_CLASS_NAME =
  "rounded-[26px] border border-slate-200/90 bg-white/90 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)] dark:!border-slate-200 dark:!bg-white";

const PRIMARY_BUTTON_CLASS_NAME =
  "bg-sky-600 text-white hover:bg-sky-700 dark:!bg-sky-600 dark:!text-white dark:hover:!bg-sky-700";

const SECONDARY_BUTTON_CLASS_NAME =
  "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:!border-slate-200 dark:!bg-white dark:!text-slate-900 dark:hover:!bg-slate-50";

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
    <Card className={SURFACE_CARD_CLASS_NAME}>
      <CardHeader className="pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950 dark:!text-slate-950">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:!text-slate-600">
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
    <Card className={cn(SURFACE_CARD_CLASS_NAME, "rounded-[28px]")}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:!text-slate-500">
              {label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:!text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:!text-slate-500">
              {detail}
            </p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_14px_28px_-16px_rgba(15,23,42,0.4)] -mt-8",
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

export default function MentorStudentsPage() {
  const [students, setStudents] = useState<MentorStudentItem[]>([]);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [doubts, setDoubts] = useState<DoubtItem[]>([]);
  const [assignableStudents, setAssignableStudents] = useState<AssignableStudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState<AssignStudentForm>(EMPTY_ASSIGN_FORM);
  const [actionMessage, setActionMessage] = useState(
    "Select a student to review assigned subjects and current doubts.",
  );

  useEffect(() => {
    let isActive = true;

    const loadWorkspace = async () => {
      try {
        setLoading(true);
        const [studentsResponse, doubtsResponse] = await Promise.all([
          mentorService.getStudents(),
          mentorService.getDoubts(),
        ]);

        if (!isActive) {
          return;
        }

        const nextStudents = Array.isArray(studentsResponse?.students)
          ? studentsResponse.students
          : [];

        setStudents(nextStudents);
        setTotalAssignments(
          typeof studentsResponse?.totalAssignments === "number"
            ? studentsResponse.totalAssignments
            : 0,
        );
        setDoubts(Array.isArray(doubtsResponse) ? doubtsResponse : []);

        if (nextStudents.length > 0) {
          setSelectedStudentId((current) => current || nextStudents[0].studentId);
          setActionMessage(
            "Open a student to see real subject progress, assignment history, and doubts.",
          );
        } else {
          setSelectedStudentId("");
          setActionMessage(
            "No students are assigned to this mentor yet.",
          );
        }

        setError(null);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load mentor students.";
        setError(message);
        setActionMessage(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadWorkspace();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!assignModalOpen) {
      return;
    }

    let isActive = true;

    const loadAssignableStudents = async () => {
      try {
        const options = await mentorService.getAssignableStudents();

        if (!isActive) {
          return;
        }

        setAssignableStudents(Array.isArray(options) ? options : []);
        setAssignForm((current) => ({
          studentId: current.studentId || options?.[0]?.studentId || "",
          subjectId: "",
        }));
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setActionMessage(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load assignable students.",
        );
      }
    };

    void loadAssignableStudents();

    return () => {
      isActive = false;
    };
  }, [assignModalOpen]);

  const weakSubjectOptions = useMemo(
    () =>
      Array.from(
        new Set(
          students
            .map((student) => student.weakSubject?.name || "")
            .filter(Boolean),
        ),
      ).sort(),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return students.filter((student) => {
      const progress = student.averageProgress;
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);
      const matchesLevel = levelFilter === "all" || student.level === levelFilter;
      const matchesSubject =
        subjectFilter === "all" || student.weakSubject?.name === subjectFilter;
      const matchesProgress =
        progressFilter === "all" ||
        (progressFilter === "high" && typeof progress === "number" && progress >= 85) ||
        (progressFilter === "medium" &&
          typeof progress === "number" &&
          progress >= 70 &&
          progress < 85) ||
        (progressFilter === "low" &&
          (typeof progress !== "number" || progress < 70));

      return matchesSearch && matchesLevel && matchesSubject && matchesProgress;
    });
  }, [levelFilter, progressFilter, searchQuery, students, subjectFilter]);

  const selectedStudent =
    filteredStudents.find((student) => student.studentId === selectedStudentId) ??
    filteredStudents[0] ??
    null;

  const selectedStudentDoubts = useMemo(() => {
    if (!selectedStudent) {
      return [];
    }

    return doubts.filter(
      (item) => item.studentId?._id === selectedStudent.studentId,
    );
  }, [doubts, selectedStudent]);

  const selectedAssignableStudent =
    assignableStudents.find(
      (student) => student.studentId === assignForm.studentId,
    ) ?? null;

  const availableAssignableSubjects = useMemo(
    () =>
      selectedAssignableStudent?.subjects.filter(
        (subject) => !subject.isAssignedToMentor,
      ) ?? [],
    [selectedAssignableStudent],
  );

  const totalStudents = students.length;
  const studentsNeedingAttention = students.filter(
    (student) =>
      typeof student.averageProgress !== "number" || student.averageProgress < 70,
  ).length;
  const openDoubts = doubts.filter((item) => item.status !== "Answered").length;
  const topPerformers = students.filter(
    (student) =>
      typeof student.averageProgress === "number" && student.averageProgress >= 85,
  ).length;

  const handleAssignStudent = async () => {
    if (!assignForm.studentId) {
      setActionMessage("Choose a student before creating a mentor assignment.");
      return;
    }

    if (!assignForm.subjectId && selectedAssignableStudent?.hasGeneralAssignment) {
      setActionMessage(
        "This student already has a general mentor assignment. Choose a subject instead.",
      );
      return;
    }

    setAssignLoading(true);

    try {
      await mentorService.assignStudent({
        studentId: assignForm.studentId,
        ...(assignForm.subjectId ? { subjectId: assignForm.subjectId } : {}),
      });

      const [studentsResponse, doubtsResponse, options] = await Promise.all([
        mentorService.getStudents(),
        mentorService.getDoubts(),
        mentorService.getAssignableStudents(),
      ]);

      const nextStudents = Array.isArray(studentsResponse?.students)
        ? studentsResponse.students
        : [];

      setStudents(nextStudents);
      setTotalAssignments(
        typeof studentsResponse?.totalAssignments === "number"
          ? studentsResponse.totalAssignments
          : 0,
      );
      setDoubts(Array.isArray(doubtsResponse) ? doubtsResponse : []);
      setAssignableStudents(Array.isArray(options) ? options : []);
      setSelectedStudentId(assignForm.studentId);
      setAssignForm(EMPTY_ASSIGN_FORM);
      setAssignModalOpen(false);
      setActionMessage("Mentor assignment created successfully.");
    } catch (assignError) {
      setActionMessage(
        assignError instanceof Error
          ? assignError.message
          : "Unable to assign this student right now.",
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const triggerAction = (label: string) => {
    if (!selectedStudent) {
      return;
    }

    setActionMessage(`${label} prepared for ${selectedStudent.name}.`);
  };

  return (
    <ProtectedDashboardLayout
      role="mentor"
      links={mentorSidebarLinks}
      loadingMessage="Loading your students workspace..."
    >
      <div className="mx-auto max-w-[1600px] space-y-8 pb-8 text-slate-950">
        <Card className="relative overflow-hidden rounded-[34px] border border-sky-100 bg-transparent text-slate-950 shadow-[0_30px_100px_-48px_rgba(15,23,42,0.24)] dark:!border-sky-100 dark:!bg-transparent dark:!text-slate-950">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(14, 165, 233, 0.2), transparent 24%), radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.18), transparent 24%), radial-gradient(circle at 70% 85%, rgba(245, 158, 11, 0.12), transparent 18%), linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.98) 48%, rgba(236, 253, 245, 0.98) 100%)",
            }}
          />
          <CardContent className="relative p-8 md:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-5">
                <Badge className="rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm dark:!border-sky-200 dark:!bg-white dark:!text-sky-700">
                  <Users className="mr-2 h-3.5 w-3.5" />
                  Mentor student management
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:!text-slate-950">
                    Students
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base dark:!text-slate-600">
                    This workspace now reads real mentor assignments, subject progress, and student doubts directly from the backend.
                  </p>
                </div>
              </div>

              <Button
                className={cn(
                  "h-12 rounded-2xl px-5 text-sm font-semibold shadow-[0_18px_35px_-18px_rgba(2,132,199,0.45)]",
                  PRIMARY_BUTTON_CLASS_NAME,
                )}
                onClick={() => setAssignModalOpen(true)}
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Assign Student
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            accentClassName="from-indigo-700 to-sky-600"
            detail="Students currently assigned to you"
            icon={<Users className="h-5 w-5" />}
            label="Total Students"
            value={`${totalStudents}`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Active mentor assignments across student subjects"
            icon={<Sparkles className="h-5 w-5" />}
            label="Assignments"
            value={`${totalAssignments}`}
          />
          <SummaryCard
            accentClassName="from-amber-500 to-orange-500"
            detail="Students missing progress or below 70%"
            icon={<ShieldAlert className="h-5 w-5" />}
            label="Need Attention"
            value={`${studentsNeedingAttention}`}
          />
          <SummaryCard
            accentClassName="from-sky-600 to-cyan-500"
            detail="Open student questions in your queue"
            icon={<Target className="h-5 w-5" />}
            label="Open Doubts"
            value={`${openDoubts}`}
          />
        </section>

        <SectionCard
          description="Search your roster and narrow the list by level, visible progress band, or weak subject."
          title="Search and Filters"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={cn(inputClassName, "pl-11")}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name or email"
                value={searchQuery}
              />
            </label>
            <select
              className={inputClassName}
              onChange={(event) => setLevelFilter(event.target.value)}
              value={levelFilter}
            >
              <option value="all">All levels</option>
              {Array.from(new Set(students.map((student) => student.level).filter(Boolean))).map(
                (level) => (
                  <option key={level} value={level ?? ""}>
                    {level}
                  </option>
                ),
              )}
            </select>
            <select
              className={inputClassName}
              onChange={(event) =>
                setProgressFilter(event.target.value as ProgressFilter)
              }
              value={progressFilter}
            >
              <option value="all">All progress</option>
              <option value="high">High progress (85%+)</option>
              <option value="medium">Mid progress (70-84%)</option>
              <option value="low">Needs support (&lt; 70% or no data)</option>
            </select>
            <select
              className={inputClassName}
              onChange={(event) => setSubjectFilter(event.target.value)}
              value={subjectFilter}
            >
              <option value="all">All weak subjects</option>
              {weakSubjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </SectionCard>

        {error ? (
          <Card className="rounded-[30px] border border-rose-100 bg-white shadow-[0_24px_70px_-40px_rgba(244,63,94,0.16)]">
            <CardContent className="p-6 text-sm text-rose-700">{error}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            action={
              <Badge className="border-transparent bg-sky-100 text-sky-700">
                {filteredStudents.length} visible
              </Badge>
            }
            description="Review your live mentor roster with subject coverage and average progress."
            title="Student Roster"
          >
            {loading ? (
              <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-600">
                Loading assigned students...
              </div>
            ) : filteredStudents.length ? (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    className={cn(
                      "rounded-[26px] border p-5 transition",
                      selectedStudent?.studentId === student.studentId
                        ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
                    )}
                    key={student.studentId}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-slate-900 text-white">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-slate-950">
                              {student.name}
                            </p>
                            <Badge className="border-transparent bg-sky-50 text-sky-700">
                              {student.level || "Student"}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            {student.email}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                              {student.assignedSubjectCount} subjects
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                              Weak: {student.weakSubject?.name || "Not set"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full max-w-[320px] space-y-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-slate-500">
                            Average progress
                          </span>
                          <span className="font-semibold text-slate-950">
                            {typeof student.averageProgress === "number"
                              ? `${student.averageProgress}%`
                              : "No data"}
                          </span>
                        </div>
                        <Progress
                          className="h-3 bg-slate-200"
                          indicatorClassName="bg-gradient-to-r from-sky-600 to-teal-500"
                          value={student.averageProgress ?? 0}
                        />
                      </div>

                      <Button
                        className={cn(
                          "h-10 rounded-2xl px-4",
                          PRIMARY_BUTTON_CLASS_NAME,
                        )}
                        onClick={() => {
                          setSelectedStudentId(student.studentId);
                          setActionMessage(`Opened ${student.name}.`);
                        }}
                        type="button"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-600">
                No student matched the current filters.
              </div>
            )}
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              description="Real subject progress, recent mentor assignments, and the student's current doubt queue."
              title="Student Details"
            >
              {selectedStudent ? (
                <div className="space-y-5">
                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-5")}>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-slate-900 text-lg text-white">
                          {getInitials(selectedStudent.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-slate-950">
                            {selectedStudent.name}
                          </h2>
                          <Badge className="border-transparent bg-sky-50 text-sky-700">
                            {selectedStudent.level || "Student"}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {selectedStudent.email}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            {selectedStudent.assignedSubjectCount} tracked subjects
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-5")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">
                        Average Progress
                      </p>
                      <span className="text-sm font-semibold text-slate-950">
                        {typeof selectedStudent.averageProgress === "number"
                          ? `${selectedStudent.averageProgress}%`
                          : "No data"}
                      </span>
                    </div>
                    <Progress
                      className="mt-4 h-3 bg-slate-200"
                      indicatorClassName="bg-gradient-to-r from-sky-600 to-teal-500"
                      value={selectedStudent.averageProgress ?? 0}
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="border-transparent bg-amber-100 text-amber-700">
                        Weak Subject: {selectedStudent.weakSubject?.name || "Not set"}
                      </Badge>
                      <Badge className="border-transparent bg-sky-100 text-sky-700">
                        {selectedStudent.assignedSubjectCount} subjects assigned
                      </Badge>
                    </div>
                  </div>

                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-5")}>
                    <p className="text-sm font-semibold text-slate-950">
                      Assigned Subject Progress
                    </p>
                    <div className="mt-4 space-y-4">
                      {selectedStudent.assignedSubjects.length ? (
                        selectedStudent.assignedSubjects.map((subject) => (
                          <div
                            className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-sm"
                            key={subject.subjectId}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-950">
                                  {subject.name}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  Exam {formatDate(subject.examDate)}
                                </p>
                              </div>
                              <Badge className="border-transparent bg-sky-100 text-sky-700">
                                {typeof subject.progress === "number"
                                  ? `${subject.progress}%`
                                  : "No data"}
                              </Badge>
                            </div>
                            <Progress
                              className="mt-4 h-3 bg-slate-200"
                              indicatorClassName="bg-gradient-to-r from-sky-600 to-teal-500"
                              value={subject.progress ?? 0}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                          This student has a general mentor assignment but no subject-specific assignment yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-5")}>
                    <p className="text-sm font-semibold text-slate-950">
                      Recent Mentor Assignments
                    </p>
                    <div className="mt-4 space-y-3">
                      {selectedStudent.assignments.map((assignment) => (
                        <div
                          className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm"
                          key={assignment.assignmentId}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {assignment.subject?.name || "General mentorship"}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Assigned {formatRelativeTime(assignment.createdAt)}
                              </p>
                            </div>
                            <Badge className="border-transparent bg-slate-100 text-slate-700">
                              {assignment.subject ? "Subject assignment" : "General"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-5")}>
                    <p className="text-sm font-semibold text-slate-950">
                      Student Doubts
                    </p>
                    <div className="mt-4 space-y-3">
                      {selectedStudentDoubts.length ? (
                        selectedStudentDoubts.slice(0, 4).map((doubt) => (
                          <div
                            className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            key={doubt._id || doubt.id}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-950">
                                  {doubt.title || "Untitled doubt"}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {doubt.subjectId?.name || "General"} | {formatRelativeTime(doubt.createdAt)}
                                </p>
                              </div>
                              <Badge className={priorityBadgeClass(doubt.priority)}>
                                {doubt.priority || doubt.status || "Normal"}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                          No doubts filed by this student yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-600">
                  No student matched the current filters.
                </div>
              )}
            </SectionCard>

            <SectionCard
              description="Fast mentor moves for the currently selected student."
              title="Quick Actions"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(37,99,235,0.42)] transition hover:-translate-y-1"
                  onClick={() => triggerAction("Doubt review")}
                  type="button"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200">
                    <MessageSquare className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Open Doubts</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Review the current student&apos;s live doubt queue.
                  </p>
                </button>

                <button
                  className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#d1fae5_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(5,150,105,0.34)] transition hover:-translate-y-1"
                  onClick={() => triggerAction("Quiz planning")}
                  type="button"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Plan Quiz</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Use weak-subject signals to prepare the next checkpoint quiz.
                  </p>
                </button>

                <button
                  className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_55%,#fde68a_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(217,119,6,0.28)] transition hover:-translate-y-1"
                  onClick={() => triggerAction("Resource follow-up")}
                  type="button"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Assign Content</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Prepare the next study resource for this learner&apos;s weaker area.
                  </p>
                </button>

                <button
                  className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_55%,#ddd6fe_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(109,40,217,0.25)] transition hover:-translate-y-1"
                  onClick={() => triggerAction("Student encouragement")}
                  type="button"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                    <MessageSquare className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Send Check-in</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Use the current progress and doubt pattern to plan a targeted follow-up.
                  </p>
                </button>
              </div>

              <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {actionMessage}
              </div>
            </SectionCard>
          </div>
        </div>

        {assignModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
            <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_90px_-35px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Assign Student</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Create a real mentor assignment using live students and subjects from the database.
                  </p>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                  onClick={() => {
                    setAssignModalOpen(false);
                    setAssignForm(EMPTY_ASSIGN_FORM);
                  }}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-5 px-6 py-6">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Student</span>
                  <select
                    className={inputClassName}
                    onChange={(event) =>
                      setAssignForm({
                        studentId: event.target.value,
                        subjectId: "",
                      })
                    }
                    value={assignForm.studentId}
                  >
                    <option value="">Select a student</option>
                    {assignableStudents.map((student) => (
                      <option key={student.studentId} value={student.studentId}>
                        {student.name} - {student.email}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Subject</span>
                  <select
                    className={inputClassName}
                    onChange={(event) =>
                      setAssignForm((current) => ({
                        ...current,
                        subjectId: event.target.value,
                      }))
                    }
                    value={assignForm.subjectId}
                  >
                    <option value="">General mentorship only</option>
                    {availableAssignableSubjects.map((subject) => (
                      <option key={subject.subjectId} value={subject.subjectId}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedAssignableStudent ? (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">
                      {selectedAssignableStudent.name}
                    </p>
                    <p className="mt-1">
                      {selectedAssignableStudent.level || "Student"} | {selectedAssignableStudent.subjects.length} subjects in the system
                    </p>
                    <p className="mt-2">
                      {selectedAssignableStudent.hasGeneralAssignment
                        ? "A general mentor assignment already exists for this student."
                        : "You can create a general assignment or choose a specific subject."}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Subject options already assigned to this mentor are filtered out automatically.
                </p>
                <div className="flex gap-3">
                  <Button
                    className={cn("h-11 rounded-2xl px-5", SECONDARY_BUTTON_CLASS_NAME)}
                    onClick={() => {
                      setAssignModalOpen(false);
                      setAssignForm(EMPTY_ASSIGN_FORM);
                    }}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className={cn("h-11 rounded-2xl px-5", PRIMARY_BUTTON_CLASS_NAME)}
                    disabled={assignLoading}
                    onClick={() => void handleAssignStudent()}
                    type="button"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Student
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
