# Smart Resort 360 — Full System Audit

## Summary
**Overall Status: ✅ SOLID for Hackathon Demo | ⚠️ Known Gaps Documented Below**

---

## Role 1: Resort Manager (RESORT_MANAGER)

### ✅ FULLY WORKING (Live Data from DB + ML)
| Feature | Endpoint | Data Source |
|---|---|---|
| Dashboard KPIs (Occupancy %, Revenue, Arrivals) | `GET /api/manager/dashboard` | PostgreSQL + ML |
| AI-Generated Insights ("Overbook by 2 rooms") | `GET /api/manager/dashboard` | InsightService |
| Top Recommendations (Approve/Reject) | `GET /api/manager/recommendations` | PostgreSQL |
| Patch Recommendation status | `PATCH /api/manager/recommendations/:id` | PostgreSQL |
| Booking Forecast (7/14/30 day chart) | `GET /api/manager/booking-forecast` | ML Service |
| Occupancy Forecast (7/14/30 day chart) | `GET /api/manager/occupancy-forecast` | ML Service → Cache |
| Cancellation Summary (Aggregate risk) | `GET /api/manager/cancellation-summary` | ML + DB |
| Room Demand by Type | `GET /api/manager/room-demand` | DB |

### ⚠️ MOCK DATA (Phase 2 — Not Live)
| Feature | Endpoint | Status |
|---|---|---|
| Dynamic Pricing Recommendations | `/manager/pricing-recommendations` | **Frontend Mock** |
| Guest Sentiment Analysis | `/manager/sentiment` | **Frontend Mock** |

> **Why:** These two require a separate NLP sentiment model and a pricing optimization algorithm. The backend routes don't exist yet. For the demo, the frontend intercepts these and returns mock data seamlessly.

---

## Role 2: Operations Manager (OPERATIONS_MANAGER)

### ✅ FULLY WORKING (Live Data from DB + ML)
| Feature | Endpoint | Data Source |
|---|---|---|
| Operations Dashboard KPIs | `GET /api/operations/dashboard` | PostgreSQL |
| Guest List with Search & Filter | `GET /api/operations/guests` | PostgreSQL |
| Individual Guest Profile (Full Detail) | `GET /api/operations/guests/:id` | PostgreSQL |
| Guest AI Predictions | `GET /api/operations/guests/:id/predictions` | ML Service |
| Cancellation Risk List (ML-Scored) | `GET /api/operations/cancellation-risk` | ML + PostgreSQL |

### ⚠️ MOCK DATA (Phase 2 — Not Live)
| Feature | Endpoint | Status |
|---|---|---|
| Staff Scheduling / Shift Allocation | `/operations/staffing` | **Frontend Mock** |
| Service Requests Board | `/operations/service-requests` | **Frontend Mock** |

> **Loophole Found:** The `OperationsRequests.jsx` page calls `/operations/service-requests` but no backend route or database table exists for service requests yet. The frontend mock covers this visually but it is not persisted. **A guest submitting a service request in the Guest Portal does not yet appear on the Operations board.** This is the most critical gap.

---

## Role 3: Guest (GUEST)

### ✅ FULLY WORKING (Live Data from DB)
| Feature | Endpoint | Data Source |
|---|---|---|
| Guest Profile & Current Stay | `GET /api/guest/profile` | PostgreSQL |
| Guest Preferences | `GET /api/guest/preferences` | PostgreSQL |
| Guest Booking History | `GET /api/guest/bookings` | PostgreSQL |
| Resort Info Catalog (Dining, Spa, etc.) | `GET /api/guest/resort-info` | PostgreSQL |
| AI Concierge Chat (RAG grounded) | `POST /api/guest/chat` | PostgreSQL + Gemini/Template |
| Personalized Offers (Decision Engine) | Frontend only | Guest Preferences |

### ⚠️ LOOPHOLE: Guest Chat Fallback
> When `LLM_API_KEY` is not set (current state), `aiService.js` falls back to `_generateTemplateReply()` which returns a simple one-liner from the DB source. **It works but is not conversational.** To make it truly interactive, set a real Gemini API key in `backend/.env`.

### ⚠️ LOOPHOLE: Guest Service Requests Not Persisted
> `GuestRequests.jsx` submits service requests **only to local React state** (in-memory). There is no `POST /api/guest/service-requests` backend endpoint. If the guest refreshes, their request is gone. It also does NOT appear on the Operations dashboard.

---

## Authentication & Security

### ✅ Solid
- JWT tokens verified on every protected route via `authenticate` middleware
- Role checked on every route via `requireRole` middleware
- `guestId` injection attack prevented via `rejectGuestIdInput` middleware
- Guests can ONLY see their own profile — scoped by `req.auth.guestId`
- AI Concierge is rate-limited (`chatLimiter`) to prevent spam

### ⚠️ Minor Gap
- The `public.routes.js` (Booking Site endpoint) has **NO rate limiting**. A malicious user could flood the DB with fake bookings. Easy fix: add `express-rate-limit`.

---

## Public Booking Site Flow

### ✅ Fully Working
- Guest creates booking → Node.js inserts to PostgreSQL
- Identity Resolution (Guest Matching) runs before insert
- Overwrites `previous_cancellations` with real DB history if guest is found
- ML scores the new booking when Operations dashboard refreshes

### ⚠️ Gap: No Email Confirmation
> After booking, the guest gets an in-browser "success" message but no email receipt. This requires a mail service like Nodemailer/SendGrid.

---

## Critical Fix Priorities (Before Demo)

| Priority | Issue | Fix Time |
|---|---|---|
| 🔴 HIGH | Guest Service Requests not persisted or linked to Ops board | ~45 min |
| 🟡 MEDIUM | Staffing/Sentiment pages use mock data only | ~2 hours each |
| 🟡 MEDIUM | Public bookings endpoint has no rate limiting | ~5 min |
| 🟢 LOW | Gemini API key not set → template fallback in chat | Add key in .env |
| 🟢 LOW | No email confirmation on booking | Skip for hackathon |
