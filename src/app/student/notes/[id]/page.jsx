import React from 'react';
import ScaffoldPage from '@/components/common/ScaffoldPage';

export default function StudentNoteDetailPage({ params }) {
  return (
    <ScaffoldPage
      pageKey="student.noteDetail"
      context={{ label: 'Note ID', value: params.id }}
    />
  );
}
