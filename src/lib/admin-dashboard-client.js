const MONTHLY_PRICING = {
  free: 0,
  pro: 14,
  "mentor pro": 29,
};

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    let message = `Request failed for ${path}`;

    try {
      const payload = await response.json();

      if (typeof payload?.error === "string" && payload.error.trim()) {
        message = payload.error;
      } else if (typeof payload?.message === "string" && payload.message.trim()) {
        message = payload.message;
      }
    } catch {
      // Ignore JSON parsing failures and surface the generic message.
    }

    throw new Error(message);
  }

  return response.json();
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value) {
  return `${value.toFixed(1).replace(/\.0$/, "")}%`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value) {
  if (!value) {
    return "Recently";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function formatRelativeTime(value) {
  if (!value) {
    return "Recently";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  const elapsedMinutes = Math.floor((Date.now() - parsedDate.getTime()) / 60000);

  if (elapsedMinutes < 1) {
    return "Just now";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} mins ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours} hours ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);

  if (elapsedDays === 1) {
    return "Yesterday";
  }

  return `${elapsedDays} days ago`;
}

function normalizeRole(role) {
  if (role === "mentor") {
    return "Mentor";
  }

  if (role === "admin") {
    return "Admin";
  }

  return "Student";
}

function normalizeUserStatus(user) {
  if (!user.isActive) {
    return "Suspended";
  }

  if (user.isEmailVerified === false) {
    return "Pending";
  }

  return "Active";
}

function normalizeReportStatus(status) {
  if (status === "Investigating") {
    return "Investigating";
  }

  if (status === "Resolved" || status === "Dismissed") {
    return "Resolved";
  }

  return "Open";
}

function normalizeReportType(type) {
  if (type === "Community") return "Community";
  if (type === "Content") return "Content";
  if (type === "Billing") return "Billing";
  if (type === "Safety") return "Safety";
  return "Academic";
}

function normalizePlan(plan) {
  return (plan || "free").trim().toLowerCase();
}

function getMonthWindows(months) {
  const windows = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const monthIndex = currentMonth - offset;
    const year = currentYear + Math.floor(monthIndex / 12);
    const normalizedMonth = ((monthIndex % 12) + 12) % 12;
    const start = new Date(year, normalizedMonth, 1, 0, 0, 0, 0);
    const end = new Date(year, normalizedMonth + 1, 0, 23, 59, 59, 999);

    windows.push({
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(start),
      start,
      end,
    });
  }

  return windows;
}

function formatTrend(current, previous) {
  if (previous <= 0) {
    return current > 0 ? "+100%" : "0%";
  }

  const change = ((current - previous) / previous) * 100;
  const prefix = change >= 0 ? "+" : "";

  return `${prefix}${formatPercent(change)}`;
}

function getMonthlyEquivalent(subscription) {
  const planKey = normalizePlan(subscription.plan);
  const basePrice = MONTHLY_PRICING[planKey] ?? 0;

  if (subscription.status === "Canceled") {
    return 0;
  }

  if (typeof subscription.amount === "number" && subscription.amount > 0) {
    return subscription.billingCycle === "Yearly"
      ? subscription.amount / 12
      : subscription.amount;
  }

  return planKey === "free" ? 0 : basePrice;
}

function buildMonthlySeries(users) {
  const windows = getMonthWindows(6);

  return windows.map((window) => {
    const usersUpToWindow = users.filter((user) => {
      if (!user.createdAt) {
        return false;
      }

      const createdAt = new Date(user.createdAt);
      return createdAt <= window.end;
    });

    const usersInWindow = users.filter((user) => {
      if (!user.createdAt) {
        return false;
      }

      const createdAt = new Date(user.createdAt);
      return createdAt >= window.start && createdAt <= window.end;
    });

    return {
      period: window.label,
      newUsers: usersInWindow.length,
      activeUsers: usersUpToWindow.filter((user) => user.isActive).length,
    };
  });
}

function buildRoleCount(users, role) {
  return users.filter((user) => normalizeRole(user.role) === role).length;
}

