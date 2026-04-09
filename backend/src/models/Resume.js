const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  role: { type: String, default: '' },
  duration: { type: String, default: '' },
  years: { type: Number, default: 0 },
  description: { type: String, default: '' }
}, { _id: false });

const educationSchema = new mongoose.Schema({
  institution: { type: String, default: '' },
  degree: { type: String, default: '' },
  field: { type: String, default: '' },
  year: { type: String, default: '' }
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  sessionId: { type: String, required: true, index: true },
  candidateName: { type: String, default: 'Unknown Candidate' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experience: { type: [experienceSchema], default: [] },
  education: { type: [educationSchema], default: [] },
  totalExperienceYears: { type: Number, default: 0 },
  rawContent: { type: String, default: '' },
  fileName: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
