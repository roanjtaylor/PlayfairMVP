# Playfair Map — AI-Powered Trust Graph Explorer

## Vision

Playfair Map is an internal sourcing tool that expands Playfair's trusted founder network to surface exceptional future founders before they become obvious companies.

Unlike Harmonic or Evertrace, Playfair Map does not compete on collecting public signals.

Instead, it starts from Playfair's proprietary network of portfolio founders and expands outward into adjacent technical ecosystems, using AI to identify exceptional people connected to founders Playfair already trusts.

> **The product answers one question:** "Who is one or two hops away from our best founders that we should already know?"

---

## Core Workflow

```
Select Portfolio Company
        ↓
Expand Playfair Trust Graph
        ↓
Search Selected Ecosystems
        ↓
AI ranks promising people
        ↓
Investor explores candidate
        ↓
Open LinkedIn / GitHub / OpenAlex
        ↓
Decide whether to reach out
```

---

## MVP Goal

Build a polished internal web application demonstrating how Playfair can continuously expand its trusted founder network.

The emphasis is on:
- Beautiful UX
- Explainable recommendations
- Interactive network exploration
- Fast investigation workflow

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js · React · TypeScript · Tailwind CSS · React Flow |
| Backend | Next.js API Routes |
| AI | Claude (Anthropic API) |
| Data | GitHub API · OpenAlex API |
| Deployment | Vercel |
| Storage | Static portfolio JSON + Runtime AI enrichment |

---

## Home Screen

### Header
> **Playfair Map** — Expand Playfair's trusted founder network.

### Portfolio Companies
Pre-populated with Playfair portfolio companies. Each card shows:
- Company name & sector
- Founder names
- Investment stage

Selecting a company changes the graph seed.

### Discovery Sources

| Source | What it searches |
|--------|-----------------|
| ☑ GitHub | OSS collaborators, contributors, maintainers, repo overlap |
| ☑ Academic | OpenAlex · Cambridge · Oxford · Imperial · Applied AI labs |
| ☑ Public Web | Conference speakers, technical blogs, podcasts, engineering talks |
| □ Patent data | *(Future)* |
| □ LinkedIn enrichment | *(Future)* |

### Search Controls
- **Relationship Depth:** One Hop / Two Hops
- **Sector:** AI · Enterprise · Climate · Robotics · Developer Tools
- **Location:** UK · Europe · Global

---

## Main Interface

Three-panel layout:

```
[LEFT — Candidate List] | [CENTRE — Trust Graph] | [RIGHT — Candidate Profile]
```

---

## Candidate Cards

Each recommendation card includes:
- Photo (or avatar)
- Name · Current role · Organisation
- Founder Readiness score
- Relationship distance
- Technical area
- One-line summary
- Quick action buttons: GitHub · LinkedIn Search · OpenAlex · Google

> **Note:** LinkedIn button opens a pre-filled people search — no scraping, no API required. Keeps the workflow fast while staying within LinkedIn's terms.

---

## Interactive Trust Graph

The centrepiece of the application.

```
Playfair (blue)
    ↓
Portfolio Company (dark blue)
    ↓
Founder (green)
    ↓
Trusted Connection (purple)
    ↓
Prospective Founder (amber)
```

- Click any node → updates profile panel
- Animated graph expansion
- Colour-coded by relationship type

---

## Candidate Profile Panel

- Large avatar + headline
- Founder Readiness score
- Relationship path
- **Why this person** (Claude-generated)
- **Why now** (Claude-generated)
- **Suggested next step** (Claude-generated)
- Evidence timeline
- Founder signals: GitHub · Research · Projects · Talks
- One-click investigation buttons

---

## Founder Readiness

Not a black-box score — every recommendation is explained:

```
Founder Readiness: 92%

✓ Trusted network overlap
✓ Technical excellence
✓ Increasing independent work
✓ No company detected
✓ Strong Playfair thesis fit
✓ Public activity accelerating
```

---

## AI Prompt Design

Claude receives:
- Selected portfolio company + founders
- Raw GitHub contributor data
- Raw OpenAlex academic author data
- Playfair investment thesis

Task: identify exceptional technical people connected to the trust graph who may become future founders. Prefer people without existing startups. Return structured JSON with explainable reasoning.

---

## Why Playfair Map Is Different

| Tool | What it does |
|------|-------------|
| PitchBook | Knows companies |
| Harmonic | Navigates known companies and founders |
| Evertrace | Monitors public signals for emerging startups |
| **Playfair Map** | Starts with Playfair's own trusted network → expands outward → AI explains every connection |

The proprietary advantage is not better scraping.  
The proprietary advantage is **beginning with a relationship graph only Playfair possesses** and turning it into a continuously expanding founder discovery engine.

---

## Demo Flow

1. Open Playfair Map
2. Select **StackOne**
3. Choose **GitHub + Academic**
4. Click **Expand Network**
5. Trust graph expands with animated nodes
6. Twenty candidate cards appear
7. Click a candidate → view relationship path + AI explanation
8. Click **LinkedIn Search** → LinkedIn opens with pre-filled search
9. Click **GitHub** / **OpenAlex** for deeper diligence

*Complete workflow: proprietary discovery → public verification in under one minute.*
