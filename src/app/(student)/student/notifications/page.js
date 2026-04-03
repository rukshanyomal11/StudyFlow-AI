'use client';

import { useEffect, useMemo, useState } from 'react';
import { BellRing, Clock3, MessageSquareMore, Search, User } from 'lucide-react';
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout';
import { studentSidebarLinks } from '@/data/sidebarLinks';
import Alert from '@/components/ui/Alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function formatDate(value) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatRelativeDate(value) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return 'Yesterday';
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return `${Math.floor(days / 7)} weeks ago`;
}

function mapNotification(notification) {
  const relatedDoubt = notification?.relatedDoubtId || null;

  return {
    id: notification?._id || notification?.id || '',
    type: typeof notification?.type === 'string' ? notification.type : '',
    title:
      typeof notification?.title === 'string' && notification.title.trim()
        ? notification.title
        : 'Mentor replied to your doubt',
    message:
      typeof notification?.message === 'string' && notification.message.trim()
        ? notification.message
        : 'Your mentor sent a new reply.',
    isRead: Boolean(notification?.isRead),
    createdAt: notification?.createdAt || '',
    mentorName:
      typeof notification?.senderId?.name === 'string' && notification.senderId.name.trim()
        ? notification.senderId.name
        : 'Mentor',
    relatedDoubt,
  };
}

async function readApiError(response, fallbackMessage) {
  try {
    const data = await response.json();

    if (typeof data?.error === 'string' && data.error.trim()) {
      return data.error;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotificationId, setSelectedNotificationId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusTone, setStatusTone] = useState('info');
  const [statusMessage, setStatusMessage] = useState('Loading your doubt reply notifications...');
  const [statusHint, setStatusHint] = useState(
    'Replies from mentors will show up here automatically.',
  );

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      setIsLoading(true);

      try {
        const response = await fetch('/api/notifications?type=doubt_reply', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(
            await readApiError(response, 'Unable to load your notifications right now.'),
          );
        }

        const data = await response.json();
        const nextItems = Array.isArray(data?.notifications)
          ? data.notifications.map(mapNotification)
          : [];

        if (!active) {
          return;
        }

        setNotifications(nextItems);
        setSelectedNotificationId(nextItems[0]?.id || '');
        setStatusTone(nextItems.length ? 'success' : 'info');
        setStatusMessage(
          nextItems.length
            ? 'Your latest doubt replies are ready.'
            : 'No mentor replies yet.',
        );
        setStatusHint(
          nextItems.length
            ? 'Open a notification to see the reply and the original doubt context.'
            : 'When a mentor replies to your doubt, it will appear on this page.',
        );
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load your notifications right now.';

        setStatusTone('error');
        setStatusMessage(message);
        setStatusHint('Please refresh the page or sign in again.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return notifications;
    }

    return notifications.filter((item) => {
      const doubtTitle = item.relatedDoubt?.title || '';
      const fields = [item.title, item.message, item.mentorName, doubtTitle]
        .join(' ')
        .toLowerCase();

      return fields.includes(query);
    });
  }, [notifications, searchValue]);

  const selectedNotification = useMemo(
    () =>
      filteredNotifications.find((item) => item.id === selectedNotificationId) ||
      filteredNotifications[0] ||
      notifications.find((item) => item.id === selectedNotificationId) ||
      notifications[0] ||
      null,
    [filteredNotifications, notifications, selectedNotificationId],
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your notifications..."
    >
      <div className="space-y-6 pb-8">
        <Card className="rounded-[30px] border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#f2f8ff_40%,#ecfeff_100%)] shadow-[0_32px_80px_-50px_rgba(56,189,248,0.35)]">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-950">
                  <BellRing className="h-6 w-6 text-sky-600" />
                  Doubt Reply Notifications
                </CardTitle>
                <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
                  Every time your mentor replies to a doubt, you will receive a notification here.
                </CardDescription>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-sky-200 bg-white/90 px-4 py-3">
                  <p className="text-slate-500">Total</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">{notifications.length}</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-white/90 px-4 py-3">
                  <p className="text-slate-500">Unread</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">{unreadCount}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Alert className="rounded-2xl border p-4" type={statusTone}>
              <p className="font-medium">{statusMessage}</p>
              {statusHint ? <p className="mt-1">{statusHint}</p> : null}
            </Alert>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[30px] border-white/80 bg-white shadow-[0_28px_72px_-50px_rgba(56,189,248,0.32)]">
            <CardHeader className="pb-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-11 w-full rounded-2xl border border-sky-100 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search by reply, mentor, or doubt title"
                  value={searchValue}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-6 text-center text-sm text-slate-600">
                  Loading doubt reply notifications...
                </div>
              ) : filteredNotifications.length ? (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => {
                    const isSelected = notification.id === selectedNotification?.id;

                    return (
                      <button
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? 'border-sky-300 bg-sky-50/70 ring-2 ring-sky-100'
                            : 'border-sky-100 bg-white hover:border-sky-200 hover:bg-slate-50'
                        }`}
                        key={notification.id}
                        onClick={() => setSelectedNotificationId(notification.id)}
                        type="button"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border-sky-300 bg-sky-100 text-sky-900">Doubt Reply</Badge>
                          <Badge className="border-slate-300 bg-slate-100 text-slate-900">
                            {notification.mentorName}
                          </Badge>
                          {!notification.isRead ? (
                            <Badge className="border-amber-300 bg-amber-100 text-amber-900">
                              Unread
                            </Badge>
                          ) : null}
                        </div>

                        <h3 className="mt-3 line-clamp-1 text-sm font-semibold text-slate-950">
                          {notification.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{notification.message}</p>
                        <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatRelativeDate(notification.createdAt)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-6 text-center text-sm text-slate-600">
                  No doubt reply notifications found for this search.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-white/80 bg-white shadow-[0_28px_72px_-50px_rgba(56,189,248,0.32)]">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950">Reply Detail</CardTitle>
              <CardDescription>
                View the mentor reply and your original doubt details in one place.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {selectedNotification ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-slate-950">
                          {selectedNotification.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {selectedNotification.message}
                        </p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700">
                        <MessageSquareMore className="h-5 w-5" />
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Mentor
                      </p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                        <User className="h-4 w-4 text-slate-500" />
                        {selectedNotification.mentorName}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Received At
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {formatDate(selectedNotification.createdAt)}
                      </p>
                    </div>
                  </div>

                  {selectedNotification.relatedDoubt ? (
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Related Doubt
                      </p>
                      <h3 className="mt-2 text-sm font-semibold text-slate-950">
                        {selectedNotification.relatedDoubt.title || 'Doubt'}
                      </h3>
                      {selectedNotification.relatedDoubt.subjectId?.name ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Subject: {selectedNotification.relatedDoubt.subjectId.name}
                        </p>
                      ) : null}
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {selectedNotification.relatedDoubt.message || 'No original doubt message available.'}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-6 text-center text-sm text-slate-600">
                  Select a notification to view full reply details.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
