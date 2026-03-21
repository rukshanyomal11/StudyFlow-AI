import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Upload, Users, Calendar } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  mentorName?: string;
}

export default function DashboardHeader({
  mentorName = "Mentor",
}: DashboardHeaderProps) {
  // Get current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const quickActions = [
    {
      label: "Create Quiz",
      icon: PlusCircle,
      href: "/mentor/quiz/create",
      variant: "default" as const,
    },
    {
      label: "Upload Material",
      icon: Upload,
      href: "/mentor/materials/upload",
      variant: "secondary" as const,
    },
    {
      label: "View Students",
      icon: Users,
      href: "/mentor/students",
      variant: "outline" as const,
    },
  ];

  return (
    <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Welcome Section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {mentorName}! 👋
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              You have <span className="font-semibold text-blue-600">23 pending doubts</span> and{" "}
              <span className="font-semibold text-green-600">142 active students</span>.
              Keep up the great work inspiring young minds!
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant={action.variant}
                    size="lg"
                    className="gap-2 rounded-2xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    {action.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
