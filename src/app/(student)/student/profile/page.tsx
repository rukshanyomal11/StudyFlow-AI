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
  Sparkles,
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
  studyLevel: "Grade 12 - Advanced Level",
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
  "h-12 w-full rounded-2xl border border-sky-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-[0_14px_30px_-22px_rgba(59,130,246,0.18)] transition-all duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[130px] w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-[0_14px_30px_-22px_rgba(59,130,246,0.18)] transition-all duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100";

const primaryButtonClassName =
  "h-11 rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_35%,#7c3aed_70%,#ec4899_100%)] px-5 text-white shadow-[0_20px_42px_-20px_rgba(99,102,241,0.45)] transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]";

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
    <Card
      className={cn(
        "relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.96)_100%)] backdrop-blur-xl shadow-[0_24px_70px_-42px_rgba(99,102,241,0.16)]",
        "before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-sky-300/70 before:to-transparent",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_30%),radial-gradient(circle_at_center,rgba(251,191,36,0.05),transparent_34%)]" />
      <CardHeader className="relative pb-5">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-950">
          {title}
        </CardTitle>
        <CardDescription className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative pt-0">{children}</CardContent>
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
    <label className="space-y-2.5" htmlFor={htmlFor}>
      <span className="text-sm font-semibold tracking-tight text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatCard({
  label,
  value,
  icon,
  accentClassName,
  cardClassName,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accentClassName: string;
  cardClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-slate-200/80 shadow-[0_18px_44px_-30px_rgba(99,102,241,0.14)]",
        cardClassName,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.58),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.20),transparent_42%)]" />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-slate-600">{label}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              {value}
            </p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_18px_34px_-18px_rgba(15,23,42,0.25)]",
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

