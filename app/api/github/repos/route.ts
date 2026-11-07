import { projects } from '../../../../data/projects';
import { githubRepositoryResponse } from '../../../../lib/githubPortfolioData';

export async function GET(request: Request) {
  return githubRepositoryResponse(new URL(request.url).searchParams.get('repo'), projects);
}
