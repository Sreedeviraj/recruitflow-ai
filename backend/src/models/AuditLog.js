const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  action: {
    type: String,
    enum: ['session_created', 'resume_parsed', 'job_analyzed', 'scoring_complete', 'ranking_complete'],
    required: true
  },
  agentName: { type: String, required: true },
  details: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