function InfoCard({
  label,
  value,
  icon,
  iconClassName,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="group rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-5 shadow-[0_14px_30px_-24px_rgba(99,102,241,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-22px_rgba(99,102,241,0.18)]">
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_16px_34px_-18px_rgba(56,189,248,0.30)]",
            iconClassName,
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-slate-500">
            {label}
          </p>
          <div className="mt-3 break-words text-[15px] font-medium leading-7 text-slate-900">
            {value}
          </div>
        </div>
      </div>
    </div>
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
      <div className="space-y-8 pb-10">
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#f8fbff_0%,#f2f8ff_22%,#f7f4ff_52%,#fff8f1_78%,#fffdf9_100%)]" />
        <div className="fixed left-[-80px] top-[120px] -z-10 h-[260px] w-[260px] rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="fixed right-[-60px] top-[220px] -z-10 h-[280px] w-[280px] rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="fixed bottom-[40px] left-[30%] -z-10 h-[240px] w-[240px] rounded-full bg-amber-200/15 blur-3xl" />

        <section className="relative overflow-hidden rounded-[40px] border border-white/85 bg-[linear-gradient(135deg,#ffffff_0%,#eefaff_18%,#eef2ff_44%,#fdf2f8_74%,#fff7ed_100%)] p-6 shadow-[0_28px_80px_-42px_rgba(99,102,241,0.18)] sm:p-8">
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(37,99,235,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="absolute -left-14 top-0 h-44 w-44 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute right-8 top-8 h-40 w-40 rounded-full bg-fuchsia-200/25 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-44 w-44 rounded-full bg-amber-200/25 blur-3xl" />
          <div className="absolute left-1/3 top-8 h-32 w-32 rounded-full bg-violet-200/20 blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_58%)]" />

          <div className="relative">
            <div className="space-y-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  <div className="absolute -inset-2 rounded-[36px] bg-[linear-gradient(135deg,rgba(14,165,233,0.24)_0%,rgba(99,102,241,0.18)_55%,rgba(236,72,153,0.18)_100%)] blur-lg" />
                  <Avatar className="relative h-24 w-24 rounded-[30px] border-4 border-white bg-white shadow-[0_20px_42px_-22px_rgba(14,165,233,0.26)]">
                    {profile.avatarUrl ? (
                      <AvatarImage
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                      />
                    ) : null}
                    <AvatarFallback className="rounded-[26px] bg-[linear-gradient(135deg,#dbeafe_0%,#e9d5ff_100%)] text-2xl font-bold text-sky-700">
                      {getInitials(profile.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-700" />
                    Student Profile
                  </div>

                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                      {profile.fullName}
                    </h1>
                    <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700">
                      Keep your learning identity polished with a cleaner
                      profile, brighter study preferences, and a workspace that
                      feels easy to manage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/88 px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(59,130,246,0.14)] backdrop-blur-sm">
                  <Mail className="h-4 w-4 text-sky-600" />
                  {profile.email}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/88 px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(99,102,241,0.14)] backdrop-blur-sm">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  {profile.studyLevel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/88 px-4 py-2 font-medium text-slate-700 shadow-[0_14px_30px_-22px_rgba(14,165,233,0.16)] backdrop-blur-sm">
                  <Clock3 className="h-4 w-4 text-cyan-600" />
                  Best time: {profile.preferredStudyTime}
                </span>
              </div>

              <div className="rounded-[30px] border border-white/90 bg-white/82 p-5 shadow-[0_24px_56px_-34px_rgba(99,102,241,0.18)] backdrop-blur-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">
                  Profile Focus
                </p>

                <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] text-white">
                        <Clock3 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          Study Rhythm
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {profile.preferredStudyTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#ef4444_100%)] text-white">
                        <Flame className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          Current Streak
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {profile.streak} days active
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10b981_0%,#14b8a6_100%)] text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          Completed Tasks
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {profile.completedTasks} finished
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-[0_14px_28px_-16px_rgba(15,23,42,0.22)]",
                          profile.twoFactorEnabled
                            ? "bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)]"
                            : "bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_100%)]",
                        )}
                      >
                        {profile.twoFactorEnabled ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <ShieldAlert className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          Security
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {profile.twoFactorEnabled ? "2FA enabled" : "2FA disabled"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className={cn(primaryButtonClassName, "mt-5 justify-center")}
                  onClick={scrollToEditForm}
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            accentClassName="from-orange-500 to-rose-500"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(255,237,213,0.82)_45%,rgba(254,205,211,0.72)_100%)]"
            icon={<Flame className="h-5 w-5" />}
            label="Streak"
            value={`${profile.streak} days`}
          />
          <StatCard
            accentClassName="from-sky-600 to-cyan-500"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(224,242,254,0.84)_45%,rgba(217,249,255,0.74)_100%)]"
            icon={<Clock3 className="h-5 w-5" />}
            label="Total Study Hours"
            value={`${profile.totalStudyHours} hrs`}
          />
          <StatCard
            accentClassName="from-emerald-600 to-teal-500"
            cardClassName="bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(220,252,231,0.82)_45%,rgba(204,251,241,0.72)_100%)]"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completed Tasks"
            value={`${profile.completedTasks}`}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
          <SectionCard
            title="Personal Info"
            description="A clear snapshot of your current learning identity and study preferences in StudyFlow AI."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                icon={<UserRound className="h-5 w-5" />}
                iconClassName="bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)]"
                label="Full Name"
                value={<p className="font-semibold">{profile.fullName}</p>}
              />
              <InfoCard
                icon={<Mail className="h-5 w-5" />}
                iconClassName="bg-[linear-gradient(135deg,#8b5cf6_0%,#ec4899_100%)]"
                label="Email"
                value={<p className="font-semibold">{profile.email}</p>}
              />
              <InfoCard
                icon={<GraduationCap className="h-5 w-5" />}
                iconClassName="bg-[linear-gradient(135deg,#14b8a6_0%,#10b981_100%)]"
                label="Study Level"
                value={<p className="font-semibold">{profile.studyLevel}</p>}
              />
              <InfoCard
                icon={<Clock3 className="h-5 w-5" />}
                iconClassName="bg-[linear-gradient(135deg,#f97316_0%,#ef4444_100%)]"
                label="Preferred Study Time"
                value={
                  <p className="font-semibold">{profile.preferredStudyTime}</p>
                }
              />
              <div className="md:col-span-2">
                <InfoCard
                  icon={<Target className="h-5 w-5" />}
                  iconClassName="bg-[linear-gradient(135deg,#06b6d4_0%,#3b82f6_100%)]"
                  label="Goals"
                  value={<p className="font-medium">{profile.goals}</p>}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Security"
            description="Keep your account protected with a strong password and an extra verification step."
          >
            <div className="space-y-5">
              <div className="rounded-[26px] border border-sky-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(240,253,250,0.94)_100%)] p-5 shadow-[0_16px_36px_-28px_rgba(20,184,166,0.16)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-slate-950">
                      Two-factor authentication
                    </p>
                    <p className="mt-1 text-base leading-7 text-slate-600">
                      Add an extra layer of protection to your StudyFlow AI
                      account.
                    </p>
                  </div>

                  <Badge
                    className={cn(
                      "px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.18em]",
                      profile.twoFactorEnabled
                        ? "border-transparent bg-slate-900 text-white"
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
                        "flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_14px_28px_-16px_rgba(15,23,42,0.22)]",
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
                    <p className="text-base font-semibold text-slate-700">
                      {profile.twoFactorEnabled
                        ? "Extra verification is active."
                        : "Extra verification is currently off."}
                    </p>
                  </div>

                  <Button
                    className={cn(
                      "h-11 rounded-2xl px-5 font-semibold text-slate-900 shadow-sm transition hover:brightness-105",
                      profile.twoFactorEnabled
                        ? "bg-white border border-slate-200 hover:bg-slate-50"
                        : "bg-emerald-600 text-white hover:bg-emerald-700",
                    )}
                    onClick={handleToggleTwoFactor}
                  >
                    {profile.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </div>
              </div>

              <div className="rounded-[26px] border border-sky-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(239,246,255,0.94)_100%)] p-5 shadow-[0_16px_36px_-28px_rgba(59,130,246,0.14)]">
                <p className="text-lg font-bold text-slate-950">
                  Change password
                </p>

                <div className="mt-4 grid gap-4">
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

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    {securityMessage ||
                      "Update your password regularly to stay secure."}
                  </div>

                  <Button
                    className={primaryButtonClassName}
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
            title="Edit Profile Form"
            description="Refresh your personal details, study preferences, and goals whenever your routine changes."
          >
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(224,242,254,0.72)_28%,rgba(237,233,254,0.68)_62%,rgba(252,231,243,0.66)_100%)] p-5 shadow-[0_18px_40px_-28px_rgba(99,102,241,0.14)]">
                <p className="text-lg font-bold text-slate-900">Avatar</p>
                <p className="mt-2 text-base leading-8 text-slate-600">
                  Upload a profile image that appears across your study
                  workspace.
                </p>

                <div className="mt-5 flex flex-col items-center gap-4">
                  <Avatar className="h-28 w-28 rounded-[30px] border-4 border-white shadow-[0_20px_40px_-24px_rgba(37,99,235,0.28)]">
                    {profileForm.avatarUrl ? (
                      <AvatarImage
                        src={profileForm.avatarUrl}
                        alt={profileForm.fullName}
                      />
                    ) : null}
                    <AvatarFallback className="rounded-[26px] bg-[linear-gradient(135deg,#dbeafe_0%,#ede9fe_100%)] text-2xl font-bold text-sky-700">
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
                    <span className="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-sky-700 shadow-sm transition hover:bg-slate-50">
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
                  <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    {profileMessage ||
                      "Your updates stay local in this demo state."}
                  </div>

                  <Button
                    className={primaryButtonClassName}
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
