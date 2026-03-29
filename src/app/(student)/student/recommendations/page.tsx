"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clock3,
  RefreshCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { studentSidebarLinks } from "@/data/sidebarLinks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RecommendationAction {
  label: string;
  href: string;
}

interface RecommendationItem {
  id: string;
  title: string;
  typeLabel: string;
  subject: string;
  summary: string;
  reason: string;
  confidence: string;
  effort: string;
  accentClassName: string;
  icon: ReactNode;
  primaryAction: RecommendationAction;
  secondaryAction?: RecommendationAction;
  steps: string[];
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionCard({
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
    <Card className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_30px_70px_-40px_rgba(56,189,248,0.18)]">
      <CardHeader className="pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </CardDescription>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function SignalCard({
  label,
  value,
  detail,
  icon,
  accentClassName,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  accentClassName: string;
}) {
  return (
    <Card className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_28px_64px_-42px_rgba(59,130,246,0.2)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{detail}</p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-200/70",
              accentClassName,
            )}
          >
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "study-next-topic",
    title: "Study vectors before tonight's planner block",
    typeLabel: "Study Next Topic",
    subject: "Mathematics",
    summary:
      "Your recent progress in algebra is stable, and vectors are the highest-impact next concept before your upcoming class assessment.",
    reason:
      "StudyFlow AI noticed your strongest completion rate happens when you move into connected topics while the previous chapter is still fresh.",
    confidence: "92%",
    effort: "35 min deep review",
    accentClassName: "from-sky-600 to-cyan-500",
    icon: <BookOpen className="h-5 w-5" />,
    primaryAction: {
      label: "Start Review",
      href: "/student/subjects",
    },
    secondaryAction: {
      label: "Open Planner",
      href: "/student/planner",
    },
    steps: [
      "Read the vectors summary sheet and identify the three core formulas.",
      "Solve one short worked example before moving into your own questions.",
      "Log a follow-up task if any subtopic still feels unclear.",
    ],
  },
  {
    id: "revision-suggestion",
    title: "Run a chemistry revision reset on reaction pathways",
    typeLabel: "Revision Suggestion",
    subject: "Chemistry",
    summary:
      "Your last two quiz attempts show a small dip in recall for reaction pathways, so a light revision pass will likely recover those marks quickly.",
    reason:
      "The system detected that spaced repetition for chemistry has gone quiet for four days, which is where your retention usually starts to soften.",
    confidence: "88%",
    effort: "20 min flashcard recap",
    accentClassName: "from-violet-600 to-fuchsia-500",
    icon: <RefreshCcw className="h-5 w-5" />,
    primaryAction: {
      label: "Start Review",
      href: "/student/flashcards",
    },
    secondaryAction: {
      label: "Open Notes",
      href: "/student/notes",
    },
    steps: [
      "Review your reaction pathway flashcards in one uninterrupted sprint.",
      "Mark any missed cards as high priority for tomorrow's planner.",
      "Finish with a short verbal recap to strengthen active recall.",
    ],
  },
  {
    id: "quiz-suggestion",
    title: "Take a mechanics checkpoint quiz next",
    typeLabel: "Quiz Suggestion",
    subject: "Physics",
    summary:
      "Mechanics is your nearest high-stakes topic, and a short checkpoint quiz can surface weak areas before the deadline catches up.",
    reason:
      "Your study sessions show consistent effort in physics, but assessment confidence is still lower than your other active subjects.",
    confidence: "95%",
    effort: "12 questions, 15 min",
    accentClassName: "from-emerald-600 to-teal-500",
    icon: <Target className="h-5 w-5" />,
    primaryAction: {
      label: "Take Quiz",
      href: "/student/quizzes",
    },
    secondaryAction: {
      label: "Start Review",
      href: "/student/sessions",
    },
    steps: [
      "Complete the mechanics checkpoint quiz without notes first.",
      "Review the explanations for any incorrect or hesitant answers.",
      "Convert weak questions into a focused revision task for tomorrow.",
    ],
  },
];

