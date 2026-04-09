# AI Agent

## Application Agents Implemented
1. **OrchestratorAgent** — Pipeline coordinator, runs all steps in order
2. **ResumeParserAgent** — Extracts structured data from resume text via GPT-4o
3. **JobAnalyzerAgent** — Extracts requirements from job description via GPT-4o
4. **ScoringAgent** — Scores each candidate against job requirements via GPT-4o
5. **RankingAgent** — Pure logic sorting and summary (no AI calls)
6. **DBAgent** — MongoDB persistence layer (no AI calls)

## OpenAI GPT-4o Integration Approach
- Single `aiService.js` singleton wraps all GPT-4o calls
- Uses official `openai` npm package with `OPENAI_API_KEY` env var
- Model: `gpt-4o` for all calls
- System prompts enforce JSON-only output
- `parseJSON()` strips markdown code fences before parsing
- Sequential scoring prevents OpenAI rate limit 429 errors
- Resumes truncated to 3000 chars before sending to avoid context limits

## System Prompts Used Per Agent

**ResumeParserAgent:**
"You are an expert HR Resume Parser. Extract structured information from resumes. Return ONLY valid JSON with no markdown, no explanation, no extra text."

**JobAnalyzerAgent:**
"You are an expert Job Description Analyzer for HR teams. Return ONLY valid JSON, no markdown, no extra text."

**ScoringAgent:**
"You are an expert HR Candidate Scorer. Compare the candidate profile against job requirements. Score each dimension 0-100. Return ONLY valid JSON, no markdown."

## JSON Contracts Between Agents

**JobAnalyzerAgent → OrchestratorAgent:**
```json
{
  "title": "string",
  "requiredSkills": ["skill1"],
  "preferredSkills": ["skill1"],
  "requiredExperienceYears": 5,
  "requiredEducation": "string",
  "keyResponsibilities": ["resp1"],
  "industry": "string"
}
```

**ResumeParserAgent → OrchestratorAgent:**
```json
{
  "candidateName": "string",
  "email": "string|null",
  "phone": "string|null",
  "skills": ["skill1"],
  "experience": [{"company":"","role":"","duration":"","years":0,"description":""}],
  "education": [{"institution":"","degree":"","field":"","year":""}],
  "totalExperienceYears": 3
}
```

**ScoringAgent → RankingAgent:**
```json
{
  "skillScore": 85,
  "experienceScore": 80,
  "educationScore": 90,
  "totalScore": 84,
  "matchedSkills": ["React"],
  "missingSkills": ["Kubernetes"],
  "aiSummary": "Strong candidate...",
  "recommendation": "Recommended"
}
```

## Error Handling Per Agent
- All agents: try/catch with console.error logging
- ResumeParserAgent: fallback object with candidateName from fileName on parse failure
- ScoringAgent: zero scores + error note in aiSummary on failure
- OrchestratorAgent: wraps entire pipeline, rethrows with context
- DBAgent: Mongoose validation errors propagated up
