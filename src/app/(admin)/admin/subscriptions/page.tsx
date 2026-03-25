"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Crown,
  DollarSign,
  MoreHorizontal,
  ReceiptText,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { adminSidebarLinks } from "@/data/sidebarLinks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PlanName = "Free" | "Pro" | "Mentor Pro";
type BillingCycle = "Monthly" | "Yearly";
type PaymentStatus = "Paid" | "Overdue" | "Trialing" | "Canceled";

interface PlanRecord {
  id: string;
  name: PlanName;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  accentClassName: string;
}

interface SubscriberRecord {
  id: string;
  name: string;
  email: string;
  plan: PlanName;
  billingCycle: BillingCycle;
  paymentStatus: PaymentStatus;
  renewalDate: string;
}

interface RevenuePoint {
  month: string;
  revenue: number;
}

interface PlanFormState {
  name: PlanName;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: string;
}

const PLAN_ORDER: PlanName[] = ["Free", "Pro", "Mentor Pro"];

const INITIAL_PLANS: PlanRecord[] = [
  {
    id: "plan-free",
    name: "Free",
    description: "Starter access for learners beginning their StudyFlow AI journey.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Basic planner access",
      "Limited AI recommendations",
      "3 subject boards",
      "Weekly progress snapshot",
    ],
    accentClassName: "from-indigo-700 to-sky-600",
  },
  {
    id: "plan-pro",
    name: "Pro",
    description: "Premium learner plan built for deeper planning, quiz practice, and retention.",
    monthlyPrice: 14,
    yearlyPrice: 144,
    features: [
      "Unlimited study plans",
      "AI quiz builder access",
      "Advanced analytics",
      "Priority support",
    ],
    accentClassName: "from-amber-500 to-orange-500",
  },
  {
    id: "plan-mentor-pro",
    name: "Mentor Pro",
    description: "Teaching-grade tools for mentors managing learners, feedback, and content workflows.",
    monthlyPrice: 29,
    yearlyPrice: 300,
    features: [
      "Mentor workspace controls",
      "Student cohort insights",
      "Content review tools",
      "Priority mentor support",
    ],
    accentClassName: "from-teal-700 to-emerald-500",
  },
];

const INITIAL_SUBSCRIBERS: SubscriberRecord[] = [
  {
    id: "subr-1001",
    name: "Lena Jayasuriya",
    email: "lena.j@studyflow.ai",
    plan: "Pro",
    billingCycle: "Monthly",
    paymentStatus: "Paid",
    renewalDate: "Apr 12, 2026",
  },
  {
    id: "subr-1002",
    name: "Dilan Fernando",
    email: "dilan.f@studyflow.ai",
    plan: "Mentor Pro",
    billingCycle: "Yearly",
    paymentStatus: "Paid",
    renewalDate: "Jan 08, 2027",
  },
  {
    id: "subr-1003",
    name: "Maya Gunasekara",
    email: "maya.g@studyflow.ai",
    plan: "Free",
    billingCycle: "Monthly",
    paymentStatus: "Trialing",
    renewalDate: "Mar 30, 2026",
  },
  {
    id: "subr-1004",
    name: "Kavin De Silva",
    email: "kavin.d@studyflow.ai",
    plan: "Mentor Pro",
    billingCycle: "Monthly",
    paymentStatus: "Paid",
    renewalDate: "Apr 04, 2026",
  },
  {
    id: "subr-1005",
    name: "Nethmi Peris",
    email: "nethmi.p@studyflow.ai",
    plan: "Pro",
    billingCycle: "Yearly",
    paymentStatus: "Paid",
    renewalDate: "Feb 18, 2027",
  },
  {
    id: "subr-1006",
    name: "Aarav Iqbal",
    email: "aarav.i@studyflow.ai",
    plan: "Mentor Pro",
    billingCycle: "Yearly",
    paymentStatus: "Overdue",
    renewalDate: "Mar 28, 2026",
  },
  {
    id: "subr-1007",
    name: "Sadia Nazeer",
    email: "sadia.n@studyflow.ai",
    plan: "Pro",
    billingCycle: "Monthly",
    paymentStatus: "Paid",
    renewalDate: "Apr 09, 2026",
  },
  {
    id: "subr-1008",
    name: "Marcus Perera",
    email: "marcus.p@studyflow.ai",
    plan: "Mentor Pro",
    billingCycle: "Monthly",
    paymentStatus: "Paid",
    renewalDate: "Apr 02, 2026",
  },
  {
    id: "subr-1009",
    name: "Amara Silva",
    email: "amara.s@studyflow.ai",
    plan: "Pro",
    billingCycle: "Yearly",
    paymentStatus: "Paid",
    renewalDate: "Dec 14, 2026",
  },
  {
    id: "subr-1010",
    name: "Tharushi Abeykoon",
    email: "tharushi.a@studyflow.ai",
    plan: "Free",
    billingCycle: "Monthly",
    paymentStatus: "Canceled",
    renewalDate: "Canceled",
  },
];

