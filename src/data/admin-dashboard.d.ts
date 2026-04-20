export interface DashboardAction {
  label: string;
  href: string;
  icon: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export interface AdminStat {
  label: string;
  value: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  helperText?: string;
  accentClassName?: string;
  delta?: string;
  detail?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Mentor" | "Admin";
  status: "Active" | "Pending" | "Suspended";
  lastSeen: string;
  manageHref: string;
}

export interface AdminAnalyticsPoint {
  period: string;
  newUsers: number;
  activeUsers: number;
}

export interface AdminAnalyticsHighlight {
  label: string;
  value: string;
  description: string;
  icon: string;
  accentClassName?: string;
}

export interface AdminReport {
  id: string;
  title: string;
  type: string;
  status: "Open" | "Investigating" | "Resolved";
  reportedBy?: string;
  submittedAt: string;
  reviewHref: string;
}

export interface AdminRevenueSummary {
  freeUsers: string;
  premiumUsers: string;
  monthlyRevenue: string;
  annualRunRate: string;
  conversionRate: string;
  note: string;
  premiumGrowthLabel: string;
  planActionHref: string;
  planActionLabel: string;
  secondaryActionHref: string;
}

export interface SystemSettingAction {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  badge?: string;
  footerLabel?: string;
}
