"use client";

import { useRef, useState, useEffect } from "react";
import mentorService from "@/services/mentor.service";
import type { ChangeEvent, ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Camera,
  CheckCircle2,
  Clock3,
  FileQuestion,
  GraduationCap,
  KeyRound,
  Languages,
  Mail,
  Megaphone,
  Palette,
  PencilLine,
  Phone,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { mentorSidebarLinks } from "@/data/sidebarLinks";
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

interface MentorProfileState {
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  bio: string;
  role: string;
  subjectExpertise: string[];
  totalStudents: number;
  quizzesCreated: number;
  materialsUploaded: number;
  announcementsSent: number;
  twoFactorEnabled: boolean;
  theme: ThemePreference;
  notifications: boolean;
  timezone: string;
  language: LanguagePreference;
  avatarUrl: string | null;
}

interface ProfileFormState {
  fullName: string;
  email: string;
  specialization: string;
  bio: string;
  avatarUrl: string | null;
}

interface PreferenceFormState {
  theme: ThemePreference;
  notifications: boolean;
  timezone: string;
  language: LanguagePreference;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_PROFILE: MentorProfileState = {
  fullName: "Dr. Maya Fernando",
  email: "maya.f@studyflow.ai",
  phone: "+94 77 612 4409",
  qualification: "PhD in Applied Physics, University of Moratuwa",
  specialization: "Physics mentoring, exam strategy, and high-yield revision systems",
  bio: "Mentors senior students across physics and interdisciplinary STEM pathways, focusing on concept clarity, confident exam performance, and sustainable study routines inside StudyFlow AI.",
  role: "Mentor",
  subjectExpertise: ["Physics", "Chemistry", "Exam Strategy"],
  totalStudents: 96,
  quizzesCreated: 34,
  materialsUploaded: 58,
  announcementsSent: 27,
  twoFactorEnabled: true,
  theme: "System",
  notifications: true,
  timezone: "Asia/Colombo (GMT+5:30)",
  language: "English",
  avatarUrl: null,
};

const RECENT_SESSIONS: SessionRecord[] = [
  {
    id: "session-01",
    device: "Chrome on Windows 11",
    location: "Colombo, Sri Lanka",
    timestamp: "March 24, 2026 at 9:12 AM",
    active: true,
  },
  {
    id: "session-02",
    device: "Safari on iPad Pro",
    location: "Colombo, Sri Lanka",
    timestamp: "March 23, 2026 at 8:05 PM",
    active: false,
  },
  {
    id: "session-03",
    device: "Edge on MacBook Air",
    location: "Kandy, Sri Lanka",
    timestamp: "March 22, 2026 at 6:44 PM",
    active: false,
  },
];

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[128px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function buildProfileForm(profile: MentorProfileState): ProfileFormState {
  return {
    fullName: profile.fullName,
    email: profile.email,
    specialization: profile.specialization,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
  };
}

function buildPreferenceForm(profile: MentorProfileState): PreferenceFormState {
  return {
    theme: profile.theme,
    notifications: profile.notifications,
    timezone: profile.timezone,
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
        SURFACE_CARD_CLASS_NAME,
        className,
      )}
    >
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

function InfoTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/90 bg-white/92 p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 shadow-sm">
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

function StatCard({
  label,
  value,
  icon,
  accentClassName,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accentClassName: string;
}) {
  return (
    <Card className={cn(SURFACE_CARD_CLASS_NAME, "shadow-[0_20px_55px_-38px_rgba(15,23,42,0.18)]")}>
      <CardContent className="pt-2 pb-5 px-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:!text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:!text-slate-950">
              {value}
            </p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_14px_28px_-16px_rgba(15,23,42,0.4)] -mt-4",
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

export default function MentorProfilePage() {
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    value: ThemePreference | LanguagePreference | boolean | string,
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
      fullName: profileForm.fullName,
      email: profileForm.email,
      specialization: profileForm.specialization,
      bio: profileForm.bio,
      avatarUrl: profileForm.avatarUrl,
    }));
    setProfileMessage("Mentor profile changes saved successfully.");
  };

  const handleSavePreferences = () => {
    setProfile((current) => ({
      ...current,
      theme: preferenceForm.theme,
      notifications: preferenceForm.notifications,
      timezone: preferenceForm.timezone,
      language: preferenceForm.language,
    }));
    setPreferenceMessage("Preferences updated for your mentor workspace.");
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
    setSecurityMessage("Password updated and mentor account security refreshed.");
  };

  const handleToggleTwoFactor = () => {
    const nextValue = !profile.twoFactorEnabled;

    setProfile((current) => ({
      ...current,
      twoFactorEnabled: nextValue,
    }));
    setSecurityMessage(
      nextValue
        ? "Two-factor authentication is now enabled."
        : "Two-factor authentication has been turned off.",
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
      role="mentor"
      links={mentorSidebarLinks}
      loadingMessage="Loading your mentor profile..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(239,246,255,0.98)_52%,rgba(236,253,245,0.98)_100%)] p-6 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.24)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_58%)]" />
          <div className="absolute -left-12 top-10 h-36 w-36 rounded-full bg-sky-100/80 blur-3xl" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24 rounded-[28px] border-4 border-white shadow-[0_24px_50px_-28px_rgba(15,23,42,0.32)]">
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
                    <BookOpen className="h-4 w-4" />
                    {profile.specialization}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {profile.subjectExpertise.map((subject) => (
                    <div
                      className="inline-flex items-center rounded-full border border-sky-200 bg-white/95 px-4 py-2 text-sm font-semibold text-sky-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]"
                      key={subject}
                    >
                      {subject}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:items-end">
              <Button
                className={cn("h-11 rounded-2xl px-5", SECONDARY_BUTTON_CLASS_NAME)}
                onClick={scrollToEditForm}
                type="button"
              >
                <PencilLine className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>

              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Subject Expertise
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {profile.subjectExpertise.join(", ")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            accentClassName="from-indigo-700 to-sky-600"
            icon={<Users className="h-5 w-5" />}
            label="Total Students"
            value={`${profile.totalStudents}`}
          />
          <StatCard
            accentClassName="from-sky-600 to-cyan-500"
            icon={<FileQuestion className="h-5 w-5" />}
            label="Quizzes Created"
            value={`${profile.quizzesCreated}`}
          />
          <StatCard
            accentClassName="from-emerald-600 to-teal-500"
            icon={<Upload className="h-5 w-5" />}
            label="Materials Uploaded"
            value={`${profile.materialsUploaded}`}
          />
          <StatCard
            accentClassName="from-violet-600 to-fuchsia-500"
            icon={<Megaphone className="h-5 w-5" />}
            label="Announcements Sent"
            value={`${profile.announcementsSent}`}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            description="A clean snapshot of your mentor identity, teaching background, and academic focus inside StudyFlow AI."
            title="Personal Information"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <InfoTile
                icon={<UserRound className="h-4 w-4" />}
                label="Full Name"
                value={profile.fullName}
              />
              <InfoTile
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={profile.email}
              />
              <InfoTile
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={profile.phone}
              />
              <InfoTile
                icon={<GraduationCap className="h-4 w-4" />}
                label="Qualification"
                value={profile.qualification}
              />
              <InfoTile
                icon={<BookOpen className="h-4 w-4" />}
                label="Specialization"
                value={profile.specialization}
              />
              <InfoTile
                icon={<Sparkles className="h-4 w-4" />}
                label="Bio"
                value={profile.bio}
              />
            </div>
          </SectionCard>

          <SectionCard
            className="overflow-hidden"
            description="Update your mentor-facing profile details, teaching focus, and profile image from one polished form."
            title="Edit Profile"
          >
            <div className="grid gap-6 xl:grid-cols-[0.44fr_0.56fr]" ref={editFormRef}>
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-5">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-28 w-28 rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    {formAvatar ? (
                      <AvatarImage src={formAvatar} alt={profileForm.fullName} />
                    ) : null}
                    <AvatarFallback className="rounded-[24px] bg-slate-100 text-2xl font-semibold text-slate-700">
                      {getInitials(profileForm.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-4 text-sm font-semibold text-slate-950">
                    Profile Image
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Upload a fresh mentor image to personalize the study
                    experience for your students.
                  </p>
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    ref={fileInputRef}
                    type="file"
                  />
                    <Button
                      className={cn("mt-5 h-10 rounded-2xl px-4", SECONDARY_BUTTON_CLASS_NAME)}
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                      variant="outline"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field htmlFor="mentor-name" label="Full Name">
                    <input
                      className={inputClassName}
                      id="mentor-name"
                      onChange={(event) =>
                        handleProfileInputChange("fullName", event.target.value)
                      }
                      type="text"
                      value={profileForm.fullName}
                    />
                  </Field>

                  <Field htmlFor="mentor-email" label="Email">
                    <input
                      className={inputClassName}
                      id="mentor-email"
                      onChange={(event) =>
                        handleProfileInputChange("email", event.target.value)
                      }
                      type="email"
                      value={profileForm.email}
                    />
                  </Field>
                </div>

                <Field htmlFor="mentor-specialization" label="Specialization">
                  <input
                    className={inputClassName}
                    id="mentor-specialization"
                    onChange={(event) =>
                      handleProfileInputChange("specialization", event.target.value)
                    }
                    type="text"
                    value={profileForm.specialization}
                  />
                </Field>

                <Field htmlFor="mentor-bio" label="Bio">
                  <textarea
                    className={textareaClassName}
                    id="mentor-bio"
                    onChange={(event) =>
                      handleProfileInputChange("bio", event.target.value)
                    }
                    value={profileForm.bio}
                  />
                </Field>

                {profileMessage ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {profileMessage}
                  </div>
                ) : null}

                <Button
                  className={cn("h-11 rounded-2xl px-5", PRIMARY_BUTTON_CLASS_NAME)}
                  onClick={handleSaveProfile}
                  type="button"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <SectionCard
            description="Manage password updates, two-factor protection, and recent login activity across your mentor account."
            title="Security"
          >
            <div className="space-y-6">
              <div className="grid gap-5 md:grid-cols-3">
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

              <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {profile.twoFactorEnabled ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-amber-600" />
                    )}
                    <p className="text-sm font-semibold text-slate-950">
                      Two-Factor Authentication
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {profile.twoFactorEnabled
                      ? "Your mentor account is protected with an extra sign-in verification step."
                      : "Enable a second verification step for stronger account security."}
                  </p>
                </div>

                <Button
                  className={cn(
                    "h-10 rounded-2xl px-4",
                    profile.twoFactorEnabled
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : PRIMARY_BUTTON_CLASS_NAME,
                  )}
                  onClick={handleToggleTwoFactor}
                  type="button"
                >
                  {profile.twoFactorEnabled ? "Enabled" : "Enable 2FA"}
                </Button>
              </div>

              {securityMessage ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
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
                  Change Password
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-950">
                  Recent Login Activity
                </p>
                {RECENT_SESSIONS.map((session) => (
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
                          {session.active ? "Current Session" : "Recent"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {session.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      {session.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            description="Adjust your mentor dashboard behavior, language preferences, and notification habits for day-to-day teaching."
            title="Preferences"
          >
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field htmlFor="theme-preference" label="Theme">
                  <select
                    className={selectClassName}
                    id="theme-preference"
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

                <Field htmlFor="language-preference" label="Language">
                  <select
                    className={selectClassName}
                    id="language-preference"
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
              </div>

              <Field htmlFor="timezone-preference" label="Timezone">
                <input
                  className={inputClassName}
                  id="timezone-preference"
                  onChange={(event) =>
                    handlePreferenceChange("timezone", event.target.value)
                  }
                  type="text"
                  value={preferenceForm.timezone}
                />
              </Field>

              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-slate-700" />
                      <p className="text-sm font-semibold text-slate-950">
                        Notifications
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Receive mentor alerts for new doubts, quiz submissions,
                      announcement engagement, and student activity changes.
                    </p>
                  </div>

                  <Button
                  className={cn(
                    "h-10 rounded-2xl px-4",
                    preferenceForm.notifications
                      ? PRIMARY_BUTTON_CLASS_NAME
                      : SECONDARY_BUTTON_CLASS_NAME,
                  )}
                    onClick={() =>
                      handlePreferenceChange(
                        "notifications",
                        !preferenceForm.notifications,
                      )
                    }
                    type="button"
                    variant={preferenceForm.notifications ? "default" : "outline"}
                  >
                    {preferenceForm.notifications ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoTile
                  icon={<Palette className="h-4 w-4" />}
                  label="Theme"
                  value={preferenceForm.theme}
                />
                <InfoTile
                  icon={<Languages className="h-4 w-4" />}
                  label="Language"
                  value={preferenceForm.language}
                />
                <InfoTile
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Notifications"
                  value={preferenceForm.notifications ? "Enabled" : "Disabled"}
                />
              </div>

              {preferenceMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {preferenceMessage}
                </div>
              ) : null}

                <Button
                  className={cn("h-11 rounded-2xl px-5", PRIMARY_BUTTON_CLASS_NAME)}
                  onClick={handleSavePreferences}
                  type="button"
                >
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
