import React from "react";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import type { SystemSettingAction } from "@/data/admin-dashboard";

interface SystemSettingsGridProps {
  items: SystemSettingAction[];
}

export default function SystemSettingsGrid({
  items,
}: SystemSettingsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <QuickActionCard
          key={item.title}
          badge={item.badge}
          color={item.color}
          description={item.description}
          footerLabel={item.footerLabel}
          href={item.href}
          icon={item.icon}
          title={item.title}
        />
      ))}
    </div>
  );
}
