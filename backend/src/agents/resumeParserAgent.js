const aiService = require('../services/aiService');

class ResumeParserAgent {
  constructor() {
    this.systemPrompt = `You are an expert HR Resume Parser. Extract structured information from resumes. Return ONLY valid JSON with no markdown, no explanation, no extra text.`;
  }

  async parse(resumeText, fileName = 'resume') {
    console.log(`[ResumeParserAgent] Parsing resume: ${fileName}`);

    // Truncate very long resumes to avoid GPT-4o context limits
    const truncatedText = resumeText.length > 3000
      ? resumeText.substring(0, 3000) + '\n[Content truncated for processing]'
      : resumeText;

    const userPrompt = `Extract all information from this resume and return as JSON.

Resume:
${truncatedText}

Return a JSON object with exactly these fields:
{
  "candidateName": "full name string",
  "email": "email or null",
  "phone": "phone or null",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "company name",
      "role": "job title",
      "duration": "time period string",
      "years": 2.5,
      "description": "brief description"
    }
  ],
  "education": [
    {
      "institution": "school name",
      "degree": "degree type",
      "field": "field of study",
      "year": "graduation year"
    }
  ],
  "totalExperienceYears": 5
}

Rules:
- skills: list all technical skills, tools, and technologies mentioned
- experience.years: numeric estimate of years in that role
- totalExperienceYears: total career years (sum of non-overlapping experience)
- All array fields must be arrays (use [] if none found)
- Return ONLY the JSON object, nothing else`;

    try {
      const response = await aiService.analyze(this.systemPrompt, userPrompt, 2000);
      const parsed = aiService.parseJSON(response);

      return {
        candidateName: parsed.candidateName || this._nameFromFile(fileName),
        email: parsed.email || null,
        phone: parsed.phone || null,
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        totalExperienceYears: typeof parsed.totalExperienceYears === 'number' ? parsed.totalExperienceYears : 0
      };
    } catch (error) {
      console.error(`[ResumeParserAgent] Error parsing ${fileName}:`, error.message);
      // Return fallback object on failure
      return {
        candidateName: this._nameFromFile(fileName),
        email: null,
        phone: null,
        skills: [],
        experience: [],
        education: [],
        totalExperienceYears: 0
      };
    }
  }

  async parseMultiple(resumesArray) {
    console.log(`[ResumeParserAgent] Parsing ${resumesArray.length} resumes in batches of 3...`);
    const results = [];
    const batchSize = 3;

    for (let i = 0; i < resumesArray.length; i += batchSize) {
      const batch = resumesArray.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(r => this.parse(r.content, r.fileName))
      );
      results.push(...batchResults);
      console.log(`[ResumeParserAgent] Batch ${Math.floor(i / batchSize) + 1} complete`);
    }

    return results;
  }

  _nameFromFile(fileName) {
    return fileName
      .replace(/\.(txt|pdf|doc|docx)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown Candidate';
  }
}

module.exports = new ResumeParserAgent();
