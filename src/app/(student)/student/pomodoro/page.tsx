"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Brain,
  CheckCircle2,
  Clock3,
  Coffee,
  Pause,
  Play,
  RotateCcw,
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

type TimerMode = "Focus" | "Break";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_30px_70px_-40px_rgba(56,189,248,0.18)]">
      <CardHeader className="pb-5">
        <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
        <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {description}
        </CardDescription>
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
    <Card className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_28px_64px_-42px_rgba(59,130,246,0.2)]">
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

export default function StudentPomodoroPage() {
  const [mode, setMode] = useState<TimerMode>("Focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(3);
  const [completedBreaks, setCompletedBreaks] = useState(2);
  const [statusMessage, setStatusMessage] = useState(
    "Focus timer ready. Press start when you want a quiet 25-minute sprint.",
  );

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds > 1) {
          return currentSeconds - 1;
        }

        if (mode === "Focus") {
          setCompletedSessions((current) => current + 1);
          setMode("Break");
          setStatusMessage("Focus session complete. Your 5-minute break has started.");
          return BREAK_SECONDS;
        }

        setCompletedBreaks((current) => current + 1);
        setMode("Focus");
        setStatusMessage("Break complete. Your next 25-minute focus session is live.");
        return FOCUS_SECONDS;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, mode]);

  const currentDuration = mode === "Focus" ? FOCUS_SECONDS : BREAK_SECONDS;
  const cycleProgress = useMemo(
    () => ((currentDuration - secondsLeft) / currentDuration) * 100,
    [currentDuration, secondsLeft],
  );
  const totalFocusMinutes = completedSessions * 25;
  const nextMode = mode === "Focus" ? "Break" : "Focus";

  const handleToggleTimer = () => {
    setIsRunning((current) => !current);
    setStatusMessage(
      isRunning
        ? `${mode} timer paused. Resume when you're ready.`
        : `${mode} timer started. Stay with one task until the bell.`,
    );
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode("Focus");
    setSecondsLeft(FOCUS_SECONDS);
    setStatusMessage("Timer reset. Back to the default 25-minute focus cycle.");
  };

  const modePalette =
    mode === "Focus"
      ? {
          ringFrom: "#0f172a",
          ringTo: "#2563eb",
          badgeClassName: "!border-sky-300 !bg-sky-100 !text-sky-900 border",
          accentClassName: "from-indigo-700 to-sky-600",
        }
      : {
          ringFrom: "#0f766e",
          ringTo: "#14b8a6",
          badgeClassName: "!border-emerald-300 !bg-emerald-100 !text-emerald-900 border",
          accentClassName: "from-emerald-600 to-teal-500",
        };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your Pomodoro timer..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[36px] border border-sky-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_22%,#eefcff_54%,#f8fbff_76%,#fff7e8_100%)] p-6 shadow-[0_40px_110px_-52px_rgba(56,189,248,0.28)] sm:p-8">
          <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_32%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[1.06fr_0.94fr] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                <Clock3 className="h-4 w-4 text-blue-700" />
                <span>Pomodoro Focus</span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Minimal focus timer
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  A clean 25/5 focus routine built to reduce friction, protect
                  your attention, and help you stay consistent across every study block.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Clock3 className="h-4 w-4 text-sky-600" />
                  Default cycle: 25 / 5
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Target className="h-4 w-4 text-indigo-600" />
                  Next mode: {nextMode}
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {completedSessions} sessions finished
                </span>
              </div>
              <div className="rounded-[28px] border border-sky-100/80 bg-white/78 p-5 shadow-[0_24px_56px_-42px_rgba(56,189,248,0.42)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Focus Rhythm
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Keep each sprint calm and intentional. Your timer is set for a
                  simple flow that helps you build momentum without clutter or
                  decision fatigue.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.3)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Timer Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Stay steady through every focus cycle
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.22)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <Brain className="h-4 w-4" />
                    Current Mode
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {mode}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Active cycle running in your timer
                  </p>
                </div>
                <div className="rounded-[24px] border border-blue-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(37,99,235,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    <Target className="h-4 w-4" />
                    Next Shift
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {nextMode}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    The next state after this block completes
                  </p>
                </div>
                <div className="rounded-[24px] border border-emerald-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(16,185,129,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Session Count
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {completedSessions}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Finished focus sprints recorded today
                  </p>
                </div>
                <div className="rounded-[24px] border border-cyan-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#ecfeff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(6,182,212,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    <Coffee className="h-4 w-4" />
                    Focus Minutes
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {totalFocusMinutes}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Recovered from your completed work cycles
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 text-sm leading-7 text-slate-600 shadow-[0_18px_40px_-34px_rgba(56,189,248,0.18)]">
                {statusMessage}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            description="A single timer surface for focused work. Start, pause, or reset without extra clutter."
            title="Timer"
          >
            <div className="flex flex-col items-center justify-center gap-8 py-4">
              <div
                className="relative flex h-[300px] w-[300px] items-center justify-center rounded-full p-5 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.55)]"
                style={{
                  background: `conic-gradient(${modePalette.ringTo} ${cycleProgress}%, rgba(226,232,240,0.55) ${cycleProgress}% 100%)`,
                }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <Badge
                    className={cn(
                      "px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                      modePalette.badgeClassName,
                    )}
                  >
                    {mode}
                  </Badge>
                  <p className="mt-6 text-6xl font-semibold tracking-tight text-slate-950 sm:text-7xl">
                    {formatTime(secondsLeft)}
                  </p>
                  <p className="mt-4 text-sm text-slate-500">
                    {mode === "Focus"
                      ? "Stay with one important study task."
                      : "Step back, breathe, and reset your attention."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                  onClick={handleToggleTimer}
                >
                  {isRunning ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  className="!border-sky-300 !bg-white h-11 rounded-2xl px-5 font-semibold !text-sky-700 hover:!bg-sky-50 dark:!border-sky-300 dark:!bg-white dark:!text-sky-700"
                  onClick={handleReset}
                  variant="outline"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              description="A compact readout of the current cycle and what happens next."
              title="Cycle Overview"
            >
              <div className="space-y-5">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Current Mode
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {mode}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white",
                        modePalette.accentClassName,
                      )}
                    >
                      {mode === "Focus" ? (
                        <Brain className="h-5 w-5" />
                      ) : (
                        <Coffee className="h-5 w-5" />
                      )}
                    </span>
                  </div>
                  <Progress
                    className="mt-5 h-3"
                    indicatorClassName="bg-sky-600"
                    value={cycleProgress}
                  />
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span>{Math.round(cycleProgress)}% through this cycle</span>
                    <span>{nextMode} follows next</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-medium text-slate-500">Focus preset</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      25 min
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-medium text-slate-500">Break preset</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      5 min
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="Short cues to keep the timer useful instead of distracting."
              title="Focus Notes"
            >
              <div className="space-y-4">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                      <Clock3 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Keep one task in view
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Pomodoro works best when a single task stays visible for the
                        whole focus block without extra context switching.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                      <Coffee className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Use breaks deliberately
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Stand up, stretch, and step away from the screen so the next
                        focus block starts with clearer attention.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Build consistency first
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Short, repeatable cycles usually beat rare marathon sessions
                        when you want long-term study momentum.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}



