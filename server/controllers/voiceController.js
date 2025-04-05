
const { speechToText } = require('../services/speechService');

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

    // Convert the audio file to text
    const text = await speechToText(req.file.buffer);

    res.status(200).json({
      success: true,
      data: {
        text
      }
    });
  } catch (error) {
    next(error);
  }
};
