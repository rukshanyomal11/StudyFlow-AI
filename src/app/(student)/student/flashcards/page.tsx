"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers3,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { studentSidebarLinks } from "@/data/sidebarLinks";
import { flashcardService } from "@/services/flashcard.service";
import { subjectService } from "@/services/subject.service";
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

type ReviewRating = "easy" | "medium" | "hard";

interface SubjectOption {
  id: string;
  name: string;
  progress: number | null;
}

interface FlashcardItem {
  id: string;
  subjectId: string;
  subject: string;
  front: string;
  back: string;
  reviewCount: number;
  lastRating: ReviewRating;
  nextReviewDate: string;
  updatedAt: string;
  createdAt: string;
}

interface FlashcardDraft {
  subjectId: string;
  front: string;
  back: string;
}

interface FlashcardApiRecord {
  _id?: string;
  id?: string;
  subjectId?: string | { _id?: string; id?: string; name?: string };
  question?: string;
  answer?: string;
  difficulty?: string;
  nextReviewDate?: string;
  reviewCount?: number;
  updatedAt?: string;
  createdAt?: string;
}

const EMPTY_DRAFT: FlashcardDraft = {
  subjectId: "",
  front: "",
  back: "",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[132px] w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getSubjectId(value: FlashcardApiRecord["subjectId"]) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value._id === "string") {
    return value._id;
  }

  if (typeof value.id === "string") {
    return value.id;
  }

  return "";
}

