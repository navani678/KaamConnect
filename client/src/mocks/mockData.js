// KaamConnect AI Mock Database for Offline / Fallback dev
export const MOCK_PROFESSIONS = [
  { id: 'electrician', name: 'Electrician', icon: 'Zap', count: 18, desc: 'Wiring, MCBs, inverter setup, fans & light fixtures' },
  { id: 'plumber', name: 'Plumber', icon: 'Wrench', count: 14, desc: 'Pipe leakages, bathroom fittings, motor repair, taps' },
  { id: 'carpenter', name: 'Carpenter', icon: 'Hammer', count: 12, desc: 'Furniture repairs, door latches, custom wood shelving' },
  { id: 'painter', name: 'Painter', icon: 'Paintbrush', count: 15, desc: 'Interior/exterior whitewash, wall putty, texture paint' },
  { id: 'mason', name: 'Mason (Mestri)', icon: 'Layers', count: 10, desc: 'Brickwork, plastering, boundary walls, floor repairs' },
  { id: 'tiles_flooring', name: 'Tiles & Flooring', icon: 'Grid', count: 9, desc: 'Vitrified tiles, granite cutting, marble polishing' },
  { id: 'welder', name: 'Welder / Fabrication', icon: 'Flame', count: 8, desc: 'Iron gates, grills, window frames, shed welding' },
  { id: 'roofer', name: 'Roofer / Ceiling', icon: 'Home', count: 6, desc: 'False ceilings, tin sheds, waterproofing, tile roofs' },
  { id: 'house_cleaning', name: 'Deep Cleaning', icon: 'Sparkles', count: 16, desc: 'Deep house cleaning, water tank cleaning, sanitisation' },
  { id: 'construction_labourer', name: 'Construction Labourer', icon: 'HardHat', count: 24, desc: 'Material shifting, debris removal, trench digging' }
];

export const MOCK_USERS = [
  {
    _id: 'usr_cust_demo',
    name: 'Suresh Kumar',
    email: 'customer@demo.com',
    phone: '9848012345',
    role: 'customer',
    language: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    _id: 'usr_wrk_demo',
    name: 'Raju Sharma',
    email: 'worker@demo.com',
    phone: '9848098765',
    role: 'worker',
    language: 'te',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
  }
];

