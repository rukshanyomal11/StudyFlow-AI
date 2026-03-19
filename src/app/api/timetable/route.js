import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('timetable.root', 'GET');
}

export async function PUT(request) {
  return createScaffoldResponse('timetable.root', 'PUT');
}
