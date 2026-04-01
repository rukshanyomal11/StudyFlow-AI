"use client";

import { useState, useEffect } from "react";
import mentorService from "@/services/mentor.service";
import type { ReactNode } from "react";
import {
  Bell,
  GraduationCap,
  KeyRound,
  Languages,
  LayoutGrid,
  MonitorSmartphone,
  Palette,
  Save,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
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

type ThemeMode = "Light" | "Dark" | "System";
type DashboardDensity = "Comfortable" | "Compact" | "Spacious";
type LanguagePreference = "English" | "Sinhala" | "Tamil";

interface SessionRecord {
  id: string;
  device: string;
  location: string;
  timestamp: string;
  active: boolean;
}

interface MentorSettingsState {
  general: {
    displayName: string;
    email: string;
    defaultTeachingSubject: string;
    timezone: string;
  };
  notifications: {
    studentMessageAlerts: boolean;
    doubtAlerts: boolean;
    quizSubmissionAlerts: boolean;
    announcementReminders: boolean;
  };
  teaching: {
    allowStudentMessages: boolean;
    autoAssignMaterials: boolean;
    visibleOfficeHours: boolean;
    feedbackReminders: boolean;
  };
  security: {
    twoFactorAuth: boolean;
  };
  appearance: {
    themeMode: ThemeMode;
    dashboardDensity: DashboardDensity;
    language: LanguagePreference;
  };
}

type GeneralKey = keyof MentorSettingsState["general"];
type NotificationKey = keyof MentorSettingsState["notifications"];
type TeachingKey = keyof MentorSettingsState["teaching"];
type SecurityKey = keyof MentorSettingsState["security"];
type AppearanceKey = keyof MentorSettingsState["appearance"];

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_SETTINGS: MentorSettingsState = {
  general: {
    displayName: "Dr. Maya Fernando",
    email: "maya.f@studyflow.ai",
    defaultTeachingSubject: "Physics",
    timezone: "Asia/Colombo (GMT+5:30)",
  },
  notifications: {
    studentMessageAlerts: true,
    doubtAlerts: true,
    quizSubmissionAlerts: true,
    announcementReminders: false,
  },
  teaching: {
    allowStudentMessages: true,
    autoAssignMaterials: false,
    visibleOfficeHours: true,
    feedbackReminders: true,
  },
  security: {
    twoFactorAuth: true,
  },
  appearance: {
    themeMode: "System",
    dashboardDensity: "Comfortable",
    language: "English",
  },
};

const INITIAL_SESSIONS: SessionRecord[] = [
  {
    id: "session-01",
    device: "Chrome on Windows 11",
    location: "Colombo, Sri Lanka",
    timestamp: "March 24, 2026 at 9:18 AM",
    active: true,
  },
  {
    id: "session-02",
    device: "Safari on iPad Pro",
    location: "Colombo, Sri Lanka",
    timestamp: "March 23, 2026 at 8:06 PM",
    active: false,
  },
  {
    id: "session-03",
    device: "Edge on MacBook Air",
    location: "Kandy, Sri Lanka",
    timestamp: "March 22, 2026 at 6:42 PM",
    active: false,
  },
];

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const selectClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const SURFACE_CARD_CLASS_NAME =
  "rounded-[28px] border border-slate-200/90 bg-white/95 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.16)] backdrop-blur-sm dark:!border-slate-200 dark:!bg-white dark:!text-slate-950";

const PRIMARY_BUTTON_CLASS_NAME =
  "bg-sky-600 text-white hover:bg-sky-700 dark:!bg-sky-600 dark:!text-white dark:hover:!bg-sky-700";

const SECONDARY_BUTTON_CLASS_NAME =
  "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:!border-slate-200 dark:!bg-white dark:!text-slate-900 dark:hover:!bg-slate-50";

function SectionCard({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className={SURFACE_CARD_CLASS_NAME}>
      <CardHeader className="pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-[0_16px_26px_-18px_rgba(37,99,235,0.44)]">
              {icon}
            </span>
            <div>
              <CardTitle className="text-xl text-slate-950 dark:!text-slate-950">{title}</CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:!text-slate-600">
                {description}
              </CardDescription>
            </div>
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

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
  tone = "slate",
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  tone?: "slate" | "sky" | "emerald" | "amber";
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-600"
      : tone === "sky"
        ? "bg-sky-600"
        : tone === "amber"
          ? "bg-amber-500"
          : "bg-sky-600";

  return (
    <div className="flex items-start justify-between gap-4 rounded-[24px] border border-slate-200/90 bg-white/92 p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)]">
      <div>
        <p className="text-sm font-semibold text-slate-950">{label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <button
        aria-checked={checked}
        className={cn(
          "relative mt-1 h-7 w-12 rounded-full transition",
          checked ? toneClass : "bg-slate-300",
        )}
        onClick={onToggle}
        role="switch"
        type="button"
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition",
            checked ? "left-6" : "left-1",
          )}
        />
      </button>
    </div>
  );
}

export default function MentorSettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [saveMessage, setSaveMessage] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");

  const handleGeneralChange = (field: GeneralKey, value: string) => {
    setSettings((current) => ({
      ...current,
      general: {
        ...current.general,
        [field]: value,
      },
    }));
    setSaveMessage("");
  };

  const handleNotificationToggle = (field: NotificationKey) => {
    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [field]: !current.notifications[field],
      },
    }));
    setSaveMessage("");
  };

  const handleTeachingToggle = (field: TeachingKey) => {
    setSettings((current) => ({
      ...current,
      teaching: {
        ...current.teaching,
        [field]: !current.teaching[field],
      },
    }));
    setSaveMessage("");
  };

  const handleSecurityToggle = (field: SecurityKey) => {
    setSettings((current) => ({
      ...current,
      security: {
        ...current.security,
        [field]: !current.security[field],
      },
    }));
    setSaveMessage("");
    setSecurityMessage("");
  };

  const handleAppearanceChange = (
    field: AppearanceKey,
    value: ThemeMode | DashboardDensity | LanguagePreference,
  ) => {
    setSettings((current) => ({
      ...current,
      appearance: {
        ...current.appearance,
        [field]: value,
      },
    }));
    setSaveMessage("");
  };

  const handlePasswordChange = (
    field: keyof PasswordFormState,
    value: string,
  ) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSecurityMessage("");
  };

  const handlePasswordUpdate = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setSecurityMessage("Complete all password fields before updating.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSecurityMessage("New password and confirmation do not match.");
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setSecurityMessage("Password updated for your mentor account.");
  };

  const handleEndOtherSessions = () => {
    setSessions((current) => current.filter((session) => session.active));
    setSecurityMessage("All other sessions have been signed out.");
  };

  const handleRevokeSession = (id: string) => {
    const session = sessions.find((item) => item.id === id);

    if (!session || session.active) {
      setSecurityMessage("The current session cannot be removed from this workspace.");
      return;
    }

    setSessions((current) => current.filter((item) => item.id !== id));
    setSecurityMessage(`${session.device} session ended successfully.`);
  };

  const handleSaveChanges = () => {
    setSaveMessage("Mentor settings saved successfully.");
  };

  const enabledNotificationCount = Object.values(settings.notifications).filter(Boolean).length;
  const enabledTeachingPreferences = Object.values(settings.teaching).filter(Boolean).length;

  return (
    <ProtectedDashboardLayout
      role="mentor"
      links={mentorSidebarLinks}
      loadingMessage="Loading your mentor settings..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(239,246,255,0.98)_52%,rgba(236,253,245,0.98)_100%)] p-6 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.24)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_58%)]" />
          <div className="absolute -left-12 top-10 h-36 w-36 rounded-full bg-sky-100/80 blur-3xl" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-sky-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Mentor control center
              </Badge>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Settings
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Manage your mentor identity, teaching workflow, notification
                  preferences, security controls, and workspace appearance from
                  one premium StudyFlow AI settings surface.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:items-end">
              <Button
                className={cn("h-11 rounded-2xl px-5", SECONDARY_BUTTON_CLASS_NAME)}
                onClick={handleSaveChanges}
                type="button"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Alerts Enabled
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {enabledNotificationCount} / 4
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Teaching Automation
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {enabledTeachingPreferences} active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {saveMessage ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {saveMessage}
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-8">
            <SectionCard
              description="Set the identity details used across your mentor dashboard and student-facing teaching workspace."
              icon={<Settings2 className="h-5 w-5" />}
              title="General Settings"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field htmlFor="display-name" label="Display Name">
                  <input
                    className={inputClassName}
                    id="display-name"
                    onChange={(event) =>
                      handleGeneralChange("displayName", event.target.value)
                    }
                    type="text"
                    value={settings.general.displayName}
                  />
                </Field>

                <Field htmlFor="email" label="Email">
                  <input
                    className={inputClassName}
                    id="email"
                    onChange={(event) =>
                      handleGeneralChange("email", event.target.value)
                    }
                    type="email"
                    value={settings.general.email}
                  />
                </Field>

                <Field htmlFor="subject" label="Default Teaching Subject">
                  <select
                    className={selectClassName}
                    id="subject"
                    onChange={(event) =>
                      handleGeneralChange("defaultTeachingSubject", event.target.value)
                    }
                    value={settings.general.defaultTeachingSubject}
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                  </select>
                </Field>

                <Field htmlFor="timezone" label="Timezone">
                  <input
                    className={inputClassName}
                    id="timezone"
                    onChange={(event) =>
                      handleGeneralChange("timezone", event.target.value)
                    }
                    type="text"
                    value={settings.general.timezone}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              description="Control which student activity and platform events should trigger notifications during your teaching day."
              icon={<Bell className="h-5 w-5" />}
              title="Notification Settings"
            >
              <div className="space-y-4">
                <ToggleRow
                  checked={settings.notifications.studentMessageAlerts}
                  description="Receive instant alerts when students send direct messages in your workspace."
                  label="Student message alerts"
                  onToggle={() => handleNotificationToggle("studentMessageAlerts")}
                  tone="sky"
                />
                <ToggleRow
                  checked={settings.notifications.doubtAlerts}
                  description="Stay informed whenever new doubts arrive and need a mentor response."
                  label="Doubt alerts"
                  onToggle={() => handleNotificationToggle("doubtAlerts")}
                  tone="amber"
                />
                <ToggleRow
                  checked={settings.notifications.quizSubmissionAlerts}
                  description="Get notified when assigned quizzes are submitted or require review."
                  label="Quiz submission alerts"
                  onToggle={() => handleNotificationToggle("quizSubmissionAlerts")}
                  tone="emerald"
                />
                <ToggleRow
                  checked={settings.notifications.announcementReminders}
                  description="Receive reminders for scheduled announcements and communication follow-ups."
                  label="Announcement reminders"
                  onToggle={() => handleNotificationToggle("announcementReminders")}
                />
              </div>
            </SectionCard>

            <SectionCard
              description="Fine-tune the defaults that shape how your mentor workflow behaves across students, materials, and follow-ups."
              icon={<GraduationCap className="h-5 w-5" />}
              title="Teaching Preferences"
            >
              <div className="space-y-4">
                <ToggleRow
                  checked={settings.teaching.allowStudentMessages}
                  description="Allow students to initiate direct mentor conversations from their dashboard."
                  label="Allow student messages"
                  onToggle={() => handleTeachingToggle("allowStudentMessages")}
                  tone="sky"
                />
                <ToggleRow
                  checked={settings.teaching.autoAssignMaterials}
                  description="Automatically suggest relevant materials after quizzes and doubt responses."
                  label="Auto-assign materials"
                  onToggle={() => handleTeachingToggle("autoAssignMaterials")}
                  tone="emerald"
                />
                <ToggleRow
                  checked={settings.teaching.visibleOfficeHours}
                  description="Show your office-hour availability to students in the mentor panel."
                  label="Visible office hours"
                  onToggle={() => handleTeachingToggle("visibleOfficeHours")}
                  tone="amber"
                />
                <ToggleRow
                  checked={settings.teaching.feedbackReminders}
                  description="Get nudges to send quiz and assignment feedback before deadlines pass."
                  label="Feedback reminders"
                  onToggle={() => handleTeachingToggle("feedbackReminders")}
                />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-8">
            <SectionCard
              action={
                <Button
                  className={cn("h-10 rounded-2xl px-4", SECONDARY_BUTTON_CLASS_NAME)}
                  onClick={handleEndOtherSessions}
                  type="button"
                  variant="outline"
                >
                  End Other Sessions
                </Button>
              }
              description="Keep your mentor account protected with password updates, two-factor authentication, and session controls."
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Security Settings"
            >
              <div className="space-y-6">
                <div className="grid gap-5">
                  <Field htmlFor="current-password" label="Current Password">
                    <input
                      className={inputClassName}
                      id="current-password"
                      onChange={(event) =>
                        handlePasswordChange("currentPassword", event.target.value)
                      }
                      type="password"
                      value={passwordForm.currentPassword}
                    />
                  </Field>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field htmlFor="new-password" label="New Password">
                      <input
                        className={inputClassName}
                        id="new-password"
                        onChange={(event) =>
                          handlePasswordChange("newPassword", event.target.value)
                        }
                        type="password"
                        value={passwordForm.newPassword}
                      />
                    </Field>

                    <Field htmlFor="confirm-password" label="Confirm Password">
                      <input
                        className={inputClassName}
                        id="confirm-password"
                        onChange={(event) =>
                          handlePasswordChange("confirmPassword", event.target.value)
                        }
                        type="password"
                        value={passwordForm.confirmPassword}
                      />
                    </Field>
                  </div>
                </div>

                <ToggleRow
                  checked={settings.security.twoFactorAuth}
                  description="Require an additional verification step whenever this mentor account signs in."
                  label="Two-factor authentication"
                  onToggle={() => handleSecurityToggle("twoFactorAuth")}
                  tone="emerald"
                />

                {securityMessage ? (
                  <div className="rounded-[22px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    {securityMessage}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button
                    className={cn("h-11 rounded-2xl px-5", PRIMARY_BUTTON_CLASS_NAME)}
                    onClick={handlePasswordUpdate}
                    type="button"
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MonitorSmartphone className="h-5 w-5 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-950">
                      Session Management
                    </p>
                  </div>
                  {sessions.map((session) => (
                    <div
                      className="flex flex-col gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      key={session.id}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">
                            {session.device}
                          </p>
                          <Badge
                            className={
                              session.active
                                ? "border-transparent bg-emerald-100 text-emerald-700"
                                : "border-transparent bg-slate-200 text-slate-700"
                            }
                          >
                            {session.active ? "Current Session" : "Recent Session"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {session.location}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {session.timestamp}
                        </p>
                      </div>

                      <Button
                        className={cn(
                          "h-9 rounded-2xl px-4",
                          session.active
                            ? "border border-slate-200 bg-slate-100 text-slate-500"
                            : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
                        )}
                        disabled={session.active}
                        onClick={() => handleRevokeSession(session.id)}
                        type="button"
                        variant="outline"
                      >
                        {session.active ? "Active" : "Revoke"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="Adjust how the mentor dashboard looks and feels across themes, layout density, and language."
              icon={<Palette className="h-5 w-5" />}
              title="Appearance"
            >
              <div className="space-y-5">
                <Field htmlFor="theme-mode" label="Theme Mode">
                  <select
                    className={selectClassName}
                    id="theme-mode"
                    onChange={(event) =>
                      handleAppearanceChange(
                        "themeMode",
                        event.target.value as ThemeMode,
                      )
                    }
                    value={settings.appearance.themeMode}
                  >
                    <option value="Light">Light</option>
                    <option value="Dark">Dark</option>
                    <option value="System">System</option>
                  </select>
                </Field>

                <Field htmlFor="dashboard-density" label="Dashboard Density">
                  <select
                    className={selectClassName}
                    id="dashboard-density"
                    onChange={(event) =>
                      handleAppearanceChange(
                        "dashboardDensity",
                        event.target.value as DashboardDensity,
                      )
                    }
                    value={settings.appearance.dashboardDensity}
                  >
                    <option value="Comfortable">Comfortable</option>
                    <option value="Compact">Compact</option>
                    <option value="Spacious">Spacious</option>
                  </select>
                </Field>

                <Field htmlFor="language" label="Language">
                  <select
                    className={selectClassName}
                    id="language"
                    onChange={(event) =>
                      handleAppearanceChange(
                        "language",
                        event.target.value as LanguagePreference,
                      )
                    }
                    value={settings.appearance.language}
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </Field>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      <Palette className="h-4 w-4" />
                      Theme
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-950">
                      {settings.appearance.themeMode}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      <LayoutGrid className="h-4 w-4" />
                      Density
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-950">
                      {settings.appearance.dashboardDensity}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      <Languages className="h-4 w-4" />
                      Language
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-950">
                      {settings.appearance.language}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="A quick read on how your current mentor configuration is set up across communication, teaching workflow, and protection."
              icon={<Sparkles className="h-5 w-5" />}
              title="Workspace Summary"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    <UserRound className="h-4 w-4" />
                    General
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {settings.general.displayName}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {settings.general.defaultTeachingSubject} · {settings.general.timezone}
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {enabledNotificationCount} alert channels enabled
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Student messages, doubts, quizzes, and reminder flows.
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    <GraduationCap className="h-4 w-4" />
                    Teaching
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {enabledTeachingPreferences} teaching preferences active
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Messaging access, reminders, and teaching automation.
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {settings.security.twoFactorAuth ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <ShieldAlert className="h-4 w-4" />
                    )}
                    Security
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {settings.security.twoFactorAuth ? "2FA enabled" : "2FA disabled"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {sessions.length} active or recent sessions tracked.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
