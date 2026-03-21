import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ label, value, icon, trend }: StatCardProps) {
  // Dynamically get the icon component
  const IconComponent = (Icons as any)[icon] as LucideIcon;

  return (
    <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {label}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </h3>
            {trend && (
              <div className="flex items-center mt-2">
                {trend.isPositive ? (
                  <Icons.TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <Icons.TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "+" : "-"}
                  {Math.abs(trend.value)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  this week
                </span>
              </div>
            )}
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
            {IconComponent && (
              <IconComponent className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
