"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
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
import { Progress } from "@/components/ui/progress";

type QuizDifficulty = "Easy" | "Medium" | "Hard";

interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  topic: string;
  explanation: string;
}

interface QuizItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  difficulty: QuizDifficulty;
  durationMinutes: number;
  latestScore: number;
  questions: QuizQuestion[];
}

interface QuestionReview {
  questionId: string;
  prompt: string;
  topic: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex: number;
  explanation: string;
  isCorrect: boolean;
}

interface QuizResultState {
  score: number;
  correctCount: number;
  totalQuestions: number;
  weakTopics: Array<{ topic: string; misses: number }>;
  reviews: QuestionReview[];
}

type QuizView = "list" | "quiz" | "result";

const QUIZZES: QuizItem[] = [
  {
    id: "quiz-01",
    title: "Calculus Foundations",
    subject: "Mathematics",
    description:
      "A short revision quiz covering derivatives, limits, and quick problem recognition.",
    difficulty: "Medium",
    durationMinutes: 12,
    latestScore: 82,
    questions: [
      {
        id: "q-01",
        prompt: "What is the derivative of x^2?",
        options: ["x", "2x", "x^3", "2"],
        correctIndex: 1,
        topic: "Derivatives",
        explanation: "The power rule gives 2x for the derivative of x^2.",
      },
      {
        id: "q-02",
        prompt: "As x approaches 0, what does sin x / x approach?",
        options: ["0", "Undefined", "1", "Infinity"],
        correctIndex: 2,
        topic: "Limits",
        explanation: "This classic trigonometric limit approaches 1.",
      },
      {
        id: "q-03",
        prompt: "Which method is most useful for the derivative of a product of two functions?",
        options: ["Chain rule", "Power rule", "Product rule", "Quotient rule"],
        correctIndex: 2,
        topic: "Derivative Rules",
        explanation: "The product rule is specifically used for multiplying functions.",
      },
    ],
  },
  {
    id: "quiz-02",
    title: "Mechanics Checkpoint",
    subject: "Physics",
    description:
      "A focused quiz on force, motion, and acceleration with quick concept validation.",
    difficulty: "Hard",
    durationMinutes: 15,
    latestScore: 74,
    questions: [
      {
        id: "q-04",
        prompt: "Newton's second law is written as:",
        options: ["E = mc^2", "F = ma", "P = mv", "W = fd"],
        correctIndex: 1,
        topic: "Force",
        explanation: "Newton's second law states that force equals mass times acceleration.",
      },
      {
        id: "q-05",
        prompt: "If velocity is changing, the object must have:",
        options: ["Zero mass", "Acceleration", "No force", "Constant energy"],
        correctIndex: 1,
        topic: "Motion",
        explanation: "A change in velocity means the object is accelerating.",
      },
      {
        id: "q-06",
        prompt: "The SI unit of force is:",
        options: ["Joule", "Watt", "Newton", "Pascal"],
        correctIndex: 2,
        topic: "Units",
        explanation: "Force is measured in newtons in the SI system.",
      },
    ],
  },
  {
    id: "quiz-03",
    title: "Organic Chemistry Recall",
    subject: "Chemistry",
    description:
      "A quick memory test for reaction types, energy changes, and key bonding ideas.",
    difficulty: "Easy",
    durationMinutes: 10,
    latestScore: 89,
    questions: [
      {
        id: "q-07",
        prompt: "An exothermic reaction does what?",
        options: [
          "Absorbs heat from surroundings",
          "Releases heat to surroundings",
          "Stops all bonding changes",
          "Creates zero energy change",
        ],
        correctIndex: 1,
        topic: "Energy Changes",
        explanation: "Exothermic reactions release heat to the surroundings.",
      },
      {
        id: "q-08",
        prompt: "Which bond involves sharing electrons?",
        options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"],
        correctIndex: 1,
        topic: "Bonding",
        explanation: "Covalent bonds form by sharing electrons.",
      },
      {
        id: "q-09",
        prompt: "A homologous series contains compounds with:",
        options: [
          "Exactly the same formula",
          "The same functional group",
          "No predictable pattern",
          "No shared properties",
        ],
        correctIndex: 1,
        topic: "Organic Series",
        explanation: "Compounds in a homologous series share the same functional group.",
      },
    ],
  },
];

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

