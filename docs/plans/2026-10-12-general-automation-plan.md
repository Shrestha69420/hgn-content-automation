# Campaign Flow: general content automation (plan)

Decisions: Instagram-first, multi-brand, editable layered carousels, `gemini-3.1-flash-lite-image` for images (Nano Banana 2 Lite), local-folder export always on + Instagram Graph API (dev mode) as an optional publisher.

## 1. Gemini model map (verified against ai.google.dev/gemini-api/docs/models, 2026-10-12)

| Task | Model (env override) | Why |
|---|---|---|
| Trend / "what to post now" research | `gemini-3.8-flash` + Google Search grounding (`GEMINI_MODEL_RESEARCH`) | Stable, web access, returns source URLs |
| Concept, caption, slide copy (JSON) | `gemini-3.8-flash` (`GEMINI_MODEL_TEXT`) | Stable, structured output |
| Slide background images | `gemini-3.1-flash-lite-image` (`GEMINI_MODEL_IMAGE`) | Cheapest/fastest image model; backgrounds contain no text, so quality ceiling is fine |
| Higher-quality images (optional) | `gemini-nano-banana-2.1`, `gemini-3-pro-image` | Switch via env only |
| Quality score | none, deterministic code | Free, repeatable |

Not used: Imagen 4 (shut down), Gemini 2.5 family (legacy), Veo/Lyria (out of scope), `gemini-3-pro-preview` (shut down).
Search grounding is billed per search query beyond the monthly free allowance; ideas are fetched on demand only, never in a loop.

## 2. Product consolidation

8 modules → 4:
- **Overview**: queue, upcoming, recent exports.
- **Studio**: Ideas (web-grounded) → Concept + caption → Carousel editor → Score → Save/Approve/Schedule. Replaces Generator + Quality Scorer.
- **Library**: list + calendar toggle, export, publish. Replaces Library + Calendar + Campaigns.
- **Brands & Settings**: brand profiles (name, voice, audience, colors, hashtags, rules), publishing config status.
Removed: Analytics (fabricated numbers, no data source), Campaigns (a free-text label on the post is enough), HGN-specific scoring engine (805 lines) → generic scorer driven by the brand profile.

## 3. Data model
- `brands` table (profile above). `posts` table becomes `id, brand_id, status, scheduled_for, data JSON`; old tables renamed `legacy_*` (nothing is deleted).
- Post: title, caption, hashtags, cta, platform, designConcept, slides[] (background URL + text layers), score, publish log.

## 4. Publishing
- Scheduler tick (60 s) publishes due `Scheduled` posts.
- `PUBLISH_MODE=folder|instagram|both` (default `folder`).
- Folder: `exports/<YYYY-MM-DD>_<title-slug>/slide-01.png … + caption.txt`.
- Instagram: Graph API carousel flow (child containers → carousel container → media_publish). Works without Meta app review for your own Business/Creator account while the app is in development mode (add the account as Instagram Tester). Needs a public HTTPS `APP_URL` so Meta can fetch images (tunnel such as ngrok/cloudflared for local use). Not testable until credentials exist.
- Fallback if Meta stays blocked: Buffer API (free key, GraphQL) can be added as a third publisher behind the same interface.

## 5. Config
`config.ts` is the only place that reads env and defines model IDs. Secrets live in `.env.local` (gitignored); `.env.example` documents each variable once.

## 6. Order of work
1. config + .env.local, AI service, media/export/publish/scheduler, DB migration (server).
2. Types, API client, context, generic scorer.
3. Slide canvas renderer + editor, Studio, Library, Overview, Brands.
4. Rebrand copy (landing, login, html), delete dead modules, typecheck, run and test endpoints.
