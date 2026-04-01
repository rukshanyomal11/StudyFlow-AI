"use client";

import { useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { mentorSidebarLinks } from "@/data/sidebarLinks";
import mentorService from "@/services/mentor.service";
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
import { Progress } from "@/components/ui/progress";

type StudentStatus = "Active Today" | "Monitoring" | "Inactive";
type TaskStatus = "Assigned" | "In Progress" | "Completed";
type ProgressFilter = "all" | "high" | "medium" | "low";

interface StudentQuiz {
  id: string;
  title: string;
  score: string;
  date: string;
}

interface StudentTask {
  id: string;
  title: string;
  dueLabel: string;
  status: TaskStatus;
}

interface StudentItem {
  id: string;
  fullName: string;
  email: string;
  level: string;
  progress: number;
  weakSubject: string;
  activityStatus: StudentStatus;
  mentorNotes: string;
  recentQuizzes: StudentQuiz[];
  assignedTasks: StudentTask[];
}

interface AssignStudentForm {
  fullName: string;
  email: string;
  level: string;
  weakSubject: string;
  progress: string;
  activityStatus: StudentStatus;
}

const INITIAL_STUDENTS: StudentItem[] = [
  { id: "student-01", fullName: "Nethmi Jayawardena", email: "nethmi.j@studyflow.ai", level: "Grade 12 - Advanced Level", progress: 84, weakSubject: "Organic Chemistry", activityStatus: "Active Today", mentorNotes: "Strong overall momentum. Keep reinforcing reaction pathways and continue assigning mixed-question drills.", recentQuizzes: [{ id: "quiz-01", title: "Chemistry Reaction Checkpoint", score: "84%", date: "2 days ago" }, { id: "quiz-02", title: "Calculus Derivatives Sprint", score: "89%", date: "5 days ago" }], assignedTasks: [{ id: "task-01", title: "Finish organic mechanism summary", dueLabel: "Due tomorrow", status: "In Progress" }, { id: "task-02", title: "Solve 10 mixed chemistry MCQs", dueLabel: "Due Friday", status: "Assigned" }] },
  { id: "student-02", fullName: "Ishara Silva", email: "ishara.s@studyflow.ai", level: "Grade 11", progress: 76, weakSubject: "Algebra", activityStatus: "Active Today", mentorNotes: "Responds well to short challenge sets. Continue with targeted algebra revisions and quick feedback loops.", recentQuizzes: [{ id: "quiz-03", title: "Algebra Skill Check", score: "76%", date: "Yesterday" }, { id: "quiz-04", title: "Physics Motion Drill", score: "81%", date: "4 days ago" }], assignedTasks: [{ id: "task-03", title: "Practice quadratic equations worksheet", dueLabel: "Due tomorrow", status: "Assigned" }, { id: "task-04", title: "Revise algebra mistakes from quiz", dueLabel: "Due this week", status: "In Progress" }] },
  { id: "student-03", fullName: "Kavin Dias", email: "kavin.d@studyflow.ai", level: "Grade 12 - Advanced Level", progress: 68, weakSubject: "Mechanics", activityStatus: "Monitoring", mentorNotes: "Needs more confidence with force diagrams and motion breakdowns. Plan one-on-one practice before the next assessment.", recentQuizzes: [{ id: "quiz-05", title: "Mechanics Checkpoint", score: "68%", date: "Today" }, { id: "quiz-06", title: "Vectors Warmup", score: "71%", date: "6 days ago" }], assignedTasks: [{ id: "task-05", title: "Redo force diagram corrections", dueLabel: "Due tomorrow", status: "In Progress" }, { id: "task-06", title: "Watch mentor explanation on Newton's laws", dueLabel: "Due Thursday", status: "Assigned" }] },
  { id: "student-04", fullName: "Anudi Ramanayake", email: "anudi.r@studyflow.ai", level: "Grade 10", progress: 91, weakSubject: "Essay Structure", activityStatus: "Active Today", mentorNotes: "Excellent consistency. Shift from accuracy to speed and push for stronger written argument structure.", recentQuizzes: [{ id: "quiz-07", title: "Biology Unit Review", score: "93%", date: "Today" }, { id: "quiz-08", title: "Literature Comprehension Set", score: "88%", date: "3 days ago" }], assignedTasks: [{ id: "task-07", title: "Draft one timed essay intro", dueLabel: "Due Friday", status: "Assigned" }, { id: "task-08", title: "Complete biology recap notes", dueLabel: "Completed today", status: "Completed" }] },
  { id: "student-05", fullName: "Savin De Costa", email: "savin.d@studyflow.ai", level: "Grade 11", progress: 64, weakSubject: "Chemical Bonding", activityStatus: "Monitoring", mentorNotes: "Retention is uneven. A smaller set of repeated concept checks should help improve bonding recall and confidence.", recentQuizzes: [{ id: "quiz-09", title: "Bonding Basics Quiz", score: "64%", date: "Yesterday" }, { id: "quiz-10", title: "Math Foundations Drill", score: "70%", date: "1 week ago" }], assignedTasks: [{ id: "task-09", title: "Review bonding flashcards", dueLabel: "Due tomorrow", status: "Assigned" }, { id: "task-10", title: "Submit corrected chemistry notes", dueLabel: "Due this week", status: "In Progress" }] },
  { id: "student-06", fullName: "Mihiri Perera", email: "mihiri.p@studyflow.ai", level: "Grade 10", progress: 61, weakSubject: "Comprehension", activityStatus: "Inactive", mentorNotes: "Engagement has dipped this week. Reach out with a lighter task load and one direct encouragement message.", recentQuizzes: [{ id: "quiz-11", title: "Reading Comprehension Check", score: "61%", date: "4 days ago" }, { id: "quiz-12", title: "History Recap Quiz", score: "67%", date: "8 days ago" }], assignedTasks: [{ id: "task-11", title: "Complete reading summary outline", dueLabel: "Overdue", status: "Assigned" }, { id: "task-12", title: "Review mentor note on main idea questions", dueLabel: "Due tomorrow", status: "Assigned" }] },
];

const EMPTY_ASSIGN_FORM: AssignStudentForm = { fullName: "", email: "", level: "Grade 10", weakSubject: "", progress: "72", activityStatus: "Active Today" };

const inputClassName = "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";
const textareaClassName = "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const SURFACE_CARD_CLASS_NAME =
  "rounded-[30px] border border-slate-200/90 bg-white/95 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.16)] backdrop-blur-sm dark:!border-slate-200 dark:!bg-white dark:!text-slate-950";

const SOFT_PANEL_CLASS_NAME =
  "rounded-[26px] border border-slate-200/90 bg-white/90 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)] dark:!border-slate-200 dark:!bg-white";

const PRIMARY_BUTTON_CLASS_NAME =
  "bg-sky-600 text-white hover:bg-sky-700 dark:!bg-sky-600 dark:!text-white dark:hover:!bg-sky-700";

const SECONDARY_BUTTON_CLASS_NAME =
  "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:!border-slate-200 dark:!bg-white dark:!text-slate-900 dark:hover:!bg-slate-50";

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

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
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:!text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:!text-slate-950">{value}</p>
            <p className="mt-2 text-sm text-slate-500 dark:!text-slate-500">{detail}</p>
          </div>
          <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_14px_28px_-16px_rgba(15,23,42,0.4)] -mt-8", accentClassName)}>{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function statusBadgeClass(status: StudentStatus) {
  if (status === "Active Today") return "border-transparent bg-emerald-100 text-emerald-700";
  if (status === "Monitoring") return "border-transparent bg-amber-100 text-amber-700";
  return "border-transparent bg-slate-200 text-slate-700";
}

