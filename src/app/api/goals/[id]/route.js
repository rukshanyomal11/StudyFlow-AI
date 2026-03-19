import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('goals.item', 'GET');
}

export async function PUT(request) {
  return createScaffoldResponse('goals.item', 'PUT');
}

export async function DELETE(request) {
  return createScaffoldResponse('goals.item', 'DELETE');
}
