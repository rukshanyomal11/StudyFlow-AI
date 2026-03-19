'use client';

import React from 'react';
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout';
import { mentorSidebarLinks } from '@/data/sidebarLinks';

export default function MentorLayout({ children }) {
  return (
    <ProtectedDashboardLayout
      role="mentor"
      links={mentorSidebarLinks}
      loadingMessage="Loading mentor workspace..."
    >
      {children}
    </ProtectedDashboardLayout>
  );
}
