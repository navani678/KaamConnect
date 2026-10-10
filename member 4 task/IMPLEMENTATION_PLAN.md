# KaamConnect AI — Implementation Plan for Antigravity (Team of 4)

> **Tagline:** Find the Right Worker. Near You. At the Right Price.
> **Goal:** Ship a working end-to-end prototype in the hackathon:
> **Customer posts a job → nearby workers are matched and ranked → customer compares → sends booking request → worker accepts / rejects / counters → both confirm.**

---

## 0. How to use this document

1. **Everyone reads Sections 1–7** (shared rules, architecture, data models, API contract, matching spec). These are the **contract**. If you change the contract, tell the team first.
2. **Then each person jumps to their own section** (Section 8 = Member 1, 9 = Member 2, 10 = Member 3, 11 = Member 4).
3. Each member section ends with a **"Paste this into Antigravity"** prompt. When you open Antigravity, say who you are, and paste that prompt. Antigravity must then do **only your tasks**.
4. **Never edit files owned by another member.** If you need a change, ask the owner (or open a GitHub issue).

> Antigravity note: features/menu names change between versions. Use **Planning mode** for big tasks (so it produces a task list + implementation plan artifact you can review) and **Fast mode** for small edits. Use the **Agent Manager** to run one agent per big task. Always review the generated plan before approving it.

---

## 1. Team roles at a glance

| Member | Role | Owns (folders/files) | One-line job |
|---|---|---|---|
| **Member 1** | Frontend | `client/src/pages`, `components`, `routes`, `styles`, `mocks` | Every screen the user sees |
| **Member 2** | Backend (APIs) | `server/src/routes`, `controllers`, `middleware`, `models/User.js`, `services/upload*`, `utils` | Auth, jobs, bookings, reviews, reports, uploads |
| **Member 3** | Database + Matching | `server/src/models/*` (except User), `services/matching/*`, `services/geo*`, `seed/*`, worker search & profile APIs | Data models, geo search, ranking engine, seed data |
| **Member 4** | Integration, QA, DevOps, Docs | repo root, `docs/`, `client/src/i18n/*`, `tests/*`, `.github`, deployment, README | Scaffold, glue, testing, i18n, deploy, demo, submission |

### Workload balance (so nobody is idle)
- M1: ~12 screens, API integration, maps UI.
- M2: ~25 endpoints + auth + booking state machine.
- M3: 6 models, matching engine, geo queries, ~8 worker endpoints, seed data, unit tests.
- M4: scaffold, translations (EN/HI/TE), E2E tests, CI, deploy, demo, docs, plus stretch features.

---

## 2. Shared tech stack and versions

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite, React Router v6, Tailwind CSS, Axios, react-hook-form, react-leaflet + Leaflet + OpenStreetMap tiles, react-i18next |
| Backend | Node.js 20, Express 4, Mongoose, JWT (jsonwebtoken), bcryptjs, zod (validation), multer (uploads), helmet, cors, morgan, express-rate-limit |
| DB | MongoDB Atlas (free M0), `2dsphere` geo indexes |
| Storage | Cloudinary free tier (primary). Fallback: local `server/uploads/` served statically |
| Testing | Jest + supertest (backend), Vitest (matching unit tests), manual E2E checklist, optional Playwright / Antigravity browser agent |
| Deploy | Frontend: Vercel/Netlify. Backend: Render/Railway. DB: Atlas |
| VCS | GitHub, branches described in Section 3 |

---

## 3. Repository, branching and ownership rules

### 3.1 Folder structure (Member 4 creates this in Phase 0)

```
kaamconnect-ai/
├── AGENTS.md                      # shared rules for Antigravity (Section 3.4)
├── README.md
├── .gitignore
├── .env.example                   # root notes only
├── docs/
│   ├── api-contract.md            # copy of Section 5
│   ├── data-models.md             # copy of Section 4
│   ├── matching-spec.md           # copy of Section 6
│   ├── test-plan.md
│   └── demo-script.md
├── client/                        # React + Vite
│   ├── .env.example               # VITE_API_URL=http://localhost:5000/api
│   └── src/
│       ├── api/                   # axios instance + one file per resource (M1)
│       ├── components/            # reusable UI (M1)
│       ├── pages/                 # screens (M1)
│       ├── routes/                # router + guards (M1)
│       ├── context/               # AuthContext (M1)
│       ├── mocks/                 # mock data for offline dev (M1)
│       ├── i18n/                  # en.json hi.json te.json + config (M4)
│       └── main.jsx
├── server/
│   ├── .env.example
│   └── src/
│       ├── app.js                 # express app (M4 scaffolds; M2 owns after)
│       ├── server.js              # connects DB + listens
│       ├── config/                # env, db, cloudinary
│       ├── models/                # Mongoose models (User=M2, rest=M3)
│       ├── routes/                # M2 (and M3 for worker/match routes)
│       ├── controllers/
│       ├── middleware/            # auth, validate, error, upload (M2)
│       ├── services/
│       │   ├── matching/          # M3
│       │   ├── geo.js             # M3
│       │   └── upload.js          # M2
│       ├── seed/                  # M3
│       └── utils/                 # ApiError, asyncHandler, response helpers (M2)
└── tests/
    ├── e2e-checklist.md           # M4
    ├── postman/                   # M4
    └── api/                       # supertest integration tests (M4)
```

### 3.2 Branching

- `main` — always demo-ready. Only **Member 4** merges into `main`.
- `dev` — integration branch. PRs from feature branches go here.
- Feature branches: `m1/<feature>`, `m2/<feature>`, `m3/<feature>`, `m4/<feature>` (e.g. `m2/booking-state-machine`).
- Commit often. Small PRs. Pull `dev` at least every 2 hours.
- Commit message format: `feat(m2): add booking accept endpoint`.

### 3.3 Conflict-avoidance rules

1. A file has **one owner** (table in Section 1). Don't touch others' files.
2. Shared config files (`package.json`, `app.js`): the owner announces in the group chat before adding dependencies/routes.
3. Route registration in `server/src/routes/index.js`: **each member adds only their own line**; keep it alphabetical to avoid merge conflicts.
4. Never commit `.env` or real secrets. Use `.env.example`.

