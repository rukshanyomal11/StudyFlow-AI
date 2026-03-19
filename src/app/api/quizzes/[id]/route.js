import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('quizzes.item', 'GET');
}

export async function PUT(request) {
  return createScaffoldResponse('quizzes.item', 'PUT');
}

export async function DELETE(request) {
  return createScaffoldResponse('quizzes.item', 'DELETE');
}
