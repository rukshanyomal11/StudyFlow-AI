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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar links={links} />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-auto">
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
  );
}
