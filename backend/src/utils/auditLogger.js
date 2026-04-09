const AuditLog = require('../models/AuditLog');

const auditLogger = {
  async log(sessionId, action, agentName, details) {
    try {
      await AuditLog.create({
        sessionId,
        action,
        agentName,
        details: details || '',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[AuditLogger] Failed to write audit log:', error.message);
      // Non-fatal: don't throw
    }
  }
};

module.exports = auditLogger;
