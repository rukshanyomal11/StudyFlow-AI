import React from 'react';
import ScaffoldPage from '@/components/common/ScaffoldPage';

export default function MentorStudentDetailPage({ params }) {
  return (
    <ScaffoldPage
      pageKey="mentor.studentDetail"
      context={{ label: 'Student ID', value: params.id }}
    />
  );
}
