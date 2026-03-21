import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import SectionCard from "@/components/dashboard/SectionCard";
import StudentOverviewTable from "@/components/dashboard/StudentOverviewTable";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import DoubtsList from "@/components/dashboard/DoubtsList";
import AnnouncementsList from "@/components/dashboard/AnnouncementsList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

// Import dummy data
import {
  dashboardStats,
  recentStudents,
  topPerformers,
  studentsNeedingAttention,
  recentDoubts,
  recentAnnouncements,
  engagementChartData,
  quickActions,
} from "@/data/mentor-dashboard";

export default function MentorDashboardPage() {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <DashboardHeader mentorName="Dr. Sarah Johnson" />

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {dashboardStats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Students Overview Section */}
            <SectionCard
              title="Students Overview"
              description="Recent and assigned students"
              action={
                <Link href="/mentor/students">
                  <Button variant="outline" className="rounded-xl">
                    View All
                  </Button>
                </Link>
              }
            >
              <StudentOverviewTable students={recentStudents} />
            </SectionCard>

            {/* Student Performance Section */}
            <SectionCard
              title="Student Performance"
              description="Weekly engagement and progress tracking"
            >
              <PerformanceChart data={engagementChartData} />

              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Top Performers */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-500 p-2 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Top Performers
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {topPerformers.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-semibold">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student.studyLevel}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white">
                          {student.progress}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Students Needing Attention */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-orange-500 p-2 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Needs Attention
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {studentsNeedingAttention.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs font-semibold">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Weak: {student.weakSubject}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-orange-500 text-white">
                          {student.progress}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Content Management Section */}
            <SectionCard
              title="Content Management"
              description="Quick access to teaching resources"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {quickActions.map((action, index) => (
                  <QuickActionCard
                    key={index}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    href={action.href}
                    color={action.color}
                  />
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Doubts / Messages Section */}
            <SectionCard
              title="Recent Doubts"
              description="Student questions awaiting response"
              action={
                <Badge variant="destructive" className="rounded-full">
                  {recentDoubts.filter((d) => d.isUnread).length} New
                </Badge>
              }
            >
              <DoubtsList doubts={recentDoubts} />
            </SectionCard>

            {/* Announcements Section */}
            <SectionCard
              title="Announcements"
              description="Recent updates and notices"
            >
              <AnnouncementsList announcements={recentAnnouncements} />
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
