# Campaign Flow: user flows

Setup: copy `.env.example` to `.env.local`, set `GEMINI_API_KEY`, run `npm run dev` (port 3000). Demo login: `demo@campaignflow.app` / `password123` (override with `DEMO_PASSWORD`).

## Modules
| Module | Purpose |
|---|---|
| Overview | Counts by status, upcoming scheduled posts, connection status (AI, folder export, Instagram). |
| Studio | Research, generate, edit, score, approve, schedule, publish. |
| Library | All posts of the active brand as a list or month calendar; edit, download PNGs, export, publish now, delete. |
| Brands | Brand profiles (voice, audience, region, keywords, colors, pillars, avoid list, hashtags, CTA, free-form "More information" facts). The header switcher picks the active brand. |

## Post types
| Type | Output | Platforms |
|---|---|---|
| Carousel | 2-10 swipeable slides | Instagram, Facebook, LinkedIn |
| Single image | 1 slide, headline + line | all |
| Quote card | 1 slide, large serif quote + attribution | all |
| Announcement | 1 slide, big accent headline + details | all |
| Text post | Caption only, no image | Facebook, LinkedIn, X |
| Link share | Caption + link, no image | Facebook, LinkedIn, X |
Instagram needs an image, so text and link posts are not offered there. Reels, Stories and video are not supported yet.

## Autosave
Edits (text, color, position, captions, hashtags) are mirrored to the browser's local storage within ~300 ms and synced to the server 2.5 s after the last change, sending only the fields that changed. Approved or scheduled posts also re-upload their final PNGs on slide edits so what publishes always matches the editor. If the server is unreachable the edits stay in the browser and are restored the next time the post is opened. The Studio header shows the save state.

## Studio flow
1. **Search the web**: Gemini (`GEMINI_MODEL_RESEARCH`, Google Search grounding) returns ideas with "why now", things to avoid right now, and source links.
2. Pick an idea (or type a topic) and **Generate post**: design concept, caption, hashtags, slide copy, suggested time (`GEMINI_MODEL_TEXT`).
3. **Generate image** per slide, or **All missing** (`GEMINI_MODEL_IMAGE`). Images are text-free backgrounds.
4. Edit: click a text block on the slide to select, drag to move, change text, size, font, color, alignment; add/remove/reorder slides; darken the image.
5. Quality panel scores the post (hook, length, hashtags, CTA, brand avoid-list, readability, slide count, text density, contrast).
6. Finish: **Save draft**, **Approve**, **Download PNGs**, **Save to folder**, **Schedule**, **Publish now**. Every save renders the slides in the browser and uploads the PNGs, so published files always match the editor.

## Publishing
`PUBLISH_MODE` in `.env.local`: `folder` (default), `instagram`, or `both`. A scheduler checks every minute for due `Scheduled` posts. A failed publish stays Scheduled (retried at most every 10 minutes) and the error shows on the post.
- **Folder**: `exports/<YYYY-MM-DD>_<title>/slide-01.png … + caption.txt`.
- **Instagram** (Graph API): needs `IG_USER_ID`, `IG_ACCESS_TOKEN`, and a public HTTPS `APP_URL` (Meta fetches the images from `/public-media/...`). Works for your own Business/Creator account with the Meta app in development mode (add the account as an Instagram Tester); no app review is needed for that. Untested against a live account.

## Brands
- **Fetch brand details**: enter the website and Gemini reads the page itself (URL context tool, no scraping on our server) and fills voice, audience, region, keywords, colors, hashtags, pillars and facts. Nothing is saved until you press Save.
- **Changes flow to assets**: slide colors reference the brand palette (`brand:primary|accent|background|text`), so a palette change restyles every post. On Save, unpublished posts also get the new default CTA, brand hashtags, name and handle swapped in, and their final PNGs are re-rendered so scheduled posts publish the updated look. Published posts are never touched.
- Colors picked with the custom swatch in Studio are fixed and do not follow the brand.

## Getting an Instagram token (your own account, no business verification)
You only need Meta's verification when *other people's* accounts connect to your app. Posting to your own account works in development mode:
1. Convert the Instagram account to **Business** or **Creator** (Instagram settings > Account type).
2. At developers.facebook.com create an app (type Business) and add the product **Instagram > API setup with Instagram login**.
3. Under that setup add your Instagram account as a **tester** (and accept the invite in Instagram: Settings > Apps and websites > Tester invites) if the dashboard asks for it.
4. Click **Generate token** next to the account. It needs the `instagram_business_basic` and `instagram_business_content_publish` permissions. The token is valid 60 days; refresh it before it expires (`GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<token>`).
5. Put `IG_USER_ID` (shown next to the token), `IG_ACCESS_TOKEN` and your public HTTPS `APP_URL` in `.env.local`, then set `PUBLISH_MODE=both` (or `instagram`).
If you use a Facebook-Login token instead, set `IG_API_HOST=https://graph.facebook.com`.
