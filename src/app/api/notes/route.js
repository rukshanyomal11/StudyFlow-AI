import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('notes.root', 'GET');
}

export async function POST(request) {
  return createScaffoldResponse('notes.root', 'POST');
}
