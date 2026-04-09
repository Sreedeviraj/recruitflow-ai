# RecruitFlow AI — Multi-Agent HR Resume Ranker
## Powered by ChatGPT GPT-4o (OpenAI)

AI-powered resume ranking using 6 specialized agents and the OpenAI GPT-4o API.

## Agent Architecture

```
User Browser
     │
     ▼
POST /api/rank
     │
     ▼
┌─────────────────────────────────────────────────────┐
│                 OrchestratorAgent                   │
│  Coordinates the full 7-step pipeline               │
└──────┬──────────────────────────────────────────────┘
       │
       ├─► [1] JobAnalyzerAgent ──► OpenAI GPT-4o
       │         Extract skills, experience, education
       │
       ├─► [2] ResumeParserAgent ──► OpenAI GPT-4o
       │         Parse candidate data (batches of 3)
       │
       ├─► [3] DBAgent ──► MongoDB
       │         Save job + resumes
       │
       ├─► [4] ScoringAgent ──► OpenAI GPT-4o
       │         Score each candidate (sequential)
       │
       ├─► [5] RankingAgent ──► Pure Logic
       │         Sort, rank, summarize
       │
       └─► [6] DBAgent ──► MongoDB
                 Save scores, session, audit logs
```

## Quick Start

### Step 1 — Get Your OpenAI API Key
1. Go to https://platform.openai.com
2. Sign in or create a free account
3. Navigate to API Keys in the left sidebar
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### Step 2 — Run the Project
```bash
# Install dependencies
cd backend && npm install

# Set your OpenAI API key
# Edit backend/.env and set: OPENAI_API_KEY=sk-your-key-here

# Make sure MongoDB is running on localhost:27017
# Then start the server:
npm start

# Open in browser:
# http://localhost:3000
```

### Step 3 — Load Seed Data (optional)
```bash
npm run seed
```

### Step 4 — Run Tests
```bash
npm test
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| OPENAI_API_KEY | YES | Your OpenAI API key (sk-...) |
| MONGODB_URI | YES | MongoDB connection string |
| PORT | NO | Server port (default 3000) |
| NODE_ENV | NO | development or production |

## MongoDB Collections

| Collection | Purpose |
|---|---|
| jobs | Job descriptions + requirements |
| resumes | Parsed candidate resumes |
| scores | GPT-4o scores with breakdowns |
| sessions | Summary of each ranking run |
| auditlogs | Full log of every agent action |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/rank | Run the full ranking pipeline |
| GET | /api/sessions | List recent sessions |
| GET | /api/sessions/:id | Session + all candidates |
| GET | /api/candidates/:id | Candidate detail + score |
| GET | /api/analytics/overview | Overall statistics |
| GET | /api/analytics/score-distribution | Score buckets |
| GET | /api/health | Health check |

## Application Agents

| Agent | Role |
|---|---|
| OrchestratorAgent | Pipeline coordinator (7 steps) |
| ResumeParserAgent | Extract resume data via GPT-4o |
| JobAnalyzerAgent | Extract job requirements via GPT-4o |
| ScoringAgent | Score candidates via GPT-4o |
| RankingAgent | Sort and assign ranks (pure logic) |
| DBAgent | Persist all data to MongoDB |

## Scoring Formula

```
Total Score = (Skill Score × 50%) +
              (Experience Score × 30%) +
              (Education Score × 20%)
```

| Score | Recommendation |
|---|---|
| 85-100 | Strongly Recommended |
| 70-84 | Recommended |
| 50-69 | Consider |
| 0-49 | Not Recommended |

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| AI | OpenAI GPT-4o via `openai` npm package |
| Database | MongoDB with Mongoose |
| File Parsing | pdf-parse (PDF), mammoth (DOCX) |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Testing | Jest, Supertest |

## Common Errors

| Error | Fix |
|---|---|
| 401 Unauthorized | Check OPENAI_API_KEY in backend/.env |
| 429 Rate Limited | Scoring runs sequentially — retry after a moment |
| MongoDB not connecting | Run: `mongod --dbpath /data/db` |
| Port 3000 in use | Change PORT in backend/.env |
| Cannot find module 'openai' | Run: `cd backend && npm install` |
