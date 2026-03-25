"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BadgePlus,
  BookOpen,
  CheckCircle2,
  MessageSquare,
  Plus,
  Save,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { studentSidebarLinks } from "@/data/sidebarLinks";
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

type ModalMode = "create" | "join" | null;

interface GroupMember {
  id: string;
  name: string;
  role: string;
}

interface GroupMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

interface GroupTask {
  id: string;
  title: string;
  completed: boolean;
  dueLabel: string;
}

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  joinCode: string;
  members: GroupMember[];
  chat: GroupMessage[];
  tasks: GroupTask[];
}

interface GroupDraft {
  name: string;
  subject: string;
  description: string;
}

const CURRENT_STUDENT = {
  id: "student-01",
  name: "Nethmi Jayawardena",
  role: "Student",
};

const INITIAL_GROUPS: StudyGroup[] = [
  {
    id: "group-01",
    name: "Calculus Sprint Circle",
    subject: "Mathematics",
    description:
      "A fast-paced revision group for derivatives, limits, and past-paper problem solving.",
    joinCode: "CALC85",
    members: [
      CURRENT_STUDENT,
      { id: "member-02", name: "Ishara Silva", role: "Student" },
      { id: "member-03", name: "Maya Fernando", role: "Mentor" },
    ],
    chat: [
      {
        id: "msg-01",
        sender: "Maya Fernando",
        message: "Focus tonight on trigonometric limits and one timed derivatives set.",
        timestamp: "Today, 6:15 PM",
      },
      {
        id: "msg-02",
        sender: "Ishara Silva",
        message: "I uploaded my worked steps for the last mock-paper question.",
        timestamp: "Today, 6:28 PM",
      },
    ],
    tasks: [
      { id: "task-01", title: "Solve 10 derivatives questions", completed: true, dueLabel: "Today" },
      { id: "task-02", title: "Review trigonometric limits", completed: false, dueLabel: "Tomorrow" },
      { id: "task-03", title: "Share one worked solution", completed: false, dueLabel: "Tomorrow" },
    ],
  },
  {
    id: "group-02",
    name: "Mechanics Lab Partners",
    subject: "Physics",
    description:
      "Shared study space for force diagrams, motion review, and lab prep discussions.",
    joinCode: "FORCE12",
    members: [
      { id: "member-04", name: "Dilan Perera", role: "Student" },
      { id: "member-05", name: "Savin De Costa", role: "Student" },
      { id: "member-06", name: "Raveena Jay", role: "Mentor" },
    ],
    chat: [
      {
        id: "msg-03",
        sender: "Raveena Jay",
        message: "Please double-check the force diagram conventions before tomorrow's session.",
        timestamp: "Today, 4:05 PM",
      },
    ],
    tasks: [
      { id: "task-04", title: "Prepare the mechanics lab report outline", completed: false, dueLabel: "Tomorrow" },
      { id: "task-05", title: "Redo 3 acceleration questions", completed: true, dueLabel: "Completed" },
    ],
  },
  {
    id: "group-03",
    name: "Organic Recall Crew",
    subject: "Chemistry",
    description:
      "Flashcard-heavy collaboration group for organic reactions and mechanism recall.",
    joinCode: "ORG45",
    members: [
      { id: "member-07", name: "Anudi Ramanayake", role: "Student" },
      { id: "member-08", name: "Kavin Dias", role: "Student" },
    ],
    chat: [
      {
        id: "msg-04",
        sender: "Anudi Ramanayake",
        message: "Let's classify today's reactions by mechanism instead of memorizing them separately.",
        timestamp: "Yesterday, 8:12 PM",
      },
    ],
    tasks: [
      { id: "task-06", title: "Add 5 elimination reaction cards", completed: false, dueLabel: "This week" },
      { id: "task-07", title: "Review substitution pathways", completed: false, dueLabel: "This week" },
    ],
  },
];

