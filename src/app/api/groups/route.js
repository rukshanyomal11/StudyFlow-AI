import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('groups.root', 'GET');
}

export async function POST(request) {
  return createScaffoldResponse('groups.root', 'POST');
}
