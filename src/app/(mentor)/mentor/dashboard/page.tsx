"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Megaphone,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
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
  priority?: string;
  status?: string;
  createdAt?: string;
  studentId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  subjectId?: {
    _id?: string;
    name?: string;
  };
}

interface AnnouncementItem {
  id?: string;
  title?: string;
  status?: string;
  audienceType?: string;
  createdAt?: string | null;
  scheduledAt?: string | null;
  message?: string;
}

interface MaterialItem {
  id?: string;
  title?: string;
  type?: string;
  status?: string;
  subjectName?: string;
  createdAt?: string | null;
}

interface QuizItem {
  id?: string;
  title?: string;
  subjectName?: string;
  questionCount?: number;
  assignedToCount?: number;
  createdAt?: string | null;
}

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
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
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

function getAudienceLabel(audienceType?: string) {
  if (audienceType === "students") {
    return "Direct students";
  }

  if (audienceType === "groups") {
    return "Subject groups";
  }

  return "All assigned";
}

function getPriorityWeight(priority?: string) {
  if (priority === "Urgent") {
    return 0;
  }

  if (priority === "High") {
    return 1;
  }

  return 2;
}

function doubtBadgeClass(priority?: string) {
  if (priority === "Urgent") {
    return "border-transparent bg-rose-100 text-rose-700";
  }

  if (priority === "High") {
    return "border-transparent bg-amber-100 text-amber-700";
  }

  return "border-transparent bg-slate-100 text-slate-700";
}

function announcementBadgeClass(status?: string) {
  if (status === "Scheduled") {
    return "border-transparent bg-amber-100 text-amber-700";
  }

  if (status === "Sent") {
    return "border-transparent bg-emerald-100 text-emerald-700";
  }

  return "border-transparent bg-slate-100 text-slate-700";
}

const SURFACE_CARD_CLASS_NAME =
  "rounded-[30px] border border-slate-200/90 bg-white/95 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.16)] backdrop-blur-sm dark:!border-slate-200 dark:!bg-white dark:!text-slate-950";

const SOFT_PANEL_CLASS_NAME =
  "rounded-[26px] border border-slate-200/90 bg-white/90 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)] transition-colors hover:border-slate-300 dark:!border-slate-200 dark:!bg-white";

const PRIMARY_BUTTON_CLASS_NAME =
  "bg-slate-900 text-white hover:bg-slate-800 dark:!bg-slate-900 dark:!text-white dark:hover:!bg-slate-800";

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

