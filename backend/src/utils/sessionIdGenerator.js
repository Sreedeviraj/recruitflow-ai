const generateSessionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `session_${timestamp}_${random}`;
};

module.exports = { generateSessionId };