export const MOCK_WORKERS = [
  {
    _id: 'wp_1',
    user: {
      _id: 'usr_wrk_demo',
      name: 'Raju Sharma',
      email: 'worker@demo.com',
      phone: '9848098765',
      avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
    },
    professions: ['electrician'],
    specializations: ['wiring', 'fan installation', 'MCB repair', 'inverter connection', 'tube light & chandelier'],
    bio: 'Experienced licensed electrician with 12+ years across residential and commercial setups in Warangal & Kazipet. Prompt service and standard safety protocols.',
    experienceYears: 12,
    rateType: 'daily',
    rate: 800,
    serviceRadiusKm: 15,
    location: { type: 'Point', coordinates: [79.5980, 17.9720] },
    addressText: 'Subedari, Hanamkonda',
    availability: {
      weeklyDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      slots: ['morning', 'afternoon', 'evening'],
      isAvailableNow: true,
      unavailableDates: []
    },
    languages: ['te', 'hi', 'en'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80', caption: 'Complete 3BHK Concealed Wiring', type: 'image' },
      { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80', caption: 'Commercial MCB Panel Setup', type: 'image' }
    ],
    certifications: [
      { title: 'ITI Electrical Certificate', issuer: 'Govt ITI Warangal', year: 2012, documentUrl: '#' }
    ],
    verification: { idVerified: true, verifiedAt: '2024-01-15T00:00:00Z' },
    ratingAvg: 4.85,
    ratingCount: 28,
    completedJobs: 94,
    distanceKm: 2.1,
    estimatedQuote: 3200,
    score: 92,
    scoreBreakdown: {
      skill: 28,
      distance: 23,
      price: 19,
      availability: 14,
      reputation: 9
    },
    explanation: 'Matches your required electrical skills (wiring, fan), is 2.1 km away in Hanamkonda, is available this weekend, quoted ₹3,200 within your budget, rated 4.9/5 from 28 reviews, ID verified.'
  },
  {
    _id: 'wp_2',
    user: {
      _id: 'usr_wrk_2',
      name: 'Venkatesh Naidu',
      email: 'venkat@worker.com',
      phone: '9848055555',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    professions: ['electrician', 'roofer'],
    specializations: ['wiring', 'switchboard repair', 'ceiling fan', 'false ceiling LED lights'],
    bio: 'Specialist in modern home lighting, LED strips, and concealed wiring fixtures with 8 years of dependable field experience.',
    experienceYears: 8,
    rateType: 'hourly',
    rate: 180,
    serviceRadiusKm: 20,
    location: { type: 'Point', coordinates: [79.5850, 17.9620] },
    addressText: 'Kazipet Main Road',
    availability: {
      weeklyDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      slots: ['morning', 'afternoon'],
      isAvailableNow: true,
      unavailableDates: []
    },
    languages: ['te', 'hi'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80', caption: 'False Ceiling Decorative Lighting', type: 'image' }
    ],
    certifications: [],
    verification: { idVerified: true, verifiedAt: '2024-02-10T00:00:00Z' },
    ratingAvg: 4.7,
    ratingCount: 19,
    completedJobs: 56,
    distanceKm: 3.4,
    estimatedQuote: 2880,
    score: 86,
    scoreBreakdown: {
      skill: 26,
      distance: 21,
      price: 20,
      availability: 11,
      reputation: 8
    },
    explanation: 'Specialises in LED lights and wiring, 3.4 km away, quoted ₹2,880 within budget range, rated 4.7/5 from 19 reviews, ID verified.'
  },
  {
    _id: 'wp_3',
    user: {
      _id: 'usr_wrk_3',
      name: 'Mohammad Azhar',
      email: 'azhar@worker.com',
      phone: '9848077777',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    },
    professions: ['electrician'],
    specializations: ['heavy load wiring', 'inverter installation', 'motor pump starter', 'earthing'],
    bio: 'Certified electrical contractor with team for heavy installations and residential building earthing.',
    experienceYears: 15,
    rateType: 'project',
    rate: 3500,
    serviceRadiusKm: 25,
    location: { type: 'Point', coordinates: [79.6100, 17.9800] },
    addressText: 'Naimnagar, Warangal',
    availability: {
      weeklyDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      slots: ['afternoon', 'evening'],
      isAvailableNow: false,
      unavailableDates: []
    },
    languages: ['ur', 'hi', 'te', 'en'],
    portfolio: [],
    certifications: [],
    verification: { idVerified: false },
    ratingAvg: 4.6,
    ratingCount: 14,
    completedJobs: 72,
    distanceKm: 4.8,
    estimatedQuote: 3500,
    score: 79,
    scoreBreakdown: {
      skill: 24,
      distance: 18,
      price: 19,
      availability: 10,
      reputation: 8
    },
    explanation: 'Matches profession, 4.8 km away, quoted ₹3,500 within budget, rated 4.6/5 from 14 reviews.'
  },
  {
    _id: 'wp_4',
    user: {
      _id: 'usr_wrk_4',
      name: 'Santosh Reddy',
      email: 'santosh@worker.com',
      phone: '9848033333',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
    },
    professions: ['plumber'],
    specializations: ['leakage arrest', 'CPVC piping', 'sanitary fittings', 'overhead tank pipeline'],
    bio: 'Master plumber with 10 years experience in modern bathroom renovations and high pressure water line setups.',
    experienceYears: 10,
    rateType: 'daily',
    rate: 750,
    serviceRadiusKm: 15,
    location: { type: 'Point', coordinates: [79.5940, 17.9690] },
    addressText: 'Mandi Bazar, Warangal',
    availability: {
      weeklyDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      slots: ['anytime'],
      isAvailableNow: true,
      unavailableDates: []
    },
    languages: ['te', 'hi'],
    portfolio: [],
    certifications: [],
    verification: { idVerified: true, verifiedAt: '2024-03-01T00:00:00Z' },
    ratingAvg: 4.9,
    ratingCount: 32,
    completedJobs: 110,
    distanceKm: 1.5,
    estimatedQuote: 2250,
    score: 94,
    scoreBreakdown: {
      skill: 30,
      distance: 24,
      price: 20,
      availability: 14,
      reputation: 9
    },
    explanation: 'Top-rated plumber, 1.5 km away, highly available, competitive daily rate, 4.9★ rating.'
  }
];

export const MOCK_JOBS = [
  {
    _id: 'job_demo_1',
    customer: 'usr_cust_demo',
    profession: 'electrician',
    title: 'Install lights and ceiling fans in 3 rooms',
    description: 'Need new concealed wiring check, 3 ceiling fans mounting, and 8 LED panel light fixtures installed before house warming.',
    media: [
      { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80', type: 'image' }
    ],
    location: { type: 'Point', coordinates: [79.5941, 17.9689] },
    addressText: 'House #4-12, Green Hills Colony, Subedari, Hanamkonda',
    budgetMin: 3000,
    budgetMax: 5000,
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    preferredTimeSlot: 'morning',
    estimatedDuration: { value: 2, unit: 'days' },
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

export const MOCK_BOOKINGS = [
  {
    _id: 'bk_demo_1',
    job: {
      _id: 'job_demo_1',
      title: 'Install lights and ceiling fans in 3 rooms',
      profession: 'electrician',
      location: { type: 'Point', coordinates: [79.5941, 17.9689] },
      addressText: 'Subedari, Hanamkonda'
    },
    customer: {
      _id: 'usr_cust_demo',
      name: 'Suresh Kumar',
      phone: '9848012345'
    },
    worker: {
      _id: 'usr_wrk_demo',
      name: 'Raju Sharma',
      phone: '9848098765'
    },
    workerProfile: 'wp_1',
    scope: 'Concealed wiring check, 3 ceiling fans mounting, 8 LED lights install.',
    proposedPrice: 3200,
    finalPrice: 3200,
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    timeSlot: 'morning',
    status: 'pending',
    negotiation: [
      {
        by: 'customer',
        price: 3200,
        message: 'Looking forward to work on Saturday morning.',
        at: new Date(Date.now() - 1800000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];
