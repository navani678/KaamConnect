import request from 'supertest';
import app from '../../server/src/app.js';

describe('System Health & Meta Endpoints', () => {
  it('GET /api/health should return status ok with 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data).toHaveProperty('timestamp');
  });

  it('GET /api/meta/professions should return the 10 defined professions', async () => {
    const res = await request(app).get('/api/meta/professions');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.professions)).toBe(true);
    expect(res.body.data.professions.length).toBe(10);
    const ids = res.body.data.professions.map((p) => p.id);
    expect(ids).toContain('electrician');
    expect(ids).toContain('plumber');
    expect(ids).toContain('construction_labourer');
  });

  it('GET /api/nonexistent should return 404 in standardized error envelope', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(res.body.error).toHaveProperty('message');
  });
});
