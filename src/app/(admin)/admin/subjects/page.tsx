"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  Archive,
  BookOpen,
  BookOpenText,
  Briefcase,
  ClipboardList,
  Eye,
  Gauge,
  GraduationCap,
  Layers3,
  MoreHorizontal,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { adminSidebarLinks } from "@/data/sidebarLinks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SubjectStatus = "Active" | "Archived" | "Draft";
type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
type SubjectModalMode = "create" | "view" | "edit" | "assignMentor";
type CategoryModalMode = "create" | "edit";

interface CategoryRecord {
  id: string;
  name: string;
  description: string;
  accentClassName: string;
}

interface SubjectRecord {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  enrolledStudents: number;
  mentors: string[];
  quizzes: number;
  status: SubjectStatus;
  difficulty: DifficultyLevel;
}

interface SubjectFormState {
  name: string;
  categoryId: string;
  description: string;
  status: SubjectStatus;
  difficulty: DifficultyLevel;
}

interface SubjectModalState {
  open: boolean;
  mode: SubjectModalMode;
  subjectId: string | null;
}

interface CategoryModalState {
  open: boolean;
  mode: CategoryModalMode;
  categoryId: string | null;
}

interface CategoryFormState {
  name: string;
  description: string;
}

const SUBJECT_STATUS_VALUES: SubjectStatus[] = ["Active", "Archived", "Draft"];
const DIFFICULTY_VALUES: DifficultyLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const MENTOR_POOL = [
  "Dilan Fernando",
  "Aarav Iqbal",
  "Marcus Perera",
  "Priya Raman",
  "Suhani Jayasinghe",
  "Isuru Senaratne",
];

const INITIAL_CATEGORIES: CategoryRecord[] = [
  {
    id: "general",
    name: "General",
    description: "Fallback category for catalog organization updates.",
    accentClassName: "from-slate-900 to-slate-700",
  },
  {
    id: "stem",
    name: "STEM",
    description: "Mathematics, science, and analytical tracks.",
    accentClassName: "from-sky-600 to-cyan-500",
  },
  {
    id: "humanities",
    name: "Humanities",
    description: "Language, literature, history, and communication.",
    accentClassName: "from-amber-500 to-orange-500",
  },
  {
    id: "commerce",
    name: "Commerce",
    description: "Business, economics, and accounting pathways.",
    accentClassName: "from-emerald-600 to-teal-500",
  },
  {
    id: "technology",
    name: "Technology",
    description: "Computing, engineering, and applied digital skills.",
    accentClassName: "from-violet-600 to-indigo-500",
  },
];

