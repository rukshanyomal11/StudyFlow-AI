import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, Wallet } from "lucide-react";
import type { AdminRevenueSummary } from "@/data/admin-dashboard";

interface RevenueSummaryCardProps {
  summary: AdminRevenueSummary;
}

export default function RevenueSummaryCard({
  summary,
}: RevenueSummaryCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 text-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
      <div
        className="absolute inset-0 opacity-95"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(241, 184, 75, 0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.22), transparent 26%), linear-gradient(145deg, rgba(15, 23, 42, 1), rgba(17, 94, 89, 0.92))",
        }}
      />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="rounded-full border border-white/12 bg-white/10 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white">
              Subscription & revenue
            </Badge>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight">
              {summary.monthlyRevenue}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-200">
              {summary.note}
            </p>
          </div>

          <div className="inline-flex rounded-2xl border border-white/10 bg-white/10 p-3">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur">
            <p className="text-sm text-slate-300">Free users</p>
            <p className="mt-2 text-2xl font-semibold">{summary.freeUsers}</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Crown className="h-4 w-4 text-amber-300" />
              Premium users
            </div>
            <p className="mt-2 text-2xl font-semibold">{summary.premiumUsers}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-emerald-300/16 bg-emerald-400/10 p-4">
            <p className="text-sm text-emerald-100">Annual run rate</p>
            <p className="mt-2 text-xl font-semibold">{summary.annualRunRate}</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <TrendingUp className="h-4 w-4 text-amber-300" />
              Conversion rate
            </div>
            <p className="mt-2 text-xl font-semibold">{summary.conversionRate}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-300">
          {summary.premiumGrowthLabel}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={summary.planActionHref} className="sm:flex-1">
            <Button className="w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
              {summary.planActionLabel}
            </Button>
          </Link>

          <Link href={summary.secondaryActionHref} className="sm:flex-1">
            <Button
              variant="outline"
              className="w-full rounded-2xl border-white/12 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            >
              Open subscriptions
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