function buildStats(users, analytics) {
  const monthlyUsers = getMonthWindows(6).map((window) =>
    users.filter((user) => {
      if (!user.createdAt) {
        return false;
      }

      const createdAt = new Date(user.createdAt);
      return createdAt <= window.end;
    }),
  );

  const currentUsers = monthlyUsers.at(-1) ?? [];
  const previousUsers = monthlyUsers.at(-2) ?? currentUsers;

  const currentTotalUsers = analytics.totalUsers ?? currentUsers.length;
  const currentStudents = analytics.totalStudents ?? buildRoleCount(currentUsers, "Student");
  const currentMentors = analytics.totalMentors ?? buildRoleCount(currentUsers, "Mentor");
  const currentActiveUsers = analytics.activeUsers ?? currentUsers.filter((user) => user.isActive).length;
  const currentPremiumUsers = currentUsers.filter((user) => normalizePlan(user.plan) !== "free").length;
  const previousPremiumUsers = previousUsers.filter((user) => normalizePlan(user.plan) !== "free").length;
  const previousActiveUsers = previousUsers.filter((user) => user.isActive).length;
  const previousStudents = buildRoleCount(previousUsers, "Student");
  const previousMentors = buildRoleCount(previousUsers, "Mentor");
  const totalQuizzesCompleted = analytics.totalQuizzesCompleted ?? 0;

  return [
    {
      label: "Total Users",
      value: formatNumber(currentTotalUsers),
      delta: formatTrend(currentTotalUsers, previousUsers.length),
      detail: "vs previous month",
      icon: "Users",
      accentClassName: "from-indigo-700 to-sky-600",
    },
    {
      label: "Total Students",
      value: formatNumber(currentStudents),
      delta: formatTrend(currentStudents, previousStudents),
      detail: "learner accounts tracked",
      icon: "GraduationCap",
      accentClassName: "from-sky-600 to-cyan-500",
    },
    {
      label: "Total Mentors",
      value: formatNumber(currentMentors),
      delta: formatTrend(currentMentors, previousMentors),
      detail: "mentor network growth",
      icon: "Briefcase",
      accentClassName: "from-teal-700 to-emerald-500",
    },
    {
      label: "Active Users Today",
      value: formatNumber(currentActiveUsers),
      delta: formatTrend(currentActiveUsers, previousActiveUsers),
      detail: "accounts currently active",
      icon: "Activity",
      accentClassName: "from-emerald-600 to-teal-500",
    },
    {
      label: "Premium Users",
      value: formatNumber(currentPremiumUsers),
      delta: formatTrend(currentPremiumUsers, previousPremiumUsers),
      detail: "free vs paid plan mix",
      icon: "Crown",
      accentClassName: "from-amber-500 to-orange-500",
    },
    {
      label: "Quizzes Completed",
      value: formatNumber(totalQuizzesCompleted),
      delta: totalQuizzesCompleted > 0 ? "Live" : "0",
      detail: "all-time completions",
      icon: "ClipboardCheck",
      accentClassName: "from-orange-500 to-rose-500",
    },
  ];
}

function buildHeroHighlights(users, reports, analytics, monthlySeries) {
  const lastMonth = monthlySeries.at(-1);
  const premiumUsers = users.filter((user) => normalizePlan(user.plan) !== "free").length;
  const totalUsers = analytics.totalUsers ?? users.length;
  const openReports = reports.filter((report) => report.status === "Open" || report.status === "Investigating").length;
  const premiumConversion = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

  return [
    { label: "Moderation queue", value: `${openReports} items` },
    { label: "Premium conversion", value: formatPercent(premiumConversion) },
    { label: "Study sessions tracked", value: formatNumber(analytics.totalStudySessions ?? 0) },
    { label: "Latest signup month", value: lastMonth?.period ?? "N/A" },
  ];
}

function buildAnalyticsHighlights(analytics) {
  return [
    {
      label: "Most Popular Subject",
      value: analytics.mostPopularSubject?.name ?? "No subject data",
      description: analytics.mostPopularSubject
        ? `${formatNumber(analytics.mostPopularSubject.totalSessions ?? 0)} sessions and ${formatNumber(analytics.mostPopularSubject.totalDuration ?? 0)} minutes logged.`
        : "Subject activity will appear once sessions are recorded.",
      icon: "BookOpen",
      accentClassName: "from-amber-500 to-orange-500",
    },
    {
      label: "Total Study Sessions",
      value: formatNumber(analytics.totalStudySessions ?? 0),
      description: "Tracked across study sessions and progress reviews.",
      icon: "Clock3",
      accentClassName: "from-teal-700 to-emerald-500",
    },
    {
      label: "Quiz Completions",
      value: formatNumber(analytics.totalQuizzesCompleted ?? 0),
      description: "Completed quiz results available in the admin archive.",
      icon: "Sparkles",
      accentClassName: "from-indigo-700 to-sky-600",
    },
  ];
}

