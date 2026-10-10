# KaamConnect AI — API Contract

**Base URL:** `http://localhost:5000/api`  
**Authentication:** `Authorization: Bearer <JWT>` (JWT payload: `{ id, role }`, 7 days expiry)  
**Standard Response Envelopes:**
- **Success:**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Error:**
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Human readable message",
      "fields": { "field": "Error description" }
    }
  }
  ```

**Standard Pagination:**
- Query: `?page=1&limit=10`
- Response: `{ "success": true, "data": { "items": [...], "page": 1, "limit": 10, "total": 45 } }`

---

## 1. Auth Endpoints (Owner: Member 2)

| Method | Path | Auth | Body | Returns | Notes |
|---|---|---|---|---|---|
| `POST` | `/auth/register` | None | `{ name, email, phone, password, role, language }` | `{ token, user }` | 201 Created |
| `POST` | `/auth/login` | None | `{ email, password }` | `{ token, user }` | 200 OK |
| `GET` | `/auth/me` | Bearer | — | `{ user, workerProfile? }` | 200 OK |
| `PATCH` | `/auth/me` | Bearer | `{ name?, phone?, language? }` | `{ user }` | 200 OK |

---

## 2. Uploads (Owner: Member 2)

| Method | Path | Auth | Payload | Returns |
|---|---|---|---|---|
| `POST` | `/uploads` | Bearer | `multipart/form-data`, field `files` (max 6, ≤10MB, jpg/png/webp/mp4) | `{ files: [{ url, type }] }` |

Fallback to local static storage `server/uploads/` if Cloudinary keys are not set.

---

## 3. Worker Profiles & Discovery (Owner: Member 3)

| Method | Path | Auth | Query / Body | Notes |
|---|---|---|---|---|
| `PUT` | `/workers/me` | Worker | Body: WorkerProfile fields, `location: { lat, lng }` | Upsert profile |
| `GET` | `/workers/me` | Worker | — | Worker's own profile |
| `POST` | `/workers/me/portfolio` | Worker | Body: `{ url, caption, type }` | Add item |
| `DELETE` | `/workers/me/portfolio/:itemId` | Worker | — | Remove item |
| `PATCH` | `/workers/me/availability` | Worker | Body: availability object | Update slots & dates |
| `GET` | `/workers/:id` | Public | — | Public profile + recent reviews |
| `GET` | `/workers/:id/reviews` | Public | `?page=&limit=` | Reviews list |
| `GET` | `/workers` | Public | `profession, lat, lng, maxDistanceKm, minRate, maxRate, minExperience, minRating, language, date, sort, page, limit` | Search with `distanceKm` |
| `GET` | `/jobs/:id/matches` | Customer (Job Owner) | `maxDistanceKm, limit` | AI-Ranked matches for job |

### Match Item Shape
```json
{
  "workerProfileId": "651234567890abcdef123456",
  "userId": "651234567890abcdef123457",
  "name": "Ravi Kumar",
  "professions": ["electrician"],
  "specializations": ["wiring", "fans"],
  "experienceYears": 6,
  "ratingAvg": 4.6,
  "ratingCount": 23,
  "rateType": "daily",
  "rate": 900,
  "estimatedQuote": 4000,
  "distanceKm": 2.5,
  "availableOnDate": true,
  "verified": true,
  "portfolioPreview": ["https://.../img1.jpg", "https://.../img2.jpg"],
  "score": 87.4,
  "breakdown": {
    "skill": 28,
    "distance": 22,
    "price": 20,
    "availability": 15,
    "reputation": 8.4
  },
  "explanation": "Matches your required skills, is 2.5 km away, is available on Saturday and has quoted ₹4,000, within your budget."
}
```

---

## 4. Jobs (Owner: Member 2 routes, Member 3 model)

| Method | Path | Auth | Body / Params | Notes |
|---|---|---|---|---|
| `POST` | `/jobs` | Customer | `{ profession, title, description, media[], location: { lat, lng }, addressText, budgetMin, budgetMax, preferredDate, preferredTimeSlot, estimatedDuration }` | 201 Created |
| `GET` | `/jobs/mine` | Customer | `?status=` | Customer's posted jobs |
| `GET` | `/jobs/:id` | Customer / Worker | — | Job detail |
| `PATCH` | `/jobs/:id` | Customer | Edit fields or cancel (`status: "cancelled"`) | Only when `open` |

---

## 5. Bookings & Negotiation (Owner: Member 2)

| Method | Path | Actor | Body / Params | Effect |
|---|---|---|---|---|
| `POST` | `/bookings` | Customer | `{ jobId, workerProfileId, proposedPrice, scheduledDate, timeSlot, scope, message }` | Create `pending` booking (409 if active booking exists) |
| `GET` | `/bookings/mine` | Both | `?status=` | List user's bookings with populated details |
| `GET` | `/bookings/:id` | Participant | — | Full details with negotiation history |
| `POST` | `/bookings/:id/accept` | Worker | — | `pending` → `accepted`, `finalPrice = proposedPrice`, job → `booked` |
| `POST` | `/bookings/:id/reject` | Worker | `{ reason? }` | `pending` → `rejected` |
| `POST` | `/bookings/:id/counter` | Worker | `{ price, message? }` | `pending` → `countered`, append audit trail |
| `POST` | `/bookings/:id/confirm` | Customer | — | `countered` → `accepted`, `finalPrice = latest counter`, job → `booked` |
| `POST` | `/bookings/:id/decline-counter` | Customer | — | `countered` → `cancelled` |
| `POST` | `/bookings/:id/cancel` | Customer | — | `pending` / `accepted` → `cancelled` |
| `POST` | `/bookings/:id/complete` | Customer | — | `accepted` → `completed`, job → `completed`, worker `completedJobs++` |

### State Machine Transition Rules (Invalid transition yields 409 Conflict):
- `pending` → `accepted` (Worker accepts)
- `pending` → `rejected` (Worker rejects)
- `pending` → `countered` (Worker counters price)
- `pending` → `cancelled` (Customer cancels)
- `countered` → `accepted` (Customer confirms counter)
- `countered` → `cancelled` (Customer declines counter)
- `accepted` → `completed` (Customer marks job done)
- `accepted` → `cancelled` (Customer cancels)

---

## 6. Reviews & Reports (Owner: Member 2 routes, Member 3 model)

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| `POST` | `/reviews` | Customer | `{ bookingId, rating, comment }` | Allowed once for own completed booking. Updates worker rating. |
| `POST` | `/reports` | Participant | `{ bookingId, reason, details }` | File report |

---

## 7. System & Metadata

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/health` | Public | Returns `{ status: "ok", time }` |
| `GET` | `/meta/professions` | Public | Returns professions list with display labels |
