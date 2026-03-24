"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  Activity,
  Ban,
  BookOpen,
  Briefcase,
  CalendarDays,
  Clock3,
  Download,
  Eye,
  Filter,
  GraduationCap,
  Mail,
  MoreHorizontal,
  PencilLine,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserX,
  Users,
  X,
} from "lucide-react";
import ProtectedDashboardLayout from "@/components/layout/ProtectedDashboardLayout";
import { adminSidebarLinks } from "@/data/sidebarLinks";
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

type UserRole = "Student" | "Mentor" | "Admin";
type UserStatus = "Active" | "Blocked" | "Pending";
type UserPlan = "Free" | "Pro" | "Team" | "Enterprise";
type RoleFilter = "All roles" | UserRole;
type StatusFilter = "All statuses" | UserStatus;
type PlanFilter = "All plans" | UserPlan;
type PanelMode = "view" | "edit" | "create";
type PanelContext = "general" | "role";

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  joinedDate: string;
  lastActive: string;
  subjects: string[];
}

interface UserFormState {
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  subjects: string;
  joinedDate: string;
  lastActive: string;
}

interface PanelState {
  open: boolean;
  mode: PanelMode;
  context: PanelContext;
  userId: string | null;
}

const ROLE_OPTIONS: RoleFilter[] = [
  "All roles",
  "Student",
  "Mentor",
  "Admin",
];
const STATUS_OPTIONS: StatusFilter[] = [
  "All statuses",
  "Active",
  "Blocked",
  "Pending",
];
const PLAN_OPTIONS: PlanFilter[] = [
  "All plans",
  "Free",
  "Pro",
  "Team",
  "Enterprise",
];
const ROLE_VALUES: UserRole[] = ["Student", "Mentor", "Admin"];
const STATUS_VALUES: UserStatus[] = ["Active", "Blocked", "Pending"];
const PLAN_VALUES: UserPlan[] = ["Free", "Pro", "Team", "Enterprise"];

const INITIAL_USERS: AdminUserRecord[] = [
  {
    id: "usr-1001",
    name: "Lena Jayasuriya",
    email: "lena.j@studyflow.ai",
    role: "Student",
    plan: "Pro",
    status: "Active",
    joinedDate: "Mar 20, 2026",
    lastActive: "5 mins ago",
    subjects: ["Mathematics", "Physics", "ICT"],
  },
  {
    id: "usr-1002",
    name: "Dilan Fernando",
    email: "dilan.f@studyflow.ai",
    role: "Mentor",
    plan: "Team",
    status: "Active",
    joinedDate: "Mar 18, 2026",
    lastActive: "12 mins ago",
    subjects: ["Chemistry", "Biology"],
  },
  {
    id: "usr-1003",
    name: "Maya Gunasekara",
    email: "maya.g@studyflow.ai",
    role: "Student",
    plan: "Free",
    status: "Pending",
    joinedDate: "Mar 17, 2026",
    lastActive: "28 mins ago",
    subjects: ["English", "History"],
  },
  {
    id: "usr-1004",
    name: "Kavin De Silva",
    email: "kavin.d@studyflow.ai",
    role: "Admin",
    plan: "Enterprise",
    status: "Active",
    joinedDate: "Mar 15, 2026",
    lastActive: "42 mins ago",
    subjects: ["Operations", "Moderation"],
  },
  {
    id: "usr-1005",
    name: "Nethmi Peris",
    email: "nethmi.p@studyflow.ai",
    role: "Student",
    plan: "Free",
    status: "Blocked",
    joinedDate: "Mar 12, 2026",
    lastActive: "1 hour ago",
    subjects: ["Mathematics", "Accounting"],
  },
  {
    id: "usr-1006",
    name: "Aarav Iqbal",
    email: "aarav.i@studyflow.ai",
    role: "Mentor",
    plan: "Pro",
    status: "Active",
    joinedDate: "Mar 10, 2026",
    lastActive: "2 hours ago",
    subjects: ["Economics", "Business Studies"],
  },
  {
    id: "usr-1007",
    name: "Sadia Nazeer",
    email: "sadia.n@studyflow.ai",
    role: "Student",
    plan: "Team",
    status: "Active",
    joinedDate: "Mar 9, 2026",
    lastActive: "3 hours ago",
    subjects: ["Biology", "Chemistry"],
  },
  {
    id: "usr-1008",
    name: "Rohan Wickramage",
    email: "rohan.w@studyflow.ai",
    role: "Student",
    plan: "Pro",
    status: "Blocked",
    joinedDate: "Mar 7, 2026",
    lastActive: "5 hours ago",
    subjects: ["ICT", "Mathematics"],
  },
  {
    id: "usr-1009",
    name: "Ishara Senanayake",
    email: "ishara.s@studyflow.ai",
    role: "Admin",
    plan: "Enterprise",
    status: "Active",
    joinedDate: "Mar 5, 2026",
    lastActive: "Today at 8:40 AM",
    subjects: ["Security", "Permissions"],
  },
  {
    id: "usr-1010",
    name: "Tharushi Abeykoon",
    email: "tharushi.a@studyflow.ai",
    role: "Student",
    plan: "Free",
    status: "Pending",
    joinedDate: "Mar 3, 2026",
    lastActive: "Yesterday",
    subjects: ["Literature", "History"],
  },
  {
    id: "usr-1011",
    name: "Marcus Perera",
    email: "marcus.p@studyflow.ai",
    role: "Mentor",
    plan: "Team",
    status: "Active",
    joinedDate: "Mar 1, 2026",
    lastActive: "Yesterday",
    subjects: ["Physics", "Advanced Mathematics"],
  },
  {
    id: "usr-1012",
    name: "Amara Silva",
    email: "amara.s@studyflow.ai",
    role: "Student",
    plan: "Enterprise",
    status: "Active",
    joinedDate: "Feb 25, 2026",
    lastActive: "2 days ago",
    subjects: ["Medicine", "Biology", "Chemistry"],
  },
];

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

function getTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function getEmptyFormState(): UserFormState {
  return {
    name: "",
    email: "",
    role: "Student",
    plan: "Free",
    status: "Active",
    subjects: "",
    joinedDate: getTodayLabel(),
    lastActive: "Just now",
  };
}

function createFormState(user: AdminUserRecord): UserFormState {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    status: user.status,
    subjects: user.subjects.join(", "),
    joinedDate: user.joinedDate,
    lastActive: user.lastActive,
  };
}

function parseSubjects(subjectValue: string) {
  return subjectValue
    .split(",")
    .map((subject) => subject.trim())
    .filter(Boolean);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function closeParentDetails(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  target.closest("details")?.removeAttribute("open");
}

function exportUsersCsv(users: AdminUserRecord[]) {
  const headers = [
    "Name",
    "Email",
    "Role",
    "Plan",
    "Status",
    "Subjects",
    "Joined Date",
    "Last Active",
  ];

  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = users.map((user) =>
    [
      user.name,
      user.email,
      user.role,
      user.plan,
      user.status,
      user.subjects.join(" | "),
      user.joinedDate,
      user.lastActive,
    ]
      .map(escapeCell)
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `studyflow-users-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectionCheckbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      className="h-4 w-4 rounded border-slate-300 text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
    />
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const badgeClassName =
    role === "Admin"
      ? "border-slate-200 bg-slate-900 text-white"
      : role === "Mentor"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[0.72rem] font-semibold", badgeClassName)}>
      {role}
    </Badge>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const badgeClassName =
    status === "Active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Blocked"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[0.72rem] font-semibold", badgeClassName)}>
      {status}
    </Badge>
  );
}

function PlanBadge({ plan }: { plan: UserPlan }) {
  const badgeClassName =
    plan === "Enterprise"
      ? "border-slate-200 bg-slate-900 text-white"
      : plan === "Team"
        ? "border-violet-200 bg-violet-50 text-violet-700"
        : plan === "Pro"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[0.72rem] font-semibold", badgeClassName)}>
      {plan}
    </Badge>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon: typeof Mail;
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

function RowActionsMenu({
  user,
  onViewDetails,
  onEditUser,
  onToggleBlocked,
  onChangeRole,
  onDeleteUser,
}: {
  user: AdminUserRecord;
  onViewDetails: () => void;
  onEditUser: () => void;
  onToggleBlocked: () => void;
  onChangeRole: () => void;
  onDeleteUser: () => void;
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
            onViewDetails();
          }}
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
        <button
          type="button"
          className={menuItemClassName}
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onEditUser();
          }}
        >
          <PencilLine className="h-4 w-4" />
          Edit User
        </button>
        <button
          type="button"
          className={menuItemClassName}
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onToggleBlocked();
          }}
        >
          <Ban className="h-4 w-4" />
          {user.status === "Blocked" ? "Unblock User" : "Block User"}
        </button>
        <button
          type="button"
          className={menuItemClassName}
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onChangeRole();
          }}
        >
          <UserCog className="h-4 w-4" />
          Change Role
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
          onClick={(event) => {
            closeParentDetails(event.currentTarget);
            onDeleteUser();
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete User
        </button>
      </div>
    </details>
  );
}

export default function AdminUsersManagementPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All roles");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All statuses");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("All plans");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState<UserRole>("Student");
  const [panelState, setPanelState] = useState<PanelState>({
    open: false,
    mode: "view",
    context: "general",
    userId: null,
  });
  const [formState, setFormState] = useState<UserFormState>(getEmptyFormState());
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!panelState.open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanelState((current) => ({ ...current, open: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [panelState.open]);

  const activeUser =
    users.find((user) => user.id === panelState.userId) ?? null;

  const filteredUsers = users.filter((user) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedQuery.length === 0 ||
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery);
    const matchesRole = roleFilter === "All roles" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "All statuses" || user.status === statusFilter;
    const matchesPlan = planFilter === "All plans" || user.plan === planFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesPlan;
  });

  const visibleIds = filteredUsers.map((user) => user.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const selectedUsers = users.filter((user) => selectedIds.includes(user.id));

  const summaryCards = [
    {
      title: "Total Users",
      value: users.length.toLocaleString(),
      helper: "All accounts across the platform",
      icon: Users,
      accentClassName: "from-slate-900 via-slate-800 to-slate-700",
    },
    {
      title: "Active Users",
      value: users
        .filter((user) => user.status === "Active")
        .length.toLocaleString(),
      helper: "Currently active and enabled",
      icon: UserCheck,
      accentClassName: "from-emerald-700 to-teal-500",
    },
    {
      title: "Blocked Users",
      value: users
        .filter((user) => user.status === "Blocked")
        .length.toLocaleString(),
      helper: "Accounts with restrictions applied",
      icon: UserX,
      accentClassName: "from-rose-600 to-orange-500",
    },
    {
      title: "Mentors",
      value: users
        .filter((user) => user.role === "Mentor")
        .length.toLocaleString(),
      helper: "Teaching and coaching accounts",
      icon: Briefcase,
      accentClassName: "from-teal-700 to-emerald-500",
    },
    {
      title: "Students",
      value: users
        .filter((user) => user.role === "Student")
        .length.toLocaleString(),
      helper: "Learners on StudyFlow AI",
      icon: GraduationCap,
      accentClassName: "from-sky-600 to-cyan-500",
    },
    {
      title: "Admins",
      value: users
        .filter((user) => user.role === "Admin")
        .length.toLocaleString(),
      helper: "Platform operators and owners",
      icon: ShieldCheck,
      accentClassName: "from-violet-700 to-indigo-500",
    },
  ];

  function openCreatePanel() {
    setFormError("");
    setFormState(getEmptyFormState());
    setPanelState({
      open: true,
      mode: "create",
      context: "general",
      userId: null,
    });
  }

  function openUserPanel(user: AdminUserRecord, mode: PanelMode, context: PanelContext) {
    setFormError("");
    setFormState(createFormState(user));
    setPanelState({
      open: true,
      mode,
      context,
      userId: user.id,
    });
  }

  function closePanel() {
    setPanelState((current) => ({ ...current, open: false }));
    setFormError("");
  }

  function toggleSelection(userId: string) {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  function toggleVisibleSelection() {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      const nextSelection = new Set(current);
      visibleIds.forEach((id) => nextSelection.add(id));
      return Array.from(nextSelection);
    });
  }

  function handleBulkStatus(nextStatus: UserStatus) {
    if (selectedIds.length === 0) {
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        selectedIds.includes(user.id) ? { ...user, status: nextStatus } : user,
      ),
    );
  }

  function handleBulkRoleAssign() {
    if (selectedIds.length === 0) {
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        selectedIds.includes(user.id) ? { ...user, role: bulkRole } : user,
      ),
    );
  }

  function handleExportUsers() {
    const exportRows = selectedUsers.length > 0 ? selectedUsers : filteredUsers;
    exportUsersCsv(exportRows);
  }

  function handleToggleBlocked(userId: string) {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Blocked" ? "Active" : "Blocked",
            }
          : user,
      ),
    );

    if (panelState.userId === userId) {
      setFormState((current) => ({
        ...current,
        status: current.status === "Blocked" ? "Active" : "Blocked",
      }));
    }
  }

  function handleDeleteUser(userId: string) {
    const user = users.find((entry) => entry.id === userId);

    if (!user) {
      return;
    }

    const didConfirm = window.confirm(
      `Delete ${user.name} from StudyFlow AI? This demo action updates the local table state.`,
    );

    if (!didConfirm) {
      return;
    }

    setUsers((current) => current.filter((entry) => entry.id !== userId));
    setSelectedIds((current) => current.filter((id) => id !== userId));

    if (panelState.userId === userId) {
      closePanel();
    }
  }

  function handleClearFilters() {
    setSearchQuery("");
    setRoleFilter("All roles");
    setStatusFilter("All statuses");
    setPlanFilter("All plans");
  }

  function handleSaveUser() {
    const trimmedName = formState.name.trim();
    const trimmedEmail = formState.email.trim().toLowerCase();
    const subjects = parseSubjects(formState.subjects);

    if (!trimmedName) {
      setFormError("A full name is required.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (subjects.length === 0) {
      setFormError("Add at least one subject.");
      return;
    }

    const normalizedUser: AdminUserRecord = {
      id: panelState.userId ?? `usr-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: formState.role,
      plan: formState.plan,
      status: formState.status,
      joinedDate:
        panelState.mode === "create" ? getTodayLabel() : formState.joinedDate,
      lastActive:
        panelState.mode === "create" ? "Just now" : formState.lastActive,
      subjects,
    };

    if (panelState.mode === "create") {
      setUsers((current) => [normalizedUser, ...current]);
      setPanelState({
        open: true,
        mode: "view",
        context: "general",
        userId: normalizedUser.id,
      });
      setFormState(createFormState(normalizedUser));
      setFormError("");
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === normalizedUser.id ? normalizedUser : user,
      ),
    );
    setPanelState({
      open: true,
      mode: "view",
      context: "general",
      userId: normalizedUser.id,
    });
    setFormState(createFormState(normalizedUser));
    setFormError("");
  }

  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading admin users workspace..."
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
                  <Users className="mr-2 h-3.5 w-3.5" />
                  Admin users management
                </Badge>

                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                    Users
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
                    Manage learners, mentors, and admins from one premium control
                    surface. Review account access, subscriptions, and platform
                    health without leaving the admin workspace.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {users.filter((user) => user.status === "Active").length} active accounts
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {users.filter((user) => user.role === "Mentor").length} mentors live
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2">
                    {users.filter((user) => user.plan !== "Free").length} paid subscriptions
                  </div>
                </div>
              </div>

              <div className="flex justify-start xl:justify-end">
                <Button
                  type="button"
                  className="h-12 rounded-2xl border-[color:var(--accent)] bg-[color:var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[color:var(--accent-strong)]"
                  onClick={openCreatePanel}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
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

        <Card className="card-surface rounded-[32px] border border-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                  Search and Filters
                </CardTitle>
                <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                  Search by name or email, then narrow the list by role, status,
                  or subscription plan.
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                onClick={handleClearFilters}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-600">
                Search users
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name or email"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                />
              </div>
            </label>

            <FilterSelect
              label="Role"
              value={roleFilter}
              options={ROLE_OPTIONS}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            />
            <FilterSelect
              label="Subscription plan"
              value={planFilter}
              options={PLAN_OPTIONS}
              onChange={(event) => setPlanFilter(event.target.value as PlanFilter)}
            />
          </CardContent>
        </Card>

        <Card className="card-surface rounded-[32px] border border-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Filter className="h-4 w-4" />
                  Bulk actions
                </div>
                <p className="text-lg font-semibold tracking-tight text-slate-900">
                  {selectedIds.length} user{selectedIds.length === 1 ? "" : "s"} selected
                </p>
                <p className="text-sm text-slate-500">
                  Assign roles, activate or deactivate accounts, and export the
                  current selection in one step.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end">
                <select
                  value={bulkRole}
                  onChange={(event) => setBulkRole(event.target.value as UserRole)}
                  className="h-11 min-w-[180px] rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                >
                  {ROLE_VALUES.map((role) => (
                    <option key={role} value={role}>
                      Assign {role}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                  disabled={selectedIds.length === 0}
                  onClick={handleBulkRoleAssign}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Assign Role
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                  disabled={selectedIds.length === 0}
                  onClick={() => handleBulkStatus("Active")}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Activate
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                  disabled={selectedIds.length === 0}
                  onClick={() => handleBulkStatus("Blocked")}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Deactivate
                </Button>

                <Button
                  type="button"
                  className="rounded-2xl bg-slate-900 px-4 text-white hover:bg-slate-800"
                  disabled={filteredUsers.length === 0}
                  onClick={handleExportUsers}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {selectedIds.length > 0 ? "Export Selected" : "Export Users"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface rounded-[32px] border border-white/45 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                  Users Table
                </CardTitle>
                <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                  Showing {filteredUsers.length} of {users.length} users in the
                  current admin view.
                </CardDescription>
              </div>

              <div className="text-sm text-slate-500">
                Selected: <span className="font-semibold text-slate-900">{selectedIds.length}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center">
                <div className="mx-auto inline-flex rounded-2xl bg-slate-900 p-3 text-white">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  No users match the current filters
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try changing the search query or clearing one of the active
                  filters to expand the list.
                </p>
                <div className="mt-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                    onClick={handleClearFilters}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reset filters
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="hidden xl:block">
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          <th className="pb-2 pl-3">
                            <SelectionCheckbox
                              checked={allVisibleSelected}
                              onChange={toggleVisibleSelection}
                              ariaLabel="Select all visible users"
                            />
                          </th>
                          <th className="pb-2">Profile</th>
                          <th className="pb-2">Full name</th>
                          <th className="pb-2">Email</th>
                          <th className="pb-2">Role</th>
                          <th className="pb-2">Plan</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Joined date</th>
                          <th className="pb-2 pr-3 text-right">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="rounded-l-[24px] border border-r-0 border-white/55 bg-white/70 py-4 pl-3 align-middle">
                              <SelectionCheckbox
                                checked={selectedIds.includes(user.id)}
                                onChange={() => toggleSelection(user.id)}
                                ariaLabel={`Select ${user.name}`}
                              />
                            </td>
                            <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-middle">
                              <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                                <AvatarFallback
                                  className={cn(
                                    "text-sm font-semibold text-white",
                                    user.role === "Admin"
                                      ? "bg-slate-900"
                                      : user.role === "Mentor"
                                        ? "bg-teal-700"
                                        : "bg-[color:var(--accent)]",
                                  )}
                                >
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                            </td>
                            <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-middle">
                              <button
                                type="button"
                                className="text-left"
                                onClick={() => openUserPanel(user, "view", "general")}
                              >
                                <div className="font-semibold text-slate-900 transition hover:text-[color:var(--accent)]">
                                  {user.name}
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                  {user.subjects.slice(0, 2).join(", ")}
                                </div>
                              </button>
                            </td>
                            <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-middle text-sm text-slate-600">
                              {user.email}
                            </td>
                            <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-middle">
                              <RoleBadge role={user.role} />
                            </td>
                            <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-middle">
                              <PlanBadge plan={user.plan} />
                            </td>
                            <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-middle">
                              <StatusBadge status={user.status} />
                            </td>
                            <td className="border border-l-0 border-r-0 border-white/55 bg-white/70 py-4 align-middle text-sm text-slate-600">
                              {user.joinedDate}
                            </td>
                            <td className="rounded-r-[24px] border border-l-0 border-white/55 bg-white/70 py-4 pr-3 align-middle">
                              <div className="flex justify-end">
                                <RowActionsMenu
                                  user={user}
                                  onViewDetails={() =>
                                    openUserPanel(user, "view", "general")
                                  }
                                  onEditUser={() =>
                                    openUserPanel(user, "edit", "general")
                                  }
                                  onToggleBlocked={() => handleToggleBlocked(user.id)}
                                  onChangeRole={() =>
                                    openUserPanel(user, "edit", "role")
                                  }
                                  onDeleteUser={() => handleDeleteUser(user.id)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4 xl:hidden">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-[28px] border border-white/55 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <SelectionCheckbox
                            checked={selectedIds.includes(user.id)}
                            onChange={() => toggleSelection(user.id)}
                            ariaLabel={`Select ${user.name}`}
                          />

                          <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                            <AvatarFallback
                              className={cn(
                                "text-sm font-semibold text-white",
                                user.role === "Admin"
                                  ? "bg-slate-900"
                                  : user.role === "Mentor"
                                    ? "bg-teal-700"
                                    : "bg-[color:var(--accent)]",
                              )}
                            >
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <button
                              type="button"
                              className="text-left"
                              onClick={() => openUserPanel(user, "view", "general")}
                            >
                              <p className="truncate text-base font-semibold text-slate-900">
                                {user.name}
                              </p>
                              <p className="truncate text-sm text-slate-500">
                                {user.email}
                              </p>
                            </button>
                          </div>
                        </div>

                        <RowActionsMenu
                          user={user}
                          onViewDetails={() => openUserPanel(user, "view", "general")}
                          onEditUser={() => openUserPanel(user, "edit", "general")}
                          onToggleBlocked={() => handleToggleBlocked(user.id)}
                          onChangeRole={() => openUserPanel(user, "edit", "role")}
                          onDeleteUser={() => handleDeleteUser(user.id)}
                        />
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Role
                          </p>
                          <RoleBadge role={user.role} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Plan
                          </p>
                          <PlanBadge plan={user.plan} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Status
                          </p>
                          <StatusBadge status={user.status} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Joined
                          </p>
                          <p className="text-sm font-medium text-slate-700">
                            {user.joinedDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {panelState.open ? (
          <div className="fixed inset-0 z-50 flex justify-end">
            <button
              type="button"
              aria-label="Close panel"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
              onClick={closePanel}
            />

            <div className="relative z-10 h-full w-full max-w-2xl overflow-y-auto border-l border-white/20 bg-[#fcfaf6] shadow-[-30px_0_80px_rgba(15,23,42,0.18)]">
              <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-[#fcfaf6]/95 px-6 py-5 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600">
                      {panelState.mode === "create"
                        ? "Create user"
                        : panelState.mode === "edit"
                          ? "Edit user"
                          : "User details"}
                    </Badge>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        {panelState.mode === "create"
                          ? "Add a new user"
                          : formState.name || activeUser?.name || "User profile"}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {panelState.context === "role"
                          ? "Adjust role access and save the update."
                          : panelState.mode === "view"
                            ? "Review account details, subscription access, and recent activity."
                            : "Update account information and admin controls."}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white px-3 hover:bg-slate-50"
                    onClick={closePanel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 ring-2 ring-white shadow-sm">
                        <AvatarFallback
                          className={cn(
                            "text-base font-semibold text-white",
                            formState.role === "Admin"
                              ? "bg-slate-900"
                              : formState.role === "Mentor"
                                ? "bg-teal-700"
                                : "bg-[color:var(--accent)]",
                          )}
                        >
                          {getInitials(formState.name || "New User")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                          {formState.name || "New user"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {formState.email || "Add an email address to create the account."}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <RoleBadge role={formState.role} />
                          <PlanBadge plan={formState.plan} />
                          <StatusBadge status={formState.status} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                      Profile
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-500">
                      Core account details and study coverage for this user.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-600">
                          Full name
                        </span>
                        <input
                          value={formState.name}
                          onChange={(event) =>
                            setFormState((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          disabled={panelState.mode === "view"}
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-600">
                          Email
                        </span>
                        <input
                          value={formState.email}
                          onChange={(event) =>
                            setFormState((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                          disabled={panelState.mode === "view"}
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-600">
                          Role
                        </span>
                        <select
                          value={formState.role}
                          onChange={(event) =>
                            setFormState((current) => ({
                              ...current,
                              role: event.target.value as UserRole,
                            }))
                          }
                          disabled={panelState.mode === "view"}
                          className={cn(
                            "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]",
                            panelState.context === "role" &&
                              panelState.mode === "edit" &&
                              "accent-ring",
                          )}
                        >
                          {ROLE_VALUES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-600">
                          Subscription
                        </span>
                        <select
                          value={formState.plan}
                          onChange={(event) =>
                            setFormState((current) => ({
                              ...current,
                              plan: event.target.value as UserPlan,
                            }))
                          }
                          disabled={panelState.mode === "view"}
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                        >
                          {PLAN_VALUES.map((plan) => (
                            <option key={plan} value={plan}>
                              {plan}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-600">
                          Status
                        </span>
                        <select
                          value={formState.status}
                          onChange={(event) =>
                            setFormState((current) => ({
                              ...current,
                              status: event.target.value as UserStatus,
                            }))
                          }
                          disabled={panelState.mode === "view"}
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                        >
                          {STATUS_VALUES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-600">
                        Subjects
                      </span>
                      <textarea
                        rows={4}
                        value={formState.subjects}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            subjects: event.target.value,
                          }))
                        }
                        disabled={panelState.mode === "view"}
                        placeholder="Mathematics, Physics, ICT"
                        className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {parseSubjects(formState.subjects).map((subject) => (
                        <Badge
                          key={subject}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.72rem] font-semibold text-slate-700"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-surface rounded-[28px] border border-white/45 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                      Account Snapshot
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-500">
                      Quick readout of status, subscription, and activity metadata.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <InfoItem label="Email" value={formState.email || "-"} icon={Mail} />
                    <InfoItem label="Join date" value={formState.joinedDate} icon={CalendarDays} />
                    <InfoItem label="Last active" value={formState.lastActive} icon={Clock3} />
                    <InfoItem
                      label="Subscription"
                      value={formState.plan}
                      icon={ShieldCheck}
                    />
                    <InfoItem
                      label="Role"
                      value={formState.role}
                      icon={UserCog}
                    />
                    <InfoItem
                      label="Subjects"
                      value={`${parseSubjects(formState.subjects).length} tracked`}
                      icon={BookOpen}
                    />
                  </CardContent>
                </Card>

                {formError ? (
                  <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {formError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <div className="flex flex-wrap gap-3">
                    {panelState.mode === "view" && activeUser ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                          onClick={() => openUserPanel(activeUser, "edit", "general")}
                        >
                          <PencilLine className="mr-2 h-4 w-4" />
                          Edit User
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                          onClick={() => openUserPanel(activeUser, "edit", "role")}
                        >
                          <UserCog className="mr-2 h-4 w-4" />
                          Change Role
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                          onClick={() => handleToggleBlocked(activeUser.id)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {activeUser.status === "Blocked" ? "Unblock" : "Block"}
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                        onClick={closePanel}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {panelState.mode !== "view" ? (
                      <Button
                        type="button"
                        className="rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                        onClick={handleSaveUser}
                      >
                        {panelState.mode === "create" ? "Create User" : "Save Changes"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        className="rounded-2xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                        onClick={closePanel}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedDashboardLayout>
  );
}
