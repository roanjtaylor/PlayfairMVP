import { NextResponse } from 'next/server';
import { portfolio } from '@/data/portfolio';
import { fetchGitHubContributors } from '@/lib/github';
import { fetchAcademicAuthors } from '@/lib/openAlex';
import { generateCandidates } from '@/lib/claude';
import type { ExpansionResult, PortfolioCompany } from '@/lib/types';

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  const { companyId, company: companyObj, sources = ['github', 'academic'], depth = 1, location = 'UK' } = body;

  // Accept either a full company object (custom companies) or a companyId (static)
  let company: PortfolioCompany | undefined = companyObj;
  if (!company && companyId) {
    company = portfolio.find((c) => c.id === companyId);
  }
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not set. Add it to your environment variables.' },
      { status: 503 }
    );
  }

  try {
    // Hard 12-second cap on external data fetching so Claude always has time to respond
    const dataTimeout = new Promise<[never[], never[]]>((r) =>
      setTimeout(() => r([[], []]), 12000)
    );
    const dataFetch = Promise.all([
      sources.includes('github')
        ? fetchGitHubContributors(company.domains, company.githubOrg).catch(() => [])
        : Promise.resolve([]),
      sources.includes('academic')
        ? fetchAcademicAuthors(company.domains).catch(() => [])
        : Promise.resolve([]),
    ]);
    const [githubData, academicData] = await Promise.race([dataFetch, dataTimeout]);

    const candidates = await generateCandidates(company, githubData, academicData, depth, location);

    const result: ExpansionResult = { company, candidates, githubData, academicData };
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/expand]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
