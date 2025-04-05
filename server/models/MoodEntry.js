
const mongoose = require('mongoose');

const MoodEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moodScore: {
    type: Number,
    required: [true, 'Please add a mood score'],
    min: 1,
    max: 10
  },
  moodCategory: {
    type: String,
    required: [true, 'Please add a mood category'],
    enum: ['happy', 'calm', 'sad', 'anxious', 'angry', 'neutral']
  },
  notes: {
    type: String
  },
  voiceNote: {
    type: String // URL to audio file
  },
  analysis: {
    sentiment: String,
    stress: Number,
    energy: Number,
    dominantEmotion: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for user and date to quickly retrieve recent entries
MoodEntrySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('MoodEntry', MoodEntrySchema);
