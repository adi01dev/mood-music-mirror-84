
const axios = require('axios');

// @desc    Get recommendations based on mood
// @route   GET /api/recommendations/:moodCategory
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const { moodCategory } = req.params;

    if (!['happy', 'calm', 'sad', 'anxious', 'angry', 'neutral'].includes(moodCategory)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mood category'
      });
    }

    // Get recommendations from multiple sources
    const [youtubeData, spotifyData] = await Promise.all([
      getYouTubeVideosForMood(moodCategory),
      getSpotifyPlaylistsForMood(moodCategory)
    ]);

    // Get activity recommendations based on mood
    const activities = getActivityRecommendations(moodCategory);

    // Combine all recommendations
    const recommendations = [
      ...youtubeData.map(item => ({
        id: `youtube-${item.id.videoId}`,
        type: 'video',
        title: item.snippet.title,
        description: item.snippet.description,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.high.url,
        moodCategory
      })),
      ...spotifyData.map(item => ({
        id: `spotify-${item.id}`,
        type: 'music',
        title: item.name,
        description: item.description,
        url: item.external_urls.spotify,
        thumbnail: item.images[0]?.url,
        moodCategory
      })),
      ...activities.map((item, index) => ({
        id: `activity-${moodCategory}-${index}`,
        type: 'activity',
        title: item.title,
        description: item.description,
        url: '#',
        moodCategory
      }))
    ];

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get YouTube videos based on mood
// @route   GET /api/recommendations/youtube/:moodCategory
// @access  Private
exports.getYouTubeVideos = async (req, res, next) => {
  try {
    const { moodCategory } = req.params;

    if (!['happy', 'calm', 'sad', 'anxious', 'angry', 'neutral'].includes(moodCategory)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mood category'
      });
    }

    const videos = await getYouTubeVideosForMood(moodCategory);

    // Format the response
    const formattedVideos = videos.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.high.url
    }));

    res.status(200).json({
      success: true,
      count: formattedVideos.length,
      data: formattedVideos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Spotify playlists based on mood
// @route   GET /api/recommendations/spotify/:moodCategory
// @access  Private
exports.getSpotifyPlaylists = async (req, res, next) => {
  try {
    const { moodCategory } = req.params;

    if (!['happy', 'calm', 'sad', 'anxious', 'angry', 'neutral'].includes(moodCategory)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mood category'
      });
    }

    const playlists = await getSpotifyPlaylistsForMood(moodCategory);

    // Format the response
    const formattedPlaylists = playlists.map(item => ({
      id: item.id,
      title: item.name,
      description: item.description,
      url: item.external_urls.spotify,
      thumbnail: item.images[0]?.url
    }));

    res.status(200).json({
      success: true,
      count: formattedPlaylists.length,
      data: formattedPlaylists
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get YouTube videos for a specific mood
async function getYouTubeVideosForMood(moodCategory) {
  try {
    const searchQuery = getYouTubeSearchQuery(moodCategory);
    
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${searchQuery}&type=video&key=${process.env.YOUTUBE_API_KEY}`
    );

    return response.data.items;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}

// Helper function to get Spotify access token
async function getSpotifyAccessToken() {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'client_credentials'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
}

// Helper function to get Spotify playlists for a specific mood
async function getSpotifyPlaylistsForMood(moodCategory) {
  try {
    const searchQuery = getSpotifySearchQuery(moodCategory);
    const token = await getSpotifyAccessToken();
    
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=playlist&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.playlists.items;
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    return [];
  }
}

// Helper function to get appropriate YouTube search query based on mood
function getYouTubeSearchQuery(moodCategory) {
  const queryMap = {
    happy: 'uplifting positive motivation videos',
    calm: 'relaxing meditation peaceful videos',
    sad: 'comforting emotional support videos',
    anxious: 'anxiety relief breathing techniques',
    angry: 'anger management calming techniques',
    neutral: 'mindfulness focus improvement videos'
  };
  
  return queryMap[moodCategory] || 'mindfulness videos';
}

// Helper function to get appropriate Spotify search query based on mood
function getSpotifySearchQuery(moodCategory) {
  const queryMap = {
    happy: 'happy upbeat mood boosting',
    calm: 'calm relaxing peaceful',
    sad: 'comfort sad emotional healing',
    anxious: 'anxiety relief calm down',
    angry: 'anger management calm',
    neutral: 'focus concentration productivity'
  };
  
  return queryMap[moodCategory] || 'meditation';
}

// Helper function to get activity recommendations based on mood
function getActivityRecommendations(moodCategory) {
  const activityMap = {
    happy: [
      {
        title: 'Gratitude Journaling',
        description: 'Write down three things you're grateful for today'
      },
      {
        title: 'Share Your Joy',
        description: 'Call or message someone you care about to share your good mood'
      }
    ],
    calm: [
      {
        title: 'Deep Breathing',
        description: 'Take 10 deep breaths, inhaling for 4 counts and exhaling for 6'
      },
      {
        title: 'Nature Walk',
        description: 'Take a quiet walk outside and focus on the natural surroundings'
      }
    ],
    sad: [
      {
        title: 'Self-Compassion Break',
        description: 'Place a hand on your heart and silently say "This is a moment of suffering. May I be kind to myself."'
      },
      {
        title: 'Reach Out',
        description: 'Message a trusted friend or family member about how you're feeling'
      }
    ],
    anxious: [
      {
        title: 'Box Breathing',
        description: 'Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4, and repeat'
      },
      {
        title: 'Progressive Muscle Relaxation',
        description: 'Tense and then release each muscle group in your body, starting from your toes and working upward'
      }
    ],
    angry: [
      {
        title: 'Physical Release',
        description: 'Go for a quick jog or do 20 jumping jacks to release tension'
      },
      {
        title: 'Time-Out',
        description: 'Take a 10-minute break from the situation to cool down'
      }
    ],
    neutral: [
      {
        title: 'Mindful Observation',
        description: 'Choose an object and focus on observing its details for 5 minutes'
      },
      {
        title: 'Set a Small Goal',
        description: 'Accomplish one small task that will give you a sense of progress'
      }
    ]
  };
  
  return activityMap[moodCategory] || [];
}
