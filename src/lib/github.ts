import type { GitHubContributor } from './types';

const BASE = 'https://api.github.com';

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function ghFetch(url: string) {
  const res = await fetch(url, { headers: headers(), next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

async function enrichUser(login: string): Promise<Partial<GitHubContributor>> {
  const user = await ghFetch(`${BASE}/users/${login}`);
  if (!user) return {};
  return {
    name: user.name || undefined,
    bio: user.bio || undefined,
    company: user.company?.replace('@', '').trim() || undefined,
    location: user.location || undefined,
    publicRepos: user.public_repos,
    followers: user.followers,
  };
}

export async function fetchGitHubContributors(
  domains: string[],
  githubOrg?: string
): Promise<GitHubContributor[]> {
  const contributors = new Map<string, GitHubContributor>();

  // 1. If we have a known org, grab its members
  if (githubOrg) {
    const members = await ghFetch(`${BASE}/orgs/${githubOrg}/members?per_page=30`);
    if (Array.isArray(members)) {
      for (const m of members.slice(0, 8)) {
        const extra = await enrichUser(m.login);
        contributors.set(m.login, {
          login: m.login,
          avatarUrl: m.avatar_url,
          profileUrl: m.html_url,
          source: 'org-member',
          ...extra,
        });
      }
    }
  }

  // 2. Search repos by domain keywords and get contributors
  const query = domains.slice(0, 3).join('+');
  const searchData = await ghFetch(
    `${BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=8&type=Repositories`
  );

  if (searchData?.items) {
    for (const repo of searchData.items.slice(0, 4)) {
      const contribs = await ghFetch(`${BASE}/repos/${repo.full_name}/contributors?per_page=6`);
      if (!Array.isArray(contribs)) continue;

      for (const c of contribs) {
        if (contributors.has(c.login)) continue;
        const extra = await enrichUser(c.login);
        contributors.set(c.login, {
          login: c.login,
          avatarUrl: c.avatar_url,
          profileUrl: c.html_url,
          contributions: c.contributions,
          repo: repo.full_name,
          repoStars: repo.stargazers_count,
          repoDescription: repo.description || undefined,
          source: 'repo-contributor',
          ...extra,
        });

        // Rate-limit guard: stop after 20 unique contributors
        if (contributors.size >= 20) break;
      }
      if (contributors.size >= 20) break;
    }
  }

  return Array.from(contributors.values());
}
