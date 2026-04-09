require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('./db');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Score = require('../models/Score');
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');

const seed = async () => {
  await connectDB();

  console.log('🌱 Clearing existing seed data...');
  await Job.deleteMany({});
  await Resume.deleteMany({});
  await Score.deleteMany({});
  await Session.deleteMany({});
  await AuditLog.deleteMany({});

  console.log('🌱 Creating seed jobs...');

  const job1 = await Job.create({
    title: 'Senior Full Stack Developer',
    description: 'We are looking for a Senior Full Stack Developer to join our growing engineering team. You will build scalable web applications, design RESTful APIs, and mentor junior developers.',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker', 'AWS'],
    preferredSkills: ['Redis', 'Kubernetes', 'GraphQL'],
    requiredExperienceYears: 5,
    requiredEducation: 'CS degree or equivalent',
    keyResponsibilities: [
      'Build scalable web applications with React and Node.js',
      'Design RESTful APIs and microservices',
      'Manage MongoDB and PostgreSQL databases',
      'Mentor junior developers and conduct code reviews',
      'Participate in architecture discussions'
    ],
    industry: 'Technology'
  });

  const job2 = await Job.create({
    title: 'Product Designer',
    description: 'We are seeking a talented Product Designer to create beautiful, user-centered digital experiences. You will work closely with product and engineering teams.',
    requiredSkills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research', 'Design Systems'],
    preferredSkills: ['Motion Design', 'HTML/CSS', 'React'],
    requiredExperienceYears: 3,
    requiredEducation: 'Design degree or equivalent',
    keyResponsibilities: [
      'Create wireframes, prototypes, and high-fidelity designs',
      'Conduct user research and usability testing',
      'Maintain and evolve the design system',
      'Collaborate with engineers on implementation',
      'Present design decisions to stakeholders'
    ],
    industry: 'Technology'
  });

  console.log('🌱 Creating seed resumes and scores for Job 1...');

  const session1Id = 'session_seed_001';

  // Job 1 - Strong match
  const resume1 = await Resume.create({
    jobId: job1._id,
    sessionId: session1Id,
    candidateName: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    phone: '+1-555-0101',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker', 'AWS', 'Redis', 'GraphQL', 'PostgreSQL', 'Kubernetes'],
    experience: [
      { company: 'TechCorp', role: 'Senior Full Stack Developer', duration: '3 years', years: 3, description: 'Led development of microservices architecture serving 1M+ users' },
      { company: 'StartupXYZ', role: 'Full Stack Developer', duration: '2.5 years', years: 2.5, description: 'Built React/Node.js applications from scratch' },
      { company: 'WebAgency', role: 'Junior Developer', duration: '1.5 years', years: 1.5, description: 'Developed client websites and web applications' }
    ],
    education: [{ institution: 'Stanford University', degree: 'Bachelor of Science', field: 'Computer Science', year: '2016' }],
    totalExperienceYears: 7,
    rawContent: 'Sarah Chen - Senior Full Stack Developer with 7 years experience',
    fileName: 'sarah_chen_resume.txt'
  });

  // Job 1 - Medium match
  const resume2 = await Resume.create({
    jobId: job1._id,
    sessionId: session1Id,
    candidateName: 'James Okafor',
    email: 'james.okafor@gmail.com',
    phone: '+1-555-0102',
    skills: ['React', 'Node.js', 'MySQL', 'Docker', 'JavaScript', 'Vue.js', 'Python'],
    experience: [
      { company: 'DigitalSolutions', role: 'Full Stack Developer', duration: '2 years', years: 2, description: 'Built web applications using React and Node.js' },
      { company: 'CodeFactory', role: 'Junior Developer', duration: '1.5 years', years: 1.5, description: 'Frontend development with React' },
      { company: 'WebStartup', role: 'Intern', duration: '6 months', years: 0.5, description: 'Assisted with web development tasks' }
    ],
    education: [{ institution: 'State University', degree: 'Bachelor of Science', field: 'Software Engineering', year: '2019' }],
    totalExperienceYears: 4,
    rawContent: 'James Okafor - Full Stack Developer with 4 years experience',
    fileName: 'james_okafor_resume.txt'
  });

  // Job 1 - Weak match
  const resume3 = await Resume.create({
    jobId: job1._id,
    sessionId: session1Id,
    candidateName: 'Priya Sharma',
    email: 'priya.sharma@outlook.com',
    phone: '+1-555-0103',
    skills: ['React', 'Node.js', 'HTML', 'CSS', 'MySQL', 'Git'],
    experience: [
      { company: 'LocalTech', role: 'Junior Developer', duration: '1.5 years', years: 1.5, description: 'Basic web development tasks' },
      { company: 'University IT Dept', role: 'Intern', duration: '8 months', years: 0.67, description: 'IT support and minor development tasks' }
    ],
    education: [{ institution: 'Regional College', degree: 'Bachelor of Science', field: 'Information Technology', year: '2021' }],
    totalExperienceYears: 1.5,
    rawContent: 'Priya Sharma - Junior Developer with 1.5 years experience',
    fileName: 'priya_sharma_resume.txt'
  });

  // Scores for Job 1
  const score1 = await Score.create({
    resumeId: resume1._id, jobId: job1._id, sessionId: session1Id,
    candidateName: 'Sarah Chen',
    skillScore: 95, experienceScore: 92, educationScore: 95,
    totalScore: Math.round(95*0.50 + 92*0.30 + 95*0.20),
    rank: 1,
    matchedSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker', 'AWS', 'Redis', 'GraphQL', 'Kubernetes'],
    missingSkills: [],
    aiSummary: 'Sarah Chen is an exceptional candidate who exceeds all requirements for the Senior Full Stack Developer position. With 7 years of relevant experience and mastery of every required technology, she demonstrates both technical depth and leadership capability.',
    recommendation: 'Strongly Recommended',
    scoredAt: new Date()
  });

  const score2 = await Score.create({
    resumeId: resume2._id, jobId: job1._id, sessionId: session1Id,
    candidateName: 'James Okafor',
    skillScore: 62, experienceScore: 60, educationScore: 70,
    totalScore: Math.round(62*0.50 + 60*0.30 + 70*0.20),
    rank: 2,
    matchedSkills: ['React', 'Node.js', 'Docker'],
    missingSkills: ['MongoDB', 'TypeScript', 'AWS'],
    aiSummary: 'James Okafor has solid React and Node.js experience but lacks key technologies like MongoDB, TypeScript, and AWS. At 4 years experience, he falls slightly short of the 5-year requirement.',
    recommendation: 'Consider',
    scoredAt: new Date()
  });

  const score3 = await Score.create({
    resumeId: resume3._id, jobId: job1._id, sessionId: session1Id,
    candidateName: 'Priya Sharma',
    skillScore: 28, experienceScore: 15, educationScore: 55,
    totalScore: Math.round(28*0.50 + 15*0.30 + 55*0.20),
    rank: 3,
    matchedSkills: ['React', 'Node.js'],
    missingSkills: ['MongoDB', 'TypeScript', 'Docker', 'AWS'],
    aiSummary: 'Priya Sharma is an early-career developer with only 1.5 years of experience, significantly below the 5-year requirement. While she has basic React and Node.js exposure, she lacks the advanced skills required for this senior role.',
    recommendation: 'Not Recommended',
    scoredAt: new Date()
  });

  // Session 1
  const avgScore1 = Math.round((score1.totalScore + score2.totalScore + score3.totalScore) / 3);
  await Session.create({
    sessionId: session1Id,
    jobId: job1._id,
    jobTitle: 'Senior Full Stack Developer',
    totalCandidates: 3,
    averageScore: avgScore1,
    topCandidateName: 'Sarah Chen',
    topScore: score1.totalScore,
    processingTime: '8.2s',
    breakdown: { stronglyRecommended: 1, recommended: 0, consider: 1, notRecommended: 1 },
    createdAt: new Date(Date.now() - 86400000)
  });

  // Audit logs for session 1
  const auditEntries1 = [
    { sessionId: session1Id, action: 'session_created', agentName: 'OrchestratorAgent', details: 'Pipeline started for Senior Full Stack Developer', timestamp: new Date(Date.now() - 86400000) },
    { sessionId: session1Id, action: 'job_analyzed', agentName: 'JobAnalyzerAgent', details: 'Extracted 6 required skills, 3 preferred skills', timestamp: new Date(Date.now() - 86400000 + 1000) },
    { sessionId: session1Id, action: 'resume_parsed', agentName: 'ResumeParserAgent', details: 'Parsed 3 resumes: Sarah Chen, James Okafor, Priya Sharma', timestamp: new Date(Date.now() - 86400000 + 3000) },
    { sessionId: session1Id, action: 'scoring_complete', agentName: 'ScoringAgent', details: 'Scored 3 candidates. Top score: 94 (Sarah Chen)', timestamp: new Date(Date.now() - 86400000 + 6000) },
    { sessionId: session1Id, action: 'ranking_complete', agentName: 'RankingAgent', details: 'Ranking complete. 1 Strongly Recommended, 1 Consider, 1 Not Recommended', timestamp: new Date(Date.now() - 86400000 + 7000) }
  ];
  await AuditLog.insertMany(auditEntries1);

  console.log('🌱 Creating seed resumes and scores for Job 2...');

  const session2Id = 'session_seed_002';

  // Job 2 - Strong match
  const resume4 = await Resume.create({
    jobId: job2._id,
    sessionId: session2Id,
    candidateName: 'Maya Rodriguez',
    email: 'maya.rodriguez@design.io',
    phone: '+1-555-0201',
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research', 'Design Systems', 'Motion Design', 'HTML/CSS', 'Adobe XD'],
    experience: [
      { company: 'DesignStudio Pro', role: 'Senior Product Designer', duration: '3 years', years: 3, description: 'Led design for enterprise SaaS products used by 500K+ users' },
      { company: 'CreativeAgency', role: 'Product Designer', duration: '2 years', years: 2, description: 'Designed mobile apps and web products for startups' }
    ],
    education: [{ institution: 'Rhode Island School of Design', degree: 'Bachelor of Fine Arts', field: 'Graphic Design', year: '2018' }],
    totalExperienceYears: 5,
    rawContent: 'Maya Rodriguez - Senior Product Designer with 5 years experience',
    fileName: 'maya_rodriguez_resume.txt'
  });

  // Job 2 - Medium match
  const resume5 = await Resume.create({
    jobId: job2._id,
    sessionId: session2Id,
    candidateName: 'Tom Williams',
    email: 'tom.williams@gmail.com',
    phone: '+1-555-0202',
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'Sketch', 'Photoshop'],
    experience: [
      { company: 'AppDesignCo', role: 'UX Designer', duration: '2 years', years: 2, description: 'Designed user interfaces for mobile applications' },
      { company: 'FreelanceWork', role: 'Freelance Designer', duration: '1 year', years: 1, description: 'Various client design projects' }
    ],
    education: [{ institution: 'Art Institute', degree: 'Bachelor of Arts', field: 'Visual Communication', year: '2020' }],
    totalExperienceYears: 3,
    rawContent: 'Tom Williams - UX Designer with 3 years experience',
    fileName: 'tom_williams_resume.txt'
  });

  // Job 2 - Weak match
  const resume6 = await Resume.create({
    jobId: job2._id,
    sessionId: session2Id,
    candidateName: 'Anna Lee',
    email: 'anna.lee@email.com',
    phone: '+1-555-0203',
    skills: ['Photoshop', 'Illustrator', 'Basic Figma', 'Print Design'],
    experience: [
      { company: 'PrintShop', role: 'Graphic Designer', duration: '1.5 years', years: 1.5, description: 'Print materials and basic digital graphics' }
    ],
    education: [{ institution: 'Community College', degree: 'Associate Degree', field: 'Graphic Arts', year: '2022' }],
    totalExperienceYears: 1.5,
    rawContent: 'Anna Lee - Graphic Designer with 1.5 years experience',
    fileName: 'anna_lee_resume.txt'
  });

  // Scores for Job 2
  const score4 = await Score.create({
    resumeId: resume4._id, jobId: job2._id, sessionId: session2Id,
    candidateName: 'Maya Rodriguez',
    skillScore: 92, experienceScore: 88, educationScore: 90,
    totalScore: Math.round(92*0.50 + 88*0.30 + 90*0.20),
    rank: 1,
    matchedSkills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research', 'Design Systems', 'Motion Design'],
    missingSkills: [],
    aiSummary: 'Maya Rodriguez is an outstanding candidate who exceeds the requirements for the Product Designer role. Her 5 years of senior-level experience and mastery of all required tools make her a top choice.',
    recommendation: 'Strongly Recommended',
    scoredAt: new Date()
  });

  const score5 = await Score.create({
    resumeId: resume5._id, jobId: job2._id, sessionId: session2Id,
    candidateName: 'Tom Williams',
    skillScore: 70, experienceScore: 72, educationScore: 75,
    totalScore: Math.round(70*0.50 + 72*0.30 + 75*0.20),
    rank: 2,
    matchedSkills: ['Figma', 'UI/UX Design', 'Prototyping'],
    missingSkills: ['User Research', 'Design Systems', 'Motion Design'],
    aiSummary: 'Tom Williams meets the basic requirements with 3 years of experience and core Figma skills. However, he lacks experience in User Research and Design Systems which are key requirements for this role.',
    recommendation: 'Recommended',
    scoredAt: new Date()
  });

  const score6 = await Score.create({
    resumeId: resume6._id, jobId: job2._id, sessionId: session2Id,
    candidateName: 'Anna Lee',
    skillScore: 25, experienceScore: 20, educationScore: 45,
    totalScore: Math.round(25*0.50 + 20*0.30 + 45*0.20),
    rank: 3,
    matchedSkills: ['Basic Figma'],
    missingSkills: ['UI/UX Design', 'Prototyping', 'User Research', 'Design Systems'],
    aiSummary: 'Anna Lee is primarily a print/graphic designer with limited digital UX experience. She lacks the core required skills for a Product Designer role and has insufficient experience at 1.5 years.',
    recommendation: 'Not Recommended',
    scoredAt: new Date()
  });

  // Session 2
  const avgScore2 = Math.round((score4.totalScore + score5.totalScore + score6.totalScore) / 3);
  await Session.create({
    sessionId: session2Id,
    jobId: job2._id,
    jobTitle: 'Product Designer',
    totalCandidates: 3,
    averageScore: avgScore2,
    topCandidateName: 'Maya Rodriguez',
    topScore: score4.totalScore,
    processingTime: '7.5s',
    breakdown: { stronglyRecommended: 1, recommended: 1, consider: 0, notRecommended: 1 },
    createdAt: new Date()
  });

  // Audit logs for session 2
  const auditEntries2 = [
    { sessionId: session2Id, action: 'session_created', agentName: 'OrchestratorAgent', details: 'Pipeline started for Product Designer', timestamp: new Date(Date.now() - 1000) },
    { sessionId: session2Id, action: 'job_analyzed', agentName: 'JobAnalyzerAgent', details: 'Extracted 5 required skills, 3 preferred skills', timestamp: new Date(Date.now() - 900) },
    { sessionId: session2Id, action: 'resume_parsed', agentName: 'ResumeParserAgent', details: 'Parsed 3 resumes: Maya Rodriguez, Tom Williams, Anna Lee', timestamp: new Date(Date.now() - 700) },
    { sessionId: session2Id, action: 'scoring_complete', agentName: 'ScoringAgent', details: 'Scored 3 candidates. Top score: 91 (Maya Rodriguez)', timestamp: new Date(Date.now() - 400) },
    { sessionId: session2Id, action: 'ranking_complete', agentName: 'RankingAgent', details: 'Ranking complete. 1 Strongly Recommended, 1 Recommended, 1 Not Recommended', timestamp: new Date(Date.now() - 100) }
  ];
  await AuditLog.insertMany(auditEntries2);

  console.log('✅ Seed data created successfully!');
  console.log(`   Job 1: ${job1.title} (${job1._id})`);
  console.log(`   Job 2: ${job2.title} (${job2._id})`);
  console.log(`   6 resumes, 6 scores, 2 sessions, 10 audit logs`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
