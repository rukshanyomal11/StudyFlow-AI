import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function GET(request) {
  return createScaffoldResponse('quizzes.root', 'GET');
}

export async function POST(request) {
  return createScaffoldResponse('quizzes.root', 'POST');
}
