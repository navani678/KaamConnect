import { findWorkersNear, haversineKm } from "../geo.js";
import { calculateMatchScore } from "./scoring.js";
import { calculateEstimatedQuote } from "./quote.js";
import { generateExplanation } from "./explain.js";
import { DEFAULT_MAX_DISTANCE_KM } from "./constants.js";
import WorkerProfile from "../../models/WorkerProfile.js";

/**
 * Ranks candidate workers for a given job request.
 *
 * @param {Object} job - JobRequest document or object
 * @param {Object} [options={}]
 * @param {number} [options.maxDistanceKm=15] - Maximum search radius
 * @param {number} [options.limit=20] - Maximum workers to return
 * @returns {Promise<{ items: Array, total: number, suggestion?: string }>}
 */
export async function rankWorkersForJob(job, options = {}) {
  if (!job) {
    throw new Error("Job is required for matching");
  }

  const maxDistanceKm = Number(options.maxDistanceKm) || DEFAULT_MAX_DISTANCE_KM;
  const limit = Number(options.limit) || 20;

  // 1. Fetch nearby workers using geo aggregation if location exists, or fallback query
  let candidates = [];
  const jobLocation = job.location?.coordinates || (job.location?.lat != null && [job.location.lng, job.location.lat]);

  if (jobLocation) {
    try {
      candidates = await findWorkersNear({
        profession: job.profession,
        point: jobLocation,
        maxDistanceKm,
        filters: { isActive: true }
      });
    } catch (err) {
      // In-memory or fallback without geo index
      const allWorkers = await WorkerProfile.find({
        isActive: true,
        professions: job.profession
      }).populate("user");

      candidates = allWorkers.map((w) => {
        const workerObj = w.toObject ? w.toObject() : { ...w };
        const dKm = haversineKm(
          jobLocation,
          workerObj.location?.coordinates || [0, 0]
        );
        workerObj.distanceKm = dKm;
        workerObj.userData = workerObj.user;
        return workerObj;
      }).filter((w) => w.distanceKm <= maxDistanceKm && w.distanceKm <= (w.serviceRadiusKm || 15));
    }
  } else {
    // If job has no coordinates
    const allWorkers = await WorkerProfile.find({
      isActive: true,
      professions: job.profession
    }).populate("user");

    candidates = allWorkers.map((w) => {
      const workerObj = w.toObject ? w.toObject() : { ...w };
      workerObj.distanceKm = 0;
      workerObj.userData = workerObj.user;
      return workerObj;
    });
  }

  // 2. Score and transform each candidate
  const rankedItems = candidates.map((worker) => {
    const distanceKm = Number(worker.distanceKm || 0);
    const estimatedQuote = calculateEstimatedQuote(worker, job);

    const scoreResult = calculateMatchScore(job, worker, {
      distanceKm,
      maxDistanceKm,
      estimatedQuote
    });

    const isVerified = Boolean(
      worker.verification?.idVerified || worker.verified
    );

    const explanation = generateExplanation({
      job,
      worker,
      distanceKm,
      estimatedQuote,
      matchedSpecializations: scoreResult.matchedSpecializations,
      availableOnDate: scoreResult.availableOnDate,
      weekdayName: scoreResult.weekdayName
    });

    const portfolioPreview = (worker.portfolio || [])
      .slice(0, 3)
      .map((item) => (typeof item === "string" ? item : item.url));

    const userName =
      worker.userData?.name || worker.user?.name || worker.name || "Worker";
    const userId =
      worker.userData?._id || worker.user?._id || worker.user || worker.userId;
    const workerProfileId = worker._id;

    return {
      workerProfileId: String(workerProfileId),
      userId: String(userId),
      name: userName,
      professions: worker.professions || [],
      specializations: worker.specializations || [],
      experienceYears: Number(worker.experienceYears) || 0,
      ratingAvg: Number(worker.ratingAvg) || 0,
      ratingCount: Number(worker.ratingCount) || 0,
      rateType: worker.rateType || "hourly",
      rate: Number(worker.rate) || 0,
      estimatedQuote,
      distanceKm,
      availableOnDate: scoreResult.availableOnDate,
      verified: isVerified,
      portfolioPreview,
      score: scoreResult.score,
      breakdown: scoreResult.breakdown,
      explanation
    };
  });

  // 3. Sort by score descending; ties broken by distance ascending
  rankedItems.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.distanceKm - b.distanceKm;
  });

  const slicedItems = rankedItems.slice(0, limit);

  // 4. Edge cases & suggestions
  let suggestion;
  if (slicedItems.length === 0) {
    if (maxDistanceKm < 30) {
      suggestion = `No ${job.profession} found within ${maxDistanceKm} km. Try increasing search distance to 30 km.`;
    } else {
      suggestion = `No active ${job.profession} available nearby. Try broadening your job description or schedule.`;
    }
  }

  return {
    items: slicedItems,
    total: rankedItems.length,
    ...(suggestion && { suggestion })
  };
}

export {
  calculateMatchScore,
  calculateEstimatedQuote,
  generateExplanation,
  findMatchedSpecializations
} from "./scoring.js";

export default {
  rankWorkersForJob
};
