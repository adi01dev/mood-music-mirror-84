
const MoodEntry = require('../models/MoodEntry');
const { analyzeText } = require('../services/aiService');

// @desc    Get all mood entries for a user
// @route   GET /api/moods
// @access  Private
exports.getMoods = async (req, res, next) => {
  try {
    // Get all moods for the current user, sorted by date (newest first)
    const moods = await MoodEntry.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: moods.length,
      data: moods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single mood entry
// @route   GET /api/moods/:id
// @access  Private
exports.getMood = async (req, res, next) => {
  try {
    const mood = await MoodEntry.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({
        success: false,
        error: 'Mood entry not found'
      });
    }

    // Make sure user owns the mood entry
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this mood entry'
      });
    }

    res.status(200).json({
      success: true,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new mood entry
// @route   POST /api/moods
// @access  Private
exports.createMood = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;

    const mood = await MoodEntry.create(req.body);

    res.status(201).json({
      success: true,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mood entry
// @route   PUT /api/moods/:id
// @access  Private
exports.updateMood = async (req, res, next) => {
  try {
    let mood = await MoodEntry.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({
        success: false,
        error: 'Mood entry not found'
      });
    }

    // Make sure user owns the mood entry
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this mood entry'
      });
    }

    mood = await MoodEntry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete mood entry
// @route   DELETE /api/moods/:id
// @access  Private
exports.deleteMood = async (req, res, next) => {
  try {
    const mood = await MoodEntry.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({
        success: false,
        error: 'Mood entry not found'
      });
    }

    // Make sure user owns the mood entry
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this mood entry'
      });
    }

    await mood.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze voice recording to detect mood
// @route   POST /api/moods/analyze
// @access  Private
exports.analyzeVoiceMood = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Please provide the transcribed text'
      });
    }

    // Analyze the text using AI service
    const analysis = await analyzeText(text);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};
