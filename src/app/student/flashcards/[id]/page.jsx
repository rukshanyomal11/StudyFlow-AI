import React from 'react';
import ScaffoldPage from '@/components/common/ScaffoldPage';

export default function StudentFlashcardDetailPage({ params }) {
  return (
    <ScaffoldPage
      pageKey="student.flashcardDetail"
      context={{ label: 'Flashcard ID', value: params.id }}
    />
  );
}