export default function StudentRecommendationsPage() {
  const router = useRouter();
  const [selectedRecommendationId, setSelectedRecommendationId] = useState(
    RECOMMENDATIONS[0]?.id ?? "",
  );

  const selectedRecommendation = useMemo(
    () =>
      RECOMMENDATIONS.find(
        (recommendation) => recommendation.id === selectedRecommendationId,
      ) ?? RECOMMENDATIONS[0],
    [selectedRecommendationId],
  );

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your AI recommendations..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[36px] border border-sky-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_22%,#eefcff_54%,#f8fbff_76%,#fff7e8_100%)] p-6 shadow-[0_40px_110px_-52px_rgba(56,189,248,0.28)] sm:p-8">
          <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_32%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[1.06fr_0.94fr] xl:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.18)]">
                <BookOpen className="h-4 w-4 text-blue-700" />
                <span>AI Recommendations</span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Smart next steps for today&apos;s study plan
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  StudyFlow AI is surfacing the most useful next topic, the best
                  revision reset, and the quiz most likely to improve your momentum
                  right now.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Clock3 className="h-4 w-4 text-sky-600" />
                  {todayLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Brain className="h-4 w-4 text-indigo-600" />
                  Personalized from your recent activity
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Target className="h-4 w-4 text-amber-500" />
                  {RECOMMENDATIONS.length} curated next steps
                </span>
              </div>
              <div className="rounded-[28px] border border-sky-100/80 bg-white/78 p-5 shadow-[0_24px_56px_-42px_rgba(56,189,248,0.42)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Recommendation Flow
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Your next move should feel clear, light, and useful. These suggestions
                  are ranked to help you act on the highest-value study step without
                  overthinking the whole day.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.3)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Today Signal
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Follow the strongest next study move
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.22)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <Sparkles className="h-4 w-4" />
                    Confidence
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {selectedRecommendation?.confidence ?? "91%"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Current strength of the selected recommendation
                  </p>
                </div>
                <div className="rounded-[24px] border border-blue-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(37,99,235,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    <BookOpen className="h-4 w-4" />
                    Focus Subject
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {selectedRecommendation?.subject ?? "Ready"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Subject area currently recommended for attention
                  </p>
                </div>
                <div className="rounded-[24px] border border-violet-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5f3ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(124,58,237,0.18)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
                    <Clock3 className="h-4 w-4" />
                    Effort Window
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {selectedRecommendation?.effort ?? "35 min"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Suggested time needed for the selected action
                  </p>
                </div>
                <div className="rounded-[24px] border border-emerald-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(16,185,129,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    <Target className="h-4 w-4" />
                    Recommendation
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {selectedRecommendation?.typeLabel ?? "Ready"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Current suggestion selected from your AI queue
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 text-sm leading-7 text-slate-600 shadow-[0_18px_40px_-34px_rgba(56,189,248,0.18)]">
                Based on subject activity, quiz performance, revision gaps, and your
                strongest study windows this week.
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            description="Each suggestion is tuned to what you studied recently, where your recall is starting to dip, and which action should pay off fastest."
            title="Recommendations List"
          >
            <div className="space-y-4">
              {RECOMMENDATIONS.map((recommendation) => {
                const isSelected =
                  recommendation.id === selectedRecommendation?.id;

                return (
                  <div
                    className={cn(
                      "w-full rounded-[28px] border p-5 transition",
                      isSelected
                        ? "border-blue-300 bg-[linear-gradient(180deg,#eff6ff_0%,#eef8ff_100%)] ring-4 ring-blue-100"
                        : "border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_36px_-28px_rgba(37,99,235,0.35)]",
                    )}
                    key={recommendation.id}
                  >
                    <button
                      className="w-full text-left"
                      onClick={() =>
                        setSelectedRecommendationId(recommendation.id)
                      }
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="border-blue-200/80 bg-blue-50 text-blue-800">
                              {recommendation.typeLabel}
                            </Badge>
                            <Badge className="border-cyan-200/80 bg-cyan-50 text-cyan-800">
                              {recommendation.subject}
                            </Badge>
                          </div>
                          <h2 className="mt-3 text-lg font-semibold text-slate-950">
                            {recommendation.title}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {recommendation.summary}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-200/70",
                            recommendation.accentClassName,
                          )}
                        >
                          {recommendation.icon}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-blue-900">
                          Confidence {recommendation.confidence}
                        </span>
                        <span className="rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-teal-900">
                          {recommendation.effort}
                        </span>
                      </div>
                    </button>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        className="h-10 rounded-2xl bg-blue-700 px-4 text-white shadow-[0_16px_32px_-20px_rgba(29,78,216,0.65)] hover:bg-blue-800"
                        onClick={() =>
                          router.push(recommendation.primaryAction.href)
                        }
                        type="button"
                      >
                        {recommendation.primaryAction.label}
                      </Button>
                      {recommendation.secondaryAction ? (
                        <Button
                          className="h-10 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 text-blue-800 shadow-[0_14px_30px_-22px_rgba(59,130,246,0.28)] hover:bg-blue-100"
                          onClick={() =>
                            router.push(recommendation.secondaryAction!.href)
                          }
                          type="button"
                          variant="outline"
                        >
                          {recommendation.secondaryAction.label}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              action={
                <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                  {selectedRecommendation.confidence} match
                </Badge>
              }
              description="Open the current recommendation to see why it matters now and how to turn it into a concrete study move."
              title="Recommendation Detail"
            >
              <div className="space-y-5">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-transparent bg-sky-100 text-sky-700">
                          {selectedRecommendation.typeLabel}
                        </Badge>
                        <Badge className="border-transparent bg-sky-100 text-sky-700">
                          {selectedRecommendation.subject}
                        </Badge>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-slate-950">
                        {selectedRecommendation.title}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-200/70",
                        selectedRecommendation.accentClassName,
                      )}
                    >
                      {selectedRecommendation.icon}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {selectedRecommendation.reason}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] border border-sky-100 bg-white px-4 py-3 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Confidence
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {selectedRecommendation.confidence}
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-sky-100 bg-white px-4 py-3 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Suggested effort
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {selectedRecommendation.effort}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-sky-600" />
                    <p className="text-sm font-semibold text-slate-950">
                      Suggested sequence
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {selectedRecommendation.steps.map((step, index) => (
                      <div
                        className="flex items-start gap-3 rounded-[20px] border border-sky-100 bg-white px-4 py-3 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]"
                        key={step}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-700">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-6 text-slate-600">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={() =>
                      router.push(selectedRecommendation.primaryAction.href)
                    }
                  >
                    {selectedRecommendation.primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    className="h-11 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    onClick={() =>
                      router.push(
                        selectedRecommendation.secondaryAction?.href ??
                          selectedRecommendation.primaryAction.href,
                      )
                    }
                    variant="outline"
                  >
                    {selectedRecommendation.secondaryAction?.label ?? "Open"}
                  </Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="Quick AI-powered launch points for your next focused block."
              title="Fast Actions"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  className="group rounded-[28px] border border-sky-100/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_120%)] p-5 text-left shadow-[0_20px_50px_-40px_rgba(37,99,235,0.45)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_-36px_rgba(37,99,235,0.42)]"
                  onClick={() => router.push("/student/flashcards")}
                  type="button"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200">
                    <RefreshCcw className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">
                    Start Review
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Jump into flashcards, notes, or the next revision sprint while
                    the recommendation window is strongest.
                  </p>
                </button>

                <button
                  className="group rounded-[28px] border border-sky-100/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#d1fae5_120%)] p-5 text-left shadow-[0_20px_50px_-40px_rgba(5,150,105,0.38)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_-36px_rgba(5,150,105,0.35)]"
                  onClick={() => router.push("/student/quizzes")}
                  type="button"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                    <Target className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">
                    Take Quiz
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Turn the latest recommendation into a short checkpoint and
                    measure understanding before the next deadline.
                  </p>
                </button>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}