function taskBadgeClass(status: TaskStatus) {
  if (status === "Completed") return "border-transparent bg-emerald-100 text-emerald-700";
  if (status === "In Progress") return "border-transparent bg-sky-100 text-sky-700";
  return "border-transparent bg-slate-100 text-slate-700";
}

export default function MentorStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState<AssignStudentForm>(EMPTY_ASSIGN_FORM);
  const [actionMessage, setActionMessage] = useState("Select a student to review quizzes, tasks, and mentor notes.");

  // Fetch students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await mentorService.getStudents();
        setStudents(data || []);
        if (data && data.length > 0) {
          setSelectedStudentId(data[0].id);
        }
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch students";
        setError(errorMsg);
        console.error("Error fetching students:", err);
        setActionMessage(`Error: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const weakSubjectOptions = useMemo(() => Array.from(new Set(students.map((student) => student.weakSubject))).sort(), [students]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = !query || student.fullName.toLowerCase().includes(query) || student.email.toLowerCase().includes(query);
      const matchesLevel = levelFilter === "all" || student.level === levelFilter;
      const matchesSubject = subjectFilter === "all" || student.weakSubject === subjectFilter;
      const matchesProgress = progressFilter === "all" || (progressFilter === "high" && student.progress >= 85) || (progressFilter === "medium" && student.progress >= 70 && student.progress < 85) || (progressFilter === "low" && student.progress < 70);
      return matchesSearch && matchesLevel && matchesSubject && matchesProgress;
    });
  }, [levelFilter, progressFilter, searchQuery, students, subjectFilter]);

  const selectedStudent =
    filteredStudents.length > 0
      ? filteredStudents.find((student) => student.id === selectedStudentId) ??
        filteredStudents[0]
      : null;

  const totalStudents = students.length;
  const activeStudents = students.filter((student) => student.activityStatus === "Active Today").length;
  const studentsNeedingAttention = students.filter((student) => student.activityStatus !== "Active Today" || student.progress < 70).length;
  const topPerformers = students.filter((student) => student.progress >= 85).length;

  const handleAssignStudent = async () => {
    const fullName = assignForm.fullName.trim();
    const email = assignForm.email.trim();
    const weakSubject = assignForm.weakSubject.trim();
    const parsedProgress = Number(assignForm.progress);

    if (!fullName || !email || !weakSubject || Number.isNaN(parsedProgress)) {
      setActionMessage("Add a student name, email, weak subject, and valid progress.");
      return;
    }

    try {
      const studentData = {
        fullName,
        email,
        level: assignForm.level,
        weakSubject,
        progress: Math.max(0, Math.min(parsedProgress, 100)),
        activityStatus: assignForm.activityStatus,
      };

      await mentorService.assignStudent(studentData);
      
      // Refresh the students list
      const updatedStudents = await mentorService.getStudents();
      setStudents(updatedStudents || []);
      
      setAssignForm(EMPTY_ASSIGN_FORM);
      setAssignModalOpen(false);
      setActionMessage(`Successfully assigned ${fullName} to your student roster.`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to assign student";
      setActionMessage(`Error: ${errorMsg}`);
      console.error("Error assigning student:", err);
    }
  };

  const handleMentorNoteChange = (value: string) => {
    if (!selectedStudent) {
      return;
    }

    setStudents((current) =>
      current.map((student) =>
        student.id === selectedStudent.id
          ? { ...student, mentorNotes: value }
          : student,
      ),
    );
  };

  const triggerAction = (label: string) => {
    if (!selectedStudent) {
      return;
    }

    setActionMessage(`${label} prepared for ${selectedStudent.fullName}.`);
  };

  return (
    <ProtectedDashboardLayout role="mentor" links={mentorSidebarLinks} loadingMessage="Loading your students workspace...">
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
                  <Users className="mr-2 h-3.5 w-3.5" />
                  Mentor student management
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:!text-slate-950">
                    Students
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base dark:!text-slate-600">
                    Review learner progress, surface weak subjects quickly, and
                    keep mentoring decisions close to the students who need them.
                  </p>
                </div>
              </div>

              <Button
                className={cn("h-12 rounded-2xl px-5 text-sm font-semibold shadow-[0_18px_35px_-18px_rgba(2,132,199,0.45)]", PRIMARY_BUTTON_CLASS_NAME)}
                onClick={() => setAssignModalOpen(true)}
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Assign Student
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard accentClassName="from-indigo-700 to-sky-600" detail="Students currently assigned to you" icon={<Users className="h-5 w-5" />} label="Total Students" value={`${totalStudents}`} />
          <SummaryCard accentClassName="from-emerald-600 to-teal-500" detail="Learners active today" icon={<Sparkles className="h-5 w-5" />} label="Active Students" value={`${activeStudents}`} />
          <SummaryCard accentClassName="from-amber-500 to-orange-500" detail="Students who need closer support" icon={<ShieldAlert className="h-5 w-5" />} label="Need Attention" value={`${studentsNeedingAttention}`} />
          <SummaryCard accentClassName="from-sky-600 to-cyan-500" detail="High-performing learners" icon={<Target className="h-5 w-5" />} label="Top Performers" value={`${topPerformers}`} />
        </section>

        <SectionCard description="Search your roster and narrow the list by level, progress band, or weak subject." title="Search and Filters">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={cn(inputClassName, "pl-11")} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by name or email" value={searchQuery} />
            </label>
            <select className={inputClassName} onChange={(event) => setLevelFilter(event.target.value)} value={levelFilter}>
              <option value="all">All levels</option>
              {Array.from(new Set(students.map((student) => student.level))).map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <select className={inputClassName} onChange={(event) => setProgressFilter(event.target.value as ProgressFilter)} value={progressFilter}>
              <option value="all">All progress</option>
              <option value="high">High progress (85%+)</option>
              <option value="medium">Mid progress (70-84%)</option>
              <option value="low">Needs support (&lt; 70%)</option>
            </select>
            <select className={inputClassName} onChange={(event) => setSubjectFilter(event.target.value)} value={subjectFilter}>
              <option value="all">All weak subjects</option>
              {weakSubjectOptions.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </SectionCard>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            action={<Badge className="border-transparent bg-sky-100 text-sky-700">{filteredStudents.length} visible</Badge>}
            description="Review the current roster in a clean table on larger screens and a card list on mobile."
            title="Student Roster"
          >
            <div className="hidden xl:block">
              <div className="grid grid-cols-[1.5fr_1.5fr_1.15fr_0.85fr_1fr_1fr_0.9fr] gap-4 border-b border-slate-200 px-2 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Student</span>
                <span>Email</span>
                <span>Level</span>
                <span>Progress</span>
                <span>Weak Subject</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              <div className="mt-4 space-y-3">
                {filteredStudents.map((student) => (
                  <div
                    className={cn(
                      "grid grid-cols-[1.5fr_1.5fr_1.15fr_0.85fr_1fr_1fr_0.9fr] items-center gap-4 rounded-[24px] border p-4 transition",
                      selectedStudent?.id === student.id
                        ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
                    )}
                    key={student.id}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-slate-900 text-white">{getInitials(student.fullName)}</AvatarFallback>
                      </Avatar>
                      <p className="truncate text-sm font-semibold text-slate-950">{student.fullName}</p>
                    </div>
                    <p className="truncate text-sm text-slate-600">{student.email}</p>
                    <p className="text-sm text-slate-600">{student.level}</p>
                    <p className="text-sm font-semibold text-slate-950">{student.progress}%</p>
                    <p className="text-sm text-slate-600">{student.weakSubject}</p>
                    <Badge className={statusBadgeClass(student.activityStatus)}>{student.activityStatus}</Badge>
                    <Button
                      className={cn("h-10 rounded-2xl px-4", PRIMARY_BUTTON_CLASS_NAME)}
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setActionMessage(`Opened ${student.fullName}.`);
                      }}
                      type="button"
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 xl:hidden">
              {filteredStudents.map((student) => (
                <div
                  className={cn(
                    "rounded-[26px] border p-5 transition",
                    selectedStudent?.id === student.id
                      ? "border-sky-300 bg-sky-50/70 ring-4 ring-sky-100"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md",
                  )}
                  key={student.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-slate-900 text-white">{getInitials(student.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-slate-950">{student.fullName}</p>
                          <Badge className={statusBadgeClass(student.activityStatus)}>{student.activityStatus}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{student.email}</p>
                      </div>
                    </div>
                    <Badge className="border-transparent bg-sky-50 text-sky-700 dark:!bg-sky-50 dark:!text-sky-700">{student.level}</Badge>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Progress</p>
                      <p className="mt-2 font-semibold text-slate-950">{student.progress}%</p>
                    </div>
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Weak Subject</p>
                      <p className="mt-2 font-semibold text-slate-950">{student.weakSubject}</p>
                    </div>
                    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Level</p>
                      <p className="mt-2 font-semibold text-slate-950">{student.level}</p>
                    </div>
                  </div>

                  <Button
                    className={cn("mt-4 h-10 rounded-2xl px-4", PRIMARY_BUTTON_CLASS_NAME)}
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setActionMessage(`Opened ${student.fullName}.`);
                    }}
                    type="button"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              description="Preview profile details, current progress, recent quizzes, active tasks, and private mentor notes."
              title="Student Details"
            >
              {selectedStudent ? (
                <div className="space-y-5">
                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-5")}>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-slate-900 text-lg text-white">{getInitials(selectedStudent.fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-slate-950">{selectedStudent.fullName}</h2>
                          <Badge className={statusBadgeClass(selectedStudent.activityStatus)}>{selectedStudent.activityStatus}</Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{selectedStudent.email}</span>
                          <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4" />{selectedStudent.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-5")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">Current Progress</p>
                      <span className="text-sm font-semibold text-slate-950">{selectedStudent.progress}%</span>
                    </div>
                    <Progress className="mt-4 h-3 bg-slate-200 dark:!bg-slate-200" indicatorClassName="bg-gradient-to-r from-sky-600 to-teal-500" value={selectedStudent.progress} />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="border-transparent bg-amber-100 text-amber-700">Weak Subject: {selectedStudent.weakSubject}</Badge>
                    </div>
                  </div>

                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-5")}>
                    <p className="text-sm font-semibold text-slate-950">Recent Quizzes</p>
                    <div className="mt-4 space-y-3">
                      {selectedStudent.recentQuizzes.map((quiz) => (
                        <div className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm" key={quiz.id}>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{quiz.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{quiz.date}</p>
                          </div>
                          <Badge className="border-transparent bg-sky-600 text-white">{quiz.score}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={cn(SOFT_PANEL_CLASS_NAME, "p-5")}>
                    <p className="text-sm font-semibold text-slate-950">Assigned Tasks</p>
                    <div className="mt-4 space-y-3">
                      {selectedStudent.assignedTasks.map((task) => (
                        <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm" key={task.id}>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">{task.title}</p>
                              <p className="mt-1 text-sm text-slate-500">{task.dueLabel}</p>
                            </div>
                            <Badge className={taskBadgeClass(task.status)}>{task.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">Mentor Notes</p>
                      <Button
                        className={cn("h-10 rounded-2xl px-4", PRIMARY_BUTTON_CLASS_NAME)}
                        onClick={() => setActionMessage(`Saved mentor notes for ${selectedStudent.fullName}.`)}
                        type="button"
                      >
                        Save Note
                      </Button>
                    </div>
                    <textarea className={cn(textareaClassName, "mt-4")} onChange={(event) => handleMentorNoteChange(event.target.value)} value={selectedStudent.mentorNotes} />
                  </div>
                </div>
              ) : (
                <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-600">No student matched the current filters.</div>
              )}
            </SectionCard>

            <SectionCard description="Fast mentor moves for the currently selected student." title="Quick Actions">
              <div className="grid gap-4 sm:grid-cols-2">
                <button className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(37,99,235,0.42)] transition hover:-translate-y-1" onClick={() => triggerAction("Feedback draft")} type="button">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200"><Send className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Send Feedback</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Prepare structured feedback around the latest progress and weak areas.</p>
                </button>

                <button className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#d1fae5_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(5,150,105,0.34)] transition hover:-translate-y-1" onClick={() => triggerAction("Quiz assignment")} type="button">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200"><CheckCircle2 className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Assign Quiz</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Queue the right checkpoint quiz based on the selected student&apos;s gaps.</p>
                </button>

                <button className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_55%,#fde68a_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(217,119,6,0.28)] transition hover:-translate-y-1" onClick={() => triggerAction("Material assignment")} type="button">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200"><BookOpen className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Assign Material</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Attach notes, recap guides, or worked examples to the current learner.</p>
                </button>

                <button className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_55%,#ddd6fe_120%)] p-5 text-left shadow-[0_18px_45px_-40px_rgba(109,40,217,0.25)] transition hover:-translate-y-1" onClick={() => triggerAction("Student message")} type="button">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200"><MessageSquare className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">Message Student</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Send a direct check-in message or a fast encouragement note.</p>
                </button>
              </div>

              <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{actionMessage}</div>
            </SectionCard>
          </div>
        </div>

        {assignModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
            <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_90px_-35px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Assign Student</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add a student to your mentor roster using local demo data.
                  </p>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                  onClick={() => setAssignModalOpen(false)}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
                <input className={inputClassName} onChange={(event) => setAssignForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Full name" value={assignForm.fullName} />
                <input className={inputClassName} onChange={(event) => setAssignForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" type="email" value={assignForm.email} />
                <select className={inputClassName} onChange={(event) => setAssignForm((current) => ({ ...current, level: event.target.value }))} value={assignForm.level}>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12 - Advanced Level</option>
                </select>
                <input className={inputClassName} onChange={(event) => setAssignForm((current) => ({ ...current, weakSubject: event.target.value }))} placeholder="Weak subject" value={assignForm.weakSubject} />
                <input className={inputClassName} max={100} min={0} onChange={(event) => setAssignForm((current) => ({ ...current, progress: event.target.value }))} placeholder="Progress %" type="number" value={assignForm.progress} />
                <select className={inputClassName} onChange={(event) => setAssignForm((current) => ({ ...current, activityStatus: event.target.value as StudentStatus }))} value={assignForm.activityStatus}>
                  <option value="Active Today">Active Today</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Connect this flow to MongoDB later to persist mentor assignments.
                </p>
                <div className="flex gap-3">
                  <Button className={cn("h-11 rounded-2xl px-5", SECONDARY_BUTTON_CLASS_NAME)} onClick={() => setAssignModalOpen(false)} type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button className={cn("h-11 rounded-2xl px-5", PRIMARY_BUTTON_CLASS_NAME)} onClick={handleAssignStudent} type="button">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Student
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
