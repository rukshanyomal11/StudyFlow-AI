"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  PlayCircle,
  Save,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { studentSidebarLinks } from "@/data/sidebarLinks";
import Alert from "@/components/ui/Alert";
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

type SessionStatus = "Completed" | "Live";
type StatusTone = "info" | "success" | "warning" | "error";

interface StudySession {
  id: string;
  subjectId: string | null;
  subject: string;
  durationMinutes: number;
  focusScore: number;
  startedAt: string;
  endedAt: string | null;
  goal: string;
  notes: string;
  distractions: number;
  status: SessionStatus;
}

interface ApiStudySession {
  id: string;
  subjectId?: string | null;
  subjectName?: string;
  duration?: number;
  focusScore?: number;
  startTime?: string | null;
  endTime?: string | null;
  goal?: string;
  notes?: string;
  distractions?: number;
  status?: "live" | "completed";
}

interface SubjectOption {
  id: string;
  name: string;
}

interface SessionFormState {
  subjectId: string;
  goal: string;
  notes: string;
}

interface EndSessionFormState {
  focusScore: string;
  distractions: string;
  notes: string;
}

const EMPTY_START_FORM: SessionFormState = {
  subjectId: "",
  goal: "",
  notes: "",
};

const EMPTY_END_FORM: EndSessionFormState = {
  focusScore: "85",
  distractions: "0",
  notes: "",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

const selectClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

function formatSessionDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "No session date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (!hours) {
    return `${remaining} min`;
  }

  if (!remaining) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remaining} min`;
}

function mapApiSession(session: ApiStudySession): StudySession {
  return {
    id: session.id,
    subjectId: session.subjectId ?? null,
    subject: session.subjectName?.trim() || "General",
    durationMinutes:
      typeof session.duration === "number" && Number.isFinite(session.duration)
        ? session.duration
        : 0,
    focusScore:
      typeof session.focusScore === "number" &&
      Number.isFinite(session.focusScore)
        ? session.focusScore
        : 0,
    startedAt: session.startTime || new Date().toISOString(),
    endedAt: session.endTime ?? null,
    goal: session.goal?.trim() || "Untitled study session",
    notes: session.notes?.trim() || "No notes saved for this session.",
    distractions:
      typeof session.distractions === "number" &&
      Number.isFinite(session.distractions)
        ? session.distractions
        : 0,
    status: session.status === "live" ? "Live" : "Completed",
  };
}

async function readApiError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: string;
      details?: string;
    };

    if (
      data.error === "Internal server error" &&
      typeof data.details === "string" &&
      data.details.trim()
    ) {
      return data.details;
    }

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (typeof data.details === "string" && data.details.trim()) {
      return data.details;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

function getStatusDetails(
  message: string,
  defaultTone: StatusTone = "info",
): {
  tone: StatusTone;
  message: string;
  hint?: string;
} {
  if (message === "Subject ID is required" || message === "Subject not found") {
    return {
      tone: "warning",
      message: "Choose a saved subject before starting a session.",
      hint: "If you do not have any subjects yet, add one on the Subjects page first.",
    };
  }

  if (message === "Goal is required") {
    return {
      tone: "warning",
      message: "Add a clear session goal before starting.",
    };
  }

  if (message === "Study session not found") {
    return {
      tone: "warning",
      message: "That session could not be found anymore.",
      hint: "Refresh the page to sync your latest session history.",
    };
  }

  if (message === "Unauthorized" || message === "Forbidden") {
    return {
      tone: "error",
      message: "You need to be signed in to manage study sessions.",
      hint: "Refresh the page and sign in again if needed.",
    };
  }

  return {
    tone: defaultTone,
    message,
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

export default function StudentSessionsPage() {
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [startForm, setStartForm] = useState<SessionFormState>(EMPTY_START_FORM);
  const [endForm, setEndForm] = useState<EndSessionFormState>(EMPTY_END_FORM);
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const [statusMessage, setStatusMessage] = useState(
    "Loading your study sessions...",
  );
  const [statusHint, setStatusHint] = useState<string | null>(
    "We are fetching your saved session history and subjects.",
  );
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  const updateStatus = (
    tone: StatusTone,
    message: string,
    hint?: string,
  ) => {
    setStatusTone(tone);
    setStatusMessage(message);
    setStatusHint(hint ?? null);
  };

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setIsLoadingSessions(true);

      try {
        const [sessionsResponse, subjectsResponse] = await Promise.all([
          fetch("/api/sessions/history", { cache: "no-store" }),
          fetch("/api/subjects", { cache: "no-store" }),
        ]);

        if (!sessionsResponse.ok) {
          throw new Error(
            await readApiError(
              sessionsResponse,
              "Unable to load your sessions right now.",
            ),
          );
        }

        if (!subjectsResponse.ok) {
          throw new Error(
            await readApiError(
              subjectsResponse,
              "Unable to load your subjects right now.",
            ),
          );
        }

        const sessionsData = (await sessionsResponse.json()) as {
          sessions?: ApiStudySession[];
        };
        const subjectsData = (await subjectsResponse.json()) as {
          subjects?: Array<{ _id: string; name: string }>;
        };
        const nextSessions = Array.isArray(sessionsData.sessions)
          ? sessionsData.sessions.map(mapApiSession)
          : [];
        const nextSubjects = Array.isArray(subjectsData.subjects)
          ? subjectsData.subjects.map((subject) => ({
              id: subject._id,
              name: subject.name,
            }))
          : [];

        if (!isActive) {
          return;
        }

        setSessions(nextSessions);
        setSubjects(nextSubjects);
        setSelectedSessionId(nextSessions[0]?.id ?? null);
        updateStatus(
          nextSessions.length ? "success" : "info",
          nextSessions.length
            ? "Your session history is ready."
            : "You have no saved study sessions yet.",
          nextSessions.length
            ? "Open any session to inspect its goal, duration, and focus result."
            : "Start your first study session to begin tracking real focus history.",
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        const status = getStatusDetails(
          error instanceof Error
            ? error.message
            : "Unable to load your sessions right now.",
          "error",
        );

        updateStatus(status.tone, status.message, status.hint);
      } finally {
        if (isActive) {
          setIsLoadingSessions(false);
        }
      }
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
  const completedSessions = useMemo(
    () => sessions.filter((session) => session.status === "Completed"),
    [sessions],
  );

  const totalMinutes = useMemo(
    () =>
      completedSessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0,
      ),
    [completedSessions],
  );

  const averageFocusScore = useMemo(() => {
    if (!completedSessions.length) {
      return 0;
    }

    return Math.round(
      completedSessions.reduce((sum, session) => sum + session.focusScore, 0) /
        completedSessions.length,
    );
  }, [completedSessions]);

  const bestSubject = useMemo(() => {
    const subjectBuckets = new Map<string, { total: number; count: number }>();

    completedSessions.forEach((session) => {
      const existing = subjectBuckets.get(session.subject) ?? {
        total: 0,
        count: 0,
      };
      subjectBuckets.set(session.subject, {
        total: existing.total + session.focusScore,
        count: existing.count + 1,
      });
    });

    const ranked = Array.from(subjectBuckets.entries()).map(
      ([subject, stats]) => ({
        subject,
        average: stats.total / stats.count,
      }),
    );

    ranked.sort((a, b) => b.average - a.average);
    return ranked[0]?.subject ?? "No data";
  }, [completedSessions]);

  const openStartSessionModal = () => {
    if (!subjects.length) {
      updateStatus(
        "warning",
        "You need at least one saved subject before starting a session.",
        "Add a subject first, then come back here to start your study block.",
      );
      return;
    }

    setStartForm(EMPTY_START_FORM);
    setIsStartModalOpen(true);
    updateStatus(
      "info",
      "Set up a new study session.",
      "Choose a saved subject and describe what you want to accomplish.",
    );
  };

  const closeStartSessionModal = () => {
    setIsStartModalOpen(false);
    setStartForm(EMPTY_START_FORM);
  };

  const openEndSessionModal = () => {
    if (!selectedSession || selectedSession.status !== "Live") {
      return;
    }

    setEndForm({
      focusScore:
        selectedSession.focusScore > 0
          ? String(selectedSession.focusScore)
          : "85",
      distractions: String(selectedSession.distractions),
      notes:
        selectedSession.notes === "No notes saved for this session."
          ? ""
          : selectedSession.notes,
    });
    setIsEndModalOpen(true);
    updateStatus(
      "info",
      `Ending ${selectedSession.subject} session.`,
      "Record your focus score and final notes before saving.",
    );
  };

  const closeEndSessionModal = () => {
    setIsEndModalOpen(false);
    setEndForm(EMPTY_END_FORM);
  };

  const handleStartSession = async () => {
    const subjectId = startForm.subjectId.trim();
    const goal = startForm.goal.trim();

    if (!subjectId || !goal) {
      updateStatus(
        "warning",
        "Choose a subject and add a session goal before starting.",
      );
      return;
    }

    setIsStartingSession(true);

    try {
      const response = await fetch("/api/sessions/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId,
          goal,
          notes: startForm.notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Unable to start a new session right now.",
          ),
        );
      }

      const data = (await response.json()) as { session?: ApiStudySession };

      if (!data.session) {
        throw new Error("Unable to start a new session right now.");
      }

      const newSession = mapApiSession(data.session);
      setSessions((current) => [newSession, ...current]);
      setSelectedSessionId(newSession.id);
      updateStatus(
        "success",
        `Started a new ${newSession.subject} session.`,
        "When you finish, end the session to record focus score and final duration.",
      );
      closeStartSessionModal();
    } catch (error) {
      const status = getStatusDetails(
        error instanceof Error
          ? error.message
          : "Unable to start a new session right now.",
        "error",
      );

      updateStatus(status.tone, status.message, status.hint);
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleEndSession = async () => {
    if (!selectedSession) {
      return;
    }

    const focusScore = Number(endForm.focusScore);
    const distractions = Number(endForm.distractions);

    if (!Number.isFinite(focusScore) || focusScore < 0 || focusScore > 100) {
      updateStatus(
        "warning",
        "Focus score must be a number between 0 and 100.",
      );
      return;
    }

    if (!Number.isFinite(distractions) || distractions < 0) {
      updateStatus(
        "warning",
        "Distractions must be zero or higher.",
      );
      return;
    }

    setIsEndingSession(true);

    try {
      const response = await fetch("/api/sessions/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          focusScore,
          distractions,
          notes: endForm.notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Unable to end this session right now.",
          ),
        );
      }

      const data = (await response.json()) as { session?: ApiStudySession };

      if (!data.session) {
        throw new Error("Unable to end this session right now.");
      }

      const endedSession = mapApiSession(data.session);
      setSessions((current) =>
        current.map((session) =>
          session.id === endedSession.id ? endedSession : session,
        ),
      );
      setSelectedSessionId(endedSession.id);
      updateStatus(
        "success",
        `Session ended for ${endedSession.subject}.`,
        "The session is now saved in your history with final focus analytics.",
      );
      closeEndSessionModal();
    } catch (error) {
      const status = getStatusDetails(
        error instanceof Error
          ? error.message
          : "Unable to end this session right now.",
        "error",
      );

      updateStatus(status.tone, status.message, status.hint);
    } finally {
      setIsEndingSession(false);
    }
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your study sessions..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[36px] border border-sky-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_22%,#eefcff_54%,#f8fbff_76%,#fff7e8_100%)] p-6 shadow-[0_40px_110px_-52px_rgba(56,189,248,0.28)] sm:p-8">
          <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_32%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                <BookOpen className="h-4 w-4 text-blue-700" />
                <span>Study Sessions</span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Focus analytics and session history
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Review how your study blocks are performing, track focus scores,
                  and open any session to inspect the details behind the result.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Activity className="h-4 w-4 text-sky-600" />
                  {sessions.length} logged sessions
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Brain className="h-4 w-4 text-indigo-600" />
                  {averageFocusScore}% average focus
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Target className="h-4 w-4 text-amber-500" />
                  Best subject: {bestSubject}
                </span>
              </div>
              <div className="rounded-[28px] border border-sky-100/80 bg-white/78 p-5 shadow-[0_24px_56px_-42px_rgba(56,189,248,0.42)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Session Insight
                </p>
                {completedSessions.length ? (
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    Your strongest momentum is in{" "}
                    <span className="font-semibold text-slate-900">
                      {bestSubject}
                    </span>
                    . Keep new blocks short, clear, and intentional while your
                    average focus stays around{" "}
                    <span className="font-semibold text-sky-700">
                      {averageFocusScore}%
                    </span>
                    .
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    Start a live study session and end it when you finish to
                    build real focus analytics here.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.3)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Session Pulse
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Build calm, high-focus study blocks
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.22)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <Clock3 className="h-4 w-4" />
                    Focus Hours
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {(totalMinutes / 60).toFixed(1)} hrs
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Total time captured in completed sessions
                  </p>
                </div>
                <div className="rounded-[24px] border border-blue-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(37,99,235,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    <Brain className="h-4 w-4" />
                    Focus Score
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {averageFocusScore}%
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Average quality across your study rhythm
                  </p>
                </div>
                <div className="rounded-[24px] border border-amber-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#fff9eb_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(245,158,11,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                    <Target className="h-4 w-4" />
                    Best Subject
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {bestSubject}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Your current top performer for concentration
                  </p>
                </div>
                <div className="rounded-[24px] border border-cyan-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#ecfeff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(6,182,212,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    <Activity className="h-4 w-4" />
                    Session Count
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {sessions.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Logged blocks ready for review and comparison
                  </p>
                </div>
              </div>

              <Button
                className="mt-5 h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] px-5 text-white shadow-[0_24px_50px_-26px_rgba(37,99,235,0.55)] transition hover:brightness-105"
                disabled={isLoadingSessions || isStartingSession || isEndingSession}
                onClick={openStartSessionModal}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                {isStartingSession ? "Starting..." : "Start New Session"}
              </Button>

              <Alert
                className="mt-4 rounded-[22px] border px-4 py-3 shadow-sm"
                type={statusTone}
              >
                <div className="space-y-1">
                  <p className="font-medium">{statusMessage}</p>
                  {statusHint ? <p>{statusHint}</p> : null}
                </div>
              </Alert>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                disabled={isLoadingSessions || isStartingSession || isEndingSession}
                onClick={openStartSessionModal}
                variant="outline"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                {isStartingSession ? "Starting..." : "Start Session"}
              </Button>
            }
            description="Every session shows the subject, total duration, focus score, and current state for quick comparison."
            title="Session History"
          >
            <div className="hidden rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] lg:gap-4">
              <span>Subject</span>
              <span>Duration</span>
              <span>Focus Score</span>
              <span>Status</span>
            </div>

            <div className="mt-4 space-y-3">
              {sessions.length ? (
                sessions.map((session) => {
                  const isSelected = session.id === selectedSessionId;

                  return (
                    <button
                      className={cn(
                        "w-full rounded-[24px] border p-4 text-left transition",
                        isSelected
                          ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                          : "border-sky-100/80 bg-white/95 hover:border-sky-200 hover:shadow-[0_18px_40px_-24px_rgba(59,130,246,0.16)]",
                      )}
                      key={session.id}
                      onClick={() => {
                        setSelectedSessionId(session.id);
                        updateStatus(
                          "info",
                          `Viewing ${session.subject} session details.`,
                        );
                      }}
                      type="button"
                    >
                      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] lg:items-center lg:gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {session.subject}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatSessionDate(session.startedAt)}
                          </p>
                        </div>

                        <div className="text-sm font-medium text-slate-700">
                          {session.status === "Live"
                            ? "Running now"
                            : formatDuration(session.durationMinutes)}
                        </div>

                        <div>
                          {session.status === "Live" ? (
                            <span className="text-sm font-semibold text-emerald-700">
                              Pending
                            </span>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-slate-950">
                                {session.focusScore}%
                              </span>
                              <div className="w-full max-w-[120px]">
                                <Progress
                                  className="h-2.5"
                                  indicatorClassName="bg-sky-600"
                                  value={session.focusScore}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <Badge
                            className={cn(
                              "px-3 py-1 text-[11px] uppercase tracking-[0.18em] !border-[1px]",
                              session.status === "Live"
                                ? "!border-emerald-300 !bg-emerald-100 !text-emerald-900"
                                : "!border-sky-300 !bg-sky-100 !text-sky-900",
                            )}
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[24px] border border-dashed border-sky-200 bg-white p-8 text-center text-sm leading-7 text-slate-600">
                  No study sessions yet. Start one to build your focus history.
                </div>
              )}
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              action={
                selectedSession?.status === "Live" ? (
                  <Button
                    className="h-10 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-emerald-700 shadow-[0_14px_30px_-22px_rgba(16,185,129,0.2)] hover:bg-emerald-100"
                    disabled={isEndingSession}
                    onClick={openEndSessionModal}
                    variant="outline"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isEndingSession ? "Ending..." : "End Session"}
                  </Button>
                ) : null
              }
              description="A detailed view of the selected session, including timing, focus performance, and study goal."
              title="Session Details"
            >
              {selectedSession ? (
                <div className="space-y-5">
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {selectedSession.subject}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                          {selectedSession.goal}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {formatSessionDate(selectedSession.startedAt)}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                          selectedSession.status === "Live"
                            ? "border-transparent bg-emerald-500 text-white"
                            : "border-transparent bg-sky-100 text-sky-700",
                        )}
                      >
                        {selectedSession.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                      <p className="text-sm font-medium text-slate-500">
                        Duration
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {selectedSession.status === "Live"
                          ? "In progress"
                          : formatDuration(selectedSession.durationMinutes)}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                      <p className="text-sm font-medium text-slate-500">
                        Focus Score
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {selectedSession.status === "Live"
                          ? "Pending"
                          : `${selectedSession.focusScore}%`}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">
                        Focus quality
                      </p>
                      <span className="text-sm font-medium text-slate-500">
                        {selectedSession.status === "Live"
                          ? "Pending"
                          : `${selectedSession.focusScore} / 100`}
                      </span>
                    </div>
                    {selectedSession.status === "Live" ? (
                      <p className="mt-4 text-sm text-slate-500">
                        End the session to record the final focus score and
                        duration.
                      </p>
                    ) : (
                      <Progress
                        className="mt-4 h-3"
                        indicatorClassName="bg-sky-600"
                        value={selectedSession.focusScore}
                      />
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                      <p className="text-sm font-medium text-slate-500">
                        Distractions
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {selectedSession.distractions}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                      <p className="text-sm font-medium text-slate-500">
                        State
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {selectedSession.status}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-semibold text-slate-950">Session notes</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {selectedSession.notes}
                    </p>
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              description="Short analytics cues based on your current sessions data."
              title="Session Insights"
            >
              <div className="space-y-4">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Focus trend
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {completedSessions.length
                          ? `Your completed sessions are averaging ${averageFocusScore}% focus, which suggests your study blocks are staying consistent.`
                          : "Complete a few sessions first and this area will start highlighting your focus trend."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Best performing subject
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {bestSubject !== "No data"
                          ? `${bestSubject} is currently producing your strongest focus results. Schedule it earlier in the day when you want quick wins.`
                          : "Once you complete a few sessions, this card will show which subject is producing your best focus results."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Session cadence
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        You have logged {sessions.length} sessions this week. Keep the
                        next one under 90 minutes to maintain your current focus quality.
                      </p>
                    </div>
                  </div>
                </div>

                <Alert
                  className="rounded-[24px] border p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]"
                  type={statusTone}
                >
                  <div className="space-y-1">
                    <p className="font-medium">{statusMessage}</p>
                    {statusHint ? <p>{statusHint}</p> : null}
                  </div>
                </Alert>
              </div>
            </SectionCard>
          </div>
        </div>

        {isStartModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
            <div className="w-full max-w-2xl rounded-[32px] border border-sky-100 bg-white shadow-[0_32px_80px_-34px_rgba(56,189,248,0.22)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Start New Session
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose a saved subject, define the goal, and optionally add
                    opening notes for the session.
                  </p>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                  onClick={closeStartSessionModal}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-6">
                <Field htmlFor="session-subject" label="Subject">
                  <select
                    className={selectClassName}
                    id="session-subject"
                    onChange={(event) =>
                      setStartForm((current) => ({
                        ...current,
                        subjectId: event.target.value,
                      }))
                    }
                    value={startForm.subjectId}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field htmlFor="session-goal" label="Session goal">
                  <textarea
                    className={textareaClassName}
                    id="session-goal"
                    onChange={(event) =>
                      setStartForm((current) => ({
                        ...current,
                        goal: event.target.value,
                      }))
                    }
                    placeholder="Past paper review, concept revision, flashcard recall, or essay planning"
                    rows={5}
                    value={startForm.goal}
                  />
                </Field>

                <Field htmlFor="session-notes" label="Opening notes">
                  <textarea
                    className={textareaClassName}
                    id="session-notes"
                    onChange={(event) =>
                      setStartForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Optional notes about what you want to remember or review during the session"
                    rows={4}
                    value={startForm.notes}
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  Starting a session will create a live session. End it later to
                  save the final duration and focus score.
                </div>
                <div className="flex gap-3">
                  <Button
                    className="h-11 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    disabled={isStartingSession}
                    onClick={closeStartSessionModal}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    disabled={isStartingSession}
                    onClick={handleStartSession}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isStartingSession ? "Starting..." : "Start Session"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isEndModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
            <div className="w-full max-w-2xl rounded-[32px] border border-sky-100 bg-white shadow-[0_32px_80px_-34px_rgba(56,189,248,0.22)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    End Session
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Save the final focus score, distractions, and notes for this
                    live session.
                  </p>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                  onClick={closeEndSessionModal}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field htmlFor="session-focus-score" label="Focus score">
                    <input
                      className={inputClassName}
                      id="session-focus-score"
                      max="100"
                      min="0"
                      onChange={(event) =>
                        setEndForm((current) => ({
                          ...current,
                          focusScore: event.target.value,
                        }))
                      }
                      type="number"
                      value={endForm.focusScore}
                    />
                  </Field>

                  <Field htmlFor="session-distractions" label="Distractions">
                    <input
                      className={inputClassName}
                      id="session-distractions"
                      min="0"
                      onChange={(event) =>
                        setEndForm((current) => ({
                          ...current,
                          distractions: event.target.value,
                        }))
                      }
                      type="number"
                      value={endForm.distractions}
                    />
                  </Field>
                </div>

                <Field htmlFor="session-end-notes" label="Final notes">
                  <textarea
                    className={textareaClassName}
                    id="session-end-notes"
                    onChange={(event) =>
                      setEndForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="What went well, what distracted you, or what to review next"
                    rows={5}
                    value={endForm.notes}
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  Ending the session will lock in its duration and save it to
                  your study history.
                </div>
                <div className="flex gap-3">
                  <Button
                    className="h-11 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    disabled={isEndingSession}
                    onClick={closeEndSessionModal}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11 rounded-2xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                    disabled={isEndingSession}
                    onClick={handleEndSession}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isEndingSession ? "Ending..." : "End Session"}
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
