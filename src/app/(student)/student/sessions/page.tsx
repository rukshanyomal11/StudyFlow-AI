"use client";

import { useMemo, useState } from "react";
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

interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  focusScore: number;
  startedAt: string;
  goal: string;
  notes: string;
  status: SessionStatus;
}

interface SessionFormState {
  subject: string;
  durationMinutes: string;
  goal: string;
}

const INITIAL_SESSIONS: StudySession[] = [
  {
    id: "session-01",
    subject: "Mathematics",
    durationMinutes: 75,
    focusScore: 91,
    startedAt: "2026-03-24T18:10:00",
    goal: "Past paper algebra drills",
    notes: "Strong rhythm throughout the session with only one short distraction.",
    status: "Completed",
  },
  {
    id: "session-02",
    subject: "Physics",
    durationMinutes: 60,
    focusScore: 87,
    startedAt: "2026-03-23T19:00:00",
    goal: "Mechanics summary review",
    notes: "Good retention on formulas, but needs one more concept recap tomorrow.",
    status: "Completed",
  },
  {
    id: "session-03",
    subject: "Chemistry",
    durationMinutes: 45,
    focusScore: 83,
    startedAt: "2026-03-22T17:20:00",
    goal: "Organic chemistry flashcard recall",
    notes: "Recall speed improved after the first 15 minutes.",
    status: "Completed",
  },
  {
    id: "session-04",
    subject: "History",
    durationMinutes: 50,
    focusScore: 79,
    startedAt: "2026-03-21T16:40:00",
    goal: "Essay planning and evidence mapping",
    notes: "Session started slowly but recovered well by the final third.",
    status: "Completed",
  },
];

