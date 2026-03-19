import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('tasks.root', 'GET');
}

export async function POST(request) {
  return createScaffoldResponse('tasks.root', 'POST');
}
