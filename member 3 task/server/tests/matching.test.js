import { describe, it, expect } from "vitest";
import {
  scoreSkill,
  scoreDistance,
  scorePrice,
  scoreAvailability,
  scoreReputation,
  calculateMatchScore
} from "../src/services/matching/scoring.js";
import { calculateEstimatedQuote } from "../src/services/matching/quote.js";
import { generateExplanation } from "../src/services/matching/explain.js";
import {
  tokenize,
  findMatchedSpecializations
} from "../src/services/matching/keywords.js";
import { haversineKm, toPoint, fromPoint } from "../src/services/geo.js";

describe("1. Geo Utilities", () => {
  it("converts lat/lng to GeoJSON Point format", () => {
    const point = toPoint(17.9689, 79.5941);
    expect(point).toEqual({
      type: "Point",
      coordinates: [79.5941, 17.9689]
    });
  });

  it("converts GeoJSON Point back to lat/lng", () => {
    const coords = fromPoint({ type: "Point", coordinates: [79.5941, 17.9689] });
    expect(coords).toEqual({ lat: 17.9689, lng: 79.5941 });
  });

  it("calculates accurate Haversine distance between Warangal and Hanamkonda", () => {
    // Warangal (17.9689, 79.5941) to Hanamkonda (18.0131, 79.5636) ~ 5.8 km
    const d = haversineKm([79.5941, 17.9689], [79.5636, 18.0131]);
    expect(d).toBeGreaterThan(4);
    expect(d).toBeLessThan(7);
  });
});

describe("2. Keyword & Specialization Matching", () => {
  it("tokenizes and filters stop words properly", () => {
    const tokens = tokenize("Need urgent wiring and switch repair please for house");
    expect(tokens).toContain("wiring");
    expect(tokens).toContain("switch");
    expect(tokens).toContain("repair");
    expect(tokens).not.toContain("need");
    expect(tokens).not.toContain("and");
    expect(tokens).not.toContain("for");
  });

  it("matches exact specialization in job description", () => {
    const matched = findMatchedSpecializations(
      "Fix ceiling fan and install MCB",
      ["fan", "wiring", "mcb"]
    );
    expect(matched).toContain("fan");
    expect(matched).toContain("mcb");
    expect(matched).not.toContain("wiring");
  });

  it("matches synonyms like 'faucet' <-> 'tap' or 'wire' <-> 'wiring'", () => {
    const matched = findMatchedSpecializations(
      "Bathroom faucet is leaking water",
      ["tap repair", "drain cleaning"]
    );
    expect(matched).toContain("tap repair");
  });
});

describe("3. Estimated Quote Calculations (Section 6.3)", () => {
  it("calculates hourly quote with hours duration", () => {
    const worker = { rateType: "hourly", rate: 200 };
    const job = { estimatedDuration: { value: 3, unit: "hours" } };
    expect(calculateEstimatedQuote(worker, job)).toBe(600);
  });

  it("calculates hourly quote with days duration (8h/day)", () => {
    const worker = { rateType: "hourly", rate: 100 };
    const job = { estimatedDuration: { value: 2, unit: "days" } };
    expect(calculateEstimatedQuote(worker, job)).toBe(1600);
  });

  it("calculates daily quote with days duration", () => {
    const worker = { rateType: "daily", rate: 800 };
    const job = { estimatedDuration: { value: 2, unit: "days" } };
    expect(calculateEstimatedQuote(worker, job)).toBe(1600);
  });

  it("calculates daily quote with hours duration (ceiling days, min 1)", () => {
    const worker = { rateType: "daily", rate: 900 };
    const job = { estimatedDuration: { value: 4, unit: "hours" } };
    expect(calculateEstimatedQuote(worker, job)).toBe(900); // 1 day minimum

    const job2 = { estimatedDuration: { value: 12, unit: "hours" } };
    expect(calculateEstimatedQuote(worker, job2)).toBe(1800); // ceil(12/8) = 2 days
  });

  it("calculates fixed project rate quote", () => {
    const worker = { rateType: "project", rate: 5000 };
    const job = { estimatedDuration: { value: 5, unit: "days" } };
    expect(calculateEstimatedQuote(worker, job)).toBe(5000);
  });
});

