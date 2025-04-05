
const { Readable } = require('stream');
const { SpeechClient } = require('@google-cloud/speech');

// Creates a client
const speechClient = new SpeechClient();

/**
 * Convert speech audio to text using Google Cloud Speech-to-Text
 * @param {Buffer} audioBuffer - Audio file buffer
 * @returns {string} - Transcribed text
 */
exports.speechToText = async (audioBuffer) => {
  try {
    // Create audio input config
    const audio = {
      content: audioBuffer.toString('base64'),
    };
    
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };
    
    const request = {
      audio: audio,
      config: config,
    };

    // Detects speech in the audio file
    const [response] = await speechClient.recognize(request);
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    return transcription;
  } catch (error) {
    console.error('Error in speech to text conversion:', error);
    throw new Error('Failed to convert speech to text');
  }
};

// Fallback implementation using mock data (for testing without API key)
exports.speechToTextMock = async (audioBuffer) => {
  // Wait to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock transcriptions for testing
  const mockTranscriptions = [
    "I'm feeling really good today. I had a productive morning and everything is going well.",
    "I'm a bit stressed about my upcoming presentation, but otherwise okay.",
    "Today I feel quite low. I didn't sleep well and I'm missing my family.",
    "I'm feeling calm and relaxed after my morning meditation session.",
    "I'm so frustrated with my project, nothing seems to be working right.",
    "Just a normal day, nothing special to report really."
  ];
  
  return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
};
