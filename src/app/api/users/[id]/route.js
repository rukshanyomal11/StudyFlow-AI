import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('users.item', 'GET');
}

export async function PUT(request) {
  return createScaffoldResponse('users.item', 'PUT');
}

export async function DELETE(request) {
  return createScaffoldResponse('users.item', 'DELETE');
}
