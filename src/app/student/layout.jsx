'use client';

import React from 'react';
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout';
import { studentSidebarLinks } from '@/data/sidebarLinks';

export default function StudentLayout({ children }) {
  return (
    <ProtectedDashboardLayout
      role="student"
      links={studentSidebarLinks}
      loadingMessage="Loading student workspace..."
    >
      {children}
    </ProtectedDashboardLayout>
  );
}
