import request from 'supertest';
import app from '../../src/app.js';

describe('API Integration Tests (Member 2)', () => {
  describe('Health & Metadata Endpoints', () => {
    test('GET /health returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    test('GET /api/health returns standardized success envelope', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });

    test('GET /api/meta/professions returns all 10 professions with icons and labels', async () => {
      const res = await request(app).get('/api/meta/professions');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(10);
      expect(res.body.data[0]).toHaveProperty('value');
      expect(res.body.data[0]).toHaveProperty('label');
      expect(res.body.data[0]).toHaveProperty('icon');
    });
  });

  describe('Validation and Error Envelope', () => {
    test('POST /api/auth/register with missing fields returns 400 with field errors', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(res.body.error).toHaveProperty('fields');
      expect(res.body.error.fields).toHaveProperty('email');
      expect(res.body.error.fields).toHaveProperty('password');
      expect(res.body.error.fields).toHaveProperty('name');
    });

    test('POST /api/auth/register with invalid phone returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ravi Kumar',
          email: 'ravi@example.com',
          phone: '12345',
          password: 'Password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.fields).toHaveProperty('phone');
    });

    test('Request with $ query operator returns 400 forbidden operator', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $gt: '' },
          password: 'Password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_INPUT');
    });

    test('Non-existent route returns 404 in standard error envelope', async () => {
      const res = await request(app).get('/api/some-non-existent-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Authentication Guard', () => {
    test('GET /api/auth/me without token returns 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('POST /api/jobs without token returns 401 UNAUTHORIZED', async () => {
      const res = await request(app).post('/api/jobs').send({});
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('POST /api/bookings without token returns 401 UNAUTHORIZED', async () => {
      const res = await request(app).post('/api/bookings').send({});
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
