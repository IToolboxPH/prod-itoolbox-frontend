# itoolbox-frontend

**Next.js 15 · React 19 · Tailwind — the web client for the IToolbox Platform.**

> One login, one dashboard, every tool.

## Tech stack

| | |
| --- | --- |
| **Framework** | Next.js 15 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4, shadcn/ui conventions, IToolbox brand tokens in `app/globals.css` |
| **Markdown** | `react-markdown` + `remark-gfm`, `@tailwindcss/typography` |
| **API contract** | Generated from `itoolbox-backend`'s OpenAPI schema via `openapi-typescript`; see [The API contract](#the-api-contract) |
| **Lint / types** | ESLint 9, `tsc --noEmit` |
| **Build / serve** | Static export (`next build` with `output: "export"`), served by nginx in Docker |

The backend (`itoolbox-backend`) is a separate FastAPI service — this repo only
talks to it over HTTP, through the generated types.

**Status (5 November 2026):**

- Live on the host at port 3100; the team opens it at <https://itoolbox.taildc9975.ts.net> over Tailscale, as itoolbox-backend's [user guide](https://github.com/IToolboxPH/itoolbox-backend/blob/main/docs/USER_GUIDE.md) explains.
- `/` is IToolbox's company page: the tagline, BantAI as the flagship, then products, about, mission and vision, team, partners and contact, carried over from the company site.
- `/bantai` answers questions about IToolbox, and questions about five connected data sources with cited evidence, on NVIDIA Nemotron.
- `/autonomous` and `/intelligence` describe the next two pillars.
- The model picker also lists Nemotron via Meterless, which works while Meterless Nightshift runs on the host, and GPT, Grok and Claude, which need a key or credits, as itoolbox-backend's README explains.

## Layout

The UI has a company landing page, a sign-in portal that previews each module, a
dashboard, and one workspace per module. The heart of it is BantAI, IToolbox's AI
chat assistant, and its three pillars: the AI knowledge base and conversational
agent (`bantai/`), intelligent workflow automation (`autonomous/`), and strategic
intelligence with predictive insights and automated reports (`intelligence/`). Every module's
name, tagline, colour, icon and route comes from `lib/platform-apps.ts`, so the
landing carousel, ticker, hamburger menus and dashboard cards stay in step. The
company's own content (products, team, partners, mission and the rest) is in
`lib/company.ts`; edit it there to change the landing page.

```text
app/
  page.tsx                Landing: company hero, BantAI, module carousel, company sections
  (auth)/login/           Sign-in portal with a preview page per module
  dashboard/              Module cards and your recent BantAI investigations
  account/                Account Profile: ID badge, details, change password
  bantai/                 Ask BantAI: the investigating agent (/bantai?id=… replays a run)
  autonomous/             BantAI Intelligent Workflow Automation: storm response first
  intelligence/           BantAI Strategic Intelligence; sources/ browses Zetaris
  tracker/                Project Management (sub-apps planned; no backend routes yet)
  security-settings/      Admin: users, roles, access matrix
  docs/  support/
  agent/  sources/        Redirects from the old routes
components/
  agent/                  Model picker, investigation trail, evidence, answer
  landing/                The landing page's company sections and footer
  bantai-widget.tsx       Floating Ask BantAI launcher on module pages
  ui/                     shadcn/ui primitives
lib/
  company.ts              The company's content for the landing page
  platform-apps.ts        The module list, and who may open each module
  nav.ts                  Each module's sub-pages
  api-client.ts           Typed client for every backend route
  sse.ts                  Reads the agent's server-sent event stream
  auth.ts                 Token storage, apiUrl()
packages/ui/            Shared API contract
  types/
    api.gen.ts            GENERATED — do not edit
    index.ts              Curated aliases over the generated schemas
```

## Running locally

**Development** — Next dev server with hot reload, on port 3100. `next.config.ts`
disables static export whenever `NODE_ENV !== production` and proxies `/api/*`
to `NEXT_PUBLIC_LOCAL_API` (default `http://localhost:8100`):

```bash
npm install && npm run dev        # → localhost:3100
```

**Container** — the same static export, served by nginx:

```bash
(cd ../itoolbox-backend && docker compose up -d)   # api :8100
docker compose up --build -d                       # → localhost:3100
```

`NEXT_PUBLIC_*` values are baked in at **build** time by the static export, so
changing which backend the site talks to needs a rebuild, not a restart. Left
unset, the site calls the API on port 8100 of the scheme and host that served the
page, so one build works at `http://localhost:3100` and at the host's Tailscale
link. To run the dev server on your own machine against the host's API over
Tailscale, set it:

```bash
NEXT_PUBLIC_API_URL=https://itoolbox.taildc9975.ts.net:8100 npm run dev
```

Copy `.env.example` to `.env.local` first. Only `NEXT_PUBLIC_*` values belong in
this repo — they ship to the browser. Model API keys, the JWT secret and the
Zetaris credentials live in `itoolbox-backend`, never here.

## Staging and production

Production is the main checkout, with no `.env`: every default in `compose.yaml` is
what runs today. Staging is a second checkout of this repo, on the `staging` branch,
at `C:\IToolbox\staging\itoolbox-frontend`. Its `.env` (copied from
`.env.staging.example`) gives it its own project, container, image and port (3110),
its own API port (8110), and a **STAGING** label in the corner of every page, so both
run on the host at once and can't be mistaken for each other. Start either with
`server-setup\itoolbox-stack.ps1`. How a change moves from staging to production, and
the Tailscale links, are in itoolbox-backend's
[docs/ENVIRONMENTS.md](https://github.com/IToolboxPH/itoolbox-backend/blob/main/docs/ENVIRONMENTS.md).

## The BantAI page

`POST /api/v1/agent/ask` streams the investigation as server-sent events.
`lib/sse.ts` reads them with `fetch` (EventSource can't POST or send the
Authorization header), and `components/agent/investigation.ts` folds each event
into the view. The same reducer replays a stored investigation from
`GET /api/v1/agent/investigations/{id}`, so a past run renders exactly as it did
live, and a `/bantai?id=…` link opens it for its owner and admins. `/bantai?q=…` starts an
investigation; the floating widget and the sign-in portal hand questions over
that way.

Every model in the picker is a real LLM: NVIDIA Nemotron (direct, or routed
through Meterless Nightshift), OpenAI GPT, xAI Grok and Anthropic Claude. A model
without credentials on the server stays listed as "(not configured)".

## The API contract

`packages/ui/types/api.gen.ts` is generated from `itoolbox-backend`'s committed
OpenAPI schema and is checked in, so this repo builds without the backend
present.

```bash
npm install
npm run gen:types        # reads ../itoolbox-backend/contract/openapi.api.json
```

Override the location with `ITOOLBOX_CONTRACT_DIR` if your `itoolbox-backend`
checkout isn't a sibling directory.

Regenerate whenever the backend changes a route or response model. On the
backend side, `python scripts/export_openapi.py --check` fails CI when the
committed schema has gone stale.

`index.ts` puts stable, domain-meaningful names on the generated schemas —
`DataSource` rather than FastAPI's `SourceOut`. Edit that file freely; never edit
`api.gen.ts`.