function buildRecentUsers(users) {
  return users.slice(0, 5).map((user, index) => ({
    id: user._id ?? user.id ?? `user-${index}`,
    name: user.name?.trim() || "Unnamed User",
    email: user.email?.trim() || "",
    role: normalizeRole(user.role),
    status: normalizeUserStatus(user),
    lastSeen: formatRelativeTime(user.updatedAt ?? user.createdAt),
    manageHref: `/admin/users?focus=${encodeURIComponent(user._id ?? user.id ?? "")}`,
  }));
}

function buildReports(reports) {
  return reports.slice(0, 4).map((report, index) => ({
    id: report._id ?? report.id ?? `report-${index}`,
    title: report.title?.trim() || "Untitled report",
    type: normalizeReportType(report.type),
    status: normalizeReportStatus(report.status),
    submittedAt: formatDate(report.createdAt),
    reviewHref: `/admin/reports?report=${encodeURIComponent(report._id ?? report.id ?? "")}`,
  }));
}

function buildRevenueSummary(users, subscriptions) {
  const premiumUsers = users.filter((user) => normalizePlan(user.plan) !== "free").length;
  const freeUsers = Math.max(users.length - premiumUsers, 0);
  const monthlyRevenueValue = subscriptions.reduce((total, subscription) => total + getMonthlyEquivalent(subscription), 0);
  const annualRunRateValue = monthlyRevenueValue * 12;
  const conversionRate = users.length > 0 ? (premiumUsers / users.length) * 100 : 0;

  return {
    freeUsers: formatNumber(freeUsers),
    premiumUsers: formatNumber(premiumUsers),
    monthlyRevenue: formatCurrency(monthlyRevenueValue),
    annualRunRate: `${formatCurrency(annualRunRateValue)} ARR`,
    conversionRate: formatPercent(conversionRate),
    note: `Premium users make up ${formatPercent(conversionRate)} of the platform and recurring revenue is tracked from ${formatNumber(subscriptions.length)} subscriptions.`,
    premiumGrowthLabel: `+${formatNumber(premiumUsers)} premium accounts currently active.`,
    planActionHref: "/admin/subscriptions",
    planActionLabel: "Manage Plans",
    secondaryActionHref: "/admin/subscriptions",
  };
}

export async function loadAdminDashboardData() {
  const [analyticsResponse, usersResponse, reportsResponse, subscriptionsResponse] =
    await Promise.all([
      fetchJson("/api/admin/analytics"),
      fetchJson("/api/admin/users"),
      fetchJson("/api/admin/reports"),
      fetchJson("/api/admin/subscriptions"),
    ]);

  return {
    analytics: analyticsResponse.analytics ?? {},
    users: usersResponse.users ?? [],
    reports: reportsResponse.reports ?? [],
    subscriptions: subscriptionsResponse.subscriptions ?? [],
  };
}

export function buildAdminDashboardViewModel(source, adminName) {
  const chartData = buildMonthlySeries(source.users);
  const reports = buildReports(source.reports);
  const analytics = source.analytics ?? {};

  return {
    adminName,
    summary: `StudyFlow AI has ${formatNumber(analytics.totalUsers ?? source.users.length)} users, ${formatNumber(analytics.activeUsers ?? 0)} active accounts, and ${formatNumber(reports.filter((report) => report.status === "Open" || report.status === "Investigating").length)} items in the moderation queue.`,
    heroHighlights: buildHeroHighlights(source.users, reports, analytics, chartData),
    stats: buildStats(source.users, analytics),
    recentUsers: buildRecentUsers(source.users),
    chartData,
    analyticsHighlights: buildAnalyticsHighlights(analytics),
    reports,
    revenueSummary: buildRevenueSummary(source.users, source.subscriptions),
  };
}
