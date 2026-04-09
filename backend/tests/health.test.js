const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitflow_test');
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /api/health', () => {
  it('should return 200 status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('should have status "ok"', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.status).toBe('ok');
  });

  it('should have aiProvider "OpenAI"', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.aiProvider).toBe('OpenAI');
  });

  it('should have model "gpt-4o"', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.model).toBe('gpt-4o');
  });

  it('should list all 6 agents', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.agents).toBeDefined();
    expect(res.body.agents.length).toBe(6);
    expect(res.body.agents).toContain('OrchestratorAgent');
    expect(res.body.agents).toContain('ResumeParserAgent');
    expect(res.body.agents).toContain('JobAnalyzerAgent');
    expect(res.body.agents).toContain('ScoringAgent');
    expect(res.body.agents).toContain('RankingAgent');
    expect(res.body.agents).toContain('DBAgent');
  });
});
