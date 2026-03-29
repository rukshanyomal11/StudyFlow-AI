"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  BadgeCheck,
  Bell,
  Briefcase,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Globe,
  KeyRound,
  Languages,
  LockKeyhole,
  Mail,
  MapPinned,
  MonitorSmartphone,
  Palette,
  PencilLine,
  Phone,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { adminSidebarLinks } from "@/data/sidebarLinks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ThemePreference = "Light" | "Dark" | "System";
type LanguagePreference = "English" | "Sinhala" | "Tamil";

interface SessionRecord {
  id: string;
  device: string;
  location: string;
  timestamp: string;
  active: boolean;
}

interface ActivityRecord {
  id: string;
  title: string;
  timestamp: string;
  description: string;
}

interface AdminProfileState {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  bio: string;
  timezone: string;
  role: string;
  joinDate: string;
  lastLogin: string;
  permissionsCount: number;
  securityStatus: string;
  theme: ThemePreference;
  notifications: boolean;
  language: LanguagePreference;
  twoFactorEnabled: boolean;
  avatarUrl: string | null;
}

interface ProfileFormState {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  bio: string;
  timezone: string;
  avatarUrl: string | null;
}

interface PreferenceFormState {
  theme: ThemePreference;
  notifications: boolean;
  language: LanguagePreference;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_PROFILE: AdminProfileState = {
  fullName: "Amina Perera",
  email: "amina.p@studyflow.ai",
  phone: "+94 77 412 8801",
  jobTitle: "Lead Platform Administrator",
  bio: "Leads platform operations, trust and safety workflows, subscription health, and the end-to-end admin experience across StudyFlow AI.",
  timezone: "Asia/Colombo (GMT+5:30)",
  role: "Super Admin",
  joinDate: "January 12, 2024",
  lastLogin: "March 24, 2026 at 8:42 AM",
  permissionsCount: 18,
  securityStatus: "Protected",
  theme: "System",
  notifications: true,
  language: "English",
  twoFactorEnabled: true,
  avatarUrl: null,
};

const LOGIN_SESSIONS: SessionRecord[] = [
  {
    id: "session-01",
    device: "Chrome on Windows 11",
    location: "Colombo, Sri Lanka",
    timestamp: "March 24, 2026 at 8:42 AM",
    active: true,
  },
  {
    id: "session-02",
    device: "Safari on iPhone 15",
    location: "Colombo, Sri Lanka",
    timestamp: "March 23, 2026 at 9:18 PM",
    active: false,
  },
  {
    id: "session-03",
    device: "Edge on MacBook Pro",
    location: "Kandy, Sri Lanka",
    timestamp: "March 22, 2026 at 4:26 PM",
    active: false,
  },
];

const RECENT_ACTIVITY: ActivityRecord[] = [
  {
    id: "activity-01",
    title: "Resolved critical moderation escalation",
    timestamp: "March 24, 2026 at 9:05 AM",
    description: "Closed a content integrity report affecting Chemistry quiz explanations.",
  },
  {
    id: "activity-02",
    title: "Updated Mentor Pro billing rules",
    timestamp: "March 24, 2026 at 7:48 AM",
    description: "Adjusted plan entitlements for mentors with advanced analytics access.",
  },
  {
    id: "activity-03",
    title: "Approved security permission review",
    timestamp: "March 23, 2026 at 6:12 PM",
    description: "Validated expanded moderation privileges for the trust and safety team.",
  },
];

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const selectClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function buildProfileForm(profile: AdminProfileState): ProfileFormState {
  return {
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    jobTitle: profile.jobTitle,
    bio: profile.bio,
    timezone: profile.timezone,
    avatarUrl: profile.avatarUrl,
  };
}

function buildPreferenceForm(profile: AdminProfileState): PreferenceFormState {
  return {
    theme: profile.theme,
    notifications: profile.notifications,
    language: profile.language,
  };
}

function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-[28px] border-sky-200/80 bg-gradient-to-br from-white via-sky-50/20 to-cyan-50/25 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.26)]",
        className,
      )}
    >
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

