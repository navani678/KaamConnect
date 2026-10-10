const FULL_WEEKDAY_NAMES = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday"
};

/**
 * Generates an explanation string based strictly on real calculated fields.
 *
 * Template:
 * "Matches your required skills[, specialises in X], is {d} km away, is {available|not confirmed available} on {weekday}, and has quoted ₹{quote}{, within your budget | , ₹{diff} above your budget}[, rated {r}/5 from {n} reviews][, ID verified]."
 *
 * @param {Object} params
 * @param {Object} params.job
 * @param {Object} params.worker
 * @param {number} params.distanceKm
 * @param {number} params.estimatedQuote
 * @param {string[]} params.matchedSpecializations
 * @param {boolean} params.availableOnDate
 * @param {string} params.weekdayName
 * @returns {string}
 */
export function generateExplanation({
  job,
  worker,
  distanceKm,
  estimatedQuote,
  matchedSpecializations = [],
  availableOnDate = true,
  weekdayName = ""
}) {
  const parts = [];

  // 1. Skills & Specializations
  let skillPart = "Matches your required skills";
  if (matchedSpecializations && matchedSpecializations.length > 0) {
    skillPart += `, specialises in ${matchedSpecializations.slice(0, 2).join(" & ")}`;
  }
  parts.push(skillPart);

  // 2. Distance
  const formattedDistance = Number(distanceKm).toFixed(1);
  parts.push(`is ${formattedDistance} km away`);

  // 3. Availability
  if (weekdayName && FULL_WEEKDAY_NAMES[weekdayName]) {
    const day = FULL_WEEKDAY_NAMES[weekdayName];
    if (availableOnDate) {
      parts.push(`is available on ${day}`);
    } else {
      parts.push(`is not confirmed available on ${day}`);
    }
  } else if (job?.preferredDate) {
    if (availableOnDate) {
      parts.push("is available on your requested date");
    } else {
      parts.push("is not confirmed available on your requested date");
    }
  }

  // 4. Quote and Budget
  const formattedQuote = `₹${Number(estimatedQuote).toLocaleString("en-IN")}`;
  let quotePart = `has quoted ${formattedQuote}`;

  if (job?.budgetMax != null && !isNaN(Number(job.budgetMax))) {
    const budgetMax = Number(job.budgetMax);
    if (estimatedQuote <= budgetMax) {
      quotePart += ", within your budget";
    } else {
      const diff = estimatedQuote - budgetMax;
      quotePart += `, ₹${diff.toLocaleString("en-IN")} above your budget`;
    }
  }
  parts.push(quotePart);

  let sentence = parts.join(", ");

  // 5. Reputation / Reviews
  const ratingCount = Number(worker?.ratingCount) || 0;
  const ratingAvg = Number(worker?.ratingAvg) || 0;
  if (ratingCount > 0) {
    sentence += `, rated ${ratingAvg.toFixed(1)}/5 from ${ratingCount} review${ratingCount === 1 ? "" : "s"}`;
  }

  // 6. ID Verification
  const isVerified = Boolean(
    worker?.verification?.idVerified || worker?.verified
  );
  if (isVerified) {
    sentence += ", ID verified";
  }

  sentence += ".";

  return sentence;
}

export default generateExplanation;
