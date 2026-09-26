# Smart Resort 360 — Frontend Implementation Plan

> **Based on:** [design.md](./design.md) · [api.md](./api.md) · [prd.md](./prd.md)
>
> This plan translates the design spec into an ordered, phased build sequence.
> Each phase produces **shippable, demo-ready output** on its own.
> All P0 features are covered by Phase 4. P1 features are in Phase 5.

---

## Quick Reference

| Axis | Decision |
|---|---|
| Framework | **React + Vite** (existing project — do NOT migrate to Next.js) |
| Routing | `react-router-dom` (already installed) |
| Styling | Tailwind CSS v4 + inline styles for dashboard sections |
| Charts | SVG (custom) for hackathon speed; Recharts optional upgrade |
| Icons | `lucide-react` (already installed) |
| Auth | JWT in `localStorage` via existing `AuthContext` |
| Data | Mock data files → real API swap via `.env` flag |
| State | React context + local component state (no Redux) |

---

## Phase Overview

```
Phase 0 ── Foundation & Tokens         (1 session)
Phase 1 ── Shared Infrastructure       (1 session)
Phase 2 ── Manager Role [P0]           (2–3 sessions)
Phase 3 ── Operations Role [P0]        (2–3 sessions)
Phase 4 ── Guest Role [P0]             (1–2 sessions)
Phase 5 ── P1 Features & Polish        (1–2 sessions)
Phase 6 ── Integration & Demo Prep     (1 session)
```

**Current status:**
- ✅ Login page built (`/` + `/login`)
- ✅ Manager Dashboard built (`/manager/dashboard`) — mock data
- ✅ Sidebar component built
- ✅ Design tokens defined in `index.css`
- ⬜ Everything else below

---

## Phase 0 — Foundation & Tokens

> **Goal:** Establish the shared design system so every phase builds on the same base.
> **Do once. Touch rarely.**

### 0.1 Design Token Alignment

Update [`src/index.css`](../src/index.css) CSS variables to match design.md §10.1 exactly:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F8F6` | Page background |
| `--surface` | `#FFFFFF` | Cards |
| `--border` | `#E5EAE7` | Dividers |
| `--text` | `#17201C` | Primary text |
| `--text-muted` | `#66716C` | Secondary text |
| `--brand` | `#167A65` | Primary emerald |
| `--brand-soft` | `#DDEBE5` | Selected nav, chips |
| `--ai-accent` | `#5B63C7` | AI/forecast elements |
| `--ai-soft` | `#EEF0FB` | AI badges |
| `--risk-high` | `#C95C5C` | HIGH risk |
| `--risk-medium` | `#D89A32` | MEDIUM risk |
| `--risk-low` | `#3F8F70` | LOW risk |
| `--forecast-line` | `#5B63C7` | Dashed forecast lines |

### 0.2 Typography

In `index.html`, ensure both fonts load:

```html
<!-- Plus Jakarta Sans — headings -->
<!-- Inter — UI / body -->
```

Apply in `index.css`:
```css
h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
body            { font-family: 'Inter', sans-serif; }
```

### 0.3 Utility Classes

Add to `index.css`:

```css
.font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
.tabular-nums { font-variant-numeric: tabular-nums; }
```

### 0.4 Formatters — `src/lib/utils.js`

Create this file (design.md §10.4):

```js
export const formatPercent    = (v)  => `${Number(v).toFixed(1)}%`
export const formatProbability= (p)  => `${Math.round(p * 100)}%`
export const formatCurrency   = (n)  => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n)
export const formatDate       = (d, short=true) => new Date(d).toLocaleDateString('en-GB', short ? {day:'numeric', month:'short'} : {weekday:'short', day:'numeric', month:'short', year:'numeric'})
export const formatDelta      = (n)  => n >= 0 ? `↑${Math.abs(n)}%` : `↓${Math.abs(n)}%`
export const titleCaseEnum    = (e)  => e.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
```

### 0.5 Constants — `src/lib/constants.js`

```js
export const ROLES = { MANAGER: 'manager', OPS: 'data_entry', GUEST: 'guest' }

export const ROLE_HOME = {
  manager:    '/manager/dashboard',
  data_entry: '/operations/dashboard',
  guest:      '/guest/home',
}

export const NAV_ITEMS = {
  RESORT_MANAGER: [ ... ],  // see design.md §4.1
  OPERATIONS_MANAGER: [ ... ],
}
```

