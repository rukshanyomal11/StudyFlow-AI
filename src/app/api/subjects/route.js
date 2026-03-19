import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('subjects.root', 'GET');
}

export async function POST(request) {
  return createScaffoldResponse('subjects.root', 'POST');
}