const EMPTY_FORM: SessionFormState = {
  subject: "",
  durationMinutes: "45",
  goal: "",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatSessionDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
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

function buildFocusScore(subject: string, durationMinutes: number) {
  return Math.min(96, Math.max(74, 72 + subject.length + Math.round(durationMinutes / 8)));
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
    <Card className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_28px_64px_-42px_rgba(59,130,246,0.2)]">
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

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState("session-01");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<SessionFormState>(EMPTY_FORM);
  const [statusMessage, setStatusMessage] = useState(
    "Select any session to inspect its details and focus insights.",
  );

  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];

  const totalMinutes = useMemo(
    () => sessions.reduce((sum, session) => sum + session.durationMinutes, 0),
    [sessions],
  );

  const averageFocusScore = useMemo(() => {
    if (!sessions.length) {
      return 0;
    }

    return Math.round(
      sessions.reduce((sum, session) => sum + session.focusScore, 0) /
        sessions.length,
    );
  }, [sessions]);

  const bestSubject = useMemo(() => {
    const subjectBuckets = new Map<string, { total: number; count: number }>();

    sessions.forEach((session) => {
      const existing = subjectBuckets.get(session.subject) ?? { total: 0, count: 0 };
      subjectBuckets.set(session.subject, {
        total: existing.total + session.focusScore,
        count: existing.count + 1,
      });
    });

    const ranked = Array.from(subjectBuckets.entries()).map(([subject, stats]) => ({
      subject,
      average: stats.total / stats.count,
    }));

    ranked.sort((a, b) => b.average - a.average);
    return ranked[0]?.subject ?? "No data";
  }, [sessions]);

  const openStartSessionModal = () => {
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
    setStatusMessage("Start a new session and it will appear at the top of your history.");
  };

  const closeStartSessionModal = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleStartSession = () => {
    const subject = form.subject.trim();
    const goal = form.goal.trim();
    const durationMinutes = Number(form.durationMinutes);

    if (!subject || !goal || !durationMinutes) {
      setStatusMessage("Add a subject, duration, and session goal before starting.");
      return;
    }

    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      subject,
      durationMinutes,
      focusScore: buildFocusScore(subject, durationMinutes),
      startedAt: new Date().toISOString(),
      goal,
      notes: `Live session started for ${goal.toLowerCase()}.`,
      status: "Live",
    };

    setSessions((current) => [newSession, ...current]);
    setSelectedSessionId(newSession.id);
    setStatusMessage(`Started a new ${subject} session.`);
    closeStartSessionModal();
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your study sessions..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#f3f8ff_36%,#ecfeff_72%,#fefce8_108%)] p-6 shadow-[0_34px_90px_-46px_rgba(56,189,248,0.24)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-sky-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                Study Sessions
              </Badge>
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
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  {sessions.length} logged sessions
                </span>
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  {averageFocusScore}% average focus
                </span>
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  Best subject: {bestSubject}
                </span>
              </div>
            </div>

            <Button
              className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
              onClick={openStartSessionModal}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Start New Session
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            accentClassName="from-sky-600 to-cyan-500"
            detail="Captured in your history"
            icon={<Activity className="h-5 w-5" />}
            label="Total Sessions"
            value={`${sessions.length}`}
          />
          <SummaryCard
            accentClassName="from-indigo-700 to-sky-600"
            detail="Across all recorded sessions"
            icon={<Clock3 className="h-5 w-5" />}
            label="Focus Hours"
            value={`${(totalMinutes / 60).toFixed(1)} hrs`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Average session quality"
            icon={<Brain className="h-5 w-5" />}
            label="Avg. Focus Score"
            value={`${averageFocusScore}%`}
          />
          <SummaryCard
            accentClassName="from-amber-500 to-orange-500"
            detail="Strongest subject performance"
            icon={<Target className="h-5 w-5" />}
            label="Best Subject"
            value={bestSubject}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                onClick={openStartSessionModal}
                variant="outline"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Session
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
              {sessions.map((session) => {
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
                      setStatusMessage(`Viewing ${session.subject} session details.`);
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
                        {formatDuration(session.durationMinutes)}
                      </div>

                      <div>
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
                      </div>

                      <div>
                        <Badge
                          className={cn(
                            "px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                            session.status === "Live"
                              ? "border-transparent bg-emerald-500 text-white"
                              : "border-transparent bg-sky-100 text-sky-700",
                          )}
                        >
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
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
                        {formatDuration(selectedSession.durationMinutes)}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                      <p className="text-sm font-medium text-slate-500">
                        Focus Score
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {selectedSession.focusScore}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">
                        Focus quality
                      </p>
                      <span className="text-sm font-medium text-slate-500">
                        {selectedSession.focusScore} / 100
                      </span>
                    </div>
                    <Progress
                      className="mt-4 h-3"
                      indicatorClassName="bg-sky-600"
                      value={selectedSession.focusScore}
                    />
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
                        Your recent sessions are staying above an 80% focus score,
                        which suggests your study blocks are well-sized and consistent.
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
                        {bestSubject} is currently producing your strongest focus results.
                        Schedule it earlier in the day when you want quick wins.
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

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4 text-sm text-slate-600">
                  {statusMessage}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        {isModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
            <div className="w-full max-w-2xl rounded-[32px] border border-sky-100 bg-white shadow-[0_32px_80px_-34px_rgba(56,189,248,0.22)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Start New Session
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Capture the subject, planned duration, and study goal for the new session.
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
                  <input
                    className={inputClassName}
                    id="session-subject"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                    placeholder="Mathematics"
                    value={form.subject}
                  />
                </Field>

                <Field htmlFor="session-duration" label="Duration in minutes">
                  <input
                    className={inputClassName}
                    id="session-duration"
                    min="15"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        durationMinutes: event.target.value,
                      }))
                    }
                    type="number"
                    value={form.durationMinutes}
                  />
                </Field>

                <Field htmlFor="session-goal" label="Session goal">
                  <textarea
                    className={textareaClassName}
                    id="session-goal"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        goal: event.target.value,
                      }))
                    }
                    placeholder="Past paper review, concept revision, flashcard recall, or essay planning"
                    rows={5}
                    value={form.goal}
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  Starting a session will add it to history with a generated focus score.
                </div>
                <div className="flex gap-3">
                  <Button
                    className="h-11 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    onClick={closeStartSessionModal}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={handleStartSession}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Start Session
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




