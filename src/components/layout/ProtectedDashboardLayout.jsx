'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { PageLoader } from '@/components/common/Loader';

const roleLabels = {
  student: 'student',
  mentor: 'mentor',
  admin: 'admin',
};

export default function ProtectedDashboardLayout({
  children,
  role,
  links,
  loadingMessage,
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <PageLoader message={loadingMessage} />;
  }

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== role) {
    redirect(`/${session.user.role}/dashboard`);
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <div className="flex h-full">
        <Sidebar links={links} className="sticky top-0" />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Navbar />
          </div>

          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                You are viewing the {roleLabels[role]} blueprint workspace for
                StudyFlow AI.
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
