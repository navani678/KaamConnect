import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

import {
  User,
  WorkerProfile,
  JobRequest,
  Booking,
  Review,
  Report,
  PROFESSIONS
} from "../models/index.js";
import { toPoint } from "../services/geo.js";
import { rankWorkersForJob } from "../services/matching/index.js";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/kaamconnect";

// Center point: Warangal (17.9689, 79.5941)
const CENTER_LAT = 17.9689;
const CENTER_LNG = 79.5941;

/**
 * Generates coordinate offset within a radius in km.
 * 1 degree latitude ~ 111 km. 1 degree longitude ~ 111 * cos(lat) km.
 */
function getRandomLocation(centerLat = CENTER_LAT, centerLng = CENTER_LNG, maxRadiusKm = 15) {
  const radiusInDegrees = maxRadiusKm / 111.32;
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  const newLat = centerLat + y;
  const newLng = centerLng + x / Math.cos((centerLat * Math.PI) / 180);

  return {
    lat: Number(newLat.toFixed(6)),
    lng: Number(newLng.toFixed(6))
  };
}

const FIRST_NAMES = [
  "Ravi", "Suresh", "Ramesh", "Venkatesh", "Nagaraju", "Praveen", "Kiran",
  "Mahesh", "Srinivas", "Santosh", "Vijay", "Anil", "Rajesh", "Satish",
  "Ganesh", "Naresh", "Manoj", "Ajay", "Prasad", "Srikanth", "Bhanu",
  "Kalyan", "Shiva", "Harish", "Sai", "Govind", "Mohan", "Raghu",
  "Sunil", "Laxman", "Chandra", "Sekhar", "Raju", "Vikram", "Krishna"
];

const LAST_NAMES = [
  "Kumar", "Reddy", "Rao", "Sharma", "Varma", "Goud", "Yadav",
  "Chary", "Patel", "Singh", "Swamy", "Nayak", "Kulkarni", "Das",
  "Murthy", "Gupta", "Babu", "Vemula", "Bandi", "Katta", "Mekala"
];

const SPECIALIZATIONS_MAP = {
  electrician: ["wiring", "fan installation", "MCB replacement", "light fixtures", "inverter setup", "switchboard repair", "fuse repair"],
  plumber: ["pipe leakage", "tap repair", "drain cleaning", "toilet commode", "sink installation", "water tank", "motor pump repair"],
  carpenter: ["door lock repair", "cupboard almirah", "bed assembly", "wooden furniture", "door frame fixing", "window repairs"],
  painter: ["wall putty", "interior painting", "exterior distemper", "waterproofing", "primer application", "texture painting"],
  mason: ["brick wall construction", "cement plastering", "floor screeding", "slab repair", "patchwork masonry"],
  tiles_flooring: ["vitrified tile laying", "bathroom wall tiles", "granite floor fixing", "tile grouting", "marble polishing"],
  welder: ["iron gate fabrication", "window grill welding", "balcony railing", "metal shutter repair", "shed welding"],
  roofer: ["terrace waterproofing", "asbestos sheet roofing", "tin shed installation", "roof leak sealing", "polycarbonate roof"],
  house_cleaning: ["deep house cleaning", "kitchen degreasing", "bathroom scrubbing", "sofa cleaning", "floor mopping"],
  construction_labourer: ["loading and unloading", "debris removal", "material shifting", "digging and trenching", "concrete mixing"]
};

const SAMPLE_PORTFOLIO_IMAGES = [
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80"
];

const LOCALITIES = [
  "Naimnagar, Hanamkonda",
  "Subedari, Hanamkonda",
  "Kazipet Junction, Kazipet",
  "Mandi Bazar, Warangal",
  "Balasamudram, Hanamkonda",
  "Waddepally, Hanamkonda",
  "Kishanpura, Hanamkonda",
  "Ramnagar, Kazipet",
  "Pochamma Maidan, Warangal",
  "Fort Road, Warangal"
];

