# Database Agent

## Collections Designed
5 MongoDB collections: jobs, resumes, scores, sessions, auditlogs

## Schema Decisions
- Used Mongoose for schema validation and ODM
- All _id fields use MongoDB's default ObjectId
- sessionId is a string (not ObjectId) for human-readable grouping
- Timestamps via `{ timestamps: true }` option on jobs and resumes
- scoredAt and uploadedAt stored as Date fields
- recommendation enum enforced at schema level

## Relationships Between Collections
```
jobs (1) ──────────────────────────── (N) resumes
jobs (1) ──────────────────────────── (N) scores
jobs (1) ──────────────────────────── (N) sessions
resumes (1) ────────────────────────── (1) scores
sessions (1) ───────────────────────── (N) auditlogs

All cross-collection links use sessionId (string) for easy grouping
resumeId and jobId in scores use ObjectId refs for populate()
```

## Seed Data Plan
- 2 jobs: Senior Full Stack Developer + Product Designer
- 3 resumes per job (strong/medium/weak match)
- Pre-computed scores for all 6 resumes
- 2 complete sessions with full audit logs (5 entries each)
