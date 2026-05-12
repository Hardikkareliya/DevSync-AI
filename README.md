# DevSync

**AI-Powered Developer Productivity Platform**

DevSync converts rough development notes into professional daily reports, conventional git commits, PR descriptions, and team summaries using AI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| State Management | Zustand |
| Server State | TanStack React Query |
| Forms | React Hook Form + Zod |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Gemini API (primary) / OpenAI (ready) |

---

## Features

- **Daily Reports** — Rough notes → professional formatted reports (Markdown, WhatsApp, Slack, Compact, Plain)
- **Git Commits** — Change descriptions → conventional commit messages with auto-type detection
- **PR Descriptions** — Change summaries → formatted PR descriptions with markdown
- **Project Management** — Create, rename, delete projects; organize all generated content
- **History** — Search, filter, expand/collapse, copy, delete all generated items
- **Multiple Output Formats** — WhatsApp, Slack, Markdown, Compact, Plain Text
- **One-Click Copy** — Copy any output with animated toast feedback
- **Dark/Light Mode** — System-aware theme switching
- **Smart Task Parsing** — `+` = completed, `~` = in progress, `-` = pending

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase account (free tier)
- Google AI Studio account (free tier)

### Setup

```bash
# 1. Clone and install
cd devsync
npm install

# 2. Set up environment
cp .env.example .env
```

Edit `.env` with your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Database Setup

1. Go to [Supabase Dashboard](https://supabase.com) → SQL Editor
2. Open and run `supabase/migrations/00001_initial_schema.sql`
3. This creates all tables, RLS policies, and indexes

### Run

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, AppLayout
│   ├── shared/          # CopyButton, ProjectSelector, EmptyState, etc.
│   └── ui/              # shadcn/ui (Button, Card, Dialog, Select, etc.)
├── features/
│   └── ai/
│       ├── providers/   # gemini.provider.ts, openai.provider.ts
│       ├── prompts/     # report.prompt.ts, commit.prompt.ts, pr.prompt.ts
│       └── ai.service.ts
├── integrations/
│   └── supabase/        # client.ts, queries.ts
├── pages/
│   ├── auth/            # Login, Register
│   ├── dashboard/       # Dashboard
│   ├── projects/        # Project management
│   ├── reports/         # Report generator
│   ├── commits/         # Commit generator
│   ├── pr/              # PR generator
│   ├── history/         # History with search/filter
│   └── settings/        # Theme, AI provider, output preferences
├── providers/           # ThemeProvider, QueryProvider
├── store/               # Zustand stores (auth, theme, project, settings)
├── types/               # TypeScript types
└── hooks/               # useMobile, useLocalStorage
```

---

## Architecture

### AI Provider System

Provider-agnostic architecture for easy switching:

```
ai.service.ts  →  prompts/*.prompt.ts  →  providers/*.provider.ts
     │                                          │
     └── routes to correct provider      Gemini / OpenAI
          based on settings
```

Add a new provider:
1. Create `providers/new.provider.ts`
2. Add implementation in `ai.service.ts`
3. Add to settings UI

### Database Schema

```
projects
  ├── id (UUID, PK)
  ├── user_id (FK → auth.users)
  ├── name (text)
  └── timestamps

reports / commits / pr_descriptions
  ├── id (UUID, PK)
  ├── user_id (FK → auth.users)
  ├── project_id (FK → projects)
  ├── raw_input (text)
  ├── generated_output (text)
  ├── output_format (text)
  ├── provider (text)
  └── timestamps
```

### Auth Flow

1. User registers → Supabase Auth sends verification email
2. User verifies email → session created
3. `SessionLoader` checks `supabase.auth.getUser()` on every load
4. Protected routes redirect to `/login` if no session

---

## API Keys

| Service | Where to Get |
|---------|-------------|
| Supabase URL & Anon Key | Supabase Dashboard → Project Settings → API |
| Gemini API Key | [Google AI Studio](https://aistudio.google.com/apikey) |

---

## Output Formats

| Format | Use Case | Features |
|--------|----------|----------|
| Markdown | GitHub, docs | Headers, lists, bold |
| WhatsApp | Daily updates | Emoji, bold via `*` |
| Slack | Team channels | Emoji, bold via `*` |
| Compact | Quick share | Single line summary |
| Plain Text | Anywhere | No formatting |

---

## Development

```bash
npm run dev        # Start dev server
npm run build      # TypeScript check + production build
npm run preview    # Preview production build
```

---

## License

MIT