### 3.4 `AGENTS.md` (put at repo root; Member 4 creates it, everyone's Antigravity reads it)

```markdown
# Rules for any AI agent working on KaamConnect AI

- This is a 4-person project. The user will tell you which member they are (Member 1/2/3/4).
- Work ONLY on that member's tasks and files, as defined in docs/ and IMPLEMENTATION_PLAN.md.
- Never modify files owned by another member. If a change is needed there, stop and tell the user.
- Follow docs/api-contract.md EXACTLY (paths, field names, response envelope, status codes).
- Follow docs/data-models.md EXACTLY (field names, enums).
- Response envelope: success -> { "success": true, "data": ... }; error -> { "success": false, "error": { "code": "...", "message": "...", "fields": {...} } }.
- All coordinates are GeoJSON order: [longitude, latitude].
- Distances are in kilometres. Currency is INR (₹), stored as integers.
- Code style: ES modules, async/await, 2-space indent, no unused code, small functions, comments for non-obvious logic.
- Validate every request body with zod. Never trust client input.
- Never hard-code secrets. Read from process.env / import.meta.env.
- Before finishing a task: run the app/tests, fix errors, and summarise what changed.
```

---

## 4. Data models (the database contract)

All timestamps via Mongoose `{ timestamps: true }`. IDs are Mongo `ObjectId`.

### 4.1 Enums (shared)

```js
PROFESSIONS = ["electrician","plumber","carpenter","painter","mason",
               "tiles_flooring","welder","roofer","house_cleaning","construction_labourer"]
ROLES = ["customer","worker","admin"]
RATE_TYPES = ["hourly","daily","project"]
JOB_STATUS = ["open","booked","completed","cancelled"]
BOOKING_STATUS = ["pending","countered","accepted","rejected","cancelled","completed"]
TIME_SLOTS = ["morning","afternoon","evening","anytime"]
LANGUAGES = ["en","hi","te","ur","ta","kn","mr"]   // UI languages only en/hi/te in v1
WEEKDAYS = ["mon","tue","wed","thu","fri","sat","sun"]
```

### 4.2 `User` (owner: Member 2)

| Field | Type | Notes |
|---|---|---|
| name | String, required | |
| email | String, unique, lowercase | |
| phone | String, required | 10-digit Indian mobile |
| passwordHash | String, `select:false` | bcrypt |
| role | enum ROLES | `customer` or `worker` at signup |
| language | enum LANGUAGES, default `en` | UI language |
| avatarUrl | String | optional |

### 4.3 `WorkerProfile` (owner: Member 3)

| Field | Type | Notes |
|---|---|---|
| user | ObjectId → User, unique, required | |
| professions | [enum PROFESSIONS], min 1 | |
| specializations | [String] | e.g. `["wiring","fan installation","MCB"]` |
| bio | String (≤500) | |
| experienceYears | Number ≥0 | |
| rateType | enum RATE_TYPES | |
| rate | Number (₹) | per hour / day / project baseline |
| serviceRadiusKm | Number, default 15 | worker's max travel |
| location | `{ type:"Point", coordinates:[lng,lat] }` | **`2dsphere` index** |
| addressText | String | area/locality text |
| availability | `{ weeklyDays:[WEEKDAYS], slots:[TIME_SLOTS], unavailableDates:[Date], isAvailableNow:Boolean }` | |
| languages | [String] | e.g. `["te","hi","en"]` |
| portfolio | `[{ url, caption, type:"image"|"video" }]` | |
| certifications | `[{ title, issuer, year, documentUrl }]` | |
| verification | `{ idVerified:Boolean, verifiedAt:Date }` | v1: admin/seed sets it |
| ratingAvg | Number default 0 | updated on review |
| ratingCount | Number default 0 | |
| completedJobs | Number default 0 | |
| isActive | Boolean default true | |

Indexes: `{ location: "2dsphere" }`, `{ professions: 1 }`, `{ isActive: 1 }`.

### 4.4 `JobRequest` (owner: Member 3)

| Field | Type | Notes |
|---|---|---|
| customer | ObjectId → User | |
| profession | enum PROFESSIONS | the main worker type needed |
| title | String | short summary |
| description | String (≤2000) | |
| media | `[{ url, type:"image"|"video" }]` | max 6 |
| location | GeoJSON Point `[lng,lat]` | work site; `2dsphere` |
| addressText | String | |
| budgetMin / budgetMax | Number (₹) | |
| preferredDate | Date | |
| preferredTimeSlot | enum TIME_SLOTS | |
| estimatedDuration | `{ value:Number, unit:"hours"|"days" }` | |
| status | enum JOB_STATUS, default `open` | |
| selectedBooking | ObjectId → Booking | set when booking accepted |

### 4.5 `Booking` (owner: Member 3)

