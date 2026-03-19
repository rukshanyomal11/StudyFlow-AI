import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions = [],
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-3 text-base leading-7 text-gray-600">{description}</p>
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button variant={action.variant || 'outline'} size="sm">
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
