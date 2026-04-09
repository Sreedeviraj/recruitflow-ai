# Backend Agent

## Files Created
- backend/src/config/db.js — MongoDB connection
- backend/src/config/seed.js — Seed data script
- backend/src/models/Job.js — Job schema
- backend/src/models/Resume.js — Resume schema
- backend/src/models/Score.js — Score schema
- backend/src/models/Session.js — Session schema
- backend/src/models/AuditLog.js — AuditLog schema
- backend/src/routes/resumeRoutes.js — All API route definitions
- backend/src/controllers/rankingController.js — Request handlers
- backend/src/middleware/errorHandler.js — Global error middleware
- backend/src/middleware/upload.js — Multer configuration
- backend/src/utils/sessionIdGenerator.js — Session ID utility
- backend/src/utils/auditLogger.js — Audit log utility
- backend/server.js — Express app entry point

## API Endpoints (method, path, body, response)

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | /api/rank | multipart: jobTitle, jobDescription, resumes[], pastedResumes[] | { success, sessionId, jobTitle, summary, candidates, jobRequirements, processingTime } |
| GET | /api/sessions | — | { success, sessions: [...] } |
| GET | /api/sessions/:sessionId | — | { success, session, candidates: [...] } |
| GET | /api/candidates/:resumeId | — | { success, candidate, score } |
| GET | /api/analytics/overview | — | { totalSessions, totalResumes, averageScore, topSkillsFound } |
| GET | /api/analytics/score-distribution | — | { buckets: [...] } |
| GET | /api/health | — | { status, service, aiProvider, model, agents, mongodb, timestamp } |

## Middleware Used
- `cors()` — allows all origins in development
- `express.json({ limit: "50mb" })` — parse JSON bodies
- `multer` — memory storage for file uploads
- `errorHandler` — global error catch middleware

## Error Handling Strategy
- All routes wrapped in try/catch
- Global errorHandler middleware catches unhandled errors
- Returns { success: false, error: "message" } for all failures
- Validation errors return 400 with descriptive messages
- Not-found errors return 404
- Server errors return 500
