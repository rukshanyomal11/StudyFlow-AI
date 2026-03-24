"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  AppWindow,
  Bell,
  Brain,
  CreditCard,
  Globe,
  GraduationCap,
  KeyRound,
  LayoutGrid,
  Mail,
  MoonStar,
  Palette,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  SunMedium,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { adminSidebarLinks } from "@/data/sidebarLinks";
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
type BrandColor = "Ocean Blue" | "Emerald" | "Slate" | "Amber";
type DashboardDensity = "Comfortable" | "Compact" | "Spacious";
type SessionTimeout = "15 minutes" | "30 minutes" | "1 hour" | "4 hours";
type PasswordPolicy = "Balanced" | "Strong" | "Strict";

interface SettingsState {
  general: {
    appName: string;
    supportEmail: string;
    platformDescription: string;
    maintenanceMode: boolean;
  };
  permissions: {
    adminUserManagement: boolean;
    adminBillingControls: boolean;
    adminModerationTools: boolean;
    mentorStudentInsights: boolean;
    mentorQuizPublishing: boolean;
    mentorSessionScheduling: boolean;
    studentAiCoach: boolean;
    studentDownloads: boolean;
    studentCommunityAccess: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    pushAlerts: boolean;
    reportNotifications: boolean;
    billingAlerts: boolean;
  };
  security: {
    sessionTimeout: SessionTimeout;
    passwordPolicy: PasswordPolicy;
    enforceTwoFactor: boolean;
    loginAlerts: boolean;
  };
  platform: {
    aiRecommendations: boolean;
    quizzes: boolean;
    mentorTools: boolean;
    subscriptions: boolean;
  };
  appearance: {
    themeMode: ThemeMode;
    brandColor: BrandColor;
    dashboardDensity: DashboardDensity;
  };
}

type PermissionKey = keyof SettingsState["permissions"];
type NotificationKey = keyof SettingsState["notifications"];
type SecurityKey = keyof SettingsState["security"];
type PlatformKey = keyof SettingsState["platform"];
type AppearanceKey = keyof SettingsState["appearance"];
type GeneralKey = keyof SettingsState["general"];

