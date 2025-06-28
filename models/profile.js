const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    required: true
  },
  location: String,
  skills: [String],
  social: {
    github: String,
    linkedin: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);