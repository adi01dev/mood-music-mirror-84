
const { speechToText, speechToTextWhisper } = require('../services/speechService');
const { analyzeText, analyzeTextWithBERT } = require('../services/aiService');
const { generateTTSFeedback } = require('../services/ttsService');
const path = require('path');

// @desc    Convert speech to text
// @route   POST /api/voice/transcribe
// @access  Private
exports.convertSpeechToText = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an audio file'
      });
    }

    let text = '';
    let transcriptionMethod = '';
    
    // Try OpenAI Whisper first (better quality)
    try {
      text = await speechToTextWhisper(req.file.buffer);
      transcriptionMethod = 'whisper';
    } catch (whisperError) {
      console.log('Whisper API failed, falling back to Google Speech:', whisperError.message);
      
      // Fall back to Google if Whisper fails
      try {
        text = await speechToText(req.file.buffer);
        transcriptionMethod = 'google';
      } catch (googleError) {
        console.error('Both speech APIs failed:', googleError);
        return res.status(500).json({
          success: false,
          error: 'Failed to transcribe audio with both available services'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        text,
        transcriptionMethod
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze voice for mood and emotion
// @route   POST /api/voice/analyze
// @access  Private
exports.analyzeVoice = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an audio file'
      });
    }

    // Step 1: Transcribe speech to text
    let text;
    try {
      // Try Whisper first, fall back to Google if needed
      try {
        text = await speechToTextWhisper(req.file.buffer);
      } catch (whisperError) {
        console.log('Whisper API failed, falling back to Google Speech');
        text = await speechToText(req.file.buffer);
      }
    } catch (error) {
      console.error('Speech-to-text conversion failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to transcribe audio'
      });
    }

    // Step 2: Analyze text for mood
    let analysis;
    try {
      // Try OpenAI first, fall back to BERT if needed
      try {
        analysis = await analyzeText(text);
      } catch (openaiError) {
        console.log('OpenAI analysis failed, falling back to BERT');
        analysis = await analyzeTextWithBERT(text);
      }
    } catch (error) {
      console.error('Mood analysis failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze mood'
      });
    }

    // Step 3: Generate TTS feedback (optional)
    let feedbackAudioUrl = null;
    try {
      const outputDir = path.join(__dirname, '../../public/audio');
      feedbackAudioUrl = await generateTTSFeedback(analysis, outputDir);
    } catch (ttsError) {
      console.error('TTS feedback generation failed:', ttsError);
      // Continue without feedback - non-critical error
    }

    // Return comprehensive results
    res.status(200).json({
      success: true,
      data: {
        transcription: text,
        moodAnalysis: analysis,
        feedbackAudioUrl
      }
    });
  } catch (error) {
    next(error);
  }
};
