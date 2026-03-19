import React from 'react';
import Link from 'next/link';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-xl w-full">
        <CardContent className="p-8 text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">StudyFlow AI</p>
          <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
          <p className="text-gray-600">This route is not part of the current study blueprint yet, or the URL is incorrect.</p>
          <Link href="/">
            <Button variant="primary">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
