"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bold,
  BookOpen,
  Clock3,
  Filter,
  Heading2,
  Italic,
  List,
  ListOrdered,
  NotebookPen,
  PencilLine,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Underline,
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

interface NoteItem {
  id: string;
  title: string;
  subject: string;
  contentHtml: string;
  updatedAt: string;
}

interface NoteDraft {
  title: string;
  subject: string;
  contentHtml: string;
}

const INITIAL_NOTES: NoteItem[] = [
  {
    id: "note-01",
    title: "Calculus Quick Review",
    subject: "Mathematics",
    updatedAt: "2026-03-24T18:15:00",
    contentHtml:
      "<h2>Key formulas</h2><p>Derivative of <strong>sin x</strong> is cos x. Keep product rule examples in the first revision block.</p><ul><li>Review chain rule shortcuts</li><li>Solve 5 timed questions</li></ul>",
  },
  {
    id: "note-02",
    title: "Mechanics Mistake Log",
    subject: "Physics",
    updatedAt: "2026-03-23T20:10:00",
    contentHtml:
      "<p>Watch sign changes in acceleration problems and re-check force diagrams before substituting values.</p><p><strong>Next step:</strong> redo the two weakest questions from the last paper.</p>",
  },
  {
    id: "note-03",
    title: "Organic Chemistry Patterns",
    subject: "Chemistry",
    updatedAt: "2026-03-22T16:40:00",
    contentHtml:
      "<p>Group reactions by mechanism instead of memorizing them one by one.</p><ol><li>Substitution</li><li>Addition</li><li>Elimination</li></ol>",
  },
  {
    id: "note-04",
    title: "History Essay Structure",
    subject: "History",
    updatedAt: "2026-03-21T14:05:00",
    contentHtml:
      "<p>Open with a direct thesis, then use one paragraph for context and two paragraphs for evidence.</p><p>Keep each example tied back to the main argument.</p>",
  },
];

const EMPTY_DRAFT: NoteDraft = {
  title: "",
  subject: "",
  contentHtml: "",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildDraft(note: NoteItem): NoteDraft {
  return {
    title: note.title,
    subject: note.subject,
    contentHtml: note.contentHtml,
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
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.22)]">
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
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_20px_55px_-38px_rgba(15,23,42,0.25)]">
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

function ToolbarButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
      onClick={onClick}
      title={label}
      type="button"
    >
      {icon}
    </button>
  );
}

