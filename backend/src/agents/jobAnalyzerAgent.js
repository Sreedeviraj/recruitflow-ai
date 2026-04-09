const aiService = require('../services/aiService');

class JobAnalyzerAgent {
  constructor() {
    this.systemPrompt = `You are an expert Job Description Analyzer for HR teams. Return ONLY valid JSON, no markdown, no extra text.`;
  }

  async analyze(jobDescription, jobTitle = '') {
    console.log('[JobAnalyzerAgent] Analyzing job description...');

    const userPrompt = `Analyze this job description and extract structured requirements.

Job Title: ${jobTitle}

Job Description:
${jobDescription}

Return a JSON object with exactly these fields:
{
  "title": "job title string",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "requiredExperienceYears": 5,
  "requiredEducation": "education requirement string",
  "keyResponsibilities": ["responsibility1", "responsibility2"],
  "industry": "industry name"
}

Rules:
- requiredSkills: specific technologies, tools, or skills explicitly required
- preferredSkills: nice-to-have skills mentioned as preferred/bonus
- requiredExperienceYears: extract the minimum years of experience as a number
- All array fields must be arrays (use [] if none found)
- Return ONLY the JSON object, nothing else`;

    try {
      const response = await aiService.analyze(this.systemPrompt, userPrompt, 1500);
      const parsed = aiService.parseJSON(response);

      return {
        title: parsed.title || jobTitle || 'Unknown Position',
        requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
        preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills : [],
        requiredExperienceYears: typeof parsed.requiredExperienceYears === 'number' ? parsed.requiredExperienceYears : 0,
        requiredEducation: parsed.requiredEducation || '',
        keyResponsibilities: Array.isArray(parsed.keyResponsibilities) ? parsed.keyResponsibilities : [],
        industry: parsed.industry || ''
      };
    } catch (error) {
      console.error('[JobAnalyzerAgent] Error:', error.message);
      throw new Error(`Job analysis failed: ${error.message}`);
    }
  }
}

module.exports = new JobAnalyzerAgent();
