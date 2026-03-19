'use client';

import React from 'react';
import ProtectedDashboardLayout from '@/components/layout/ProtectedDashboardLayout';
import { adminSidebarLinks } from '@/data/sidebarLinks';

export default function AdminLayout({ children }) {
  return (
    <ProtectedDashboardLayout
      role="admin"
      links={adminSidebarLinks}
      loadingMessage="Loading admin workspace..."
    >
      {children}
    </ProtectedDashboardLayout>
  );
}