const INITIAL_SUBJECTS: SubjectRecord[] = [
  {
    id: "sub-1001",
    name: "Mathematics",
    categoryId: "stem",
    description:
      "Core numeracy, algebra, calculus, and problem-solving pathways for student plans and quiz programs.",
    enrolledStudents: 3820,
    mentors: ["Marcus Perera", "Isuru Senaratne"],
    quizzes: 142,
    status: "Active",
    difficulty: "Advanced",
  },
  {
    id: "sub-1002",
    name: "Physics",
    categoryId: "stem",
    description:
      "Mechanics, electricity, and theory modules powering advanced study recommendations.",
    enrolledStudents: 2740,
    mentors: ["Marcus Perera"],
    quizzes: 118,
    status: "Active",
    difficulty: "Advanced",
  },
  {
    id: "sub-1003",
    name: "Chemistry",
    categoryId: "stem",
    description:
      "Organic, inorganic, and exam-focused chemistry units for quizzes and planner goals.",
    enrolledStudents: 3015,
    mentors: ["Dilan Fernando", "Priya Raman"],
    quizzes: 126,
    status: "Active",
    difficulty: "Intermediate",
  },
  {
    id: "sub-1004",
    name: "Biology",
    categoryId: "stem",
    description:
      "High-engagement subject tracks covering theory, diagrams, and revision sprints.",
    enrolledStudents: 2480,
    mentors: ["Dilan Fernando"],
    quizzes: 111,
    status: "Active",
    difficulty: "Intermediate",
  },
  {
    id: "sub-1005",
    name: "English Literature",
    categoryId: "humanities",
    description:
      "Literary analysis, essay writing, and reading comprehension flows for study plans.",
    enrolledStudents: 1295,
    mentors: ["Suhani Jayasinghe"],
    quizzes: 68,
    status: "Active",
    difficulty: "Intermediate",
  },
  {
    id: "sub-1006",
    name: "Economics",
    categoryId: "commerce",
    description:
      "Macro and microeconomics lessons with quiz-based reinforcement and mentor support.",
    enrolledStudents: 910,
    mentors: ["Aarav Iqbal"],
    quizzes: 52,
    status: "Draft",
    difficulty: "Intermediate",
  },
  {
    id: "sub-1007",
    name: "Accounting",
    categoryId: "commerce",
    description:
      "Structured accounting practice sets, study sessions, and mentor-reviewed assessments.",
    enrolledStudents: 860,
    mentors: ["Aarav Iqbal", "Priya Raman"],
    quizzes: 47,
    status: "Active",
    difficulty: "Beginner",
  },
  {
    id: "sub-1008",
    name: "Computer Science",
    categoryId: "technology",
    description:
      "Programming logic, system design foundations, and practical learning sequences.",
    enrolledStudents: 2140,
    mentors: ["Isuru Senaratne"],
    quizzes: 95,
    status: "Active",
    difficulty: "Intermediate",
  },
  {
    id: "sub-1009",
    name: "World History",
    categoryId: "humanities",
    description:
      "Archived humanities catalog covering timelines, essay prompts, and revision banks.",
    enrolledStudents: 420,
    mentors: ["Suhani Jayasinghe"],
    quizzes: 24,
    status: "Archived",
    difficulty: "Beginner",
  },
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

function getCategoryById(categories: CategoryRecord[], categoryId: string) {
  return categories.find((category) => category.id === categoryId) ?? categories[0];
}

function getEmptySubjectForm(categories: CategoryRecord[]): SubjectFormState {
  return {
    name: "",
    categoryId: categories[1]?.id ?? categories[0]?.id ?? "general",
    description: "",
    status: "Active",
    difficulty: "Beginner",
  };
}

function createSubjectForm(subject: SubjectRecord): SubjectFormState {
  return {
    name: subject.name,
    categoryId: subject.categoryId,
    description: subject.description,
    status: subject.status,
    difficulty: subject.difficulty,
  };
}

function getEmptyCategoryForm(): CategoryFormState {
  return {
    name: "",
    description: "",
  };
}

function createCategoryForm(category: CategoryRecord): CategoryFormState {
  return {
    name: category.name,
    description: category.description,
  };
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createCategoryId(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function getNextSubjectId(subjects: SubjectRecord[]) {
  const maxNumericId = subjects.reduce((maxId, subject) => {
    const numericValue = Number(subject.id.replace(/[^\d]/g, ""));
    return Number.isFinite(numericValue) ? Math.max(maxId, numericValue) : maxId;
  }, 1000);

  return `sub-${maxNumericId + 1}`;
}

function getUniqueCategoryId(categories: CategoryRecord[], baseId: string) {
  if (!categories.some((category) => category.id === baseId)) {
    return baseId;
  }

  let suffix = 2;
  let nextId = `${baseId}-${suffix}`;

  while (categories.some((category) => category.id === nextId)) {
    suffix += 1;
    nextId = `${baseId}-${suffix}`;
  }

  return nextId;
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

function StatusBadge({ status }: { status: SubjectStatus }) {
  const statusClassName =
    status === "Active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Archived"
        ? "border-slate-200 bg-slate-100 text-slate-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[0.72rem] font-semibold", statusClassName)}>
      {status}
    </Badge>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: DifficultyLevel }) {
  const difficultyClassName =
    difficulty === "Advanced"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : difficulty === "Intermediate"
        ? "border-violet-200 bg-violet-50 text-violet-700"
        : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <Badge
      className={cn(
        "rounded-full px-3 py-1 text-[0.72rem] font-semibold",
        difficultyClassName,
      )}
    >
      {difficulty}
    </Badge>
  );
}

function CategoryBadge({
  category,
}: {
  category: CategoryRecord;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.72rem] font-semibold text-slate-700">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full bg-gradient-to-br",
          category.accentClassName,
        )}
      />
      {category.name}
    </span>
  );
}

