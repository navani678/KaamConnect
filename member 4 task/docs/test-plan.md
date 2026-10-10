# KaamConnect AI — QA & Test Plan

This document details the test strategy, environments, and validation gates for KaamConnect AI across all 4 sync points.

---

## 1. Test Levels & Tooling

| Level | Scope | Tooling | Owner |
|---|---|---|---|
| **Unit Tests** | Matching engine scoring functions, quote calculator, geo utilities | Vitest / Jest | Member 3 / Member 4 |
| **Integration Tests** | Critical-path Supertest API tests (MongoDB Memory Server) | Jest, Supertest | Member 4 |
| **Contract Testing** | API responses match schemas & status codes | Postman Collection / Newman | Member 4 |
| **E2E & Manual QA** | 12-point customer & worker lifecycle checklist | Manual / Browser agent | Member 4 |
| **i18n & Localization** | English, Hindi, Telugu text coverage & layout integrity | Visual review | Member 4 |

---

## 2. Critical Path Integration Flow

The backend integration suite in `tests/api/critical-path.test.js` covers:
1. `POST /api/auth/register` (Customer)
2. `POST /api/auth/register` (Worker)
3. `PUT /api/workers/me` (Worker profile with GeoJSON point & rates)
4. `POST /api/jobs` (Customer creates job with location & budget)
5. `GET /api/jobs/:id/matches` (Verify matching engine ranks worker with score and explanation)
6. `POST /api/bookings` (Customer requests booking → `pending`)
7. `POST /api/bookings/:id/counter` (Worker counters proposed price → `countered`)
8. `POST /api/bookings/:id/confirm` (Customer confirms counter → `accepted`)
9. `POST /api/bookings/:id/complete` (Customer marks completed → `completed`)
10. `POST /api/reviews` (Customer reviews completed booking → updates worker rating)

---

## 3. Sync Milestones & Quality Gates

### Sync 1 (Hour 6)
- [ ] Database connection succeeds with 2dsphere indexes.
- [ ] Seed script completes without errors (`npm run seed`).
- [ ] Auth endpoints (`/register`, `/login`, `/me`) pass status code and token validation.

### Sync 2 (Hour 14)
- [ ] Job creation works with valid coordinates and budget.
- [ ] `GET /jobs/:id/matches` responds under 500ms with 45+ seed workers.
- [ ] Scores are broken down into Skill (30), Distance (25), Price (20), Availability (15), Reputation (10).

### Sync 3 (Hour 20)
- [ ] Full booking state machine verified: `pending` → `countered` → `accepted` → `completed`.
- [ ] Unauthorized transitions return HTTP 409 Conflict.
- [ ] Critical path test suite passes 100%.

### Sync 4 (Hour 24 / Demo Prep)
- [ ] E2E 12-point checklist verified on deployed production environment.
- [ ] Multilingual switcher (EN / HI / TE) fully functional without missing keys.
- [ ] Mobile responsive layout verified on 375px viewport.