| Field | Type | Notes |
|---|---|---|
| job | ObjectId → JobRequest | |
| customer | ObjectId → User | |
| worker | ObjectId → User | (the worker's **User id**, not profile id) |
| workerProfile | ObjectId → WorkerProfile | |
| scope | String | agreed work scope |
| proposedPrice | Number | customer's offer |
| finalPrice | Number | set on acceptance |
| scheduledDate | Date | |
| timeSlot | enum TIME_SLOTS | |
| negotiation | `[{ by:"customer"|"worker", price:Number, message:String, at:Date }]` | audit trail |
| status | enum BOOKING_STATUS, default `pending` | |
| rejectionReason | String | |
| completedAt | Date | |

Index: `{ worker:1, status:1 }`, `{ customer:1, status:1 }`.

### 4.6 `Review` (owner: Member 3)

`booking` (unique), `customer`, `worker` (User ids), `workerProfile`, `rating` (1–5), `comment` (≤500).

### 4.7 `Report` (owner: Member 3)

`booking`, `reporter` (User), `against` (User), `reason` (enum: `misconduct`,`no_show`,`overcharging`,`poor_quality`,`safety`,`other`), `details`, `status` (`open`|`reviewed`|`closed`, default `open`).

---

## 5. API contract (Member 2 + Member 3 implement; Member 1 consumes; Member 4 tests)

**Base URL:** `http://localhost:5000/api`
**Auth:** `Authorization: Bearer <JWT>` (JWT payload: `{ id, role }`, expiry 7d).
**Envelope:** see Section 3.4. **Status codes:** 200, 201, 400 (validation), 401, 403, 404, 409 (state conflict), 500.
**Pagination:** `?page=1&limit=10` → `data: { items:[], page, limit, total }`.

### 5.1 Auth (M2)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/register` | `{name,email,phone,password,role,language}` | `{token,user}` |
| POST | `/auth/login` | `{email,password}` | `{token,user}` |
| GET | `/auth/me` | — | `{user}` (+ `workerProfile` if worker) |
| PATCH | `/auth/me` | `{name?,phone?,language?}` | `{user}` |

### 5.2 Uploads (M2)

| POST | `/uploads` | multipart, field `files` (max 6, jpg/png/webp/mp4, ≤10MB each) | `{ files:[{url,type}] }` |
|---|---|---|---|

### 5.3 Worker profile + discovery (M3)

| Method | Path | Notes |
|---|---|---|
| PUT | `/workers/me` | Worker only. Create-or-update own profile. Body = editable WorkerProfile fields; `location` sent as `{lat,lng}` and converted server-side |
| GET | `/workers/me` | Worker only |
| POST | `/workers/me/portfolio` | Body `{url,caption,type}` (URL from `/uploads`) |
| DELETE | `/workers/me/portfolio/:itemId` | |
| PATCH | `/workers/me/availability` | Body = `availability` object |
| GET | `/workers/:id` | Public profile + last 5 reviews (`:id` = WorkerProfile id) |
| GET | `/workers/:id/reviews` | Paginated reviews |
| GET | `/workers` | **Browse/filter** — query: `profession, lat, lng, maxDistanceKm(default 15), minRate, maxRate, minExperience, minRating, language, date, sort(distance\|rating\|price\|experience), page, limit`. Each item includes `distanceKm` |
| GET | `/jobs/:id/matches` | **Ranked matches for a job** (Section 6). Customer who owns job only. Query: `maxDistanceKm, limit` |

Match item shape:

```json
{
  "workerProfileId": "…", "userId": "…", "name": "Ravi Kumar",
  "professions": ["electrician"], "specializations": ["wiring","fans"],
  "experienceYears": 6, "ratingAvg": 4.6, "ratingCount": 23,
  "rateType": "daily", "rate": 900, "estimatedQuote": 4000,
  "distanceKm": 2.5, "availableOnDate": true,
  "verified": true, "portfolioPreview": ["url1","url2"],
  "score": 87.4,
  "breakdown": { "skill": 28, "distance": 22, "price": 20, "availability": 15, "reputation": 8.4 },
  "explanation": "Matches your required skills, is 2.5 km away, is available on Saturday and has quoted ₹4,000, within your budget."
}
```

### 5.4 Jobs (M2 implements routes/controllers; uses M3's `JobRequest` model)

| Method | Path | Notes |
|---|---|---|
| POST | `/jobs` | Customer. Body: `{profession,title,description,media[],location:{lat,lng},addressText,budgetMin,budgetMax,preferredDate,preferredTimeSlot,estimatedDuration}` |
| GET | `/jobs/mine` | Customer's jobs, filter `?status=` |
| GET | `/jobs/:id` | Owner customer, or a worker who has a booking on it |
| PATCH | `/jobs/:id` | Owner, only while `open`. Can edit fields or set `status:"cancelled"` |

### 5.5 Bookings (M2)

| Method | Path | Actor | Effect |
|---|---|---|---|
| POST | `/bookings` | customer | Body `{jobId,workerProfileId,proposedPrice,scheduledDate,timeSlot,scope,message}` → status `pending`. 409 if same job+worker already has an active booking |
| GET | `/bookings/mine` | both | `?status=`, returns bookings for the logged-in user (as customer or as worker) with populated job + counterpart info |
| GET | `/bookings/:id` | participant | Full detail incl. negotiation |
| POST | `/bookings/:id/accept` | worker | `pending`→`accepted`, `finalPrice=proposedPrice`; job→`booked` |
| POST | `/bookings/:id/reject` | worker | Body `{reason?}` → `rejected` |
| POST | `/bookings/:id/counter` | worker | Body `{price,message?}` → `countered`; append negotiation |
| POST | `/bookings/:id/confirm` | customer | Only when `countered`: `finalPrice = latest counter`, → `accepted`; job→`booked` |
| POST | `/bookings/:id/decline-counter` | customer | `countered`→`cancelled` |
| POST | `/bookings/:id/cancel` | customer | From `pending`/`accepted` → `cancelled` |
| POST | `/bookings/:id/complete` | customer | `accepted`→`completed`; job→`completed`; worker `completedJobs++` |

**State machine (M2 must enforce; invalid transitions → 409):**

```
pending ──accept──────────────▶ accepted ──complete──▶ completed
   │                               ▲  │
   ├──reject───▶ rejected          │  └──cancel──▶ cancelled
   ├──cancel───▶ cancelled         │
   └──counter──▶ countered ──confirm┘
                    └──decline-counter──▶ cancelled
```

### 5.6 Reviews and reports (M2 routes, M3 models)

| Method | Path | Notes |
|---|---|---|
| POST | `/reviews` | Customer, only for own `completed` booking, once. Body `{bookingId,rating,comment}`. Then recompute worker's `ratingAvg/ratingCount` |
| POST | `/reports` | Either participant. Body `{bookingId,reason,details}` |

### 5.7 Misc (M2)

`GET /health` → `{ status:"ok", time }`. `GET /meta/professions` → list of professions with labels (used by M1 dropdowns).

---

## 6. Matching spec (Member 3 implements; everyone should understand)

**Input:** a `JobRequest`. **Output:** ranked list with `score`, `breakdown`, `explanation`.

### 6.1 Hard filters (must pass)
1. `WorkerProfile.isActive == true`
2. `professions` contains `job.profession`
3. Within `maxDistanceKm` of job (default 15) **and** within worker's own `serviceRadiusKm`
4. Not already `rejected`/`cancelled` for this job (optional)

Use MongoDB `$geoNear` aggregation on `location` (2dsphere) with `distanceField:"distanceMeters"`, `spherical:true`.

### 6.2 Scoring (total 100)

| Factor | Weight | Formula |
|---|---|---|
| **Skill** | 30 | Base 20 for profession match. +up to 10 by keyword overlap between job title/description and worker `specializations` (`min(10, overlapCount*4)`) |
| **Distance** | 25 | `25 * max(0, 1 - d/maxDistanceKm)` |
| **Price** | 20 | `estimatedQuote` vs budget. In range → 20. Below min → 20. Above max → `20 * max(0, 1 - (quote-max)/max)`. No budget given → 10 |
| **Availability** | 15 | Preferred date on a `weeklyDays` day and not in `unavailableDates` → 10; time slot compatible → +5. Otherwise 0 (or 5 if `isAvailableNow` and date is today/tomorrow) |
| **Reputation** | 10 | Bayesian rating: `r = (ratingAvg*ratingCount + 3.5*5)/(ratingCount+5)` → `(r/5)*5`; experience `min(2, years/5)`; portfolio ≥3 items → +1; verified → +2 |

### 6.3 Estimated quote

```
hourly  : rate * hoursEstimate   (days*8 if unit=days)
daily   : rate * ceil(daysEstimate)   (hours/8 if unit=hours, min 1)
project : rate
```

### 6.4 Explanation generator

Template-based, built **only from real fields**, never invented:
`"Matches your required skills[, specialises in X], is {d} km away, is {available|not confirmed available} on {weekday}, and has quoted ₹{quote}{, within your budget | , ₹{diff} above your budget}[, rated {r}/5 from {n} reviews][, ID verified]."`

### 6.5 Edge cases
- No workers found → return `[]` and a `suggestion` (e.g. "Try increasing distance to 30 km").
- Missing budget/date → neutral scores (above), still ranked.
- Ties broken by distance ascending.
- Pure functions, unit-tested (Vitest/Jest): each factor, ordering, explanation text, edge cases.

---

## 7. Phases and sync points (adjust hours to your hackathon length)

| Phase | Time | Everyone's focus |
|---|---|---|
| **Phase 0 — Setup** | Hour 0–1 | **M4** creates repo, scaffolds, pushes `dev`; others clone, install, set `.env`, read docs |
| **Phase 1 — Foundations** | Hour 1–6 | M1: layout + auth screens on mocks. M2: auth + uploads + middleware. M3: models + seed + geo. M4: i18n, test plan, Postman, CI |
| **SYNC 1 (Hour 6)** | | Register/login works end to end from UI. Models merged. Seed runs |
| **Phase 2 — Core features** | Hour 6–14 | M1: job form, matches, worker profile. M2: jobs + bookings. M3: matching engine + worker APIs. M4: API tests, integrate |
| **SYNC 2 (Hour 14)** | | `GET /jobs/:id/matches` returns ranked data in the UI |
| **Phase 3 — Full flow** | Hour 14–20 | M1: booking/negotiation screens + dashboards. M2: reviews/reports. M3: tuning. M4: E2E, bug triage, deploy |
| **SYNC 3 (Hour 20)** | | Complete flow works on deployed URL |
| **Phase 4 — Polish and demo** | Hour 20–end | Fix bugs, UI polish, i18n pass, demo rehearsal, README, submission. **Feature freeze** at Hour 22 |

**Stretch (only after Sync 3):** image-assisted work classification (Claude/Gemini vision API suggests profession from uploaded photos), payments mock, admin panel, notifications.

---

# 8. MEMBER 1 — Frontend

> **Say to Antigravity: "I am Member 1 (Frontend). Do only Member 1 tasks."**

**Owns:** everything under `client/src/` except `client/src/i18n/` (Member 4).
**Depends on:** API contract (Section 5). Build against **mock data** first, then switch to the real API.

### 8.1 Setup (Phase 1, ~1h)
1. Install: `react-router-dom axios react-hook-form zod @hookform/resolvers react-leaflet leaflet react-i18next i18next tailwindcss`.
2. `src/api/client.js`: axios instance, `baseURL = import.meta.env.VITE_API_URL`, request interceptor attaches JWT from `localStorage`, response interceptor unwraps `data.data` and redirects to `/login` on 401.
3. One file per resource: `auth.js, workers.js, jobs.js, bookings.js, reviews.js, uploads.js`. Each exports functions matching Section 5 exactly.
4. `VITE_USE_MOCKS=true` flag: when true, API files return data from `src/mocks/*.js` (same shapes as the contract). Switch to `false` at Sync 1/2.
5. `AuthContext` (user, token, login, register, logout, role), `ProtectedRoute` with `allowedRoles`.
6. Tailwind theme: primary orange/amber (construction vibe), clean cards, mobile-first (customers will use phones).

### 8.2 Screens and routes

| Route | Screen | Role | Key details |
|---|---|---|---|
| `/` | Landing | public | Hero + tagline, profession grid (10 professions with icons), "How it works" 4 steps, CTAs (Find a worker / Join as worker), language switcher |
| `/register` | Register | public | Role toggle (Customer/Worker), form validation, language select |
| `/login` | Login | public | |
| `/customer/dashboard` | Customer dashboard | customer | My jobs list (status chips), my bookings, "Post a job" button |
| `/customer/jobs/new` | **Post Job** | customer | Multi-step form: (1) profession cards (2) description + photo/video upload with previews (3) budget range, date, time slot, duration (4) location: **"Use my GPS"** button + draggable Leaflet marker + address text (5) review & submit. Include example hint text from the project doc |
| `/customer/jobs/:id` | Job detail | customer | Job info, status, bookings on this job, "View matches" |
| `/customer/jobs/:id/matches` | **Matches** | customer | List/Map toggle. Worker cards: photo, name, profession, distance, ₹ quote, rating, verified badge, availability tick, **score bar + explanation text**. Filters sidebar/drawer (distance slider, price range, min experience, min rating, language, sort). Map view with markers + job pin |
| `/workers/:id` | Worker public profile | any | Bio, skills chips, experience, rate, languages, portfolio gallery (lightbox), certifications, reviews list, **"Request booking"** button |
| `/customer/jobs/:id/book/:workerId` | Booking request | customer | Prefilled price (estimatedQuote), editable; date, time slot, scope textarea, message; confirmation summary |
| `/bookings/:id` | Booking detail | both | Status timeline, negotiation history, action buttons by role+status (accept / reject / counter / confirm / decline-counter / cancel / complete), "Report issue" modal |
| `/customer/bookings/:id/review` | Review | customer | Star rating + comment, only for completed |
| `/worker/dashboard` | Worker dashboard | worker | Incoming requests (pending), countered, accepted/upcoming, completed, earnings-ish summary, availability toggle |
| `/worker/profile` | Worker profile editor | worker | All profile fields, professions multi-select, rate type, **location picker (map)**, service radius slider, weekly-days checkboxes + unavailable dates, portfolio upload/delete, certifications |
| `*` | 404 | | |

### 8.3 Reusable components
`Navbar` (role-aware + LanguageSwitcher), `ProfessionCard`, `WorkerCard`, `ScoreBar`, `StatusBadge`, `StarRating`, `MediaUploader` (drag-drop, previews, progress, calls `/uploads`), `LocationPicker` (Leaflet + GPS), `MapView`, `FilterPanel`, `Modal`, `Toast`, `Loader/Skeleton`, `EmptyState`, `ConfirmDialog`, `BookingTimeline`.

### 8.4 UX requirements
- Mobile-first responsive. All forms validated with inline errors (use server `error.fields` too).
- Loading skeletons, empty states, error toasts everywhere.
- All visible text via `t('key')` from react-i18next (keys defined by Member 4; add new keys to a list and send to M4, or use English fallback strings with `t('key', 'English default')`).
- Money displayed as `₹3,000`. Dates in local format. Distances `2.5 km`.
- Browser GPS: handle denied permission gracefully (fall back to map click).
- Leaflet default marker icon fix for Vite; OSM attribution kept.
- Accessibility basics: labels, alt text, focus states.

### 8.5 Definition of done
- All routes above work with mocks first, then real API.
- Full flow clickable on mobile width.
- No console errors. No hard-coded text outside `t()`.

### 8.6 Paste this into Antigravity (Member 1)

```text
I am Member 1 (Frontend) of the KaamConnect AI team. Do ONLY Member 1 tasks; never edit files owned by other members.
Read AGENTS.md, docs/api-contract.md, docs/data-models.md and IMPLEMENTATION_PLAN.md (Section 8).

Build the React + Vite + Tailwind frontend in client/src exactly per Section 8 of the plan:
1. Set up axios client, per-resource API modules following docs/api-contract.md exactly, and a VITE_USE_MOCKS switch with realistic mock data in src/mocks.
2. Build AuthContext, ProtectedRoute and the role-aware Navbar.
3. Build every screen/route in the Section 8.2 table and the reusable components in 8.3.
4. Use react-hook-form + zod, react-leaflet (OpenStreetMap), react-i18next (t() for all text, keys in client/src/i18n owned by Member 4; use default-string fallbacks).
Start in Planning mode: produce a task list and implementation plan first, wait for my approval, then build screen by screen, testing each in the browser. Mobile-first. Summarise after each screen.
```

---

# 9. MEMBER 2 — Backend (APIs, auth, bookings)

> **Say to Antigravity: "I am Member 2 (Backend). Do only Member 2 tasks."**

**Owns:** `server/src/routes/*` (except worker/match routes → M3), `controllers/*` (same exception), `middleware/*`, `models/User.js`, `services/upload.js`, `utils/*`, `config/*`, `app.js` after scaffold.
**Depends on:** M3's models (for jobs/bookings/reviews/reports). Start with tasks that don't need them.

### 9.1 Setup and infrastructure (Phase 1, first)
1. `config/env.js` (validate env with zod: `PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL, CLOUDINARY_*`), `config/db.js` (Mongoose connect with retry log).
2. `app.js`: `helmet`, `cors({origin: CLIENT_URL})`, `express.json({limit:'1mb'})`, `morgan`, rate limiter on `/api/auth`, mount `/api` router, 404 handler, **global error handler** that outputs the standard envelope.
3. `utils/`: `ApiError(status, code, message, fields)`, `asyncHandler`, `ok(res, data, status)`.
4. `middleware/`:
   - `auth.js` → `requireAuth` (verify JWT, load user) and `requireRole(...roles)`.
   - `validate.js` → `validate(zodSchema, 'body'|'query'|'params')` returns 400 with `fields`.
   - `error.js`.
5. `routes/index.js` registers all routers (each member adds only own line).

### 9.2 Auth (`models/User.js`, `routes/auth.js`)
- Register: validate (email unique → 409, password ≥8, phone 10 digits), hash with bcrypt (cost 10), return JWT + user (no hash).
- Login: generic error "Invalid credentials" (don't leak which part failed).
- `/auth/me` returns user (+ `workerProfile` via M3's model if role is worker).
- `PATCH /auth/me`.

### 9.3 Uploads (`services/upload.js`, `routes/uploads.js`)
- multer memory storage, file type + size validation, max 6 files.
- Upload to Cloudinary (folder `kaamconnect`); if Cloudinary env missing, **fallback to local disk** `server/uploads/` and serve at `/uploads/*` (so dev never blocks).
- Return `{files:[{url,type}]}`.

### 9.4 Jobs (`routes/jobs.js`, `controllers/jobs.js`)
- `POST /jobs`: convert `{lat,lng}` → GeoJSON `[lng,lat]`; validate `budgetMin ≤ budgetMax`, `preferredDate` not in the past, profession in enum, ≤6 media.
- `GET /jobs/mine` (+status filter, pagination), `GET /jobs/:id` (authorisation: owner or booked worker), `PATCH /jobs/:id` (only `open`).
- **Note:** `GET /jobs/:id/matches` is implemented by M3; M2 only ensures `/jobs/:id` routes don't shadow it (register M3's route before `/:id`, or use distinct router order).

### 9.5 Bookings (`routes/bookings.js`, `controllers/bookings.js`, `services/bookingStateMachine.js`)
- Implement every endpoint in Section 5.5.
- Put transitions in one pure function `transition(booking, action, actorRole)` with an allowed-transitions table; unit-test it. Invalid → `ApiError(409,'INVALID_TRANSITION',…)`.
- Authorisation: customer can only act on their own bookings; worker only on bookings addressed to them.
- Creating a booking: verify job is `open` and owned by caller, worker profile active and has the profession, prevent duplicates, push first entry in `negotiation`.
- On accept/confirm: set `finalPrice`, job `booked`, `job.selectedBooking`; **auto-reject other pending bookings for the same job** (nice touch).
- On complete: set `completedAt`, increment `WorkerProfile.completedJobs`, job `completed`.
- `GET /bookings/mine`: populate `job` (title, profession, location, addressText), counterpart name/phone (show **phone only after accepted**, for privacy).

### 9.6 Reviews and reports
- `POST /reviews`: booking must be `completed`, belong to caller, no existing review; save; recompute `ratingAvg/ratingCount` using an aggregate on the worker.
- `POST /reports`: participant only; save with status `open`.

### 9.7 Misc
`GET /health`, `GET /meta/professions` (value + English label + icon name).

### 9.8 Security and quality checklist
- Passwords never returned; JWT secret from env; role checks on every protected route.
- Input validated with zod; Mongo query operators sanitised (reject keys starting with `$`).
- Consistent error envelope; no stack traces in production.
- Supertest tests for auth + booking state machine (coordinate with M4 for the shared test setup).

### 9.9 Definition of done
Every endpoint in 5.1, 5.2, 5.4, 5.5, 5.6, 5.7 works per contract, with Postman/supertest proof and correct status codes.

### 9.10 Paste this into Antigravity (Member 2)

```text
I am Member 2 (Backend) of the KaamConnect AI team. Do ONLY Member 2 tasks; never edit files owned by other members (models other than User.js, services/matching, seed, worker/match routes belong to Member 3).
Read AGENTS.md, docs/api-contract.md, docs/data-models.md and IMPLEMENTATION_PLAN.md (Sections 4, 5 and 9).

Build in server/src with Express + Mongoose + zod:
1. config (env validation, db), app.js middleware stack, ApiError/asyncHandler utils, auth + validate + error middleware.
2. User model, auth endpoints (register/login/me/patch) with bcrypt + JWT.
3. Uploads endpoint (multer + Cloudinary with local-disk fallback).
4. Jobs endpoints, Bookings endpoints with a pure, unit-tested state machine exactly as in Section 5.5, Reviews and Reports endpoints, /health and /meta/professions.
Follow the response envelope and field names EXACTLY. Start in Planning mode: show me the task list and plan, wait for approval, then implement endpoint by endpoint and test each with curl/supertest. Use Member 3's Mongoose models by importing from models/ once they exist; until then, stub only inside your own files.
```

---

# 10. MEMBER 3 — Database and Matching

> **Say to Antigravity: "I am Member 3 (Database and Matching). Do only Member 3 tasks."**

**Owns:** `server/src/models/*` (except `User.js`), `services/matching/*`, `services/geo.js`, `seed/*`, `controllers/workers.js`, `routes/workers.js`, `routes/matches.js`.
**Priority:** push models to `dev` **within the first 60–90 minutes** — Member 2 depends on them.

### 10.1 Models (Phase 1, first)
Implement Section 4.3–4.7 exactly: `WorkerProfile`, `JobRequest`, `Booking`, `Review`, `Report`.
- Put enums in `models/constants.js` and export so M2/M1 can reuse names.
- Add all indexes (2dsphere on `WorkerProfile.location` and `JobRequest.location`; compound indexes on bookings).
- Add validation (e.g. `rate ≥ 0`, `professions` non-empty, coordinates valid range; `rating` 1–5).
- `models/index.js` re-exports all.

### 10.2 Geo service (`services/geo.js`)
- `toPoint(lat,lng)` → GeoJSON; `fromPoint(point)` → `{lat,lng}`.
- `haversineKm(a,b)` for fallback/testing.
- `findWorkersNear({profession, point, maxDistanceKm, filters})` using `$geoNear` aggregation, returning `distanceKm`.
- Important `$geoNear` rules: must be the first pipeline stage; `distanceField`, `spherical:true`, `maxDistance` in metres; `query` for profession/isActive.

### 10.3 Matching engine (`services/matching/`)
Files: `index.js` (`rankWorkersForJob(job, options)`), `scoring.js` (one pure function per factor), `quote.js` (estimate), `explain.js`, `keywords.js` (tokenise + stop-words, include simple Hindi/Telugu-transliterated skill synonyms like "wiring"="wire", "tap"="faucet").
- Follow Section 6 **exactly** (weights, formulas, hard filters, explanation template).
- Output item shape = Section 5.3 match item.
- Each scoring function pure + unit-tested (Vitest/Jest): at least 25 test cases (in-budget, over-budget, no budget, closest vs best-rated ordering, unavailable date, zero reviews, tie-breaks, empty results).
- Keep weights in one config object `WEIGHTS` so tuning is a one-line change.

### 10.4 Worker + match endpoints (`routes/workers.js`, `routes/matches.js`)
Implement Section 5.3: `PUT/GET /workers/me`, portfolio add/delete, availability patch, `GET /workers/:id`, `GET /workers/:id/reviews`, `GET /workers` (filters + sort + pagination), and `GET /jobs/:id/matches` (customer owner only; loads job, runs engine, returns ranked list + optional `suggestion`).
- Use M2's `requireAuth/requireRole/validate/ApiError/ok` helpers (import only).
- `PUT /workers/me`: accept `{lat,lng}`, convert to GeoJSON; upsert by `user`.
- `GET /workers` computes `distanceKm` when `lat/lng` provided; supports `date` availability filter.
- Public profile must **not** expose email/phone.

### 10.5 Seed data (`seed/seed.js`, run via `npm run seed`)
Make demo-ready, realistic data **centred on Warangal/Hanamkonda/Kazipet (≈17.9689, 79.5941)** with random offsets of 0–20 km:
- 1 admin, **6 customers**, **45 workers** (≥4 per profession) with realistic Indian names, mixed rates (hourly/daily/project), experience 1–20 yrs, languages (te/hi/en mix), weekly availability, a few unavailable dates, 2–5 portfolio image URLs each (use stable public placeholder URLs or Cloudinary demo images), some verified, ratings 3.2–4.9.
- ~60 reviews, ~10 jobs, ~12 bookings across all statuses (so dashboards aren't empty).
- Fixed demo logins printed at the end of the script:
  `customer@demo.com / Demo@1234`, `worker@demo.com / Demo@1234` (an electrician ~2.5 km from the demo customer's job).
- Script is **idempotent** (`--reset` flag wipes and reseeds).
- Create a demo job "Install lights and fans in 3 rooms, budget ₹3,000–₹5,000, this Saturday" that yields a good-looking top-5 match list.

### 10.6 Performance and tuning
- Verify indexes with `.explain()`.
- Make sure `/jobs/:id/matches` responds < 500 ms with 45+ workers.
- After Sync 2, tune weights with M4/M1 by looking at actual ranked outputs.

### 10.7 Definition of done
Models merged, seed runs in one command, matching returns sensible ranked results with explanations built from real data, tests pass, all Section 5.3 endpoints work.

### 10.8 Paste this into Antigravity (Member 3)

```text
I am Member 3 (Database and Matching) of the KaamConnect AI team. Do ONLY Member 3 tasks; never edit files owned by other members (User.js, auth, jobs, bookings, uploads belong to Member 2).
Read AGENTS.md, docs/data-models.md, docs/matching-spec.md, docs/api-contract.md and IMPLEMENTATION_PLAN.md (Sections 4, 5.3, 6 and 10).

Build in server/src:
1. FIRST (push to dev ASAP): Mongoose models WorkerProfile, JobRequest, Booking, Review, Report with enums in models/constants.js and all indexes (2dsphere etc.).
2. services/geo.js with $geoNear helpers.
3. services/matching/* implementing the Section 6 scoring (skill 30, distance 25, price 20, availability 15, reputation 10), quote estimation, explanation generator that uses only real data, plus 25+ unit tests.
4. Worker endpoints and GET /jobs/:id/matches per Section 5.3 (import auth/validate helpers from Member 2; do not edit them).
5. An idempotent seed script centred on Warangal (17.9689, 79.5941) with 45 workers, 6 customers, reviews, jobs, bookings and demo logins.
Start in Planning mode, show the plan, wait for approval, then build models first. Run tests and the seed against MongoDB Atlas and show me sample ranked output.
```

---

# 11. MEMBER 4 — Integration, QA, DevOps, Documentation, i18n

> **Say to Antigravity: "I am Member 4 (Integration, Testing, GitHub, Docs, Demo). Do only Member 4 tasks."**

**Owns:** repo root, `docs/`, `tests/`, `.github/`, `client/src/i18n/`, deployment, README, hackathon submission. You are the **glue** and the only person who merges to `main`.

### 11.1 Phase 0 — Scaffold (Hour 0–1) ⚠️ everyone is waiting for this
1. Create GitHub repo `kaamconnect-ai`; add the 3 teammates as collaborators; protect `main`.
2. Create folder structure (Section 3.1).
3. `client/`: `npm create vite@latest` (React), install base deps, Tailwind configured, `.env.example`.
4. `server/`: `npm init`, install deps (`express mongoose cors helmet morgan dotenv zod jsonwebtoken bcryptjs multer cloudinary express-rate-limit`; dev: `nodemon jest supertest vitest`), scripts `dev`, `start`, `test`, `seed`. Minimal `app.js` + `server.js` + `routes/index.js` with `/api/health`.
5. Root: `.gitignore` (node_modules, .env, uploads), root `package.json` with `npm run dev` that runs both via `concurrently`.
6. Copy Sections 3.4, 4, 5, 6 of this plan into `AGENTS.md`, `docs/data-models.md`, `docs/api-contract.md`, `docs/matching-spec.md`; add this file as `IMPLEMENTATION_PLAN.md`.
7. Create the MongoDB Atlas cluster, add teammates' IPs (or `0.0.0.0/0` for the hackathon), create DB user, share the **connection string privately** (not in git). Create the Cloudinary account and share keys privately.
8. Push to `dev`. Announce: "Scaffold ready, pull `dev`."

### 11.2 i18n (Phase 1) — `client/src/i18n/`
- `index.js` (i18next + react-i18next + browser language detection, persisted in localStorage, fallback `en`).
- `en.json`, `hi.json`, `te.json` — organised by namespace: `common, nav, landing, auth, professions, jobForm, matches, workerProfile, booking, dashboard, review, errors, status`.
- Include all 10 profession names, booking statuses, and error messages in all 3 languages.
- Provide M1 a **key list** within Phase 1 and keep adding as M1 requests. Native-quality Telugu/Hindi: have a teammate or relative proofread.

### 11.3 Testing (continuous)
- `tests/postman/KaamConnect.postman_collection.json` + environment: every endpoint, with test scripts that save token/ids to variables.
- `tests/api/` supertest integration tests using `mongodb-memory-server` (or a separate test DB): **critical path test** (register customer + worker → worker profile → job → matches → booking → accept → complete → review).
- `tests/e2e-checklist.md`: a manual script (below) executed at every sync point, with pass/fail table.
- Optional: use the **Antigravity browser agent** to run the E2E checklist in the browser and report failures.
- Maintain a GitHub Issues board (labels: `m1`, `m2`, `m3`, `bug`, `blocker`). Triage daily.

**E2E checklist (minimum):**
1. Register as customer (EN) → lands on dashboard.
2. Post job: electrician, photos, ₹3,000–₹5,000, Saturday, GPS location.
3. Matches page shows ≥3 ranked workers with explanations and distances; map markers visible.
4. Apply filters (distance, price, rating) → list updates.
5. Open worker profile → portfolio + reviews show.
6. Request booking → status `pending`.
7. Login as worker → request visible → **counter** price.
8. Customer confirms counter → `accepted`.
9. Customer marks complete → leaves review → worker rating updates.
10. Repeat with reject, cancel, and duplicate-booking 409.
11. Switch language to Telugu/Hindi on all main screens.
12. Mobile viewport pass; permission-denied GPS fallback; invalid forms show errors.

### 11.4 Integration duties
- **Sync 1/2/3 meetings** (15 min): demo current state, list blockers, confirm next phase.
- Review every PR to `dev` for: contract compliance, no secrets, no cross-ownership edits, app still starts. Merge fast (don't be the bottleneck).
- When M1 switches from mocks to real API, you pair with them: check each endpoint's actual response vs `api-contract.md`; log mismatches as issues for the owner.
- Keep `docs/api-contract.md` the single source of truth; version note at the top for changes.
- CORS/env/port problems, Atlas IP allow-list, and seed problems are **yours** to unblock.

### 11.5 Deployment (Phase 3)
- Backend → Render/Railway: build `npm install`, start `npm start`, set env vars, health check `/api/health`.
- Frontend → Vercel/Netlify: set `VITE_API_URL` to deployed backend, SPA fallback rewrite (`/* → /index.html`).
- Update `CLIENT_URL` on the backend for CORS. Run seed against production DB once.
- Smoke-test the E2E checklist on the **deployed** URLs. Keep the local fallback ready in case Wi-Fi fails at the demo.

### 11.6 Documentation and submission
- `README.md`: problem, solution, features, screenshots/GIF, tech stack, architecture diagram, setup instructions (clone → env → `npm run dev` → `npm run seed`), demo credentials, team roles, future scope.
- `docs/demo-script.md`: a 3–5 minute script following the storyline: problem (30s) → customer posts job (60s) → AI-ranked matches with explanation (60s) → booking + worker counter-offer (60s) → review + trust features + local language (30s) → future scope (30s). Assign who speaks/clicks.
- Pitch deck (5–8 slides): Problem, Solution, Demo screenshots, How matching works (the 5 factors), Trust and safety, Tech stack, Impact, Roadmap.
- Record a backup demo video (screen capture) in case of live failure.
- Submission checklist: repo public/accessible, README complete, live link works, video link, deck uploaded, team names.

### 11.7 Stretch (only after Sync 3, with M3/M1 approval)
Image-assisted classification endpoint (`POST /ai/classify-job` using a vision model; suggests profession + summary from photos), PWA manifest/offline shell, simple admin page for reports/verification.

### 11.8 Definition of done
Scaffold shipped early, all docs present, CI/tests green, E2E checklist passes on deployed site, README + demo script + deck + video ready.

### 11.9 Paste this into Antigravity (Member 4)

```text
I am Member 4 (Integration, Testing, GitHub, Documentation, Demo, i18n) of the KaamConnect AI team. Do ONLY Member 4 tasks; never edit application files owned by Members 1-3 — report mismatches as GitHub issues instead.
Read IMPLEMENTATION_PLAN.md (Sections 3, 4, 5, 6 and 11).

Right now, do Phase 0 (Section 11.1) IMMEDIATELY: create the monorepo structure, scaffold the Vite React client (with Tailwind) and the Express server (health route only) with scripts, a root package.json that runs both with concurrently, .gitignore, .env.example files, AGENTS.md, and the docs/ files copied from the plan. Then continue with i18n JSON files (en/hi/te), the Postman collection, supertest critical-path tests, the E2E checklist, GitHub Actions CI (install + test), deployment configs, README, demo script and pitch deck outline.
Start in Planning mode, show the plan, wait for my approval, and do Phase 0 first because the whole team is blocked on it.
```

---

## 12. Dependency map (who waits for whom)

```
M4 scaffold ─────────────▶ everyone starts
M3 models (by ~Hour 1.5) ─▶ M2 jobs/bookings/reviews
M2 auth + middleware ─────▶ M1 real login, M3 protected routes
M3 /jobs/:id/matches ─────▶ M1 matches screen
M2 bookings ──────────────▶ M1 booking/negotiation screens
M4 i18n keys ◀──────────── M1 requests new keys
Everyone ─────────────────▶ M4 E2E testing + deploy
```

**Unblocking tip:** M1 uses mocks, M2 stubs models locally inside own files, M3 seeds data by itself — no one should be idle waiting.

---

## 13. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Merge conflicts | Lost time | File ownership, small PRs, pull often, route lines alphabetical |
| Contract drift (field names) | Integration bugs | M4 checks responses vs contract at every sync; change contract only via group chat |
| Models late | M2 blocked | M3 pushes models first, within ~90 minutes |
| Atlas/Cloudinary access issues | Demo failure | Local upload fallback; allow-list IPs early; M4 owns |
| Antigravity changes others' files | Overwrites | `AGENTS.md` rule + opening statement "I am Member X"; review diffs before accepting |
| GPS fails at demo venue | Matching looks empty | Map click fallback + seed centred on Warangal + saved demo job |
| Too many features | Unfinished flow | Feature freeze at Hour 22; stretch only after Sync 3 |
| Wi-Fi fails during demo | Embarrassing | Local run + backup video |

---

## 14. Final demo-readiness checklist (everyone)

- [ ] Customer + worker demo accounts work on the deployed site
- [ ] Seed data loaded; demo job gives a strong top-5 ranked list with explanations
- [ ] Full flow: post → match → compare → book → counter → confirm → complete → review
- [ ] Telugu/Hindi/English switch works on main screens
- [ ] Mobile layout checked
- [ ] Trust features visible (verified badge, reviews, portfolio, report button, phone hidden until accepted)
- [ ] README, deck, demo script, backup video ready
- [ ] Everyone knows their 30–60 seconds of the pitch

> **Principle to remember:** distance, availability, and prices shown to users must always come from real stored data — the explanation text only describes facts the system actually has.