function SectionShell({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "card-surface rounded-[32px] border border-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.08)]",
        className,
      )}
    >
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

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon: typeof BookOpen;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function SubjectActionsMenu({
  subject,
  onView,
  onEdit,
  onArchiveToggle,
  onAssignMentor,
  onDelete,
}: {
  subject: SubjectRecord;
  onView: () => void;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onAssignMentor: () => void;
  onDelete: () => void;
}) {
  const menuItemClassName =
    "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100";

  return (
    <details className="group relative [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900">
        <MoreHorizontal className="h-4 w-4" />
      </summary>

      <div className="absolute right-0 top-12 z-30 w-52 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <button
          type="button"
          className={menuItemClassName}
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onView();
          }}
        >
          <Eye className="h-4 w-4" />
          View
        </button>
        <button
          type="button"
          className={menuItemClassName}
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onEdit();
          }}
        >
          <PencilLine className="h-4 w-4" />
          Edit
        </button>
        <button
          type="button"
          className={menuItemClassName}
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onAssignMentor();
          }}
        >
          <UserPlus className="h-4 w-4" />
          Assign Mentor
        </button>
        <button
          type="button"
          className={menuItemClassName}
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onArchiveToggle();
          }}
        >
          <Archive className="h-4 w-4" />
          {subject.status === "Archived" ? "Restore" : "Archive"}
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </details>
  );
}

