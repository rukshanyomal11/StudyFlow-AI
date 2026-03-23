import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/data/admin-dashboard";

interface AdminUsersTableProps {
  users: AdminUser[];
}

const roleStyles: Record<AdminUser["role"], string> = {
  Student: "border-sky-200 bg-sky-50 text-sky-700",
  Mentor: "border-teal-200 bg-teal-50 text-teal-700",
  Admin: "border-slate-200 bg-slate-100 text-slate-700",
};

const statusStyles: Record<AdminUser["status"], string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Suspended: "border-rose-200 bg-rose-50 text-rose-700",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminUsersTable({ users }: AdminUsersTableProps) {
  return (
    <div className="space-y-4">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                User
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Role
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Last active
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="rounded-3xl">
                <td className="rounded-l-[24px] border border-r-0 border-white/60 bg-white/70 px-4 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-gradient-to-br from-slate-900 to-teal-700 text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="border border-l-0 border-r-0 border-white/60 bg-white/70 px-4 py-4">
                  <Badge
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleStyles[user.role]}`}
                  >
                    {user.role}
                  </Badge>
                </td>

                <td className="border border-l-0 border-r-0 border-white/60 bg-white/70 px-4 py-4">
                  <Badge
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[user.status]}`}
                  >
                    {user.status}
                  </Badge>
                </td>

                <td className="border border-l-0 border-r-0 border-white/60 bg-white/70 px-4 py-4 text-sm text-slate-500">
                  {user.lastSeen}
                </td>

                <td className="rounded-r-[24px] border border-l-0 border-white/60 bg-white/70 px-4 py-4 text-right">
                  <Link href={user.manageHref}>
                    <Button
                      variant="outline"
                      className="rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
                    >
                      Manage
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 lg:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-[24px] border border-white/60 bg-white/75 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-slate-900 to-teal-700 text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>

              <Badge
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[user.status]}`}
              >
                {user.status}
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleStyles[user.role]}`}
              >
                {user.role}
              </Badge>
              <Badge className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                {user.lastSeen}
              </Badge>
            </div>

            <div className="mt-4">
              <Link href={user.manageHref}>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-slate-200 bg-white hover:bg-slate-50"
                >
                  Manage
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