function InfoTile({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-sky-100/80 bg-gradient-to-br from-white to-sky-50/40 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-4 text-sm font-medium leading-6 text-slate-900">
        {value}
      </div>
    </div>
  );
}

function OverviewCard({
  label,
  value,
  icon,
  accentClassName,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accentClassName: string;
}) {
  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.28)]">
      <CardContent className="pt-2 pb-5 px-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-200/70 -mt-4",
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

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(
    buildProfileForm(INITIAL_PROFILE),
  );
  const [preferenceForm, setPreferenceForm] = useState<PreferenceFormState>(
    buildPreferenceForm(INITIAL_PROFILE),
  );
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [preferenceMessage, setPreferenceMessage] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const editFormRef = useRef<HTMLDivElement | null>(null);

  const profileAvatar = profile.avatarUrl;
  const formAvatar = profileForm.avatarUrl;

  const handleProfileInputChange = (
    field: keyof ProfileFormState,
    value: string | null,
  ) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
    setProfileMessage("");
  };

  const handlePreferenceChange = (
    field: keyof PreferenceFormState,
    value: ThemePreference | LanguagePreference | boolean,
  ) => {
    setPreferenceForm((current) => ({
      ...current,
      [field]: value,
    }));
    setPreferenceMessage("");
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

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        setProfileForm((current) => ({
          ...current,
          avatarUrl: result,
        }));
        setProfileMessage("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    setProfile((current) => ({
      ...current,
      ...profileForm,
    }));
    setProfileMessage("Profile changes saved successfully.");
  };

  const handleSavePreferences = () => {
    setProfile((current) => ({
      ...current,
      ...preferenceForm,
    }));
    setPreferenceMessage("Preferences updated for this admin workspace.");
  };

  const handlePasswordUpdate = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setSecurityMessage("Complete all password fields before saving.");
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
    setSecurityMessage("Password updated and security check completed.");
  };

  const handleToggleTwoFactor = () => {
    setProfile((current) => {
      const enabled = !current.twoFactorEnabled;

      return {
        ...current,
        twoFactorEnabled: enabled,
        securityStatus: enabled ? "Protected" : "Needs attention",
      };
    });

    setSecurityMessage(
      profile.twoFactorEnabled
        ? "Two-factor authentication has been turned off."
        : "Two-factor authentication is now enabled.",
    );
  };

  const scrollToEditForm = () => {
    setProfileForm(buildProfileForm(profile));
    setPreferenceForm(buildPreferenceForm(profile));
    setProfileMessage("");
    setPreferenceMessage("");
    editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading your admin profile..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#f0f9ff_50%,#ecfdf5_100%)] p-6 shadow-[0_30px_80px_-42px_rgba(14,165,233,0.22)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)]" />
          <div className="absolute -left-12 top-10 h-36 w-36 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24 rounded-[28px] border-4 border-white shadow-[0_24px_50px_rgba(14,165,233,0.14)]">
                {profileAvatar ? (
                  <AvatarImage src={profileAvatar} alt={profile.fullName} />
                ) : null}
                <AvatarFallback className="rounded-[24px] bg-sky-600 text-2xl font-semibold text-white">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    {profile.fullName}
                  </h1>
                  <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-sky-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                    {profile.role}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Joined {profile.joinDate}
                  </span>
                </div>

                <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Manage your StudyFlow AI admin identity, security posture, and
                  workspace preferences from one premium control surface.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:items-end">
              <Button
                className="h-11 rounded-2xl border border-white/15 bg-white px-5 text-slate-950 shadow-lg shadow-slate-950/10 hover:bg-slate-100"
                onClick={scrollToEditForm}
              >
                <PencilLine className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Permissions
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {profile.permissionsCount} active
                  </p>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    Security
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {profile.securityStatus}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            label="Role"
            value={profile.role}
            icon={<ShieldCheck className="h-5 w-5" />}
            accentClassName="from-indigo-700 to-sky-600"
          />
          <OverviewCard
            label="Last Login"
            value={profile.lastLogin}
            icon={<Clock3 className="h-5 w-5" />}
            accentClassName="from-sky-600 to-cyan-500"
          />
          <OverviewCard
            label="Permissions Count"
            value={`${profile.permissionsCount} permissions`}
            icon={<Users className="h-5 w-5" />}
            accentClassName="from-emerald-600 to-teal-500"
          />
          <OverviewCard
            label="Security Status"
            value={profile.securityStatus}
            icon={
              profile.twoFactorEnabled ? (
                <BadgeCheck className="h-5 w-5" />
              ) : (
                <ShieldAlert className="h-5 w-5" />
              )
            }
            accentClassName={
              profile.twoFactorEnabled
                ? "from-amber-500 to-orange-500"
                : "from-rose-500 to-red-500"
            }
          />
        </section>

        <div className="grid gap-8 2xl:grid-cols-[1.3fr_1fr]">
          <div className="space-y-8">
            <SectionCard
              title="Personal Information"
              description="A polished overview of the admin identity currently visible across the StudyFlow AI control surface."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoTile
                  label="Full Name"
                  value={profile.fullName}
                  icon={<UserRound className="h-4 w-4" />}
                />
                <InfoTile
                  label="Email"
                  value={profile.email}
                  icon={<Mail className="h-4 w-4" />}
                />
                <InfoTile
                  label="Phone"
                  value={profile.phone}
                  icon={<Phone className="h-4 w-4" />}
                />
                <InfoTile
                  label="Job Title"
                  value={profile.jobTitle}
                  icon={<Briefcase className="h-4 w-4" />}
                />
                <InfoTile
                  label="Timezone"
                  value={profile.timezone}
                  icon={<Globe className="h-4 w-4" />}
                />
                <InfoTile
                  label="Join Date"
                  value={profile.joinDate}
                  icon={<CalendarDays className="h-4 w-4" />}
                />
                <InfoTile
                  label="Bio"
                  value={profile.bio}
                  icon={<Sparkles className="h-4 w-4" />}
                  className="md:col-span-2"
                />
              </div>
            </SectionCard>

            <div ref={editFormRef}>
              <SectionCard
                title="Profile Edit Form"
                description="Update core profile details, refresh the avatar, and keep the admin workspace identity accurate."
              >
                <div
                  className="grid gap-6 lg:grid-cols-[220px_1fr]"
                  id="profile-edit-form"
                >
                  <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5">
                    <p className="text-sm font-semibold text-slate-900">
                      Profile image
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Upload a clean square image for the admin header, account
                      overview, and moderation trail.
                    </p>

                    <div className="mt-5 flex flex-col items-center gap-4">
                      <Avatar className="h-28 w-28 rounded-[30px] border-4 border-white shadow-xl">
                        {formAvatar ? (
                          <AvatarImage
                            src={formAvatar}
                            alt={profileForm.fullName}
                          />
                        ) : null}
                        <AvatarFallback className="rounded-[26px] bg-slate-200 text-2xl font-semibold text-slate-700">
                          {getInitials(profileForm.fullName)}
                        </AvatarFallback>
                      </Avatar>

                      <label className="w-full">
                        <input
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          type="file"
                        />
                        <span className="flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl border border-sky-300 bg-white px-4 text-sm font-medium text-sky-800 shadow-sm transition hover:bg-sky-50">
                          <Camera className="mr-2 h-4 w-4" />
                          Upload Image
                        </span>
                      </label>

                      <p className="text-center text-xs leading-5 text-slate-500">
                        PNG or JPG up to 5MB. The preview updates before save.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field htmlFor="full-name" label="Full name">
                        <input
                          className={inputClassName}
                          id="full-name"
                          onChange={(event) =>
                            handleProfileInputChange(
                              "fullName",
                              event.target.value,
                            )
                          }
                          value={profileForm.fullName}
                        />
                      </Field>

                      <Field htmlFor="email" label="Email">
                        <input
                          className={inputClassName}
                          id="email"
                          onChange={(event) =>
                            handleProfileInputChange("email", event.target.value)
                          }
                          type="email"
                          value={profileForm.email}
                        />
                      </Field>

                      <Field htmlFor="phone" label="Phone">
                        <input
                          className={inputClassName}
                          id="phone"
                          onChange={(event) =>
                            handleProfileInputChange("phone", event.target.value)
                          }
                          value={profileForm.phone}
                        />
                      </Field>

                      <Field htmlFor="job-title" label="Job title">
                        <input
                          className={inputClassName}
                          id="job-title"
                          onChange={(event) =>
                            handleProfileInputChange(
                              "jobTitle",
                              event.target.value,
                            )
                          }
                          value={profileForm.jobTitle}
                        />
                      </Field>
                    </div>

                    <Field htmlFor="timezone" label="Timezone">
                      <input
                        className={inputClassName}
                        id="timezone"
                        onChange={(event) =>
                          handleProfileInputChange(
                            "timezone",
                            event.target.value,
                          )
                        }
                        value={profileForm.timezone}
                      />
                    </Field>

                    <Field htmlFor="bio" label="Bio">
                      <textarea
                        className={textareaClassName}
                        id="bio"
                        onChange={(event) =>
                          handleProfileInputChange("bio", event.target.value)
                        }
                        rows={5}
                        value={profileForm.bio}
                      />
                    </Field>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-slate-500">
                        {profileMessage ? (
                          <span className="font-medium text-emerald-600">
                            {profileMessage}
                          </span>
                        ) : (
                          "Profile updates stay local to this admin demo state."
                        )}
                      </div>

                      <Button
                        className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                        onClick={handleSaveProfile}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard
              title="Security"
              description="Control password hygiene, two-factor authentication, trusted login sessions, and recent security-sensitive activity."
            >
              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-5 rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">
                        Change password
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Refresh your credentials and maintain a strong security
                        baseline for this admin account.
                      </p>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
                      <LockKeyhole className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="grid gap-4">
                    <Field htmlFor="current-password" label="Current password">
                      <input
                        className={inputClassName}
                        id="current-password"
                        onChange={(event) =>
                          handlePasswordChange(
                            "currentPassword",
                            event.target.value,
                          )
                        }
                        type="password"
                        value={passwordForm.currentPassword}
                      />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field htmlFor="new-password" label="New password">
                        <input
                          className={inputClassName}
                          id="new-password"
                          onChange={(event) =>
                            handlePasswordChange(
                              "newPassword",
                              event.target.value,
                            )
                          }
                          type="password"
                          value={passwordForm.newPassword}
                        />
                      </Field>

                      <Field
                        htmlFor="confirm-password"
                        label="Confirm password"
                      >
                        <input
                          className={inputClassName}
                          id="confirm-password"
                          onChange={(event) =>
                            handlePasswordChange(
                              "confirmPassword",
                              event.target.value,
                            )
                          }
                          type="password"
                          value={passwordForm.confirmPassword}
                        />
                      </Field>
                    </div>
                  </div>

                  <Button
                    className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={handlePasswordUpdate}
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          Two-factor authentication
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Add an extra checkpoint to protect admin workflows and
                          privileged platform controls.
                        </p>
                      </div>
                      <Badge
                        variant={profile.twoFactorEnabled ? "success" : "warning"}
                        className="px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
                      >
                        {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <span
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-2xl text-white",
                            profile.twoFactorEnabled
                              ? "bg-emerald-500"
                              : "bg-amber-500",
                          )}
                        >
                          {profile.twoFactorEnabled ? (
                            <ShieldCheck className="h-5 w-5" />
                          ) : (
                            <ShieldAlert className="h-5 w-5" />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {profile.twoFactorEnabled
                              ? "Extra verification is active"
                              : "Additional protection is recommended"}
                          </p>
                          <p className="text-sm text-slate-500">
                            Security status: {profile.securityStatus}
                          </p>
                        </div>
                      </div>

                      <Button
                        className={cn(
                          "h-11 rounded-2xl px-5 text-white",
                          profile.twoFactorEnabled
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-emerald-600 hover:bg-emerald-700",
                        )}
                        onClick={handleToggleTwoFactor}
                      >
                        {profile.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          Security summary
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Recent account protection updates are surfaced here for
                          quick review.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 text-sm font-medium text-slate-600">
                      {securityMessage || "No pending security alerts for this account."}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
          <div className="space-y-8">
            <SectionCard
              title="Preferences"
              description="Shape how the admin workspace looks and how updates reach you throughout daily operations."
            >
              <div className="space-y-5">
                <Field htmlFor="theme" label="Theme">
                  <select
                    className={selectClassName}
                    id="theme"
                    onChange={(event) =>
                      handlePreferenceChange(
                        "theme",
                        event.target.value as ThemePreference,
                      )
                    }
                    value={preferenceForm.theme}
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
                      handlePreferenceChange(
                        "language",
                        event.target.value as LanguagePreference,
                      )
                    }
                    value={preferenceForm.language}
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </Field>

                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Notifications
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Receive alerts for reports, billing updates, and platform
                        incidents.
                      </p>
                    </div>
                    <button
                      aria-pressed={preferenceForm.notifications}
                      className={cn(
                        "relative h-7 w-12 rounded-full transition",
                        preferenceForm.notifications
                          ? "bg-sky-600"
                          : "bg-slate-300",
                      )}
                      onClick={() =>
                        handlePreferenceChange(
                          "notifications",
                          !preferenceForm.notifications,
                        )
                      }
                      type="button"
                    >
                      <span
                        className={cn(
                          "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition",
                          preferenceForm.notifications
                            ? "left-6"
                            : "left-1",
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <InfoTile
                    label="Theme"
                    value={profile.theme}
                    icon={<Palette className="h-4 w-4" />}
                  />
                  <InfoTile
                    label="Language"
                    value={profile.language}
                    icon={<Languages className="h-4 w-4" />}
                  />
                  <InfoTile
                    label="Alerts"
                    value={profile.notifications ? "Enabled" : "Muted"}
                    icon={<Bell className="h-4 w-4" />}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-500">
                    {preferenceMessage ? (
                      <span className="font-medium text-emerald-600">
                        {preferenceMessage}
                      </span>
                    ) : (
                      "Preference updates apply to this demo admin workspace."
                    )}
                  </div>
                  <Button
                    className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={handleSavePreferences}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Account Overview"
              description="A compact readout of the most important profile and security attributes attached to this admin user."
            >
              <div className="grid gap-4">
                <InfoTile
                  label="Role"
                  value={profile.role}
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
                <InfoTile
                  label="Last Login"
                  value={profile.lastLogin}
                  icon={<Clock3 className="h-4 w-4" />}
                />
                <InfoTile
                  label="Permissions"
                  value={`${profile.permissionsCount} active permissions`}
                  icon={<Users className="h-4 w-4" />}
                />
                <InfoTile
                  label="Security Status"
                  value={profile.securityStatus}
                  icon={<CheckCircle2 className="h-4 w-4" />}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Login Sessions"
              description="Review the recent devices and locations associated with this admin account."
            >
              <div className="space-y-4">
                {LOGIN_SESSIONS.map((session) => (
                  <div
                    className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4"
                    key={session.id}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                          <MonitorSmartphone className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {session.device}
                          </p>
                          <div className="mt-1 space-y-1 text-sm text-slate-500">
                            <p className="flex items-center gap-2">
                              <MapPinned className="h-4 w-4" />
                              {session.location}
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock3 className="h-4 w-4" />
                              {session.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={session.active ? "success" : "outline"}
                        className="px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
                      >
                        {session.active ? "Current session" : "Previous session"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Recent Activity"
              description="A quick view into the latest high-impact actions performed by this admin account."
            >
              <div className="space-y-4">
                {RECENT_ACTIVITY.map((activity) => (
                  <div
                    className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4"
                    key={activity.id}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                        <Sparkles className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold text-slate-950">
                            {activity.title}
                          </p>
                          <span className="text-sm text-slate-500">
                            {activity.timestamp}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
