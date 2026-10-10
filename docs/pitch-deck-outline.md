# KaamConnect AI — Pitch Deck Outline (8 Slides)

---

## Slide 1: Title & Vision
- **Header:** KaamConnect AI
- **Tagline:** Find the Right Worker. Near You. At the Right Price.
- **Subtext:** AI-Powered Hyperlocal Blue-Collar Gig Economy Platform for Bharat.
- **Team:** Antigravity Team of 4 (Frontend, Backend APIs, Geo/Matching Engine, Integration & DevOps).

---

## Slide 2: The Problem (The Broken Blue-Collar Marketplace)
- **Customer Pain Points:**
  - Hard to find reliable, verified nearby electricians, plumbers, masons.
  - Opaque, erratic pricing with zero upfront estimates.
  - Delayed response and mismatch in scheduling.
- **Worker Pain Points:**
  - Standing for hours at physical labour nakas without guaranteed daily work.
  - Middlemen taking 20–30% platform cuts.
  - Language barriers in modern English-only gig apps.

---

## Slide 3: The Solution — KaamConnect AI
- **Instant Geo-Matching:** Find verified workers within 2–15 km using MongoDB 2dsphere indexing.
- **Bilateral Price Negotiation:** Customers propose; workers can counter-offer without platform penalty.
- **Multilingual-First:** Native Telugu, Hindi, and English support.
- **Zero Hallucination Explainability:** Match scores explain *why* this worker is recommended based on real stored metrics.

---

## Slide 4: How AI Matching Works (The 5-Factor Engine)
- **1. Skill Relevance (30%):** Exact trade match + keyword specialization overlap.
- **2. Geo-Proximity (25%):** Inverse distance decay within mutual service radii.
- **3. Price & Budget Fit (20%):** Intelligent quote estimator evaluated against customer budget window.
- **4. Temporal Availability (15%):** Weekly schedule and slot compatibility check.
- **5. Trust & Reputation (10%):** Bayesian smoothed ratings + government ID verification bonus.

---

## Slide 5: Product Walkthrough & Key Features
- **Job Posting:** 4-step wizard with location detection and photo upload.
- **Ranked Discovery:** Interactive map view and transparent score breakdown.
- **Negotiation Workflow:** Real-time counter-offers with audit trail.
- **Trust Architecture:** Pre-booking phone privacy, post-completion verified reviews, and dispute reporting.

---

## Slide 6: Architecture & Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Leaflet / OpenStreetMap, react-i18next.
- **Backend:** Node.js, Express, Zod validation, JWT authentication.
- **Database:** MongoDB Atlas, 2dsphere geospatial indexing, aggregation pipelines.
- **Storage & DevOps:** Cloudinary CDN, Render/Railway, GitHub Actions CI/CD.

---

## Slide 7: Market Opportunity & Impact
- **Market Size:** Over 150M informal workers in India; informal home services market is $50B+.
- **Economic Dignity:** Direct worker-to-consumer connection with zero exploitative commission fees in v1.
- **Regional Inclusion:** Tier-2 and Tier-3 city focus starting from Telangana (Warangal/Kazipet).

---

## Slide 8: Roadmap & Future Scope
- **Voice & Speech AI:** Voice-based job posting in Telugu & Hindi for low-literacy workers.
- **Computer Vision Auto-Classification:** Auto-detect repair issues from uploaded photos (e.g., broken pipe, burnt fuse).
- **Escrow Micro-Payments:** UPI milestone payments with instant worker payout.
- **Offline PWA:** SMS/WhatsApp job notification bridge.
