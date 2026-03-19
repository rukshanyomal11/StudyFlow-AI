import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function POST(request) {
  return createScaffoldResponse('notifications.read', 'POST');
}
