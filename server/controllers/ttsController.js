
const { generateTTSFeedback } = require('../services/ttsService');
const { analyzeText } = require('../services/aiService');
const path = require('path');

// @desc    Generate voice feedback based on mood
// @route   POST /api/tts/feedback
// @access  Private
exports.generateVoiceFeedback = async (req, res, next) => {
  try {
    const { moodCategory, text } = req.body;
    
    if (!moodCategory && !text) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either moodCategory or text for analysis'
      });
    }
    
    let moodData = { moodCategory };
    
    // If text is provided, analyze it first
    if (text && !moodCategory) {
      moodData = await analyzeText(text);
    }
    
    // Generate audio feedback
    const outputDir = path.join(__dirname, '../../public/audio');
    const audioPath = await generateTTSFeedback(moodData, outputDir);
    
    res.status(200).json({
      success: true,
      data: {
        audioUrl: audioPath,
        moodAnalysis: moodData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert plain text to speech
// @route   POST /api/tts/convert
// @access  Private
exports.convertTextToSpeech = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Please provide text to convert to speech'
      });
    }
    
    // Add custom logic here if needed for different types of text
    const outputDir = path.join(__dirname, '../../public/audio');
    
    // Use the same TTSFeedback function but with a generic mood
    const audioPath = await generateTTSFeedback({ moodCategory: 'neutral', text }, outputDir);
    
    res.status(200).json({
      success: true,
      data: {
        audioUrl: audioPath,
        text
      }
    });
  } catch (error) {
    next(error);
  }
};
