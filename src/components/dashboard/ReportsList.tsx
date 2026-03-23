import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminReport } from "@/data/admin-dashboard";

interface ReportsListProps {
  reports: AdminReport[];
}

const statusStyles: Record<AdminReport["status"], string> = {
  Open: "border-rose-200 bg-rose-50 text-rose-700",
  Investigating: "border-amber-200 bg-amber-50 text-amber-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function ReportsList({ reports }: ReportsListProps) {
  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-[24px] border border-white/60 bg-white/75 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {report.type}
                </Badge>
                <Badge
                  className={`rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] ${statusStyles[report.status]}`}
                >
                  {report.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                  {report.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Reported by {report.reportedBy} on {report.submittedAt}
                </p>
              </div>
            </div>

            <Link href={report.reviewHref}>
              <Button
                variant="outline"
                className="w-full rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50 md:w-auto"
              >
                Review
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
