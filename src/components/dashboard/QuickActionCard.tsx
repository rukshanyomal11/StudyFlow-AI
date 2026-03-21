import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export default function QuickActionCard({
  title,
  description,
  icon,
  href,
  color,
}: QuickActionCardProps) {
  // Dynamically get the icon component
  const IconComponent = (Icons as any)[icon] as LucideIcon;

  return (
    <Link href={href} className="block group">
      <Card className="rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`${color} p-4 rounded-2xl shadow-lg`}>
              {IconComponent && (
                <IconComponent className="w-8 h-8 text-white" />
              )}
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gray-900 dark:group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
