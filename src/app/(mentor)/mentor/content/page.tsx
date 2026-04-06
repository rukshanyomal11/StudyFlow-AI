"use client";

import { useMemo, useState, useEffect } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  Archive,
  BookOpen,
  Eye,
  FileText,
  FolderOpen,
  Paperclip,
  PencilLine,
  PlayCircle,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { mentorSidebarLinks } from "@/data/sidebarLinks";
import mentorService from "@/services/mentor.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ContentType = "Notes" | "PDFs" | "Videos" | "Assignments";
type ContentStatus = "Published" | "Draft" | "Archived";
type ContentVisibility = "Assigned Students" | "All Assigned Cohorts" | "Private Draft";
type TabType = "All" | ContentType;
type ModalMode = "create" | "edit" | null;

interface SubjectOption {
  id: string;
  name: string;
}

interface ContentItem {
  id: string;
  subjectId: string;
  title: string;
  type: ContentType;
  subject: string;
  uploadDate: string;
  assignedTo: string;
  status: ContentStatus;
  description: string;
  visibility: ContentVisibility;
  fileName: string;
  isRecent: boolean;
}

interface ContentDraft {
  title: string;
  subjectId: string;
  type: ContentType;
  description: string;
  visibility: ContentVisibility;
  fileUrl: string;
}

function formatRelativeDate(value?: string | Date) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

function getFileNameFromUrl(fileUrl: string) {
  if (!fileUrl) {
    return "Untitled file";
  }

  const normalizedFileUrl = fileUrl.split("?")[0] || fileUrl;
  return normalizedFileUrl.split("/").pop() || fileUrl;
}

function normalizeStatus(value: unknown, visibility: ContentVisibility) {
  if (value === "Published" || value === "Draft" || value === "Archived") {
    return value;
  }

  return visibility === "Private Draft" ? "Draft" : "Published";
}

function toContentItem(item: any): ContentItem {
  const title = typeof item?.title === "string" ? item.title : "Untitled";
  const type: ContentType = ["Notes", "PDFs", "Videos", "Assignments"].includes(item?.type)
    ? item.type
    : "Notes";
  const subjectName =
    typeof item?.subjectName === "string"
      ? item.subjectName
      : typeof item?.subjectId?.name === "string"
        ? item.subjectId.name
        : "General";
  const fileUrl = typeof item?.fileUrl === "string" ? item.fileUrl : "";
  const fileName = getFileNameFromUrl(fileUrl || `${title}.pdf`);
  const visibility: ContentVisibility = [
    "Assigned Students",
    "All Assigned Cohorts",
    "Private Draft",
  ].includes(item?.visibility)
    ? item.visibility
    : "Assigned Students";
  const status = normalizeStatus(item?.status, visibility);

  return {
    id: item?._id || item?.id || `content-${Date.now()}`,
    subjectId:
      typeof item?.subjectId === "string"
        ? item.subjectId
        : typeof item?.subjectId?._id === "string"
          ? item.subjectId._id
          : typeof item?.subjectId?.id === "string"
            ? item.subjectId.id
            : "",
    title,
    type,
    subject: subjectName,
    uploadDate: formatRelativeDate(item?.createdAt),
    assignedTo: visibility === "Private Draft" ? "Private draft" : "Assigned cohort",
    status,
    description: typeof item?.description === "string" ? item.description : "",
    visibility,
    fileName,
    isRecent: Boolean(item?.createdAt) && Date.now() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7,
  };
}

const CONTENT_TABS: TabType[] = ["All", "Notes", "PDFs", "Videos", "Assignments"];

