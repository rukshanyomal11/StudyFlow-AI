"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { studentSidebarLinks } from "@/data/sidebarLinks";
import Alert from "@/components/ui/Alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const selectClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SectionCard({ title, description, action, children }) {
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

async function readApiError(response, fallbackMessage) {
  try {
    const data = await response.json();

    if (
      data?.error === "Internal server error" &&
      typeof data?.details === "string" &&
      data.details.trim()
    ) {
      return data.details;
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (typeof data?.details === "string" && data.details.trim()) {
      return data.details;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

function buildResultState(result) {
  return {
    score:
      typeof result?.score === "number" && Number.isFinite(result.score)
        ? result.score
        : 0,
    correctAnswers:
      typeof result?.correctAnswers === "number" &&
      Number.isFinite(result.correctAnswers)
        ? result.correctAnswers
        : 0,
    wrongAnswers:
      typeof result?.wrongAnswers === "number" &&
      Number.isFinite(result.wrongAnswers)
        ? result.wrongAnswers
        : 0,
    weakTopics: Array.isArray(result?.weakTopics) ? result.weakTopics : [],
  };
}

export default function StudentQuizzesPage() {
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [view, setView] = useState("list");
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [statusTone, setStatusTone] = useState("info");
  const [statusMessage, setStatusMessage] = useState(
    "Loading your available quizzes...",
  );
  const [statusHint, setStatusHint] = useState(
    "We are checking which quizzes are assigned to you and which ones match your saved subjects.",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateStatus = (tone, message, hint) => {
    setStatusTone(tone);
    setStatusMessage(message);
    setStatusHint(hint ?? null);
  };

  useEffect(() => {
    let isActive = true;

    const loadQuizzes = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/quizzes", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(
            await readApiError(
              response,
              "Unable to load your quizzes right now.",
            ),
          );
        }

        const data = await response.json();
        const quizzes = Array.isArray(data?.quizzes) ? data.quizzes : [];

        if (!isActive) {
          return;
        }

        setAllQuizzes(quizzes);
        updateStatus(
          quizzes.length ? "success" : "info",
          quizzes.length
            ? "Your quizzes are ready."
            : "No quizzes are available for you yet.",
          quizzes.length
            ? "Use the subject filter or open any card to start a live attempt."
            : "New quizzes will appear here when a mentor or admin publishes one for your subjects or assigns one directly to you.",
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        updateStatus(
          "error",
          error instanceof Error
            ? error.message
            : "Unable to load your quizzes right now.",
          "Refresh the page after checking your login session.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadQuizzes();

    return () => {
      isActive = false;
    };
  }, []);

  const availableSubjects = useMemo(() => {
    const subjectMap = new Map();

    allQuizzes.forEach((quiz) => {
      if (quiz.subjectId && quiz.subjectName && !subjectMap.has(quiz.subjectId)) {
        subjectMap.set(quiz.subjectId, {
          id: quiz.subjectId,
          name: quiz.subjectName,
        });
      }
    });

    return Array.from(subjectMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }, [allQuizzes]);

  const quizzes = useMemo(() => {
    const filteredQuizzes = subjectFilter
      ? allQuizzes.filter((quiz) => quiz.subjectId === subjectFilter)
      : allQuizzes;

    return [...filteredQuizzes].sort((left, right) => {
      if (
        left.isAssignedToCurrentStudent !== right.isAssignedToCurrentStudent
      ) {
        return left.isAssignedToCurrentStudent ? -1 : 1;
      }

      return left.title.localeCompare(right.title);
    });
  }, [allQuizzes, subjectFilter]);

  const activeQuiz = useMemo(
    () => allQuizzes.find((quiz) => quiz.id === activeQuizId) ?? null,
    [allQuizzes, activeQuizId],
  );

  const currentQuestion =
    activeQuiz?.questions?.[currentQuestionIndex] ?? null;

  const answeredCount = activeQuiz
    ? activeQuiz.questions.filter(
        (_question, index) => typeof selectedAnswers[index] === "number",
      ).length
    : 0;

  const quizProgress =
    activeQuiz && activeQuiz.questions.length > 0
      ? ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100
      : 0;

  useEffect(() => {
    if (!activeQuizId) {
      return;
    }

    const nextActiveQuiz = allQuizzes.find((quiz) => quiz.id === activeQuizId);

    if (!nextActiveQuiz) {
      setActiveQuizId(null);
      setView("list");
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setResult(null);
    }
  }, [allQuizzes, activeQuizId]);

  const startQuiz = (quiz) => {
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      updateStatus(
        "warning",
        "This quiz is missing question data.",
        "Ask the mentor or admin to republish the quiz content.",
      );
      return;
    }

    setActiveQuizId(quiz.id);
    setView("quiz");
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResult(null);
    updateStatus(
      "info",
      `Started ${quiz.title}.`,
      "Answer each question, then submit to see your score and weak topics.",
    );
  };

  const goBackToList = () => {
    setView("list");
    setCurrentQuestionIndex(0);
    updateStatus(
      "info",
      "Quiz list is ready.",
      "Pick another quiz or use the subject filter to narrow the list.",
    );
  };

  const restartQuiz = () => {
    if (!activeQuiz) {
      return;
    }

    setView("quiz");
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResult(null);
    updateStatus(
      "info",
      `Restarted ${activeQuiz.title}.`,
      "Work through the questions again with a clean attempt.",
    );
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers((current) => ({
      ...current,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) {
      return;
    }

    if (answeredCount !== activeQuiz.questions.length) {
      updateStatus(
        "warning",
        "Answer every question before submitting.",
        "Move through the quiz and choose one option for each question.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers: activeQuiz.questions.map(
            (_question, index) => selectedAnswers[index],
          ),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Unable to submit this quiz right now.",
          ),
        );
      }

      const data = await response.json();
      const nextResult = buildResultState(data?.result);

      setResult(nextResult);
      setView("result");
      updateStatus(
        "success",
        `Quiz completed with a score of ${nextResult.score}%.`,
        nextResult.weakTopics.length
          ? "Review the weak topics below before your next attempt."
          : "Strong work. No weak topics were flagged in this attempt.",
      );
    } catch (error) {
      updateStatus(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to submit this quiz right now.",
        "Try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectCount = availableSubjects.length;
  const readyQuizCount = allQuizzes.filter(
    (quiz) => quiz.questionCount > 0,
  ).length;
  const assignedQuizCount = allQuizzes.filter(
    (quiz) => quiz.isAssignedToCurrentStudent,
  ).length;

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your quizzes..."
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
                <span>Student Quizzes</span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Start the quizzes that were actually published for you
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Review quizzes assigned directly to you or published for your
                  saved subjects, then open one clean attempt at a time.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <ClipboardList className="h-4 w-4 text-sky-600" />
                  {allQuizzes.length} available quizzes
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Target className="h-4 w-4 text-amber-500" />
                  {subjectCount} subjects covered
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {assignedQuizCount} assigned, {readyQuizCount} ready
                </span>
              </div>
              <div className="rounded-[28px] border border-sky-100/80 bg-white/78 p-5 shadow-[0_24px_56px_-42px_rgba(56,189,248,0.42)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Quiz Focus
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Filter by subject when you want a narrower list, or jump
                  straight into the next assigned quiz and submit it for an
                  instant score.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.3)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Quiz Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Stay inside the quizzes that matter to you
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.22)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <ClipboardList className="h-4 w-4" />
                    Quiz Count
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {allQuizzes.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Real quizzes visible to your account
                  </p>
                </div>
                <div className="rounded-[24px] border border-blue-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(37,99,235,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    <BookOpen className="h-4 w-4" />
                    Subject Filter
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {subjectFilter
                      ? availableSubjects.find(
                          (subject) => subject.id === subjectFilter,
                        )?.name ?? "Filtered"
                      : "All"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Narrow the list when you want one subject at a time
                  </p>
                </div>
              </div>

              <Alert
                className="mt-5 rounded-[24px] border p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]"
                type={statusTone}
              >
                <div className="space-y-1">
                  <p className="font-medium">{statusMessage}</p>
                  {statusHint ? <p>{statusHint}</p> : null}
                </div>
              </Alert>
            </div>
          </div>
        </section>

        {view === "list" ? (
          <SectionCard
            title="Quiz Library"
            description="These quizzes come from real mentor or admin quiz records and are filtered to the ones your account can access."
            action={
              <div className="w-full sm:w-[260px]">
                <select
                  className={selectClassName}
                  onChange={(event) => setSubjectFilter(event.target.value)}
                  value={subjectFilter}
                >
                  <option value="">All subjects</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            }
          >
            {isLoading ? (
              <div className="rounded-[24px] border border-sky-100/80 bg-white/90 p-6 text-sm text-slate-600 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]">
                Loading your quiz list...
              </div>
            ) : quizzes.length === 0 ? (
              <div className="rounded-[24px] border border-sky-100/80 bg-white/90 p-6 text-sm text-slate-600 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]">
                No quizzes match the current filter yet.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {quizzes.map((quiz) => (
                  <Card
                    className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] transition hover:-translate-y-1 shadow-[0_30px_70px_-40px_rgba(56,189,248,0.18)] hover:shadow-[0_34px_76px_-38px_rgba(59,130,246,0.22)]"
                    key={quiz.id}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Badge className="border-transparent bg-sky-100 text-sky-700">
                            {quiz.subjectName || "Subject"}
                          </Badge>
                          <h3 className="mt-4 text-xl font-semibold text-slate-950">
                            {quiz.title}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {quiz.description || "No description added for this quiz."}
                          </p>
                        </div>
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                          <BookOpen className="h-5 w-5" />
                        </span>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        <Badge className="border-transparent bg-sky-100 text-sky-700">
                          {quiz.questionCount} questions
                        </Badge>
                        {quiz.isAssignedToCurrentStudent ? (
                          <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                            Assigned to you
                          </Badge>
                        ) : (
                          <Badge className="border-transparent bg-amber-100 text-amber-700">
                            Subject match
                          </Badge>
                        )}
                      </div>

                      <Button
                        className="mt-6 h-11 w-full rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                        onClick={() => startQuiz(quiz)}
                        type="button"
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </SectionCard>
        ) : null}

        {view === "quiz" && activeQuiz && currentQuestion ? (
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <SectionCard
              title={activeQuiz.title}
              description="Move through each question in order, pick the best answer, and submit when every question is covered."
              action={
                <Badge className="border-transparent bg-sky-100 text-sky-700">
                  {answeredCount} / {activeQuiz.questions.length} answered
                </Badge>
              }
            >
              <div className="space-y-5">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Question {currentQuestionIndex + 1} of{" "}
                        {activeQuiz.questions.length}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">
                        {currentQuestion.prompt}
                      </p>
                    </div>
                    <Badge className="border-transparent bg-sky-100 text-sky-700">
                      {activeQuiz.subjectName || "Subject"}
                    </Badge>
                  </div>
                  <Progress
                    className="mt-5 h-3"
                    indicatorClassName="bg-sky-600"
                    value={quizProgress}
                  />
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const isSelected =
                      selectedAnswers[currentQuestionIndex] === optionIndex;

                    return (
                      <button
                        className={cn(
                          "flex w-full items-start gap-4 rounded-[24px] border p-4 text-left transition",
                          isSelected
                            ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                            : "border-sky-100/80 bg-white/95 hover:border-sky-200 hover:shadow-[0_18px_40px_-24px_rgba(59,130,246,0.16)]",
                        )}
                        key={`${currentQuestion.id}-${optionIndex}`}
                        onClick={() => handleSelectOption(optionIndex)}
                        type="button"
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold",
                            isSelected
                              ? "border-sky-500 bg-sky-500 text-white"
                              : "border-sky-100 bg-sky-50 text-sky-500",
                          )}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="pt-2 text-sm font-medium text-slate-900">
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="h-11 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    onClick={goBackToList}
                    type="button"
                    variant="outline"
                  >
                    Back To Quizzes
                  </Button>
                  <Button
                    className="h-11 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    disabled={currentQuestionIndex === 0}
                    onClick={() =>
                      setCurrentQuestionIndex((current) => Math.max(current - 1, 0))
                    }
                    type="button"
                    variant="outline"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <Button
                      className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                      onClick={() =>
                        setCurrentQuestionIndex((current) =>
                          Math.min(current + 1, activeQuiz.questions.length - 1),
                        )
                      }
                      type="button"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      className="h-11 rounded-2xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                      disabled={isSubmitting}
                      onClick={handleSubmitQuiz}
                      type="button"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Quiz"}
                    </Button>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Quiz Overview"
              description="A quick side view of the subject, question count, and how much of the quiz you have covered so far."
            >
              <div className="space-y-5">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                  <p className="text-sm font-medium text-slate-500">Subject</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {activeQuiz.subjectName || "Subject"}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Questions
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {activeQuiz.questions.length}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Answered
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {answeredCount}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Quiz progress
                  </p>
                  <Progress
                    className="mt-4 h-3"
                    indicatorClassName="bg-sky-600"
                    value={quizProgress}
                  />
                  <p className="mt-3 text-sm text-slate-500">
                    Question {currentQuestionIndex + 1} of{" "}
                    {activeQuiz.questions.length}
                  </p>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Attempt note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The score is calculated on the server when you submit, so
                    the quiz can stay secure while you answer it here.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        ) : null}

        {view === "result" && activeQuiz && result ? (
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <SectionCard
              title="Quiz Result"
              description="Your latest attempt score and the topics that still need more revision."
              action={
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    onClick={goBackToList}
                    type="button"
                    variant="outline"
                  >
                    Back To Quizzes
                  </Button>
                  <Button
                    className="h-10 rounded-2xl bg-sky-600 px-4 text-white hover:bg-sky-700"
                    onClick={restartQuiz}
                    type="button"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retry Quiz
                  </Button>
                </div>
              }
            >
              <div className="space-y-5">
                <div className="rounded-[28px] border border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#f0f9ff_52%,#ecfeff_100%)] p-6 text-slate-950 shadow-[0_28px_65px_-44px_rgba(14,165,233,0.18)]">
                  <p className="text-sm font-medium text-slate-500">
                    {activeQuiz.title}
                  </p>
                  <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-5xl font-semibold tracking-tight text-slate-950">
                        {result.score}%
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {result.correctAnswers} correct and {result.wrongAnswers}{" "}
                        wrong
                      </p>
                    </div>
                    <Badge className="border border-sky-100 bg-sky-50 px-3 py-1 text-sky-700">
                      {activeQuiz.subjectName || "Subject"}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Correct answers
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {result.correctAnswers}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Weak topics
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {result.weakTopics.length}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Weak Topics"
              description="The quiz submission API returns the question prompts you missed, so you can use them as the next revision targets."
            >
              {result.weakTopics.length ? (
                <div className="space-y-3">
                  {result.weakTopics.map((topic, index) => (
                    <div
                      className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4"
                      key={`${topic}-${index}`}
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {index + 1}. {topic}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-sky-100/80 bg-white/90 p-6 text-sm text-slate-600 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]">
                  No weak topics were flagged in this attempt.
                </div>
              )}
            </SectionCard>
          </div>
        ) : null}
      </div>
    </ProtectedDashboardLayout>
  );
}
