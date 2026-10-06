# HGN Marketing Hub: user flows

Each flow was exercised against the running app (Express + Vite on :3000, SQLite backend) on 2026-10-06. State is mirrored in `localStorage` and SQLite via `apiService`.

## 1. Landing and authentication
| When the user... | Then... |
|---|---|
| Opens the app signed out | Landing page renders (`App.tsx`: not authenticated, or `activeModule === 'landing'`). |
| Clicks **Sign in** or **Launch Platform** | Login modal opens with demo credentials pre-filled. |
| Clicks **Sign In** with valid credentials | `POST /api/auth/login`; the session goes to `localStorage` (`hgn_logged_in_user`); the Overview dashboard opens. |
| Enters wrong credentials | "Invalid email or password." |
| Switches to **Create account** | Register form; empty fields or mismatched passwords give an inline error; a duplicate email is rejected by the server. |
| Server unreachable | Login/register fall back to `localStorage` accounts. |
| Clicks the sign-out icon (Header) | Session cleared, toast, landing page. |
| Clicks **Landing Page** (Header) or **Product Landing** (Sidebar) | `activeModule = 'landing'`. |

## 2. Navigation
| Sidebar item / mobile tab | Opens |
|---|---|
| Overview / Home | Safety Operations & Publishing Hub |
| Campaigns | Safety Campaigns & Objectives |
| AI Generator / Draft | Marketing Content Generator |
| Quality Scorer / Quality | Deterministic Quality Evaluator |
| Content Library / Library | Content Library & Repository |
| Editorial Calendar / Calendar | Editorial & Publishing Calendar |
| Analytics | Performance & Reach Analytics |
| Settings | Settings & Platform Profile |

Header logo goes to Overview. **New Post Draft** goes to AI Generator.

## 3. Generate, score, save
1. Click a **preset**: all form fields fill and a toast confirms.
2. Click **Generate Content**: `POST /api/generate-content`. Gemini is used if `GEMINI_API_KEY` is set; otherwise the local fallback engine answers. The title, body, CTA and hashtags become editable and a score toast appears.
3. **Analyze** re-scores the edited text. **Copy** copies it to the clipboard.
4. **Send to Evaluator** sets the working draft and opens Quality Scorer.
5. **Save to Library** creates the post (`Approved` if the score is 75 or more, else `Draft`) in state and `POST /api/posts`.

## 4. Quality Scorer
Platform tabs and the **+ Append CTA / Brand Tag / Keyword / Standard Hashtags** helpers edit the draft and re-score it live. **Copy**, **Save to Library** and **Schedule** are available. Schedule opens a datetime picker; **Confirm Schedule** calls `POST /api/posts/:id/schedule`.

## 5. Content Library
- Status chips (All, Draft, Approved, Scheduled, Published) filter the list.
- Search filters by title, body, campaign or hashtags; an empty result says "No matching posts found".
- **Publish** sets the status to Published (`POST /api/posts/:id/publish`) and the button disappears. It only changes a status; nothing is sent to a social network.
- **Delete post** removes the post from state and SQLite.
- **View Full Post**, **Copy Text** and **Inspect** open the detail, copy and quality views.

## 6. Campaigns
**New Campaign** opens a form. **Save Campaign** creates it: toast, `POST /api/campaigns`, form closes. Season chips filter. Cards offer **Draft Post**.

## 7. Calendar, Analytics, Settings
- Calendar: Month and Agenda views, previous/next month, platform filters, **Draft Post**. Scheduled posts appear on their date.
- Analytics and Overview: read-only aggregates.
- Settings: **Save Configuration** writes to SQLite ("Settings saved to SQLite database."). **Reset to Defaults** resets the data to the seed.

## Known behavior to be aware of
- Generator and Library use two different scoring engines, so the same draft can show different scores. Observed during testing: 20/100 in the Generator versus 60/100 in the Library.
- Mutations are optimistic: the UI updates first, and a failed API call is only logged.
