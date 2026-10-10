/**
 * Calculates estimated quote in INR (₹) for a worker based on job estimated duration and worker rateType.
 *
 * Section 6.3:
 * hourly  : rate * hoursEstimate   (days*8 if unit=days)
 * daily   : rate * ceil(daysEstimate)   (hours/8 if unit=hours, min 1)
 * project : rate
 *
 * @param {Object} worker - WorkerProfile or worker data object
 * @param {Object} job - JobRequest or job data object
 * @returns {number} Estimated quote in INR integer
 */
export function calculateEstimatedQuote(worker, job) {
  const rate = Number(worker?.rate || 0);
  const rateType = worker?.rateType || "hourly";
  const duration = job?.estimatedDuration || { value: 1, unit: "hours" };
  const durationValue = Number(duration.value) > 0 ? Number(duration.value) : 1;
  const unit = duration.unit || "hours";

  if (rateType === "project") {
    return Math.round(rate);
  }

  if (rateType === "daily") {
    let days;
    if (unit === "hours") {
      days = Math.max(1, Math.ceil(durationValue / 8));
    } else {
      days = Math.max(1, Math.ceil(durationValue));
    }
    return Math.round(rate * days);
  }

  // hourly default
  let hours;
  if (unit === "days") {
    hours = durationValue * 8;
  } else {
    hours = durationValue;
  }
  return Math.round(rate * hours);
}

export default calculateEstimatedQuote;
