require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const resumeRoutes = require('./src/routes/resumeRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api', resumeRoutes);

// Global error handler
app.use(errorHandler);

// Fallback to frontend for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// Start server (skip in test environment)
if (process.env.NODE_ENV !== 'test') app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║        RecruitFlow AI — Backend            ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║  Server:   http://localhost:${PORT}           ║`);
  console.log('║  AI:       OpenAI GPT-4o                   ║');
  console.log('║  Database: MongoDB                         ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log('║  Active Agents:                            ║');
  console.log('║   • OrchestratorAgent                      ║');
  console.log('║   • ResumeParserAgent                      ║');
  console.log('║   • JobAnalyzerAgent                       ║');
  console.log('║   • ScoringAgent                           ║');
  console.log('║   • RankingAgent                           ║');
  console.log('║   • DBAgent                                ║');
  console.log('╚════════════════════════════════════════════╝\n');
});

module.exports = app;
