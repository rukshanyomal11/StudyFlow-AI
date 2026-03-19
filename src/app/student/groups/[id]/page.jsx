import React from 'react';
import ScaffoldPage from '@/components/common/ScaffoldPage';

export default function StudentGroupDetailPage({ params }) {
  return (
    <ScaffoldPage
      pageKey="student.groupDetail"
      context={{ label: 'Group ID', value: params.id }}
    />
  );
}
