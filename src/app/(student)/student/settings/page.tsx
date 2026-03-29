"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BellRing,
  CheckCircle2,
  Globe2,
  KeyRound,
  MoonStar,
  Save,
  Shield,
  Sparkles,
  Trash2,
  UserCog,
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

type ThemeMode = "Light" | "Dark" | "System";
type LanguageOption = "English" | "Sinhala" | "Tamil";

interface SettingsState {
  theme: ThemeMode;
  language: LanguageOption;
  studyReminders: boolean;
  deadlineAlerts: boolean;
  mentorMessages: boolean;
  weeklyDigest: boolean;
  profileVisibility: "Private" | "Study Groups" | "All Students";
  analyticsSharing: boolean;
  groupActivityVisibility: boolean;
  searchableProfile: boolean;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_SETTINGS: SettingsState = {
  theme: "System",
  language: "English",
  studyReminders: true,
  deadlineAlerts: true,
  mentorMessages: true,
  weeklyDigest: false,
  profileVisibility: "Study Groups",
  analyticsSharing: true,
  groupActivityVisibility: true,
  searchableProfile: false,
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

const selectClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

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
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <button
        aria-pressed={checked}
        className={cn(
          "inline-flex h-11 min-w-[112px] items-center justify-center rounded-2xl px-4 text-sm font-medium transition",
          checked
            ? "bg-sky-600 text-white hover:bg-sky-700"
            : "border border-sky-100 bg-white text-slate-700 hover:bg-sky-50",
        )}
        onClick={onToggle}
        type="button"
      >
        {checked ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}

export default function StudentSettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saveMessage, setSaveMessage] = useState(
    "Your preferences are ready to be saved.",
  );
  const [passwordMessage, setPasswordMessage] = useState(
    "Use a strong password and refresh it regularly.",
  );
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(
    "Account deletion stays disabled until you confirm.",
  );

  const enabledNotificationCount = useMemo(
    () =>
      [
        settings.studyReminders,
        settings.deadlineAlerts,
        settings.mentorMessages,
        settings.weeklyDigest,
      ].filter(Boolean).length,
    [settings],
  );

