import WorkerProfile from "../models/WorkerProfile.js";

/**
 * Converts latitude and longitude to a GeoJSON Point object [lng, lat].
 * @param {number} lat
 * @param {number} lng
 * @returns {{ type: string, coordinates: [number, number] }}
 */
export function toPoint(lat, lng) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) {
    throw new Error("Invalid latitude or longitude values");
  }
  return {
    type: "Point",
    coordinates: [numLng, numLat]
  };
}

/**
 * Converts a GeoJSON Point or coordinates array to { lat, lng }.
 * @param {{ coordinates?: [number, number] } | [number, number]} point
 * @returns {{ lat: number, lng: number }}
 */
export function fromPoint(point) {
  if (!point) return { lat: 0, lng: 0 };
  const coords = Array.isArray(point) ? point : point.coordinates;
  if (!coords || coords.length < 2) return { lat: 0, lng: 0 };
  return {
    lng: coords[0],
    lat: coords[1]
  };
}

/**
 * Calculates Haversine distance in kilometers between two points.
 * Supports { lat, lng } objects or GeoJSON [lng, lat] coordinate arrays.
 * @param {{ lat: number, lng: number } | [number, number]} a
 * @param {{ lat: number, lng: number } | [number, number]} b
 * @returns {number} Distance in kilometers
 */
export function haversineKm(a, b) {
  const getLatLng = (pt) => {
    if (Array.isArray(pt)) return { lat: pt[1], lng: pt[0] };
    if (pt?.coordinates) return { lat: pt.coordinates[1], lng: pt.coordinates[0] };
    return { lat: Number(pt?.lat || 0), lng: Number(pt?.lng || 0) };
  };

  const p1 = getLatLng(a);
  const p2 = getLatLng(b);

  const R = 6371; // Earth's mean radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const sinHalfDLat = Math.sin(dLat / 2);
  const sinHalfDLng = Math.sin(dLng / 2);

  const h =
    sinHalfDLat * sinHalfDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfDLng * sinHalfDLng;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Number((R * c).toFixed(2));
}

/**
 * Finds nearby active workers using MongoDB $geoNear aggregation.
 * @param {Object} params
 * @param {string} [params.profession] Main worker profession filter
 * @param {{ type: string, coordinates: [number, number] } | [number, number] | { lat: number, lng: number }} params.point Center point
 * @param {number} [params.maxDistanceKm=15] Max distance search in km
 * @param {Object} [params.filters={}] Extra Mongo filters
 * @returns {Promise<Array>} List of worker profiles with distanceKm attached and populated user
 */
export async function findWorkersNear({
  profession,
  point,
  maxDistanceKm = 15,
  filters = {}
}) {
  let coords;
  if (Array.isArray(point)) {
    coords = point;
  } else if (point?.coordinates) {
    coords = point.coordinates;
  } else if (point?.lat != null && point?.lng != null) {
    coords = [Number(point.lng), Number(point.lat)];
  } else {
    throw new Error("Invalid point parameter for geo search");
  }

  const maxDistanceMeters = maxDistanceKm * 1000;

  const matchQuery = {
    isActive: true,
    ...filters
  };

  if (profession) {
    matchQuery.professions = profession;
  }

  const pipeline = [
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: coords
        },
        distanceField: "distanceMeters",
        maxDistance: maxDistanceMeters,
        spherical: true,
        query: matchQuery
      }
    },
    {
      $addFields: {
        distanceKm: {
          $round: [{ $divide: ["$distanceMeters", 1000] }, 1]
        }
      }
    },
    {
      // Filter out workers whose serviceRadiusKm is smaller than the calculated distance
      $match: {
        $expr: {
          $gte: ["$serviceRadiusKm", "$distanceKm"]
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData"
      }
    },
    {
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: true
      }
    }
  ];

  return await WorkerProfile.aggregate(pipeline);
}

export default {
  toPoint,
  fromPoint,
  haversineKm,
  findWorkersNear
};
