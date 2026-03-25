"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Megaphone,
  PencilLine,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { mentorSidebarLinks } from "@/data/sidebarLinks";
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

type AnnouncementStatus = "Sent" | "Scheduled" | "Draft";
type AnnouncementPriority = "High" | "Standard" | "Low";
type ModalMode = "create" | "edit" | null;

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  audience: string;
  scheduleTime: string;
  deliveryLabel: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  audienceCount: number;
  views: number;
  pendingReads: number;
  sentToday: boolean;
}

interface AnnouncementDraft {
  title: string;
  message: string;
  audience: string;
  scheduleTime: string;
  priority: AnnouncementPriority;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "announcement-01",
    title: "Weekend focus sprint opens at 8 AM",
    message:
      "A fresh weekend sprint is ready for all assigned students with short revision blocks, one checkpoint quiz, and a guided recap session to keep momentum high before the next milestone.",
    audience: "All assigned students",
    scheduleTime: "",
    deliveryLabel: "Today, 8:15 AM",
    status: "Sent",
    priority: "High",
    audienceCount: 96,
    views: 142,
    pendingReads: 18,
    sentToday: true,
  },
  {
    id: "announcement-02",
    title: "Physics doubt clinic goes live tonight",
    message:
      "Students in the physics cohort can join the live doubt clinic tonight for a focused walkthrough of mechanics problem areas and a short Q&A block after the session.",
    audience: "Physics cohort (31)",
    scheduleTime: "2026-03-24T19:30",
    deliveryLabel: "Mar 24, 7:30 PM",
    status: "Scheduled",
    priority: "Standard",
    audienceCount: 31,
    views: 0,
    pendingReads: 31,
    sentToday: false,
  },
  {
    id: "announcement-03",
    title: "New organic chemistry notes uploaded",
    message:
      "The revised organic chemistry notes now include reaction pathways, reagent memory cues, and worked examples for common mechanism questions across the current module.",
    audience: "Chemistry cohort (42)",
    scheduleTime: "",
    deliveryLabel: "Yesterday, 4:20 PM",
    status: "Sent",
    priority: "Standard",
    audienceCount: 42,
    views: 58,
    pendingReads: 9,
    sentToday: false,
  },
  {
    id: "announcement-04",
    title: "Essay rubric update for writing improvement group",
    message:
      "This update explains the refined rubric criteria for thesis clarity, paragraph flow, and evidence use so students can adjust their next timed writing submission.",
    audience: "Writing improvement group",
    scheduleTime: "",
    deliveryLabel: "Draft not scheduled",
    status: "Draft",
    priority: "Low",
    audienceCount: 18,
    views: 0,
    pendingReads: 18,
    sentToday: false,
  },
  {
    id: "announcement-05",
    title: "Monthly mentor office hours reminder",
    message:
      "Office hours remain open this Friday for study planning, revision strategy check-ins, and short individual mentoring conversations for learners who need support.",
    audience: "All assigned students",
    scheduleTime: "",
    deliveryLabel: "2 days ago, 9:00 AM",
    status: "Sent",
    priority: "High",
    audienceCount: 96,
    views: 121,
    pendingReads: 24,
    sentToday: false,
  },
  {
    id: "announcement-06",
    title: "Algebra rapid revision quiz reminder",
    message:
      "A quick reminder is queued for the algebra group so they complete the rapid revision quiz before the review discussion and identify any final weak points.",
    audience: "Grade 11 algebra group",
    scheduleTime: "2026-03-25T18:00",
    deliveryLabel: "Mar 25, 6:00 PM",
    status: "Scheduled",
    priority: "High",
    audienceCount: 28,
    views: 0,
    pendingReads: 28,
    sentToday: false,
  },
];