export default function AdminSubjectsManagementPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>(INITIAL_CATEGORIES);
  const [subjects, setSubjects] = useState<SubjectRecord[]>(INITIAL_SUBJECTS);
  const [subjectModal, setSubjectModal] = useState<SubjectModalState>({
    open: false,
    mode: "view",
    subjectId: null,
  });
  const [subjectForm, setSubjectForm] = useState<SubjectFormState>(
    getEmptySubjectForm(INITIAL_CATEGORIES),
  );
  const [subjectFormError, setSubjectFormError] = useState("");
  const [mentorSelection, setMentorSelection] = useState<string[]>([]);
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>({
    open: false,
    mode: "create",
    categoryId: null,
  });
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(
    getEmptyCategoryForm(),
  );
  const [categoryFormError, setCategoryFormError] = useState("");

  useEffect(() => {
    if (!subjectModal.open && !categoryModal.open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (categoryModal.open) {
          setCategoryModal((current) => ({ ...current, open: false }));
          setCategoryFormError("");
          return;
        }

        if (subjectModal.open) {
          setSubjectModal((current) => ({ ...current, open: false }));
          setSubjectFormError("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [categoryModal.open, subjectModal.open]);

  const activeSubject =
    subjects.find((subject) => subject.id === subjectModal.subjectId) ?? null;

  const mostStudiedSubject = subjects.reduce((best, subject) =>
    subject.enrolledStudents > best.enrolledStudents ? subject : best,
  );
  const leastUsedSubject = subjects.reduce((lowest, subject) =>
    subject.enrolledStudents < lowest.enrolledStudents ? subject : lowest,
  );
  const totalQuizzes = subjects.reduce((sum, subject) => sum + subject.quizzes, 0);
  const quizLeaderboard = [...subjects].sort((a, b) => b.quizzes - a.quizzes);
  const maxQuizValue = quizLeaderboard[0]?.quizzes ?? 1;

  const categorySubjectCounts = categories.reduce<Record<string, number>>(
    (accumulator, category) => {
      accumulator[category.id] = subjects.filter(
        (subject) => subject.categoryId === category.id,
      ).length;
      return accumulator;
    },
    {},
  );

  const summaryCards = [
    {
      title: "Total Subjects",
      value: subjects.length.toLocaleString(),
      helper: "Catalog entries available for StudyFlow AI",
      icon: BookOpen,
      accentClassName: "from-slate-900 via-slate-800 to-slate-700",
    },
    {
      title: "Active Subjects",
      value: subjects
        .filter((subject) => subject.status === "Active")
        .length.toLocaleString(),
      helper: "Currently live in study plans and quizzes",
      icon: Sparkles,
      accentClassName: "from-emerald-700 to-teal-500",
    },
    {
      title: "Most Popular Subject",
      value: mostStudiedSubject.name,
      helper: `${mostStudiedSubject.enrolledStudents.toLocaleString()} enrolled students`,
      icon: GraduationCap,
      accentClassName: "from-sky-600 to-cyan-500",
    },
    {
      title: "Archived Subjects",
      value: subjects
        .filter((subject) => subject.status === "Archived")
        .length.toLocaleString(),
      helper: "Hidden from the live student catalog",
      icon: Archive,
      accentClassName: "from-amber-500 to-orange-500",
    },
  ];

  function openCreateSubjectModal() {
    setSubjectForm(getEmptySubjectForm(categories));
    setMentorSelection([]);
    setSubjectFormError("");
    setSubjectModal({
      open: true,
      mode: "create",
      subjectId: null,
    });
  }

  function openSubjectModal(subject: SubjectRecord, mode: SubjectModalMode) {
    setSubjectForm(createSubjectForm(subject));
    setMentorSelection(subject.mentors);
    setSubjectFormError("");
    setSubjectModal({
      open: true,
      mode,
      subjectId: subject.id,
    });
  }

  function closeSubjectModal() {
    setSubjectModal((current) => ({ ...current, open: false }));
    setSubjectFormError("");
  }

  function openCreateCategoryModal() {
    setCategoryForm(getEmptyCategoryForm());
    setCategoryFormError("");
    setCategoryModal({
      open: true,
      mode: "create",
      categoryId: null,
    });
  }

  function openEditCategoryModal(category: CategoryRecord) {
    setCategoryForm(createCategoryForm(category));
    setCategoryFormError("");
    setCategoryModal({
      open: true,
      mode: "edit",
      categoryId: category.id,
    });
  }

  function closeCategoryModal() {
    setCategoryModal((current) => ({ ...current, open: false }));
    setCategoryFormError("");
  }

  function handleToggleArchive(subjectId: string) {
    setSubjects((current) =>
      current.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              status: subject.status === "Archived" ? "Active" : "Archived",
            }
          : subject,
      ),
    );

    if (subjectModal.subjectId === subjectId) {
      setSubjectForm((current) => ({
        ...current,
        status: current.status === "Archived" ? "Active" : "Archived",
      }));
    }
  }

  function handleDeleteSubject(subjectId: string) {
    const subject = subjects.find((entry) => entry.id === subjectId);

    if (!subject) {
      return;
    }

    const didConfirm = window.confirm(
      `Delete ${subject.name} from the StudyFlow AI subject catalog? This demo updates local page state only.`,
    );

    if (!didConfirm) {
      return;
    }

    setSubjects((current) => current.filter((entry) => entry.id !== subjectId));

    if (subjectModal.subjectId === subjectId) {
      closeSubjectModal();
    }
  }

  function handleToggleMentor(mentorName: string) {
    setMentorSelection((current) =>
      current.includes(mentorName)
        ? current.filter((mentor) => mentor !== mentorName)
        : [...current, mentorName],
    );
  }

  function handleSaveSubject() {
    const trimmedName = toTitleCase(subjectForm.name.trim());
    const trimmedDescription = subjectForm.description.trim();

    if (!trimmedName) {
      setSubjectFormError("Subject name is required.");
      return;
    }

    if (!subjectForm.categoryId) {
      setSubjectFormError("Select a category for this subject.");
      return;
    }

    if (!trimmedDescription) {
      setSubjectFormError("Add a short subject description.");
      return;
    }

    const duplicateSubject = subjects.find(
      (subject) =>
        subject.name.toLowerCase() === trimmedName.toLowerCase() &&
        subject.id !== subjectModal.subjectId,
    );

    if (duplicateSubject) {
      setSubjectFormError("A subject with this name already exists.");
      return;
    }

    const nextSubject: SubjectRecord = {
      id: subjectModal.subjectId ?? getNextSubjectId(subjects),
      name: trimmedName,
      categoryId: subjectForm.categoryId,
      description: trimmedDescription,
      enrolledStudents:
        activeSubject?.enrolledStudents ??
        120 +
          subjects.length * 37 +
          (subjectForm.difficulty === "Advanced"
            ? 180
            : subjectForm.difficulty === "Intermediate"
              ? 110
              : 65),
      mentors: activeSubject?.mentors ?? [],
      quizzes:
        activeSubject?.quizzes ??
        8 +
          subjects.length * 2 +
          (subjectForm.status === "Active"
            ? 10
            : subjectForm.status === "Draft"
              ? 4
              : 2),
      status: subjectForm.status,
      difficulty: subjectForm.difficulty,
    };

    if (subjectModal.mode === "create") {
      setSubjects((current) => [nextSubject, ...current]);
    } else {
      setSubjects((current) =>
        current.map((subject) =>
          subject.id === nextSubject.id ? nextSubject : subject,
        ),
      );
    }

    setSubjectForm(createSubjectForm(nextSubject));
    setMentorSelection(nextSubject.mentors);
    setSubjectFormError("");
    setSubjectModal({
      open: true,
      mode: "view",
      subjectId: nextSubject.id,
    });
  }

  function handleSaveMentors() {
    if (!activeSubject) {
      return;
    }

    setSubjects((current) =>
      current.map((subject) =>
        subject.id === activeSubject.id
          ? { ...subject, mentors: mentorSelection }
          : subject,
      ),
    );

    setSubjectModal({
      open: true,
      mode: "view",
      subjectId: activeSubject.id,
    });
  }

  function handleSaveCategory() {
    const trimmedName = toTitleCase(categoryForm.name.trim());
    const trimmedDescription = categoryForm.description.trim();

    if (!trimmedName) {
      setCategoryFormError("Category name is required.");
      return;
    }

    if (!trimmedDescription) {
      setCategoryFormError("Add a category description.");
      return;
    }

    const duplicateCategory = categories.find(
      (category) =>
        category.name.toLowerCase() === trimmedName.toLowerCase() &&
        category.id !== categoryModal.categoryId,
    );

    if (duplicateCategory) {
      setCategoryFormError("A category with this name already exists.");
      return;
    }

    if (categoryModal.mode === "create") {
      const accentOptions = [
        "from-sky-600 to-cyan-500",
        "from-amber-500 to-orange-500",
        "from-emerald-600 to-teal-500",
        "from-violet-600 to-indigo-500",
      ];
      const nextCategoryId = createCategoryId(trimmedName);
      const uniqueId = getUniqueCategoryId(categories, nextCategoryId);

      setCategories((current) => [
        ...current,
        {
          id: uniqueId,
          name: trimmedName,
          description: trimmedDescription,
          accentClassName: accentOptions[current.length % accentOptions.length],
        },
      ]);
    } else {
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryModal.categoryId
            ? {
                ...category,
                name: trimmedName,
                description: trimmedDescription,
              }
            : category,
        ),
      );
    }

    closeCategoryModal();
  }

  function handleDeleteCategory(categoryId: string) {
    if (categoryId === "general") {
      window.alert("The General category is protected and cannot be deleted.");
      return;
    }

    const category = categories.find((entry) => entry.id === categoryId);

    if (!category) {
      return;
    }

    const didConfirm = window.confirm(
      `Delete ${category.name}? Subjects in this category will move to General.`,
    );

    if (!didConfirm) {
      return;
    }

    setCategories((current) => current.filter((entry) => entry.id !== categoryId));
    setSubjects((current) =>
      current.map((subject) =>
        subject.categoryId === categoryId
          ? { ...subject, categoryId: "general" }
          : subject,
      ),
    );

    setSubjectForm((current) => ({
      ...current,
      categoryId: current.categoryId === categoryId ? "general" : current.categoryId,
    }));
  }

  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading admin subjects workspace..."
    >
      <div className="mx-auto max-w-[1600px] space-y-8 pb-8">
        <Card className="relative overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 text-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(241, 184, 75, 0.24), transparent 24%), radial-gradient(circle at 85% 15%, rgba(45, 212, 191, 0.18), transparent 24%), linear-gradient(135deg, rgba(15, 23, 42, 1), rgba(30, 41, 59, 0.96))",
            }}
          />
          <CardContent className="relative p-8 md:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-5">
                <Badge className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white">
                  <BookOpenText className="mr-2 h-3.5 w-3.5" />
                  Admin subject management
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                    Subjects
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
                    Curate the StudyFlow AI catalog with clean control over
                    subjects, categories, mentor assignments, and learning depth
                    across every study plan.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {totalQuizzes.toLocaleString()} quizzes across the catalog
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {categories.length} active category groups
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {subjects.reduce((sum, subject) => sum + subject.mentors.length, 0)} mentor assignments
                  </div>
                </div>
              </div>

              <div className="flex justify-start xl:justify-end">
                <Button
                  type="button"
                  className="h-12 rounded-2xl border-[color:var(--accent)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[color:var(--accent-strong)]"
                  onClick={openCreateSubjectModal}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
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

        <div className="grid gap-8 2xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)]">
          <SectionShell
            title="Subject Catalog"
            description="Manage the live subject library with enrollment visibility, mentor ownership, quiz depth, and publishing state."
            className="h-fit"
          >
            <div className="hidden xl:block">
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      <th className="pb-2 pl-3">Subject name</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2">Students</th>
                      <th className="pb-2">Mentors</th>
                      <th className="pb-2">Quizzes</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Difficulty</th>
                      <th className="pb-2 pr-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {subjects.map((subject) => {
                      const category = getCategoryById(categories, subject.categoryId);

                      return (
                        <tr key={subject.id}>
                          <td className="rounded-l-[24px] border border-r-0 border-white/55 bg-white/70 py-4 pl-3 align-top">
                            <button
                              type="button"
                              className="text-left"
                              onClick={() => openSubjectModal(subject, "view")}
                            >
                              <div className="font-semibold text-slate-900 transition hover:text-[color:var(--accent)]">
                                {subject.name}
                              </div>
                              <div className="mt-1 max-w-[280px] text-sm leading-6 text-slate-500">
                                {subject.description}
                              </div>
                            </button>
                          </td>
                          <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top">
                            <CategoryBadge category={category} />
                          </td>
                          <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top text-sm font-semibold text-slate-900">
                            {subject.enrolledStudents.toLocaleString()}
                          </td>
                          <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              {subject.mentors.length > 0 ? (
                                subject.mentors.map((mentor) => (
                                  <Badge
                                    key={mentor}
                                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.72rem] font-semibold text-slate-700"
                                  >
                                    {mentor}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-slate-400">No mentors</span>
                              )}
                            </div>
                          </td>
                          <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top text-sm font-semibold text-slate-900">
                            {subject.quizzes}
                          </td>
                          <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top">
                            <StatusBadge status={subject.status} />
                          </td>
                          <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-top">
                            <DifficultyBadge difficulty={subject.difficulty} />
                          </td>
                          <td className="rounded-r-[24px] border border-l-0 border-white/55 bg-white/70 py-4 pr-3 align-top">
                            <div className="flex justify-end">
                              <SubjectActionsMenu
                                subject={subject}
                                onView={() => openSubjectModal(subject, "view")}
                                onEdit={() => openSubjectModal(subject, "edit")}
                                onArchiveToggle={() => handleToggleArchive(subject.id)}
                                onAssignMentor={() =>
                                  openSubjectModal(subject, "assignMentor")
                                }
                                onDelete={() => handleDeleteSubject(subject.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 xl:hidden">
              {subjects.map((subject) => {
                const category = getCategoryById(categories, subject.categoryId);

                return (
                  <div
                    key={subject.id}
                    className="rounded-[28px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => openSubjectModal(subject, "view")}
                        >
                          <p className="text-lg font-semibold tracking-tight text-slate-900">
                            {subject.name}
                          </p>
                        </button>
                        <CategoryBadge category={category} />
                      </div>

                      <SubjectActionsMenu
                        subject={subject}
                        onView={() => openSubjectModal(subject, "view")}
                        onEdit={() => openSubjectModal(subject, "edit")}
                        onArchiveToggle={() => handleToggleArchive(subject.id)}
                        onAssignMentor={() => openSubjectModal(subject, "assignMentor")}
                        onDelete={() => handleDeleteSubject(subject.id)}
                      />
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      {subject.description}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Students
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {subject.enrolledStudents.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Quizzes
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {subject.quizzes}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusBadge status={subject.status} />
                      <DifficultyBadge difficulty={subject.difficulty} />
                      {subject.mentors.map((mentor) => (
                        <Badge
                          key={mentor}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.72rem] font-semibold text-slate-700"
                        >
                          {mentor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionShell>

          <div className="space-y-8">
            <SectionShell
              title="Quick Insights"
              description="Track catalog momentum with a fast view of usage, adoption, and quiz depth by subject."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="rounded-[28px] border border-white/55 bg-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                  <CardContent className="p-5">
                    <div className="inline-flex rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 p-3 text-white shadow-lg">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Most studied subject
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {mostStudiedSubject.name}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {mostStudiedSubject.enrolledStudents.toLocaleString()} enrolled students
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border border-white/55 bg-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                  <CardContent className="p-5">
                    <div className="inline-flex rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-3 text-white shadow-lg">
                      <Gauge className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Least used subject
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {leastUsedSubject.name}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {leastUsedSubject.enrolledStudents.toLocaleString()} enrolled students
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 rounded-[28px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total quizzes by subject
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {totalQuizzes.toLocaleString()} quizzes
                    </p>
                  </div>

                  <div className="inline-flex rounded-2xl bg-gradient-to-br from-slate-900 to-teal-700 p-3 text-white shadow-lg">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {quizLeaderboard.map((subject) => (
                    <div key={subject.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-700">{subject.name}</span>
                        <span className="font-semibold text-slate-900">
                          {subject.quizzes}
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--teal)]"
                          style={{
                            width: `${Math.max(
                              (subject.quizzes / maxQuizValue) * 100,
                              12,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionShell>

            <SectionShell
              title="Categories"
              description="Organize the subject catalog into clear category groups and keep fallback routing under control."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                  onClick={openCreateCategoryModal}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              }
            >
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-[28px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div
                          className={cn(
                            "inline-flex rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg",
                            category.accentClassName,
                          )}
                        >
                          <Layers3 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold tracking-tight text-slate-900">
                            {category.name}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-slate-200 bg-white px-3 hover:bg-slate-50"
                          onClick={() => openEditCategoryModal(category)}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-slate-200 bg-white px-3 hover:bg-slate-50"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.72rem] font-semibold text-slate-700">
                        {categorySubjectCounts[category.id] ?? 0} subjects
                      </Badge>
                      {category.id === "general" ? (
                        <Badge className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[0.72rem] font-semibold text-amber-700">
                          Protected fallback
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>
          </div>
        </div>

        {subjectModal.open ? (
          <div className="fixed inset-0 z-50 flex justify-end">
            <button
              type="button"
              aria-label="Close subject panel"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
              onClick={closeSubjectModal}
            />

            <div className="relative z-10 h-full w-full max-w-2xl overflow-y-auto border-l border-white/20 bg-[#fcfaf6] shadow-[-30px_0_80px_rgba(15,23,42,0.18)]">
              <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-[#fcfaf6]/95 px-6 py-5 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600">
                      {subjectModal.mode === "create"
                        ? "Create subject"
                        : subjectModal.mode === "edit"
                          ? "Edit subject"
                          : subjectModal.mode === "assignMentor"
                            ? "Assign mentors"
                            : "Subject details"}
                    </Badge>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        {subjectModal.mode === "create"
                          ? "Add a new subject"
                          : subjectForm.name || activeSubject?.name || "Subject profile"}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {subjectModal.mode === "assignMentor"
                          ? "Select mentors to support this subject across StudyFlow AI."
                          : subjectModal.mode === "view"
                            ? "Review catalog details, usage, and mentor ownership."
                            : "Update the subject profile and publication settings."}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-3 hover:bg-slate-50"
                    onClick={closeSubjectModal}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="inline-flex rounded-2xl bg-gradient-to-br from-slate-900 to-teal-700 p-3 text-white shadow-lg">
                          <BookOpenText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                            {subjectForm.name || "New subject"}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {subjectForm.description || "Add a subject description to continue."}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <CategoryBadge
                          category={getCategoryById(categories, subjectForm.categoryId)}
                        />
                        <StatusBadge status={subjectForm.status} />
                        <DifficultyBadge difficulty={subjectForm.difficulty} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {subjectModal.mode === "assignMentor" ? (
                  <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                        Mentor Assignment
                      </CardTitle>
                      <CardDescription className="text-sm leading-6 text-slate-500">
                        Choose the mentors who should own content review and guidance for this subject.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex flex-wrap gap-3">
                        {MENTOR_POOL.map((mentor) => {
                          const isSelected = mentorSelection.includes(mentor);

                          return (
                            <button
                              key={mentor}
                              type="button"
                              className={cn(
                                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                                isSelected
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                              )}
                              onClick={() => handleToggleMentor(mentor)}
                            >
                              {mentor}
                            </button>
                          );
                        })}
                      </div>

                      <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-sm font-medium text-slate-500">
                          Assigned mentors
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {mentorSelection.length > 0 ? (
                            mentorSelection.map((mentor) => (
                              <Badge
                                key={mentor}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.72rem] font-semibold text-slate-700"
                              >
                                {mentor}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">
                              No mentors assigned yet.
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : subjectModal.mode === "view" ? (
                  <>
                    <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                          Subject Snapshot
                        </CardTitle>
                        <CardDescription className="text-sm leading-6 text-slate-500">
                          A quick readout of usage, publishing, and mentor ownership.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 sm:grid-cols-2">
                        <InfoItem
                          label="Category"
                          value={getCategoryById(categories, subjectForm.categoryId).name}
                          icon={Layers3}
                        />
                        <InfoItem
                          label="Difficulty"
                          value={subjectForm.difficulty}
                          icon={Gauge}
                        />
                        <InfoItem
                          label="Students"
                          value={activeSubject?.enrolledStudents.toLocaleString() ?? "0"}
                          icon={Users}
                        />
                        <InfoItem
                          label="Quizzes"
                          value={activeSubject?.quizzes ?? 0}
                          icon={ClipboardList}
                        />
                        <InfoItem
                          label="Status"
                          value={subjectForm.status}
                          icon={Sparkles}
                        />
                        <InfoItem
                          label="Assigned mentors"
                          value={activeSubject?.mentors.length ?? 0}
                          icon={Briefcase}
                        />
                      </CardContent>
                    </Card>

                    <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                          Mentors
                        </CardTitle>
                        <CardDescription className="text-sm leading-6 text-slate-500">
                          Current mentor assignments for this subject.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {activeSubject?.mentors.length ? (
                          activeSubject.mentors.map((mentor) => (
                            <Badge
                              key={mentor}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.72rem] font-semibold text-slate-700"
                            >
                              {mentor}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400">
                            No mentors assigned yet.
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                        Subject Form
                      </CardTitle>
                      <CardDescription className="text-sm leading-6 text-slate-500">
                        Update the subject profile, catalog placement, and learning difficulty.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-slate-600">
                            Subject name
                          </span>
                          <input
                            value={subjectForm.name}
                            onChange={(event) =>
                              setSubjectForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                          />
                        </label>

                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-slate-600">
                            Category
                          </span>
                          <select
                            value={subjectForm.categoryId}
                            onChange={(event) =>
                              setSubjectForm((current) => ({
                                ...current,
                                categoryId: event.target.value,
                              }))
                            }
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                          >
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-600">
                          Description
                        </span>
                        <textarea
                          rows={5}
                          value={subjectForm.description}
                          onChange={(event) =>
                            setSubjectForm((current) => ({
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
                            Status
                          </span>
                          <select
                            value={subjectForm.status}
                            onChange={(event) =>
                              setSubjectForm((current) => ({
                                ...current,
                                status: event.target.value as SubjectStatus,
                              }))
                            }
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                          >
                            {SUBJECT_STATUS_VALUES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-slate-600">
                            Difficulty level
                          </span>
                          <select
                            value={subjectForm.difficulty}
                            onChange={(event) =>
                              setSubjectForm((current) => ({
                                ...current,
                                difficulty: event.target.value as DifficultyLevel,
                              }))
                            }
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                          >
                            {DIFFICULTY_VALUES.map((difficulty) => (
                              <option key={difficulty} value={difficulty}>
                                {difficulty}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {subjectFormError ? (
                  <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {subjectFormError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <div className="flex flex-wrap gap-3">
                    {subjectModal.mode === "view" && activeSubject ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                          onClick={() => openSubjectModal(activeSubject, "edit")}
                        >
                          <PencilLine className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                          onClick={() => openSubjectModal(activeSubject, "assignMentor")}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign Mentor
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                          onClick={() => handleToggleArchive(activeSubject.id)}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          {activeSubject.status === "Archived" ? "Restore" : "Archive"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                        onClick={closeSubjectModal}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {subjectModal.mode === "assignMentor" ? (
                      <Button
                        type="button"
                        className="rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                        onClick={handleSaveMentors}
                      >
                        Save Mentors
                      </Button>
                    ) : subjectModal.mode === "view" ? (
                      <Button
                        type="button"
                        className="rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                        onClick={closeSubjectModal}
                      >
                        Close
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        className="rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                        onClick={handleSaveSubject}
                      >
                        {subjectModal.mode === "create" ? "Create Subject" : "Save Changes"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {categoryModal.open ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
              type="button"
              aria-label="Close category modal"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
              onClick={closeCategoryModal}
            />

            <Card className="relative z-10 w-full max-w-xl rounded-[32px] border border-white/50 bg-[#fcfaf6] shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600">
                      {categoryModal.mode === "create" ? "New category" : "Edit category"}
                    </Badge>
                    <div>
                      <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                        {categoryModal.mode === "create"
                          ? "Add category"
                          : "Update category"}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                        Manage category labels and descriptions for the subject catalog.
                      </CardDescription>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-3 hover:bg-slate-50"
                    onClick={closeCategoryModal}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-600">
                    Category name
                  </span>
                  <input
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-600">
                    Description
                  </span>
                  <textarea
                    rows={4}
                    value={categoryForm.description}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                  />
                </label>

                {categoryFormError ? (
                  <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {categoryFormError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                    onClick={closeCategoryModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                    onClick={handleSaveCategory}
                  >
                    Save Category
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
