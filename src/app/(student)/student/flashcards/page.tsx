"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers3,
  PencilLine,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  X,
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

type ReviewRating = "Easy" | "Medium" | "Hard";

interface FlashcardItem {
  id: string;
  subject: string;
  front: string;
  back: string;
  reviewCount: number;
  lastRating: ReviewRating;
  updatedAt: string;
}

interface FlashcardDraft {
  subject: string;
  front: string;
  back: string;
}

const INITIAL_FLASHCARDS: FlashcardItem[] = [
  {
    id: "flashcard-01",
    subject: "Mathematics",
    front: "What is the derivative of sin x?",
    back: "The derivative of sin x is cos x.",
    reviewCount: 8,
    lastRating: "Easy",
    updatedAt: "2026-03-24T18:20:00",
  },
  {
    id: "flashcard-02",
    subject: "Physics",
    front: "State Newton's second law.",
    back: "Force equals mass times acceleration, written as F = ma.",
    reviewCount: 6,
    lastRating: "Medium",
    updatedAt: "2026-03-23T20:00:00",
  },
  {
    id: "flashcard-03",
    subject: "Chemistry",
    front: "What is an exothermic reaction?",
    back: "An exothermic reaction releases energy, usually as heat, to the surroundings.",
    reviewCount: 5,
    lastRating: "Hard",
    updatedAt: "2026-03-22T17:15:00",
  },
  {
    id: "flashcard-04",
    subject: "History",
    front: "What makes a strong essay thesis?",
    back: "A strong thesis is specific, arguable, and directly answers the essay question.",
    reviewCount: 4,
    lastRating: "Medium",
    updatedAt: "2026-03-21T15:40:00",
  },
];

