import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

export default function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
  contentClassName = "",
  headerClassName = "",
}: SectionCardProps) {
  return (
    <Card
      className={`card-surface rounded-[32px] border border-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${className}`}
    >
      <CardHeader className={`gap-4 pb-5 ${headerClassName}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
