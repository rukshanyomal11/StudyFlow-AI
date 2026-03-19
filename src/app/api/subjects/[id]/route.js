import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('subjects.item', 'GET');
}

export async function PUT(request) {
  return createScaffoldResponse('subjects.item', 'PUT');
}

export async function DELETE(request) {
  return createScaffoldResponse('subjects.item', 'DELETE');
}
