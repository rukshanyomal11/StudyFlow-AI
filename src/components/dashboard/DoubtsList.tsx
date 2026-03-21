import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Clock } from "lucide-react";
import type { Doubt } from "@/data/mentor-dashboard";

interface DoubtsListProps {
  doubts: Doubt[];
}

export default function DoubtsList({ doubts }: DoubtsListProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-3">
      {doubts.map((doubt) => (
        <div
          key={doubt.id}
          className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
            doubt.isUnread
              ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold text-sm">
                {getInitials(doubt.studentName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {doubt.studentName}
                    </h4>
                    {doubt.isUnread && (
                      <Badge
                        variant="default"
                        className="bg-blue-500 text-white text-xs px-2 py-0 h-5"
                      >
                        New
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs rounded-full mb-2">
                    {doubt.subject}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{doubt.time}</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                {doubt.question}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20"
              >
                <MessageSquare className="w-4 h-4" />
                Reply
              </Button>
            </div>
          </div>
        </div>
      ))}

      {doubts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No pending doubts at the moment</p>
        </div>
      )}
    </div>
  );
}
