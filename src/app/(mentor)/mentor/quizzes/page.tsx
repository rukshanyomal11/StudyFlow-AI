"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Copy,
  Eye,
  FileQuestion,
  PencilLine,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { mentorSidebarLinks } from "@/data/sidebarLinks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuizStatus = "Active" | "Draft" | "Archived";
type ModalMode = "create" | "edit" | null;

interface QuizItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  questionCount: number;
  assignedStudents: string;
  averageScore: number;
  status: QuizStatus;
  attempts: number;
  timeLimit: number;
  questionPrompt: string;
  options: string[];
  correctAnswer: string;
}

interface QuizDraft {
  title: string;
  subject: string;
  description: string;
  questionCount: string;
  questionPrompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  timeLimit: string;
}

const INITIAL_QUIZZES: QuizItem[] = [
  { id: "quiz-01", title: "Mechanics Checkpoint", subject: "Physics", description: "A fast checkpoint quiz covering force diagrams, acceleration, and momentum.", questionCount: 12, assignedStudents: "Physics cohort (31)", averageScore: 84, status: "Active", attempts: 118, timeLimit: 20, questionPrompt: "Which force diagram correctly represents balanced forces?", options: ["Diagram A", "Diagram B", "Diagram C", "Diagram D"], correctAnswer: "Diagram B" },
  { id: "quiz-02", title: "Organic Reaction Recall", subject: "Chemistry", description: "Revision quiz for reaction pathways, reagents, and mechanism identification.", questionCount: 15, assignedStudents: "Chemistry cohort (42)", averageScore: 78, status: "Active", attempts: 143, timeLimit: 25, questionPrompt: "Which reagent converts an alcohol into an alkene in this pathway?", options: ["KMnO4", "H2SO4", "NaOH", "Cl2"], correctAnswer: "H2SO4" },
  { id: "quiz-03", title: "Algebra Skills Sprint", subject: "Mathematics", description: "Quick algebra assessment focused on factorization and equation solving.", questionCount: 10, assignedStudents: "Grade 11 algebra group", averageScore: 81, status: "Draft", attempts: 52, timeLimit: 18, questionPrompt: "Which expression is the correct factorization of x^2 + 5x + 6?", options: ["(x+1)(x+6)", "(x+2)(x+3)", "(x+2)(x+4)", "(x+3)(x+3)"], correctAnswer: "(x+2)(x+3)" },
  { id: "quiz-04", title: "Essay Structure Diagnostic", subject: "Literature", description: "A rubric-aligned quiz to identify weak spots in introduction and thesis writing.", questionCount: 8, assignedStudents: "Writing improvement group", averageScore: 66, status: "Active", attempts: 37, timeLimit: 15, questionPrompt: "Which statement works best as a clear thesis?", options: ["Statement A", "Statement B", "Statement C", "Statement D"], correctAnswer: "Statement C" },
  { id: "quiz-05", title: "Biology Unit Review", subject: "Biology", description: "Unit-end quiz checking recall, diagrams, and terminology accuracy.", questionCount: 14, assignedStudents: "Grade 10 biology class", averageScore: 88, status: "Archived", attempts: 96, timeLimit: 22, questionPrompt: "Which organelle is responsible for energy production in the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"], correctAnswer: "Mitochondria" },
];

