import React from "react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import SectionCard from "@/components/dashboard/SectionCard";
import AdminUsersTable from "@/components/dashboard/AdminUsersTable";
import AdminAnalyticsChart from "@/components/dashboard/AdminAnalyticsChart";
import ReportsList from "@/components/dashboard/ReportsList";
import RevenueSummaryCard from "@/components/dashboard/RevenueSummaryCard";
import SystemSettingsGrid from "@/components/dashboard/SystemSettingsGrid";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminSidebarLinks } from "@/data/sidebarLinks";
import {
  adminAnalyticsData,
  adminAnalyticsHighlights,
  adminDashboardProfile,
  adminDashboardStats,
  adminHeaderActions,
  adminRecentUsers,
  adminReports,
  adminRevenueSummary,
  adminSystemSettings,
} from "@/data/admin-dashboard";

export default function AdminDashboardPage() {
  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading admin workspace..."
    >
      <div className="mx-auto max-w-[1600px] space-y-8">
        <DashboardHeader
          actions={adminHeaderActions}
          adminName={adminDashboardProfile.adminName}
          badge={adminDashboardProfile.badge}
          description={adminDashboardProfile.overview}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {adminDashboardStats.map((stat) => (
            <StatCard
              key={stat.label}
              accentClassName={stat.accentClassName}
              helperText={stat.helperText}
              icon={stat.icon}
              label={stat.label}
              trend={stat.trend}
              value={stat.value}
            />
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.55fr_1fr]">
          <div className="space-y-8">
            <SectionCard
              action={
                <Link href="/admin/users">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                  >
                    Open user hub
                  </Button>
                </Link>
              }
              description="A live preview of recent platform users, roles, and account states."
              title="User Management Preview"
            >
              <AdminUsersTable users={adminRecentUsers} />
            </SectionCard>

            <SectionCard
              action={
                <Badge className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-600">
                  Last 6 months
                </Badge>
              }
              description="Track platform user growth and active community participation over time."
              title="Platform Analytics"
            >
              <AdminAnalyticsChart data={adminAnalyticsData} />

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {adminAnalyticsHighlights.map((item) => (
                  <StatCard
                    key={item.label}
                    accentClassName={item.accentClassName}
                    helperText={item.description}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              description="Fast access to the core configuration surfaces that shape StudyFlow AI."
              title="System Settings"
            >
              <SystemSettingsGrid items={adminSystemSettings} />
            </SectionCard>
          </div>

          <div className="space-y-8">
            <SectionCard
              action={
                <Link href="/admin/reports">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                  >
                    View all reports
                  </Button>
                </Link>
              }
              description="Recent moderation and platform health reports that need admin visibility."
              title="Reports & Moderation"
            >
              <ReportsList reports={adminReports} />
            </SectionCard>

            <RevenueSummaryCard summary={adminRevenueSummary} />
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
