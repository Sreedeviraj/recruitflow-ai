const aiService = require('../services/aiService');

class ScoringAgent {
  constructor() {
    this.systemPrompt = `You are an expert HR Candidate Scorer. Compare the candidate profile against job requirements. Score each dimension 0-100. Return ONLY valid JSON, no markdown.`;
  }

  async score(parsedResume, jobRequirements) {
    console.log(`[ScoringAgent] Scoring candidate: ${parsedResume.candidateName}`);

    const userPrompt = `Score this candidate against the job requirements.

JOB REQUIREMENTS:
- Required Skills: ${jobRequirements.requiredSkills.join(', ')}
- Preferred Skills: ${jobRequirements.preferredSkills.join(', ')}
- Required Experience: ${jobRequirements.requiredExperienceYears} years
- Required Education: ${jobRequirements.requiredEducation}

CANDIDATE PROFILE:
- Name: ${parsedResume.candidateName}
- Skills: ${parsedResume.skills.join(', ')}
- Total Experience: ${parsedResume.totalExperienceYears} years
- Experience Details: ${parsedResume.experience.map(e => `${e.role} at ${e.company} (${e.years} yrs)`).join('; ')}
- Education: ${parsedResume.education.map(e => `${e.degree} in ${e.field} from ${e.institution} (${e.year})`).join('; ')}

Return a JSON object with exactly these fields:
{
  "skillScore": 85,
  "experienceScore": 78,
  "educationScore": 90,
  "matchedSkills": ["React", "Node.js"],
  "missingSkills": ["Kubernetes", "GraphQL"],
  "aiSummary": "2-3 sentence assessment of the candidate",
  "recommendation": "Recommended"
}

Scoring guidelines:
- skillScore (0-100): how well candidate skills match required + preferred skills
- experienceScore (0-100): how well candidate experience matches requirements
- educationScore (0-100): how well education matches requirements
- matchedSkills: required/preferred skills the candidate has
- missingSkills: required skills the candidate is missing
- Return ONLY the JSON object, nothing else`;

    try {
      const response = await aiService.analyze(this.systemPrompt, userPrompt, 1500);
      const parsed = aiService.parseJSON(response);

      const skillScore = Math.min(100, Math.max(0, Number(parsed.skillScore) || 0));
      const experienceScore = Math.min(100, Math.max(0, Number(parsed.experienceScore) || 0));
      const educationScore = Math.min(100, Math.max(0, Number(parsed.educationScore) || 0));

      // Calculate totalScore locally
      const totalScore = Math.round(
        (skillScore * 0.50) +
        (experienceScore * 0.30) +
        (educationScore * 0.20)
      );

      // Assign recommendation tier locally
      const recommendation = this._getRecommendation(totalScore);

      return {
        skillScore,
        experienceScore,
        educationScore,
        totalScore,
        matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
        aiSummary: parsed.aiSummary || 'Assessment not available.',
        recommendation
      };
    } catch (error) {
      console.error(`[ScoringAgent] Error scoring ${parsedResume.candidateName}:`, error.message);
      return {
        skillScore: 0,
        experienceScore: 0,
        educationScore: 0,
        totalScore: 0,
        matchedSkills: [],
        missingSkills: jobRequirements.requiredSkills || [],
        aiSummary: `Scoring failed for this candidate: ${error.message}`,
        recommendation: 'Not Recommended'
      };
    }
  }

  async scoreAll(parsedResumes, jobRequirements) {
    console.log(`[ScoringAgent] Scoring ${parsedResumes.length} candidates sequentially...`);
    const scores = [];

    for (const resume of parsedResumes) {
      const score = await this.score(resume, jobRequirements);
      scores.push({ ...score, candidateName: resume.candidateName });
    }

    console.log('[ScoringAgent] All candidates scored');
    return scores;
  }

  _getRecommendation(totalScore) {
    if (totalScore >= 85) return 'Strongly Recommended';
    if (totalScore >= 70) return 'Recommended';
    if (totalScore >= 50) return 'Consider';
    return 'Not Recommended';
  }
}

module.exports = new ScoringAgent();