const EMPTY_DRAFT: QuizDraft = {
  title: "",
  subject: "",
  description: "",
  questionCount: "10",
  questionPrompt: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
  timeLimit: "20",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const SURFACE_CARD_CLASS_NAME =
  "rounded-[30px] border border-slate-200/90 bg-white/95 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.16)] backdrop-blur-sm dark:!border-slate-200 dark:!bg-white dark:!text-slate-950";

const PRIMARY_BUTTON_CLASS_NAME =
  "bg-sky-600 text-white hover:bg-sky-700 dark:!bg-sky-600 dark:!text-white dark:hover:!bg-sky-700";

const SECONDARY_BUTTON_CLASS_NAME =
  "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:!border-slate-200 dark:!bg-white dark:!text-slate-900 dark:hover:!bg-slate-50";

function SectionCard({ title, description, action, children }: { title: string; description: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className={SURFACE_CARD_CLASS_NAME}>
      <CardHeader className="pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950 dark:!text-slate-950">{title}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:!text-slate-600">{description}</CardDescription>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function SummaryCard({ label, value, detail, icon, accentClassName }: { label: string; value: string; detail: string; icon: ReactNode; accentClassName: string }) {
  return (
    <Card className={cn(SURFACE_CARD_CLASS_NAME, "rounded-[28px]")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:!text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:!text-slate-950">{value}</p>
            <p className="mt-2 text-sm text-slate-500 dark:!text-slate-500">{detail}</p>
          </div>
          <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_14px_28px_-16px_rgba(15,23,42,0.4)]", accentClassName)}>{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function statusBadgeClass(status: QuizStatus) {
  if (status === "Active") return "border-transparent bg-emerald-100 text-emerald-700";
  if (status === "Draft") return "border-transparent bg-amber-100 text-amber-700";
  return "border-transparent bg-slate-200 text-slate-700";
}

export default function MentorQuizzesPage() {
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [selectedQuizId, setSelectedQuizId] = useState(INITIAL_QUIZZES[0]?.id ?? "");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<QuizDraft>(EMPTY_DRAFT);
  const [statusMessage, setStatusMessage] = useState(
    "Select a quiz to review performance, question setup, and assignment coverage.",
  );

  const selectedQuiz =
    quizzes.find((quiz) => quiz.id === selectedQuizId) ?? quizzes[0] ?? null;

  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter((quiz) => quiz.status === "Active").length;
  const completedAttempts = quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0);
  const averageScore = Math.round(
    quizzes.reduce((sum, quiz) => sum + quiz.averageScore, 0) / quizzes.length,
  );

  const topPerformingQuiz = useMemo(
    () => [...quizzes].sort((a, b) => b.averageScore - a.averageScore)[0] ?? null,
    [quizzes],
  );

  const lowScoreQuiz = useMemo(
    () => [...quizzes].sort((a, b) => a.averageScore - b.averageScore)[0] ?? null,
    [quizzes],
  );

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setStatusMessage("Create a new quiz and prepare it for assignment.");
  };

  const openEditModal = (quiz: QuizItem) => {
    setModalMode("edit");
    setEditingId(quiz.id);
    setDraft({
      title: quiz.title,
      subject: quiz.subject,
      description: quiz.description,
      questionCount: `${quiz.questionCount}`,
      questionPrompt: quiz.questionPrompt,
      optionA: quiz.options[0] ?? "",
      optionB: quiz.options[1] ?? "",
      optionC: quiz.options[2] ?? "",
      optionD: quiz.options[3] ?? "",
      correctAnswer: quiz.correctAnswer,
      timeLimit: `${quiz.timeLimit}`,
    });
    setSelectedQuizId(quiz.id);
    setStatusMessage(`Editing ${quiz.title}.`);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  };

  const handleSaveQuiz = () => {
    const title = draft.title.trim();
    const subject = draft.subject.trim();
    const description = draft.description.trim();
    const questionPrompt = draft.questionPrompt.trim();
    const options = [
      draft.optionA.trim(),
      draft.optionB.trim(),
      draft.optionC.trim(),
      draft.optionD.trim(),
    ];
    const questionCount = Math.max(1, Number(draft.questionCount) || 1);
    const timeLimit = Math.max(5, Number(draft.timeLimit) || 5);

    if (
      !title ||
      !subject ||
      !description ||
      !questionPrompt ||
      options.some((option) => !option) ||
      !draft.correctAnswer.trim()
    ) {
      setStatusMessage("Add quiz details, a question, options, and the correct answer before saving.");
      return;
    }

    if (modalMode === "edit" && editingId) {
      setQuizzes((current) =>
        current.map((quiz) =>
          quiz.id === editingId
            ? {
                ...quiz,
                title,
                subject,
                description,
                questionCount,
                questionPrompt,
                options,
                correctAnswer: draft.correctAnswer.trim(),
                timeLimit,
              }
            : quiz,
        ),
      );
      setStatusMessage(`Updated ${title}.`);
      closeModal();
      return;
    }

    const newQuiz: QuizItem = {
      id: `quiz-${Date.now()}`,
      title,
      subject,
      description,
      questionCount,
      assignedStudents: "Unassigned draft",
      averageScore: 0,
      status: "Draft",
      attempts: 0,
      timeLimit,
      questionPrompt,
      options,
      correctAnswer: draft.correctAnswer.trim(),
    };

    setQuizzes((current) => [newQuiz, ...current]);
    setSelectedQuizId(newQuiz.id);
    setStatusMessage(`Created ${newQuiz.title}.`);
    closeModal();
  };

  const handleView = (id: string) => {
    const quiz = quizzes.find((item) => item.id === id);
    if (!quiz) return;
    setSelectedQuizId(id);
    setStatusMessage(`Opened ${quiz.title}.`);
  };

  const handleAssign = (id: string) => {
    const quiz = quizzes.find((item) => item.id === id);
    if (!quiz) return;
    setSelectedQuizId(id);
    setStatusMessage(`Assignment flow ready for ${quiz.title}.`);
  };

  const handleDuplicate = (id: string) => {
    const quiz = quizzes.find((item) => item.id === id);
    if (!quiz) return;
    const duplicate: QuizItem = {
      ...quiz,
      id: `quiz-${Date.now()}`,
      title: `${quiz.title} Copy`,
      status: "Draft",
      attempts: 0,
      averageScore: 0,
      assignedStudents: "Unassigned draft",
    };
    setQuizzes((current) => [duplicate, ...current]);
    setSelectedQuizId(duplicate.id);
    setStatusMessage(`Duplicated ${quiz.title}.`);
  };

  const handleDelete = (id: string) => {
    const quiz = quizzes.find((item) => item.id === id);
    setQuizzes((current) => current.filter((item) => item.id !== id));
    if (quiz) {
      setStatusMessage(`${quiz.title} deleted from the quiz library.`);
    }
  };

  return (
    <ProtectedDashboardLayout role="mentor" links={mentorSidebarLinks} loadingMessage="Loading your quizzes workspace...">
      <div className="mx-auto max-w-[1600px] space-y-8 pb-8 text-slate-950">
        <Card className="relative overflow-hidden rounded-[34px] border border-sky-100 bg-transparent text-slate-950 shadow-[0_30px_100px_-48px_rgba(15,23,42,0.24)] dark:!border-sky-100 dark:!bg-transparent dark:!text-slate-950">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(14, 165, 233, 0.2), transparent 24%), radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.18), transparent 24%), radial-gradient(circle at 70% 85%, rgba(245, 158, 11, 0.12), transparent 18%), linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.98) 48%, rgba(236, 253, 245, 0.98) 100%)",
            }}
          />
          <CardContent className="relative p-8 md:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-5">
                <Badge className="rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm dark:!border-sky-200 dark:!bg-white dark:!text-sky-700">
                  <ClipboardList className="mr-2 h-3.5 w-3.5" />
                  Mentor assessment studio
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:!text-slate-950">
                    Quizzes
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base dark:!text-slate-600">
                    Build, assign, and refine quizzes in one clean assessment management workspace for StudyFlow AI mentors.
                  </p>
                </div>
              </div>

              <Button className={cn("h-12 rounded-2xl px-5 text-sm font-semibold shadow-[0_18px_35px_-18px_rgba(2,132,199,0.45)]", PRIMARY_BUTTON_CLASS_NAME)} onClick={openCreateModal} type="button">
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard accentClassName="from-indigo-700 to-sky-600" detail="Assessment items in your library" icon={<ClipboardList className="h-5 w-5" />} label="Total Quizzes" value={`${totalQuizzes}`} />
          <SummaryCard accentClassName="from-emerald-600 to-teal-500" detail="Quizzes currently available to learners" icon={<CheckCircle2 className="h-5 w-5" />} label="Active Quizzes" value={`${activeQuizzes}`} />
          <SummaryCard accentClassName="from-sky-600 to-cyan-500" detail="Submitted attempts across all quizzes" icon={<Users className="h-5 w-5" />} label="Completed Attempts" value={`${completedAttempts}`} />
          <SummaryCard accentClassName="from-violet-600 to-fuchsia-500" detail="Average score across the quiz library" icon={<Target className="h-5 w-5" />} label="Average Score" value={`${averageScore}%`} />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
          <SectionCard
            action={
              <Badge className="border-transparent bg-sky-100 text-sky-700">
                {quizzes.length} quizzes
              </Badge>
            }
            description="Manage active, draft, and archived quizzes across your assigned subjects and student groups."
            title="Quiz Library"
          >
            <div className="hidden xl:block">
              <div className="grid grid-cols-[1.5fr_0.9fr_0.85fr_1.2fr_0.85fr_0.85fr_1.55fr] gap-4 border-b border-slate-200 px-2 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Title</span>
                <span>Subject</span>
                <span>Questions</span>
                <span>Assigned</span>
                <span>Avg Score</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              <div className="mt-4 space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    className={cn(
                      "grid grid-cols-[1.5fr_0.9fr_0.85fr_1.2fr_0.85fr_0.85fr_1.55fr] items-start gap-4 rounded-[24px] border p-4 transition",
                      selectedQuiz?.id === quiz.id
                        ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
                    )}
                    key={quiz.id}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{quiz.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{quiz.description}</p>
                    </div>
                    <p className="text-sm text-slate-600">{quiz.subject}</p>
                    <p className="text-sm font-semibold text-slate-950">{quiz.questionCount}</p>
                    <p className="text-sm text-slate-600">{quiz.assignedStudents}</p>
                    <p className="text-sm font-semibold text-slate-950">{quiz.averageScore}%</p>
                    <Badge className={statusBadgeClass(quiz.status)}>{quiz.status}</Badge>
                    <div className="flex flex-wrap gap-2">
                      <Button className={cn("h-9 rounded-2xl px-3", PRIMARY_BUTTON_CLASS_NAME)} onClick={() => handleView(quiz.id)} type="button">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => openEditModal(quiz)} type="button" variant="outline">
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => handleAssign(quiz.id)} type="button" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Assign
                      </Button>
                      <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => handleDuplicate(quiz.id)} type="button" variant="outline">
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </Button>
                      <Button className="h-9 rounded-2xl border border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100" onClick={() => handleDelete(quiz.id)} type="button" variant="outline">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 xl:hidden">
              {quizzes.map((quiz) => (
                <div
                  className={cn(
                    "rounded-[26px] border p-5 transition",
                    selectedQuiz?.id === quiz.id
                      ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
                  )}
                  key={quiz.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{quiz.title}</p>
                      <p className="mt-2 text-sm text-slate-500">{quiz.description}</p>
                    </div>
                    <Badge className={statusBadgeClass(quiz.status)}>{quiz.status}</Badge>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Subject</p>
                      <p className="mt-2 font-semibold text-slate-950">{quiz.subject}</p>
                    </div>
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Questions</p>
                      <p className="mt-2 font-semibold text-slate-950">{quiz.questionCount}</p>
                    </div>
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Avg Score</p>
                      <p className="mt-2 font-semibold text-slate-950">{quiz.averageScore}%</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className={cn("h-9 rounded-2xl px-3", PRIMARY_BUTTON_CLASS_NAME)} onClick={() => handleView(quiz.id)} type="button">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => openEditModal(quiz)} type="button" variant="outline">
                      Edit
                    </Button>
                    <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => handleAssign(quiz.id)} type="button" variant="outline">
                      Assign
                    </Button>
                    <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => handleDuplicate(quiz.id)} type="button" variant="outline">
                      Duplicate
                    </Button>
                    <Button className="h-9 rounded-2xl border border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100" onClick={() => handleDelete(quiz.id)} type="button" variant="outline">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              description="Review the selected quiz setup, sample question, timing, and assignment coverage."
              title="Quiz Preview"
            >
              {selectedQuiz ? (
                <div className="space-y-5">
                  <div className="rounded-[26px] border border-slate-200/90 bg-white/92 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)]">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-950">{selectedQuiz.title}</h2>
                      <Badge className={statusBadgeClass(selectedQuiz.status)}>{selectedQuiz.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{selectedQuiz.description}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Subject</p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">{selectedQuiz.subject}</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Time Limit</p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">{selectedQuiz.timeLimit} mins</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assigned Students</p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">{selectedQuiz.assignedStudents}</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Attempts</p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">{selectedQuiz.attempts}</p>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200/90 bg-white/92 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-[0_16px_26px_-18px_rgba(37,99,235,0.44)]">
                        <FileQuestion className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Sample Question</p>
                        <p className="mt-1 text-sm text-slate-500">{selectedQuiz.questionPrompt}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {selectedQuiz.options.map((option) => (
                        <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm" key={option}>
                          {option}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                        Correct answer: {selectedQuiz.correctAnswer}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              description="High-signal assessment insights to help refine quiz quality and learner engagement."
              title="Quiz Performance"
            >
              <div className="grid gap-4">
                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                      <Trophy className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Top Performing Quiz</p>
                      <p className="mt-1 text-sm text-slate-600">{topPerformingQuiz?.title} at {topPerformingQuiz?.averageScore}% average score</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
                      <Target className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Low Score Quiz</p>
                      <p className="mt-1 text-sm text-slate-600">{lowScoreQuiz?.title} is currently at {lowScoreQuiz?.averageScore}% average score</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-sky-200 bg-sky-50/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Engagement Insight</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {topPerformingQuiz?.title} is also driving the strongest engagement with {topPerformingQuiz?.attempts} attempts, while draft quizzes are ready for refinement and assignment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {statusMessage}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        {modalMode ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
            <div className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_90px_-35px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {modalMode === "create" ? "Create Quiz" : "Edit Quiz"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Configure quiz details, a starter question, answer options, and timing.
                  </p>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                  onClick={closeModal}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
                <input className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Quiz title" value={draft.title} />
                <input className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))} placeholder="Subject" value={draft.subject} />
                <input className={inputClassName} min={1} onChange={(event) => setDraft((current) => ({ ...current, questionCount: event.target.value }))} placeholder="Questions count" type="number" value={draft.questionCount} />
                <input className={inputClassName} min={5} onChange={(event) => setDraft((current) => ({ ...current, timeLimit: event.target.value }))} placeholder="Time limit (mins)" type="number" value={draft.timeLimit} />

                <div className="md:col-span-2">
                  <textarea className={textareaClassName} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={4} value={draft.description} />
                </div>

                <div className="md:col-span-2">
                  <textarea className={textareaClassName} onChange={(event) => setDraft((current) => ({ ...current, questionPrompt: event.target.value }))} placeholder="Question prompt" rows={4} value={draft.questionPrompt} />
                </div>

                <input className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, optionA: event.target.value }))} placeholder="Option A" value={draft.optionA} />
                <input className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, optionB: event.target.value }))} placeholder="Option B" value={draft.optionB} />
                <input className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, optionC: event.target.value }))} placeholder="Option C" value={draft.optionC} />
                <input className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, optionD: event.target.value }))} placeholder="Option D" value={draft.optionD} />

                <div className="md:col-span-2">
                  <input className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, correctAnswer: event.target.value }))} placeholder="Correct answer" value={draft.correctAnswer} />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Quiz creation stays local in this demo and is ready to connect to MongoDB later.
                </p>
                <div className="flex gap-3">
                  <Button className={cn("h-11 rounded-2xl px-5", SECONDARY_BUTTON_CLASS_NAME)} onClick={closeModal} type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button className={cn("h-11 rounded-2xl px-5", PRIMARY_BUTTON_CLASS_NAME)} onClick={handleSaveQuiz} type="button">
                    <Plus className="mr-2 h-4 w-4" />
                    {modalMode === "create" ? "Create Quiz" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedDashboardLayout>
  );
}
