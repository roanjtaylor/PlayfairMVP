import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { Candidate, PortfolioCompany, StudyReport } from '@/lib/types';

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  const { candidates, company }: { candidates: Candidate[]; company: PortfolioCompany } = body;

  if (!candidates?.length) return NextResponse.json({ error: 'No candidates provided' }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 503 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are a senior partner at Playfair Capital, a UK early-stage VC fund.

You previously ran a trust graph expansion from your portfolio company **${company.name}** (${company.description}) and surfaced the following candidates.

Now produce a deep-study report on each. For every candidate, write:
- A deeper assessment (3-4 sentences, honest and specific)
- 3-4 concrete strengths relevant to Playfair's thesis
- 1-2 genuine concerns or unknowns
- A personalised outreach message from a Playfair investor (2-3 sentences, warm and specific, no boilerplate)
- 3 precise due diligence questions to ask before a meeting
- A verdict: "strong" (reach out this week), "interesting" (add to watchlist), or "monitor" (check back in 6 months)

Candidates to study:
${JSON.stringify(candidates, null, 2)}

Return ONLY a valid JSON array — no markdown, no explanation:

[
  {
    "candidateId": "id",
    "candidateName": "Full Name",
    "deepAssessment": "Honest 3-4 sentence assessment...",
    "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
    "concerns": ["Genuine concern 1", "Unknown 2"],
    "outreachMessage": "Hi [Name], I came across your work on [specific thing]...",
    "dueDiligenceQuestions": ["Question 1?", "Question 2?", "Question 3?"],
    "verdict": "strong"
  }
]`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 6000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return NextResponse.json({ error: 'AI did not return valid JSON' }, { status: 500 });

  const reports: StudyReport[] = JSON.parse(match[0]);
  return NextResponse.json({ reports });
}
