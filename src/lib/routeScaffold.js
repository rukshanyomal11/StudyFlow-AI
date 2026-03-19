import { NextResponse } from 'next/server';
import { studyflowApiBlueprints } from '@/data/studyflowApiBlueprints';

export function createScaffoldResponse(key, method, extra = {}) {
  const blueprint = studyflowApiBlueprints[key];

  if (!blueprint) {
    return NextResponse.json(
      {
        success: false,
        message: `Unknown StudyFlow API blueprint: ${key}`,
      },
      { status: 404 }
    );
  }

  if (!blueprint.methods.includes(method)) {
    return NextResponse.json(
      {
        success: false,
        message: `Method ${method} is not scaffolded for ${blueprint.path}`,
      },
      { status: 405 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      scaffold: true,
      method,
      endpoint: blueprint.path,
      purpose: blueprint.purpose,
      sample: blueprint.sample,
      nextStep:
        'Replace this placeholder response with real business logic, validation, and database access.',
      ...extra,
    },
    { status: method === 'POST' ? 201 : 200 }
  );
}