describe("4. Factor 1: Skill Scoring (Weight 30)", () => {
  it("returns 0 score when professions do not match", () => {
    const job = { profession: "electrician", title: "Wiring" };
    const worker = { professions: ["plumber"], specializations: ["wiring"] };
    const res = scoreSkill(job, worker);
    expect(res.score).toBe(0);
  });

  it("returns base 20 score for profession match with no specializations", () => {
    const job = { profession: "electrician", title: "General electrical work" };
    const worker = { professions: ["electrician"], specializations: [] };
    const res = scoreSkill(job, worker);
    expect(res.score).toBe(20);
  });

  it("awards up to 10 points bonus for matching specializations", () => {
    const job = {
      profession: "electrician",
      title: "Need fan installation, wiring, and MCB replacement in house"
    };
    const worker = {
      professions: ["electrician"],
      specializations: ["fan installation", "wiring", "MCB"]
    };
    const res = scoreSkill(job, worker);
    // Base 20 + min(10, 3 * 4) = 20 + 10 = 30
    expect(res.score).toBe(30);
    expect(res.matchedSpecializations.length).toBe(3);
  });
});

describe("5. Factor 2: Distance Scoring (Weight 25)", () => {
  it("gives full 25 points at 0 km distance", () => {
    expect(scoreDistance(0, 15)).toBe(25);
  });

  it("scales linearly with distance: 25 * (1 - d/maxDistance)", () => {
    expect(scoreDistance(7.5, 15)).toBe(12.5);
    expect(scoreDistance(3, 15)).toBe(20);
  });

  it("gives 0 points if distance exceeds max distance", () => {
    expect(scoreDistance(16, 15)).toBe(0);
    expect(scoreDistance(25, 15)).toBe(0);
  });
});

describe("6. Factor 3: Price Scoring (Weight 20)", () => {
  it("gives 20 points if quote is within budgetMin and budgetMax", () => {
    expect(scorePrice(4000, 3000, 5000)).toBe(20);
  });

  it("gives 20 points if quote is below budgetMin", () => {
    expect(scorePrice(2500, 3000, 5000)).toBe(20);
  });

  it("penalizes quote above budgetMax according to formula: 20 * (1 - (quote-max)/max)", () => {
    // max = 5000, quote = 6000 -> (6000-5000)/5000 = 0.2 -> 20 * 0.8 = 16
    expect(scorePrice(6000, 3000, 5000)).toBe(16);
  });

  it("returns 0 points if quote is double or more than budgetMax", () => {
    // max = 5000, quote = 10000 -> (10000-5000)/5000 = 1.0 -> 0
    expect(scorePrice(10000, 3000, 5000)).toBe(0);
  });

  it("gives neutral 10 points when no budget is specified", () => {
    expect(scorePrice(4000, null, null)).toBe(10);
    expect(scorePrice(4000, undefined, undefined)).toBe(10);
  });
});

describe("7. Factor 4: Availability Scoring (Weight 15)", () => {
  it("awards 15 points (10 day + 5 slot) for matched weekly day and time slot", () => {
    // 2026-10-17 is a Saturday
    const job = {
      preferredDate: "2026-10-17T00:00:00.000Z",
      preferredTimeSlot: "morning"
    };
    const worker = {
      availability: {
        weeklyDays: ["mon", "wed", "sat"],
        slots: ["morning", "evening"],
        unavailableDates: []
      }
    };
    const res = scoreAvailability(job, worker);
    expect(res.score).toBe(15);
    expect(res.availableOnDate).toBe(true);
  });

  it("awards 10 points if day matches but specific time slot is not offered", () => {
    const job = {
      preferredDate: "2026-10-17T00:00:00.000Z", // Saturday
      preferredTimeSlot: "afternoon"
    };
    const worker = {
      availability: {
        weeklyDays: ["sat"],
        slots: ["morning"],
        unavailableDates: []
      }
    };
    const res = scoreAvailability(job, worker);
    expect(res.score).toBe(10);
    expect(res.availableOnDate).toBe(true);
  });

  it("gives 0 points if worker is unavailable on that specific blocked date", () => {
    const job = {
      preferredDate: "2026-10-17T00:00:00.000Z",
      preferredTimeSlot: "morning"
    };
    const worker = {
      availability: {
        weeklyDays: ["sat"],
        slots: ["morning"],
        unavailableDates: [new Date("2026-10-17T00:00:00.000Z")],
        isAvailableNow: false
      }
    };
    const res = scoreAvailability(job, worker);
    expect(res.score).toBe(0);
    expect(res.availableOnDate).toBe(false);
  });

  it("handles missing job preferredDate with default availability score", () => {
    const worker = {
      availability: { isAvailableNow: true }
    };
    const res = scoreAvailability({}, worker);
    expect(res.score).toBe(15);
    expect(res.availableOnDate).toBe(true);
  });
});