const EMPTY_DRAFT: AnnouncementDraft = {
  title: "",
  message: "",
  audience: "All assigned students",
  scheduleTime: "",
  priority: "Standard",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const SURFACE_CARD_CLASS_NAME =
  "rounded-[30px] border border-slate-200/90 bg-white/95 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.16)] backdrop-blur-sm dark:!border-slate-200 dark:!bg-white dark:!text-slate-950";

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
            <CardTitle className="text-xl text-slate-950 dark:!text-slate-950">{title}</CardTitle>
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:!text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:!text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:!text-slate-500">{detail}</p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_14px_28px_-16px_rgba(15,23,42,0.4)]",
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

function InsightMetric({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/90 bg-white/92 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)]">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-[0_16px_26px_-18px_rgba(37,99,235,0.44)]">
        {icon}
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function statusBadgeClass(status: AnnouncementStatus) {
  if (status === "Sent") return "border-transparent bg-emerald-100 text-emerald-700";
  if (status === "Scheduled") return "border-transparent bg-amber-100 text-amber-700";
  return "border-transparent bg-slate-200 text-slate-700";
}

function priorityBadgeClass(priority: AnnouncementPriority) {
  if (priority === "High") return "border-transparent bg-rose-100 text-rose-700";
  if (priority === "Standard") return "border-transparent bg-sky-100 text-sky-700";
  return "border-transparent bg-slate-200 text-slate-700";
}

function previewMessage(message: string) {
  return message.length <= 118 ? message : `${message.slice(0, 115)}...`;
}

function audienceEstimateFor(audience: string) {
  const value = audience.toLowerCase();

  if (value.includes("all")) return 96;
  if (value.includes("chemistry")) return 42;
  if (value.includes("physics")) return 31;
  if (value.includes("algebra")) return 28;
  if (value.includes("writing")) return 18;
  if (value.includes("biology")) return 24;

  return 24;
}

function getReadRate(item: AnnouncementItem) {
  if (!item.audienceCount) return 0;

  return Math.round(
    ((item.audienceCount - item.pendingReads) / item.audienceCount) * 100,
  );
}

function buildDefaultScheduleTime() {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(18, 0, 0, 0);

  const year = next.getFullYear();
  const month = `${next.getMonth() + 1}`.padStart(2, "0");
  const day = `${next.getDate()}`.padStart(2, "0");
  const hour = `${next.getHours()}`.padStart(2, "0");
  const minute = `${next.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function formatScheduleLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function MentorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(
    INITIAL_ANNOUNCEMENTS[0]?.id ?? "",
  );
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AnnouncementDraft>(EMPTY_DRAFT);
  const [statusMessage, setStatusMessage] = useState(
    "Select an announcement to review delivery status, audience reach, and engagement.",
  );

  const selectedAnnouncement =
    announcements.find((item) => item.id === selectedAnnouncementId) ??
    announcements[0] ??
    null;

  const sentAnnouncements = useMemo(
    () => announcements.filter((item) => item.status === "Sent"),
    [announcements],
  );
  const totalAnnouncements = announcements.length;
  const sentToday = announcements.filter(
    (item) => item.status === "Sent" && item.sentToday,
  ).length;
  const scheduledCount = announcements.filter(
    (item) => item.status === "Scheduled",
  ).length;
  const unreadByStudents = sentAnnouncements.reduce(
    (sum, item) => sum + item.pendingReads,
    0,
  );

  const overallReadRate = useMemo(() => {
    const totalAudience = sentAnnouncements.reduce(
      (sum, item) => sum + item.audienceCount,
      0,
    );
    const totalRead = sentAnnouncements.reduce(
      (sum, item) => sum + (item.audienceCount - item.pendingReads),
      0,
    );

    return totalAudience ? Math.round((totalRead / totalAudience) * 100) : 0;
  }, [sentAnnouncements]);

  const mostViewedAnnouncement = useMemo(
    () => [...sentAnnouncements].sort((a, b) => b.views - a.views)[0] ?? null,
    [sentAnnouncements],
  );

  const engagementItems = useMemo(
    () =>
      [...sentAnnouncements]
        .sort((a, b) => getReadRate(b) - getReadRate(a))
        .slice(0, 3),
    [sentAnnouncements],
  );

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setStatusMessage("Draft a new mentor announcement for your learners.");
  };

  const openEditModal = (item: AnnouncementItem) => {
    setModalMode("edit");
    setEditingId(item.id);
    setSelectedAnnouncementId(item.id);
    setDraft({
      title: item.title,
      message: item.message,
      audience: item.audience,
      scheduleTime: item.scheduleTime,
      priority: item.priority,
    });
    setStatusMessage(`Editing ${item.title}.`);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  };

  const handleView = (id: string) => {
    const item = announcements.find((announcement) => announcement.id === id);
    if (!item) return;
    setSelectedAnnouncementId(id);
    setStatusMessage(`Opened ${item.title}.`);
  };

  const handleSaveAnnouncement = () => {
    const title = draft.title.trim();
    const message = draft.message.trim();
    const audience = draft.audience.trim();

    if (!title || !message || !audience) {
      setStatusMessage(
        "Add a title, message, and target audience before saving the announcement.",
      );
      return;
    }

    const scheduleTime = draft.scheduleTime.trim();
    const isScheduled =
      Boolean(scheduleTime) && new Date(scheduleTime).getTime() > Date.now();
    const nextStatus: AnnouncementStatus = isScheduled ? "Scheduled" : "Sent";
    const deliveryLabel = isScheduled
      ? formatScheduleLabel(scheduleTime)
      : "Just now";
    const audienceCount = audienceEstimateFor(audience);

    if (modalMode === "edit" && editingId) {
      const currentItem = announcements.find((item) => item.id === editingId);
      if (!currentItem) return;
      const preserveDeliveryMetrics =
        currentItem.status === "Sent" &&
        !scheduleTime &&
        audienceCount === currentItem.audienceCount;

      const nextPendingReads =
        nextStatus === "Scheduled"
          ? audienceCount
          : preserveDeliveryMetrics
            ? currentItem.pendingReads
            : Math.max(0, Math.round(audienceCount * 0.2));

      const nextViews =
        nextStatus === "Scheduled"
          ? 0
          : preserveDeliveryMetrics
            ? currentItem.views
            : Math.round((audienceCount - nextPendingReads) * 1.28);

      setAnnouncements((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title,
                message,
                audience,
                scheduleTime,
                deliveryLabel,
                status: nextStatus,
                priority: draft.priority,
                audienceCount,
                pendingReads: nextPendingReads,
                views: nextViews,
                sentToday: !isScheduled,
              }
            : item,
        ),
      );
      setStatusMessage(
        isScheduled ? `Scheduled ${title}.` : `Updated and sent ${title}.`,
      );
      closeModal();
      return;
    }

    const pendingReads = isScheduled
      ? audienceCount
      : Math.max(0, Math.round(audienceCount * 0.22));
    const views = isScheduled
      ? 0
      : Math.round((audienceCount - pendingReads) * 1.32);

    const newAnnouncement: AnnouncementItem = {
      id: `announcement-${Date.now()}`,
      title,
      message,
      audience,
      scheduleTime,
      deliveryLabel,
      status: nextStatus,
      priority: draft.priority,
      audienceCount,
      views,
      pendingReads,
      sentToday: !isScheduled,
    };

    setAnnouncements((current) => [newAnnouncement, ...current]);
    setSelectedAnnouncementId(newAnnouncement.id);
    setStatusMessage(isScheduled ? `Scheduled ${title}.` : `Sent ${title}.`);
    closeModal();
  };

  const handleSchedule = (id: string) => {
    const item = announcements.find((announcement) => announcement.id === id);
    if (!item) return;

    const scheduleTime = item.scheduleTime || buildDefaultScheduleTime();
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === id
          ? {
              ...announcement,
              scheduleTime,
              deliveryLabel: formatScheduleLabel(scheduleTime),
              status: "Scheduled",
              pendingReads: announcement.audienceCount,
              views: 0,
              sentToday: false,
            }
          : announcement,
      ),
    );
    setSelectedAnnouncementId(id);
    setStatusMessage(`Scheduled ${item.title} for delivery.`);
  };

  const handleResend = (id: string) => {
    const item = announcements.find((announcement) => announcement.id === id);
    if (!item) return;

    const pendingReads = Math.max(0, Math.round(item.audienceCount * 0.16));
    const views = Math.max(
      item.views,
      Math.round((item.audienceCount - pendingReads) * 1.35),
    );

    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === id
          ? {
              ...announcement,
              scheduleTime: "",
              deliveryLabel: "Just now",
              status: "Sent",
              pendingReads,
              views,
              sentToday: true,
            }
          : announcement,
      ),
    );
    setSelectedAnnouncementId(id);
    setStatusMessage(`Resent ${item.title}.`);
  };

  const handleDelete = (id: string) => {
    const item = announcements.find((announcement) => announcement.id === id);
    setAnnouncements((current) =>
      current.filter((announcement) => announcement.id !== id),
    );
    if (item) {
      setStatusMessage(`${item.title} removed from announcements.`);
    }
  };

  return (
    <ProtectedDashboardLayout
      role="mentor"
      links={mentorSidebarLinks}
      loadingMessage="Loading your announcements workspace..."
    >
      <div className="mx-auto max-w-[1600px] space-y-8 pb-8 text-slate-950">
        <Card className="relative overflow-hidden rounded-[34px] border border-sky-100 bg-transparent text-slate-950 shadow-[0_30px_100px_-48px_rgba(15,23,42,0.24)] dark:!border-sky-100 dark:!bg-transparent dark:!text-slate-950">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(14, 165, 233, 0.2), transparent 24%), radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.16), transparent 24%), radial-gradient(circle at 70% 85%, rgba(245, 158, 11, 0.12), transparent 18%), linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.98) 48%, rgba(236, 253, 245, 0.98) 100%)",
            }}
          />
          <CardContent className="relative p-8 md:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-5">
                <Badge className="rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm dark:!border-sky-200 dark:!bg-white dark:!text-sky-700">
                  <Megaphone className="mr-2 h-3.5 w-3.5" />
                  Mentor communication hub
                </Badge>
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:!text-slate-950">
                    Announcements
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base dark:!text-slate-600">
                    Broadcast timely updates, schedule reminders, and keep your
                    StudyFlow AI learners aligned with a polished mentor
                    communication panel.
                  </p>
                </div>
              </div>

              <Button
                className={cn("h-12 rounded-2xl px-5 text-sm font-semibold shadow-[0_18px_35px_-18px_rgba(2,132,199,0.45)]", PRIMARY_BUTTON_CLASS_NAME)}
                onClick={openCreateModal}
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Announcement
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            accentClassName="from-indigo-700 to-sky-600"
            detail="Announcements across sent, scheduled, and draft updates"
            icon={<Megaphone className="h-5 w-5" />}
            label="Total Announcements"
            value={`${totalAnnouncements}`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Updates delivered to learners in the current day"
            icon={<Send className="h-5 w-5" />}
            label="Sent Today"
            value={`${sentToday}`}
          />
          <SummaryCard
            accentClassName="from-amber-500 to-orange-500"
            detail="Messages queued for a future send window"
            icon={<Clock3 className="h-5 w-5" />}
            label="Scheduled"
            value={`${scheduledCount}`}
          />
          <SummaryCard
            accentClassName="from-rose-600 to-pink-500"
            detail="Students who have not opened assigned announcements yet"
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Unread By Students"
            value={`${unreadByStudents}`}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
          <SectionCard
            action={
              <Badge className="border-transparent bg-sky-100 text-sky-700">
                {announcements.length} active items
              </Badge>
            }
            description="Review live announcements, scheduled reminders, and draft communication updates from one clean mentor workspace."
            title="Announcements Queue"
          >
            <div className="hidden xl:block">
              <div className="grid grid-cols-[1.65fr_1.1fr_0.95fr_0.8fr_1.8fr] gap-4 border-b border-slate-200 px-2 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Title</span>
                <span>Audience</span>
                <span>Date / Time</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              <div className="mt-4 space-y-3">
                {announcements.map((item) => (
                  <div
                    className={cn(
                      "grid grid-cols-[1.65fr_1.1fr_0.95fr_0.8fr_1.8fr] items-start gap-4 rounded-[24px] border p-4 transition",
                      selectedAnnouncement?.id === item.id
                        ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
                    )}
                    key={item.id}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-950">
                          {item.title}
                        </p>
                        <Badge className={priorityBadgeClass(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {previewMessage(item.message)}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Users className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {item.audience}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.audienceCount} recipients
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.deliveryLabel}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.status === "Scheduled"
                          ? "Upcoming send"
                          : item.status === "Draft"
                            ? "Awaiting review"
                            : "Already delivered"}
                      </p>
                    </div>
                    <Badge className={statusBadgeClass(item.status)}>
                      {item.status}
                    </Badge>
                    <div className="flex flex-wrap gap-2">
                      <Button className={cn("h-9 rounded-2xl px-3", PRIMARY_BUTTON_CLASS_NAME)} onClick={() => handleView(item.id)} type="button">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => openEditModal(item)} type="button" variant="outline">
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => handleSchedule(item.id)} type="button" variant="outline">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Schedule
                      </Button>
                      <Button className="h-9 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 text-emerald-700 hover:bg-emerald-100" onClick={() => handleResend(item.id)} type="button" variant="outline">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Resend
                      </Button>
                      <Button className="h-9 rounded-2xl border border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100" onClick={() => handleDelete(item.id)} type="button" variant="outline">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 xl:hidden">
              {announcements.map((item) => (
                <div
                  className={cn(
                    "rounded-[26px] border p-5 transition",
                    selectedAnnouncement?.id === item.id
                      ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
                  )}
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-950">
                          {item.title}
                        </p>
                        <Badge className={priorityBadgeClass(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {previewMessage(item.message)}
                      </p>
                    </div>
                    <Badge className={statusBadgeClass(item.status)}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Audience
                      </p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {item.audience}
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Date / Time
                      </p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {item.deliveryLabel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className={cn("h-9 rounded-2xl px-3", PRIMARY_BUTTON_CLASS_NAME)} onClick={() => handleView(item.id)} type="button">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => openEditModal(item)} type="button" variant="outline">
                      Edit
                    </Button>
                    <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => handleSchedule(item.id)} type="button" variant="outline">
                      Schedule
                    </Button>
                    <Button className="h-9 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 text-emerald-700 hover:bg-emerald-100" onClick={() => handleResend(item.id)} type="button" variant="outline">
                      Resend
                    </Button>
                    <Button className="h-9 rounded-2xl border border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100" onClick={() => handleDelete(item.id)} type="button" variant="outline">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              description="Review the selected announcement, audience, delivery timing, and current student reach before taking action."
              title="Announcement Preview"
            >
              {selectedAnnouncement ? (
                <div className="space-y-5">
                  <div className="rounded-[24px] border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-700">
                    {statusMessage}
                  </div>

                  <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-950">
                        {selectedAnnouncement.title}
                      </h2>
                      <Badge className={statusBadgeClass(selectedAnnouncement.status)}>
                        {selectedAnnouncement.status}
                      </Badge>
                      <Badge className={priorityBadgeClass(selectedAnnouncement.priority)}>
                        {selectedAnnouncement.priority}
                      </Badge>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {selectedAnnouncement.message}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Target Audience</p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">{selectedAnnouncement.audience}</p>
                      <p className="mt-2 text-sm text-slate-500">{selectedAnnouncement.audienceCount} recipients in this send group</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Delivery Window</p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">{selectedAnnouncement.deliveryLabel}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {selectedAnnouncement.status === "Scheduled"
                          ? "Ready for future delivery"
                          : selectedAnnouncement.status === "Draft"
                            ? "Needs a send plan"
                            : "Already pushed to students"}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Read Rate</p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">{getReadRate(selectedAnnouncement)}%</p>
                      <Progress className="mt-4 h-2.5 bg-slate-100" value={getReadRate(selectedAnnouncement)} />
                    </div>
                    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pending Reads</p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">{selectedAnnouncement.pendingReads} learners</p>
                      <p className="mt-2 text-sm text-slate-500">{selectedAnnouncement.views} total views tracked on this update</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button className={cn("h-10 rounded-2xl px-4", PRIMARY_BUTTON_CLASS_NAME)} onClick={() => openEditModal(selectedAnnouncement)} type="button">
                      <PencilLine className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button className={cn("h-10 rounded-2xl px-4", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => handleSchedule(selectedAnnouncement.id)} type="button" variant="outline">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                    <Button className="h-10 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-emerald-700 hover:bg-emerald-100" onClick={() => handleResend(selectedAnnouncement.id)} type="button" variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Resend
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  No announcements available yet. Create your first update to
                  start the communication stream.
                </div>
              )}
            </SectionCard>

            <SectionCard
              description="Track read coverage, highlight high-performing announcements, and follow up where student attention is still pending."
              title="Recent Engagement"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <InsightMetric detail="Weighted across sent and scheduled communication items." icon={<BarChart3 className="h-5 w-5" />} label="Read Rate" value={`${overallReadRate}%`} />
                <InsightMetric detail={mostViewedAnnouncement ? `${mostViewedAnnouncement.title}` : "No announcement views tracked yet."} icon={<Eye className="h-5 w-5" />} label="Most Viewed" value={mostViewedAnnouncement ? `${mostViewedAnnouncement.views} views` : "0 views"} />
                <InsightMetric detail="Students who still have unread announcement items assigned." icon={<CheckCircle2 className="h-5 w-5" />} label="Pending Reads" value={`${unreadByStudents}`} />
              </div>

              <div className="mt-6 space-y-4">
                {engagementItems.map((item) => (
                  <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm" key={item.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                          <Badge className={statusBadgeClass(item.status)}>{item.status}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">{item.audience}</p>
                      </div>
                      <div className="text-sm text-slate-500">{item.views} views</div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600">Read coverage</span>
                        <span className="font-semibold text-slate-950">{getReadRate(item)}%</span>
                      </div>
                      <Progress className="h-2.5 bg-slate-100" value={getReadRate(item)} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                      <span>{item.pendingReads} pending reads</span>
                      <span>{item.deliveryLabel}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#e0f2fe_120%)] p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Engagement insight</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      High-priority reminders sent to narrower cohorts are earning the fastest reads. Scheduled reminders are still carrying the largest unread balance, so the next best follow-up is a short resend after the live session window.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-3xl rounded-[32px] border-slate-200/80 bg-white shadow-[0_35px_120px_-40px_rgba(15,23,42,0.45)]">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-slate-950">
                    {modalMode === "create"
                      ? "Create Announcement"
                      : "Edit Announcement"}
                  </CardTitle>
                  <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Write a clean update for your students, set audience reach,
                    and choose whether it should be sent now or scheduled.
                  </CardDescription>
                </div>
                <Button
                  className={cn("h-10 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)}
                  onClick={closeModal}
                  type="button"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="announcement-title"
                  >
                    Title
                  </label>
                  <input
                    className={inputClassName}
                    id="announcement-title"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    type="text"
                    value={draft.title}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="announcement-audience"
                  >
                    Audience
                  </label>
                  <input
                    className={inputClassName}
                    id="announcement-audience"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        audience: event.target.value,
                      }))
                    }
                    type="text"
                    value={draft.audience}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="announcement-message"
                >
                  Message
                </label>
                <textarea
                  className={textareaClassName}
                  id="announcement-message"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  value={draft.message}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="announcement-schedule"
                  >
                    Schedule Time
                  </label>
                  <input
                    className={inputClassName}
                    id="announcement-schedule"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        scheduleTime: event.target.value,
                      }))
                    }
                    type="datetime-local"
                    value={draft.scheduleTime}
                  />
                  <p className="text-xs text-slate-500">
                    Leave the schedule empty to send the announcement
                    immediately when saved.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="announcement-priority"
                  >
                    Priority
                  </label>
                  <select
                    className={inputClassName}
                    id="announcement-priority"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        priority: event.target.value as AnnouncementPriority,
                      }))
                    }
                    value={draft.priority}
                  >
                    <option value="High">High</option>
                    <option value="Standard">Standard</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/90 bg-white/92 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)]">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-[0_16px_26px_-18px_rgba(37,99,235,0.44)]">
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Estimated reach
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      This audience selection is estimated to reach{" "}
                      {audienceEstimateFor(draft.audience)} students based on the
                      current dummy cohort size used in the mentor workspace.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button
                  className={cn("h-11 rounded-2xl px-5", SECONDARY_BUTTON_CLASS_NAME)}
                  onClick={closeModal}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className={cn("h-11 rounded-2xl px-5", PRIMARY_BUTTON_CLASS_NAME)}
                  onClick={handleSaveAnnouncement}
                  type="button"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {modalMode === "create" ? "Save Announcement" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </ProtectedDashboardLayout>
  );
}