const EMPTY_DRAFT: ContentDraft = {
  title: "",
  subjectId: "",
  type: "Notes",
  description: "",
  visibility: "Assigned Students",
  fileUrl: "",
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
    <Card className={SURFACE_CARD_CLASS_NAME}>
      <CardHeader className="pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-950!">{title}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-600!">
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
    <Card className={cn(SURFACE_CARD_CLASS_NAME, "rounded-[28px]")}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-500!">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-950!">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-500!">{detail}</p>
          </div>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-[0_14px_28px_-16px_rgba(15,23,42,0.4)] -mt-8",
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

function typeBadgeClass(type: ContentType) {
  if (type === "Notes") return "border-transparent bg-sky-100 text-sky-700";
  if (type === "PDFs") return "border-transparent bg-amber-100 text-amber-700";
  if (type === "Videos") return "border-transparent bg-violet-100 text-violet-700";
  return "border-transparent bg-emerald-100 text-emerald-700";
}

function statusBadgeClass(status: ContentStatus) {
  if (status === "Published") return "border-transparent bg-emerald-100 text-emerald-700";
  if (status === "Draft") return "border-transparent bg-amber-100 text-amber-700";
  return "border-transparent bg-slate-200 text-slate-700";
}

export default function MentorContentPage() {
  const [materials, setMaterials] = useState<ContentItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContentDraft>(EMPTY_DRAFT);
  const [statusMessage, setStatusMessage] = useState(
    "Loading content...",
  );

  const subjectOptions = subjects.length ? subjects : [];

  // Fetch content on mount
  useEffect(() => {
    let isActive = true;

    const fetchContent = async () => {
      try {
        setLoading(true);
        const [contentData, subjectData] = await Promise.all([
          mentorService.getContent(),
          mentorService.getSubjects(),
        ]);

        const mappedMaterials = Array.isArray(contentData)
          ? contentData.map(toContentItem)
          : [];
        const mappedSubjects = Array.isArray(subjectData)
          ? subjectData
              .map((subject: any) => ({
                id: typeof subject?._id === "string" ? subject._id : typeof subject?.id === "string" ? subject.id : "",
                name: typeof subject?.name === "string" ? subject.name : "Unnamed subject",
              }))
              .filter((subject: SubjectOption) => Boolean(subject.id))
          : [];

        if (!isActive) {
          return;
        }

        setMaterials(mappedMaterials);
        setSubjects(mappedSubjects);
        if (mappedMaterials.length > 0) {
          setSelectedMaterialId(mappedMaterials[0].id);
          setStatusMessage("Select a material to review status, visibility, and assignment coverage.");
        } else {
          setStatusMessage("No content uploaded yet.");
        }
        setError(null);
      } catch (err) {
        if (!isActive) {
          return;
        }

        const errorMsg = err instanceof Error ? err.message : "Failed to fetch content";
        setError(errorMsg);
        setStatusMessage(`Error: ${errorMsg}`);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredMaterials = useMemo(
    () =>
      materials.filter((item) =>
        activeTab === "All" ? true : item.type === activeTab,
      ),
    [activeTab, materials],
  );

  const selectedMaterial =
    filteredMaterials.find((item) => item.id === selectedMaterialId) ??
    filteredMaterials[0] ??
    null;

  const totalMaterials = materials.length;
  const notesUploaded = materials.filter((item) => item.type === "Notes").length;
  const videoResources = materials.filter(
    (item) => item.type === "Videos" || item.type === "PDFs",
  ).length;
  const recentlyAdded = materials.filter((item) => item.isRecent).length;

  const openCreateModal = (type?: ContentType) => {
    setModalMode("create");
    setEditingId(null);
    setDraft({
      ...EMPTY_DRAFT,
      subjectId: subjects[0]?.id ?? "",
      type: type ?? "Notes",
    });
    setStatusMessage("Prepare a new material and assign it to the right learners.");
  };

  const openEditModal = (item: ContentItem) => {
    setModalMode("edit");
    setEditingId(item.id);
    setDraft({
      title: item.title,
      subjectId: item.subjectId,
      type: item.type,
      description: item.description,
      visibility: item.visibility,
      fileUrl: item.fileName,
    });
    setSelectedMaterialId(item.id);
    setStatusMessage(`Editing ${item.title}.`);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setDraft((current) => ({
      ...current,
      fileUrl: file.name,
    }));
  };

  const handleSaveMaterial = async () => {
    const title = draft.title.trim();
    const subjectId = draft.subjectId.trim();
    const description = draft.description.trim();
    const fileUrl = draft.fileUrl.trim();

    if (!title || !subjectId || !description || !fileUrl) {
      setStatusMessage("Add a title, subject, description, and attachment before saving.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title,
        subjectId,
        type: draft.type,
        description,
        visibility: draft.visibility,
        fileUrl,
      };

      const response =
        modalMode === "edit" && editingId
          ? await mentorService.updateContent(editingId, payload)
          : await mentorService.createContent(payload);

      const nextMaterial = toContentItem(response?.material ?? response);

      setMaterials((current) => {
        if (modalMode === "edit" && editingId) {
          return current.map((item) => (item.id === editingId ? nextMaterial : item));
        }

        return [nextMaterial, ...current];
      });
      setSelectedMaterialId(nextMaterial.id);
      setStatusMessage(
        modalMode === "edit" ? `Updated ${nextMaterial.title}.` : `Uploaded ${nextMaterial.title}.`,
      );
      closeModal();
    } catch (saveError) {
      const errorMessage = saveError instanceof Error ? saveError.message : "Unable to save material right now.";
      setStatusMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleView = (id: string) => {
    const item = materials.find((material) => material.id === id);

    if (!item) {
      return;
    }

    setSelectedMaterialId(id);
    setStatusMessage(`Opened ${item.title}.`);
  };

  const handleAssign = (id: string) => {
    const item = materials.find((material) => material.id === id);

    if (!item) {
      return;
    }

    setSelectedMaterialId(id);
    setStatusMessage(`Assignment flow ready for ${item.title}.`);
  };

  const handleArchive = async (id: string) => {
    const item = materials.find((material) => material.id === id);

    if (!item) {
      return;
    }

    setMutatingId(id);

    try {
      const response = await mentorService.updateContent(id, {
        status: "Archived",
      });
      const updatedItem = toContentItem(response?.material ?? response);

      setMaterials((current) =>
        current.map((currentItem) =>
          currentItem.id === id ? updatedItem : currentItem,
        ),
      );
      setStatusMessage(`${item.title} moved to archive.`);
    } catch (archiveError) {
      setStatusMessage(
        archiveError instanceof Error
          ? archiveError.message
          : "Unable to archive material right now.",
      );
    } finally {
      setMutatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const item = materials.find((material) => material.id === id);

    if (!item) {
      return;
    }

    setMutatingId(id);

    try {
      await mentorService.deleteContent(id);
      setMaterials((current) => current.filter((material) => material.id !== id));
      if (selectedMaterialId === id) {
        setSelectedMaterialId("");
      }
      setStatusMessage(`${item.title} deleted from the library.`);
    } catch (deleteError) {
      setStatusMessage(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete material right now.",
      );
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <ProtectedDashboardLayout
      role="mentor"
      links={mentorSidebarLinks}
      loadingMessage="Loading your content workspace..."
    >
      <div className="mx-auto max-w-400 space-y-8 pb-8 text-slate-950">
        <Card className="relative overflow-hidden rounded-[34px] border border-sky-100 bg-transparent text-slate-950 shadow-[0_30px_100px_-48px_rgba(15,23,42,0.24)] dark:border-sky-100! dark:bg-transparent! dark:text-slate-950!">
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
                <Badge className="rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm dark:border-sky-200! dark:bg-white! dark:text-sky-700!">
                  <FolderOpen className="mr-2 h-3.5 w-3.5" />
                  Mentor content library
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:text-slate-950!">
                    Content
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base dark:text-slate-600!">
                    Organize notes, PDFs, videos, and assignments in one clean
                    teaching workspace built for StudyFlow AI mentors.
                  </p>
                </div>
              </div>

              <Button
                className={cn("h-12 rounded-2xl px-5 text-sm font-semibold shadow-[0_18px_35px_-18px_rgba(2,132,199,0.45)]", PRIMARY_BUTTON_CLASS_NAME)}
                disabled={loading}
                onClick={() => openCreateModal()}
                type="button"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Material
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard accentClassName="from-indigo-700 to-sky-600" detail="Materials in your mentor library" icon={<FolderOpen className="h-5 w-5" />} label="Total Materials" value={`${totalMaterials}`} />
          <SummaryCard accentClassName="from-sky-600 to-cyan-500" detail="Notes and lesson summaries uploaded" icon={<BookOpen className="h-5 w-5" />} label="Notes Uploaded" value={`${notesUploaded}`} />
          <SummaryCard accentClassName="from-violet-600 to-fuchsia-500" detail="Videos and downloadable resources" icon={<PlayCircle className="h-5 w-5" />} label="Videos / Resources" value={`${videoResources}`} />
          <SummaryCard accentClassName="from-emerald-600 to-teal-500" detail="Materials added in the recent cycle" icon={<Sparkles className="h-5 w-5" />} label="Recently Added" value={`${recentlyAdded}`} />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
          <SectionCard
            action={
              <Badge className="border-transparent bg-sky-100 text-sky-700">
                {filteredMaterials.length} visible
              </Badge>
            }
            description="Switch content tabs to focus on notes, PDFs, videos, or assignments, then manage each item from the same workspace."
            title="Content Library"
          >
            <div className="mb-5 flex flex-wrap gap-3">
              {CONTENT_TABS.map((tab) => (
                <Button
                  key={tab}
                  className={cn(
                    "rounded-2xl px-5",
                    activeTab === tab
                      ? PRIMARY_BUTTON_CLASS_NAME
                      : SECONDARY_BUTTON_CLASS_NAME,
                  )}
                  onClick={() => setActiveTab(tab)}
                  type="button"
                  variant={activeTab === tab ? "default" : "outline"}
                >
                  {tab}
                </Button>
              ))}
            </div>

            <div className="hidden xl:block">
              <div className="grid grid-cols-[1.55fr_0.95fr_0.9fr_0.9fr_1.2fr_0.9fr_1.5fr] gap-4 border-b border-slate-200 px-2 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Title</span>
                <span>Type</span>
                <span>Subject</span>
                <span>Uploaded</span>
                <span>Assigned To</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              <div className="mt-4 space-y-3">
                {filteredMaterials.map((item) => (
                  <div
                    className={cn(
                      "grid grid-cols-[1.55fr_0.95fr_0.9fr_0.9fr_1.2fr_0.9fr_1.5fr] items-start gap-4 rounded-3xl border p-4 transition",
                      selectedMaterial?.id === item.id
                        ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
                    )}
                    key={item.id}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.fileName}</p>
                    </div>
                    <Badge className={typeBadgeClass(item.type)}>{item.type}</Badge>
                    <p className="text-sm text-slate-600">{item.subject}</p>
                    <p className="text-sm text-slate-600">{item.uploadDate}</p>
                    <p className="text-sm text-slate-600">{item.assignedTo}</p>
                    <Badge className={statusBadgeClass(item.status)}>{item.status}</Badge>
                    <div className="flex flex-wrap gap-2">
                      <Button className={cn("h-9 rounded-2xl px-3", PRIMARY_BUTTON_CLASS_NAME)} onClick={() => handleView(item.id)} type="button">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} disabled={mutatingId === item.id || isSaving} onClick={() => openEditModal(item)} type="button" variant="outline">
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} disabled={mutatingId === item.id || isSaving} onClick={() => handleAssign(item.id)} type="button" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Assign
                      </Button>
                      <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} disabled={mutatingId === item.id || isSaving} onClick={() => void handleArchive(item.id)} type="button" variant="outline">
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                      <Button className="h-9 rounded-2xl border border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100" disabled={mutatingId === item.id || isSaving} onClick={() => void handleDelete(item.id)} type="button" variant="outline">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 xl:hidden">
              {filteredMaterials.map((item) => (
                <div
                  className={cn(
                    "rounded-[26px] border p-5 transition",
                    selectedMaterial?.id === item.id
                      ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
                  )}
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-950">{item.title}</p>
                        <Badge className={typeBadgeClass(item.type)}>{item.type}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{item.fileName}</p>
                    </div>
                    <Badge className={statusBadgeClass(item.status)}>{item.status}</Badge>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Subject</p>
                      <p className="mt-2 font-semibold text-slate-950">{item.subject}</p>
                    </div>
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Uploaded</p>
                      <p className="mt-2 font-semibold text-slate-950">{item.uploadDate}</p>
                    </div>
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Assigned</p>
                      <p className="mt-2 font-semibold text-slate-950">{item.assignedTo}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className={cn("h-9 rounded-2xl px-3", PRIMARY_BUTTON_CLASS_NAME)} onClick={() => handleView(item.id)} type="button">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} disabled={mutatingId === item.id || isSaving} onClick={() => openEditModal(item)} type="button" variant="outline">
                      Edit
                    </Button>
                    <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} disabled={mutatingId === item.id || isSaving} onClick={() => handleAssign(item.id)} type="button" variant="outline">
                      Assign
                    </Button>
                    <Button className={cn("h-9 rounded-2xl px-3", SECONDARY_BUTTON_CLASS_NAME)} disabled={mutatingId === item.id || isSaving} onClick={() => void handleArchive(item.id)} type="button" variant="outline">
                      Archive
                    </Button>
                    <Button className="h-9 rounded-2xl border border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100" disabled={mutatingId === item.id || isSaving} onClick={() => void handleDelete(item.id)} type="button" variant="outline">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              description="Review the selected material at a glance before assigning, editing, or archiving it."
              title="Material Overview"
            >
              {selectedMaterial ? (
                <div className="space-y-5">
                  <div className="rounded-[26px] border border-slate-200/90 bg-white/92 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-slate-950">
                            {selectedMaterial.title}
                          </h2>
                          <Badge className={typeBadgeClass(selectedMaterial.type)}>
                            {selectedMaterial.type}
                          </Badge>
                          <Badge className={statusBadgeClass(selectedMaterial.status)}>
                            {selectedMaterial.status}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {selectedMaterial.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Subject
                      </p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">
                        {selectedMaterial.subject}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Uploaded
                      </p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">
                        {selectedMaterial.uploadDate}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Assigned To
                      </p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">
                        {selectedMaterial.assignedTo}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Visibility
                      </p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">
                        {selectedMaterial.visibility}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/90 bg-white/92 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-sky-600 to-indigo-600 text-white shadow-[0_16px_26px_-18px_rgba(37,99,235,0.44)]">
                        <Paperclip className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Attachment</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedMaterial.fileName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-600">
                  No material is available in the current tab.
                </div>
              )}
            </SectionCard>

            <SectionCard
              description="Fast paths for the most common content management tasks."
              title="Quick Actions"
            >
              <div className="grid gap-4">
                <button className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(37,99,235,0.42)] transition hover:-translate-y-1" onClick={() => openCreateModal("Notes")} type="button">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200"><BookOpen className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Upload Note</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Start a new note or mentor summary for a student group.</p>
                </button>

                <button className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_55%,#ddd6fe_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(109,40,217,0.25)] transition hover:-translate-y-1" onClick={() => openCreateModal("Videos")} type="button">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200"><Sparkles className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Create Resource</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Prepare a new PDF, video, or teaching resource with the right visibility.</p>
                </button>

                <button className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#d1fae5_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(5,150,105,0.34)] transition hover:-translate-y-1" onClick={() => selectedMaterial && handleAssign(selectedMaterial.id)} type="button">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200"><Users className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Assign Material</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Push the selected content into the right student or group workflow.</p>
                </button>
              </div>

              <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {loading ? "Loading your mentor content library..." : statusMessage}
              </div>
            </SectionCard>
          </div>
        </div>

        {modalMode ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
            <div className="w-full max-w-2xl rounded-4xl border border-slate-200 bg-white shadow-[0_35px_90px_-35px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {modalMode === "create" ? "Upload Material" : "Edit Material"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add content metadata, attachment details, and visibility in one place.
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
                <input className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Title" value={draft.title} />
                <select className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, subjectId: event.target.value }))} value={draft.subjectId}>
                  <option value="" disabled>
                    Select subject
                  </option>
                  {subjectOptions.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <select className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as ContentType }))} value={draft.type}>
                  <option value="Notes">Notes</option>
                  <option value="PDFs">PDFs</option>
                  <option value="Videos">Videos</option>
                  <option value="Assignments">Assignments</option>
                </select>
                <select className={inputClassName} onChange={(event) => setDraft((current) => ({ ...current, visibility: event.target.value as ContentVisibility }))} value={draft.visibility}>
                  <option value="Assigned Students">Assigned Students</option>
                  <option value="All Assigned Cohorts">All Assigned Cohorts</option>
                  <option value="Private Draft">Private Draft</option>
                </select>

                <div className="md:col-span-2">
                  <textarea className={textareaClassName} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={5} value={draft.description} />
                </div>

                <div className="md:col-span-2">
                  <input
                    className={inputClassName}
                    onChange={(event) => setDraft((current) => ({ ...current, fileUrl: event.target.value }))}
                    placeholder="File URL or attachment name"
                    value={draft.fileUrl}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block">
                    <input accept="*" className="hidden" onChange={handleFileChange} type="file" />
                    <span className="flex min-h-27 w-full cursor-pointer flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-100">
                      <Upload className="mb-3 h-6 w-6 text-slate-500" />
                      <span className="font-medium text-slate-800">
                        {draft.fileUrl || "Choose attachment"}
                      </span>
                      <span className="mt-1 text-slate-500">
                        Upload a file or paste a file URL that will be saved with the material.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Materials are stored in MongoDB and can be edited or archived from this page.
                </p>
                <div className="flex gap-3">
                  <Button className={cn("h-11 rounded-2xl px-5", SECONDARY_BUTTON_CLASS_NAME)} onClick={closeModal} type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button className={cn("h-11 rounded-2xl px-5", PRIMARY_BUTTON_CLASS_NAME)} disabled={isSaving} onClick={() => void handleSaveMaterial()} type="button">
                    <Upload className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : modalMode === "create" ? "Upload Material" : "Save Changes"}
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
