import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('tasks.item', 'GET');
}

export async function PUT(request) {
  return createScaffoldResponse('tasks.item', 'PUT');
}

export async function DELETE(request) {
  return createScaffoldResponse('tasks.item', 'DELETE');
}