### 0.6 Mock Data Structure — `src/mocks/`

Create three files (one per role). Use the PRD §63 demo scenario:
- Rahul Sharma, 84% cancellation probability
- 95% occupancy peak on weekend
- 17 high-risk bookings
- Deluxe demand rising +18%

```
src/mocks/
  manager.js     ← KPIs, forecast, cancellation, room demand, recommendations
  operations.js  ← guest list, guest profile, cancellation risk
  guest.js       ← profile, bookings, preferences, chat responses
```

Each file exports named objects matching API response shapes from api.md.

**When `VITE_USE_MOCKS=true`** → `apiRequest()` resolves from mocks. No code changes needed to swap.

### 0.7 API Client — `src/lib/api.js`

```js
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export async function apiRequest(path, init = {}) {
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    return resolveMock(path);
  }
  const token = localStorage.getItem('resortToken');
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, ...body.error };
  return body;
}
```

---

## Phase 1 — Shared Infrastructure

> **Goal:** App shell, routing, auth guard — used by all three roles.

### 1.1 Router Restructure — `src/App.jsx`

```
/                         → redirect to role home or /login
/login                    → LoginPage (✅ done)
/forbidden                → ForbiddenPage (new)

/manager/*                → requires role=manager
/manager/dashboard        → ManagerDashboard (✅ done)
/manager/forecast         → ManagerForecast (Phase 2)
/manager/recommendations  → ManagerRecommendations (Phase 2)

/operations/*             → requires role=data_entry
/operations/dashboard     → OperationsDashboard (Phase 3)
/operations/guests        → GuestList (Phase 3)
/operations/guests/:id    → GuestProfile (Phase 3)
/operations/cancellations → CancellationRisk (Phase 3)

/guest/*                  → requires role=guest
/guest/home               → GuestHome (Phase 4)
/guest/concierge          → GuestConcierge (Phase 4)
/guest/profile            → GuestProfile (Phase 4)
```

### 1.2 Route Guard — `src/components/ProtectedRoute.jsx`

```jsx
export function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/forbidden" replace />;
  return children;
}
```

### 1.3 App Shell Components

| File | What it does |
|---|---|
| `src/components/layout/AppShell.jsx` | Wraps Sidebar + TopBar + main area for staff roles |
| `src/components/layout/GuestLayout.jsx` | Mobile-first wrapper with TopBar + BottomNav for guest role |
| `src/components/layout/TopBar.jsx` | Brand · Role badge · ML status pill · Avatar (extract from ManagerDashboard) |
| `src/components/layout/BottomNav.jsx` | Home / Concierge / Profile tabs (guest only) |
| `src/components/Sidebar.jsx` | ✅ Exists — refactor to accept `role` prop and load NAV_ITEMS from constants |

### 1.4 Shared UI Primitives — `src/components/ui/`

Create these small, reusable components (used across all screens):

| Component | Props | Notes |
|---|---|---|
| `Badge.jsx` | `variant` (risk-high/medium/low/ai/brand), `children` | Color by token |
| `RiskBadge.jsx` | `riskLevel`, `probability?` | Never color-only — always includes text |
| `Skeleton.jsx` | `width`, `height`, `className` | Animated shimmer |
| `EmptyState.jsx` | `message`, `action?` | Contextual empty screen |
| `ErrorState.jsx` | `section`, `onRetry` | Per-section error display |
| `PredictionUnavailable.jsx` | `compact?` | Shows "—" or full message |
| `ForecastTag.jsx` | `modelVersion?` | Small indigo badge: "FORECAST" |
| `Tooltip.jsx` | `content`, `children` | Hover + focus accessible |

### 1.5 Forbidden Page — `src/pages/ForbiddenPage.jsx`

Simple page: "You don't have access to this page." + button to navigate to the user's role home.

---

## Phase 2 — Manager Role [P0]

> **Goal:** Complete all three P0 Manager screens.
> Dashboard is already built. Build Forecast and Recommendations.

### 2.1 Manager Dashboard — DONE ✅

