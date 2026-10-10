# KaamConnect AI — Matching & Scoring Specification

**Purpose:** Ranks available workers for a given `JobRequest` considering skills, geo-distance, budget fit, schedule availability, and verified reputation.

---

## 1. Hard Filters (Candidate Qualification)

A worker candidate must satisfy all hard filters:
1. `WorkerProfile.isActive == true`
2. `professions` contains `job.profession`
3. Distance to job ≤ `maxDistanceKm` (default 15 km) AND distance ≤ worker's own `serviceRadiusKm`
4. Not currently rejected/cancelled for this specific job

**Implementation Note:** Uses MongoDB `$geoNear` aggregation on `WorkerProfile.location` (2dsphere) with `spherical: true`, `distanceField: "distanceMeters"`.

---

## 2. Multi-Factor Scoring (Total 100 Points)

| Factor | Weight | Formula & Rules |
|---|---|---|
| **Skill Match** | 30 | Base **20** points for profession match.<br>Up to **+10** points for keyword overlap between `job.title` + `job.description` and worker `specializations`: `min(10, overlapCount * 4)`. |
| **Distance** | 25 | Inverse linear: `25 * max(0, 1 - distanceKm / maxDistanceKm)`. |
| **Price / Budget** | 20 | Evaluates `estimatedQuote` vs job budget `[budgetMin, budgetMax]`:<br>• In range `[budgetMin, budgetMax]`: **20** points<br>• Below `budgetMin`: **20** points (great value)<br>• Above `budgetMax`: `20 * max(0, 1 - (quote - budgetMax) / budgetMax)`<br>• No budget given by customer: neutral **10** points |
| **Availability** | 15 | • Preferred date matches worker's `weeklyDays` and is NOT in `unavailableDates`: **10** points<br>• Preferred time slot compatible: **+5** points<br>• Otherwise 0 (or 5 if `isAvailableNow == true` and date is within 24–48 hours) |
| **Reputation & Trust** | 10 | • Bayesian rating: `r = (ratingAvg * ratingCount + 3.5 * 5) / (ratingCount + 5)` → `(r / 5) * 5` (max 5 points)<br>• Experience: `min(2, experienceYears / 5)` (max 2 points)<br>• Portfolio: ≥ 3 media items → **+1** point<br>• Verification: `verification.idVerified == true` → **+2** points |

---

## 3. Estimated Quote Computation

```
hourly  : rate * hoursEstimate    (daysEstimate * 8 if estimatedDuration.unit == 'days')
daily   : rate * ceil(daysEstimate) (hoursEstimate / 8 if estimatedDuration.unit == 'hours', min 1)
project : rate
```

---

## 4. Explanation Generator (Truth-Grounded)

The match explanation MUST only cite real recorded data, never hallucinations:

```text
"Matches your required skills{specializationsClause}, is {d} km away, is {availabilityClause} on {weekday}, and has quoted ₹{quote}{budgetComparisonClause}{reputationClause}{verificationClause}."
```

Example output:
> *"Matches your required skills, specialises in wiring and fans, is 2.5 km away, is available on Saturday and has quoted ₹4,000, within your budget. Rated 4.6/5 from 23 reviews. ID verified."*

---

## 5. Tie-Breaker & Edge Cases
- When scores tie, sort ascending by `distanceKm`.
- If 0 workers qualify, return `items: []` and an actionable suggestion:
  *"No workers found within 15 km. Try increasing your search radius to 25 km or broadening your time slot."*
