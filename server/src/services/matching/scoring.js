import { WEIGHTS, BAYESIAN_PRIOR_RATING, BAYESIAN_PRIOR_COUNT } from "./constants.js";
import { findMatchedSpecializations } from "./keywords.js";
import { calculateEstimatedQuote } from "./quote.js";

const WEEKDAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * Computes skill score (0-30).
 * Base 20 for profession match. + up to 10 for specializations overlap (min(10, overlapCount * 4)).
 * @param {Object} job
 * @param {Object} worker
 * @returns {{ score: number, matchedSpecializations: string[] }}
 */
export function scoreSkill(job, worker) {
  const workerProfessions = worker?.professions || [];
  const jobProfession = job?.profession;

  const hasProfessionMatch = workerProfessions.includes(jobProfession);
  if (!hasProfessionMatch) {
    return { score: 0, matchedSpecializations: [] };
  }

  const baseScore = 20;
  const jobText = `${job?.title || ""} ${job?.description || ""}`.trim();
  const matchedSpecializations = findMatchedSpecializations(
    jobText,
    worker?.specializations || []
  );

  const overlapBonus = Math.min(10, matchedSpecializations.length * 4);
  const totalSkillScore = Math.min(WEIGHTS.skill, baseScore + overlapBonus);

  return {
    score: Number(totalSkillScore.toFixed(1)),
    matchedSpecializations
  };
}

/**
 * Computes distance score (0-25).
 * Formula: 25 * max(0, 1 - d / maxDistanceKm).
 * @param {number} distanceKm
 * @param {number} [maxDistanceKm=15]
 * @returns {number}
 */
export function scoreDistance(distanceKm, maxDistanceKm = 15) {
  const d = Math.max(0, Number(distanceKm) || 0);
  const maxD = Number(maxDistanceKm) > 0 ? Number(maxDistanceKm) : 15;

  if (d > maxD) return 0;
  const score = WEIGHTS.distance * Math.max(0, 1 - d / maxD);
  return Number(score.toFixed(1));
}

/**
 * Computes price score (0-20).
 * In range -> 20. Below min -> 20. Above max -> 20 * max(0, 1 - (quote - max) / max). No budget given -> 10.
 * @param {number} estimatedQuote
 * @param {number|null|undefined} budgetMin
 * @param {number|null|undefined} budgetMax
 * @returns {number}
 */
export function scorePrice(estimatedQuote, budgetMin, budgetMax) {
  const quote = Number(estimatedQuote) || 0;
  const hasMin = budgetMin != null && !isNaN(Number(budgetMin));
  const hasMax = budgetMax != null && !isNaN(Number(budgetMax));
  const min = hasMin ? Number(budgetMin) : null;
  const max = hasMax ? Number(budgetMax) : null;

  // No budget specified -> neutral score 10
  if (!hasMin && !hasMax) {
    return 10;
  }

  if (hasMax) {
    if (quote <= max) {
      return 20;
    }
    // Quote is above budgetMax
    const penaltyRatio = (quote - max) / max;
    const score = WEIGHTS.price * Math.max(0, 1 - penaltyRatio);
    return Number(score.toFixed(1));
  }

  // Only budgetMin is given
  if (hasMin) {
    if (quote >= min) return 20;
    return 15;
  }

  return 10;
}

/**
 * Checks if a specific Date is today or tomorrow.
 * @param {Date} date
 * @returns {boolean}
 */
function isTodayOrTomorrow(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return target.getTime() === today.getTime() || target.getTime() === tomorrow.getTime();
}

/**
 * Computes availability score (0-15) and availability boolean flag.
 * Preferred date on a weeklyDays day and not in unavailableDates -> 10; time slot compatible -> +5.
 * Otherwise 0 (or 5 if isAvailableNow and date is today/tomorrow).
 * @param {Object} job
 * @param {Object} worker
 * @returns {{ score: number, availableOnDate: boolean, weekdayName: string }}
 */
