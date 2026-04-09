const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Score = require('../models/Score');
const Session = require('../models/Session');

class DBAgent {
  async saveJob(jobData) {
    console.log('[DBAgent] Saving job...');
    const job = await Job.create({
      title: jobData.title || 'Unknown Position',
      description: jobData.description || '',
      requiredSkills: jobData.requiredSkills || [],
      preferredSkills: jobData.preferredSkills || [],
      requiredExperienceYears: jobData.requiredExperienceYears || 0,
      requiredEducation: jobData.requiredEducation || '',
      keyResponsibilities: jobData.keyResponsibilities || [],
      industry: jobData.industry || ''
    });
    console.log(`[DBAgent] Job saved: ${job._id}`);
    return job;
  }

  async saveResumes(parsedResumes, jobId, sessionId) {
    console.log(`[DBAgent] Saving ${parsedResumes.length} resumes...`);
    const saved = await Resume.insertMany(
      parsedResumes.map((r, i) => ({
        jobId,
        sessionId,
        candidateName: r.candidateName || `Candidate ${i + 1}`,
        email: r.email || '',
        phone: r.phone || '',
        skills: r.skills || [],
        experience: r.experience || [],
        education: r.education || [],
        totalExperienceYears: r.totalExperienceYears || 0,
        rawContent: r.rawContent || '',
        fileName: r.fileName || `resume_${i + 1}.txt`,
        uploadedAt: new Date()
      }))
    );
    console.log(`[DBAgent] ${saved.length} resumes saved`);
    return saved;
  }

  async saveScores(rankedScores, savedResumes, jobId, sessionId) {
    console.log(`[DBAgent] Saving ${rankedScores.length} scores...`);
    const scoreData = rankedScores.map((score, i) => ({
      resumeId: savedResumes[i]._id,
      jobId,
      sessionId,
      candidateName: score.candidateName || savedResumes[i].candidateName,
      skillScore: score.skillScore || 0,
      experienceScore: score.experienceScore || 0,
      educationScore: score.educationScore || 0,
      totalScore: score.totalScore || 0,
      rank: score.rank || i + 1,
      matchedSkills: score.matchedSkills || [],
      missingSkills: score.missingSkills || [],
      aiSummary: score.aiSummary || '',
      recommendation: score.recommendation || 'Not Recommended',
      scoredAt: new Date()
    }));

    const saved = await Score.insertMany(scoreData);
    console.log(`[DBAgent] ${saved.length} scores saved`);
    return saved;
  }

  async saveSession(summary, jobId, jobTitle, sessionId, processingTime) {
    console.log('[DBAgent] Saving session...');
    const session = await Session.create({
      sessionId,
      jobId,
      jobTitle: jobTitle || 'Unknown Position',
      totalCandidates: summary.totalCandidates || 0,
      averageScore: summary.averageScore || 0,
      topCandidateName: summary.topCandidate || '',
      topScore: summary.topScore || 0,
      processingTime: processingTime || '',
      breakdown: summary.breakdown || { stronglyRecommended: 0, recommended: 0, consider: 0, notRecommended: 0 },
      createdAt: new Date()
    });
    console.log(`[DBAgent] Session saved: ${sessionId}`);
    return session;
  }

  async getRankingResults(sessionId) {
    return await Score.find({ sessionId })
      .populate('resumeId')
      .sort({ rank: 1 });
  }

  async getRecentSessions(limit = 20) {
    return await Session.find({})
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new DBAgent();
