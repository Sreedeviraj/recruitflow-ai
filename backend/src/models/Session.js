const mongoose = require('mongoose');

const breakdownSchema = new mongoose.Schema({
  stronglyRecommended: { type: Number, default: 0 },
  recommended: { type: Number, default: 0 },
  consider: { type: Number, default: 0 },
  notRecommended: { type: Number, default: 0 }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  jobTitle: { type: String, default: '' },
  totalCandidates: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  topCandidateName: { type: String, default: '' },
  topScore: { type: Number, default: 0 },
  processingTime: { type: String, default: '' },
  breakdown: { type: breakdownSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
