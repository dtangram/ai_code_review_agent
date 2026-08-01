# AI Code Review Agent

An agentic code review tool: point it at a GitHub pull request and it reads the diff, searches the rest of the repository for relevant context (existing conventions, related usages), and produces structured, actionable review comments — with its reasoning visible live as it works, not hidden behind a spinner.

## Why this exists

Code review is slow and inconsistent, and most AI coding tools hide their reasoning behind a black box. This project treats the agent's process as a first-class part of the UX: every tool call, search, and decision streams into a live trace panel, and every suggested comment can be accepted or dismissed by the reviewer — the agent assists, it doesn't auto-merge its own opinions.

## Architecture

- **Agent loop (`api/app/services/agent.service.ts`)** — Claude API with tool use. The model can call `fetch_pull_files`, `search_repo`, and finally `submit_review`. Each tool call is emitted as a structured event.
- **Streaming (`api/app/utils/sse.ts`)** — Server-Sent Events push each agent event to the client as it happens.
- **Persistence (`api/app/db`)** — completed reviews are stored in PostgreSQL, backing the review history view (`GET /api/reviews`).
- **Publish-back (`api/app/services/github.service.ts`)** — accepted findings can be posted as a real GitHub PR review (`POST /api/reviews/:id/publish`) via `pulls.reviews`, so corrections land where the actual fix happens — on the PR itself — rather than staying in a separate app.
- **Frontend (`react/src`)** — a `useAgentReview` custom hook consumes the SSE stream and exposes trace + comment state via Context API to the `TracePanel` and `ReviewComment` components. A `useReviewHistory` hook backs the `ReviewHistory` list, and `PublishButton` sends only human-accepted comments to GitHub.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, CSS Modules, SASS |
| Backend | Node.js, Express, TypeScript, Zod |
| Database | PostgreSQL |
| AI | Claude API (tool use / agentic loop) |
| Testing | Jest, React Testing Library |

## Project structure

```
ai-code-review-agent/
  package.json    # root: installs & runs api + react together
  api/
    app/
      config/       # DB connection
      consts/       # prompts, tool definitions
      controllers/  # request handling
      db/           # schema + models
      routes/       # Express routes
      services/     # agent loop, GitHub API
      types/        # shared TypeScript types
      utils/        # validation (Zod), SSE helper
  react/
    src/
      App.tsx       # thin wrapper: provides ReviewContext, renders Main
      components/   # Main, ReviewForm, TracePanel, ReviewComment, PublishButton, ReviewHistory, StatusBadge
      consts/
      context/      # ReviewContext (Context API)
      hooks/        # useAgentReview, useReviewForm, useReviewHistory custom hooks
      styles/       # SASS variables, mixins, placeholders
      types/
      utils/        # API client
      __tests__/    # Jest + RTL tests
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or a connection string to a hosted instance)
- An Anthropic API key
- A GitHub personal access token with `repo` read access

### 1. Database
```bash
createdb ai_code_review_agent
psql ai_code_review_agent -f api/app/db/schema.sql
```

### 2. Environment variables
```bash
cd api && cp .env.example .env   # fill in DATABASE_URL, ANTHROPIC_API_KEY, GITHUB_TOKEN
cd ../react && cp .env.example .env
cd ..
```

### 3. Install & run everything from the root
The root `package.json` installs and starts both `api` and `react` together, so you don't need two terminal tabs:
```bash
npm run install:all   # installs dependencies in both api/ and react/
npm run dev            # runs api and react dev servers concurrently
```

Prefer to run them separately? `npm run dev:api` and `npm run dev:react` each start just one, or `cd api && npm run dev` / `cd react && npm run dev` work the same as before.

### 4. Tests
```bash
npm test   # runs tests in both api/ and react/ from the root
```

## Deploying to Heroku

This runs as a **single Heroku app**: Express serves both the API and the built React files, so there's one dyno and one Postgres add-on. Locally, `npm run dev` still runs two separate dev servers (Vite on 5173, Express on 4000) — this only applies to the deployed build.

```bash
# From the repo root
heroku create your-app-name
heroku addons:create heroku-postgresql:essential-0

# Config vars — DATABASE_URL is set automatically by the Postgres add-on above
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
heroku config:set GITHUB_TOKEN=your-github-token-with-repo-scope
heroku config:set DEMO_REPOS=your-username/repo-one,your-username/repo-two
heroku config:set NODE_ENV=production

git push heroku main

# Apply the schema to the new Heroku Postgres database
heroku pg:psql < api/app/db/schema.sql

heroku open
```

What makes this work, if you're curious or something breaks:
- **`heroku-postbuild`** (in the root `package.json`) is Heroku's standard hook for monorepos — it installs and builds both `api` and `react` after Heroku's default `npm install` at the repo root finishes. It also sets `VITE_API_BASE_URL=` (empty) specifically for the React build, so the deployed bundle calls same-origin relative paths (`/api/reviews`) instead of `http://localhost:4000`.
- Both installs use **`--include=dev`**: Heroku sets `NODE_ENV=production` during the build, and npm's default behavior is to skip `devDependencies` whenever that's set — but `typescript` (api) and `vite`/`sass`/`typescript` (react) are all devDependencies, and the build genuinely needs them to run `tsc`/`vite build`. Without this flag, the build fails with `tsc: not found` (or `vite: not found`) even though `npm install` reports success.
- **`Procfile`** tells Heroku to run `node api/dist/index.js` — the compiled output of `api/app/index.ts`.
- **`api/app/index.ts`** only serves the React build and its SPA fallback route when `NODE_ENV=production` — locally it does nothing, since Vite's dev server handles the frontend instead.
- **Database connection**: Heroku Postgres only sets `DATABASE_URL` (not the discrete `PGHOST`/`PGUSER`/etc. vars), so `api/app/config/db.ts` automatically falls into its `DATABASE_URL` branch on Heroku — no config needed there.

## Accessibility

Built to WCAG standards throughout: semantic HTML5 elements (no bare `<div>`s — `<article>`, `<section>`, `<fieldset>`, `<header>` are used for structural meaning), labeled form fields, visible focus rings, `aria-live` on the streaming trace panel so screen readers announce updates, and `prefers-reduced-motion` support.

## Design notes

Each accepted or dismissed review comment stays a suggestion the reviewer controls — the agent never silently applies its own findings. The live trace panel exists specifically so the reasoning behind a suggestion is inspectable, not just the final verdict.

**Why a fixed repo allowlist instead of free-text input:** this app uses one shared, server-side `GITHUB_TOKEN` (not per-user auth). Letting visitors type in *any* `owner/repo` would mean anyone could point that token at arbitrary — including private — repos it has access to, and run up API costs on your dime. `DEMO_REPOS` in `.env` constrains the deployed demo to a short, deliberate list; the dropdown in the UI reflects exactly what the server will allow. Locally with `DEMO_REPOS` unset, the restriction is off. A proper multi-tenant version of this app would replace the shared token with a GitHub App + OAuth flow, issuing short-lived, installation-scoped tokens per user instead.
