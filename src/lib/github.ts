import type { GitHubContributor } from './types';

const BASE = 'https://api.github.com';

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function ghFetch(url: string) {
  try {
    const res = await fetch(url, {
      headers: headers(),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Simplified: no per-user enrichment — keeps total API calls to ~5 and well within timeout
export async function fetchGitHubContributors(
  domains: string[],
  githubOrg?: string
): Promise<GitHubContributor[]> {
  const contributors = new Map<string, GitHubContributor>();

  // 1. Org members (single call)
  if (githubOrg) {
    const members = await ghFetch(`${BASE}/orgs/${githubOrg}/members?per_page=20`);
    if (Array.isArray(members)) {
      for (const m of members.slice(0, 12)) {
        contributors.set(m.login, {
          login: m.login,
          avatarUrl: m.avatar_url,
          profileUrl: m.html_url,
          source: 'org-member',
        });
      }
    }
  }

  // 2. Search repos by domain keywords and pull top contributors (3 repos × 8 contributors = 3 calls)
  const query = domains.slice(0, 2).join('+');
  const searchData = await ghFetch(
    `${BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=4`
  );

  if (searchData?.items) {
    for (const repo of searchData.items.slice(0, 3)) {
      if (contributors.size >= 20) break;
      const contribs = await ghFetch(
        `${BASE}/repos/${repo.full_name}/contributors?per_page=8`
      );
      if (!Array.isArray(contribs)) continue;
      for (const c of contribs) {
        if (contributors.has(c.login) || contributors.size >= 20) break;
        contributors.set(c.login, {
          login: c.login,
          avatarUrl: c.avatar_url,
          profileUrl: c.html_url,
          contributions: c.contributions,
          repo: repo.full_name,
          repoStars: repo.stargazers_count,
          repoDescription: repo.description ?? undefined,
          source: 'repo-contributor',
        });
      }
    }
  }

  return Array.from(contributors.values());
}
