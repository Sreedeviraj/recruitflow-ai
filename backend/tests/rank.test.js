const request = require('supertest');
const mongoose = require('mongoose');

// Mock aiService BEFORE requiring app or any agent
jest.mock('../src/services/aiService', () => ({
  analyze: jest.fn().mockImplementation((systemPrompt, userPrompt) => {
    // Return different mock data based on which agent is calling
    if (systemPrompt.includes('Job Description Analyzer')) {
      return Promise.resolve(JSON.stringify({
        title: 'Senior Full Stack Developer',
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        preferredSkills: ['Redis', 'GraphQL'],
        requiredExperienceYears: 5,
        requiredEducation: 'CS degree or equivalent',
        keyResponsibilities: ['Build apps', 'Design APIs'],
        industry: 'Technology'
      }));
    }
    if (systemPrompt.includes('Resume Parser')) {
      return Promise.resolve(JSON.stringify({
        candidateName: 'Test Candidate',
        email: 'test@example.com',
        phone: '+1-555-0000',
        skills: ['React', 'Node.js'],
        experience: [{ company: 'TechCo', role: 'Developer', duration: '3 years', years: 3, description: 'Built apps' }],
        education: [{ institution: 'MIT', degree: 'BS', field: 'Computer Science', year: '2018' }],
        totalExperienceYears: 3
      }));
    }
    // Scoring agent
    return Promise.resolve(JSON.stringify({
      skillScore: 75,
      experienceScore: 70,
      educationScore: 80,
      matchedSkills: ['React', 'Node.js'],
      missingSkills: ['MongoDB'],
      aiSummary: 'Good candidate with relevant skills.',
      recommendation: 'Recommended'
    }));
  }),
  parseJSON: jest.fn().mockImplementation((text) => JSON.parse(text))
}));

const app = require('../server');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitflow_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('POST /api/rank', () => {
  it('should return 200 with valid job and pasted resume', async () => {
    const res = await request(app)
      .post('/api/rank')
      .field('jobTitle', 'Senior Full Stack Developer')
      .field('jobDescription', 'We need a Senior Full Stack Developer with React, Node.js, and MongoDB experience to join our team.')
      .field('pastedResumes', JSON.stringify(['John Doe - Senior Developer with 5 years React and Node.js experience. Skills: React, Node.js, MongoDB.']));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  }, 30000);

  it('should have candidates array in response', async () => {
    const res = await request(app)
      .post('/api/rank')
      .field('jobTitle', 'Developer')
      .field('jobDescription', 'We need a developer with React and Node.js experience to build web applications.')
      .field('pastedResumes', JSON.stringify(['Jane Doe - Developer with React and Node.js skills and 3 years experience.']));

    expect(res.body.candidates).toBeDefined();
    expect(Array.isArray(res.body.candidates)).toBe(true);
  }, 30000);

  it('should have summary object with totalCandidates', async () => {
    const res = await request(app)
      .post('/api/rank')
      .field('jobTitle', 'Engineer')
      .field('jobDescription', 'Looking for an engineer with strong JavaScript and TypeScript skills for building modern web applications.')
      .field('pastedResumes', JSON.stringify(['Bob Smith - JavaScript engineer with 4 years experience in React and TypeScript.']));

    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalCandidates).toBeGreaterThan(0);
  }, 30000);

  it('should return 400 when jobDescription is missing', async () => {
    const res = await request(app)
      .post('/api/rank')
      .field('jobTitle', 'Developer')
      .field('pastedResumes', JSON.stringify(['Some resume text']));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when jobDescription is too short', async () => {
    const res = await request(app)
      .post('/api/rank')
      .field('jobTitle', 'Developer')
      .field('jobDescription', 'Too short')
      .field('pastedResumes', JSON.stringify(['Some resume']));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when no resumes provided', async () => {
    const res = await request(app)
      .post('/api/rank')
      .field('jobTitle', 'Developer')
      .field('jobDescription', 'We need a developer with React and Node.js experience to build applications for our team.');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
