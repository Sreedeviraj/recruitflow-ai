const jobAnalyzerAgent = require('./jobAnalyzerAgent');
const resumeParserAgent = require('./resumeParserAgent');
const scoringAgent = require('./scoringAgent');
const rankingAgent = require('./rankingAgent');
const dbAgent = require('./dbAgent');
const auditLogger = require('../utils/auditLogger');
const { generateSessionId } = require('../utils/sessionIdGenerator');

class OrchestratorAgent {
  async runPipeline(jobTitle, jobDescription, resumesData) {
    const sessionId = generateSessionId();
    const startTime = Date.now();
    console.log(`\n[OrchestratorAgent] Starting pipeline. Session: ${sessionId}`);

    try {
      // Step 1: Analyze job description
      console.log('[OrchestratorAgent] Step 1/7: Analyzing job...');
      const jobRequirements = await jobAnalyzerAgent.analyze(jobDescription, jobTitle);
      await auditLogger.log(sessionId, 'job_analyzed', 'JobAnalyzerAgent',
        `Extracted ${jobRequirements.requiredSkills.length} required skills, ${jobRequirements.preferredSkills.length} preferred skills`);

      // Step 2: Parse resumes
      console.log('[OrchestratorAgent] Step 2/7: Parsing resumes...');
      const parsedResumes = await resumeParserAgent.parseMultiple(resumesData);
      await auditLogger.log(sessionId, 'resume_parsed', 'ResumeParserAgent',
        `Parsed ${parsedResumes.length} resumes: ${parsedResumes.map(r => r.candidateName).join(', ')}`);

      // Step 3: Save to database
      console.log('[OrchestratorAgent] Step 3/7: Saving to database...');
      const savedJob = await dbAgent.saveJob({
        ...jobRequirements,
        description: jobDescription
      });
      const savedResumes = await dbAgent.saveResumes(
        parsedResumes.map((r, i) => ({ ...r, rawContent: resumesData[i]?.content || '', fileName: resumesData[i]?.fileName || `resume_${i+1}.txt` })),
        savedJob._id,
        sessionId
      );

      // Step 4: Score all candidates
      console.log('[OrchestratorAgent] Step 4/7: Scoring candidates...');
      const scores = await scoringAgent.scoreAll(parsedResumes, jobRequirements);
      await auditLogger.log(sessionId, 'scoring_complete', 'ScoringAgent',
        `Scored ${scores.length} candidates. Top score: ${Math.max(...scores.map(s => s.totalScore))} (${scores.sort((a,b) => b.totalScore - a.totalScore)[0]?.candidateName})`);

      // Step 5: Rank candidates and generate summary
      console.log('[OrchestratorAgent] Step 5/7: Ranking candidates...');
      const rankedCandidates = rankingAgent.rank(scores);
      const summary = rankingAgent.generateSummary(rankedCandidates);
      await auditLogger.log(sessionId, 'ranking_complete', 'RankingAgent',
        `Ranking complete. ${summary.breakdown.stronglyRecommended} Strongly Recommended, ${summary.breakdown.recommended} Recommended, ${summary.breakdown.consider} Consider, ${summary.breakdown.notRecommended} Not Recommended`);

      // Step 6: Save scores and session
      console.log('[OrchestratorAgent] Step 6/7: Persisting results...');
      await dbAgent.saveScores(rankedCandidates, savedResumes, savedJob._id, sessionId);
      const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
      await dbAgent.saveSession(summary, savedJob._id, jobRequirements.title || jobTitle, sessionId, processingTime);

      // Step 7: Audit log
      console.log('[OrchestratorAgent] Step 7/7: Logging session...');
      await auditLogger.log(sessionId, 'session_created', 'OrchestratorAgent',
        `Pipeline complete. Session ${sessionId} saved. Processing time: ${processingTime}`);

      console.log(`[OrchestratorAgent] Pipeline complete in ${processingTime}`);

      return {
        success: true,
        sessionId,
        jobTitle: jobRequirements.title || jobTitle,
        jobId: savedJob._id,
        summary,
        candidates: rankedCandidates.map((c, i) => ({
          ...c,
          resumeId: savedResumes[i]?._id,
          email: parsedResumes.find(r => r.candidateName === c.candidateName)?.email || '',
          phone: parsedResumes.find(r => r.candidateName === c.candidateName)?.phone || '',
          skills: parsedResumes.find(r => r.candidateName === c.candidateName)?.skills || [],
          experience: parsedResumes.find(r => r.candidateName === c.candidateName)?.experience || [],
          education: parsedResumes.find(r => r.candidateName === c.candidateName)?.education || [],
          totalExperienceYears: parsedResumes.find(r => r.candidateName === c.candidateName)?.totalExperienceYears || 0
        })),
        jobRequirements: {
          requiredSkills: jobRequirements.requiredSkills,
          preferredSkills: jobRequirements.preferredSkills,
          requiredExperienceYears: jobRequirements.requiredExperienceYears,
          requiredEducation: jobRequirements.requiredEducation
        },
        processingTime
      };
    } catch (error) {
      console.error('[OrchestratorAgent] Pipeline failed:', error.message);
      throw new Error(`Pipeline failed: ${error.message}`);
    }
  }
}

module.exports = new OrchestratorAgent();
