import WorkerProfile from "../models/WorkerProfile.js";
import JobRequest from "../models/JobRequest.js";
import Review from "../models/Review.js";
import { toPoint, haversineKm, findWorkersNear } from "../services/geo.js";
import { rankWorkersForJob } from "../services/matching/index.js";
import { ApiError, ok, asyncHandler } from "../utils/response.js";

/**
 * GET /api/workers/me
 * Retrieves current worker's profile.
 */
export const getMe = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findOne({ user: req.user._id }).populate(
    "user",
    "name email phone language avatarUrl role"
  );
  if (!profile) {
    throw new ApiError(404, "NOT_FOUND", "Worker profile not found");
  }
  return ok(res, profile);
});

/**
 * PUT /api/workers/me
 * Create or update logged-in worker's profile.
 */
export const updateMe = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  delete data.user; // Cannot override ownership

  // Handle location conversion from { lat, lng } to GeoJSON Point
  if (data.location) {
    if (data.location.lat != null && data.location.lng != null) {
      data.location = toPoint(data.location.lat, data.location.lng);
    } else if (Array.isArray(data.location.coordinates)) {
      // Already GeoJSON
    }
  }

  const profile = await WorkerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: data, $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true, runValidators: true }
  ).populate("user", "name email phone language avatarUrl role");

  return ok(res, profile);
});

/**
 * POST /api/workers/me/portfolio
 * Add a portfolio item.
 */
export const addPortfolioItem = asyncHandler(async (req, res) => {
  const { url, caption, type = "image" } = req.body;
  if (!url) {
    throw new ApiError(400, "VALIDATION_ERROR", "Portfolio item URL is required");
  }

  const profile = await WorkerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $push: { portfolio: { url, caption, type } } },
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new ApiError(404, "NOT_FOUND", "Worker profile not found");
  }

  return ok(res, profile.portfolio);
});

/**
 * DELETE /api/workers/me/portfolio/:itemId
 * Remove a portfolio item.
 */
export const deletePortfolioItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const profile = await WorkerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { portfolio: { _id: itemId } } },
    { new: true }
  );

  if (!profile) {
    throw new ApiError(404, "NOT_FOUND", "Worker profile not found");
  }

  return ok(res, profile.portfolio);
});

/**
 * PATCH /api/workers/me/availability
 * Update availability settings.
 */
export const updateAvailability = asyncHandler(async (req, res) => {
  const availability = req.body;
  const profile = await WorkerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: { availability } },
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new ApiError(404, "NOT_FOUND", "Worker profile not found");
  }

  return ok(res, profile.availability);
});

/**
 * GET /api/workers/:id
 * Public worker profile + last 5 reviews.
 */
export const getWorkerById = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findById(req.params.id).populate(
    "user",
    "name avatarUrl language"
  );

  if (!profile || !profile.isActive) {
    throw new ApiError(404, "NOT_FOUND", "Worker profile not found");
  }

  // Fetch last 5 reviews
  const reviews = await Review.find({ workerProfile: profile._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("customer", "name avatarUrl");

  const profileData = profile.toObject();
  profileData.recentReviews = reviews;

  return ok(res, profileData);
});

/**
 * GET /api/workers/:id/reviews
 * Paginated reviews for a worker.
 */
export const getWorkerReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { workerProfile: req.params.id };

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "name avatarUrl"),
    Review.countDocuments(filter)
  ]);

  return ok(res, {
    items,
    page,
    limit,
    total
  });
});

/**
 * GET /api/workers
 * Browse/filter workers list.
 */
export const listWorkers = asyncHandler(async (req, res) => {
  const {
    profession,
    lat,
    lng,
    maxDistanceKm = 15,
    minRate,
    maxRate,
    minExperience,
    minRating,
    language,
    date,
    sort = "rating"
  } = req.query;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));

  const filter = { isActive: true };

  if (profession) {
    filter.professions = profession;
  }
  if (minRate != null || maxRate != null) {
    filter.rate = {};
    if (minRate != null) filter.rate.$gte = Number(minRate);
    if (maxRate != null) filter.rate.$lte = Number(maxRate);
  }
  if (minExperience != null) {
    filter.experienceYears = { $gte: Number(minExperience) };
  }
  if (minRating != null) {
    filter.ratingAvg = { $gte: Number(minRating) };
  }
  if (language) {
    filter.languages = language;
  }

  let workers = [];
  const hasGeo = lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng));
  const centerPoint = hasGeo ? [Number(lng), Number(lat)] : null;

  if (hasGeo) {
    try {
      workers = await findWorkersNear({
        profession,
        point: centerPoint,
        maxDistanceKm: Number(maxDistanceKm),
        filters: filter
      });
    } catch (err) {
      workers = await WorkerProfile.find(filter).populate(
        "user",
        "name avatarUrl language"
      );
      workers = workers.map((w) => {
        const obj = w.toObject();
        obj.distanceKm = haversineKm(centerPoint, obj.location.coordinates);
        return obj;
      }).filter((w) => w.distanceKm <= Number(maxDistanceKm));
    }
  } else {
    workers = await WorkerProfile.find(filter).populate(
      "user",
      "name avatarUrl language"
    );
    workers = workers.map((w) => {
      const obj = w.toObject();
      obj.distanceKm = null;
      return obj;
    });
  }

  // Filter by date if requested
  if (date) {
    const targetDate = new Date(date);
    const dayName = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][targetDate.getDay()];
    const dateStr = targetDate.toISOString().split("T")[0];

    workers = workers.filter((w) => {
      const avail = w.availability || {};
      const weekly = avail.weeklyDays || [];
      const unav = (avail.unavailableDates || []).map((d) =>
        new Date(d).toISOString().split("T")[0]
      );
      return weekly.includes(dayName) && !unav.includes(dateStr);
    });
  }

  // Sorting
  workers.sort((a, b) => {
    if (sort === "distance" && a.distanceKm != null && b.distanceKm != null) {
      return a.distanceKm - b.distanceKm;
    }
    if (sort === "rating") {
      return (b.ratingAvg || 0) - (a.ratingAvg || 0);
    }
    if (sort === "price") {
      return (a.rate || 0) - (b.rate || 0);
    }
    if (sort === "experience") {
      return (b.experienceYears || 0) - (a.experienceYears || 0);
    }
    return (b.ratingAvg || 0) - (a.ratingAvg || 0);
  });

  const total = workers.length;
  const skip = (page - 1) * limit;
  const items = workers.slice(skip, skip + limit);

  return ok(res, {
    items,
    page,
    limit,
    total
  });
});

/**
 * GET /api/jobs/:id/matches
 * Ranked matches for a job request (Owner customer only).
 */
export const getJobMatches = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  const job = await JobRequest.findById(jobId);

  if (!job) {
    throw new ApiError(404, "NOT_FOUND", "Job not found");
  }

  // Authorisation check: owner customer
  if (req.user && String(job.customer) !== String(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "FORBIDDEN", "You can only view matches for your own jobs");
  }

  const maxDistanceKm = Number(req.query.maxDistanceKm) || 15;
  const limit = Number(req.query.limit) || 20;

  const result = await rankWorkersForJob(job, { maxDistanceKm, limit });
  return ok(res, result);
});
