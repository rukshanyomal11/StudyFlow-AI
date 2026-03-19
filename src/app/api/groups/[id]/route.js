import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('groups.item', 'GET');
}

export async function PUT(request) {
  return createScaffoldResponse('groups.item', 'PUT');
}

export async function DELETE(request) {
  return createScaffoldResponse('groups.item', 'DELETE');
}
