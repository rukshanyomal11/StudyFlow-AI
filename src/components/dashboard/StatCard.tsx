import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string | LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  helperText?: string;
  accentClassName?: string;
  className?: string;
}

const iconRegistry = Icons as unknown as Record<string, LucideIcon>;

function renderIcon(icon: string | LucideIcon, className: string) {
  const IconComponent =
    typeof icon === "string" ? iconRegistry[icon] ?? Sparkles : icon;

  return <IconComponent className={className} />;
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  helperText,
  accentClassName,
  className = "",
}: StatCardProps) {
  const TrendIcon = trend?.isPositive ? TrendingUp : TrendingDown;

  return (
    <Card
      className={`card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {value}
            </h3>

            {trend ? (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <TrendIcon
                  className={`h-4 w-4 ${
                    trend.isPositive ? "text-emerald-600" : "text-rose-500"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    trend.isPositive ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {trend.isPositive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-slate-500">
                  {trend.label ?? "vs last week"}
                </span>
              </div>
            ) : helperText ? (
              <p className="mt-3 text-sm text-slate-500">{helperText}</p>
            ) : (
              <div className="mt-3 h-5" />
            )}
          </div>

          <div
            className={`inline-flex rounded-2xl p-3 text-white shadow-lg ${
              accentClassName ??
              "bg-gradient-to-br from-slate-900 via-slate-800 to-teal-700"
            }`}
          >
            {renderIcon(icon, "h-6 w-6")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