  const privacyStatus = useMemo(() => {
    const openCount = [
      settings.analyticsSharing,
      settings.groupActivityVisibility,
      settings.searchableProfile,
    ].filter(Boolean).length;

    if (openCount >= 3) {
      return "Open";
    }

    if (openCount === 2) {
      return "Balanced";
    }

    return "Private";
  }, [
    settings.analyticsSharing,
    settings.groupActivityVisibility,
    settings.searchableProfile,
  ]);

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setSaveMessage("You have unsaved changes.");
  };

  const toggleSetting = (
    key:
      | "studyReminders"
      | "deadlineAlerts"
      | "mentorMessages"
      | "weeklyDigest"
      | "analyticsSharing"
      | "groupActivityVisibility"
      | "searchableProfile",
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setSaveMessage("You have unsaved changes.");
  };

  const handleSaveChanges = () => {
    setSaveMessage("Settings saved successfully.");
  };

  const handlePasswordFieldChange = (
    field: keyof PasswordFormState,
    value: string,
  ) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));
    setPasswordMessage("Password changes are ready to review.");
  };

  const handleChangePassword = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordMessage("Complete all password fields before updating.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordMessage("Password updated successfully.");
  };

  const handleDeleteAccount = () => {
    if (!deleteArmed) {
      setDeleteMessage(
        "Confirm account deletion first if you want to activate this action.",
      );
      return;
    }

    setDeleteMessage(
      "Delete action confirmed in demo mode. Connect this to your backend before enabling it for real accounts.",
    );
    setDeleteArmed(false);
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your settings..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[36px] border border-sky-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_22%,#eefcff_54%,#f8fbff_76%,#fff7e8_100%)] p-6 shadow-[0_40px_110px_-52px_rgba(56,189,248,0.28)] sm:p-8">
          <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_32%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[1.06fr_0.94fr] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                <UserCog className="h-4 w-4 text-blue-700" />
                <span>Student Settings</span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Personalize your StudyFlow workspace
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Adjust themes, notification preferences, privacy controls, and
                  account actions from one clean settings hub built for students.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Globe2 className="h-4 w-4 text-sky-600" />
                  {todayLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <MoonStar className="h-4 w-4 text-indigo-600" />
                  Theme: {settings.theme}
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Privacy: {privacyStatus}
                </span>
              </div>
              <div className="rounded-[28px] border border-sky-100/80 bg-white/78 p-5 shadow-[0_24px_56px_-42px_rgba(56,189,248,0.42)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Workspace Focus
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Set up your study space so it feels calm and predictable. A clear
                  theme, the right alerts, and comfortable privacy settings make the
                  rest of the workflow easier to manage.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.3)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Settings Pulse
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Keep your workspace aligned with how you study
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.22)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <MoonStar className="h-4 w-4" />
                    Theme
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {settings.theme}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Current appearance mode for your workspace
                  </p>
                </div>
                <div className="rounded-[24px] border border-blue-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(37,99,235,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    <BellRing className="h-4 w-4" />
                    Notifications
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {enabledNotificationCount}/4
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Alert channels currently enabled for study updates
                  </p>
                </div>
                <div className="rounded-[24px] border border-emerald-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(16,185,129,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    <Shield className="h-4 w-4" />
                    Privacy
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {privacyStatus}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Current balance between visibility and personal control
                  </p>
                </div>
                <div className="rounded-[24px] border border-violet-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5f3ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(124,58,237,0.18)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
                    <Globe2 className="h-4 w-4" />
                    Language
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {settings.language}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Selected language for your StudyFlow workspace
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 text-sm leading-7 text-slate-600 shadow-[0_18px_40px_-34px_rgba(56,189,248,0.18)]">
                {saveMessage}
              </div>

              <Button
                className="mt-5 h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] px-5 text-white shadow-[0_24px_50px_-26px_rgba(37,99,235,0.55)] transition hover:brightness-105"
                onClick={handleSaveChanges}
                type="button"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
          <div className="space-y-8">
            <SectionCard
              description="Set the look and language that feel most comfortable while you study."
              title="General Settings"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field htmlFor="theme" label="Theme">
                  <select
                    className={selectClassName}
                    id="theme"
                    onChange={(event) =>
                      updateSetting("theme", event.target.value as ThemeMode)
                    }
                    value={settings.theme}
                  >
                    <option value="Light">Light</option>
                    <option value="Dark">Dark</option>
                    <option value="System">System</option>
                  </select>
                </Field>

                <Field htmlFor="language" label="Language">
                  <select
                    className={selectClassName}
                    id="language"
                    onChange={(event) =>
                      updateSetting(
                        "language",
                        event.target.value as LanguageOption,
                      )
                    }
                    value={settings.language}
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              action={
                <Badge className="border-transparent bg-sky-100 text-sky-700">
                  {enabledNotificationCount} active
                </Badge>
              }
              description="Choose which updates should reach you while you plan, revise, and work with mentors."
              title="Notification Settings"
            >
              <div className="space-y-4">
                <ToggleRow
                  checked={settings.studyReminders}
                  description="Session prompts, planner nudges, and focus reminders."
                  onToggle={() => toggleSetting("studyReminders")}
                  title="Study reminders"
                />
                <ToggleRow
                  checked={settings.deadlineAlerts}
                  description="Important due dates, quizzes, and submission warnings."
                  onToggle={() => toggleSetting("deadlineAlerts")}
                  title="Deadline alerts"
                />
                <ToggleRow
                  checked={settings.mentorMessages}
                  description="Direct mentor replies, feedback, and check-ins."
                  onToggle={() => toggleSetting("mentorMessages")}
                  title="Mentor messages"
                />
                <ToggleRow
                  checked={settings.weeklyDigest}
                  description="A weekly summary of progress, weak areas, and streaks."
                  onToggle={() => toggleSetting("weeklyDigest")}
                  title="Weekly digest"
                />
              </div>
            </SectionCard>

            <SectionCard
              action={
                <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                  {privacyStatus}
                </Badge>
              }
              description="Control how visible your learning activity is across StudyFlow AI."
              title="Privacy Settings"
            >
              <div className="space-y-5">
                <Field htmlFor="profile-visibility" label="Profile visibility">
                  <select
                    className={selectClassName}
                    id="profile-visibility"
                    onChange={(event) =>
                      updateSetting(
                        "profileVisibility",
                        event.target.value as SettingsState["profileVisibility"],
                      )
                    }
                    value={settings.profileVisibility}
                  >
                    <option value="Private">Private</option>
                    <option value="Study Groups">Study Groups</option>
                    <option value="All Students">All Students</option>
                  </select>
                </Field>

                <div className="space-y-4">
                  <ToggleRow
                    checked={settings.analyticsSharing}
                    description="Help improve personalized recommendations with anonymized usage signals."
                    onToggle={() => toggleSetting("analyticsSharing")}
                    title="Share study analytics"
                  />
                  <ToggleRow
                    checked={settings.groupActivityVisibility}
                    description="Let group members see when you have recently joined or completed shared tasks."
                    onToggle={() => toggleSetting("groupActivityVisibility")}
                    title="Show group activity"
                  />
                  <ToggleRow
                    checked={settings.searchableProfile}
                    description="Allow other students to discover your profile when finding collaboration partners."
                    onToggle={() => toggleSetting("searchableProfile")}
                    title="Searchable student profile"
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-8">
            <SectionCard
              description="Secure your account and manage sensitive actions with extra care."
              title="Account Actions"
            >
              <div className="space-y-6">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white">
                      <KeyRound className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Change password
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Refresh your password any time you need to tighten account
                        security.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <Field htmlFor="current-password" label="Current password">
                      <input
                        className={inputClassName}
                        id="current-password"
                        onChange={(event) =>
                          handlePasswordFieldChange(
                            "currentPassword",
                            event.target.value,
                          )
                        }
                        type="password"
                        value={passwordForm.currentPassword}
                      />
                    </Field>
                    <Field htmlFor="new-password" label="New password">
                      <input
                        className={inputClassName}
                        id="new-password"
                        onChange={(event) =>
                          handlePasswordFieldChange(
                            "newPassword",
                            event.target.value,
                          )
                        }
                        type="password"
                        value={passwordForm.newPassword}
                      />
                    </Field>
                    <Field htmlFor="confirm-password" label="Confirm new password">
                      <input
                        className={inputClassName}
                        id="confirm-password"
                        onChange={(event) =>
                          handlePasswordFieldChange(
                            "confirmPassword",
                            event.target.value,
                          )
                        }
                        type="password"
                        value={passwordForm.confirmPassword}
                      />
                    </Field>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">{passwordMessage}</p>
                    <Button
                      className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                      onClick={handleChangePassword}
                      type="button"
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                </div>

                <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white">
                      <Trash2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Delete account
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        This is a sensitive action. Keep it protected behind an
                        explicit confirmation step.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[20px] border border-rose-200 bg-white px-4 py-4 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Enable delete action
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Toggle this on only when you are ready to confirm deletion.
                        </p>
                      </div>
                      <button
                        aria-pressed={deleteArmed}
                        className={cn(
                          "inline-flex h-11 min-w-[128px] items-center justify-center rounded-2xl px-4 text-sm font-medium transition",
                          deleteArmed
                            ? "bg-rose-600 text-white hover:bg-rose-700"
                            : "border border-sky-100 bg-white text-slate-700 hover:bg-sky-50",
                        )}
                        onClick={() => setDeleteArmed((current) => !current)}
                        type="button"
                      >
                        {deleteArmed ? "Confirmed" : "Confirm First"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">{deleteMessage}</p>
                    <Button
                      className="h-11 rounded-2xl bg-rose-600 px-5 text-white hover:bg-rose-700"
                      onClick={handleDeleteAccount}
                      type="button"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="A compact overview of how your current configuration is set up."
              title="Settings Snapshot"
            >
              <div className="space-y-4">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                      <Globe2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Language and theme
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {settings.language} with {settings.theme.toLowerCase()} mode
                        preferences.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Save state
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{saveMessage}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                      <UserCog className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Visibility
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Profile visibility is set to {settings.profileVisibility}.
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





