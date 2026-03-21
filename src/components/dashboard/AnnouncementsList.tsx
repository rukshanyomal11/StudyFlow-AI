import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Calendar, Users, Plus } from "lucide-react";
import type { Announcement } from "@/data/mentor-dashboard";

interface AnnouncementsListProps {
  announcements: Announcement[];
}

export default function AnnouncementsList({
  announcements,
}: AnnouncementsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Create Announcement Button */}
      <Button className="w-full gap-2 rounded-2xl shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
        <Plus className="w-5 h-5" />
        Create New Announcement
      </Button>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-2xl flex-shrink-0">
                <Megaphone className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {announcement.title}
                  </h4>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {announcement.content}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(announcement.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <Badge variant="secondary" className="text-xs rounded-full">
                      {announcement.recipients}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No announcements yet</p>
        </div>
      )}
    </div>
  );
}
