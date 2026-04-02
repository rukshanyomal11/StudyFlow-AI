"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  PencilLine,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
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

type DayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

interface DayMeta {
  day: DayName;
  dateLabel: string;
}

interface TimeSlot {
  time: string;
  endTime: string;
  label: string;
}

interface SlotAssignment {
  subjectId: string | null;
  subject: string;
  focus: string;
}

interface SlotEditorState {
  subject: string;
  focus: string;
}

interface ActiveSlot {
  day: DayName;
  time: string;
}

interface ApiTimetableSlot {
  subjectId?: string | null;
  subjectName?: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface ApiTimetableEntry {
  day: string;
  slots: ApiTimetableSlot[];
}

type StatusTone = "info" | "success" | "warning" | "error";
type TimetableMap = Partial<Record<string, SlotAssignment>>;

const WEEK_DAYS: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const TIME_SLOTS: TimeSlot[] = [
  { time: "07:30", endTime: "09:00", label: "7:30 AM" },
  { time: "09:30", endTime: "11:00", label: "9:30 AM" },
  { time: "12:00", endTime: "13:30", label: "12:00 PM" },
  { time: "15:00", endTime: "16:30", label: "3:00 PM" },
  { time: "18:00", endTime: "19:30", label: "6:00 PM" },
];

const EMPTY_EDITOR: SlotEditorState = {
  subject: "",
  focus: "",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getMondayOfCurrentWeek(date = new Date()) {
  const nextDate = new Date(date);
  const dayNumber = nextDate.getDay();
  const diff = dayNumber === 0 ? -6 : 1 - dayNumber;

  nextDate.setDate(nextDate.getDate() + diff);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

function buildDayMeta(date = new Date()): DayMeta[] {
  const monday = getMondayOfCurrentWeek(date);

  return WEEK_DAYS.map((day, index) => {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + index);

    return {
      day,
      dateLabel: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(nextDate),
    };
  });
}

function formatWeekLabel(dayMeta: DayMeta[]) {
  if (!dayMeta.length) {
    return "";
  }

  const monday = getMondayOfCurrentWeek(new Date());

  return `Week of ${new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(monday)}`;
}

function getSlotKey(day: DayName, time: string) {
  return `${day}-${time}`;
}

function mapApiTimetableToTimetableMap(entries: ApiTimetableEntry[]) {
  return entries.reduce<TimetableMap>((result, entry) => {
    if (!WEEK_DAYS.includes(entry.day as DayName) || !Array.isArray(entry.slots)) {
      return result;
    }

    entry.slots.forEach((slot) => {
      if (!TIME_SLOTS.some((timeSlot) => timeSlot.time === slot.startTime)) {
        return;
      }

      result[getSlotKey(entry.day as DayName, slot.startTime)] = {
        subjectId: slot.subjectId ?? null,
        subject: slot.subjectName?.trim() || "General",
        focus: slot.title,
      };
    });

    return result;
  }, {});
}

function buildTimetablePayload(timetable: TimetableMap) {
  return {
    timetable: WEEK_DAYS.map((day) => ({
      day,
      slots: TIME_SLOTS.flatMap((slot) => {
        const assignment = timetable[getSlotKey(day, slot.time)];

        if (!assignment) {
          return [];
        }

        return [
          {
            subjectId: assignment.subjectId,
            subject: assignment.subject,
            title: assignment.focus,
            startTime: slot.time,
            endTime: slot.endTime,
          },
        ];
      }),
    })).filter((entry) => entry.slots.length),
  };
}

async function readApiError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

function getSubjectPalette(subject: string) {
  const normalized = subject.toLowerCase();

  if (normalized.includes("math")) {
    return {
      badge: "!border-sky-300 !bg-sky-100 !text-sky-900",
      card: "border-sky-300 bg-gradient-to-br from-sky-50 to-sky-100/50",
      dot: "bg-sky-600",
    };
  }

  if (normalized.includes("physics")) {
    return {
      badge: "!border-emerald-300 !bg-emerald-100 !text-emerald-900",
      card: "border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50",
      dot: "bg-emerald-600",
    };
  }

  if (normalized.includes("chem")) {
    return {
      badge: "!border-amber-300 !bg-amber-100 !text-amber-900",
      card: "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50",
      dot: "bg-amber-500",
    };
  }

  if (normalized.includes("history")) {
    return {
      badge: "!border-violet-300 !bg-violet-100 !text-violet-900",
      card: "border-violet-300 bg-gradient-to-br from-violet-50 to-violet-100/50",
      dot: "bg-violet-600",
    };
  }

  if (normalized.includes("english")) {
    return {
      badge: "!border-rose-300 !bg-rose-100 !text-rose-900",
      card: "border-rose-300 bg-gradient-to-br from-rose-50 to-rose-100/50",
      dot: "bg-rose-500",
    };
  }

  return {
    badge: "!border-sky-300 !bg-sky-100 !text-sky-900",
    card: "border-sky-300 bg-gradient-to-br from-white to-sky-50/40",
    dot: "bg-slate-600",
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

function getStatusDetails(
  message: string,
  defaultTone: StatusTone = "info",
): {
  tone: StatusTone;
  message: string;
  hint?: string;
} {
  if (message === "No subjects found to generate timetable") {
    return {
      tone: "warning",
      message: "Auto-generate needs at least one saved subject.",
      hint:
        "Add subjects with an exam date, priority, and progress first, then try again.",
    };
  }

  if (message === "Unauthorized" || message === "Forbidden") {
    return {
      tone: "error",
      message: "You need to be signed in as a student to manage this timetable.",
      hint: "Refresh the page and sign in again if needed.",
    };
  }

  if (message === "Subject not found") {
    return {
      tone: "warning",
      message: "One of your saved subjects could not be found.",
      hint: "Refresh the page, then reselect the subject and try again.",
    };
  }

  return {
    tone: defaultTone,
    message,
  };
}

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableMap>({});
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>({
    day: "Monday",
    time: "07:30",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editor, setEditor] = useState<SlotEditorState>(EMPTY_EDITOR);
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const [statusMessage, setStatusMessage] = useState(
    "Loading your saved timetable...",
  );
  const [statusHint, setStatusHint] = useState<string | null>(null);
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(true);
  const [isSavingTimetable, setIsSavingTimetable] = useState(false);
  const [isGeneratingTimetable, setIsGeneratingTimetable] = useState(false);

  const dayMeta = useMemo(() => buildDayMeta(), []);
  const weekLabel = useMemo(() => formatWeekLabel(dayMeta), [dayMeta]);

  useEffect(() => {
    let isActive = true;

    const loadTimetable = async () => {
      setIsLoadingTimetable(true);

      try {
        const response = await fetch("/api/timetable", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(
            await readApiError(
              response,
              "Unable to load your timetable right now.",
            ),
          );
        }

        const data = (await response.json()) as {
          timetable?: ApiTimetableEntry[];
        };
        const nextTimetable = Array.isArray(data.timetable)
          ? mapApiTimetableToTimetableMap(data.timetable)
          : {};

        if (!isActive) {
          return;
        }

        setTimetable(nextTimetable);
        updateStatus(
          Object.keys(nextTimetable).length
            ? "success"
            : "info",
          Object.keys(nextTimetable).length
            ? "Your saved timetable is ready."
            : "Your timetable is empty. Click any slot to plan your week.",
          Object.keys(nextTimetable).length
            ? "You can still fine-tune any slot or auto-generate a fresh plan."
            : "You can click any slot manually or use Auto-Generate once your subjects are ready.",
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        const status = getStatusDetails(
          error instanceof Error
            ? error.message
            : "Unable to load your timetable right now.",
          "error",
        );

        updateStatus(status.tone, status.message, status.hint);
      } finally {
        if (isActive) {
          setIsLoadingTimetable(false);
        }
      }
    };

    void loadTimetable();

    return () => {
      isActive = false;
    };
  }, []);

  const assignedEntries = useMemo(
    () => Object.entries(timetable).filter(([, value]) => Boolean(value)),
    [timetable],
  );

  const assignedSlotCount = assignedEntries.length;
  const activeSubjectCount = new Set(
    assignedEntries.map(([, value]) => value?.subject ?? ""),
  ).size;
  const openSlotCount = WEEK_DAYS.length * TIME_SLOTS.length - assignedSlotCount;
  const isBusy = isSavingTimetable || isGeneratingTimetable;

  const subjectBreakdown = useMemo(() => {
    const counts = new Map<string, number>();

    assignedEntries.forEach(([, value]) => {
      if (!value?.subject) {
        return;
      }

      counts.set(value.subject, (counts.get(value.subject) ?? 0) + 1);
    });

    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [assignedEntries]);

  const selectedAssignment = activeSlot
    ? timetable[getSlotKey(activeSlot.day, activeSlot.time)]
    : undefined;

  const updateStatus = (
    tone: StatusTone,
    message: string,
    hint?: string,
  ) => {
    setStatusTone(tone);
    setStatusMessage(message);
    setStatusHint(hint ?? null);
  };

  const persistTimetable = async (
    nextTimetable: TimetableMap,
    successMessage: string,
  ) => {
    setIsSavingTimetable(true);

    try {
      const response = await fetch("/api/timetable", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildTimetablePayload(nextTimetable)),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Unable to save your timetable right now.",
          ),
        );
      }

      const data = (await response.json()) as {
        message?: string;
        timetable?: ApiTimetableEntry[];
      };
      const savedTimetable = Array.isArray(data.timetable)
        ? mapApiTimetableToTimetableMap(data.timetable)
        : nextTimetable;

      setTimetable(savedTimetable);
      updateStatus("success", successMessage);

      return true;
    } catch (error) {
      const status = getStatusDetails(
        error instanceof Error
          ? error.message
          : "Unable to save your timetable right now.",
        "error",
      );

      updateStatus(status.tone, status.message, status.hint);

      return false;
    } finally {
      setIsSavingTimetable(false);
    }
  };

  const openEditor = (day: DayName, time: string) => {
    const existing = timetable[getSlotKey(day, time)];
    const selectedSlot = TIME_SLOTS.find((slot) => slot.time === time);

    setActiveSlot({ day, time });
    setEditor({
      subject: existing?.subject ?? "",
      focus: existing?.focus ?? "",
    });
    setIsModalOpen(true);
    updateStatus(
      "info",
      `Editing ${day} at ${selectedSlot?.label ?? time}.`,
    );
  };

  const closeEditor = () => {
    setIsModalOpen(false);
    setEditor(EMPTY_EDITOR);
  };

  const handleSaveSlot = async () => {
    if (!activeSlot) {
      return;
    }

    const subject = editor.subject.trim();
    const focus = editor.focus.trim();

    if (!subject || !focus) {
      updateStatus(
        "warning",
        "Add both a subject and focus note before saving.",
      );
      return;
    }

    const key = getSlotKey(activeSlot.day, activeSlot.time);
    const previousAssignment = timetable[key];
    const subjectId =
      previousAssignment?.subject &&
      previousAssignment.subject.trim().toLowerCase() === subject.toLowerCase()
        ? previousAssignment.subjectId
        : null;
    const nextTimetable = {
      ...timetable,
      [key]: {
        subjectId,
        subject,
        focus,
      },
    };
    const selectedSlot = TIME_SLOTS.find(
      (slot) => slot.time === activeSlot.time,
    );
    const didSave = await persistTimetable(
      nextTimetable,
      `Saved ${subject} for ${activeSlot.day} at ${selectedSlot?.label ?? activeSlot.time}.`,
    );

    if (didSave) {
      closeEditor();
    }
  };

  const handleClearSlot = async () => {
    if (!activeSlot) {
      return;
    }

    const key = getSlotKey(activeSlot.day, activeSlot.time);
    const nextTimetable = { ...timetable };
    const selectedSlot = TIME_SLOTS.find(
      (slot) => slot.time === activeSlot.time,
    );

    delete nextTimetable[key];

    const didSave = await persistTimetable(
      nextTimetable,
      `Cleared ${activeSlot.day} at ${selectedSlot?.label ?? activeSlot.time}.`,
    );

    if (didSave) {
      closeEditor();
    }
  };

  const handleAutoGenerate = async () => {
    setIsGeneratingTimetable(true);
    updateStatus(
      "info",
      "Generating your timetable...",
      "We are building a study plan from your saved subjects.",
    );

    try {
      const response = await fetch("/api/timetable/generate", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Unable to auto-generate your timetable right now.",
          ),
        );
      }

      const data = (await response.json()) as {
        timetable?: ApiTimetableEntry[];
      };
      const generatedTimetable = Array.isArray(data.timetable)
        ? mapApiTimetableToTimetableMap(data.timetable)
        : {};

      await persistTimetable(
        generatedTimetable,
        "Timetable auto-generated and saved.",
      );
    } catch (error) {
      const status = getStatusDetails(
        error instanceof Error
          ? error.message
          : "Unable to auto-generate your timetable right now.",
        "error",
      );

      updateStatus(status.tone, status.message, status.hint);
    } finally {
      setIsGeneratingTimetable(false);
    }
  };

  const handleOpenSelectedSlot = () => {
    const fallback =
      activeSlot ??
      ({ day: "Monday", time: "07:30" } as ActiveSlot);

    openEditor(fallback.day, fallback.time);
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your timetable..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[38px] border border-white/85 bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_20%,#ecfeff_46%,#eef2ff_74%,#fff8e8_108%)] p-6 shadow-[0_34px_90px_-46px_rgba(56,189,248,0.24)] sm:p-8">
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(37,99,235,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)]" />
          <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-sky-200/28 blur-3xl" />
          <div className="absolute right-10 top-4 h-36 w-36 rounded-full bg-fuchsia-200/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-amber-200/20 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_340px] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/92 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                <BookOpen className="h-4 w-4 text-blue-700" />
                Weekly Revision Plan
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  Study timetable
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  See your whole study week at a glance, assign subjects to each
                  time block, and fine-tune the routine with one clean
                  calendar-style view.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-2xl border border-sky-100/80 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_100%)] px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.2)]">
                  {weekLabel}
                </span>
                <span className="rounded-2xl border border-violet-100/80 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_100%)] px-4 py-2 shadow-[0_14px_30px_-24px_rgba(99,102,241,0.16)]">
                  {assignedSlotCount} slots assigned
                </span>
                <span className="rounded-2xl border border-amber-100/80 bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_100%)] px-4 py-2 shadow-[0_14px_30px_-24px_rgba(245,158,11,0.14)]">
                  {activeSubjectCount} active subjects
                </span>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/88 p-5 shadow-[0_24px_56px_-34px_rgba(37,99,235,0.18)] backdrop-blur-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">
                Revision Snapshot
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-[22px] border border-sky-100/80 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_100%)] px-4 py-3 shadow-[0_16px_34px_-24px_rgba(37,99,235,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Assigned Blocks
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {assignedSlotCount} sessions planned
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-violet-100/80 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_100%)] px-4 py-3 shadow-[0_16px_34px_-24px_rgba(99,102,241,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b5cf6_0%,#2563eb_100%)] text-white">
                      <Clock3 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Open Slots
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {openSlotCount} spaces still free
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-emerald-100/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_100%)] px-4 py-3 shadow-[0_16px_34px_-24px_rgba(16,185,129,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10b981_0%,#14b8a6_100%)] text-white">
                      <Target className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Top Subject
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {subjectBreakdown[0]
                          ? `${subjectBreakdown[0][0]} · ${subjectBreakdown[0][1]} blocks`
                          : "No focus blocks yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="mt-4 rounded-[22px] border px-4 py-3 shadow-sm" type={statusTone}>
                <div className="space-y-1">
                  <p className="font-medium">{statusMessage}</p>
                  {statusHint ? <p>{statusHint}</p> : null}
                </div>
              </Alert>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-11 flex-1 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_42%,#7c3aed_72%,#ec4899_100%)] px-5 text-white shadow-[0_20px_40px_-22px_rgba(99,102,241,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                  disabled={isBusy || isLoadingTimetable}
                  onClick={handleAutoGenerate}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGeneratingTimetable ? "Generating..." : "Auto-Generate"}
                </Button>
                <Button
                  className="h-11 flex-1 rounded-2xl border border-white/90 bg-white/92 px-5 text-sky-700 shadow-[0_16px_34px_-24px_rgba(56,189,248,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-50"
                  disabled={isBusy || isLoadingTimetable}
                  onClick={handleOpenSelectedSlot}
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit Slot
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.22fr_0.78fr]">
          <SectionCard
            description="A weekly grid that maps each study block to a subject. Click any cell to assign or edit it."
            title="Weekly Grid View"
          >
            <div className="hidden overflow-x-auto lg:block">
              <div className="min-w-[920px] space-y-3">
                <div className="grid grid-cols-[110px_repeat(5,minmax(0,1fr))] gap-3">
                  <div />
                  {dayMeta.map((dayMetaItem) => (
                    <div
                      className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4"
                      key={dayMetaItem.day}
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {dayMetaItem.day}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {dayMetaItem.dateLabel}
                      </p>
                    </div>
                  ))}
                </div>

                {TIME_SLOTS.map((slot) => (
                  <div
                    className="grid grid-cols-[110px_repeat(5,minmax(0,1fr))] gap-3"
                    key={slot.time}
                  >
                    <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                      <p className="text-sm font-semibold text-slate-950">
                        {slot.label}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                        Focus block
                      </p>
                    </div>

                    {dayMeta.map((dayMetaItem) => {
                      const assignment =
                        timetable[getSlotKey(dayMetaItem.day, slot.time)];
                      const palette = assignment
                        ? getSubjectPalette(assignment.subject)
                        : null;
                      const isSelected =
                        activeSlot?.day === dayMetaItem.day &&
                        activeSlot?.time === slot.time;

                      return (
                        <button
                          className={cn(
                            "min-h-[146px] rounded-[24px] border p-4 text-left transition",
                            assignment
                              ? palette?.card
                              : "border-dashed border-sky-100 bg-white hover:border-sky-200 hover:bg-sky-50/70",
                            isSelected &&
                              "ring-4 ring-sky-100 ring-offset-0",
                          )}
                          key={dayMetaItem.day}
                          onClick={() => openEditor(dayMetaItem.day, slot.time)}
                          type="button"
                        >
                          {assignment ? (
                            <div className="flex h-full flex-col">
                              <div className="flex items-start justify-between gap-3">
                                <span
                                  className={cn(
                                    "inline-flex h-9 w-9 items-center justify-center rounded-2xl text-white",
                                    palette?.dot,
                                  )}
                                >
                                  <BookOpen className="h-4 w-4" />
                                </span>
                                <Badge
                                  className={cn(
                                    "border px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                                    palette?.badge,
                                  )}
                                >
                                  {assignment.subject}
                                </Badge>
                              </div>
                              <p className="mt-4 text-sm font-semibold text-slate-950">
                                {assignment.focus}
                              </p>
                              <div className="mt-auto flex items-center gap-2 pt-4 text-xs font-medium text-slate-500">
                                <Clock3 className="h-3.5 w-3.5" />
                                {slot.label}
                              </div>
                            </div>
                          ) : (
                            <div className="flex h-full flex-col items-start justify-between">
                              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
                                <Plus className="h-4 w-4" />
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  Add subject
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  Assign a study block for this slot.
                                </p>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 lg:hidden">
              {dayMeta.map((dayMetaItem) => (
                <div
                  className="rounded-[26px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4"
                  key={dayMetaItem.day}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-950">
                        {dayMetaItem.day}
                      </p>
                      <p className="text-sm text-slate-500">
                        {dayMetaItem.dateLabel}
                      </p>
                    </div>
                    <Badge className="!border-sky-300 !bg-sky-100 !text-sky-900 border px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                      Day View
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {TIME_SLOTS.map((slot) => {
                      const assignment =
                        timetable[getSlotKey(dayMetaItem.day, slot.time)];
                      const palette = assignment
                        ? getSubjectPalette(assignment.subject)
                        : null;

                      return (
                        <button
                          className={cn(
                            "flex w-full items-start gap-3 rounded-[22px] border p-4 text-left transition",
                            assignment
                              ? palette?.card
                              : "border-dashed border-slate-200 bg-white hover:border-sky-200",
                          )} 
                          key={slot.time}
                          onClick={() => openEditor(dayMetaItem.day, slot.time)}
                          type="button"
                        >
                          <div className="w-20 shrink-0">
                            <p className="text-sm font-semibold text-slate-900">
                              {slot.label}
                            </p>
                          </div>
                          <div className="min-w-0 flex-1">
                            {assignment ? (
                              <>
                                <p className="text-sm font-semibold text-slate-950">
                                  {assignment.subject}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                  {assignment.focus}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-slate-800">
                                  Empty slot
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  Tap to assign a subject.
                                </p>
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              description="Preview the selected time block and make quick decisions about how to use it."
              title="Selected Slot"
            >
              {activeSlot ? (
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {activeSlot.day}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                          {TIME_SLOTS.find((slot) => slot.time === activeSlot.time)?.label}
                        </p>
                      </div>
                      <Button
                        className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                        disabled={isBusy || isLoadingTimetable}
                        onClick={handleOpenSelectedSlot}
                        variant="outline"
                      >
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>

                    {selectedAssignment ? (
                      <div className="mt-5 rounded-[22px] border border-sky-100 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-950">
                          {selectedAssignment.subject}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {selectedAssignment.focus}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          This slot is open
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Use it for revision, rest, or a catch-up session.
                        </p>
                      </div>
                    )}
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
              ) : null}
            </SectionCard>

            <SectionCard
              description="A quick breakdown of which subjects currently dominate the week."
              title="Subject Balance"
            >
              <div className="space-y-4">
                {subjectBreakdown.length ? (
                  subjectBreakdown.map(([subject, count]) => {
                    const palette = getSubjectPalette(subject);

                    return (
                      <div
                        className="flex items-center justify-between rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4"
                        key={subject}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "h-3.5 w-3.5 rounded-full",
                              palette.dot,
                            )}
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {subject}
                            </p>
                            <p className="text-sm text-slate-500">
                              {count} weekly block{count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "border-transparent px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                            palette.badge,
                          )}
                        >
                          {Math.round((count / assignedSlotCount) * 100)}%
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                    No subjects are assigned yet. Add a few blocks to see your
                    weekly balance.
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        {isModalOpen && activeSlot ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
            <div className="w-full max-w-2xl rounded-[32px] border border-sky-100 bg-white shadow-[0_32px_80px_-34px_rgba(56,189,248,0.22)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Edit Timetable Slot
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeSlot.day} at{" "}
                    {TIME_SLOTS.find((slot) => slot.time === activeSlot.time)?.label}
                  </p>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                  onClick={closeEditor}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-6">
                <Field htmlFor="slot-subject" label="Subject">
                  <input
                    className={inputClassName}
                    id="slot-subject"
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                    placeholder="Mathematics"
                    value={editor.subject}
                  />
                </Field>

                <Field htmlFor="slot-focus" label="Focus for this block">
                  <textarea
                    className={textareaClassName}
                    id="slot-focus"
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        focus: event.target.value,
                      }))
                    }
                    placeholder="Past paper practice, chapter revision, flashcards, or essay planning"
                    rows={5}
                    value={editor.focus}
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  Save a subject assignment or clear the slot if you want it open.
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="h-11 rounded-2xl border border-rose-200 bg-rose-50 px-5 text-rose-700 hover:bg-rose-100"
                    disabled={isBusy}
                    onClick={handleClearSlot}
                    variant="outline"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Slot
                  </Button>
                  <Button
                    className="h-11 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    disabled={isBusy}
                    onClick={closeEditor}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    disabled={isBusy}
                    onClick={handleSaveSlot}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingTimetable ? "Saving..." : "Save Slot"}
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






