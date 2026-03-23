"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, ShieldCheck, Sparkles } from "lucide-react";

type HeaderButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "primary"
  | "success"
  | "danger";

interface DashboardHeaderAction {
  label: string;
  href: string;
  icon?: string | LucideIcon;
  variant?: HeaderButtonVariant;
  className?: string;
}

interface DashboardHeaderProps {
  mentorName?: string;
  adminName?: string;
  badge?: string;
  title?: string;
  description?: string;
  actions?: DashboardHeaderAction[];
  className?: string;
}

const iconRegistry = Icons as unknown as Record<string, LucideIcon>;

const defaultMentorActions: DashboardHeaderAction[] = [
  {
    label: "Manage Content",
    href: "/mentor/content",
    icon: "FolderOpen",
    variant: "default",
    className:
      "border-[color:var(--accent)] bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-strong)]",
  },
  {
    label: "View Quizzes",
    href: "/mentor/quizzes",
    icon: "FileQuestion",
    variant: "secondary",
    className: "bg-white text-slate-950 hover:bg-slate-100",
  },
  {
    label: "View Students",
    href: "/mentor/students",
    icon: "Users",
    variant: "outline",
    className:
      "border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white",
  },
];

function renderIcon(icon: string | LucideIcon | undefined, className: string) {
  const IconComponent =
    typeof icon === "string" ? iconRegistry[icon] ?? Sparkles : icon ?? Sparkles;

  return <IconComponent className={className} />;
}

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function DashboardHeader({
  mentorName,
  adminName,
  badge,
  title,
  description,
  actions,
  className = "",
}: DashboardHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isAdminView = Boolean(adminName);
  const name = adminName ?? mentorName ?? "Mentor";
  const resolvedTitle =
    title ??
    (isAdminView ? `${getTimeGreeting()}, ${name}` : `Welcome back, ${name}`);
  const resolvedDescription =
    description ??
    (isAdminView
      ? "Monitor platform health, keep community activity moving, and make sure every learner touchpoint across StudyFlow AI stays polished."
      : "Keep your classroom momentum high with quick access to student activity, content tools, and the latest teaching updates.");
  const resolvedBadge =
    badge ?? (isAdminView ? "Admin Command Center" : "Mentor Workspace");
  const resolvedActions = actions ?? defaultMentorActions;

  return (
    <Card
      className={`relative overflow-hidden rounded-[32px] border border-white/15 bg-slate-950 text-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] ${className}`}
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(241, 184, 75, 0.28), transparent 26%), radial-gradient(circle at 85% 20%, rgba(43, 122, 120, 0.28), transparent 24%), linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(12, 74, 110, 0.92))",
        }}
      />

      <CardContent className="relative p-8 md:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
              <Badge className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-white">
                <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                {resolvedBadge}
              </Badge>

              <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-slate-200 backdrop-blur">
                <CalendarDays className="h-4 w-4" />
                <span>{currentDate}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                {resolvedTitle}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
                {resolvedDescription}
              </p>
            </div>
          </div>

          {resolvedActions.length > 0 ? (
            <div className="flex flex-wrap gap-3 xl:max-w-[520px] xl:justify-end">
              {resolvedActions.map((action) => {
                return (
                  <Link key={action.label} href={action.href}>
                    <Button
                      variant={action.variant ?? "outline"}
                      size="lg"
                      className={`h-12 rounded-2xl border border-white/12 px-5 text-sm font-semibold shadow-none transition duration-200 hover:-translate-y-0.5 ${action.className ?? ""}`}
                    >
                      {renderIcon(action.icon, "mr-2 h-4 w-4")}
                      {action.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
