const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['text/plain', 'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype) ||
      file.originalname.match(/\.(txt|pdf|doc|docx)$/i)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported: ${file.mimetype}. Use TXT, PDF, DOC, or DOCX.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 } // 10MB per file, max 20 files
});

module.exports = upload;
