const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requiredSkills: { type: [String], default: [] },
  preferredSkills: { type: [String], default: [] },
  requiredExperienceYears: { type: Number, default: 0 },
  requiredEducation: { type: String, default: '' },
  keyResponsibilities: { type: [String], default: [] },
  industry: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
