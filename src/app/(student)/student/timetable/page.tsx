"use client";

import { useMemo, useState } from "react";
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
  label: string;
}

interface SlotAssignment {
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

type TimetableMap = Partial<Record<string, SlotAssignment>>;

const DAY_META: DayMeta[] = [
  { day: "Monday", dateLabel: "Mar 23" },
  { day: "Tuesday", dateLabel: "Mar 24" },
  { day: "Wednesday", dateLabel: "Mar 25" },
  { day: "Thursday", dateLabel: "Mar 26" },
  { day: "Friday", dateLabel: "Mar 27" },
];

const TIME_SLOTS: TimeSlot[] = [
  { time: "07:30", label: "7:30 AM" },
  { time: "09:30", label: "9:30 AM" },
  { time: "12:00", label: "12:00 PM" },
  { time: "15:00", label: "3:00 PM" },
  { time: "18:00", label: "6:00 PM" },
];

const AUTO_TIMETABLE: TimetableMap = {
  "Monday-07:30": {
    subject: "Mathematics",
    focus: "Calculus revision and timed problem solving",
  },
  "Monday-15:00": {
    subject: "Physics",
    focus: "Mechanics practice and formula review",
  },
  "Monday-18:00": {
    subject: "Chemistry",
    focus: "Reaction pathways and flashcard recall",
  },
  "Tuesday-09:30": {
    subject: "English",
    focus: "Essay planning and reading comprehension",
  },
  "Tuesday-15:00": {
    subject: "Mathematics",
    focus: "Differentiation drills and mistake review",
  },
  "Tuesday-18:00": {
    subject: "Physics",
    focus: "Lab preparation and concept reinforcement",
  },
  "Wednesday-07:30": {
    subject: "History",
    focus: "Timeline recall and summary writing",
  },
  "Wednesday-12:00": {
    subject: "Chemistry",
    focus: "Organic chemistry chapter review",
  },
  "Wednesday-18:00": {
    subject: "Mathematics",
    focus: "Past paper practice set",
  },
  "Thursday-09:30": {
    subject: "Physics",
    focus: "Checkpoint quiz and error analysis",
  },
  "Thursday-15:00": {
    subject: "English",
    focus: "Revision notes and vocabulary review",
  },
  "Friday-07:30": {
    subject: "Biology",
    focus: "Diagram labeling and quick concept review",
  },
  "Friday-12:00": {
    subject: "History",
    focus: "Essay structure outline and evidence recall",
  },
  "Friday-18:00": {
    subject: "Mathematics",
    focus: "Weekly review and weak topic clean-up",
  },
};

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

function getSlotKey(day: DayName, time: string) {
  return `${day}-${time}`;
}

function getSubjectPalette(subject: string) {
  const normalized = subject.toLowerCase();

  if (normalized.includes("math")) {
    return {
      badge: "bg-sky-100 text-sky-700",
      card: "border-sky-200 bg-sky-50/80",
      dot: "bg-sky-600",
    };
  }

  if (normalized.includes("physics")) {
    return {
      badge: "bg-emerald-100 text-emerald-700",
      card: "border-emerald-200 bg-emerald-50/80",
      dot: "bg-emerald-600",
    };
  }

  if (normalized.includes("chem")) {
    return {
      badge: "bg-amber-100 text-amber-700",
      card: "border-amber-200 bg-amber-50/80",
      dot: "bg-amber-500",
    };
  }

  if (normalized.includes("history")) {
    return {
      badge: "bg-violet-100 text-violet-700",
      card: "border-violet-200 bg-violet-50/80",
      dot: "bg-violet-600",
    };
  }

  if (normalized.includes("english")) {
    return {
      badge: "bg-rose-100 text-rose-700",
      card: "border-rose-200 bg-rose-50/80",
      dot: "bg-rose-500",
    };
  }

  return {
    badge: "bg-sky-50 text-sky-700",
    card: "border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)]",
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

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableMap>(AUTO_TIMETABLE);
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>({
    day: "Tuesday",
    time: "15:00",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editor, setEditor] = useState<SlotEditorState>(EMPTY_EDITOR);
  const [statusMessage, setStatusMessage] = useState(
    "Click any slot to edit your weekly study plan.",
  );

  const assignedEntries = useMemo(
    () => Object.entries(timetable).filter(([, value]) => Boolean(value)),
    [timetable],
  );

  const assignedSlotCount = assignedEntries.length;
  const activeSubjectCount = new Set(
    assignedEntries.map(([, value]) => value?.subject ?? ""),
  ).size;
  const openSlotCount = DAY_META.length * TIME_SLOTS.length - assignedSlotCount;

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

  const openEditor = (day: DayName, time: string) => {
    const existing = timetable[getSlotKey(day, time)];

    setActiveSlot({ day, time });
    setEditor({
      subject: existing?.subject ?? "",
      focus: existing?.focus ?? "",
    });
    setIsModalOpen(true);
    setStatusMessage(`Editing ${day} at ${TIME_SLOTS.find((slot) => slot.time === time)?.label ?? time}.`);
  };

  const closeEditor = () => {
    setIsModalOpen(false);
    setEditor(EMPTY_EDITOR);
  };

  const handleSaveSlot = () => {
    if (!activeSlot) {
      return;
    }

    const subject = editor.subject.trim();
    const focus = editor.focus.trim();

    if (!subject || !focus) {
      setStatusMessage("Add both a subject and focus note before saving.");
      return;
    }

    const key = getSlotKey(activeSlot.day, activeSlot.time);

    setTimetable((current) => ({
      ...current,
      [key]: {
        subject,
        focus,
      },
    }));

    setStatusMessage(`Saved ${subject} for ${activeSlot.day} at ${TIME_SLOTS.find((slot) => slot.time === activeSlot.time)?.label ?? activeSlot.time}.`);
    closeEditor();
  };

  const handleClearSlot = () => {
    if (!activeSlot) {
      return;
    }

    const key = getSlotKey(activeSlot.day, activeSlot.time);

    setTimetable((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

    setStatusMessage(`Cleared ${activeSlot.day} at ${TIME_SLOTS.find((slot) => slot.time === activeSlot.time)?.label ?? activeSlot.time}.`);
    closeEditor();
  };

  const handleAutoGenerate = () => {
    setTimetable(AUTO_TIMETABLE);
    setStatusMessage("Timetable auto-generated from your active study subjects.");
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
        <section className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#f3f8ff_36%,#ecfeff_72%,#fefce8_108%)] p-6 shadow-[0_34px_90px_-46px_rgba(56,189,248,0.24)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-sky-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                Weekly Timetable
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Study timetable
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  See your whole study week at a glance, assign subjects to each
                  time block, and fine-tune the routine with one clean calendar-style view.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  Week of March 23, 2026
                </span>
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  {assignedSlotCount} slots assigned
                </span>
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  {activeSubjectCount} active subjects
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                onClick={handleAutoGenerate}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Auto-Generate Timetable
              </Button>
              <Button
                className="h-11 rounded-2xl border border-sky-200 bg-white px-5 text-sky-700 hover:bg-sky-50"
                onClick={handleOpenSelectedSlot}
              >
                <PencilLine className="mr-2 h-4 w-4" />
                Edit Timetable
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            accentClassName="from-sky-600 to-cyan-500"
            detail="Across this weekly calendar"
            icon={<CalendarDays className="h-5 w-5" />}
            label="Assigned Slots"
            value={`${assignedSlotCount}`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Subjects currently in rotation"
            icon={<BookOpen className="h-5 w-5" />}
            label="Active Subjects"
            value={`${activeSubjectCount}`}
          />
          <SummaryCard
            accentClassName="from-indigo-700 to-sky-600"
            detail="Available for rest or catch-up"
            icon={<Target className="h-5 w-5" />}
            label="Open Slots"
            value={`${openSlotCount}`}
          />
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
                  {DAY_META.map((dayMeta) => (
                    <div
                      className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4"
                      key={dayMeta.day}
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {dayMeta.day}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {dayMeta.dateLabel}
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

                    {DAY_META.map((dayMeta) => {
                      const assignment =
                        timetable[getSlotKey(dayMeta.day, slot.time)];
                      const palette = assignment
                        ? getSubjectPalette(assignment.subject)
                        : null;
                      const isSelected =
                        activeSlot?.day === dayMeta.day &&
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
                          key={dayMeta.day}
                          onClick={() => openEditor(dayMeta.day, slot.time)}
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
                                    "border-transparent px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
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
              {DAY_META.map((dayMeta) => (
                <div
                  className="rounded-[26px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4"
                  key={dayMeta.day}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-950">
                        {dayMeta.day}
                      </p>
                      <p className="text-sm text-slate-500">{dayMeta.dateLabel}</p>
                    </div>
                    <Badge className="border-transparent bg-sky-100 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-sky-700">
                      Day View
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {TIME_SLOTS.map((slot) => {
                      const assignment =
                        timetable[getSlotKey(dayMeta.day, slot.time)];
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
                          onClick={() => openEditor(dayMeta.day, slot.time)}
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

                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4 text-sm text-slate-600">
                    {statusMessage}
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              description="A quick breakdown of which subjects currently dominate the week."
              title="Subject Balance"
            >
              <div className="space-y-4">
                {subjectBreakdown.map(([subject, count]) => {
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
                })}
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
                    onClick={handleClearSlot}
                    variant="outline"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Slot
                  </Button>
                  <Button
                    className="h-11 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    onClick={closeEditor}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={handleSaveSlot}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Slot
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






