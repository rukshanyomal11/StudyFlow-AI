import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('flashcards.item', 'GET');
}

export async function PUT(request) {
  return createScaffoldResponse('flashcards.item', 'PUT');
}

export async function DELETE(request) {
  return createScaffoldResponse('flashcards.item', 'DELETE');
}
