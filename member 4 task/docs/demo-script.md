# KaamConnect AI — Hackathon Demo Script (3–5 Minutes)

> **Storyline:** Problem (30s) → Customer Posts Job (60s) → AI Ranked Matches & Explainability (60s) → Booking Negotiation (60s) → Completion & Review (30s) → Local Language & Future Scope (30s).

---

## Roles During Demo
- **Speaker 1 (Member 4 / Member 2):** Narrator & Problem/Impact Pitch
- **Speaker 2 (Member 1 / Member 3):** Live Driver on UI / Screens

---

## Timeline & Step-by-Step Script

### Minute 0:00 – 0:30 | The Hook & Problem
- **Speaker 1:**
  > "In India, over 150 million informal skilled workers rely on roadside labour nakas or unverified middlemen. Customers struggle with opaque pricing, no skill verification, and delayed arrivals.
  > Today we present **KaamConnect AI**: *Find the Right Worker. Near You. At the Right Price.*"

### Minute 0:30 – 1:30 | Customer Posts a Job
- **Action (Driver):**
  - Open KaamConnect app.
  - Log in with demo customer account: `customer@demo.com` / `Demo@1234`.
  - Click **"Post a Job"**.
  - Select **Electrician**, describe task *"Install 3 ceiling fans and fix MCB trip in 3 rooms"*, set budget ₹3,000–₹5,000 for this Saturday.
  - Click **"Use My GPS"** (or point on Leaflet map in Warangal/Kazipet).
  - Submit job.
- **Speaker 1:**
  > "The customer posts their requirement in under 60 seconds with location tagging and transparent budget expectations."

### Minute 1:30 – 2:30 | AI-Ranked Matches & Grounded Explainability
- **Action (Driver):**
  - Land on `/customer/jobs/:id/matches`.
  - Highlight the top ranked worker card (Ravi Kumar - Electrician, 2.5 km away).
  - Show the **Match Score Bar (87.4%)** and read the **AI Explanation**:
    *"Matches your required skills, specialises in wiring and fans, is 2.5 km away, is available on Saturday, and has quoted ₹4,000, within your budget."*
  - Toggle between **List View** and **Interactive Map View**.
  - Adjust the **Distance Slider** and **Rating Filter** to demonstrate reactive re-ranking.
- **Speaker 1:**
  > "Notice how KaamConnect doesn't just return random results. Our 5-factor matching algorithm balances Skill, Proximity, Budget, Availability, and Bayesian Reputation. Crucially, the explanation is 100% grounded in real data—zero AI hallucinations."

### Minute 2:30 – 3:30 | Real-Time Negotiation & Booking
- **Action (Driver):**
  - Click **"Request Booking"** with proposed price ₹3,800.
  - Open worker dashboard in split window or switch account: `worker@demo.com` / `Demo@1234`.
  - Show pending notification.
  - Worker clicks **Counter-Offer** with ₹4,200 and note: *"Includes heavy-duty safety wiring."*
  - Customer receives counter and clicks **"Confirm & Accept"**.
  - Booking transitions to **Accepted / Booked**.
- **Speaker 1:**
  > "We respect both parties with bilateral negotiation. No rigid surge pricing or platform exploitation."

### Minute 3:30 – 4:00 | Job Completion, Review & Trust Safety
- **Action (Driver):**
  - Customer marks job as **Completed**.
  - Leaves a 5-star review: *"Quick and professional installation."*
  - Show the worker's updated rating count and Bayesian reputation score.
  - Point to Trust & Safety: ID verification badge, report modal, privacy safeguards (phone numbers protected until booking confirmation).

### Minute 4:00 – 4:30 | Vernacular Access & Impact
- **Action (Driver):**
  - Click Language Switcher in navbar: switch to **తెలుగు (Telugu)** then **हिंदी (Hindi)**.
  - Show that every core action, status, and category translates natively for Bharat users.
- **Speaker 1:**
  > "Language should never be a barrier to dignity of labor. KaamConnect supports native Telugu, Hindi, and English."

### Minute 4:30 – 5:00 | Wrap Up & Future Roadmap
- **Speaker 1:**
  > "With instant local geo-matching, transparent pricing, and multilingual voice assistance on our roadmap, KaamConnect empowers the backbone of our economy. Thank you, and we welcome your questions!"
