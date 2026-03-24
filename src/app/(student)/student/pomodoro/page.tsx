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
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.22)]">
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
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.25)]">
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
          badgeClassName: "border-transparent bg-slate-900 text-white",
          accentClassName: "from-slate-900 to-sky-600",
        }
      : {
          ringFrom: "#0f766e",
          ringTo: "#14b8a6",
          badgeClassName: "border-transparent bg-emerald-500 text-white",
          accentClassName: "from-emerald-600 to-teal-500",
        };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your Pomodoro timer..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_44%,#eff6ff_120%)] p-6 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                Pomodoro Focus
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Minimal focus timer
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/85 sm:text-base">
                  A clean 25/5 focus routine built to reduce friction, protect
                  your attention, and help you stay consistent across every study block.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-100/90">
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  Default cycle: 25 / 5
                </span>
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  Next mode: {nextMode}
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-white/10 px-5 py-4 text-sm text-slate-100/90 backdrop-blur">
              {statusMessage}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            accentClassName="from-sky-600 to-cyan-500"
            detail="Completed today"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Session Count"
            value={`${completedSessions}`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Tracked across the day"
            icon={<Coffee className="h-5 w-5" />}
            label="Break Tracking"
            value={`${completedBreaks}`}
          />
          <SummaryCard
            accentClassName="from-slate-900 to-slate-700"
            detail="Recovered from finished cycles"
            icon={<Target className="h-5 w-5" />}
            label="Focus Minutes"
            value={`${totalFocusMinutes}`}
          />
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
                  className="h-11 rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800"
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
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-slate-900 hover:bg-slate-50"
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
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5">
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
                    indicatorClassName="bg-slate-950"
                    value={cycleProgress}
                  />
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span>{Math.round(cycleProgress)}% through this cycle</span>
                    <span>{nextMode} follows next</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <p className="text-sm font-medium text-slate-500">Focus preset</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      25 min
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
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
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
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

                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
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

                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
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
