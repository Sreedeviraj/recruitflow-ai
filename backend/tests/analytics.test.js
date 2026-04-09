const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitflow_test');
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /api/analytics/overview', () => {
  it('should return totalSessions field', async () => {
    const res = await request(app).get('/api/analytics/overview');
    expect(res.status).toBe(200);
    expect(res.body.totalSessions).toBeDefined();
    expect(typeof res.body.totalSessions).toBe('number');
  });

  it('should return totalResumes field', async () => {
    const res = await request(app).get('/api/analytics/overview');
    expect(res.body.totalResumes).toBeDefined();
    expect(typeof res.body.totalResumes).toBe('number');
  });

  it('should return averageScore field', async () => {
    const res = await request(app).get('/api/analytics/overview');
    expect(res.body.averageScore).toBeDefined();
  });
});

describe('GET /api/analytics/score-distribution', () => {
  it('should return 5 buckets', async () => {
    const res = await request(app).get('/api/analytics/score-distribution');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.buckets).toBeDefined();
    expect(res.body.buckets.length).toBe(5);
  });

  it('should have correct range labels', async () => {
    const res = await request(app).get('/api/analytics/score-distribution');
    const ranges = res.body.buckets.map(b => b.range);
    expect(ranges).toContain('0-20');
    expect(ranges).toContain('21-40');
    expect(ranges).toContain('41-60');
    expect(ranges).toContain('61-80');
    expect(ranges).toContain('81-100');
  });
});
