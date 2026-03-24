"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  Camera,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  KeyRound,
  Mail,
  PencilLine,
  Save,
  ShieldAlert,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { studentSidebarLinks } from "@/data/sidebarLinks";
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

interface StudentProfileState {
  fullName: string;
  email: string;
  studyLevel: string;
  preferredStudyTime: string;
  goals: string;
  streak: number;
  totalStudyHours: number;
  completedTasks: number;
  twoFactorEnabled: boolean;
  avatarUrl: string | null;
}

interface ProfileFormState {
  fullName: string;
  email: string;
  studyLevel: string;
  preferredStudyTime: string;
  goals: string;
  avatarUrl: string | null;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_PROFILE: StudentProfileState = {
  fullName: "Nethmi Jayawardena",
  email: "nethmi.j@studyflow.ai",
  studyLevel: "Grade 12 • Advanced Level",
  preferredStudyTime: "6:30 PM - 9:00 PM",
  goals:
    "Finish Physics revision before the monthly exam, complete 3 Math practice sets each week, and keep a 14-day study streak active.",
  streak: 18,
  totalStudyHours: 146,
  completedTasks: 284,
  twoFactorEnabled: true,
  avatarUrl: null,
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

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

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.22)]">
      <CardHeader className="pb-5">
        <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
        <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {description}
        </CardDescription>
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
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.25)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
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

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    fullName: INITIAL_PROFILE.fullName,
    email: INITIAL_PROFILE.email,
    studyLevel: INITIAL_PROFILE.studyLevel,
    preferredStudyTime: INITIAL_PROFILE.preferredStudyTime,
    goals: INITIAL_PROFILE.goals,
    avatarUrl: INITIAL_PROFILE.avatarUrl,
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const editFormRef = useRef<HTMLDivElement | null>(null);

  const handleProfileChange = (
    field: keyof ProfileFormState,
    value: string | null,
  ) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
    setProfileMessage("");
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
      }
    };
    reader.readAsDataURL(file);
    setProfileMessage("");
  };

  const handleSaveProfile = () => {
    setProfile((current) => ({
      ...current,
      ...profileForm,
    }));
    setProfileMessage("Profile details saved successfully.");
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
    setSecurityMessage("Password updated and account security refreshed.");
  };

  const handleToggleTwoFactor = () => {
    setProfile((current) => ({
      ...current,
      twoFactorEnabled: !current.twoFactorEnabled,
    }));
    setSecurityMessage(
      profile.twoFactorEnabled
        ? "Two-factor authentication has been turned off."
        : "Two-factor authentication is now enabled.",
    );
  };

  const scrollToEditForm = () => {
    setProfileForm({
      fullName: profile.fullName,
      email: profile.email,
      studyLevel: profile.studyLevel,
      preferredStudyTime: profile.preferredStudyTime,
      goals: profile.goals,
      avatarUrl: profile.avatarUrl,
    });
    setProfileMessage("");
    editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your student profile..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_44%,#dbeafe_120%)] p-6 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24 rounded-[28px] border-4 border-white/15 shadow-2xl">
                {profile.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
                ) : null}
                <AvatarFallback className="rounded-[24px] bg-white/15 text-2xl font-semibold text-white">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-3">
                <Badge className="border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                  Student Profile
                </Badge>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {profile.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-100/90">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {profile.studyLevel}
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="h-11 rounded-2xl bg-white px-5 text-slate-950 shadow-lg shadow-slate-950/10 hover:bg-slate-100"
              onClick={scrollToEditForm}
            >
              <PencilLine className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            accentClassName="from-orange-500 to-rose-500"
            icon={<Flame className="h-5 w-5" />}
            label="Streak"
            value={`${profile.streak} days`}
          />
          <StatCard
            accentClassName="from-sky-600 to-cyan-500"
            icon={<Clock3 className="h-5 w-5" />}
            label="Total Study Hours"
            value={`${profile.totalStudyHours} hrs`}
          />
          <StatCard
            accentClassName="from-emerald-600 to-teal-500"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completed Tasks"
            value={`${profile.completedTasks}`}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
          <SectionCard
            description="A clear snapshot of your current learning identity and study preferences in StudyFlow AI."
            title="Personal Info"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Full Name
                </p>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  {profile.fullName}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Email
                </p>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  {profile.email}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Study Level
                </p>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  {profile.studyLevel}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Preferred Study Time
                </p>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  {profile.preferredStudyTime}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Goals
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-900">
                  {profile.goals}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            description="Keep your account protected with a strong password and an extra verification step."
            title="Security"
          >
            <div className="space-y-5">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Two-factor authentication
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Add an extra layer of protection to your StudyFlow AI account.
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                      profile.twoFactorEnabled
                        ? "border-transparent bg-emerald-500 text-white"
                        : "border-transparent bg-amber-500 text-white",
                    )}
                  >
                    {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl text-white",
                        profile.twoFactorEnabled
                          ? "bg-emerald-600"
                          : "bg-amber-500",
                      )}
                    >
                      {profile.twoFactorEnabled ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : (
                        <ShieldAlert className="h-5 w-5" />
                      )}
                    </span>
                    <p className="text-sm font-medium text-slate-700">
                      {profile.twoFactorEnabled
                        ? "Extra verification is active."
                        : "Extra verification is currently off."}
                    </p>
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

              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5">
                <p className="text-sm font-semibold text-slate-950">
                  Change password
                </p>
                <div className="mt-4 grid gap-4">
                  <Field htmlFor="current-password" label="Current password">
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
                  <Field htmlFor="new-password" label="New password">
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
                  <Field htmlFor="confirm-password" label="Confirm password">
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

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-500">
                    {securityMessage || "Update your password regularly to stay secure."}
                  </div>
                  <Button
                    className="h-11 rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800"
                    onClick={handlePasswordUpdate}
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div ref={editFormRef}>
          <SectionCard
            description="Refresh your personal details, study preferences, and goals whenever your routine changes."
            title="Edit Profile Form"
          >
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
              <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5">
                <p className="text-sm font-semibold text-slate-900">Avatar</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Upload a profile image that appears across your study workspace.
                </p>

                <div className="mt-5 flex flex-col items-center gap-4">
                  <Avatar className="h-28 w-28 rounded-[30px] border-4 border-white shadow-xl">
                    {profileForm.avatarUrl ? (
                      <AvatarImage
                        src={profileForm.avatarUrl}
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
                    <span className="flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50">
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Image
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field htmlFor="full-name" label="Full name">
                    <input
                      className={inputClassName}
                      id="full-name"
                      onChange={(event) =>
                        handleProfileChange("fullName", event.target.value)
                      }
                      value={profileForm.fullName}
                    />
                  </Field>

                  <Field htmlFor="email" label="Email">
                    <input
                      className={inputClassName}
                      id="email"
                      onChange={(event) =>
                        handleProfileChange("email", event.target.value)
                      }
                      type="email"
                      value={profileForm.email}
                    />
                  </Field>

                  <Field htmlFor="study-level" label="Study level">
                    <input
                      className={inputClassName}
                      id="study-level"
                      onChange={(event) =>
                        handleProfileChange("studyLevel", event.target.value)
                      }
                      value={profileForm.studyLevel}
                    />
                  </Field>

                  <Field htmlFor="study-time" label="Preferred study time">
                    <input
                      className={inputClassName}
                      id="study-time"
                      onChange={(event) =>
                        handleProfileChange(
                          "preferredStudyTime",
                          event.target.value,
                        )
                      }
                      value={profileForm.preferredStudyTime}
                    />
                  </Field>
                </div>

                <Field htmlFor="goals" label="Goals">
                  <textarea
                    className={textareaClassName}
                    id="goals"
                    onChange={(event) =>
                      handleProfileChange("goals", event.target.value)
                    }
                    rows={5}
                    value={profileForm.goals}
                  />
                </Field>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-500">
                    {profileMessage || "Your updates stay local in this demo state."}
                  </div>
                  <Button
                    className="h-11 rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800"
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
      </div>
    </ProtectedDashboardLayout>
  );
}
