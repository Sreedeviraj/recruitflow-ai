const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const orchestratorAgent = require('../agents/orchestratorAgent');
const Score = require('../models/Score');
const Resume = require('../models/Resume');
const Session = require('../models/Session');

const extractTextFromFile = async (file) => {
  const mime = file.mimetype;
  const name = file.originalname.toLowerCase();

  try {
    if (mime === 'text/plain' || name.endsWith('.txt')) {
      return file.buffer.toString('utf-8');
    }
    if (mime === 'application/pdf' || name.endsWith('.pdf')) {
      const data = await pdfParse(file.buffer);
      return data.text;
    }
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }
    if (mime === 'application/msword' || name.endsWith('.doc')) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }
    // Fallback: try as text
    return file.buffer.toString('utf-8');
  } catch (err) {
    console.error(`[rankingController] Error extracting text from ${file.originalname}:`, err.message);
    return `[Could not extract text from ${file.originalname}]`;
  }
};

exports.rankCandidates = async (req, res, next) => {
  try {
    const { jobTitle = '', jobDescription = '', pastedResumes } = req.body;
    const uploadedFiles = req.files || [];

    // Validation
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Job description must be at least 20 characters long'
      });
    }

    // Build resumes array
    const resumesData = [];

    // Process uploaded files
    for (const file of uploadedFiles) {
      const content = await extractTextFromFile(file);
      if (content && content.trim().length > 10) {
        resumesData.push({ content: content.trim(), fileName: file.originalname });
      }
    }

    // Process pasted resumes
    let pastedArray = [];
    if (pastedResumes) {
      if (Array.isArray(pastedResumes)) {
        pastedArray = pastedResumes;
      } else if (typeof pastedResumes === 'string') {
        try { pastedArray = JSON.parse(pastedResumes); } catch { pastedArray = [pastedResumes]; }
      }
    }
    pastedArray.forEach((text, i) => {
      if (text && text.trim().length > 10) {
        resumesData.push({ content: text.trim(), fileName: `pasted_resume_${i + 1}.txt` });
      }
    });

    if (resumesData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one resume is required (upload a file or paste text)'
      });
    }

    const result = await orchestratorAgent.runPipeline(
      jobTitle.trim(),
      jobDescription.trim(),
      resumesData
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({}).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    const candidates = await Score.find({ sessionId })
      .populate('resumeId')
      .sort({ rank: 1 });
    res.json({ success: true, session, candidates });
  } catch (error) {
    next(error);
  }
};

exports.getCandidate = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    const score = await Score.findOne({ resumeId: resume._id });
    res.json({ success: true, candidate: resume, score });
  } catch (error) {
    next(error);
  }
};

exports.getAnalyticsOverview = async (req, res, next) => {
  try {
    const totalSessions = await Session.countDocuments();
    const totalResumes = await Resume.countDocuments();

    const scoreAgg = await Score.aggregate([
      { $group: { _id: null, avg: { $avg: '$totalScore' } } }
    ]);
    const averageScore = scoreAgg.length > 0 ? Math.round(scoreAgg[0].avg) : 0;

    // Top skills found across all resumes
    const skillsAgg = await Resume.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { skill: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      totalSessions,
      totalResumes,
      averageScore,
      topSkillsFound: skillsAgg
    });
  } catch (error) {
    next(error);
  }
};

exports.getScoreDistribution = async (req, res, next) => {
  try {
    const scores = await Score.find({}, 'totalScore');
    const buckets = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 }
    ];
    scores.forEach(s => {
      const score = s.totalScore;
      if (score <= 20) buckets[0].count++;
      else if (score <= 40) buckets[1].count++;
      else if (score <= 60) buckets[2].count++;
      else if (score <= 80) buckets[3].count++;
      else buckets[4].count++;
    });
    res.json({ success: true, buckets });
  } catch (error) {
    next(error);
  }
};

exports.healthCheck = async (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    service: 'RecruitFlow AI',
    aiProvider: 'OpenAI',
    model: 'gpt-4o',
    agents: [
      'OrchestratorAgent',
      'ResumeParserAgent',
      'JobAnalyzerAgent',
      'ScoringAgent',
      'RankingAgent',
      'DBAgent'
    ],
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
};
