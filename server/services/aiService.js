
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze text to determine mood and sentiment
 * @param {string} text - The text to analyze
 * @returns {Object} - Mood analysis results
 */
exports.analyzeText = async (text) => {
  try {
    // Call OpenAI API for sentiment analysis
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI specialized in emotional analysis. Analyze the following text for:
          1. Overall mood category (must be one of: happy, calm, sad, anxious, angry, neutral)
          2. Sentiment (positive, negative, or neutral)
          3. Stress level (1-10 scale, where 1 is minimal stress and 10 is extreme stress)
          4. Energy level (1-10 scale, where 1 is very low energy and 10 is very high energy)
          5. Dominant emotion (be specific, e.g. "joy", "contentment", "worry", "frustration", etc.)
          
          Respond with ONLY a JSON object with these fields and no additional text.`
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "gpt-3.5-turbo-0125",
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 200
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);
    
    // Ensure the mood category is valid
    if (!['happy', 'calm', 'sad', 'anxious', 'angry', 'neutral'].includes(analysisResult.moodCategory)) {
      analysisResult.moodCategory = 'neutral';
    }
    
    // Calculate mood score based on sentiment and energy
    let moodScore;
    switch (analysisResult.moodCategory) {
      case 'happy':
        moodScore = Math.min(10, Math.round(6 + analysisResult.energy * 0.4));
        break;
      case 'calm':
        moodScore = Math.min(10, Math.round(5 + (10 - analysisResult.stress) * 0.3));
        break;
      case 'sad':
        moodScore = Math.max(1, Math.round(4 - analysisResult.energy * 0.3));
        break;
      case 'anxious':
        moodScore = Math.max(1, Math.round(5 - analysisResult.stress * 0.3));
        break;
      case 'angry':
        moodScore = Math.max(1, Math.round(4 - analysisResult.stress * 0.3));
        break;
      default: // neutral
        moodScore = 5;
    }

    return {
      moodCategory: analysisResult.moodCategory,
      moodScore,
      analysis: {
        sentiment: analysisResult.sentiment,
        stress: analysisResult.stress,
        energy: analysisResult.energy,
        dominantEmotion: analysisResult.dominantEmotion
      }
    };
  } catch (error) {
    console.error('Error analyzing text with AI:', error);
    
    // Fallback response if API fails
    return {
      moodCategory: 'neutral',
      moodScore: 5,
      analysis: {
        sentiment: 'neutral',
        stress: 5,
        energy: 5,
        dominantEmotion: 'uncertainty'
      }
    };
  }
};