const EMPTY_DRAFT: GroupDraft = {
  name: "",
  subject: "",
  description: "",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-sky-100 bg-white px-4 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition placeholder:text-slate-400 focus:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-100";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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

export default function StudentGroupsPage() {
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState(INITIAL_GROUPS[0]?.id ?? null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [draft, setDraft] = useState<GroupDraft>(EMPTY_DRAFT);
  const [joinCode, setJoinCode] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Choose a group to open its members, shared chat, and tasks.",
  );

  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null;

  const joinedGroupCount = useMemo(
    () =>
      groups.filter((group) =>
        group.members.some((member) => member.id === CURRENT_STUDENT.id),
      ).length,
    [groups],
  );

  const totalSharedTasks = useMemo(
    () => groups.reduce((sum, group) => sum + group.tasks.length, 0),
    [groups],
  );

  const openCreateModal = () => {
    setModalMode("create");
    setDraft(EMPTY_DRAFT);
    setStatusMessage("Create a new study group and invite collaborators with the join code.");
  };

  const openJoinModal = () => {
    setModalMode("join");
    setJoinCode("");
    setStatusMessage("Join a group with its code to unlock the shared workspace.");
  };

  const closeModal = () => {
    setModalMode(null);
    setDraft(EMPTY_DRAFT);
    setJoinCode("");
  };

  const handleCreateGroup = () => {
    const name = draft.name.trim();
    const subject = draft.subject.trim();
    const description = draft.description.trim();

    if (!name || !subject || !description) {
      setStatusMessage("Add a group name, subject, and description before saving.");
      return;
    }

    const newGroup: StudyGroup = {
      id: `group-${Date.now()}`,
      name,
      subject,
      description,
      joinCode: subject.slice(0, 3).toUpperCase() + Math.floor(Math.random() * 90 + 10),
      members: [CURRENT_STUDENT],
      chat: [
        {
          id: `msg-${Date.now()}`,
          sender: CURRENT_STUDENT.name,
          message: "Welcome to the group. Use this space to share updates and next steps.",
          timestamp: "Just now",
        },
      ],
      tasks: [
        {
          id: `task-${Date.now()}`,
          title: "Plan the first group study session",
          completed: false,
          dueLabel: "This week",
        },
      ],
    };

    setGroups((current) => [newGroup, ...current]);
    setSelectedGroupId(newGroup.id);
    setChatInput("");
    closeModal();
    setStatusMessage("New study group created.");
  };

  const handleJoinGroup = () => {
    const code = joinCode.trim().toUpperCase();

    if (!code) {
      setStatusMessage("Enter a join code before trying to join a group.");
      return;
    }

    const matchingGroup = groups.find((group) => group.joinCode === code);

    if (!matchingGroup) {
      setStatusMessage("No group matched that join code.");
      return;
    }

    if (matchingGroup.members.some((member) => member.id === CURRENT_STUDENT.id)) {
      setSelectedGroupId(matchingGroup.id);
      closeModal();
      setStatusMessage(`You are already in ${matchingGroup.name}.`);
      return;
    }

    setGroups((current) =>
      current.map((group) =>
        group.id === matchingGroup.id
          ? {
              ...group,
              members: [...group.members, CURRENT_STUDENT],
            }
          : group,
      ),
    );
    setSelectedGroupId(matchingGroup.id);
    closeModal();
    setStatusMessage(`Joined ${matchingGroup.name}.`);
  };

  const handleToggleTask = (taskId: string) => {
    if (!selectedGroup) {
      return;
    }

    setGroups((current) =>
      current.map((group) =>
        group.id === selectedGroup.id
          ? {
              ...group,
              tasks: group.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task,
              ),
            }
          : group,
      ),
    );
  };

  const handleSendMessage = () => {
    const message = chatInput.trim();

    if (!selectedGroup || !message) {
      return;
    }

    setGroups((current) =>
      current.map((group) =>
        group.id === selectedGroup.id
          ? {
              ...group,
              chat: [
                ...group.chat,
                {
                  id: `msg-${Date.now()}`,
                  sender: CURRENT_STUDENT.name,
                  message,
                  timestamp: "Just now",
                },
              ],
            }
          : group,
      ),
    );

    setChatInput("");
    setStatusMessage("Message sent to the group chat.");
  };

  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading your study groups..."
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#f3f8ff_36%,#ecfeff_72%,#fefce8_108%)] p-6 shadow-[0_34px_90px_-46px_rgba(56,189,248,0.24)] sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <Badge className="border-sky-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                Study Groups
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Collaboration hub
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Discover active study groups, join shared learning spaces, and
                  collaborate through members, chat, and shared tasks in one clean UI.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  {groups.length} groups available
                </span>
                <span className="rounded-2xl border border-white/85 bg-white/92 px-4 py-2 shadow-[0_14px_30px_-24px_rgba(56,189,248,0.45)]">
                  {joinedGroupCount} joined groups
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                onClick={openCreateModal}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
              <Button
                className="h-11 rounded-2xl border border-sky-200 bg-white px-5 text-sky-700 hover:bg-sky-50"
                onClick={openJoinModal}
              >
                <BadgePlus className="mr-2 h-4 w-4" />
                Join Group
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            accentClassName="from-indigo-700 to-sky-600"
            detail="Open collaboration spaces"
            icon={<Users className="h-5 w-5" />}
            label="Groups"
            value={`${groups.length}`}
          />
          <SummaryCard
            accentClassName="from-sky-600 to-cyan-500"
            detail="Shared tasks across all groups"
            icon={<Target className="h-5 w-5" />}
            label="Group Tasks"
            value={`${totalSharedTasks}`}
          />
          <SummaryCard
            accentClassName="from-violet-600 to-fuchsia-500"
            detail="Messages + mentor prompts"
            icon={<MessageSquare className="h-5 w-5" />}
            label="Collaboration"
            value="Live"
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <SectionCard
            action={
              <Button
                className="h-10 rounded-2xl border border-sky-100 bg-white px-4 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                onClick={openJoinModal}
                variant="outline"
              >
                Join With Code
              </Button>
            }
            description="Browse study groups and pick one to open the full collaboration workspace."
            title="Groups List"
          >
            <div className="space-y-4">
              {groups.map((group) => {
                const isSelected = selectedGroup?.id === group.id;
                const isJoined = group.members.some(
                  (member) => member.id === CURRENT_STUDENT.id,
                );

                return (
                  <button
                    className={cn(
                      "w-full rounded-[24px] border p-4 text-left transition",
                      isSelected
                        ? "border-violet-300 bg-violet-50/70 ring-4 ring-violet-100"
                        : "border-sky-100/80 bg-white/95 hover:border-sky-200 hover:shadow-[0_18px_40px_-24px_rgba(59,130,246,0.16)]",
                    )}
                    key={group.id}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setStatusMessage(`Opened ${group.name}.`);
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">
                            {group.name}
                          </p>
                          <Badge className="border-transparent bg-sky-100 text-sky-700">
                            {group.subject}
                          </Badge>
                          {isJoined ? (
                            <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                              Joined
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {group.description}
                        </p>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                        <BookOpen className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-slate-600">
                        {group.members.length} members
                      </span>
                      <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-slate-600">
                        Code {group.joinCode}
                      </span>
                      <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-slate-600">
                        {group.tasks.length} tasks
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
          <div className="space-y-8">
            <SectionCard
              description="The selected group shows who is inside, what the team is discussing, and which tasks still need attention."
              title="Group Detail"
            >
              {selectedGroup ? (
                <div className="space-y-6">
                  <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold text-slate-950">
                            {selectedGroup.name}
                          </h3>
                          <Badge className="border-transparent bg-sky-100 text-sky-700">
                            {selectedGroup.subject}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {selectedGroup.description}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-sky-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                        Join code:{" "}
                        <span className="font-semibold text-slate-950">
                          {selectedGroup.joinCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                    <div className="space-y-6">
                      <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950">
                            Members
                          </p>
                          <Badge className="border-transparent bg-violet-100 text-violet-700">
                            {selectedGroup.members.length} members
                          </Badge>
                        </div>
                        <div className="mt-4 space-y-3">
                          {selectedGroup.members.map((member) => (
                            <div
                              className="flex items-center gap-3 rounded-[20px] border border-sky-100 bg-white px-4 py-3 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]"
                              key={member.id}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-sky-50 text-sky-700">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-950">
                                  {member.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950">
                            Shared Tasks
                          </p>
                          <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                            {selectedGroup.tasks.filter((task) => task.completed).length}/
                            {selectedGroup.tasks.length} done
                          </Badge>
                        </div>
                        <div className="mt-4 space-y-3">
                          {selectedGroup.tasks.map((task) => (
                            <button
                              className="flex w-full items-start gap-3 rounded-[20px] border border-sky-100 bg-white px-4 py-3 text-left shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] transition hover:border-sky-200"
                              key={task.id}
                              onClick={() => handleToggleTask(task.id)}
                              type="button"
                            >
                              <span
                                className={cn(
                                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
                                  task.completed
                                    ? "bg-emerald-500 text-white"
                                    : "bg-sky-50 text-sky-500",
                                )}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p
                                  className={cn(
                                    "text-sm font-semibold",
                                    task.completed
                                      ? "text-slate-400 line-through"
                                      : "text-slate-950",
                                  )}
                                >
                                  {task.title}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  Due {task.dueLabel}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">
                          Group Chat
                        </p>
                        <Badge className="border-transparent bg-sky-100 text-sky-700">
                          {selectedGroup.chat.length} messages
                        </Badge>
                      </div>

                      <div className="mt-4 h-[420px] space-y-3 overflow-y-auto rounded-[20px] border border-sky-100 bg-white p-4 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]">
                        {selectedGroup.chat.map((message) => {
                          const isCurrentUser = message.sender === CURRENT_STUDENT.name;

                          return (
                            <div
                              className={cn(
                                "flex",
                                isCurrentUser ? "justify-end" : "justify-start",
                              )}
                              key={message.id}
                            >
                              <div
                                className={cn(
                                  "max-w-[85%] rounded-[20px] px-4 py-3 text-sm shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)]",
                                  isCurrentUser
                                    ? "bg-sky-600 text-white"
                                    : "bg-sky-50 text-sky-700",
                                )}
                              >
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                                  {message.sender}
                                </p>
                                <p className="mt-2 leading-6">{message.message}</p>
                                <p className="mt-2 text-xs opacity-70">
                                  {message.timestamp}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <input
                          className={inputClassName}
                          onChange={(event) => setChatInput(event.target.value)}
                          placeholder="Send a quick update to the group..."
                          value={chatInput}
                        />
                        <Button
                          className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                          onClick={handleSendMessage}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <div className="rounded-[24px] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_18px_40px_-34px_rgba(14,165,233,0.18)] px-4 py-3 text-sm text-slate-600">
              {statusMessage}
            </div>
          </div>
        </div>

        {modalMode ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
            <div className="w-full max-w-2xl rounded-[32px] border border-sky-100 bg-white shadow-[0_32px_80px_-34px_rgba(56,189,248,0.22)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {modalMode === "create" ? "Create Group" : "Join Group"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {modalMode === "create"
                      ? "Set up a new study collaboration space."
                      : "Enter a join code to access an existing group."}
                  </p>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                  onClick={closeModal}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-6">
                {modalMode === "create" ? (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        Group name
                      </span>
                      <input
                        className={inputClassName}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Calculus Sprint Circle"
                        value={draft.name}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        Subject
                      </span>
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
                      <span className="text-sm font-medium text-slate-700">
                        Description
                      </span>
                      <textarea
                        className={textareaClassName}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Tell members what this group is focused on."
                        rows={5}
                        value={draft.description}
                      />
                    </label>
                  </>
                ) : (
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Join code
                    </span>
                    <input
                      className={inputClassName}
                      onChange={(event) => setJoinCode(event.target.value)}
                      placeholder="CALC85"
                      value={joinCode}
                    />
                  </label>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Collaboration data is local for now and ready to connect to MongoDB later.
                </p>
                <div className="flex gap-3">
                  <Button
                    className="h-11 rounded-2xl border border-sky-100 bg-white px-5 text-sky-700 shadow-[0_14px_30px_-22px_rgba(56,189,248,0.18)] hover:bg-sky-50"
                    onClick={closeModal}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                    onClick={modalMode === "create" ? handleCreateGroup : handleJoinGroup}
                  >
                    {modalMode === "create" ? (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Group
                      </>
                    ) : (
                      <>
                        <BadgePlus className="mr-2 h-4 w-4" />
                        Join Group
                      </>
                    )}
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