function normalizeRating(value: unknown): ReviewRating {
  if (value === "easy" || value === "medium" || value === "hard") {
    return value;
  }

  return "medium";
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatReviewDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function isDue(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() <= Date.now();
}

function getRatingLabel(rating: ReviewRating) {
  if (rating === "easy") {
    return "Easy";
  }

  if (rating === "medium") {
    return "Medium";
  }

  return "Hard";
}

function getRatingClasses(rating: ReviewRating) {
  if (rating === "easy") {
    return "!border-emerald-300 !bg-emerald-100 !text-emerald-900";
  }

  if (rating === "medium") {
    return "!border-amber-300 !bg-amber-100 !text-amber-900";
  }

  return "!border-rose-300 !bg-rose-100 !text-rose-900";
}

function buildDraft(card: FlashcardItem): FlashcardDraft {
  return {
    subjectId: card.subjectId,
    front: card.front,
    back: card.back,
  };
}

function mapFlashcard(
  card: FlashcardApiRecord,
  subjectsById: Map<string, SubjectOption>,
): FlashcardItem {
  const subjectId = getSubjectId(card.subjectId);
  const subject = subjectsById.get(subjectId);

  return {
    id: card._id || card.id || "",
    subjectId,
    subject: subject?.name || "Unknown subject",
    front: typeof card.question === "string" ? card.question : "",
    back: typeof card.answer === "string" ? card.answer : "",
    reviewCount: typeof card.reviewCount === "number" ? card.reviewCount : 0,
    lastRating: normalizeRating(card.difficulty),
    nextReviewDate:
      typeof card.nextReviewDate === "string"
        ? card.nextReviewDate
        : new Date().toISOString(),
    updatedAt:
      typeof card.updatedAt === "string"
        ? card.updatedAt
        : new Date().toISOString(),
    createdAt:
      typeof card.createdAt === "string"
        ? card.createdAt
        : new Date().toISOString(),
  };
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{detail}</p>
          </div>
          <span
            className={cn(
              "-mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-200/70",
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

export default function StudentFlashcardsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FlashcardDraft>(EMPTY_DRAFT);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingReview, setPendingReview] = useState<ReviewRating | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Loading your flashcards and subject library.",
  );

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const selectedCard =
    flashcards.find((card) => card.id === selectedCardId) ?? flashcards[0] ?? null;

  const reviewIndex = useMemo(
    () => flashcards.findIndex((card) => card.id === selectedCardId),
    [flashcards, selectedCardId],
  );

  const totalReviewCount = useMemo(
    () => flashcards.reduce((sum, card) => sum + card.reviewCount, 0),
    [flashcards],
  );

  const difficultCount = useMemo(
    () => flashcards.filter((card) => card.lastRating === "hard").length,
    [flashcards],
  );

  const dueCount = useMemo(
    () => flashcards.filter((card) => isDue(card.nextReviewDate)).length,
    [flashcards],
  );

  const studyReadiness = flashcards.length
    ? Math.round(((flashcards.length - difficultCount) / flashcards.length) * 100)
    : 0;

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [subjectRecords, flashcardRecords] = await Promise.all([
          subjectService.getSubjects(),
          flashcardService.getFlashcards(),
        ]);

        if (!isActive) {
          return;
        }

        const nextSubjects = Array.isArray(subjectRecords)
          ? subjectRecords.map((subject: any) => ({
              id: subject?._id || subject?.id || "",
              name:
                typeof subject?.name === "string"
                  ? subject.name
                  : "Unnamed subject",
              progress:
                typeof subject?.progress === "number" ? subject.progress : null,
            }))
          : [];
        const nextSubjectMap = new Map(
          nextSubjects.map((subject) => [subject.id, subject]),
        );
        const nextFlashcards = Array.isArray(flashcardRecords)
          ? flashcardRecords.map((card: FlashcardApiRecord) =>
              mapFlashcard(card, nextSubjectMap),
            )
          : [];

        setSubjects(nextSubjects);
        setFlashcards(nextFlashcards);

        if (nextFlashcards.length > 0) {
          const firstCard = nextFlashcards[0];
          setSelectedCardId(firstCard.id);
          setDraft(buildDraft(firstCard));
          setStatusMessage(
            "Your flashcards are synced with the database and ready to review.",
          );
        } else if (nextSubjects.length === 0) {
          setSelectedCardId(null);
          setDraft(EMPTY_DRAFT);
          setStatusMessage(
            "Create a subject first, then your flashcards will save against real study topics.",
          );
        } else {
          setSelectedCardId(null);
          setDraft({ ...EMPTY_DRAFT, subjectId: nextSubjects[0].id });
          setStatusMessage(
            "No flashcards saved yet. Create your first card and it will persist to the backend.",
          );
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatusMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your flashcards right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const selectCard = (card: FlashcardItem) => {
    setSelectedCardId(card.id);
    setDraft(buildDraft(card));
    setIsCreateMode(false);
    setIsFlipped(false);
    setStatusMessage(`Editing ${card.subject} flashcard.`);
  };

  const openCreateMode = () => {
    if (!subjects.length) {
      setStatusMessage("Create at least one subject before adding flashcards.");
      return;
    }

    setSelectedCardId(null);
    setDraft({ ...EMPTY_DRAFT, subjectId: subjects[0].id });
    setIsCreateMode(true);
    setIsFlipped(false);
    setStatusMessage("Create a new flashcard and save it to your library.");
  };

  const handleSaveCard = async () => {
    const subjectId = draft.subjectId.trim();
    const front = draft.front.trim();
    const back = draft.back.trim();

    if (!subjectId || !front || !back) {
      setStatusMessage(
        "Choose a subject, then add both the prompt and answer before saving.",
      );
      return;
    }

    setIsSaving(true);

    try {
      if (isCreateMode || !selectedCardId) {
        const created = await flashcardService.createFlashcard({
          subjectId,
          question: front,
          answer: back,
        });

        if (!created) {
          throw new Error("Flashcard created, but no card was returned.");
        }

        const nextCard = mapFlashcard(created, subjectsById);
        setFlashcards((current) => [nextCard, ...current]);
        setSelectedCardId(nextCard.id);
        setDraft(buildDraft(nextCard));
        setIsCreateMode(false);
        setIsFlipped(false);
        setStatusMessage("New flashcard saved to your account.");
        return;
      }

      const updated = await flashcardService.updateFlashcard(selectedCardId, {
        subjectId,
        question: front,
        answer: back,
      });

      if (!updated) {
        throw new Error("Flashcard updated, but no card was returned.");
      }

      const nextCard = mapFlashcard(updated, subjectsById);

      setFlashcards((current) =>
        current.map((card) => (card.id === nextCard.id ? nextCard : card)),
      );
      setDraft(buildDraft(nextCard));
      setIsFlipped(false);
      setStatusMessage("Flashcard updated successfully.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this flashcard right now.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCardId) {
      setStatusMessage("There is no selected flashcard to delete.");
      return;
    }

    setIsDeleting(true);

    try {
      await flashcardService.deleteFlashcard(selectedCardId);
      const nextCards = flashcards.filter((card) => card.id !== selectedCardId);
      const nextSelected = nextCards[0] ?? null;

      setFlashcards(nextCards);
      setSelectedCardId(nextSelected?.id ?? null);
      setDraft(
        nextSelected
          ? buildDraft(nextSelected)
          : { ...EMPTY_DRAFT, subjectId: subjects[0]?.id ?? "" },
      );
      setIsCreateMode(false);
      setIsFlipped(false);
      setStatusMessage("Flashcard deleted from your library.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this flashcard right now.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReviewRating = async (rating: ReviewRating) => {
    if (!selectedCard) {
      return;
    }

    setPendingReview(rating);

    try {
      const reviewed = await flashcardService.reviewFlashcard(selectedCard.id, rating);

      if (!reviewed) {
        throw new Error("Review saved, but no flashcard was returned.");
      }

      const updatedCard = mapFlashcard(reviewed, subjectsById);
      const updatedCards = flashcards.map((card) =>
        card.id === updatedCard.id ? updatedCard : card,
      );

      setFlashcards(updatedCards);
      setStatusMessage(
        `Marked this card as ${getRatingLabel(rating).toLowerCase()} and updated the next review date.`,
      );

      if (updatedCards.length > 1) {
        const currentIndex = updatedCards.findIndex(
          (card) => card.id === updatedCard.id,
        );
        const nextCard = updatedCards[(currentIndex + 1) % updatedCards.length];

        setSelectedCardId(nextCard.id);
        setDraft(buildDraft(nextCard));
      } else {
        setSelectedCardId(updatedCard.id);
        setDraft(buildDraft(updatedCard));
      }

      setIsCreateMode(false);
      setIsFlipped(false);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this review right now.",
      );
    } finally {
      setPendingReview(null);
    }
  };

  const moveReview = (direction: "prev" | "next") => {
    if (!flashcards.length) {
      return;
    }

    const currentIndex = reviewIndex >= 0 ? reviewIndex : 0;
    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % flashcards.length
        : (currentIndex - 1 + flashcards.length) % flashcards.length;
    const nextCard = flashcards[nextIndex];

    setSelectedCardId(nextCard.id);
    setDraft(buildDraft(nextCard));
    setIsCreateMode(false);
    setIsFlipped(false);
    setStatusMessage(`Viewing ${nextCard.subject} flashcard.`);
  };

  const selectedSubject = selectedCard ? subjectsById.get(selectedCard.subjectId) : null;

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your flashcards..."
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
                <span>Flashcards Review</span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Real flashcards synced with your subjects
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Review due cards, edit prompts and answers, and keep every recall score connected to the backend instead of local demo state.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <Layers3 className="h-4 w-4 text-sky-600" />
                  {flashcards.length} cards
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  {totalReviewCount} reviews logged
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/85 bg-white/92 px-4 py-2.5 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.38)]">
                  <CalendarClock className="h-4 w-4 text-amber-500" />
                  {dueCount} due now
                </span>
              </div>
              <div className="rounded-[28px] border border-sky-100/80 bg-white/78 p-5 shadow-[0_24px_56px_-42px_rgba(56,189,248,0.42)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Recall Flow
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Every save and review updates the database, so your flashcard progress stays consistent across sessions.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_28px_70px_-46px_rgba(37,99,235,0.3)] backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Review Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Stay on top of due cards and weaker recall areas
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.55)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.22)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <Layers3 className="h-4 w-4" />
                    Card Library
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{flashcards.length}</p>
                  <p className="mt-1 text-sm text-slate-500">Saved against {subjects.length} subjects</p>
                </div>
                <div className="rounded-[24px] border border-blue-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(37,99,235,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Review Count
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{totalReviewCount}</p>
                  <p className="mt-1 text-sm text-slate-500">Recall attempts logged to the backend</p>
                </div>
                <div className="rounded-[24px] border border-amber-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#fff9eb_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(245,158,11,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                    <Sparkles className="h-4 w-4" />
                    Hard Cards
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{difficultCount}</p>
                  <p className="mt-1 text-sm text-slate-500">Cards still needing tighter repetition</p>
                </div>
                <div className="rounded-[24px] border border-cyan-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#ecfeff_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(6,182,212,0.2)]">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    <BookOpen className="h-4 w-4" />
                    Active Topic
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {selectedCard?.subject ?? "Ready"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedSubject?.progress !== null &&
                    selectedSubject?.progress !== undefined
                      ? `${selectedSubject.progress}% subject progress`
                      : "Open any card to review"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                  <span>Study readiness</span>
                  <span className="font-semibold text-slate-900">{studyReadiness}%</span>
                </div>
                <Progress
                  className="h-3 bg-slate-100"
                  indicatorClassName="bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_60%,#7c3aed_100%)]"
                  value={studyReadiness}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  className="h-12 flex-1 rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22d3ee_100%)] px-5 text-white shadow-[0_24px_50px_-26px_rgba(37,99,235,0.55)] transition hover:brightness-105"
                  onClick={openCreateMode}
                  type="button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Flashcard
                </Button>
                <Button
                  className="h-12 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                  onClick={() => router.push("/student/subjects")}
                  type="button"
                  variant="outline"
                >
                  Open Subjects
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            accentClassName="from-sky-600 to-cyan-500"
            detail="Flashcards saved in your account"
            icon={<Layers3 className="h-5 w-5" />}
            label="Library Size"
            value={`${flashcards.length}`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Subjects available for card creation"
            icon={<BookOpen className="h-5 w-5" />}
            label="Subjects Linked"
            value={`${subjects.length}`}
          />
          <SummaryCard
            accentClassName="from-amber-500 to-orange-500"
            detail="Cards ready for another review"
            icon={<CalendarClock className="h-5 w-5" />}
            label="Due Now"
            value={`${dueCount}`}
          />
          <SummaryCard
            accentClassName="from-rose-500 to-pink-500"
            detail="Cards last rated hard"
            icon={<Sparkles className="h-5 w-5" />}
            label="Needs Attention"
            value={`${difficultCount}`}
          />
        </section>

        {!subjects.length ? (
          <SectionCard
            description="Flashcards require a real subject so each card stays connected to your study plan and progress."
            title="Create a Subject First"
          >
            <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-sky-50 text-sky-700 shadow-[0_12px_28px_-18px_rgba(14,165,233,0.3)]">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">
                No subjects found
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Add a subject in the student subjects workspace, then come back here to save flashcards against it.
              </p>
              <Button
                className="mt-6 h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                onClick={() => router.push("/student/subjects")}
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Subject
              </Button>
            </div>
          </SectionCard>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <SectionCard
              action={
                <Button
                  className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                  onClick={openCreateMode}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Card
                </Button>
              }
              description="Open any saved flashcard, edit it, and keep its review schedule synced to the database."
              title="Flashcard List"
            >
              <div className="space-y-3">
                {isLoading ? (
                  <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-12 text-center text-sm text-slate-600">
                    Loading your flashcards...
                  </div>
                ) : flashcards.length ? (
                  flashcards.map((card) => {
                    const isSelected = card.id === selectedCardId && !isCreateMode;

                    return (
                      <button
                        className={cn(
                          "w-full rounded-[24px] border p-4 text-left transition",
                          isSelected
                            ? "border-violet-300 bg-violet-50/70 ring-4 ring-violet-100"
                            : "border-sky-100/80 bg-white/95 hover:border-sky-200 hover:shadow-[0_18px_40px_-24px_rgba(59,130,246,0.16)]",
                        )}
                        key={card.id}
                        onClick={() => selectCard(card)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-950">
                                {card.front}
                              </p>
                              <Badge
                                className={cn(
                                  "!border-[1px] px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                                  getRatingClasses(card.lastRating),
                                )}
                              >
                                {getRatingLabel(card.lastRating)}
                              </Badge>
                              {isDue(card.nextReviewDate) ? (
                                <Badge className="border-transparent bg-sky-100 text-sky-700">
                                  Due now
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm text-slate-500">
                              {card.subject} | Review {card.reviewCount} | Next {formatReviewDate(card.nextReviewDate)}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Updated {formatUpdatedAt(card.updatedAt)}
                            </p>
                          </div>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                            <BookOpen className="h-4 w-4" />
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-[28px] border border-dashed border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-sky-50 text-sky-700 shadow-[0_12px_28px_-18px_rgba(14,165,233,0.3)]">
                      <Layers3 className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-950">
                      No flashcards yet
                    </h3>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                      Create your first flashcard and it will persist to your StudyFlow account.
                    </p>
                    <Button
                      className="mt-6 h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                      onClick={openCreateMode}
                      type="button"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Flashcard
                    </Button>
                  </div>
                )}
              </div>
            </SectionCard>

            <div className="space-y-8">
              <SectionCard
                action={
                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                      onClick={() => setIsFlipped((current) => !current)}
                      type="button"
                      variant="outline"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Flip Card
                    </Button>
                    <Button
                      className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                      onClick={() => moveReview("prev")}
                      type="button"
                      variant="outline"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Prev
                    </Button>
                    <Button
                      className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                      onClick={() => moveReview("next")}
                      type="button"
                      variant="outline"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                }
                description="Flip the current card, reveal the answer, and write the latest recall difficulty back to the backend."
                title="Review Mode"
              >
                {selectedCard ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>
                        Card {reviewIndex + 1} of {flashcards.length}
                      </span>
                      <Badge className="!border-sky-300 !bg-sky-100 !text-sky-900 border px-3 py-1">
                        {selectedCard.subject}
                      </Badge>
                    </div>

                    <div
                      className="group perspective-[1200px]"
                      onClick={() => setIsFlipped((current) => !current)}
                    >
                      <div
                        className={cn(
                          "relative min-h-[320px] cursor-pointer rounded-[32px] transition duration-500 [transform-style:preserve-3d]",
                          isFlipped ? "[transform:rotateY(180deg)]" : "",
                        )}
                      >
                        <div className="absolute inset-0 rounded-[32px] border border-sky-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#e0e7ff_120%)] p-8 shadow-[0_30px_70px_-42px_rgba(15,23,42,0.3)] [backface-visibility:hidden]">
                          <div className="flex h-full flex-col">
                            <Badge className="!border-violet-300 !bg-violet-100 !text-violet-900 w-fit border px-3 py-1">
                              Prompt
                            </Badge>
                            <div className="flex flex-1 items-center justify-center">
                              <p className="max-w-2xl text-center text-2xl font-semibold leading-10 text-slate-950 sm:text-3xl">
                                {selectedCard.front}
                              </p>
                            </div>
                            <p className="text-center text-sm text-slate-500">
                              Tap the card or use the flip button to reveal the answer.
                            </p>
                          </div>
                        </div>

                        <div className="absolute inset-0 rounded-[32px] border border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#f5f3ff_55%,#e0e7ff_120%)] p-8 text-slate-950 shadow-[0_30px_70px_-42px_rgba(99,102,241,0.18)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                          <div className="flex h-full flex-col">
                            <Badge className="!border-violet-300 !bg-violet-100 !text-violet-900 w-fit border px-3 py-1">
                              Answer
                            </Badge>
                            <div className="flex flex-1 items-center justify-center">
                              <p className="max-w-2xl text-center text-xl font-medium leading-9 text-slate-950 sm:text-2xl">
                                {selectedCard.back}
                              </p>
                            </div>
                            <p className="text-center text-sm text-slate-500">
                              Rate how easy it felt to remember this answer.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <Button
                        className="h-11 rounded-2xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                        disabled={pendingReview !== null}
                        onClick={() => void handleReviewRating("easy")}
                        type="button"
                      >
                        Easy
                      </Button>
                      <Button
                        className="h-11 rounded-2xl bg-amber-500 px-5 text-white hover:bg-amber-600"
                        disabled={pendingReview !== null}
                        onClick={() => void handleReviewRating("medium")}
                        type="button"
                      >
                        Medium
                      </Button>
                      <Button
                        className="h-11 rounded-2xl bg-rose-500 px-5 text-white hover:bg-rose-600"
                        disabled={pendingReview !== null}
                        onClick={() => void handleReviewRating("hard")}
                        type="button"
                      >
                        Hard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-sky-200/80 bg-white/80 p-6 text-center text-sm text-slate-600">
                    Create a flashcard to start reviewing.
                  </div>
                )}
              </SectionCard>

              <SectionCard
                action={
                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="h-10 rounded-2xl border border-rose-300 bg-white px-4 font-semibold text-rose-700 hover:bg-rose-50"
                      disabled={isDeleting}
                      onClick={() => void handleDeleteCard()}
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <Button
                      className="h-10 rounded-2xl bg-sky-600 px-4 text-white hover:bg-sky-700"
                      disabled={isSaving}
                      onClick={() => void handleSaveCard()}
                      type="button"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Card
                    </Button>
                  </div>
                }
                description="Create new flashcards or refine saved ones without leaving the review workflow."
                title={isCreateMode ? "Create Flashcard" : "Edit Flashcard"}
              >
                <div className="space-y-5">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Subject</span>
                    <select
                      className={inputClassName}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          subjectId: event.target.value,
                        }))
                      }
                      value={draft.subjectId}
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Front</span>
                    <textarea
                      className={textareaClassName}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          front: event.target.value,
                        }))
                      }
                      placeholder="What do you want to remember?"
                      rows={5}
                      value={draft.front}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Back</span>
                    <textarea
                      className={textareaClassName}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          back: event.target.value,
                        }))
                      }
                      placeholder="Write the answer or explanation here."
                      rows={5}
                      value={draft.back}
                    />
                  </label>

                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-4 py-3 text-sm text-slate-600 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)]">
                    {statusMessage}
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        )}
      </div>
    </ProtectedDashboardLayout>
  );
}