export function scoreAvailability(job, worker) {
  const availability = worker?.availability || {};
  const weeklyDays = availability.weeklyDays || ["mon", "tue", "wed", "thu", "fri", "sat"];
  const unavailableDates = availability.unavailableDates || [];
  const slots = availability.slots || ["morning", "afternoon", "evening"];
  const isAvailableNow = availability.isAvailableNow ?? true;

  if (!job?.preferredDate) {
    // No specific preferred date given
    const score = isAvailableNow ? 15 : 10;
    return {
      score,
      availableOnDate: true,
      weekdayName: ""
    };
  }

  const prefDate = new Date(job.preferredDate);
  const dayIndex = prefDate.getDay();
  const weekdayName = WEEKDAY_NAMES[dayIndex]; // e.g. "sat"

  // Check if date is listed in unavailableDates
  const dateStr = prefDate.toISOString().split("T")[0];
  const isDateBlocked = unavailableDates.some((d) => {
    const unavStr = new Date(d).toISOString().split("T")[0];
    return unavStr === dateStr;
  });

  const isWeeklyDayAvailable = weeklyDays.includes(weekdayName) && !isDateBlocked;

  if (isWeeklyDayAvailable) {
    let slotScore = 0;
    const prefSlot = job.preferredTimeSlot || "anytime";
    if (
      prefSlot === "anytime" ||
      slots.includes(prefSlot) ||
      slots.includes("anytime")
    ) {
      slotScore = 5;
    }

    const total = 10 + slotScore;
    return {
      score: total,
      availableOnDate: true,
      weekdayName
    };
  }

  // Not available on the scheduled weekly calendar
  if (isAvailableNow && isTodayOrTomorrow(prefDate)) {
    return {
      score: 5,
      availableOnDate: true,
      weekdayName
    };
  }

  return {
    score: 0,
    availableOnDate: false,
    weekdayName
  };
}

/**
 * Computes reputation score (0-10).
 * Bayesian rating: r = (ratingAvg * ratingCount + 3.5 * 5) / (ratingCount + 5) -> (r / 5) * 5 (max 5).
 * Experience: min(2, years / 5) (max 2).
 * Portfolio >= 3 items -> +1.
 * Verified -> +2.
 * @param {Object} worker
 * @returns {number}
 */
export function scoreReputation(worker) {
  const ratingAvg = Number(worker?.ratingAvg) || 0;
  const ratingCount = Number(worker?.ratingCount) || 0;
  const experienceYears = Number(worker?.experienceYears) || 0;
  const portfolio = worker?.portfolio || [];
  const isVerified = Boolean(
    worker?.verification?.idVerified || worker?.verified
  );

  // 1. Bayesian rating (max 5)
  const bayesianR =
    (ratingAvg * ratingCount + BAYESIAN_PRIOR_RATING * BAYESIAN_PRIOR_COUNT) /
    (ratingCount + BAYESIAN_PRIOR_COUNT);
  const ratingScore = (bayesianR / 5) * 5;

  // 2. Experience score (max 2)
  const expScore = Math.min(2, experienceYears / 5);

  // 3. Portfolio bonus (max 1)
  const portfolioBonus = portfolio.length >= 3 ? 1 : 0;

  // 4. Verified bonus (max 2)
  const verifiedBonus = isVerified ? 2 : 0;

  const total = ratingScore + expScore + portfolioBonus + verifiedBonus;
  return Number(Math.min(WEIGHTS.reputation, total).toFixed(1));
}

/**
 * Calculates complete score breakdown and total score for a worker against a job.
 * @param {Object} job
 * @param {Object} worker
 * @param {Object} [options]
 * @param {number} [options.distanceKm]
 * @param {number} [options.maxDistanceKm=15]
 * @param {number} [options.estimatedQuote]
 * @returns {{ score: number, breakdown: { skill: number, distance: number, price: number, availability: number, reputation: number }, estimatedQuote: number, matchedSpecializations: string[], availableOnDate: boolean, weekdayName: string }}
 */
export function calculateMatchScore(job, worker, options = {}) {
  const distanceKm = options.distanceKm ?? 0;
  const maxDistanceKm = options.maxDistanceKm ?? 15;
  const estimatedQuote =
    options.estimatedQuote ?? calculateEstimatedQuote(worker, job);

  const skillResult = scoreSkill(job, worker);
  const distanceScore = scoreDistance(distanceKm, maxDistanceKm);
  const priceScore = scorePrice(estimatedQuote, job?.budgetMin, job?.budgetMax);
  const availabilityResult = scoreAvailability(job, worker);
  const reputationScore = scoreReputation(worker);

  const breakdown = {
    skill: skillResult.score,
    distance: distanceScore,
    price: priceScore,
    availability: availabilityResult.score,
    reputation: reputationScore
  };

  const rawTotal =
    breakdown.skill +
    breakdown.distance +
    breakdown.price +
    breakdown.availability +
    breakdown.reputation;

  const score = Number(Math.min(100, Math.max(0, rawTotal)).toFixed(1));

  return {
    score,
    breakdown,
    estimatedQuote,
    matchedSpecializations: skillResult.matchedSpecializations,
    availableOnDate: availabilityResult.availableOnDate,
    weekdayName: availabilityResult.weekdayName
  };
}