const EMPTY_DRAFT: FlashcardDraft = {
  subject: "",
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

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getRatingClasses(rating: ReviewRating) {
  if (rating === "Easy") {
    return "border-transparent bg-emerald-500 text-white";
  }

  if (rating === "Medium") {
    return "border-transparent bg-amber-500 text-white";
  }

  return "border-transparent bg-rose-500 text-white";
}

function buildDraft(card: FlashcardItem): FlashcardDraft {
  return {
    subject: card.subject,
    front: card.front,
    back: card.back,
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

export default function StudentFlashcardsPage() {
  const [flashcards, setFlashcards] = useState(INITIAL_FLASHCARDS);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    INITIAL_FLASHCARDS[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<FlashcardDraft>(
    INITIAL_FLASHCARDS[0] ? buildDraft(INITIAL_FLASHCARDS[0]) : EMPTY_DRAFT,
  );
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Select a flashcard to edit it or flip the review card to test recall.",
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
    () => flashcards.filter((card) => card.lastRating === "Hard").length,
    [flashcards],
  );

  const selectCard = (card: FlashcardItem) => {
    setSelectedCardId(card.id);
    setDraft(buildDraft(card));
    setIsCreateMode(false);
    setIsFlipped(false);
    setStatusMessage(`Editing ${card.subject} flashcard.`);
  };

  const openCreateMode = () => {
    setSelectedCardId(null);
    setDraft(EMPTY_DRAFT);
    setIsCreateMode(true);
    setIsFlipped(false);
    setStatusMessage("Create a new flashcard with a prompt and answer.");
  };

  const handleSaveCard = () => {
    const subject = draft.subject.trim();
    const front = draft.front.trim();
    const back = draft.back.trim();

    if (!subject || !front || !back) {
      setStatusMessage("Add a subject, front, and back before saving.");
      return;
    }

    const updatedAt = new Date().toISOString();

    if (isCreateMode || !selectedCardId) {
      const newCard: FlashcardItem = {
        id: `flashcard-${Date.now()}`,
        subject,
        front,
        back,
        reviewCount: 0,
        lastRating: "Medium",
        updatedAt,
      };

      setFlashcards((current) => [newCard, ...current]);
      setSelectedCardId(newCard.id);
      setDraft(buildDraft(newCard));
      setIsCreateMode(false);
      setIsFlipped(false);
      setStatusMessage("New flashcard saved.");
      return;
    }

    const updatedCards = flashcards.map((card) =>
      card.id === selectedCardId
        ? {
            ...card,
            subject,
            front,
            back,
            updatedAt,
          }
        : card,
    );

    const updatedCard = updatedCards.find((card) => card.id === selectedCardId);

    setFlashcards(updatedCards);
    if (updatedCard) {
      setDraft(buildDraft(updatedCard));
    }
    setIsFlipped(false);
    setStatusMessage("Flashcard updated.");
  };

  const handleDeleteCard = () => {
    if (!selectedCardId) {
      setDraft(EMPTY_DRAFT);
      setStatusMessage("There is no selected flashcard to delete.");
      return;
    }

    const updatedCards = flashcards.filter((card) => card.id !== selectedCardId);
    const nextSelected = updatedCards[0] ?? null;

    setFlashcards(updatedCards);
    setSelectedCardId(nextSelected?.id ?? null);
    setDraft(nextSelected ? buildDraft(nextSelected) : EMPTY_DRAFT);
    setIsCreateMode(false);
    setIsFlipped(false);
    setStatusMessage("Flashcard deleted.");
  };

  const handleReviewRating = (rating: ReviewRating) => {
    if (!selectedCardId) {
      return;
    }

    const updatedCards = flashcards.map((card) =>
      card.id === selectedCardId
        ? {
            ...card,
            lastRating: rating,
            reviewCount: card.reviewCount + 1,
            updatedAt: new Date().toISOString(),
          }
        : card,
    );

    setFlashcards(updatedCards);
    setStatusMessage(`Marked this flashcard as ${rating.toLowerCase()}.`);

    if (updatedCards.length > 1) {
      const currentIndex = updatedCards.findIndex((card) => card.id === selectedCardId);
      const nextCard = updatedCards[(currentIndex + 1) % updatedCards.length];

      setSelectedCardId(nextCard.id);
      setDraft(buildDraft(nextCard));
      setIsFlipped(false);
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
    setIsFlipped(false);
    setStatusMessage(`Viewing ${nextCard.subject} flashcard.`);
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your flashcards..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#f3f8ff_36%,#ecfeff_72%,#fefce8_108%)] p-6 shadow-[0_34px_90px_-46px_rgba(56,189,248,0.24)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-sky-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                Flashcards Review
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Interactive flashcards
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Build recall with quick flashcards, refine them as you study,
                  and review each card with fast easy, medium, or hard feedback.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  {flashcards.length} cards
                </span>
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  {totalReviewCount} reviews logged
                </span>
              </div>
            </div>

            <Button
              className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
              onClick={openCreateMode}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Flashcard
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            accentClassName="from-indigo-700 to-sky-600"
            detail="Ready for review"
            icon={<Layers3 className="h-5 w-5" />}
            label="Flashcards"
            value={`${flashcards.length}`}
          />
          <SummaryCard
            accentClassName="from-sky-600 to-cyan-500"
            detail="Across all card attempts"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Review Count"
            value={`${totalReviewCount}`}
          />
          <SummaryCard
            accentClassName="from-rose-500 to-orange-500"
            detail="Cards flagged for more work"
            icon={<Sparkles className="h-5 w-5" />}
            label="Hard Cards"
            value={`${difficultCount}`}
          />
        </section>

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
            description="Manage your flashcard library, open any card for editing, and track its latest review rating."
            title="Flashcard List"
          >
            <div className="space-y-3">
              {flashcards.length ? (
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
                                "px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
                                getRatingClasses(card.lastRating),
                              )}
                            >
                              {card.lastRating}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {card.subject} â€¢ Updated {formatUpdatedAt(card.updatedAt)}
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
                    Create your first flashcard deck item to start practicing faster recall.
                  </p>
                  <Button
                    className="mt-6 h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={openCreateMode}
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
                    variant="outline"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Flip Card
                  </Button>
                  <Button
                    className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    onClick={() => moveReview("prev")}
                    variant="outline"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    onClick={() => moveReview("next")}
                    variant="outline"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              }
              description="Flip the current card, reveal the answer, and rate recall difficulty to keep the review loop moving."
              title="Review Mode"
            >
              {selectedCard ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>
                      Card {reviewIndex + 1} of {flashcards.length}
                    </span>
                    <Badge className="border-transparent bg-sky-100 px-3 py-1 text-sky-700">
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
                          <Badge className="w-fit border-transparent bg-violet-100 px-3 py-1 text-violet-700">
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
                          <Badge className="w-fit border-transparent bg-violet-100 px-3 py-1 text-violet-700">
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
                      onClick={() => handleReviewRating("Easy")}
                    >
                      Easy
                    </Button>
                    <Button
                      className="h-11 rounded-2xl bg-amber-500 px-5 text-white hover:bg-amber-600"
                      onClick={() => handleReviewRating("Medium")}
                    >
                      Medium
                    </Button>
                    <Button
                      className="h-11 rounded-2xl bg-rose-500 px-5 text-white hover:bg-rose-600"
                      onClick={() => handleReviewRating("Hard")}
                    >
                      Hard
                    </Button>
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              action={
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="h-10 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-rose-700 hover:bg-rose-100"
                    onClick={handleDeleteCard}
                    variant="outline"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button
                    className="h-10 rounded-2xl bg-sky-600 px-4 text-white hover:bg-sky-700"
                    onClick={handleSaveCard}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Card
                  </Button>
                </div>
              }
              description="Create, edit, and refine prompts and answers without leaving the review workflow."
              title={isCreateMode ? "Create Flashcard" : "Edit Flashcard"}
            >
              <div className="space-y-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Subject</span>
                  <input
                    className={inputClassName}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                    placeholder="Mathematics"
                    value={draft.subject}
                  />
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

                <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] px-4 py-3 text-sm text-slate-600">
                  {statusMessage}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}






