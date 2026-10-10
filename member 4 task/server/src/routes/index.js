import { Router } from 'express';

const router = Router();

// =============================================================================
// Health & System Routes (Member 4)
// =============================================================================
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'KaamConnect AI Backend',
      timestamp: new Date().toISOString()
    }
  });
});

// Meta endpoint for professions (Section 5.7)
router.get('/meta/professions', (req, res) => {
  const PROFESSIONS = [
    { id: 'electrician', label: 'Electrician' },
    { id: 'plumber', label: 'Plumber' },
    { id: 'carpenter', label: 'Carpenter' },
    { id: 'painter', label: 'Painter' },
    { id: 'mason', label: 'Mason' },
    { id: 'tiles_flooring', label: 'Tiles & Flooring' },
    { id: 'welder', label: 'Welder' },
    { id: 'roofer', label: 'Roofer' },
    { id: 'house_cleaning', label: 'House Cleaning' },
    { id: 'construction_labourer', label: 'Construction Labourer' }
  ];

  res.status(200).json({
    success: true,
    data: {
      professions: PROFESSIONS
    }
  });
});

// Note for Team Members (Keep alphabetical per Section 3.3):
// M2 adds: router.use('/auth', authRoutes);
// M2 adds: router.use('/bookings', bookingRoutes);
// M2 adds: router.use('/jobs', jobRoutes);
// M3 adds: router.use('/jobs', matchRoutes); // e.g. GET /jobs/:id/matches
// M2 adds: router.use('/reports', reportRoutes);
// M2 adds: router.use('/reviews', reviewRoutes);
// M2 adds: router.use('/uploads', uploadRoutes);
// M3 adds: router.use('/workers', workerRoutes);

export default router;
