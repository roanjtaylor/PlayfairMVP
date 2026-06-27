import { NextResponse } from 'next/server';
import type { SavedExpansion } from '@/lib/types';

const REPO = 'roanjtaylor/PlayfairMVP';
const FILE = 'public/discoveries.json';
const EMPTY: { version: number; expansions: SavedExpansion[] } = { version: 1, expansions: [] };

function ghHeaders() {
  const h: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE}`,
      { headers: ghHeaders(), cache: 'no-store' }
    );
    if (res.status === 404) return NextResponse.json(EMPTY);
    if (!res.ok) return NextResponse.json(EMPTY);
    const file = await res.json();
    const content = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));
    return NextResponse.json(content);
  } catch {
    return NextResponse.json(EMPTY);
  }
}

export async function POST(req: Request) {
  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json({ error: 'GITHUB_TOKEN not set' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const headers = {
    ...ghHeaders(),
    'Content-Type': 'application/json',
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
  };

  // Read current file to get SHA
  const readRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE}`,
    { headers, cache: 'no-store' }
  );

  let store: { version: number; expansions: SavedExpansion[] } = { version: 1, expansions: [] };
  let sha: string | undefined;

  if (readRes.ok) {
    const fileData = await readRes.json();
    sha = fileData.sha;
    try {
      store = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
    } catch { /* start fresh */ }
  }

  // Replace existing expansion for same company, prepend new one
  store.expansions = store.expansions.filter((e) => e.company.id !== body.company.id);
  store.expansions.unshift({
    id: `${body.company.id}-${Date.now()}`,
    company: body.company,
    candidates: body.candidates,
    savedAt: new Date().toISOString(),
    sources: body.sources ?? [],
    depth: body.depth ?? 1,
    location: body.location ?? 'UK',
  });

  const encoded = Buffer.from(JSON.stringify(store, null, 2) + '\n').toString('base64');

  const writeRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `discoveries: ${body.company.name} — ${body.candidates.length} candidates`,
        content: encoded,
        ...(sha ? { sha } : {}),
      }),
    }
  );

  if (!writeRes.ok) {
    const err = await writeRes.json().catch(() => ({}));
    return NextResponse.json({ error: 'GitHub write failed', detail: err }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
