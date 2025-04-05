
const { OpenAI } = require('openai');
const axios = require('axios');
const natural = require('natural');
const Sentiment = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new Sentiment('English', stemmer);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze text to determine mood and sentiment using OpenAI
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
    console.error('Error analyzing text with OpenAI:', error);
    
    // Fall back to natural.js for basic sentiment analysis if OpenAI fails
    return analyzeTextWithNatural(text);
  }
};

/**
 * Analyze text using the BERT model via Hugging Face Inference API
 * @param {string} text - The text to analyze
 * @returns {Object} - Mood analysis results
 */
exports.analyzeTextWithBERT = async (text) => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment',
      { inputs: text },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract sentiment score (1-5)
    const results = response.data;
    let sentiment;
    let sentimentScore = 3; // Default neutral
    
    if (Array.isArray(results) && results.length > 0) {
      // Find the highest scoring sentiment
      let highestConfidence = 0;
      
      results[0].forEach(item => {
        if (item.score > highestConfidence) {
          highestConfidence = item.score;
          sentimentScore = parseInt(item.label.split(' ')[0]);
        }
      });
    }
    
    // Convert 1-5 to mood categories
    let moodCategory = 'neutral';
    if (sentimentScore <= 2) {
      moodCategory = Math.random() > 0.5 ? 'sad' : 'angry';
      sentiment = 'negative';
    } else if (sentimentScore >= 4) {
      moodCategory = Math.random() > 0.5 ? 'happy' : 'calm';
      sentiment = 'positive';
    } else {
      sentiment = 'neutral';
    }
    
    // Generate additional metrics based on the sentiment
    const stress = moodCategory === 'anxious' || moodCategory === 'angry' ? 
      Math.floor(Math.random() * 3) + 7 : // 7-9 for high stress
      Math.floor(Math.random() * 6) + 1;  // 1-6 for others
    
    const energy = moodCategory === 'happy' ? 
      Math.floor(Math.random() * 3) + 7 : // 7-9 for happy
      moodCategory === 'sad' ? 
        Math.floor(Math.random() * 3) + 1 : // 1-3 for sad
        Math.floor(Math.random() * 5) + 3;  // 3-7 for others
    
    const dominantEmotions = {
      happy: ['joy', 'excitement', 'contentment', 'satisfaction'],
      calm: ['peace', 'tranquility', 'relaxation', 'serenity'],
      sad: ['melancholy', 'grief', 'disappointment', 'sorrow'],
      anxious: ['worry', 'fear', 'nervousness', 'tension'],
      angry: ['frustration', 'irritation', 'resentment', 'annoyance'],
      neutral: ['neutrality', 'indifference', 'balance', 'steadiness']
    };
    
    const dominantEmotion = dominantEmotions[moodCategory][Math.floor(Math.random() * dominantEmotions[moodCategory].length)];
    
    const moodScore = sentimentScore * 2;
    
    return {
      moodCategory,
      moodScore,
      analysis: {
        sentiment,
        stress,
        energy,
        dominantEmotion
      }
    };
  } catch (error) {
    console.error('Error analyzing text with BERT:', error);
    // Fallback to natural.js
    return analyzeTextWithNatural(text);
  }
};

/**
 * Analyze text using the natural.js library (local analysis, no API required)
 * @param {string} text - The text to analyze
 * @returns {Object} - Mood analysis results
 */
function analyzeTextWithNatural(text) {
  try {
    // Get sentiment score (-5 to 5 range typically)
    const sentimentScore = analyzer.getSentiment(text.split(' '));
    
    // Map sentiment to mood
    let moodCategory = 'neutral';
    let sentiment = 'neutral';
    
    if (sentimentScore > 0.3) {
      moodCategory = Math.random() > 0.5 ? 'happy' : 'calm';
      sentiment = 'positive';
    } else if (sentimentScore < -0.3) {
      // Check for anxiety words
      if (/worr(y|ied)|nervous|anx(ious|iety)|stress(ed)?|fear(ful)?|panic/i.test(text)) {
        moodCategory = 'anxious';
      }
      // Check for anger words
      else if (/anger|angry|furious|annoy(ed|ing)|frustr/i.test(text)) {
        moodCategory = 'angry';
      } 
      // Default negative is sad
      else {
        moodCategory = 'sad';
      }
      sentiment = 'negative';
    }
    
    // Generate appropriate metrics based on the detected mood
    let stress = 5;
    let energy = 5;
    let moodScore = 5;
    
    switch (moodCategory) {
      case 'happy':
        stress = Math.floor(Math.random() * 3) + 1; // 1-3
        energy = Math.floor(Math.random() * 3) + 7; // 7-9
        moodScore = Math.floor(Math.random() * 3) + 7; // 7-9
        break;
      case 'calm':
        stress = Math.floor(Math.random() * 3) + 1; // 1-3
        energy = Math.floor(Math.random() * 3) + 3; // 3-5
        moodScore = Math.floor(Math.random() * 3) + 6; // 6-8
        break;
      case 'sad':
        stress = Math.floor(Math.random() * 3) + 5; // 5-7
        energy = Math.floor(Math.random() * 3) + 1; // 1-3
        moodScore = Math.floor(Math.random() * 3) + 2; // 2-4
        break;
      case 'anxious':
        stress = Math.floor(Math.random() * 3) + 7; // 7-9
        energy = Math.floor(Math.random() * 5) + 5; // 5-9
        moodScore = Math.floor(Math.random() * 3) + 3; // 3-5
        break;
      case 'angry':
        stress = Math.floor(Math.random() * 3) + 7; // 7-9
        energy = Math.floor(Math.random() * 3) + 7; // 7-9
        moodScore = Math.floor(Math.random() * 3) + 2; // 2-4
        break;
      case 'neutral':
        stress = Math.floor(Math.random() * 5) + 3; // 3-7
        energy = Math.floor(Math.random() * 5) + 3; // 3-7
        moodScore = 5;
        break;
    }
    
    const dominantEmotions = {
      happy: ['joy', 'excitement', 'contentment', 'satisfaction'],
      calm: ['peace', 'tranquility', 'relaxation', 'serenity'],
      sad: ['melancholy', 'grief', 'disappointment', 'sorrow'],
      anxious: ['worry', 'fear', 'nervousness', 'tension'],
      angry: ['frustration', 'irritation', 'resentment', 'annoyance'],
      neutral: ['neutrality', 'indifference', 'balance', 'steadiness']
    };
    
    const dominantEmotion = dominantEmotions[moodCategory][Math.floor(Math.random() * dominantEmotions[moodCategory].length)];
    
    return {
      moodCategory,
      moodScore,
      analysis: {
        sentiment,
        stress,
        energy,
        dominantEmotion
      }
    };
  } catch (error) {
    console.error('Error in local natural.js sentiment analysis:', error);
    
    // Fallback response if everything fails
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
}
