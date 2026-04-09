# DevOps Agent

## Files Created
- `backend/.env` — Environment variables (gitignored)
- `backend/.env.example` — Template for new developers
- `backend/package.json` — Dependencies and scripts
- `docker-compose.yml` — MongoDB + backend services
- `Makefile` — Developer convenience commands
- `README.md` — Full setup and usage documentation

## Environment Variables (name, purpose, example)
| Variable | Purpose | Example |
|----------|---------|---------|
| OPENAI_API_KEY | OpenAI GPT-4o authentication | sk-proj-xxx... |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/recruitflow_db |
| PORT | Express server port | 3000 |
| NODE_ENV | Runtime environment | development |

## Dependencies (name, version, reason)
| Package | Version | Reason |
|---------|---------|--------|
| express | ^4.18.2 | Web framework |
| mongoose | ^7.6.3 | MongoDB ODM |
| multer | ^1.4.5-lts.1 | File upload handling |
| cors | ^2.8.5 | Cross-origin requests |
| dotenv | ^16.3.1 | Environment variable loading |
| openai | ^4.20.1 | Official OpenAI GPT-4o client |
| pdf-parse | ^1.1.1 | Extract text from PDF files |
| mammoth | ^1.6.0 | Extract text from DOCX files |
| nodemon | ^3.0.1 | Dev auto-restart |
| jest | ^29.7.0 | Test framework |
| supertest | ^6.3.3 | HTTP testing |

## Setup Steps
1. Install Node.js 18+
2. Install MongoDB 7 locally or use Docker
3. `cd backend && npm install`
4. Copy `.env.example` to `.env`
5. Set `OPENAI_API_KEY` in `.env`
6. `npm start` to run server
7. Open http://localhost:3000

## Docker Setup
```bash
# Start MongoDB only
docker-compose up -d mongodb

# Start full stack
OPENAI_API_KEY=sk-your-key docker-compose up -d

# Stop all
docker-compose down
```

## Common Errors and Fixes
| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Invalid API key | Check OPENAI_API_KEY in .env |
| 429 Too Many Requests | Rate limit hit | Scoring runs sequentially to prevent this |
| ECONNREFUSED 27017 | MongoDB not running | Start MongoDB: mongod --dbpath /data/db |
| EADDRINUSE 3000 | Port in use | Change PORT in .env or kill existing process |
| Cannot find module 'openai' | Not installed | Run: cd backend && npm install |

## OpenAI API Setup Instructions
1. Go to https://platform.openai.com
2. Sign in or create an account
3. Navigate to "API Keys" in the left sidebar
4. Click "Create new secret key"
5. Give it a name (e.g., "RecruitFlow AI")
6. Copy the key — it starts with `sk-` and will only be shown once
7. Open `backend/.env` and set: `OPENAI_API_KEY=sk-your-key-here`
8. Ensure your OpenAI account has credits/billing set up
