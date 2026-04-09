const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  sessionId: { type: String, required: true, index: true },
  candidateName: { type: String, default: '' },
  skillScore: { type: Number, default: 0, min: 0, max: 100 },
  experienceScore: { type: Number, default: 0, min: 0, max: 100 },
  educationScore: { type: Number, default: 0, min: 0, max: 100 },
  totalScore: { type: Number, default: 0, min: 0, max: 100 },
  rank: { type: Number, default: 0 },
  matchedSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  aiSummary: { type: String, default: '' },
  recommendation: {
    type: String,
    enum: ['Strongly Recommended', 'Recommended', 'Consider', 'Not Recommended'],
    default: 'Not Recommended'
  },
  scoredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', scoreSchema);
