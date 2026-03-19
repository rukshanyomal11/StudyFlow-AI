import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('notes.item', 'GET');
}

export async function PUT(request) {
  return createScaffoldResponse('notes.item', 'PUT');
}

export async function DELETE(request) {
  return createScaffoldResponse('notes.item', 'DELETE');
}
