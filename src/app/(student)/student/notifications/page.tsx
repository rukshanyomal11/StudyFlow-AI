"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BellRing,
  CalendarClock,
  CheckCheck,
  ChevronRight,
  Clock3,
  Filter,
  MessageSquareMore,
  Sparkles,
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

type NotificationType = "Reminder" | "Deadline" | "Mentor Message";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  subject: string;
  timeLabel: string;
  read: boolean;
  priority: "High" | "Medium" | "Low";
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notification-01",
    title: "Planner reminder for physics revision",
    message:
      "Your 6:30 PM physics revision block starts in 25 minutes. Review momentum notes before the session begins.",
    type: "Reminder",
    subject: "Physics",
    timeLabel: "Today, 6:05 PM",
    read: false,
    priority: "Medium",
  },
  {
    id: "notification-02",
    title: "Chemistry quiz deadline tomorrow",
    message:
      "Your chemistry checkpoint quiz is due tomorrow morning. A short review tonight will improve retention before submission.",
    type: "Deadline",
    subject: "Chemistry",
    timeLabel: "Today, 3:20 PM",
    read: false,
    priority: "High",
  },
  {
    id: "notification-03",
    title: "Mentor feedback on your calculus attempt",
    message:
      "Ms. Fernando left feedback on your last derivatives practice set and suggested two questions to revisit before the next session.",
    type: "Mentor Message",
    subject: "Mathematics",
    timeLabel: "Today, 1:45 PM",
    read: true,
    priority: "Medium",
  },
  {
    id: "notification-04",
    title: "History notes review reminder",
    message:
      "Your spaced revision schedule recommends a 15-minute history notes review to keep last week's chapter active.",
    type: "Reminder",
    subject: "History",
    timeLabel: "Yesterday, 8:10 PM",
    read: false,
    priority: "Low",
  },
  {
    id: "notification-05",
    title: "Mentor check-in for group study",
    message:
      "Your mentor asked the study group to confirm who will present the mechanics summary in tomorrow's session.",
    type: "Mentor Message",
    subject: "Physics",
    timeLabel: "Yesterday, 6:40 PM",
    read: false,
    priority: "High",
  },
  {
    id: "notification-06",
    title: "Essay outline deadline updated",
    message:
      "The literature essay outline has moved to Friday. Use the extra time to refine your thesis and examples.",
    type: "Deadline",
    subject: "Literature",
    timeLabel: "Yesterday, 10:30 AM",
    read: true,
    priority: "Medium",
  },
];

function getNotificationStyles(type: NotificationType) {
  if (type === "Deadline") {
    return {
      accentClassName: "from-rose-500 to-orange-500",
      badgeClassName: "!border-rose-300 !bg-rose-100 !text-rose-900 border",
      icon: <CalendarClock className="h-5 w-5" />,
    };
  }

  if (type === "Mentor Message") {
    return {
      accentClassName: "from-violet-600 to-fuchsia-500",
      badgeClassName: "!border-violet-300 !bg-violet-100 !text-violet-900 border",
      icon: <MessageSquareMore className="h-5 w-5" />,
    };
  }

  return {
    accentClassName: "from-sky-600 to-cyan-500",
    badgeClassName: "!border-sky-300 !bg-sky-100 !text-sky-900 border",
    icon: <BellRing className="h-5 w-5" />,
  };
}

