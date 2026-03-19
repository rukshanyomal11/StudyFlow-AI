import React from 'react';
import ScaffoldPage from '@/components/common/ScaffoldPage';

export default function StudentQuizResultPage({ params }) {
  return (
    <ScaffoldPage
      pageKey="student.quizResult"
      context={{ label: 'Result ID', value: params.id }}
    />
  );
}