export async function seedDatabase({ reset = true } = {}) {
  console.log("Connecting to MongoDB:", MONGO_URI.replace(/:[^:@]+@/, ":***@"));
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB successfully.");

  if (reset) {
    console.log("Wiping existing collections for fresh seed...");
    await Promise.all([
      User.deleteMany({}),
      WorkerProfile.deleteMany({}),
      JobRequest.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Report.deleteMany({})
    ]);
    console.log("Collections wiped.");
  }

  const passwordHash = await bcrypt.hash("Demo@1234", 10);

  // 1. Create Admin User
  const adminUser = await User.create({
    name: "Admin User",
    email: "admin@kaamconnect.com",
    phone: "9876543210",
    passwordHash,
    role: "admin",
    language: "en"
  });

  // 2. Create 6 Customers
  const customerNames = [
    { name: "Rahul Sharma", email: "customer@demo.com", phone: "9848012345" }, // DEMO CUSTOMER
    { name: "Ananya Deshmukh", email: "ananya@example.com", phone: "9848023456" },
    { name: "Vikram Malhotra", email: "vikram@example.com", phone: "9848034567" },
    { name: "Sneha Reddy", email: "sneha@example.com", phone: "9848045678" },
    { name: "Arun Varma", email: "arun@example.com", phone: "9848056789" },
    { name: "Pooja Hegde", email: "pooja@example.com", phone: "9848067890" }
  ];

  const customers = [];
  for (const c of customerNames) {
    const cust = await User.create({
      name: c.name,
      email: c.email,
      phone: c.phone,
      passwordHash,
      role: "customer",
      language: "te"
    });
    customers.push(cust);
  }
  const demoCustomer = customers[0];

  // 3. Create 45 Workers (>= 4 per profession)
  console.log("Creating 45 realistic workers across 10 professions...");

  const workers = [];
  const workerProfiles = [];

  // Specifically create DEMO WORKER (Electrician ~2.5 km away from demo customer)
  const demoWorkerUser = await User.create({
    name: "Ravi Kumar (Demo Electrician)",
    email: "worker@demo.com",
    phone: "9848111222",
    passwordHash,
    role: "worker",
    language: "te"
  });

  // 2.5 km offset from center (~0.022 degrees)
  const demoWorkerLoc = { lat: 17.9850, lng: 79.6050 };
  const demoWorkerProfile = await WorkerProfile.create({
    user: demoWorkerUser._id,
    professions: ["electrician"],
    specializations: ["wiring", "fan installation", "MCB replacement", "light fixtures"],
    bio: "Certified licensed electrician with 8 years of residential and commercial wiring experience in Warangal/Hanamkonda.",
    experienceYears: 8,
    rateType: "daily",
    rate: 900,
    serviceRadiusKm: 15,
    location: toPoint(demoWorkerLoc.lat, demoWorkerLoc.lng),
    addressText: "Subedari, Hanamkonda",
    availability: {
      weeklyDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
      slots: ["morning", "afternoon", "evening"],
      unavailableDates: [],
      isAvailableNow: true
    },
    languages: ["te", "hi", "en"],
    portfolio: [
      { url: SAMPLE_PORTFOLIO_IMAGES[0], caption: "Complete house LED lighting setup", type: "image" },
      { url: SAMPLE_PORTFOLIO_IMAGES[1], caption: "3-Phase MCB distribution board", type: "image" },
      { url: SAMPLE_PORTFOLIO_IMAGES[2], caption: "Ceiling fan wiring", type: "image" }
    ],
    certifications: [
      { title: "ITI Electrical Trade Certificate", issuer: "Govt ITI Warangal", year: 2016, documentUrl: "https://example.com/cert.pdf" }
    ],
    verification: { idVerified: true, verifiedAt: new Date("2024-01-15") },
    ratingAvg: 4.8,
    ratingCount: 28,
    completedJobs: 42,
    isActive: true
  });

  workers.push(demoWorkerUser);
  workerProfiles.push(demoWorkerProfile);

  // Remaining 44 workers distributed across professions
  let workerIdx = 1;
  for (let i = 0; i < PROFESSIONS.length; i++) {
    const prof = PROFESSIONS[i];
    const countForProf = (i === 0) ? 4 : 4 + (i % 2); // 4 or 5 workers per profession

    for (let j = 0; j < countForProf; j++) {
      if (workers.length >= 45) break;

      const fName = FIRST_NAMES[(workerIdx * 3) % FIRST_NAMES.length];
      const lName = LAST_NAMES[(workerIdx * 5) % LAST_NAMES.length];
      const fullName = `${fName} ${lName}`;
      const email = `worker${workerIdx}@kaamconnect.com`;
      const phone = `9848${String(100000 + workerIdx).slice(1)}`;

      const user = await User.create({
        name: fullName,
        email,
        phone,
        passwordHash,
        role: "worker",
        language: workerIdx % 3 === 0 ? "hi" : "te"
      });

      const loc = getRandomLocation(CENTER_LAT, CENTER_LNG, 14);
      const allSpecs = SPECIALIZATIONS_MAP[prof] || [];
      const workerSpecs = allSpecs.slice(0, 3 + (workerIdx % 3));
      const rateType = ["hourly", "daily", "daily", "project"][workerIdx % 4];
      const rate =
        rateType === "hourly"
          ? 150 + (workerIdx % 5) * 50
          : rateType === "daily"
          ? 700 + (workerIdx % 6) * 100
          : 2500 + (workerIdx % 4) * 1000;

      const exp = 1 + (workerIdx % 18);
      const isVerified = workerIdx % 3 !== 0;
      const ratingAvg = Number((3.5 + (workerIdx % 15) * 0.1).toFixed(1));
      const ratingCount = 5 + (workerIdx % 35);
      const locality = LOCALITIES[workerIdx % LOCALITIES.length];

      const profile = await WorkerProfile.create({
        user: user._id,
        professions: [prof],
        specializations: workerSpecs,
        bio: `Experienced ${prof.replace("_", " ")} serving ${locality} and nearby areas with quality workmanship.`,
        experienceYears: exp,
        rateType,
        rate,
        serviceRadiusKm: 12 + (workerIdx % 8),
        location: toPoint(loc.lat, loc.lng),
        addressText: locality,
        availability: {
          weeklyDays: ["mon", "tue", "wed", "thu", "fri", "sat"].filter((_, dIdx) => (workerIdx + dIdx) % 7 !== 0),
          slots: ["morning", "afternoon", "evening"].filter((_, sIdx) => (workerIdx + sIdx) % 3 !== 0),
          unavailableDates: workerIdx % 4 === 0 ? [new Date(Date.now() + 86400000 * 5)] : [],
          isAvailableNow: workerIdx % 5 !== 0
        },
        languages: ["te", "hi", "en"].slice(0, 1 + (workerIdx % 3)),
        portfolio: [
          { url: SAMPLE_PORTFOLIO_IMAGES[workerIdx % SAMPLE_PORTFOLIO_IMAGES.length], caption: "Recent completed site work", type: "image" },
          { url: SAMPLE_PORTFOLIO_IMAGES[(workerIdx + 1) % SAMPLE_PORTFOLIO_IMAGES.length], caption: "Finishing detail", type: "image" }
        ],
        verification: {
          idVerified: isVerified,
          verifiedAt: isVerified ? new Date() : null
        },
        ratingAvg,
        ratingCount,
        completedJobs: ratingCount + (workerIdx % 10),
        isActive: true
      });

      workers.push(user);
      workerProfiles.push(profile);
      workerIdx++;
    }
  }

  console.log(`Created ${workers.length} workers and worker profiles.`);

  // 4. Create Demo Job Request (Section 10.5)
  // "Install lights and fans in 3 rooms, budget ₹3,000–₹5,000, this Saturday"
  const nextSaturday = new Date();
  const daysUntilSat = (6 - nextSaturday.getDay() + 7) % 7 || 7;
  nextSaturday.setDate(nextSaturday.getDate() + daysUntilSat);
  nextSaturday.setHours(9, 0, 0, 0);

  const demoJob = await JobRequest.create({
    customer: demoCustomer._id,
    profession: "electrician",
    title: "Install lights and fans in 3 rooms",
    description: "Need ceiling fan installation, wiring check, and LED tube light fixtures for 3 bedrooms in new flat. Urgently needed.",
    media: [
      { url: SAMPLE_PORTFOLIO_IMAGES[0], type: "image" }
    ],
    location: toPoint(CENTER_LAT, CENTER_LNG),
    addressText: "Naimnagar, Hanamkonda",
    budgetMin: 3000,
    budgetMax: 5000,
    preferredDate: nextSaturday,
    preferredTimeSlot: "morning",
    estimatedDuration: { value: 1, unit: "days" },
    status: "open"
  });

  console.log("Created Featured Demo Job:", demoJob.title);

  // Create ~9 more realistic jobs across customers and professions
  const sampleJobTitles = [
    { prof: "plumber", title: "Bathroom pipeline leak and tap replacement", desc: "Water leakage under washbasin and kitchen sink tap needs fixing.", min: 800, max: 2000, dur: { value: 4, unit: "hours" } },
    { prof: "carpenter", title: "Wooden wardrobe doors alignment & lock fix", desc: "Main bedroom almirah doors are stuck and latch needs replacement.", min: 1200, max: 2500, dur: { value: 5, unit: "hours" } },
    { prof: "painter", title: "2 BHK interior wall putty & paint touch up", desc: "Living room and hall putty sanding with Asian Paints Royal emulsion.", min: 6000, max: 12000, dur: { value: 3, unit: "days" } },
    { prof: "mason", title: "Compound wall plastering & brick repair", desc: "Front gate pillar damaged by lorry, needs brick rebuilding and cement plaster.", min: 3500, max: 7000, dur: { value: 2, unit: "days" } },
    { prof: "tiles_flooring", title: "Kitchen wall tiles installation", desc: "Need 60 sq ft vitrified tiles installed over kitchen platform.", min: 2500, max: 5000, dur: { value: 1, unit: "days" } },
    { prof: "welder", title: "Balcony iron safety grill fabrication", desc: "Custom safety grill for second-floor balcony with rust-resistant primer.", min: 4000, max: 8000, dur: { value: 2, unit: "days" } },
    { prof: "house_cleaning", title: "Full deep cleaning before housewarming", desc: "Thorough cleaning of bathrooms, tiles, kitchen chimney and floor mopping.", min: 2000, max: 4500, dur: { value: 6, unit: "hours" } },
    { prof: "roofer", title: "Terrace roof sheet leak sealing", desc: "Tin shed roof joints leaking during rains, needs waterproofing sealant.", min: 1500, max: 3500, dur: { value: 4, unit: "hours" } },
    { prof: "construction_labourer", title: "Site debris clearing & sand unloading", desc: "Need 2 helpers to shift building sand and load debris onto tractor.", min: 1000, max: 2500, dur: { value: 1, unit: "days" } }
  ];

  const jobs = [demoJob];
  for (let i = 0; i < sampleJobTitles.length; i++) {
    const sj = sampleJobTitles[i];
    const cust = customers[(i + 1) % customers.length];
    const jobLoc = getRandomLocation(CENTER_LAT, CENTER_LNG, 10);
    const j = await JobRequest.create({
      customer: cust._id,
      profession: sj.prof,
      title: sj.title,
      description: sj.desc,
      location: toPoint(jobLoc.lat, jobLoc.lng),
      addressText: LOCALITIES[i % LOCALITIES.length],
      budgetMin: sj.min,
      budgetMax: sj.max,
      preferredDate: new Date(Date.now() + 86400000 * (i + 2)),
      preferredTimeSlot: ["morning", "afternoon", "evening"][i % 3],
      estimatedDuration: sj.dur,
      status: ["open", "open", "booked", "completed"][i % 4]
    });
    jobs.push(j);
  }

  // 5. Create ~12 Bookings across statuses (pending, countered, accepted, completed, rejected, cancelled)
  console.log("Creating bookings across all statuses...");
  const bookingStatuses = [
    "pending", "countered", "accepted", "completed",
    "rejected", "cancelled", "completed", "accepted",
    "pending", "completed", "completed", "countered"
  ];

  const bookings = [];
  for (let i = 0; i < bookingStatuses.length; i++) {
    const status = bookingStatuses[i];
    const job = jobs[i % jobs.length];
    const workerProf = workerProfiles[(i * 3) % workerProfiles.length];
    const workerUser = workers.find((w) => String(w._id) === String(workerProf.user));
    const customerUser = customers[i % customers.length];

    const proposedPrice = job.budgetMin || 2500;
    const finalPrice = status === "accepted" || status === "completed" ? proposedPrice : null;

    const b = await Booking.create({
      job: job._id,
      customer: customerUser._id,
      worker: workerUser._id,
      workerProfile: workerProf._id,
      scope: `Agreed work for ${job.title}`,
      proposedPrice,
      finalPrice,
      scheduledDate: job.preferredDate || new Date(),
      timeSlot: job.preferredTimeSlot || "morning",
      negotiation: [
        {
          by: "customer",
          price: proposedPrice,
          message: "Looking forward to getting this completed soon."
        },
        ...(status === "countered"
          ? [
              {
                by: "worker",
                price: proposedPrice + 500,
                message: "Can do for ₹" + (proposedPrice + 500) + " including minor materials."
              }
            ]
          : [])
      ],
      status,
      completedAt: status === "completed" ? new Date() : null
    });
    bookings.push(b);
  }

  // 6. Create ~60 Reviews for completed bookings and past worker history
  console.log("Creating ~60 realistic reviews...");
  const sampleComments = [
    "Excellent work! Came on time, finished the wiring neatly and tested everything.",
    "Very professional behaviour. Honest pricing and clean finishing.",
    "Good service. Prompt response and arrived within 30 minutes of calling.",
    "Skillful worker. Solved an electrical issue that two other people couldn't fix.",
    "Polite and hardworking. Reasonable rates compared to market.",
    "Fast and reliable. Cleared all the debris after finishing the work.",
    "Great workmanship. Highly recommended for any household repair.",
    "Very satisfied with the quality of work. Will hire again."
  ];

  for (let i = 0; i < 60; i++) {
    const workerProf = workerProfiles[i % workerProfiles.length];
    const cust = customers[i % customers.length];
    const rating = [4, 5, 5, 4, 3, 5, 5, 4][i % 8];

    // Associate with existing completed booking or a dedicated placeholder booking
    const compBooking = bookings.find((b) => b.status === "completed" && String(b.workerProfile) === String(workerProf._id));
    const bookingId = compBooking ? compBooking._id : new mongoose.Types.ObjectId();

    try {
      await Review.create({
        booking: bookingId,
        customer: cust._id,
        worker: workerProf.user,
        workerProfile: workerProf._id,
        rating,
        comment: sampleComments[i % sampleComments.length]
      });
    } catch (e) {
      // Ignore unique booking duplicates in seed loop
    }
  }

  // 7. Run and display matching for the Demo Job
  console.log("\n=======================================================");
  console.log("   TESTING MATCHING ENGINE WITH DEMO JOB REQUEST");
  console.log("=======================================================");
  const matchResult = await rankWorkersForJob(demoJob, { maxDistanceKm: 15, limit: 5 });

  console.log(`Found ${matchResult.total} matches. Top 5 Ranked Workers:`);
  matchResult.items.forEach((item, rank) => {
    console.log(`\n#${rank + 1} ${item.name} (Score: ${item.score}/100)`);
    console.log(`   - Distance: ${item.distanceKm} km | Quote: ₹${item.estimatedQuote} | Rate: ₹${item.rate}/${item.rateType}`);
    console.log(`   - Rating: ${item.ratingAvg}★ (${item.ratingCount} reviews) | Exp: ${item.experienceYears} yrs | Verified: ${item.verified}`);
    console.log(`   - Breakdown: Skill=${item.breakdown.skill}, Dist=${item.breakdown.distance}, Price=${item.breakdown.price}, Avail=${item.breakdown.availability}, Rep=${item.breakdown.reputation}`);
    console.log(`   - Explanation: "${item.explanation}"`);
  });

  console.log("\n=======================================================");
  console.log("   DEMO CREDENTIALS FOR TESTING & DEMO");
  console.log("=======================================================");
  console.log("1. Customer Login:");
  console.log("   Email:    customer@demo.com");
  console.log("   Password: Demo@1234");
  console.log("\n2. Worker Login (Electrician ~2.5km away):");
  console.log("   Email:    worker@demo.com");
  console.log("   Password: Demo@1234");
  console.log("\n3. Admin Login:");
  console.log("   Email:    admin@kaamconnect.com");
  console.log("   Password: Demo@1234");
  console.log("=======================================================\n");

  await mongoose.disconnect();
  console.log("Database seeded successfully and disconnected.");
}

// Execute directly if run via `node src/seed/seed.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const isReset = !process.argv.includes("--no-reset");
  seedDatabase({ reset: isReset }).catch((err) => {
    console.error("Error during database seed:", err);
    process.exit(1);
  });
}

export default seedDatabase;