describe("8. Factor 5: Reputation Scoring (Weight 10)", () => {
  it("calculates Bayesian rating correctly with 0 reviews (prior = 3.5)", () => {
    const worker = {
      ratingAvg: 0,
      ratingCount: 0,
      experienceYears: 0,
      portfolio: [],
      verification: { idVerified: false }
    };
    // Bayesian: (0*0 + 3.5*5)/(0+5) = 3.5 -> (3.5/5)*5 = 3.5
    expect(scoreReputation(worker)).toBe(3.5);
  });

  it("includes experience bonus, portfolio bonus, and verification bonus", () => {
    const worker = {
      ratingAvg: 4.8,
      ratingCount: 20,
      experienceYears: 10, // min(2, 10/5) = 2
      portfolio: [{ url: "1" }, { url: "2" }, { url: "3" }], // +1
      verification: { idVerified: true } // +2
    };
    // Bayesian: (4.8*20 + 3.5*5)/(25) = (96 + 17.5)/25 = 113.5/25 = 4.54
    // Total = 4.54 + 2 + 1 + 2 = 9.54 -> rounded ~9.5
    const score = scoreReputation(worker);
    expect(score).toBeGreaterThanOrEqual(9.5);
    expect(score).toBeLessThanOrEqual(10);
  });
});

describe("9. Total Score & Explanation Generation", () => {
  it("calculates accurate total score and breakdown", () => {
    const job = {
      profession: "electrician",
      title: "Install lights and fans",
      budgetMin: 3000,
      budgetMax: 5000,
      preferredDate: "2026-10-17T00:00:00.000Z", // Saturday
      preferredTimeSlot: "morning",
      estimatedDuration: { value: 1, unit: "days" }
    };
    const worker = {
      professions: ["electrician"],
      specializations: ["fans", "lights"],
      rateType: "daily",
      rate: 4000,
      experienceYears: 6,
      ratingAvg: 4.6,
      ratingCount: 23,
      portfolio: [{ url: "1" }, { url: "2" }, { url: "3" }],
      verification: { idVerified: true },
      availability: {
        weeklyDays: ["sat", "sun"],
        slots: ["morning"]
      }
    };

    const match = calculateMatchScore(job, worker, {
      distanceKm: 2.5,
      maxDistanceKm: 15
    });

    expect(match.score).toBeGreaterThan(80);
    expect(match.breakdown.skill).toBe(28);
    expect(match.breakdown.distance).toBeCloseTo(20.8, 1);
    expect(match.breakdown.price).toBe(20);
    expect(match.breakdown.availability).toBe(15);
  });

  it("generates truthful explanation adhering strictly to template", () => {
    const job = {
      profession: "electrician",
      title: "Wiring repair",
      budgetMax: 5000,
      preferredDate: "2026-10-17T00:00:00.000Z" // Saturday
    };
    const worker = {
      name: "Ravi Kumar",
      specializations: ["wiring"],
      ratingAvg: 4.6,
      ratingCount: 23,
      verification: { idVerified: true }
    };

    const explanation = generateExplanation({
      job,
      worker,
      distanceKm: 2.5,
      estimatedQuote: 4000,
      matchedSpecializations: ["wiring"],
      availableOnDate: true,
      weekdayName: "sat"
    });

    expect(explanation).toContain("Matches your required skills");
    expect(explanation).toContain("specialises in wiring");
    expect(explanation).toContain("is 2.5 km away");
    expect(explanation).toContain("is available on Saturday");
    expect(explanation).toContain("has quoted ₹4,000, within your budget");
    expect(explanation).toContain("rated 4.6/5 from 23 reviews");
    expect(explanation).toContain("ID verified");
  });

  it("generates explanation when over budget and not confirmed available", () => {
    const job = {
      profession: "plumber",
      title: "Pipe leak",
      budgetMax: 2000,
      preferredDate: "2026-10-17T00:00:00.000Z"
    };
    const worker = {
      name: "Suresh",
      ratingAvg: 0,
      ratingCount: 0
    };

    const explanation = generateExplanation({
      job,
      worker,
      distanceKm: 5.0,
      estimatedQuote: 2500,
      matchedSpecializations: [],
      availableOnDate: false,
      weekdayName: "sat"
    });

    expect(explanation).toContain("is 5.0 km away");
    expect(explanation).toContain("is not confirmed available on Saturday");
    expect(explanation).toContain("has quoted ₹2,500, ₹500 above your budget");
  });
});
