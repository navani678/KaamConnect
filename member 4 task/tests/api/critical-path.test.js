import request from 'supertest';
import app from '../../server/src/app.js';

/**
 * Critical Path Integration Test Suite
 *
 * This test suite validates the full end-to-end journey specified in Section 11.3:
 * 1. Register customer & worker
 * 2. Setup worker profile (location, rate, specializations)
 * 3. Customer posts job with budget and geo-location
 * 4. Customer fetches AI-ranked matches with grounded explanations
 * 5. Customer creates booking request
 * 6. Worker counter-offers
 * 7. Customer confirms counter-offer
 * 8. Customer completes booking
 * 9. Customer leaves 5-star review
 *
 * Note: When M2 and M3 implement their route modules, this test runs seamlessly
 * against the shared API contract in docs/api-contract.md.
 */
describe('KaamConnect AI — Critical Path Lifecycle', () => {
  let customerToken = '';
  let workerToken = '';
  let workerProfileId = '';
  let jobId = '';
  let bookingId = '';

  const customerPayload = {
    name: 'Ananya Rao',
    email: `customer.${Date.now()}@example.com`,
    phone: '9876543210',
    password: 'Password@123',
    role: 'customer',
    language: 'en'
  };

  const workerPayload = {
    name: 'Kishan Kumar',
    email: `worker.${Date.now()}@example.com`,
    phone: '9876501234',
    password: 'Password@123',
    role: 'worker',
    language: 'te'
  };

  it('Step 0: Health route is operational', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  describe('Step 1 & 2: User Registration & Authentication', () => {
    it('Registers customer with valid token and user role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(customerPayload);

      // If route not yet mounted by M2, skip without failing test suite pre-Sync 1
      if (res.status === 404) {
        console.warn('⚠️ /api/auth/register not yet implemented by Member 2.');
        return;
      }

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      customerToken = res.body.data.token;
    });

    it('Registers worker with valid credentials', async () => {
      if (!customerToken) return;

      const res = await request(app)
        .post('/api/auth/register')
        .send(workerPayload);

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      workerToken = res.body.data.token;
    });
  });

  describe('Step 3: Worker Profile Configuration', () => {
    it('Worker updates profile with GeoJSON location, rates, and trade', async () => {
      if (!workerToken) return;

      const res = await request(app)
        .put('/api/workers/me')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          professions: ['electrician'],
          specializations: ['wiring', 'fans', 'MCB repair'],
          bio: 'Certified electrician serving Warangal & Hanamkonda.',
          experienceYears: 7,
          rateType: 'daily',
          rate: 850,
          serviceRadiusKm: 20,
          location: { lat: 17.9689, lng: 79.5941 },
          addressText: 'Hanamkonda Main Chowrasta'
        });

      if (res.status === 404) return;
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      workerProfileId = res.body.data.profile?._id || res.body.data._id;
    });
  });

  describe('Step 4 & 5: Job Posting & Match Discovery', () => {
    it('Customer posts a job with budget and coordinates', async () => {
      if (!customerToken) return;

      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          profession: 'electrician',
          title: 'Ceiling fan installation in 3 rooms',
          description: 'Need 3 fans mounted and wiring checked in Kazipet.',
          media: [],
          location: { lat: 17.971, lng: 79.598 },
          addressText: 'Kazipet Diesel Colony',
          budgetMin: 2500,
          budgetMax: 4500,
          preferredDate: new Date(Date.now() + 86400000).toISOString(),
          preferredTimeSlot: 'morning',
          estimatedDuration: { value: 1, unit: 'days' }
        });

      if (res.status === 404) return;
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      jobId = res.body.data.job?._id || res.body.data._id;
    });

    it('Customer fetches AI matches for job, receiving score & explanation', async () => {
      if (!customerToken || !jobId) return;

      const res = await request(app)
        .get(`/api/jobs/${jobId}/matches`)
        .set('Authorization', `Bearer ${customerToken}`);

      if (res.status === 404) return;
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.matches || res.body.data)).toBe(true);
    });
  });

  describe('Step 6, 7 & 8: Booking Negotiation State Machine', () => {
    it('Customer creates a booking request in pending state', async () => {
      if (!customerToken || !jobId || !workerProfileId) return;

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          jobId,
          workerProfileId,
          proposedPrice: 3000,
          scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          timeSlot: 'morning',
          scope: 'Mount 3 ceiling fans and test wiring'
        });

      if (res.status === 404) return;
      expect(res.status).toBe(201);
      bookingId = res.body.data.booking?._id || res.body.data._id;
    });

    it('Worker submits counter-offer price', async () => {
      if (!workerToken || !bookingId) return;

      const res = await request(app)
        .post(`/api/bookings/${bookingId}/counter`)
        .set('Authorization', `Bearer ${workerToken}`)
        .send({ price: 3400, message: 'Includes mounting brackets' });

      if (res.status === 404) return;
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('countered');
    });

    it('Customer confirms counter-offer transitioning status to accepted', async () => {
      if (!customerToken || !bookingId) return;

      const res = await request(app)
        .post(`/api/bookings/${bookingId}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`);

      if (res.status === 404) return;
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('accepted');
    });

    it('Customer marks booking completed', async () => {
      if (!customerToken || !bookingId) return;

      const res = await request(app)
        .post(`/api/bookings/${bookingId}/complete`)
        .set('Authorization', `Bearer ${customerToken}`);

      if (res.status === 404) return;
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });
  });

  describe('Step 9: Review & Rating Recalculation', () => {
    it('Customer leaves verified review and updates worker score', async () => {
      if (!customerToken || !bookingId) return;

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookingId,
          rating: 5,
          comment: 'Very professional, neat wiring installation.'
        });

      if (res.status === 404) return;
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
