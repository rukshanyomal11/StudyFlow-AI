import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('flashcards.root', 'GET');
}

export async function POST(request) {
  return createScaffoldResponse('flashcards.root', 'POST');
}
