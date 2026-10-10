# KaamConnect AI — Data Models Contract

All timestamps via Mongoose `{ timestamps: true }`. IDs are MongoDB `ObjectId`.

---

## 1. Enums (Shared)

```js
PROFESSIONS = [
  "electrician",
  "plumber",
  "carpenter",
  "painter",
  "mason",
  "tiles_flooring",
  "welder",
  "roofer",
  "house_cleaning",
  "construction_labourer"
];

ROLES = ["customer", "worker", "admin"];

RATE_TYPES = ["hourly", "daily", "project"];

JOB_STATUS = ["open", "booked", "completed", "cancelled"];

BOOKING_STATUS = [
  "pending",
  "countered",
  "accepted",
  "rejected",
  "cancelled",
  "completed"
];

TIME_SLOTS = ["morning", "afternoon", "evening", "anytime"];

LANGUAGES = ["en", "hi", "te", "ur", "ta", "kn", "mr"]; // UI languages: en, hi, te in v1

WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
```

---

## 2. User Model (Owner: Member 2)

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | Yes | Full name |
| `email` | String | Yes | Lowercase, unique |
| `phone` | String | Yes | 10-digit Indian mobile format |
| `passwordHash` | String | Yes | `select: false`, hashed with bcrypt |
| `role` | String (enum: `ROLES`) | Yes | `customer` or `worker` |
| `language` | String (enum: `LANGUAGES`) | No | Default: `"en"` |
| `avatarUrl` | String | No | Image URL |

---

## 3. WorkerProfile Model (Owner: Member 3)

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | Unique, required |
| `professions` | `[String]` (enum: `PROFESSIONS`) | Required, min 1 |
| `specializations` | `[String]` | e.g. `["wiring", "fan installation", "MCB"]` |
| `bio` | String | Max 500 characters |
| `experienceYears` | Number | `>= 0` |
| `rateType` | String (enum: `RATE_TYPES`) | Required |
| `rate` | Number | ₹ per hour / day / project baseline |
| `serviceRadiusKm` | Number | Default: 15 km |
| `location` | `{ type: "Point", coordinates: [lng, lat] }` | **2dsphere index** |
| `addressText` | String | Locality/landmark text |
| `availability` | Object | `{ weeklyDays: [WEEKDAYS], slots: [TIME_SLOTS], unavailableDates: [Date], isAvailableNow: Boolean }` |
| `languages` | `[String]` | e.g. `["te", "hi", "en"]` |
| `portfolio` | `[Object]` | `[{ url, caption, type: "image" \| "video" }]` |
| `certifications` | `[Object]` | `[{ title, issuer, year, documentUrl }]` |
| `verification` | Object | `{ idVerified: Boolean, verifiedAt: Date }` |
| `ratingAvg` | Number | Default: 0 (updated upon review) |
| `ratingCount` | Number | Default: 0 |
| `completedJobs` | Number | Default: 0 |
| `isActive` | Boolean | Default: true |

**Indexes:**
- `{ location: "2dsphere" }`
- `{ professions: 1 }`
- `{ isActive: 1 }`

---

## 4. JobRequest Model (Owner: Member 3)

| Field | Type | Notes |
|---|---|---|
| `customer` | ObjectId → User | Required |
| `profession` | String (enum: `PROFESSIONS`) | Required primary category |
| `title` | String | Short title |
| `description` | String | Up to 2000 chars |
| `media` | `[Object]` | Max 6 items: `[{ url, type: "image" \| "video" }]` |
| `location` | GeoJSON Point `[lng, lat]` | Worksite coordinates; **2dsphere index** |
| `addressText` | String | Landmark / area |
| `budgetMin` | Number | In ₹ INR |
| `budgetMax` | Number | In ₹ INR |
| `preferredDate` | Date | Target service date |
| `preferredTimeSlot` | String (enum: `TIME_SLOTS`) | Default: `"morning"` |
| `estimatedDuration` | Object | `{ value: Number, unit: "hours" \| "days" }` |
| `status` | String (enum: `JOB_STATUS`) | Default: `"open"` |
| `selectedBooking` | ObjectId → Booking | Populated on acceptance |

---

## 5. Booking Model (Owner: Member 3)

| Field | Type | Notes |
|---|---|---|
| `job` | ObjectId → JobRequest | Required |
| `customer` | ObjectId → User | Required |
| `worker` | ObjectId → User | Required (User ID, NOT profile ID) |
| `workerProfile` | ObjectId → WorkerProfile | Required |
| `scope` | String | Agreed scope of work |
| `proposedPrice` | Number | In ₹ INR |
| `finalPrice` | Number | Set on confirmed booking |
| `scheduledDate` | Date | Scheduled execution date |
| `timeSlot` | String (enum: `TIME_SLOTS`) | Scheduled slot |
| `negotiation` | `[Object]` | `[{ by: "customer" \| "worker", price: Number, message: String, at: Date }]` |
| `status` | String (enum: `BOOKING_STATUS`) | Default: `"pending"` |
| `rejectionReason` | String | Optional rejection message |
| `completedAt` | Date | Timestamp of completion |

**Indexes:**
- `{ worker: 1, status: 1 }`
- `{ customer: 1, status: 1 }`

---

## 6. Review Model (Owner: Member 3)

| Field | Type | Notes |
|---|---|---|
| `booking` | ObjectId → Booking | Unique, required (1 review per booking) |
| `customer` | ObjectId → User | Required |
| `worker` | ObjectId → User | Required |
| `workerProfile` | ObjectId → WorkerProfile | Required |
| `rating` | Number | 1 to 5 stars |
| `comment` | String | Max 500 characters |

---

## 7. Report Model (Owner: Member 3)

| Field | Type | Notes |
|---|---|---|
| `booking` | ObjectId → Booking | Required |
| `reporter` | ObjectId → User | Required |
| `against` | ObjectId → User | Required |
| `reason` | String | Enum: `["misconduct", "no_show", "overcharging", "poor_quality", "safety", "other"]` |
| `details` | String | Report details |
| `status` | String | Enum: `["open", "reviewed", "closed"]`, default: `"open"` |