const MONTHLY_REVENUE: RevenuePoint[] = [
  { month: "Jan", revenue: 31800 },
  { month: "Feb", revenue: 35420 },
  { month: "Mar", revenue: 39210 },
  { month: "Apr", revenue: 41840 },
  { month: "May", revenue: 44630 },
  { month: "Jun", revenue: 48650 },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function closeParentDetails(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  target.closest("details")?.removeAttribute("open");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPlanDefinition(plans: PlanRecord[], planName: PlanName) {
  return plans.find((plan) => plan.name === planName) ?? plans[0];
}

function getMonthlyEquivalent(subscriber: SubscriberRecord, plans: PlanRecord[]) {
  const plan = getPlanDefinition(plans, subscriber.plan);

  if (plan.name === "Free" || subscriber.paymentStatus === "Canceled") {
    return 0;
  }

  return subscriber.billingCycle === "Yearly"
    ? plan.yearlyPrice / 12
    : plan.monthlyPrice;
}

function getNextPlan(planName: PlanName, direction: "up" | "down") {
  const currentIndex = PLAN_ORDER.indexOf(planName);

  if (direction === "up") {
    return PLAN_ORDER[Math.min(currentIndex + 1, PLAN_ORDER.length - 1)];
  }

  return PLAN_ORDER[Math.max(currentIndex - 1, 0)];
}

function createPlanForm(plan: PlanRecord): PlanFormState {
  return {
    name: plan.name,
    description: plan.description,
    monthlyPrice: `${plan.monthlyPrice}`,
    yearlyPrice: `${plan.yearlyPrice}`,
    features: plan.features.join("\n"),
  };
}

function SummaryCard({
  title,
  value,
  helper,
  icon: Icon,
  accentClassName,
}: {
  title: string;
  value: string;
  helper: string;
  icon: typeof Users;
  accentClassName: string;
}) {
  return (
    <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {value}
            </p>
            <p className="mt-3 text-sm text-slate-500">{helper}</p>
          </div>

          <div
            className={cn(
              "inline-flex rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg",
              accentClassName,
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="card-surface rounded-[32px] border border-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <CardHeader className="gap-4 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </CardDescription>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function PlanBadge({ plan }: { plan: PlanName }) {
  const badgeClassName =
    plan === "Mentor Pro"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : plan === "Pro"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[0.72rem] font-semibold", badgeClassName)}>
      {plan}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const badgeClassName =
    status === "Paid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Trialing"
        ? "border-sky-200 bg-sky-50 text-sky-700"
        : status === "Overdue"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[0.72rem] font-semibold", badgeClassName)}>
      {status}
    </Badge>
  );
}

function SubscriberActionsMenu({
  subscriber,
  onUpgrade,
  onDowngrade,
  onCancelPlan,
  onRefund,
  onSendInvoice,
}: {
  subscriber: SubscriberRecord;
  onUpgrade: () => void;
  onDowngrade: () => void;
  onCancelPlan: () => void;
  onRefund: () => void;
  onSendInvoice: () => void;
}) {
  const canUpgrade = subscriber.plan !== "Mentor Pro";
  const canDowngrade = subscriber.plan !== "Free";
  const menuItemClassName =
    "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100";

  return (
    <details className="group relative [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900">
        <MoreHorizontal className="h-4 w-4" />
      </summary>

      <div className="absolute right-0 top-12 z-30 w-52 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        {canUpgrade ? (
          <button
            type="button"
            className={menuItemClassName}
            onClick={(event) => {
              closeParentDetails(event.currentTarget);
              onUpgrade();
            }}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Upgrade
          </button>
        ) : null}
        {canDowngrade ? (
          <button
            type="button"
            className={menuItemClassName}
            onClick={(event) => {
              closeParentDetails(event.currentTarget);
              onDowngrade();
            }}
          >
            <ArrowDownCircle className="h-4 w-4" />
            Downgrade
          </button>
        ) : null}
        <button
          type="button"
          className={menuItemClassName}
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onCancelPlan();
          }}
        >
          <X className="h-4 w-4" />
          Cancel Plan
        </button>
        <button
          type="button"
          className={menuItemClassName}
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onRefund();
          }}
        >
          <ReceiptText className="h-4 w-4" />
          Refund
        </button>
        <button
          type="button"
          className={menuItemClassName}
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onSendInvoice();
          }}
        >
          <Send className="h-4 w-4" />
          Send Invoice
        </button>
      </div>
    </details>
  );
}

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<PlanRecord[]>(INITIAL_PLANS);
  const [subscribers, setSubscribers] =
    useState<SubscriberRecord[]>(INITIAL_SUBSCRIBERS);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<PlanFormState>(
    createPlanForm(INITIAL_PLANS[0]),
  );
  const [planFormError, setPlanFormError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!editingPlanId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditingPlanId(null);
        setPlanFormError("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingPlanId]);

  const activePaidSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.plan !== "Free" && subscriber.paymentStatus !== "Canceled",
  );
  const freeUsersCount = subscribers.filter((subscriber) => subscriber.plan === "Free")
    .length;
  const premiumUsersCount = subscribers.length - freeUsersCount;
  const monthlyRevenueValue = Math.round(
    subscribers.reduce(
      (sum, subscriber) => sum + getMonthlyEquivalent(subscriber, plans),
      0,
    ),
  );
  const yearlyRevenueValue = monthlyRevenueValue * 12;
  const activeSubscriptions = activePaidSubscribers.length;
  const churnRate = "2.4%";

  const summaryCards = [
    {
      title: "Free Users",
      value: freeUsersCount.toLocaleString(),
      helper: "Users currently on the starter tier",
      icon: Users,
      accentClassName: "from-indigo-700 to-sky-600",
    },
    {
      title: "Premium Users",
      value: premiumUsersCount.toLocaleString(),
      helper: "Active paid and mentor-grade subscribers",
      icon: Crown,
      accentClassName: "from-amber-500 to-orange-500",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(monthlyRevenueValue),
      helper: "Current monthly recurring revenue",
      icon: Wallet,
      accentClassName: "from-emerald-700 to-teal-500",
    },
    {
      title: "Yearly Revenue",
      value: formatCurrency(yearlyRevenueValue),
      helper: "Projected annual recurring revenue",
      icon: DollarSign,
      accentClassName: "from-sky-600 to-cyan-500",
    },
    {
      title: "Churn Rate",
      value: churnRate,
      helper: "Trailing monthly subscription churn",
      icon: TrendingDown,
      accentClassName: "from-rose-600 to-orange-500",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.toLocaleString(),
      helper: "Paid subscriptions currently in good standing",
      icon: CreditCard,
      accentClassName: "from-violet-600 to-indigo-500",
    },
  ];

  const activePlan = plans.find((plan) => plan.id === editingPlanId) ?? null;

  function openPlanEditor(planId: string) {
    const plan = plans.find((entry) => entry.id === planId);

    if (!plan) {
      return;
    }

    setPlanForm(createPlanForm(plan));
    setPlanFormError("");
    setEditingPlanId(planId);
  }

  function closePlanEditor() {
    setEditingPlanId(null);
    setPlanFormError("");
  }

  function handleManagePlans() {
    openPlanEditor(plans[0].id);
  }

  function handleSavePlan() {
    if (!activePlan) {
      return;
    }

    const monthlyPrice = Number(planForm.monthlyPrice);
    const yearlyPrice = Number(planForm.yearlyPrice);
    const features = planForm.features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    if (!planForm.description.trim()) {
      setPlanFormError("Plan description is required.");
      return;
    }

    if (
      Number.isNaN(monthlyPrice) ||
      Number.isNaN(yearlyPrice) ||
      monthlyPrice < 0 ||
      yearlyPrice < 0
    ) {
      setPlanFormError("Enter valid numeric pricing values.");
      return;
    }

    if (features.length === 0) {
      setPlanFormError("Add at least one feature.");
      return;
    }

    setPlans((current) =>
      current.map((plan) =>
        plan.id === activePlan.id
          ? {
              ...plan,
              description: planForm.description.trim(),
              monthlyPrice,
              yearlyPrice,
              features,
            }
          : plan,
      ),
    );
    setActionMessage(`${activePlan.name} plan updated successfully.`);
    closePlanEditor();
  }

  function updateSubscriber(
    subscriberId: string,
    updater: (subscriber: SubscriberRecord) => SubscriberRecord,
  ) {
    setSubscribers((current) =>
      current.map((subscriber) =>
        subscriber.id === subscriberId ? updater(subscriber) : subscriber,
      ),
    );
  }

  function handleUpgrade(subscriber: SubscriberRecord) {
    const nextPlan = getNextPlan(subscriber.plan, "up");

    if (nextPlan === subscriber.plan) {
      return;
    }

    updateSubscriber(subscriber.id, (current) => ({
      ...current,
      plan: nextPlan,
      paymentStatus: "Paid",
      renewalDate: current.billingCycle === "Yearly" ? "Feb 18, 2027" : "Apr 18, 2026",
    }));
    setActionMessage(`${subscriber.name} upgraded to ${nextPlan}.`);
  }

  function handleDowngrade(subscriber: SubscriberRecord) {
    const nextPlan = getNextPlan(subscriber.plan, "down");

    updateSubscriber(subscriber.id, (current) => ({
      ...current,
      plan: nextPlan,
      paymentStatus: nextPlan === "Free" ? "Canceled" : "Paid",
      renewalDate: nextPlan === "Free" ? "Canceled" : current.renewalDate,
    }));
    setActionMessage(`${subscriber.name} moved to ${nextPlan}.`);
  }

  function handleCancelPlan(subscriber: SubscriberRecord) {
    updateSubscriber(subscriber.id, (current) => ({
      ...current,
      plan: "Free",
      paymentStatus: "Canceled",
      renewalDate: "Canceled",
    }));
    setActionMessage(`${subscriber.name}'s paid subscription was canceled.`);
  }

  function handleRefund(subscriber: SubscriberRecord) {
    setActionMessage(`Refund initiated for ${subscriber.name}.`);
  }

  function handleSendInvoice(subscriber: SubscriberRecord) {
    setActionMessage(`Invoice sent to ${subscriber.email}.`);
  }

  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading subscriptions workspace..."
    >
      <div className="mx-auto max-w-[1600px] space-y-8 pb-8">
        <Card className="relative overflow-hidden rounded-[34px] border border-sky-100 bg-transparent text-slate-950 shadow-[0_30px_100px_rgba(14,165,233,0.16)]">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 24%), radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.14), transparent 24%), radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.12), transparent 28%), linear-gradient(135deg, rgba(255,255,255,1), rgba(240,249,255,0.98) 52%, rgba(236,253,245,0.98))",
            }}
          />
          <CardContent className="relative p-8 md:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-5">
                <Badge className="rounded-full border border-sky-100 bg-white px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm">
                  <Wallet className="mr-2 h-3.5 w-3.5" />
                  Billing command center
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                    Subscriptions
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                    Manage StudyFlow AI plans, subscriber health, recurring revenue,
                    and billing actions from one premium admin workspace.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <div className="rounded-full border border-sky-100 bg-white px-4 py-2 shadow-sm">
                    {formatCurrency(monthlyRevenueValue)} current MRR
                  </div>
                  <div className="rounded-full border border-sky-100 bg-white px-4 py-2 shadow-sm">
                    {activePaidSubscribers.length} paid accounts in cycle
                  </div>
                  <div className="rounded-full border border-sky-100 bg-white px-4 py-2 shadow-sm">
                    {plans.length} active plans managed
                  </div>
                </div>
              </div>

              <div className="flex justify-start xl:justify-end">
                <Button
                  type="button"
                  className="h-12 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white hover:bg-sky-700"
                  onClick={handleManagePlans}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Manage Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {actionMessage ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {actionMessage}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {summaryCards.map((item) => (
            <SummaryCard
              key={item.title}
              title={item.title}
              value={item.value}
              helper={item.helper}
              icon={item.icon}
              accentClassName={item.accentClassName}
            />
          ))}
        </section>

        <SectionShell
          title="Subscription Plans"
          description="Control pricing, features, and subscriber distribution across the current plan lineup."
        >
          <div className="grid gap-5 xl:grid-cols-3">
            {plans.map((plan) => {
              const planSubscribers = subscribers.filter(
                (subscriber) => subscriber.plan === plan.name,
              ).length;

              return (
                <Card
                  key={plan.id}
                  className="rounded-[30px] border border-white/55 bg-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div
                          className={cn(
                            "inline-flex rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg",
                            plan.accentClassName,
                          )}
                        >
                          {plan.name === "Free" ? (
                            <Users className="h-5 w-5" />
                          ) : plan.name === "Pro" ? (
                            <Crown className="h-5 w-5" />
                          ) : (
                            <CreditCard className="h-5 w-5" />
                          )}
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                          {plan.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {plan.description}
                        </p>
                      </div>
                      <PlanBadge plan={plan.name} />
                    </div>

                    <div className="mt-6 grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Monthly
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {formatCurrency(plan.monthlyPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Subscribers
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {planSubscribers.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                          <span className="text-sm leading-6 text-slate-600">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-6 w-full rounded-2xl border-slate-200 bg-white hover:bg-slate-50"
                      onClick={() => openPlanEditor(plan.id)}
                    >
                      Edit Plan
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </SectionShell>

        <SectionShell
          title="Subscribers"
          description="Track billing status, plan mix, renewal timing, and action controls for each account."
        >
          <div className="hidden xl:block">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    <th className="pb-2 pl-3">User name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Plan</th>
                    <th className="pb-2">Billing cycle</th>
                    <th className="pb-2">Payment status</th>
                    <th className="pb-2">Renewal date</th>
                    <th className="pb-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td className="rounded-l-[24px] border border-r-0 border-white/55 bg-white/70 py-4 pl-3 align-top">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                            <AvatarFallback className="bg-sky-600 text-white">
                              {getInitials(subscriber.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {subscriber.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Subscriber account
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top text-sm text-slate-600">
                        {subscriber.email}
                      </td>
                      <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top">
                        <PlanBadge plan={subscriber.plan} />
                      </td>
                      <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top text-sm font-medium text-slate-700">
                        {subscriber.billingCycle}
                      </td>
                      <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top">
                        <PaymentStatusBadge status={subscriber.paymentStatus} />
                      </td>
                      <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top text-sm text-slate-600">
                        {subscriber.renewalDate}
                      </td>
                      <td className="rounded-r-[24px] border border-l-0 border-white/55 bg-white/70 py-4 pr-3 align-top">
                        <div className="flex justify-end">
                          <SubscriberActionsMenu
                            subscriber={subscriber}
                            onUpgrade={() => handleUpgrade(subscriber)}
                            onDowngrade={() => handleDowngrade(subscriber)}
                            onCancelPlan={() => handleCancelPlan(subscriber)}
                            onRefund={() => handleRefund(subscriber)}
                            onSendInvoice={() => handleSendInvoice(subscriber)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 xl:hidden">
            {subscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="rounded-[28px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                      <AvatarFallback className="bg-sky-600 text-white">
                        {getInitials(subscriber.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {subscriber.name}
                      </p>
                      <p className="text-sm text-slate-500">{subscriber.email}</p>
                    </div>
                  </div>

                  <SubscriberActionsMenu
                    subscriber={subscriber}
                    onUpgrade={() => handleUpgrade(subscriber)}
                    onDowngrade={() => handleDowngrade(subscriber)}
                    onCancelPlan={() => handleCancelPlan(subscriber)}
                    onRefund={() => handleRefund(subscriber)}
                    onSendInvoice={() => handleSendInvoice(subscriber)}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Plan
                    </p>
                    <PlanBadge plan={subscriber.plan} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Billing cycle
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {subscriber.billingCycle}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Payment status
                    </p>
                    <PaymentStatusBadge status={subscriber.paymentStatus} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Renewal date
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {subscriber.renewalDate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <SectionShell
            title="Revenue"
            description="Monthly recurring revenue movement across the current billing window."
          >
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={MONTHLY_REVENUE}
                  margin={{ top: 12, right: 10, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="subscriptionRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eb6b39" stopOpacity={0.36} />
                      <stop offset="95%" stopColor="#eb6b39" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(15, 23, 42, 0.08)"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    tickMargin={12}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value: number) => formatCurrency(value)}
                    tickLine={false}
                    width={74}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.98)",
                      border: "1px solid rgba(15,23,42,0.08)",
                      borderRadius: "18px",
                      boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
                      padding: "12px 14px",
                    }}
                    formatter={(value: number | string) => [
                      typeof value === "number" ? formatCurrency(value) : value,
                      "Revenue",
                    ]}
                    labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#eb6b39"
                    strokeWidth={3}
                    fill="url(#subscriptionRevenueFill)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionShell>

          <div className="space-y-8">
            <SectionShell
              title="Revenue Metrics"
              description="Core recurring revenue markers for the current subscription mix."
            >
              <div className="space-y-4">
                <div className="rounded-[28px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">MRR</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                        {formatCurrency(monthlyRevenueValue)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Monthly recurring revenue from active paid subscriptions.
                      </p>
                    </div>
                    <div className="inline-flex rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-500 p-3 text-white shadow-lg">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">ARR</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                        {formatCurrency(yearlyRevenueValue)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Annual recurring revenue run rate based on current mix.
                      </p>
                    </div>
                    <div className="inline-flex rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 p-3 text-white shadow-lg">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Billing Health</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                        {subscribers.filter((subscriber) => subscriber.paymentStatus === "Paid").length}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Paid subscribers currently in good standing.
                      </p>
                    </div>
                    <div className="inline-flex rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 p-3 text-white shadow-lg">
                      <ReceiptText className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </SectionShell>
          </div>
        </div>

        {editingPlanId && activePlan ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              type="button"
              aria-label="Close plan editor"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
              onClick={closePlanEditor}
            />

            <Card className="relative z-10 w-full max-w-2xl rounded-[32px] border border-white/50 bg-[#fcfaf6] shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600">
                      Plan editor
                    </Badge>
                    <div>
                      <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                        Edit {activePlan.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                        Update pricing, messaging, and included features for this plan.
                      </CardDescription>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-3 hover:bg-slate-50"
                    onClick={closePlanEditor}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-600">
                    Plan name
                  </span>
                  <input
                    value={planForm.name}
                    readOnly
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-600 shadow-sm outline-none"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-600">
                    Description
                  </span>
                  <textarea
                    rows={4}
                    value={planForm.description}
                    onChange={(event) =>
                      setPlanForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-600">
                      Monthly price
                    </span>
                    <input
                      value={planForm.monthlyPrice}
                      onChange={(event) =>
                        setPlanForm((current) => ({
                          ...current,
                          monthlyPrice: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-600">
                      Yearly price
                    </span>
                    <input
                      value={planForm.yearlyPrice}
                      onChange={(event) =>
                        setPlanForm((current) => ({
                          ...current,
                          yearlyPrice: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-600">
                    Features
                  </span>
                  <textarea
                    rows={6}
                    value={planForm.features}
                    onChange={(event) =>
                      setPlanForm((current) => ({
                        ...current,
                        features: event.target.value,
                      }))
                    }
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                  />
                </label>

                {planFormError ? (
                  <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {planFormError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                    onClick={closePlanEditor}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={handleSavePlan}
                  >
                    Save Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </ProtectedDashboardLayout>
  );
}
