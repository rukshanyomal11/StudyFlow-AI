import React from 'react';
import ScaffoldPage from '@/components/common/ScaffoldPage';

export default function StudentSubjectDetailPage({ params }) {
  return (
    <ScaffoldPage
      pageKey="student.subjectDetail"
      context={{ label: 'Subject ID', value: params.id }}
    />
  );
}
