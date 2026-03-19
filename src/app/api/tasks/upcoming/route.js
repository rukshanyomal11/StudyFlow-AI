import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('tasks.upcoming', 'GET');
}
