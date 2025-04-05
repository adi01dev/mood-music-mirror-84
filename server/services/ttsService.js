
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const axios = require('axios');
const path = require('path');

// Creates a Google Cloud Text-to-Speech client
const ttsClient = new textToSpeech.TextToSpeechClient();

/**
 * Convert text to speech using Google Cloud Text-to-Speech
 * @param {string} text - Text to convert to speech
 * @param {string} outputFilePath - Path to save the audio file
 * @returns {string} - Path to the generated audio file
 */
exports.textToSpeech = async (text, outputFilePath) => {
  try {
    // Construct the request
    const request = {
      input: { text },
      // Select the language and SSML voice gender
      voice: {
        languageCode: 'en-US',
        ssmlGender: 'NEUTRAL',
        name: 'en-US-Neural2-F' // A calming, supportive female voice
      },
      // Select the type of audio encoding
      audioConfig: { audioEncoding: 'MP3' },
    };

    // Performs the text-to-speech request
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputFilePath, response.audioContent, 'binary');
    
    return outputFilePath;
  } catch (error) {
    console.error('Error in text to speech conversion:', error);
    throw new Error('Failed to convert text to speech');
  }
};

/**
 * Convert text to speech using Eleven Labs API (more human-like voices)
 * @param {string} text - Text to convert to speech
 * @param {string} outputFilePath - Path to save the audio file
 * @param {string} voiceId - Eleven Labs voice ID (optional)
 * @returns {string} - Path to the generated audio file
 */
exports.textToSpeechElevenLabs = async (text, outputFilePath, voiceId = 'EXAVITQu4vr4xnSDxMaL') => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not set in environment variables');
    }
    
    // Make request to Eleven Labs API
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      data: {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      responseType: 'arraybuffer'
    });
    
    // Write the binary audio content to a local file
    fs.writeFileSync(outputFilePath, response.data);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error in Eleven Labs text to speech conversion:', error);
    throw new Error('Failed to convert text to speech with Eleven Labs');
  }
};

/**
 * Get calming feedback based on mood analysis
 * @param {string} moodCategory - The detected mood category
 * @returns {string} - Appropriate feedback text
 */
exports.generateFeedback = (moodCategory) => {
  const feedbackTemplates = {
    happy: [
      "It's wonderful to hear you're feeling good today. Positive emotions help build resilience for challenging times.",
      "Your positive mood is something to celebrate. Consider noting what contributed to this feeling so you can return to it later."
    ],
    calm: [
      "That sense of calm is valuable. Taking time to notice peaceful moments helps extend them.",
      "Your calm state is perfect for reflection or mindfulness practice. Consider taking a few deep breaths to further center yourself."
    ],
    sad: [
      "I notice you're feeling down today. Remember that all emotions are temporary, and it's okay to experience sadness.",
      "When feeling sad, gentle self-care can help. Perhaps a short walk, a warm drink, or connecting with someone you trust might provide some comfort."
    ],
    anxious: [
      "I hear that anxiety is present for you right now. Try taking a few slow, deep breaths - in for 4 counts, hold for 4, out for 6.",
      "Anxiety often comes from focusing on future uncertainties. Gently bringing your attention to the present moment may help reduce those feelings."
    ],
    angry: [
      "Anger is a natural response to feeling threatened or treated unfairly. Acknowledging it is the first step toward managing it.",
      "When feeling angry, physical movement can help process the emotion. Consider a brief walk or stretching to release some tension."
    ],
    neutral: [
      "You seem to be in a balanced state today. This neutral space can be a good foundation for intentional choices about your day.",
      "A neutral mood is like a clean canvas - you have the opportunity to shape your day intentionally from here."
    ]
  };
  
  const templates = feedbackTemplates[moodCategory];
  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * Generate TTS feedback response based on mood analysis
 * @param {Object} moodAnalysis - The mood analysis results
 * @param {string} outputDir - Directory to save the audio file
 * @returns {string} - Path to the generated audio file
 */
exports.generateTTSFeedback = async (moodAnalysis, outputDir = './public/audio') => {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const moodCategory = moodAnalysis.moodCategory;
    const feedbackText = exports.generateFeedback(moodCategory);
    
    // Create unique filename
    const filename = `feedback-${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, filename);
    
    // Generate TTS audio (using Eleven Labs for better quality)
    try {
      await exports.textToSpeechElevenLabs(feedbackText, outputPath);
    } catch (elevenLabsError) {
      console.error('Falling back to Google TTS after Eleven Labs error:', elevenLabsError);
      await exports.textToSpeech(feedbackText, outputPath);
    }
    
    // Return relative path that can be accessed from frontend
    return `/audio/${filename}`;
  } catch (error) {
    console.error('Error generating TTS feedback:', error);
    throw new Error('Failed to generate voice feedback');
  }
};
