import React from 'react';
import ScaffoldPage from '@/components/common/ScaffoldPage';

export default function StudentQuizDetailPage({ params }) {
  return (
    <ScaffoldPage
      pageKey="student.quizDetail"
      context={{ label: 'Quiz ID', value: params.id }}
    />
  );
}