Already at `/manager/dashboard`. Remaining polish items:

- [ ] KPI cards: clicking "Predicted Occupancy" → navigates to `/manager/forecast`
- [ ] KPI cards: clicking "High Cancellation Risk" → `/manager/recommendations?category=CANCELLATION`
- [ ] KPI cards: clicking "AI Recommendations" → `/manager/recommendations`
- [ ] Replace hardcoded date with live `new Date()` using `formatDate()` util
- [ ] Add `Skeleton` loading states for chart and KPI sections
- [ ] Each chart section handles its own error independently (one failing chart doesn't break others)
- [ ] Refresh button: re-fetches all five API calls in parallel

### 2.2 Manager Forecast — `/manager/forecast`

**Design reference:** design.md §6.2

**Layout:**
```
[Horizon: 7d | 14d | 30d]  [Room type: All ▾]  (controls → URL query params)
──────────────────────────────────────────────────────
Occupancy Area Chart (large — dashed forecast, confidence band, 90% threshold line)
Peak label: "94.0% on Tue, 29 Sep"
──────────────────────────────────────────────────────
Booking Forecast Line Chart (actual vs forecast)
──────────────────────────────────────────────────────
Daily Table: Date | Predicted bookings | Predicted occupancy | vs 90% target
──────────────────────────────────────────────────────
Room Demand Bar Chart + table
──────────────────────────────────────────────────────
Footer: "Model: booking-xgb-v1 · Confidence 91%"
```

**Key rules (design.md §6.2):**
- Controls write to URL query params (`?days=14&roomType=DELUXE`) — view is shareable
- Room type selector is disabled with tooltip "Room-type forecast not available yet" (ML v1 limitation)
- Confidence footer hidden when `confidence === null`

**Files to create:**
```
src/pages/ManagerForecast.jsx
src/components/charts/OccupancyAreaChart.jsx  (if extracted)
src/components/charts/RoomDemandBarChart.jsx   (if extracted)
```

### 2.3 Manager Recommendations — `/manager/recommendations`

**Design reference:** design.md §6.3

**Layout:**
```
Filters: [New & Viewed ▾]  [Priority: All ▾]  [Category: All ▾]
─────────────────────────────────────────────────────────────────
RecommendationCard × N (sorted by priority)
─────────────────────────────────────────────────────────────────
Footer note: "Accepting marks a recommendation for action.
              The system never changes prices, bookings or staff automatically."
```

**Each card:**
```
● HIGH   OCCUPANCY                         Conf. 89%
Prepare for high occupancy

Why: Predicted occupancy is 95% on 2026-09-29.
Suggested: Review housekeeping, front-desk capacity.

▸ Supporting data    [Dismiss]  [Accept]
```

**Interaction rules:**
- When a card scrolls into view with `status === "NEW"` → PATCH status to "VIEWED" (fire-and-forget)
- Accept / Dismiss → optimistic update → PATCH → roll back on error
- Final state (ACCEPTED/DISMISSED): show status chip, hide buttons
- "Supporting data" expands to show `sourceData` as key/value list
- Filter values live in URL query params

**Files to create:**
```
src/pages/ManagerRecommendations.jsx
src/components/insights/RecommendationCard.jsx
src/components/insights/RecommendationFilters.jsx
```

---

## Phase 3 — Operations Role [P0]

> **Goal:** Build the four P0 Operations screens.
> Focus: guest-level detail, cancellation risk, and preparing staff for arrivals.

### 3.1 Operations Dashboard — `/operations/dashboard`

**Design reference:** design.md §7.1

**Question it answers:** *"Who is arriving, and what do I need to prepare?"*

**Layout:**
```
KPI Row (5 cards):
  Arrivals today  |  Departures today  |  In-house  |  Arrivals 7d  |  Special requests today

Lower row (2 columns):
  Cancellation risk distribution bar (High / Med / Low, clickable segments)
  |
  Today's arrivals table (HIGH risk first, compact, 10 rows, → View all guests)
```

**Files to create:**
```
src/pages/OperationsDashboard.jsx
src/components/charts/RiskDistributionBar.jsx
```

### 3.2 Guest List — `/operations/guests`

**Design reference:** design.md §7.2

**Layout:**
```
[🔍 Search name/email]  [Arrival date range]  [Risk ▾]  [Room type ▾]

Table columns:
  Guest  |  Room  |  Arrival  |  Top Preference  |  Cancellation Risk

Pagination: 20/page, ‹ 1 2 3 … ›
```

**Rules:**
- Debounce search 300ms
- All filters live in URL query params
- Cancel risk column is sortable
- `null` risk level → "—" badge with tooltip "Prediction unavailable"
- Row click → `/operations/guests/:guestId`

**Files to create:**
```
src/pages/GuestList.jsx
src/components/guests/GuestTable.jsx
src/components/guests/GuestFilters.jsx
```

### 3.3 Guest Profile — `/operations/guests/:guestId`

**Design reference:** design.md §7.3

**Question it answers:** *"What should staff know before this guest arrives?"*

**Layout (4 parallel API calls):**
```
← Guests

Rahul Sharma                          [● HIGH · 84% est. cancel.]
rahul.sharma@example.com · +91 ...

┌─────────────────────┬─────────────────────────────────────────┐
│ Current Booking      │ Cancellation Risk                       │
│ Deluxe · Room 214    │ [RiskGauge 84%]                         │
│ 28 Sep → 01 Oct      │ Estimated probability — not certain     │
│ 2 adults · Online TA │ Factors:                                │
│ ADR ₹8,500           │ • Long booking lead time (72 days)      │
│ Special: Late check- │ • Previous cancellation history (2)     │
│ in                   │ • Booking channel: Online TA            │
├─────────────────────┼─────────────────────────────────────────┤
│ Stored Preferences   │ Predicted Preferences  ✦ ML             │
│ Food: Vegetarian     │ Room: Deluxe  ████████▉ 91%             │
│ Room: Deluxe         │ Food: Veg.    █████████ 95%             │
│ Activity: Spa        │ (no activity prediction — ML v1)        │
├─────────────────────┴─────────────────────────────────────────┤
│ ✦ AI summary                                                   │
├──────────────────────────────────────────────────────────────-┤
│ Guest Stats: 3 visits · avg stay 3 nights · avg spend ₹12,500  │
├──────────────────────────────────────────────────────────────-┤
│ Activity History               │ Booking History               │
└────────────────────────────────┴───────────────────────────────┘
```

**Critical implementation notes:**
- Load all 4 endpoints in parallel
- Profile 404 → "Guest not found" with back link
- `predictionStatus === UNAVAILABLE` → use `PredictionUnavailable` component; don't show 0
- Preference `source` shown as chip: EXPLICIT="Stated", HISTORY="From history", PREDICTED="Predicted ✦"
- ML v1 only predicts ROOM and FOOD — do NOT pad missing activity predictions (design.md §7.3 decision C-08)
- Cancellation probability shown as "estimated" — always include that word or "est."

**Files to create:**
```
src/pages/GuestProfile.jsx
src/components/guests/GuestHeader.jsx
src/components/guests/CancellationRiskCard.jsx
src/components/guests/CurrentBookingCard.jsx
src/components/guests/PreferenceList.jsx
src/components/guests/PredictedPreferences.jsx
src/components/guests/BookingHistoryTable.jsx
src/components/charts/RiskGauge.jsx
```

### 3.4 Cancellation Risk — `/operations/cancellations`

**Design reference:** design.md §7.4

**Layout:**
```
Filters: [Risk: High ▾]  [Arrival range]

Table:
  Guest  |  Room  |  Arrival  |  Lead Time  |  Channel  |  Deposit  |  Prob.

Row expands: factors list
Guest name links to /operations/guests/:guestId
```

**Files to create:**
```
src/pages/CancellationRisk.jsx
src/components/guests/CancellationRiskTable.jsx
```

---

## Phase 4 — Guest Role [P0]

> **Goal:** Three P0 Guest screens. Mobile-first. No internal data exposed.
> The concierge chat is the hero feature.

### 4.1 Guest Home — `/guest/home`

**Design reference:** design.md §8.1

**Layout (mobile-first):**
```
Good evening, Rahul 👋
Your stay: Deluxe · 28 Sep → 01 Oct (3 nights)

💬 Ask the Concierge
"What can I do this evening?"         → /guest/concierge?q=...

Explore categories:
[Spa] [Pool] [Restaurants] [Activities] [Check-in] [FAQ]

ResortInfoCard list (filtered by category tap)
```

**Rules:**
- Greeting changes with time of day: Good morning (5–12) / afternoon (12–17) / evening (17–21) / night (21–5)
- Category chip tap → filters `GET /api/guest/resort-info?category=`
- Concierge shortcut prefills query on concierge page via `?q=` param

**Files to create:**
```
src/pages/GuestHome.jsx
src/components/concierge/ResortInfoCard.jsx
src/components/concierge/CategoryChips.jsx
```

### 4.2 AI Concierge — `/guest/concierge` ⭐ Hero Screen

**Design reference:** design.md §8.2

**Layout:**
```
✦ Resort Concierge
Personalised for you: [Spa chip] [Vegetarian chip] [Pool chip]

─── chat area ───────────────────────────────
  [AI bubble: Hi Rahul! Ask me about activities...]

              [Guest bubble: right-aligned]

  [AI grounded bubble]
  ✦ Based on: Spa, Pool              ← usedPreferences chips
  📄 Evening Spa Session             ← source chips
  📄 Pool Timings

  [● ● ●  typing indicator]
─────────────────────────────────────────────

[Relaxing evening?] [Dinner?] [Pool timings?]   ← suggested prompts
[ Type your question…              ] [➤]
```

**Interaction rules (all critical):**
- `POST /api/guest/chat` with `{ message, conversationId? }` — store `conversationId` from first reply
- Typing indicator while request in flight; send button disabled while in-flight or input empty
- Enter sends; Shift+Enter = newline
- Auto-scroll to newest message
- `?q=` param prefills and auto-sends the question
- **Grounded reply** (`grounded: true`): source chips clickable → bottom sheet with `ResortInfo`
- **Ungrounded reply** (`grounded: false`): muted bubble + ⓘ + "Contact front desk"
- `429` → "You're sending messages quickly — wait a moment"
- `503 AI_SERVICE_UNAVAILABLE` → "Concierge temporarily unavailable" + retry, guest message stays in input
- `role="log"` + `aria-live="polite"` on message list

**Files to create:**
```
src/pages/GuestConcierge.jsx
src/components/concierge/ChatWindow.jsx
src/components/concierge/ChatMessage.jsx
src/components/concierge/ChatInput.jsx
src/components/concierge/TypingIndicator.jsx
src/components/concierge/SuggestedPrompts.jsx
src/components/concierge/SourceChips.jsx
src/components/concierge/PreferenceChips.jsx
```

### 4.3 Guest Profile — `/guest/profile`

**Design reference:** design.md §8.3

**Layout:**
```
Details: name, email, phone, special requirements
My Preferences: chips with source label — NO confidence numbers shown to guest
My Stays: upcoming + past list
```

**Rules:**
- Never show confidence numbers or probability to guests (design.md §8 intro)
- Preference source shown as friendly label only (not "PREDICTED 78%")

**Files to create:**
```
src/pages/GuestProfilePage.jsx
```

---

## Phase 5 — P1 Features & Polish

> **Goal:** Fill P1 screens; audit accessibility; tighten loading states.
> Do after P0 is complete and demo-ready.

### 5.1 Manager Pricing — `/manager/pricing`

Table from `GET /api/manager/pricing-recommendations`:

| Room type | Current ADR | Suggested ADR | Change % | Predicted occupancy | Demand | Reason |

Header note: "Suggestions only — prices are not changed automatically."

### 5.2 Manager Sentiment — `/manager/sentiment`

- Stacked bar: sentiment breakdown (Positive / Neutral / Negative)
- Topic trend table: Topic | Negative share | Change | Trend arrow
- Average rating

### 5.3 Operations Staffing — `/operations/staffing`

Department table: Required | Available | Shortage. Shortage rows use `--risk-high` token.

### 5.4 Operations Service Requests — `/operations/requests`

List from `GET /api/operations/service-requests`. Status select → PATCH per request.

### 5.5 Guest Service Requests — `/guest/requests`

List from `GET /api/guest/service-requests` + "New request" form (type select + description).

### 5.6 Accessibility Audit

Go through every screen and verify:
- [ ] WCAG AA contrast for all text and badges
- [ ] Every interactive element keyboard-reachable with visible focus ring
- [ ] Every chart has `aria-label` summary + data table fallback on Forecast page
- [ ] Tooltips work on hover **and** focus
- [ ] Risk is never communicated by colour alone (always includes text label)
- [ ] Chat message list has `role="log"` and `aria-live="polite"`

### 5.7 Loading State Audit

Every data section must implement all states from design.md §11:

| State | Implementation |
|---|---|
| Loading | `Skeleton` matching section layout — no full-page spinners |
| Empty | `EmptyState` with context message + "Clear filters" action |
| Error | `ErrorState` with retry — other sections keep working |
| Prediction unavailable | `PredictionUnavailable` — show "—" not 0 |
| Stale | Data + small "Last updated {time}" warning chip |
| 401 | Clear token → `/login?next=` |
| 403 | → `/forbidden` |

---

## Phase 6 — Integration & Demo Prep

> **Goal:** Wire mock data to real backend, rehearse demo journeys, final polish.

### 6.1 Backend Integration

Replace mock data with real API calls:

1. Set `VITE_USE_MOCKS=false` in `.env`
2. Set `VITE_API_BASE_URL=http://localhost:3001`
3. Each API module (`manager-api.js`, `operations-api.js`, `guest-api.js`) calls real endpoints
4. Verify error handling: test 401/403/503 paths manually

### 6.2 Auth Flow Wiring

- Login → JWT stored in `localStorage`
- All API calls attach `Authorization: Bearer <token>` via `api.js`
- Role redirect: `RESORT_MANAGER → /manager/dashboard`, `OPERATIONS_MANAGER → /operations/dashboard`, `GUEST → /guest/home`
- 401 from any API → clear token → redirect to `/login?next=<path>`

### 6.3 Demo Journey Rehearsal (design.md §14)

Rehearse all three journeys with real data:

**Journey 1 — Resort Manager:**
1. Login as Resort Manager
2. Dashboard: point out KPIs (82%→87% forecast, 17 high-risk), occupancy crossing 90% line, AI insights
3. Click Predicted Occupancy → `/manager/forecast`: peak 94–95%
4. `/manager/recommendations` → open "Prepare for high occupancy" → Accept (note human-in-the-loop)

**Journey 2 — Operations Manager:**
1. Login as Operations → `/operations/dashboard`: 17 HIGH risk
2. `/operations/guests` → filter Risk = High → Rahul Sharma
3. `/operations/guests/g-101`: 84% *estimated* probability + factors + predicted Deluxe/Vegetarian/Spa + AI summary

**Journey 3 — Guest (Rahul Sharma):**
1. Login as Guest → `/guest/concierge`
2. Show personalisation chips: Spa · Vegetarian · Pool
3. Ask "What would you recommend for me this evening?" → grounded reply cites Evening Spa Session + Pool Timings
4. Ask "Is there a helipad?" → ungrounded fallback (hallucination guard demonstration)

### 6.4 Final Checks

- [ ] No `console.error` in browser DevTools during demo journeys
- [ ] No layout overflow on desktop (1440px) or mobile (375px)
- [ ] All routes respond (no blank pages or crashes)
- [ ] Demo buttons on login page route correctly for all three roles
- [ ] Backend + frontend both start cleanly in new terminal sessions
- [ ] `.env.example` committed with correct variable names

---

## File Creation Checklist

### Phase 0–1 (Foundation)
```
src/lib/utils.js                         ⬜
src/lib/constants.js                     ⬜
src/lib/api.js                           ⬜
src/mocks/manager.js                     ⬜
src/mocks/operations.js                  ⬜
src/mocks/guest.js                       ⬜
src/components/layout/AppShell.jsx       ⬜
src/components/layout/GuestLayout.jsx    ⬜
src/components/layout/TopBar.jsx         ⬜
src/components/layout/BottomNav.jsx      ⬜
src/components/ui/Badge.jsx              ⬜
src/components/ui/RiskBadge.jsx          ⬜
src/components/ui/Skeleton.jsx           ⬜
src/components/ui/EmptyState.jsx         ⬜
src/components/ui/ErrorState.jsx         ⬜
src/components/ui/PredictionUnavailable.jsx ⬜
src/components/ui/ForecastTag.jsx        ⬜
src/components/ui/Tooltip.jsx            ⬜
src/components/ProtectedRoute.jsx        ⬜
src/pages/ForbiddenPage.jsx              ⬜
```

### Phase 2 (Manager)
```
src/pages/ManagerForecast.jsx                   ⬜
src/pages/ManagerRecommendations.jsx            ⬜
src/components/insights/RecommendationCard.jsx  ⬜
src/components/insights/RecommendationFilters.jsx ⬜
```

### Phase 3 (Operations)
```
src/pages/OperationsDashboard.jsx               ⬜
src/pages/GuestList.jsx                         ⬜
src/pages/GuestProfile.jsx                      ⬜
src/pages/CancellationRisk.jsx                  ⬜
src/components/guests/GuestTable.jsx            ⬜
src/components/guests/GuestFilters.jsx          ⬜
src/components/guests/GuestHeader.jsx           ⬜
src/components/guests/CancellationRiskCard.jsx  ⬜
src/components/guests/CurrentBookingCard.jsx    ⬜
src/components/guests/PreferenceList.jsx        ⬜
src/components/guests/PredictedPreferences.jsx  ⬜
src/components/guests/BookingHistoryTable.jsx   ⬜
src/components/guests/CancellationRiskTable.jsx ⬜
src/components/charts/RiskDistributionBar.jsx   ⬜
src/components/charts/RiskGauge.jsx             ⬜
```

### Phase 4 (Guest)
```
src/pages/GuestHome.jsx                         ⬜
src/pages/GuestConcierge.jsx                    ⬜
src/pages/GuestProfilePage.jsx                  ⬜
src/components/concierge/ChatWindow.jsx         ⬜
src/components/concierge/ChatMessage.jsx        ⬜
src/components/concierge/ChatInput.jsx          ⬜
src/components/concierge/TypingIndicator.jsx    ⬜
src/components/concierge/SuggestedPrompts.jsx   ⬜
src/components/concierge/SourceChips.jsx        ⬜
src/components/concierge/PreferenceChips.jsx    ⬜
src/components/concierge/ResortInfoCard.jsx     ⬜
src/components/concierge/CategoryChips.jsx      ⬜
```

### Phase 5 (P1)
```
src/pages/ManagerPricing.jsx                    ⬜
src/pages/ManagerSentiment.jsx                  ⬜
src/pages/OperationsStaffing.jsx                ⬜
src/pages/OperationsRequests.jsx                ⬜
src/pages/GuestRequests.jsx                     ⬜
```

---

## Already Done ✅

| Item | File | Status |
|---|---|---|
| Login page | `src/pages/LoginPage.jsx` | ✅ Complete |
| Manager Dashboard | `src/pages/ManagerDashboard.jsx` | ✅ Complete |
| Sidebar | `src/components/Sidebar.jsx` | ✅ Complete |
| Mock data (manager) | `src/data/managerDashboardData.js` | ✅ Complete |
| Design tokens | `src/index.css` | ✅ Complete |
| Root `.gitignore` | `/.gitignore` | ✅ Fixed |
| Backend `.gitignore` | `/backend/.gitignore` | ✅ Created |
| Frontend `.gitignore` | `/frontend/.gitignore` | ✅ Fixed |
| ML service `.gitignore` | `/ml-service/.gitignore` | ✅ Fixed |
| Resort hero image | `/public/images/resort-hero.png` | ✅ Generated |

---

## Design Principles to Enforce Throughout

From design.md §1 — check these on every screen before marking complete:

1. **Role separation** — a user never sees another role's nav or data
2. **Probability, not certainty** — say "84% estimated", never "will cancel"
3. **Forecasts look like forecasts** — dashed line + "FORECAST" badge
4. **Humans decide** — buttons say "Accept" / "Dismiss", never "Apply" / "Execute"
5. **Explainable** — every recommendation: what happened → why → action → confidence
6. **Never fake data** — `predictionStatus: UNAVAILABLE` → show "—", never `0`
7. **Grounded concierge** — source chips on AI replies; ungrounded = distinct visual style
