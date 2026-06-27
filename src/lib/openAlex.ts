import type { AcademicAuthor } from './types';

const BASE = 'https://api.openalex.org';
const UA = 'PlayfairMap/1.0 (mailto:hello@playfair.vc)';

export async function fetchAcademicAuthors(domains: string[]): Promise<AcademicAuthor[]> {
  const query = domains.slice(0, 3).join(' ');

  let res: Response;
  try {
    res = await fetch(
      `${BASE}/works?filter=title.search:${encodeURIComponent(query)},publication_year:>2021&sort=cited_by_count:desc&per_page=15&select=id,title,publication_year,cited_by_count,authorships`,
      {
        headers: { 'User-Agent': UA },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(6000),
      }
    );
  } catch { return []; }

  if (!res.ok) return [];

  const data = await res.json();
  const authorsMap = new Map<string, AcademicAuthor>();

  for (const work of data.results ?? []) {
    const authorships = work.authorships ?? [];

    for (const authorship of authorships.slice(0, 3)) {
      const author = authorship.author;
      if (!author?.id || !author?.display_name) continue;

      const existing = authorsMap.get(author.id);
      const paper = {
        title: work.title ?? '',
        year: work.publication_year,
        citedBy: work.cited_by_count ?? 0,
        doi: work.doi ?? undefined,
      };

      if (existing) {
        existing.papers.push(paper);
      } else {
        const inst = authorship.institutions?.[0];
        authorsMap.set(author.id, {
          id: author.id,
          name: author.display_name,
          institution: inst?.display_name,
          country: inst?.country_code,
          openAlexUrl: author.id,
          orcid: author.orcid ?? undefined,
          papers: [paper],
        });
      }

      if (authorsMap.size >= 15) break;
    }
    if (authorsMap.size >= 15) break;
  }

  // Sort by total citation count
  return Array.from(authorsMap.values())
    .sort((a, b) => {
      const sumA = a.papers.reduce((s, p) => s + (p.citedBy ?? 0), 0);
      const sumB = b.papers.reduce((s, p) => s + (p.citedBy ?? 0), 0);
      return sumB - sumA;
    })
    .slice(0, 12);
}
