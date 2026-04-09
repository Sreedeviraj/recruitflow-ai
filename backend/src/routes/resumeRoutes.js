const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  rankCandidates,
  getSessions,
  getSession,
  getCandidate,
  getAnalyticsOverview,
  getScoreDistribution,
  healthCheck
} = require('../controllers/rankingController');

router.post('/rank', upload.array('resumes', 20), rankCandidates);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId', getSession);
router.get('/candidates/:resumeId', getCandidate);
router.get('/analytics/overview', getAnalyticsOverview);
router.get('/analytics/score-distribution', getScoreDistribution);
router.get('/health', healthCheck);

module.exports = router;
