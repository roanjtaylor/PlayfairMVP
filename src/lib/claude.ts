import Anthropic from '@anthropic-ai/sdk';
import type { PortfolioCompany, GitHubContributor, AcademicAuthor, Candidate } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateCandidates(
  company: PortfolioCompany,
  githubContributors: GitHubContributor[],
  academicAuthors: AcademicAuthor[],
  depth: number,
  location: string
): Promise<Candidate[]> {
  const founderNames = company.founders.map((f) => f.name).join(', ');

  const prompt = `You are a senior analyst at Playfair Capital, a UK-based early-stage VC fund.

## Task
Identify ${depth === 2 ? '7–8' : '5–6'} exceptional people from the data below who could plausibly become founders in the next 1–3 years and who fit Playfair's investment thesis.

## Portfolio Company
- **Name:** ${company.name}
- **Description:** ${company.description}
- **Sector:** ${company.sector} / ${company.subsector ?? ''}
- **Founders:** ${founderNames}
- **Domains:** ${company.domains.join(', ')}

## Playfair Investment Thesis
- Pre-seed and seed stage, UK/Europe focus
- B2B SaaS, developer tools, AI/ML applications, climate tech, fintech
- Deep technical founders with proprietary insights
- Prefer: people who have NOT yet started a company
- Location preference: ${location}

## GitHub Contributors Found Near This Ecosystem
${JSON.stringify(githubContributors.slice(0, 12), null, 2)}

## Academic Authors in Adjacent Fields
${JSON.stringify(academicAuthors.slice(0, 8), null, 2)}

## Instructions
For each candidate:
1. They must be connected to ${company.name}'s ecosystem (via the data above or plausible adjacent paths)
2. Do NOT include people who already run funded startups
3. Infer realistic details from the data; fill gaps with plausible specifics
4. The founderReadiness score (0–100) must be explained by readinessEvidence
5. Generate a realistic LinkedIn search URL using: https://www.linkedin.com/search/results/people/?keywords=NAME+ORG
6. Generate a realistic Google search URL

Return ONLY a valid JSON array. No explanation. No markdown. Just the array.

[
  {
    "id": "unique-slug",
    "name": "Full Name",
    "photo": null,
    "currentRole": "Senior Software Engineer",
    "currentOrg": "Employer Name",
    "founderReadiness": 87,
    "relationshipDistance": 1,
    "technicalArea": "Distributed Systems",
    "summary": "Single sentence describing why this person stands out.",
    "connectionPath": ["Playfair", "${company.name}", "Open Source Collaboration", "Candidate Name"],
    "whyThisPerson": "2-3 sentences on their exceptional qualities.",
    "whyPlayfair": "Why they fit Playfair's thesis specifically.",
    "whyNow": "Why the timing is right for this person to found.",
    "founderSignals": {
      "github": "https://github.com/username",
      "research": ["Paper or project title"],
      "projects": ["Notable open-source project"],
      "talks": []
    },
    "currentEmployer": "Employer",
    "technicalThemes": ["Theme 1", "Theme 2", "Theme 3"],
    "publicActivity": ["Recent public contribution or talk"],
    "evidenceTimeline": [
      { "year": 2024, "event": "Specific achievement" },
      { "year": 2023, "event": "Earlier achievement" }
    ],
    "suggestedNextStep": "Specific actionable next step for the Playfair investor.",
    "readinessEvidence": [
      "Trusted network overlap",
      "Technical excellence demonstrated publicly",
      "Increasing independent output",
      "No company detected",
      "Strong Playfair thesis alignment"
    ],
    "links": {
      "github": "https://github.com/username",
      "linkedin": "https://www.linkedin.com/search/results/people/?keywords=Full+Name+Employer",
      "openAlex": null,
      "google": "https://www.google.com/search?q=Full+Name+Employer+engineer",
      "website": null,
      "email": null
    },
    "source": "github"
  }
]`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 7000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON array from response
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Claude did not return a valid JSON array');

  const parsed: Candidate[] = JSON.parse(match[0]);

  // Ensure OpenAlex links for academic candidates
  return parsed.map((c) => {
    if (c.source === 'academic') {
      const academic = academicAuthors.find((a) =>
        a.name.toLowerCase().includes(c.name.split(' ')[1]?.toLowerCase() ?? '')
      );
      if (academic?.openAlexUrl) {
        c.links.openAlex = academic.openAlexUrl;
      }
    }
    return c;
  });
}