export default function StudentNotesPage() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    INITIAL_NOTES[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<NoteDraft>(
    INITIAL_NOTES[0] ? buildDraft(INITIAL_NOTES[0]) : EMPTY_DRAFT,
  );
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [statusMessage, setStatusMessage] = useState(
    "Select a note to review or create a new one to start writing.",
  );
  const editorRef = useRef<HTMLDivElement | null>(null);

  const subjectOptions = useMemo(
    () => ["All Subjects", ...new Set(notes.map((note) => note.subject))],
    [notes],
  );

  const filteredNotes = useMemo(
    () =>
      notes.filter(
        (note) =>
          subjectFilter === "All Subjects" || note.subject === subjectFilter,
      ),
    [notes, subjectFilter],
  );

  const activeSubjects = useMemo(
    () => new Set(notes.map((note) => note.subject)).size,
    [notes],
  );

  const updatedToday = useMemo(
    () =>
      notes.filter((note) => {
        const updated = new Date(note.updatedAt);
        const now = new Date();

        return (
          updated.getFullYear() === now.getFullYear() &&
          updated.getMonth() === now.getMonth() &&
          updated.getDate() === now.getDate()
        );
      }).length,
    [notes],
  );

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const nextHtml = draft.contentHtml || "<p></p>";

    if (editorRef.current.innerHTML !== nextHtml) {
      editorRef.current.innerHTML = nextHtml;
    }
  }, [draft.contentHtml, selectedNoteId]);

  const selectNote = (note: NoteItem) => {
    setSelectedNoteId(note.id);
    setDraft(buildDraft(note));
    setStatusMessage(`Editing ${note.title}.`);
  };

  const handleCreateNote = () => {
    setSelectedNoteId(null);
    setDraft({
      title: "",
      subject:
        subjectFilter !== "All Subjects" ? subjectFilter : "",
      contentHtml: "",
    });
    setStatusMessage("New note ready. Add a title, subject, and rich text content.");
  };

  const handleDeleteNote = () => {
    if (!selectedNoteId) {
      setDraft(EMPTY_DRAFT);
      setStatusMessage("Nothing to delete yet. Create a new note instead.");
      return;
    }

    const updatedNotes = notes.filter((note) => note.id !== selectedNoteId);
    const nextSelected = updatedNotes[0] ?? null;

    setNotes(updatedNotes);
    setSelectedNoteId(nextSelected?.id ?? null);
    setDraft(nextSelected ? buildDraft(nextSelected) : EMPTY_DRAFT);
    setStatusMessage("Note deleted.");
  };

  const handleSaveNote = () => {
    const title = draft.title.trim();
    const subject = draft.subject.trim();
    const contentHtml = editorRef.current?.innerHTML ?? draft.contentHtml;
    const contentText = stripHtml(contentHtml);

    if (!title || !subject || !contentText) {
      setStatusMessage("Add a title, subject, and note content before saving.");
      return;
    }

    const timestamp = new Date().toISOString();

    if (selectedNoteId) {
      const updatedNotes = notes.map((note) =>
        note.id === selectedNoteId
          ? {
              ...note,
              title,
              subject,
              contentHtml,
              updatedAt: timestamp,
            }
          : note,
      );

      const updatedNote = updatedNotes.find((note) => note.id === selectedNoteId);

      setNotes(updatedNotes);
      if (updatedNote) {
        setDraft(buildDraft(updatedNote));
      }
      setStatusMessage("Note updated successfully.");
      return;
    }

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title,
      subject,
      contentHtml,
      updatedAt: timestamp,
    };

    setNotes((current) => [newNote, ...current]);
    setSelectedNoteId(newNote.id);
    setDraft(buildDraft(newNote));
    setStatusMessage("New note saved.");
  };

  const applyFormat = (command: string, value?: string) => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    document.execCommand(command, false, value);
    setDraft((current) => ({
      ...current,
      contentHtml: editorRef.current?.innerHTML ?? current.contentHtml,
    }));
    setStatusMessage("Formatting applied.");
  };

  const isEditorEmpty = stripHtml(draft.contentHtml).length === 0;

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your notes..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_44%,#e0f2fe_120%)] p-6 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                Study Notes
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Clean notes workspace
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/85 sm:text-base">
                  Keep quick revision notes, organize them by subject, and write
                  with a lightweight rich text editor that stays focused on study work.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-100/90">
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {notes.length} total notes
                </span>
                <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                  {activeSubjects} subjects
                </span>
              </div>
            </div>

            <Button
              className="h-11 rounded-2xl bg-white px-5 text-slate-950 shadow-lg shadow-slate-950/10 hover:bg-slate-100"
              onClick={handleCreateNote}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            accentClassName="from-slate-900 to-slate-700"
            detail="Saved in your notes library"
            icon={<NotebookPen className="h-5 w-5" />}
            label="Notes"
            value={`${notes.length}`}
          />
          <SummaryCard
            accentClassName="from-sky-600 to-cyan-500"
            detail="Subjects represented here"
            icon={<BookOpen className="h-5 w-5" />}
            label="Subjects"
            value={`${activeSubjects}`}
          />
          <SummaryCard
            accentClassName="from-emerald-600 to-teal-500"
            detail="Updated on today's date"
            icon={<Clock3 className="h-5 w-5" />}
            label="Updated Today"
            value={`${updatedToday}`}
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            action={
              <div className="relative w-full sm:w-[240px]">
                <Filter className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <select
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                  onChange={(event) => setSubjectFilter(event.target.value)}
                  value={subjectFilter}
                >
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            }
            description="Browse your notes by subject and jump into any entry to continue editing."
            title="Notes List"
          >
            <div className="space-y-3">
              {filteredNotes.length ? (
                filteredNotes.map((note) => {
                  const isSelected = note.id === selectedNoteId;

                  return (
                    <button
                      className={cn(
                        "w-full rounded-[24px] border p-4 text-left transition",
                        isSelected
                          ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                          : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
                      )}
                      key={note.id}
                      onClick={() => selectNote(note)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-950">
                            {note.title}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                            {stripHtml(note.contentHtml)}
                          </p>
                        </div>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <PencilLine className="h-4 w-4" />
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        <Badge className="border-transparent bg-slate-900 px-3 py-1 text-white">
                          {note.subject}
                        </Badge>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                          {formatUpdatedAt(note.updatedAt)}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-slate-800 shadow-sm">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">
                    No notes for this subject
                  </h3>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    Change the filter or create a fresh note for this subject to
                    keep your revision material organized.
                  </p>
                  <Button
                    className="mt-6 h-11 rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800"
                    onClick={handleCreateNote}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                  </Button>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            action={
              <div className="flex flex-wrap gap-3">
                <Button
                  className="h-10 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-rose-700 hover:bg-rose-100"
                  onClick={handleDeleteNote}
                  variant="outline"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button
                  className="h-10 rounded-2xl bg-slate-950 px-4 text-white hover:bg-slate-800"
                  onClick={handleSaveNote}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Note
                </Button>
              </div>
            }
            description="Write and format quick revision notes with a lightweight rich text editor."
            title="Editor"
          >
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Title</span>
                  <input
                    className={inputClassName}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Chapter review summary"
                    value={draft.title}
                  />
                </label>

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
              </div>

              <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-4">
                <div className="flex flex-wrap gap-2">
                  <ToolbarButton
                    icon={<Bold className="h-4 w-4" />}
                    label="Bold"
                    onClick={() => applyFormat("bold")}
                  />
                  <ToolbarButton
                    icon={<Italic className="h-4 w-4" />}
                    label="Italic"
                    onClick={() => applyFormat("italic")}
                  />
                  <ToolbarButton
                    icon={<Underline className="h-4 w-4" />}
                    label="Underline"
                    onClick={() => applyFormat("underline")}
                  />
                  <ToolbarButton
                    icon={<Heading2 className="h-4 w-4" />}
                    label="Heading"
                    onClick={() => applyFormat("formatBlock", "<h2>")}
                  />
                  <ToolbarButton
                    icon={<List className="h-4 w-4" />}
                    label="Bulleted List"
                    onClick={() => applyFormat("insertUnorderedList")}
                  />
                  <ToolbarButton
                    icon={<ListOrdered className="h-4 w-4" />}
                    label="Numbered List"
                    onClick={() => applyFormat("insertOrderedList")}
                  />
                </div>

                <div className="relative mt-4">
                  {isEditorEmpty ? (
                    <div className="pointer-events-none absolute left-4 top-4 text-sm text-slate-400">
                      Start writing your note here...
                    </div>
                  ) : null}
                  <div
                    className="min-h-[360px] rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100"
                    contentEditable
                    onInput={(event) =>
                      setDraft((current) => ({
                        ...current,
                        contentHtml: event.currentTarget.innerHTML,
                      }))
                    }
                    ref={editorRef}
                    suppressContentEditableWarning
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                {statusMessage}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </ProtectedDashboardLayout>
  );
}
