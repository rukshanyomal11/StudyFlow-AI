import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Clock } from "lucide-react";
import Link from "next/link";
import type { Student } from "@/data/mentor-dashboard";

interface StudentOverviewTableProps {
  students: Student[];
}

export default function StudentOverviewTable({
  students,
}: StudentOverviewTableProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                Student
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                Study Level
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                Progress
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                Weak Subject
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                Last Active
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {student.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="secondary" className="rounded-full">
                    {student.studyLevel}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <Progress
                      value={student.progress}
                      className="h-2"
                      indicatorClassName={getProgressColor(student.progress)}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px]">
                      {student.progress}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {student.weakSubject}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{student.lastActive}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <Link href={`/mentor/students/${student.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {student.name}
                  </p>
                  <Badge variant="secondary" className="rounded-full mt-1">
                    {student.studyLevel}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Progress</p>
                <div className="flex items-center gap-2">
                  <Progress
                    value={student.progress}
                    className="h-2 flex-1"
                    indicatorClassName={getProgressColor(student.progress)}
                  />
                  <span className="text-sm font-medium">{student.progress}%</span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Weak Subject</p>
                  <p className="font-medium">{student.weakSubject}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Last Active</p>
                  <p className="font-medium">{student.lastActive}</p>
                </div>
              </div>
            </div>

            <Link href={`/mentor/students/${student.id}`}>
              <Button className="w-full gap-2 rounded-xl" variant="outline">
                <Eye className="w-4 h-4" />
                View Details
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
