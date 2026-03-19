import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('groups.messages', 'GET');
}

export async function POST(request) {
  return createScaffoldResponse('groups.messages', 'POST');
}
