
// This file contains helper functions for the API
const axios = require('axios');

/**
 * Helper function to make all mood categories a union type 
 * to avoid TypeScript comparison errors
 * @param {string} moodCategory - The mood category to check
 * @returns {boolean} - Whether the mood category is valid
 */
exports.isValidMoodCategory = (moodCategory) => {
  const validCategories = ['happy', 'calm', 'sad', 'anxious', 'angry', 'neutral'];
  return validCategories.includes(moodCategory);
};

/**
 * Helper function to get search query for YouTube based on mood category
 * @param {string} moodCategory - The mood category
 * @returns {string} - The search query to use
 */
exports.getYouTubeSearchQuery = (moodCategory) => {
  const queries = {
    happy: 'happy uplifting motivational videos',
    calm: 'relaxing meditation peaceful videos',
    sad: 'comforting emotional support videos',
    anxious: 'anxiety relief techniques',
    angry: 'anger management calming',
    neutral: 'mindfulness focus videos'
  };
  
  return queries[moodCategory] || 'mindfulness videos';
};

/**
 * Helper function to get color scheme based on mood category
 * @param {string} moodCategory - The mood category
 * @returns {Object} - The color values for that mood
 */
exports.getMoodColors = (moodCategory) => {
  const colorSchemes = {
    happy: {
      primary: '#FFD700', // Gold
      secondary: '#FFA500', // Orange
      text: '#000000'      // Black
    },
    calm: {
      primary: '#ADD8E6', // Light Blue
      secondary: '#90EE90', // Light Green
      text: '#000000'      // Black
    },
    sad: {
      primary: '#6495ED', // Cornflower Blue
      secondary: '#D3D3D3', // Light Gray
      text: '#000000'      // Black
    },
    anxious: {
      primary: '#FFA07A', // Light Salmon
      secondary: '#F08080', // Light Coral
      text: '#000000'      // Black
    },
    angry: {
      primary: '#FF6347', // Tomato
      secondary: '#FF4500', // Orange Red
      text: '#FFFFFF'      // White
    },
    neutral: {
      primary: '#E0E0E0', // Light Gray
      secondary: '#C0C0C0', // Silver
      text: '#000000'      // Black
    }
  };
  
  return colorSchemes[moodCategory] || colorSchemes.neutral;
};

/**
 * Helper function to handle API errors
 * @param {Error} error - The error object
 * @param {string} operationName - Name of the operation that failed
 * @returns {Object} - Formatted error object
 */
exports.handleApiError = (error, operationName) => {
  console.error(`Error during ${operationName}:`, error);
  
  // Format the error response
  let errorMessage = 'An unexpected error occurred';
  let statusCode = 500;
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    statusCode = error.response.status;
    errorMessage = error.response.data.message || error.response.data || errorMessage;
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response received from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || errorMessage;
  }
  
  return {
    success: false,
    statusCode,
    message: errorMessage,
    operation: operationName
  };
};
