# Orchestrator Agent

## System Overview
RecruitFlow AI is a multi-agent HR resume ranking system powered by OpenAI GPT-4o. The system accepts job descriptions and multiple resumes (uploaded files or pasted text), processes them through 6 specialized agents, and returns ranked candidates with detailed scoring breakdowns.

## Agent Execution Order
1. **DatabaseAgent** — MongoDB models and persistence layer
2. **BackendAgent** — Express API, routes, controllers, middleware
3. **AIAgent** — OpenAI GPT-4o integration + all 6 application agents
4. **FrontendAgent** — HTML/CSS/JS single-page application
5. **IntegrationAgent** — Wire all parts together, verify flows
6. **TestAgent** — Jest/Supertest test suite
7. **DevOpsAgent** — Docker, env files, README, Makefile

## Full Folder Structure
```
recruitflow-ai/
├── agents/
│   ├── orchestrator.md
│   ├── database-agent.md
│   ├── backend-agent.md
│   ├── ai-agent.md
│   ├── frontend-agent.md
│   ├── integration-agent.md
│   ├── test-agent.md
│   └── devops-agent.md
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── seed.js
│   │   ├── models/
│   │   │   ├── Job.js
│   │   │   ├── Resume.js
│   │   │   ├── Score.js
│   │   │   ├── Session.js
│   │   │   └── AuditLog.js
│   │   ├── routes/
│   │   │   └── resumeRoutes.js
│   │   ├── controllers/
│   │   │   └── rankingController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── utils/
│   │   │   ├── sessionIdGenerator.js
│   │   │   └── auditLogger.js
│   │   ├── agents/
│   │   │   ├── orchestratorAgent.js
│   │   │   ├── resumeParserAgent.js
│   │   │   ├── jobAnalyzerAgent.js
│   │   │   ├── scoringAgent.js
│   │   │   ├── rankingAgent.js
│   │   │   └── dbAgent.js
│   │   └── services/
│   │       └── aiService.js
│   ├── tests/
│   │   ├── health.test.js
│   │   ├── rank.test.js
│   │   ├── sessions.test.js
│   │   ├── analytics.test.js
│   │   └── agents.test.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── docker-compose.yml
├── Makefile
└── README.md
```

## Data Flow (ASCII Diagram)
```
User Browser
     │
     ▼
POST /api/rank (multipart/form-data)
     │
     ▼
rankingController.js
     │
     ▼
OrchestratorAgent.runPipeline()
     │
     ├─► Step 1: JobAnalyzerAgent.analyze()
     │         │
     │         └─► OpenAI GPT-4o → structured job requirements JSON
     │
     ├─► Step 2: ResumeParserAgent.parseMultiple()
     │         │
     │         └─► OpenAI GPT-4o (batches of 3) → structured resume JSON[]
     │
     ├─► Step 3: DBAgent.saveJob() + DBAgent.saveResumes()
     │         │
     │         └─► MongoDB: jobs + resumes collections
     │
     ├─► Step 4: ScoringAgent.scoreAll()
     │         │
     │         └─► OpenAI GPT-4o (sequential) → scores JSON[]
     │
     ├─► Step 5: RankingAgent.rank() + RankingAgent.generateSummary()
     │         │
     │         └─► Pure logic → sorted candidates with ranks
     │
     ├─► Step 6: DBAgent.saveScores() + DBAgent.saveSession()
     │         │
     │         └─► MongoDB: scores + sessions + auditlogs collections
     │
     └─► Return { success, sessionId, candidates, summary, ... }
          │
          ▼
     Frontend renders ranked results
```

## Technology Decisions
- **Runtime**: Node.js 18+ for async/await support and native fetch
- **Framework**: Express.js for simplicity and middleware ecosystem
- **Database**: MongoDB with Mongoose ODM for flexible schema evolution
- **AI Provider**: OpenAI GPT-4o via official `openai` npm package
- **File Parsing**: pdf-parse for PDFs, mammoth for DOCX files
- **File Upload**: multer with memory storage (no disk writes)
- **Frontend**: Vanilla JS + HTML/CSS (no framework dependencies)
- **Testing**: Jest + Supertest with mocked OpenAI calls
- **Containerization**: Docker Compose for MongoDB + backend services