const INITIAL_SETTINGS: SettingsState = {
  general: {
    appName: "StudyFlow AI",
    supportEmail: "support@studyflow.ai",
    platformDescription:
      "A smart study planner and AI study coach that helps learners stay consistent, organized, and ahead of every deadline.",
    maintenanceMode: false,
  },
  permissions: {
    adminUserManagement: true,
    adminBillingControls: true,
    adminModerationTools: true,
    mentorStudentInsights: true,
    mentorQuizPublishing: true,
    mentorSessionScheduling: true,
    studentAiCoach: true,
    studentDownloads: true,
    studentCommunityAccess: false,
  },
  notifications: {
    emailAlerts: true,
    pushAlerts: true,
    reportNotifications: true,
    billingAlerts: true,
  },
  security: {
    sessionTimeout: "30 minutes",
    passwordPolicy: "Strong",
    enforceTwoFactor: true,
    loginAlerts: true,
  },
  platform: {
    aiRecommendations: true,
    quizzes: true,
    mentorTools: true,
    subscriptions: true,
  },
  appearance: {
    themeMode: "System",
    brandColor: "Ocean Blue",
    dashboardDensity: "Comfortable",
  },
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const selectClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.24)]">
      <CardHeader className="pb-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-200/80">
            {icon}
          </span>
          <div>
            <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </CardDescription>
          </div>
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
  tone?: "slate" | "emerald" | "sky" | "amber";
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-600"
      : tone === "sky"
        ? "bg-sky-600"
        : tone === "amber"
          ? "bg-amber-500"
          : "bg-slate-950";

  return (
    <div className="flex items-start justify-between gap-4 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
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

const permissionGroups: Array<{
  title: string;
  icon: LucideIcon;
  items: Array<{
    key: PermissionKey;
    label: string;
    description: string;
  }>;
}> = [
  {
    title: "Admin permissions",
    icon: UserCog,
    items: [
      {
        key: "adminUserManagement",
        label: "Manage users and roles",
        description: "Allow admins to update user states, roles, and access controls.",
      },
      {
        key: "adminBillingControls",
        label: "Manage billing controls",
        description: "Enable refunds, plan changes, and invoice management.",
      },
      {
        key: "adminModerationTools",
        label: "Access moderation tools",
        description: "Review reports, remove content, and suspend accounts.",
      },
    ],
  },
  {
    title: "Mentor permissions",
    icon: GraduationCap,
    items: [
      {
        key: "mentorStudentInsights",
        label: "View student insights",
        description: "Give mentors access to progress, activity, and learning streaks.",
      },
      {
        key: "mentorQuizPublishing",
        label: "Publish quizzes",
        description: "Allow mentors to create and publish subject-level assessments.",
      },
      {
        key: "mentorSessionScheduling",
        label: "Manage live sessions",
        description: "Enable scheduling, rescheduling, and session follow-ups.",
      },
    ],
  },
  {
    title: "Student permissions",
    icon: Users,
    items: [
      {
        key: "studentAiCoach",
        label: "Use AI study coach",
        description: "Give students access to personalized AI study guidance.",
      },
      {
        key: "studentDownloads",
        label: "Download study materials",
        description: "Allow exports for notes, summaries, and revision plans.",
      },
      {
        key: "studentCommunityAccess",
        label: "Join community spaces",
        description: "Enable community discussions and peer learning channels.",
      },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(INITIAL_SETTINGS);
  const [saveMessage, setSaveMessage] = useState(
    "Last saved on March 24, 2026 at 10:18 AM.",
  );

  const hasUnsavedChanges =
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const markDirty = () => {
    setSaveMessage("Draft changes are ready to be saved.");
  };

  const updateGeneral = <K extends GeneralKey>(
    field: K,
    value: SettingsState["general"][K],
  ) => {
    setSettings((current) => ({
      ...current,
      general: {
        ...current.general,
        [field]: value,
      },
    }));
    markDirty();
  };

  const updatePermission = (field: PermissionKey, value: boolean) => {
    setSettings((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [field]: value,
      },
    }));
    markDirty();
  };

  const updateNotification = (field: NotificationKey, value: boolean) => {
    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [field]: value,
      },
    }));
    markDirty();
  };

  const updateSecurity = <K extends SecurityKey>(
    field: K,
    value: SettingsState["security"][K],
  ) => {
    setSettings((current) => ({
      ...current,
      security: {
        ...current.security,
        [field]: value,
      },
    }));
    markDirty();
  };

  const updatePlatform = (field: PlatformKey, value: boolean) => {
    setSettings((current) => ({
      ...current,
      platform: {
        ...current.platform,
        [field]: value,
      },
    }));
    markDirty();
  };

  const updateAppearance = <K extends AppearanceKey>(
    field: K,
    value: SettingsState["appearance"][K],
  ) => {
    setSettings((current) => ({
      ...current,
      appearance: {
        ...current.appearance,
        [field]: value,
      },
    }));
    markDirty();
  };

  const handleSave = () => {
    setSavedSettings(settings);
    setSaveMessage("Settings saved successfully on March 24, 2026 at 10:24 AM.");
  };

  const enabledPermissionCount = Object.values(settings.permissions).filter(
    Boolean,
  ).length;
  const enabledNotificationCount = Object.values(settings.notifications).filter(
    Boolean,
  ).length;
  const enabledPlatformCount = Object.values(settings.platform).filter(Boolean)
    .length;

  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading StudyFlow AI settings..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_48%,#eff6ff_120%)] p-6 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_58%)]" />
          <div className="absolute -left-12 top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                Admin Settings Panel
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Settings
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/85 sm:text-base">
                  Configure the core platform rules, permissions, alerts, security,
                  AI modules, and visual preferences that shape the StudyFlow AI
                  admin experience.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-100/90">
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {settings.general.maintenanceMode ? "Maintenance mode on" : "Platform live"}
                </span>
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {enabledPlatformCount}/4 platform modules enabled
                </span>
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {settings.security.enforceTwoFactor
                    ? "2FA enforced"
                    : "2FA optional"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:items-end">
              <Button
                className="h-11 rounded-2xl bg-white px-5 text-slate-950 shadow-lg shadow-slate-950/10 hover:bg-slate-100 disabled:bg-white/70 disabled:text-slate-500"
                disabled={!hasUnsavedChanges}
                onClick={handleSave}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <p className="max-w-xs text-sm leading-6 text-slate-100/85">
                {saveMessage}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 2xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <SectionCard
              description="Maintain the core identity and operational behavior of the StudyFlow AI platform."
              icon={<Settings2 className="h-5 w-5" />}
              title="General Settings"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field htmlFor="app-name" label="App name">
                  <input
                    className={inputClassName}
                    id="app-name"
                    onChange={(event) =>
                      updateGeneral("appName", event.target.value)
                    }
                    value={settings.general.appName}
                  />
                </Field>

                <Field htmlFor="support-email" label="Support email">
                  <input
                    className={inputClassName}
                    id="support-email"
                    onChange={(event) =>
                      updateGeneral("supportEmail", event.target.value)
                    }
                    type="email"
                    value={settings.general.supportEmail}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field htmlFor="platform-description" label="Platform description">
                    <textarea
                      className={textareaClassName}
                      id="platform-description"
                      onChange={(event) =>
                        updateGeneral("platformDescription", event.target.value)
                      }
                      rows={5}
                      value={settings.general.platformDescription}
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <ToggleRow
                    checked={settings.general.maintenanceMode}
                    description="Temporarily restrict learner access while admins run platform maintenance or releases."
                    label="Maintenance mode"
                    onToggle={() =>
                      updateGeneral(
                        "maintenanceMode",
                        !settings.general.maintenanceMode,
                      )
                    }
                    tone="amber"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="Control which workflows and platform capabilities are available to each user role."
              icon={<UserCog className="h-5 w-5" />}
              title="User Permissions"
            >
              <div className="grid gap-5 xl:grid-cols-3">
                {permissionGroups.map((group) => {
                  const GroupIcon = group.icon;

                  return (
                    <div
                      className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5"
                      key={group.title}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
                          <GroupIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-base font-semibold text-slate-950">
                            {group.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Fine-tune access for this role group.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-4">
                        {group.items.map((item) => (
                          <ToggleRow
                            checked={settings.permissions[item.key]}
                            description={item.description}
                            key={item.key}
                            label={item.label}
                            onToggle={() =>
                              updatePermission(
                                item.key,
                                !settings.permissions[item.key],
                              )
                            }
                            tone="slate"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              description="Protect administrative access with stronger authentication and session controls."
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Security Settings"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field htmlFor="session-timeout" label="Session timeout">
                  <select
                    className={selectClassName}
                    id="session-timeout"
                    onChange={(event) =>
                      updateSecurity(
                        "sessionTimeout",
                        event.target.value as SessionTimeout,
                      )
                    }
                    value={settings.security.sessionTimeout}
                  >
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="4 hours">4 hours</option>
                  </select>
                </Field>

                <Field htmlFor="password-policy" label="Password policy">
                  <select
                    className={selectClassName}
                    id="password-policy"
                    onChange={(event) =>
                      updateSecurity(
                        "passwordPolicy",
                        event.target.value as PasswordPolicy,
                      )
                    }
                    value={settings.security.passwordPolicy}
                  >
                    <option value="Balanced">Balanced</option>
                    <option value="Strong">Strong</option>
                    <option value="Strict">Strict</option>
                  </select>
                </Field>

                <div className="md:col-span-2 space-y-4">
                  <ToggleRow
                    checked={settings.security.enforceTwoFactor}
                    description="Require two-factor authentication for all admin and privileged moderator accounts."
                    label="Two-factor auth enforcement"
                    onToggle={() =>
                      updateSecurity(
                        "enforceTwoFactor",
                        !settings.security.enforceTwoFactor,
                      )
                    }
                    tone="emerald"
                  />
                  <ToggleRow
                    checked={settings.security.loginAlerts}
                    description="Send immediate alerts whenever a new device or unfamiliar location signs in."
                    label="Login alerts"
                    onToggle={() =>
                      updateSecurity(
                        "loginAlerts",
                        !settings.security.loginAlerts,
                      )
                    }
                    tone="sky"
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-8">
            <SectionCard
              description="Choose how StudyFlow AI should alert admins about operational and billing events."
              icon={<Bell className="h-5 w-5" />}
              title="Notification Settings"
            >
              <div className="space-y-4">
                <ToggleRow
                  checked={settings.notifications.emailAlerts}
                  description="Receive important platform updates through admin inbox notifications."
                  label="Email alerts"
                  onToggle={() =>
                    updateNotification(
                      "emailAlerts",
                      !settings.notifications.emailAlerts,
                    )
                  }
                  tone="sky"
                />
                <ToggleRow
                  checked={settings.notifications.pushAlerts}
                  description="Trigger instant push alerts for urgent moderation and system events."
                  label="Push alerts"
                  onToggle={() =>
                    updateNotification(
                      "pushAlerts",
                      !settings.notifications.pushAlerts,
                    )
                  }
                  tone="slate"
                />
                <ToggleRow
                  checked={settings.notifications.reportNotifications}
                  description="Notify admins when critical reports or abuse escalations are created."
                  label="Report notifications"
                  onToggle={() =>
                    updateNotification(
                      "reportNotifications",
                      !settings.notifications.reportNotifications,
                    )
                  }
                  tone="amber"
                />
                <ToggleRow
                  checked={settings.notifications.billingAlerts}
                  description="Keep billing admins updated on renewals, failed payments, and invoices."
                  label="Billing alerts"
                  onToggle={() =>
                    updateNotification(
                      "billingAlerts",
                      !settings.notifications.billingAlerts,
                    )
                  }
                  tone="emerald"
                />
              </div>
            </SectionCard>

            <SectionCard
              description="Enable or pause major product modules that power learning, monetization, and mentor workflows."
              icon={<Brain className="h-5 w-5" />}
              title="AI / Platform Settings"
            >
              <div className="space-y-4">
                <ToggleRow
                  checked={settings.platform.aiRecommendations}
                  description="Show adaptive AI recommendations throughout study plans and review flows."
                  label="Enable AI recommendations"
                  onToggle={() =>
                    updatePlatform(
                      "aiRecommendations",
                      !settings.platform.aiRecommendations,
                    )
                  }
                  tone="emerald"
                />
                <ToggleRow
                  checked={settings.platform.quizzes}
                  description="Keep the quiz engine active for subject practice and progress evaluation."
                  label="Enable quizzes"
                  onToggle={() =>
                    updatePlatform("quizzes", !settings.platform.quizzes)
                  }
                  tone="sky"
                />
                <ToggleRow
                  checked={settings.platform.mentorTools}
                  description="Give mentors access to performance dashboards, notes, and intervention tools."
                  label="Enable mentor tools"
                  onToggle={() =>
                    updatePlatform(
                      "mentorTools",
                      !settings.platform.mentorTools,
                    )
                  }
                  tone="slate"
                />
                <ToggleRow
                  checked={settings.platform.subscriptions}
                  description="Allow subscription upgrades, invoicing, and premium feature gating."
                  label="Enable subscriptions"
                  onToggle={() =>
                    updatePlatform(
                      "subscriptions",
                      !settings.platform.subscriptions,
                    )
                  }
                  tone="amber"
                />
              </div>
            </SectionCard>

            <SectionCard
              description="Set the visual direction and density of the admin workspace for a premium operating experience."
              icon={<Palette className="h-5 w-5" />}
              title="Appearance Preferences"
            >
              <div className="space-y-5">
                <Field htmlFor="theme-mode" label="Theme mode">
                  <select
                    className={selectClassName}
                    id="theme-mode"
                    onChange={(event) =>
                      updateAppearance(
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

                <Field htmlFor="brand-color" label="Brand color">
                  <select
                    className={selectClassName}
                    id="brand-color"
                    onChange={(event) =>
                      updateAppearance(
                        "brandColor",
                        event.target.value as BrandColor,
                      )
                    }
                    value={settings.appearance.brandColor}
                  >
                    <option value="Ocean Blue">Ocean Blue</option>
                    <option value="Emerald">Emerald</option>
                    <option value="Slate">Slate</option>
                    <option value="Amber">Amber</option>
                  </select>
                </Field>

                <Field htmlFor="dashboard-density" label="Dashboard density">
                  <select
                    className={selectClassName}
                    id="dashboard-density"
                    onChange={(event) =>
                      updateAppearance(
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

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
                        <SunMedium className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Theme
                        </p>
                        <p className="text-sm text-slate-500">
                          {settings.appearance.themeMode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
                        <Palette className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Brand color
                        </p>
                        <p className="text-sm text-slate-500">
                          {settings.appearance.brandColor}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
                        <LayoutGrid className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Density
                        </p>
                        <p className="text-sm text-slate-500">
                          {settings.appearance.dashboardDensity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="A quick operational snapshot of the most important configuration areas currently active."
              icon={<Sparkles className="h-5 w-5" />}
              title="Configuration Summary"
            >
              <div className="grid gap-4">
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Current platform status
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {settings.general.maintenanceMode
                          ? "Maintenance mode is enabled for controlled rollout work."
                          : "The platform is open and available to learners."}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl text-white",
                        settings.general.maintenanceMode
                          ? "bg-amber-500"
                          : "bg-emerald-600",
                      )}
                    >
                      {settings.general.maintenanceMode ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Enabled permissions
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {enabledPermissionCount}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Active alert channels
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {enabledNotificationCount}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Platform modules enabled
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {enabledPlatformCount}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Security posture
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {settings.security.passwordPolicy}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_55%,#f8fafc_140%)] p-5 text-white shadow-[0_20px_50px_-35px_rgba(15,23,42,0.65)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white/90">
                        Workspace visual mode
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        {settings.appearance.themeMode} / {settings.appearance.brandColor}
                      </p>
                      <p className="mt-2 text-sm text-slate-100/80">
                        Density: {settings.appearance.dashboardDensity}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 backdrop-blur">
                        <MoonStar className="h-5 w-5" />
                      </span>
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 backdrop-blur">
                        <AppWindow className="h-5 w-5" />
                      </span>
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
