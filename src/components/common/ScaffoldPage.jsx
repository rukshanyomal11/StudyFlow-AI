import React from 'react';
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import { studyflowPages } from '@/data/studyflowPages';

const ListCard = ({ title, items, accent = 'blue' }) => {
  const accents = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    green: 'border-green-100 bg-green-50 text-green-700',
    purple: 'border-purple-100 bg-purple-50 text-purple-700',
    orange: 'border-orange-100 bg-orange-50 text-orange-700',
  };

  return (
    <Card>
      <CardHeader>
        <div
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${accents[accent]}`}
        >
          Section
        </div>
        <CardTitle className="mt-3">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700"
            >
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default function ScaffoldPage({ pageKey, context = null }) {
  const page = studyflowPages[pageKey];

  if (!page) {
    return (
      <Card>
        <CardContent className="p-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Blueprint page not found
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            The page key <code>{pageKey}</code> is not registered in the
            StudyFlow blueprint.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        actions={page.actions}
      />

      {context && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-gray-500">{context.label}</p>
              <p className="text-sm font-semibold text-gray-900">{context.value}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {page.metrics?.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {page.metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-5">
                <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-gray-500">{metric.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {page.quickActions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {page.quickActions.map((action) => (
                <div
                  key={action}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-medium text-gray-700"
                >
                  {action}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {page.sections.map((section, index) => (
          <ListCard
            key={section.title}
            title={section.title}
            items={section.items}
            accent={['blue', 'green', 'purple', 'orange'][index % 4]}
          />
        ))}
      </div>

      {page.workflow?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {page.workflow.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
