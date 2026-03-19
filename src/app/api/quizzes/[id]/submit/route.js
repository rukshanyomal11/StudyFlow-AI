import { createScaffoldResponse } from '@/lib/routeScaffold';

export async function POST(request) {
  return createScaffoldResponse('quizzes.submit', 'POST');
}