function getPriorityBadgeClass(priority: "High" | "Medium" | "Low") {
  if (priority === "High") {
    return "!border-rose-300 !bg-rose-100 !text-rose-900";
  }

  if (priority === "Medium") {
    return "!border-amber-300 !bg-amber-100 !text-amber-900";
  }

  return "!border-slate-300 !bg-slate-100 !text-slate-900";

}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(
    INITIAL_NOTIFICATIONS[0]?.id ?? "",
  );

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((notification) =>
        showUnreadOnly ? !notification.read : true,
      ),
    [notifications, showUnreadOnly],
  );

  const selectedNotification = useMemo(
    () =>
      visibleNotifications.find(
        (notification) => notification.id === selectedNotificationId,
      ) ??
      visibleNotifications[0] ??
      notifications.find((notification) => notification.id === selectedNotificationId) ??
      notifications[0] ??
      null,
    [notifications, selectedNotificationId, visibleNotifications],
  );

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const deadlineCount = notifications.filter(
    (notification) => notification.type === "Deadline",
  ).length;
  const mentorMessageCount = notifications.filter(
    (notification) => notification.type === "Mentor Message",
  ).length;

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your notifications..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[36px] border border-sky-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_22%,#eefcff_54%,#f8fbff_76%,#fff7e8_100%)] p-6 shadow-[0_40px_110px_-52px_rgba(56,189,248,0.28)] sm:p-8">
          <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_32%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[1.06fr_0.94fr] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                <BellRing className="h-4 w-4 text-blue-700" />
                <span>Notifications</span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Your student activity inbox
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Stay on top of reminders, deadlines, and mentor updates in one
                  clean list so the next important action is always easy to spot.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Clock3 className="h-4 w-4 text-sky-600" />
                  {todayLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <BellRing className="h-4 w-4 text-indigo-600" />
                  {unreadCount} unread updates
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <CalendarClock className="h-4 w-4 text-amber-500" />
                  {deadlineCount} deadlines
                </span>
              </div>
              <div className="rounded-[28px] border border-sky-100/80 bg-white/78 p-5 shadow-[0_24px_56px_-42px_rgba(56,189,248,0.42)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Inbox Focus
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Keep your inbox light by clearing urgent deadlines first, then
                  mentor messages, then reminders. That way the next study action
                  stays clear instead of getting buried.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.3)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Inbox Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Clear important updates with less friction
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.22)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <BellRing className="h-4 w-4" />
                    Unread
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {unreadCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Notifications still waiting for your attention
                  </p>
                </div>
                <div className="rounded-[24px] border border-rose-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f2_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(244,63,94,0.18)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                    <CalendarClock className="h-4 w-4" />
                    Deadlines
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {deadlineCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Time-sensitive updates currently in your inbox
                  </p>
                </div>
                <div className="rounded-[24px] border border-violet-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5f3ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(124,58,237,0.18)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
                    <MessageSquareMore className="h-4 w-4" />
                    Mentor Notes
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {mentorMessageCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Direct messages and mentor prompts to review
                  </p>
                </div>
                <div className="rounded-[24px] border border-cyan-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#ecfeff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(6,182,212,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    <Filter className="h-4 w-4" />
                    Current View
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {showUnreadOnly ? "Unread Only" : "All Updates"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {visibleNotifications.length} notifications visible right now
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 text-sm leading-7 text-slate-600 shadow-[0_18px_40px_-34px_rgba(56,189,248,0.18)]">
                {selectedNotification
                  ? `Latest focus: ${selectedNotification.title}`
                  : "Your inbox is ready for review."}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-12 flex-1 rounded-2xl border border-sky-200 bg-white px-5 text-sky-700 shadow-[0_18px_40px_-30px_rgba(56,189,248,0.22)] hover:bg-sky-50"
                  onClick={() => setShowUnreadOnly((current) => !current)}
                  type="button"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {showUnreadOnly ? "Show All" : "Filter Unread"}
                </Button>
                <Button
                  className="h-12 flex-1 rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] px-5 text-white shadow-[0_24px_50px_-26px_rgba(37,99,235,0.55)] transition hover:brightness-105"
                  onClick={handleMarkAllAsRead}
                  type="button"
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark All Read
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <SectionCard
            action={
              <div className="flex flex-wrap gap-2">
                 <Badge className="!border-sky-300 !bg-sky-100 !text-sky-900 border">
                  {showUnreadOnly ? "Unread only" : "All notifications"}
                </Badge>
                 <Badge className="!border-sky-300 !bg-sky-100 !text-sky-900 border">
                  {visibleNotifications.length} visible
                </Badge>
              </div>
            }
            description="Review each update, filter down to unread items, and mark notifications as read once you have handled them."
            title="Notification List"
          >
            {visibleNotifications.length ? (
              <div className="space-y-4">
                {visibleNotifications.map((notification) => {
                  const isSelected =
                    notification.id === selectedNotification?.id;
                  const styles = getNotificationStyles(notification.type);

                  return (
                    <div
                      className={cn(
                        "w-full rounded-[28px] border p-5 transition",
                        isSelected
                          ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                          : "border-sky-100/80 bg-white hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md",
                      )}
                      key={notification.id}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <button
                          className="min-w-0 flex-1 text-left"
                          onClick={() => setSelectedNotificationId(notification.id)}
                          type="button"
                        >
                          <div className="flex min-w-0 gap-4">
                            <span
                              className={cn(
                                "mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-200/70",
                                styles.accentClassName,
                              )}
                            >
                              {styles.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={styles.badgeClassName}>
                                  {notification.type}
                                </Badge>
                                 <Badge className="!border-sky-300 !bg-sky-100 !text-sky-900 border">
                                  {notification.subject}
                                </Badge>
                                {!notification.read ? (
                                   <Badge className="!border-emerald-300 !bg-emerald-100 !text-emerald-900 border">
                                    Unread
                                  </Badge>
                                ) : null}
                              </div>
                              <h2 className="mt-3 text-base font-semibold text-slate-950">
                                {notification.title}
                              </h2>
                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {notification.message}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-slate-600">
                                  {notification.timeLabel}
                                </span>
                                 <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", getPriorityBadgeClass(notification.priority))}>
                                  {notification.priority} priority
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>

                        <div className="flex shrink-0 items-center justify-between gap-3 lg:flex-col lg:items-end">
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                          {!notification.read ? (
                            <Button
                              className="h-9 rounded-2xl bg-sky-600 px-4 text-white hover:bg-sky-700"
                              onClick={() => handleMarkAsRead(notification.id)}
                              type="button"
                            >
                              Mark as Read
                            </Button>
                          ) : (
                            <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-slate-600 text-xs font-medium text-slate-500">
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                  <CheckCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">
                  No unread notifications
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You are all caught up. Switch back to the full list whenever you
                  want to review older reminders and messages.
                </p>
                <Button
                  className="mt-5 h-11 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                  onClick={() => setShowUnreadOnly(false)}
                  type="button"
                  variant="outline"
                >
                  Show All Notifications
                </Button>
              </div>
            )}
          </SectionCard>

          <SectionCard
            action={
              selectedNotification && !selectedNotification.read ? (
                <Button
                  className="h-10 rounded-2xl bg-sky-600 px-4 text-white hover:bg-sky-700"
                  onClick={() => handleMarkAsRead(selectedNotification.id)}
                  type="button"
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark as Read
                </Button>
              ) : null
            }
            description="Open a notification to see the full context, timing, and urgency at a glance."
            title="Notification Detail"
          >
            {selectedNotification ? (
              <div className="space-y-5">
                {(() => {
                  const styles = getNotificationStyles(selectedNotification.type);

                  return (
                    <div className="space-y-5">
                      <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={styles.badgeClassName}>
                                {selectedNotification.type}
                              </Badge>
                              <Badge className="border-transparent bg-sky-100 text-sky-700">
                                {selectedNotification.subject}
                              </Badge>
                              <Badge
                                className={cn(
                                  "border-transparent",
                                  selectedNotification.read
                                    ? "bg-sky-50 text-sky-700"
                                    : "bg-emerald-100 text-emerald-700",
                                )}
                              >
                                {selectedNotification.read ? "Read" : "Unread"}
                              </Badge>
                            </div>
                            <h3 className="mt-3 text-xl font-semibold text-slate-950">
                              {selectedNotification.title}
                            </h3>
                          </div>
                          <span
                            className={cn(
                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-200/70",
                              styles.accentClassName,
                            )}
                          >
                            {styles.icon}
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-slate-600">
                          {selectedNotification.message}
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[24px] border border-sky-100/80 bg-white p-5 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock3 className="h-4 w-4" />
                            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                              Received
                            </p>
                          </div>
                          <p className="mt-3 text-sm font-semibold text-slate-950">
                            {selectedNotification.timeLabel}
                          </p>
                        </div>

                        <div className="rounded-[24px] border border-sky-100/80 bg-white p-5 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                          <div className="flex items-center gap-2 text-slate-500">
                            <BellRing className="h-4 w-4" />
                            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                              Priority
                            </p>
                          </div>
                          <p className="mt-3 text-sm font-semibold text-slate-950">
                            {selectedNotification.priority}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                        <p className="text-sm font-semibold text-slate-950">
                          Suggested next step
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {selectedNotification.type === "Deadline"
                            ? "Prioritize this item in your planner and reserve a focused study block before the due time."
                            : selectedNotification.type === "Mentor Message"
                              ? "Review the mentor update carefully and align your next task or group session around the feedback."
                              : "Use this reminder as a trigger to jump into the planned study session before momentum drops."}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                  <BellRing className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">
                  No notification selected
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Pick an item from the list to view its full context here.
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}