function SummaryCard({
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

function getDifficultyClassName(difficulty: QuizDifficulty) {
  if (difficulty === "Easy") {
    return "border-transparent bg-emerald-500 text-white";
  }

  if (difficulty === "Medium") {
    return "border-transparent bg-amber-500 text-white";
  }

  return "border-transparent bg-rose-500 text-white";
}

function calculateResult(
  quiz: QuizItem,
  answers: Record<string, number>,
): QuizResultState {
  const reviews = quiz.questions.map((question) => {
    const selectedIndex =
      typeof answers[question.id] === "number" ? answers[question.id] : null;
    const isCorrect = selectedIndex === question.correctIndex;

    return {
      questionId: question.id,
      prompt: question.prompt,
      topic: question.topic,
      options: question.options,
      selectedIndex,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      isCorrect,
    };
  });

  const correctCount = reviews.filter((review) => review.isCorrect).length;
  const totalQuestions = reviews.length;
  const score = Math.round((correctCount / totalQuestions) * 100);

  const weakTopicMap = new Map<string, number>();

  reviews.forEach((review) => {
    if (!review.isCorrect) {
      weakTopicMap.set(review.topic, (weakTopicMap.get(review.topic) ?? 0) + 1);
    }
  });

  const weakTopics = Array.from(weakTopicMap.entries())
    .map(([topic, misses]) => ({ topic, misses }))
    .sort((a, b) => b.misses - a.misses);

  return {
    score,
    correctCount,
    totalQuestions,
    weakTopics,
    reviews,
  };
}

export default function StudentQuizzesPage() {
  const [view, setView] = useState<QuizView>("list");
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    {},
  );
  const [result, setResult] = useState<QuizResultState | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Choose a quiz to begin the next review session.",
  );

  const activeQuiz =
    QUIZZES.find((quiz) => quiz.id === activeQuizId) ?? QUIZZES[0] ?? null;
  const currentQuestion = activeQuiz?.questions[currentQuestionIndex] ?? null;
  const averageLatestScore = Math.round(
    QUIZZES.reduce((sum, quiz) => sum + quiz.latestScore, 0) / QUIZZES.length,
  );
  const hardestQuiz =
    [...QUIZZES].sort((a, b) => a.latestScore - b.latestScore)[0]?.title ??
    "No quizzes";
  const answeredCount = activeQuiz
    ? activeQuiz.questions.filter(
        (question) => typeof selectedAnswers[question.id] === "number",
      ).length
    : 0;
  const quizProgress = activeQuiz
    ? ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100
    : 0;

  const startQuiz = (quiz: QuizItem) => {
    setActiveQuizId(quiz.id);
    setView("quiz");
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResult(null);
    setStatusMessage(`Started ${quiz.title}.`);
  };

  const restartQuiz = () => {
    if (!activeQuiz) {
      return;
    }

    setView("quiz");
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResult(null);
    setStatusMessage(`Restarted ${activeQuiz.title}.`);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) {
      return;
    }

    setSelectedAnswers((current) => ({
      ...current,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) {
      return;
    }

    const nextResult = calculateResult(activeQuiz, selectedAnswers);
    setResult(nextResult);
    setView("result");
    setStatusMessage(`Quiz completed with a score of ${nextResult.score}%.`);
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your quizzes..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#f3f8ff_36%,#ecfeff_72%,#fefce8_108%)] p-6 shadow-[0_34px_90px_-46px_rgba(56,189,248,0.24)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-sky-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                Quiz Practice
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Clean quiz workflow
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Pick a quiz, answer each question with focus, and review the result
                  with score, correct answers, and weak topic insights right after.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  {QUIZZES.length} quizzes available
                </span>
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  Avg. score {averageLatestScore}%
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/85 bg-white/94 px-5 py-4 text-sm text-slate-600 shadow-[0_18px_38px_-28px_rgba(56,189,248,0.22)]">
              {statusMessage}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            accentClassName="from-indigo-700 to-sky-600"
            detail="Ready to take now"
            icon={<ClipboardList className="h-5 w-5" />}
            label="Available Quizzes"
            value={`${QUIZZES.length}`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Across latest attempts"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Average Score"
            value={`${averageLatestScore}%`}
          />
          <SummaryCard
            accentClassName="from-amber-500 to-orange-500"
            detail="Lowest recent score"
            icon={<Target className="h-5 w-5" />}
            label="Needs Work"
            value={hardestQuiz}
          />
        </section>

        {view === "list" ? (
          <SectionCard
            description="Choose a quiz by subject and difficulty, then jump straight into the question flow."
            title="Quiz List"
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {QUIZZES.map((quiz) => (
                <Card
                  className="rounded-[30px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] transition hover:-translate-y-1 shadow-[0_30px_70px_-40px_rgba(56,189,248,0.18)] hover:shadow-[0_34px_76px_-38px_rgba(59,130,246,0.22)]"
                  key={quiz.id}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge className="border-transparent bg-sky-100 text-sky-700">
                          {quiz.subject}
                        </Badge>
                        <h3 className="mt-4 text-xl font-semibold text-slate-950">
                          {quiz.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {quiz.description}
                        </p>
                      </div>
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                        <BookOpen className="h-5 w-5" />
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <Badge className={cn("px-3 py-1", getDifficultyClassName(quiz.difficulty))}>
                        {quiz.difficulty}
                      </Badge>
                      <Badge className="border-transparent bg-sky-100 text-sky-700">
                        {quiz.questions.length} questions
                      </Badge>
                      <Badge className="border-transparent bg-sky-100 text-sky-700">
                        {quiz.durationMinutes} min
                      </Badge>
                    </div>

                    <div className="mt-6 rounded-[22px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-600">
                          Latest score
                        </p>
                        <span className="text-lg font-semibold text-slate-950">
                          {quiz.latestScore}%
                        </span>
                      </div>
                      <Progress
                        className="mt-3 h-3"
                        indicatorClassName="bg-sky-600"
                        value={quiz.latestScore}
                      />
                    </div>

                    <Button
                      className="mt-6 h-11 w-full rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                      onClick={() => startQuiz(quiz)}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {view === "quiz" && activeQuiz && currentQuestion ? (
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <SectionCard
              action={
                <Badge className="border-transparent bg-sky-100 text-sky-700">
                  {answeredCount} / {activeQuiz.questions.length} answered
                </Badge>
              }
              description="Move question by question, choose the best answer, and submit when you're ready."
              title={activeQuiz.title}
            >
              <div className="space-y-5">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">
                        {currentQuestion.prompt}
                      </p>
                    </div>
                    <Badge className="border-transparent bg-sky-100 text-sky-700">
                      {currentQuestion.topic}
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
                      selectedAnswers[currentQuestion.id] === optionIndex;

                    return (
                      <button
                        className={cn(
                          "flex w-full items-start gap-4 rounded-[24px] border p-4 text-left transition",
                          isSelected
                            ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                            : "border-sky-100/80 bg-white/95 hover:border-sky-200 hover:shadow-[0_18px_40px_-24px_rgba(59,130,246,0.16)]",
                        )}
                        key={option}
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
                    disabled={currentQuestionIndex === 0}
                    onClick={() =>
                      setCurrentQuestionIndex((current) => Math.max(current - 1, 0))
                    }
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
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      className="h-11 rounded-2xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                      onClick={handleSubmitQuiz}
                    >
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="A quick side view of quiz pacing, difficulty, and answer coverage as you work."
              title="Quiz Overview"
            >
              <div className="space-y-5">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                  <p className="text-sm font-medium text-slate-500">Difficulty</p>
                  <Badge className={cn("mt-3 px-3 py-1", getDifficultyClassName(activeQuiz.difficulty))}>
                    {activeQuiz.difficulty}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-medium text-slate-500">Questions</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {activeQuiz.questions.length}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-medium text-slate-500">Duration</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {activeQuiz.durationMinutes} min
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Latest score trend
                  </p>
                  <Progress
                    className="mt-4 h-3"
                    indicatorClassName="bg-sky-600"
                    value={activeQuiz.latestScore}
                  />
                  <p className="mt-3 text-sm text-slate-500">
                    Most recent score: {activeQuiz.latestScore}%
                  </p>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Focus reminder
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Work one question at a time, eliminate weak options fast, and
                    trust the first answer you can clearly justify.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        ) : null}

        {view === "result" && activeQuiz && result ? (
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <SectionCard
              action={
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    onClick={() => setView("list")}
                    variant="outline"
                  >
                    Back To Quizzes
                  </Button>
                  <Button
                    className="h-10 rounded-2xl bg-sky-600 px-4 text-white hover:bg-sky-700"
                    onClick={restartQuiz}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retry Quiz
                  </Button>
                </div>
              }
              description="Your result summary shows overall score, question accuracy, and which topics still need more attention."
              title="Quiz Result"
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
                        {result.correctCount} correct out of {result.totalQuestions}
                      </p>
                    </div>
                    <Badge className="border border-sky-100 bg-sky-50 px-3 py-1 text-sky-700">
                      {activeQuiz.subject}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-medium text-slate-500">Correct Answers</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {result.correctCount}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                    <p className="text-sm font-medium text-slate-500">Weak Topics</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {result.weakTopics.length}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4">
                  <p className="text-sm font-semibold text-slate-950">Weak Topics</p>
                  {result.weakTopics.length ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {result.weakTopics.map((topic) => (
                        <Badge
                          className="border-transparent bg-rose-100 px-3 py-1 text-rose-700"
                          key={topic.topic}
                        >
                          {topic.topic} â€¢ {topic.misses} miss{topic.misses > 1 ? "es" : ""}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">
                      No weak topics surfaced in this attempt. Strong work.
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              description="Question-level feedback showing your answer, the correct answer, and a quick explanation."
              title="Correct Answers Review"
            >
              <div className="space-y-4">
                {result.reviews.map((review, index) => (
                  <div
                    className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-4"
                    key={review.questionId}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {index + 1}. {review.prompt}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <Badge className="border-transparent bg-sky-100 text-sky-700">
                            {review.topic}
                          </Badge>
                          <Badge
                            className={cn(
                              "border-transparent",
                              review.isCorrect
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700",
                            )}
                          >
                            {review.isCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>
                      </div>
                      <CircleHelp className="h-5 w-5 text-slate-400" />
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p>
                        Your answer:{" "}
                        <span className="font-medium text-slate-900">
                          {review.selectedIndex !== null
                            ? review.options[review.selectedIndex]
                            : "No answer selected"}
                        </span>
                      </p>
                      <p>
                        Correct answer:{" "}
                        <span className="font-medium text-slate-900">
                          {review.options[review.correctIndex]}
                        </span>
                      </p>
                      <p>{review.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        ) : null}
      </div>
    </ProtectedDashboardLayout>
  );
}