export default function MentorDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [students, setStudents] = useState<MentorStudentItem[]>([]);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [doubts, setDoubts] = useState<DoubtItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const [
          studentsResponse,
          doubtsResponse,
          announcementsResponse,
          materialsResponse,
          quizzesResponse,
        ] = await Promise.all([
          mentorService.getStudents(),
          mentorService.getDoubts(),
          mentorService.getAnnouncements(),
          mentorService.getContent(),
          mentorService.getQuizzes(),
        ]);

        if (!isActive) {
          return;
        }

        setStudents(Array.isArray(studentsResponse?.students) ? studentsResponse.students : []);
        setTotalAssignments(
          typeof studentsResponse?.totalAssignments === "number"
            ? studentsResponse.totalAssignments
            : 0,
        );
        setDoubts(Array.isArray(doubtsResponse) ? doubtsResponse : []);
        setAnnouncements(
          Array.isArray(announcementsResponse) ? announcementsResponse : [],
        );
        setMaterials(Array.isArray(materialsResponse) ? materialsResponse : []);
        setQuizzes(Array.isArray(quizzesResponse) ? quizzesResponse : []);
        setError(null);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load mentor dashboard.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const mentorName = session?.user?.name?.trim() || "Mentor";

  const studentsWithProgress = useMemo(
    () =>
      students.filter(
        (student) => typeof student.averageProgress === "number",
      ) as Array<MentorStudentItem & { averageProgress: number }>,
    [students],
  );

  const averageStudentProgress = studentsWithProgress.length
    ? Math.round(
        studentsWithProgress.reduce(
          (total, student) => total + student.averageProgress,
          0,
        ) / studentsWithProgress.length,
      )
    : 0;

  const pendingDoubts = useMemo(
    () => doubts.filter((item) => item.status !== "Answered"),
    [doubts],
  );

  const scheduledAnnouncements = useMemo(
    () => announcements.filter((item) => item.status === "Scheduled"),
    [announcements],
  );

  const recentMaterials = useMemo(() => materials.slice(0, 3), [materials]);
  const recentQuizzes = useMemo(() => quizzes.slice(0, 3), [quizzes]);

  const topStudents = useMemo(
    () =>
      [...studentsWithProgress]
        .sort((first, second) => second.averageProgress - first.averageProgress)
        .slice(0, 3),
    [studentsWithProgress],
  );

  const needsAttention = useMemo(
    () =>
      [...students]
        .sort((first, second) => {
          const firstProgress =
            typeof first.averageProgress === "number" ? first.averageProgress : -1;
          const secondProgress =
            typeof second.averageProgress === "number" ? second.averageProgress : -1;

          return firstProgress - secondProgress;
        })
        .slice(0, 3),
    [students],
  );

  const recentDoubts = useMemo(
    () =>
      [...pendingDoubts]
        .sort((first, second) => {
          const byPriority =
            getPriorityWeight(first.priority) - getPriorityWeight(second.priority);

          if (byPriority !== 0) {
            return byPriority;
          }

          const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
          const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
          return secondDate - firstDate;
        })
        .slice(0, 4),
    [pendingDoubts],
  );

  const summaryCards = [
    {
      label: "Assigned Students",
      value: `${students.length}`,
      detail: `${totalAssignments} mentor assignments across your roster`,
      icon: <Users className="h-5 w-5" />,
      accentClassName: "from-indigo-700 to-sky-600",
    },
    {
      label: "Average Progress",
      value: `${averageStudentProgress}%`,
      detail: "Across student subjects that already have progress data",
      icon: <GraduationCap className="h-5 w-5" />,
      accentClassName: "from-sky-600 to-cyan-500",
    },
    {
      label: "Pending Doubts",
      value: `${pendingDoubts.length}`,
      detail: "Student questions waiting for your reply",
      icon: <MessageSquare className="h-5 w-5" />,
      accentClassName: "from-amber-500 to-orange-500",
    },
    {
      label: "Published Resources",
      value: `${materials.filter((item) => item.status === "Published").length}`,
      detail: "Mentor notes, PDFs, videos, and assignments",
      icon: <FileText className="h-5 w-5" />,
      accentClassName: "from-emerald-600 to-teal-500",
    },
    {
      label: "Quizzes Created",
      value: `${quizzes.length}`,
      detail: "Assessments currently in your mentor library",
      icon: <CheckCircle2 className="h-5 w-5" />,
      accentClassName: "from-violet-600 to-fuchsia-500",
    },
    {
      label: "Scheduled Announcements",
      value: `${scheduledAnnouncements.length}`,
      detail: "Updates queued for later delivery",
      icon: <Megaphone className="h-5 w-5" />,
      accentClassName: "from-rose-600 to-pink-500",
    },
  ];

  if (isLoading) {
    return (
      <ProtectedDashboardLayout
        role="mentor"
        links={mentorSidebarLinks}
        loadingMessage="Loading your mentor dashboard..."
      >
        <div className="mx-auto max-w-[1600px] space-y-8 pb-8 text-slate-950">
          <Card className={SURFACE_CARD_CLASS_NAME}>
            <CardContent className="p-8 text-sm text-slate-600">
              Loading live mentor dashboard data...
            </CardContent>
          </Card>
        </div>
      </ProtectedDashboardLayout>
    );
  }

  if (error) {
    return (
      <ProtectedDashboardLayout
        role="mentor"
        links={mentorSidebarLinks}
        loadingMessage="Loading your mentor dashboard..."
      >
        <div className="mx-auto max-w-[1600px] space-y-8 pb-8 text-slate-950">
          <Card className="rounded-[30px] border border-rose-100 bg-white shadow-[0_24px_70px_-40px_rgba(244,63,94,0.16)]">
            <CardContent className="space-y-4 p-8">
              <div className="flex items-center gap-3 text-rose-700">
                <AlertCircle className="h-5 w-5" />
                Unable to load mentor dashboard
              </div>
              <p className="text-sm leading-6 text-slate-600">{error}</p>
              <Button
                className="rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                onClick={() => window.location.reload()}
                type="button"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedDashboardLayout>
    );
  }

  return (
    <ProtectedDashboardLayout
      role="mentor"
      links={mentorSidebarLinks}
      loadingMessage="Loading your mentor dashboard..."
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
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Mentor command center
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:!text-slate-950">
                    Welcome back, {mentorName}
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base dark:!text-slate-600">
                    Your dashboard is now reading the real mentor workspace. Student assignments, doubts, announcements, content, and quizzes are all coming from the live backend.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:!text-slate-600">
                  <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-sm">
                    {todayLabel}
                  </div>
                  <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-sm">
                    {students.length} students assigned
                  </div>
                  <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-sm">
                    {pendingDoubts.length} pending doubts
                  </div>
                  <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-sm">
                    {scheduledAnnouncements.length} announcements scheduled
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <Button
                  className="h-12 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_18px_35px_-18px_rgba(15,23,42,0.45)] hover:bg-slate-800 dark:!bg-slate-900 dark:!text-white dark:hover:!bg-slate-800"
                  onClick={() => router.push("/mentor/content")}
                  type="button"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Manage Content
                </Button>
                <Button
                  className="h-12 rounded-2xl border border-slate-200 bg-white/85 px-5 text-sm font-semibold text-slate-900 hover:bg-white dark:!border-slate-200 dark:!bg-white dark:!text-slate-900 dark:hover:!bg-white"
                  onClick={() => router.push("/mentor/students")}
                  type="button"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Students
                </Button>
                <Button
                  className="h-12 rounded-2xl border border-slate-200 bg-white/85 px-5 text-sm font-semibold text-slate-900 hover:bg-white dark:!border-slate-200 dark:!bg-white dark:!text-slate-900 dark:hover:!bg-white"
                  onClick={() => router.push("/mentor/doubts")}
                  type="button"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open Doubts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {summaryCards.map((item) => (
            <SummaryCard
              key={item.label}
              accentClassName={item.accentClassName}
              detail={item.detail}
              icon={item.icon}
              label={item.label}
              value={item.value}
            />
          ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-8">
            <SectionCard
              action={
                <Button
                  className={cn(
                    "h-10 rounded-2xl px-4",
                    SECONDARY_BUTTON_CLASS_NAME,
                  )}
                  onClick={() => router.push("/mentor/students")}
                  type="button"
                  variant="outline"
                >
                  Open student workspace
                </Button>
              }
              description="A live snapshot of assigned learners, their progress, and the subject that currently needs the most support."
              title="Students Overview"
            >
              <div className="space-y-4">
                {students.length ? (
                  students.slice(0, 5).map((student) => (
                    <div className={cn(SOFT_PANEL_CLASS_NAME, "p-5")} key={student.studentId}>
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-slate-900 text-white">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-slate-950 dark:!text-slate-950">
                                {student.name}
                              </p>
                              <Badge className="border-transparent bg-sky-50 text-sky-700 dark:!bg-sky-50 dark:!text-sky-700">
                                {student.level || "Student"}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-slate-500 dark:!text-slate-500">
                              Weak subject: {student.weakSubject?.name || "No subject data yet"}
                            </p>
                          </div>
                        </div>

                        <div className="w-full max-w-[360px] space-y-3">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-slate-500 dark:!text-slate-500">
                              Progress
                            </span>
                            <span className="font-semibold text-slate-950 dark:!text-slate-950">
                              {typeof student.averageProgress === "number"
                                ? `${student.averageProgress}%`
                                : "No data"}
                            </span>
                          </div>
                          <Progress
                            className="h-3 bg-slate-200 dark:!bg-slate-200"
                            indicatorClassName="bg-gradient-to-r from-sky-600 to-teal-500"
                            value={student.averageProgress ?? 0}
                          />
                        </div>

                        <Button
                          className={cn(
                            "h-10 rounded-2xl px-4",
                            PRIMARY_BUTTON_CLASS_NAME,
                          )}
                          onClick={() =>
                            router.push(`/mentor/students?student=${student.studentId}`)
                          }
                          type="button"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-600">
                    No mentor assignments found yet. Assign a student to start building your live dashboard.
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              description="Students with the strongest momentum and the ones who need a faster intervention next."
              title="Momentum Snapshot"
            >
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[28px] border border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(255,255,255,0.98))] p-5 shadow-[0_20px_44px_-36px_rgba(5,150,105,0.32)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                      <TrendingUp className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-slate-950">
                        Top Performing Students
                      </p>
                      <p className="text-sm text-slate-600">
                        Best average progress across assigned subjects.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {topStudents.length ? (
                      topStudents.map((student) => (
                        <div
                          className="flex items-center justify-between rounded-[22px] border border-emerald-200 bg-white px-4 py-3 shadow-sm"
                          key={student.studentId}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {getInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {student.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {student.weakSubject?.name || "No weak subject logged"}
                              </p>
                            </div>
                          </div>
                          <Badge className="border-transparent bg-emerald-600 text-white">
                            {student.averageProgress}%
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600">
                        Progress data will appear here once assigned student subjects start updating.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-[28px] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.94),rgba(255,255,255,0.98))] p-5 shadow-[0_20px_44px_-36px_rgba(217,119,6,0.28)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
                      <AlertCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-slate-950">
                        Students Needing Attention
                      </p>
                      <p className="text-sm text-slate-600">
                        Lowest visible average progress or missing subject progress.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {needsAttention.length ? (
                      needsAttention.map((student) => (
                        <div
                          className="flex items-center justify-between rounded-[22px] border border-amber-200 bg-white px-4 py-3 shadow-sm"
                          key={student.studentId}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-amber-100 text-amber-700">
                                {getInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {student.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                Weak: {student.weakSubject?.name || "No subject data"}
                              </p>
                            </div>
                          </div>
                          <Badge className="border-transparent bg-amber-500 text-white">
                            {typeof student.averageProgress === "number"
                              ? `${student.averageProgress}%`
                              : "No data"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600">
                        Your attention list will appear once students are assigned.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-8">
            <SectionCard
              description="High-value teaching actions backed by the live mentor workspace."
              title="Quick Actions"
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {[
                  {
                    title: "Create Quiz",
                    description: "Build a new checkpoint from your assigned subject coverage.",
                    icon: <CheckCircle2 className="h-5 w-5" />,
                    href: "/mentor/quizzes",
                    accentClassName: "bg-sky-600 text-white shadow-lg shadow-sky-200",
                    surfaceClassName:
                      "bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_120%)] shadow-[0_20px_50px_-40px_rgba(37,99,235,0.42)]",
                  },
                  {
                    title: "Upload Content",
                    description: "Add notes, PDFs, videos, or assignments for your learners.",
                    icon: <Upload className="h-5 w-5" />,
                    href: "/mentor/content",
                    accentClassName:
                      "bg-emerald-600 text-white shadow-lg shadow-emerald-200",
                    surfaceClassName:
                      "bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#d1fae5_120%)] shadow-[0_20px_50px_-40px_rgba(5,150,105,0.34)]",
                  },
                  {
                    title: "Reply to Doubts",
                    description: "Clear the learner questions still waiting for your help.",
                    icon: <MessageSquare className="h-5 w-5" />,
                    href: "/mentor/doubts",
                    accentClassName:
                      "bg-amber-500 text-white shadow-lg shadow-amber-200",
                    surfaceClassName:
                      "bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_55%,#fde68a_125%)] shadow-[0_20px_50px_-40px_rgba(217,119,6,0.3)]",
                  },
                  {
                    title: "Share Announcement",
                    description: "Send or schedule an update for assigned learners.",
                    icon: <Megaphone className="h-5 w-5" />,
                    href: "/mentor/announcements",
                    accentClassName:
                      "bg-violet-600 text-white shadow-lg shadow-violet-200",
                    surfaceClassName:
                      "bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_55%,#ddd6fe_125%)] shadow-[0_20px_50px_-40px_rgba(109,40,217,0.28)]",
                  },
                ].map((action) => (
                  <button
                    className={cn(
                      "group rounded-[28px] border border-slate-200/90 p-5 text-left transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_55px_-36px_rgba(15,23,42,0.18)] dark:!border-slate-200 dark:!text-slate-950",
                      action.surfaceClassName,
                    )}
                    key={action.title}
                    onClick={() => router.push(action.href)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_16px_28px_-18px_rgba(15,23,42,0.34)]",
                          action.accentClassName,
                        )}
                      >
                        {action.icon}
                      </span>
                      <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:text-slate-700" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-950">
                      {action.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              action={
                <Badge className="border-transparent bg-rose-100 text-rose-700">
                  {pendingDoubts.length} open
                </Badge>
              }
              description="The newest or most urgent student questions that still need a mentor response."
              title="Recent Doubts"
            >
              <div className="space-y-4">
                {recentDoubts.length ? (
                  recentDoubts.map((doubt) => (
                    <div className={cn(SOFT_PANEL_CLASS_NAME, "p-4")} key={doubt._id || doubt.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-950 dark:!text-slate-950">
                              {doubt.studentId?.name || "Student"}
                            </p>
                            <Badge className={doubtBadgeClass(doubt.priority)}>
                              {doubt.priority || "Normal"}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:!text-slate-600">
                            {doubt.title || "Untitled doubt"}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500 dark:!text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatRelativeTime(doubt.createdAt)}
                          </div>
                        </div>

                        <Button
                          className={cn(
                            "h-10 rounded-2xl px-4",
                            PRIMARY_BUTTON_CLASS_NAME,
                          )}
                          onClick={() => router.push("/mentor/doubts")}
                          type="button"
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-600">
                    No pending doubts right now.
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              action={
                <Button
                  className={cn(
                    "h-10 rounded-2xl px-4",
                    PRIMARY_BUTTON_CLASS_NAME,
                  )}
                  onClick={() => router.push("/mentor/announcements")}
                  type="button"
                >
                  <Megaphone className="mr-2 h-4 w-4" />
                  Open announcements
                </Button>
              }
              description="Recent mentor announcements created from the live announcement store."
              title="Announcements Preview"
            >
              <div className="space-y-4">
                {announcements.length ? (
                  announcements.slice(0, 3).map((announcement) => (
                    <div className={cn(SOFT_PANEL_CLASS_NAME, "p-4")} key={announcement.id}>
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-[0_16px_26px_-18px_rgba(37,99,235,0.44)]">
                          <Megaphone className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-950 dark:!text-slate-950">
                              {announcement.title || "Untitled announcement"}
                            </p>
                            <Badge className={announcementBadgeClass(announcement.status)}>
                              {announcement.status || "Draft"}
                            </Badge>
                            <Badge className="border-transparent bg-indigo-50 text-indigo-700 dark:!bg-indigo-50 dark:!text-indigo-700">
                              {getAudienceLabel(announcement.audienceType)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:!text-slate-600">
                            {announcement.message || "No announcement message."}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500 dark:!text-slate-500">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {announcement.status === "Scheduled"
                              ? `Scheduled for ${formatDate(announcement.scheduledAt)}`
                              : `Created ${formatRelativeTime(announcement.createdAt)}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-600">
                    No mentor announcements created yet.
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <SectionCard
            description="Your most recent mentor resources from the live content library."
            title="Recent Content"
          >
            <div className="space-y-4">
              {recentMaterials.length ? (
                recentMaterials.map((material) => (
                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-4")} key={material.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">
                            {material.title || "Untitled material"}
                          </p>
                          <Badge className="border-transparent bg-sky-100 text-sky-700">
                            {material.type || "Notes"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {material.subjectName || "General"} | {material.status || "Published"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Added {formatRelativeTime(material.createdAt)}
                        </p>
                      </div>
                      <Button
                        className={cn(
                          "h-10 rounded-2xl px-4",
                          SECONDARY_BUTTON_CLASS_NAME,
                        )}
                        onClick={() => router.push("/mentor/content")}
                        type="button"
                        variant="outline"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-600">
                  No materials uploaded yet.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            description="The newest quizzes created from your assigned subject coverage."
            title="Recent Quizzes"
          >
            <div className="space-y-4">
              {recentQuizzes.length ? (
                recentQuizzes.map((quiz) => (
                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-4")} key={quiz.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">
                            {quiz.title || "Untitled quiz"}
                          </p>
                          <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                            {quiz.subjectName || "General"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {quiz.questionCount || 0} questions | {quiz.assignedToCount || 0} direct assignments
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Created {formatRelativeTime(quiz.createdAt)}
                        </p>
                      </div>
                      <Button
                        className={cn(
                          "h-10 rounded-2xl px-4",
                          SECONDARY_BUTTON_CLASS_NAME,
                        )}
                        onClick={() => router.push("/mentor/quizzes")}
                        type="button"
                        variant="outline"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-600">
                  No mentor quizzes created yet.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
