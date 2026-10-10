# KaamConnect AI — End-to-End (E2E) Test Checklist

This verification checklist must be run at every Sync point (Sync 1, Sync 2, Sync 3) and prior to merging feature branches into `main`.

---

## E2E Test Execution Matrix

| # | Test Scenario | Steps | Expected Result | Sync 1 | Sync 2 | Sync 3 | Pre-Demo |
|---|---|---|---|:---:|:---:|:---:|:---:|
| **1** | Customer Registration & Login | 1. Navigate to `/register`<br>2. Select role Customer<br>3. Fill name, email, phone, password<br>4. Submit and log in | User is redirected to `/customer/dashboard`; JWT stored in `localStorage`; user role is `customer`. | ⬜ | ⬜ | ⬜ | ⬜ |
| **2** | Post Job with GPS & Photos | 1. Go to `/customer/jobs/new`<br>2. Choose Electrician<br>3. Upload photo/video<br>4. Set budget ₹3,000–₹5,000<br>5. Click "Use my GPS"<br>6. Submit | Job saved with `status: "open"`, GeoJSON coordinates, and redirects to `/customer/jobs/:id/matches`. | ⬜ | ⬜ | ⬜ | ⬜ |
| **3** | AI Matches & Explanations | 1. View matches page<br>2. Check top worker card | Shows ≥3 ranked workers with scores, distance in km, budget quote, and grounded explanation string. Map pins rendered. | ⬜ | ⬜ | ⬜ | ⬜ |
| **4** | Dynamic Filtering & Sorting | 1. Adjust distance slider<br>2. Change min rating filter<br>3. Sort by price / distance | Workers list dynamically updates without reload; matches remain sorted correctly. | ⬜ | ⬜ | ⬜ | ⬜ |
| **5** | Worker Profile Discovery | 1. Click on a worker card | Public profile loads at `/workers/:id` showing bio, skills chips, experience, portfolio, ratings. **Phone & email hidden.** | ⬜ | ⬜ | ⬜ | ⬜ |
| **6** | Booking Request Creation | 1. Click "Request Booking"<br>2. Confirm proposed ₹4,000, date, time slot | Booking created with `status: "pending"`; visible in customer's `/my-bookings`. | ⬜ | ⬜ | ⬜ | ⬜ |
| **7** | Worker Counter-Offer | 1. Log in as Worker<br>2. Open booking<br>3. Counter with ₹4,500 + message | Booking transitions to `status: "countered"`; negotiation audit trail updated. | ⬜ | ⬜ | ⬜ | ⬜ |
| **8** | Customer Confirms Counter | 1. Customer reviews counter<br>2. Clicks "Accept Counter" | Booking transitions to `status: "accepted"`; `finalPrice: 4500`; job status becomes `booked`. | ⬜ | ⬜ | ⬜ | ⬜ |
| **9** | Completion & Star Review | 1. Customer clicks "Mark as Completed"<br>2. Submits 5-star review + text | Booking becomes `completed`; worker's `completedJobs` and `ratingAvg` recalculated. | ⬜ | ⬜ | ⬜ | ⬜ |
| **10** | Edge Cases & 409 Conflict | 1. Attempt duplicate booking for same job/worker<br>2. Attempt invalid state transitions | Server returns HTTP 409 with structured error envelope. | ⬜ | ⬜ | ⬜ | ⬜ |
| **11** | Vernacular Language Switcher | 1. Switch to Telugu (తెలుగు)<br>2. Switch to Hindi (हिंदी) | All navigation, buttons, professions, and status badges translate without missing keys. | ⬜ | ⬜ | ⬜ | ⬜ |
| **12** | Mobile Viewport & GPS Fallback | 1. Test on 375px mobile screen<br>2. Deny browser GPS permission | Clean mobile layout without horizontal overflow; GPS gracefully falls back to interactive map pin click. | ⬜ | ⬜ | ⬜ | ⬜ |

---

## Bug Reporting Protocol for Member 4
If an endpoint or UI screen violates the specification or API contract:
1. Open a GitHub Issue tagged `m1`, `m2`, or `m3` and label `blocker` or `bug`.
2. Reference the exact path in `docs/api-contract.md` or `docs/data-models.md`.
3. Provide expected vs actual JSON payload.
