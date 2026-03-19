import React from 'react';
import Link from 'next/link';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-xl w-full">
        <CardContent className="p-8 text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">Access Control</p>
          <h1 className="text-3xl font-bold text-gray-900">Unauthorized</h1>
          <p className="text-gray-600">Your current role does not have access to this workspace.</p>
          <Link href="/login">
            <Button variant="primary">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
