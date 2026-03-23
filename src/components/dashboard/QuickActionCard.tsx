import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string | LucideIcon;
  href: string;
  color?: string;
  badge?: string;
  className?: string;
  footerLabel?: string;
}

export default function QuickActionCard({
  title,
  description,
  icon,
  href,
  color,
  badge,
  className = "",
  footerLabel = "Open",
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block group">
      <Card
        className={`card-surface overflow-hidden rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_80px_rgba(15,23,42,0.14)] ${className}`}
      >
        <CardContent className="flex h-full flex-col p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div
              className={`inline-flex rounded-2xl p-4 text-white shadow-lg ${
                color ??
                "bg-gradient-to-br from-slate-900 via-slate-800 to-teal-700"
              }`}
            >
              {renderIcon(icon, "h-7 w-7")}
            </div>
            {badge ? (
              <Badge className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-600">
                {badge}
              </Badge>
            ) : (
              <ArrowRight className="h-5 w-5 text-slate-400 transition duration-300 group-hover:translate-x-1 group-hover:text-slate-700" />
            )}
          </div>

          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>

          <div className="mt-auto pt-5 text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center gap-2">
              {footerLabel}
              <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const iconRegistry = Icons as unknown as Record<string, LucideIcon>;

function renderIcon(icon: string | LucideIcon, className: string) {
  const IconComponent =
    typeof icon === "string" ? iconRegistry[icon] ?? Sparkles : icon;

  return <IconComponent className={className} />;
}
