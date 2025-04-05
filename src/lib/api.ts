// This file simulates API calls to external services
// In a production environment, these would be actual API calls to backend services

import { MoodEntry } from "@/contexts/MoodContext";

// YouTube API
type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
};

// Spotify API
type SpotifyPlaylist = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
};

// Mock YouTube data
const mockYouTubeVideos: Record<MoodEntry['moodCategory'], YouTubeVideo[]> = {
  happy: [
    {
      id: 'video-happy-1',
      title: '10 Minutes of Pure Happiness',
      description: 'A compilation of joyful moments to brighten your day',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    },
    {
      id: 'video-happy-2',
      title: 'Positive Affirmations for a Great Day',
      description: 'Start your day with these uplifting messages',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    }
  ],
  calm: [
    {
      id: 'video-calm-1',
      title: 'Peaceful Meditation Guide',
      description: '15-minute guided meditation for inner peace',
      url: 'https://www.youtube.com/watch?v=oWTVEm7LCxc',
      thumbnail: 'https://img.youtube.com/vi/oWTVEm7LCxc/hqdefault.jpg'
    },
    {
      id: 'video-calm-2',
      title: 'Calming Nature Sounds',
      description: 'Relaxing forest and stream sounds for tranquility',
      url: 'https://www.youtube.com/watch?v=oWTVEm7LCxc',
      thumbnail: 'https://img.youtube.com/vi/oWTVEm7LCxc/hqdefault.jpg'
    }
  ],
  sad: [
    {
      id: 'video-sad-1',
      title: 'Overcoming Sadness - A Guide',
      description: 'Therapist-recommended practices for difficult times',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    },
    {
      id: 'video-sad-2',
      title: 'Comforting Music for Reflection',
      description: 'Gentle piano melodies for emotional healing',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    }
  ],
  anxious: [
    {
      id: 'video-anxious-1',
      title: 'Anxiety Relief Breathing Techniques',
      description: '5-minute exercise to reduce anxiety quickly',
      url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
      thumbnail: 'https://img.youtube.com/vi/tEmt1Znux58/hqdefault.jpg'
    },
    {
      id: 'video-anxious-2',
      title: 'Calming Your Nervous System',
      description: 'Expert tips for managing anxiety in stressful situations',
      url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
      thumbnail: 'https://img.youtube.com/vi/tEmt1Znux58/hqdefault.jpg'
    }
  ],
  angry: [
    {
      id: 'video-angry-1',
      title: 'Anger Management Techniques',
      description: 'Psychologist-recommended strategies for channeling anger',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    },
    {
      id: 'video-angry-2',
      title: 'Calm Down Quickly',
      description: 'Immediate techniques to diffuse anger and frustration',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    }
  ],
  neutral: [
    {
      id: 'video-neutral-1',
      title: 'Mindfulness Practice for Everyday',
      description: 'Simple techniques to be more present in daily life',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    },
    {
      id: 'video-neutral-2',
      title: 'Focus Enhancement Techniques',
      description: 'Boost productivity and concentration with these mental exercises',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    }
  ]
};

// Mock Spotify data
const mockSpotifyPlaylists: Record<MoodEntry['moodCategory'], SpotifyPlaylist[]> = {
  happy: [
    {
      id: 'spotify-happy-1',
      title: 'Mood Boost',
      description: 'Happy tunes to lift your mood even higher',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0',
      thumbnail: 'https://i.scdn.co/image/ab67706f00000002bd0e19e810bb4b55ab164a95'
    },
    {
      id: 'spotify-happy-2',
      title: 'Have a Great Day!',
      description: 'Feel-good music for your best day yet',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX7KNKjOK0o75',
      thumbnail: 'https://i.scdn.co/image/ab67706f00000002e4eadd417a05b2546e866934'
    }
  ],
  calm: [
    {
      id: 'spotify-calm-1',
      title: 'Peaceful Piano',
      description: 'Relax and indulge with beautiful piano pieces',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
      thumbnail: 'https://i.scdn.co/image/ab67706f000000025ec8c003898b36c6f73dfac7'
    },
    {
      id: 'spotify-calm-2',
      title: 'Chill Out Music',
      description: 'Unwind to these calming tracks',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX6VdMW310YC7',
      thumbnail: 'https://i.scdn.co/image/ab67706f00000002c414e7daf34690c9f983f76e'
    }
  ],
  sad: [
    {
      id: 'spotify-sad-1',
      title: 'Life Sucks',
      description: 'Music for when you need to feel your feelings',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634',
      thumbnail: 'https://i.scdn.co/image/ab67706f000000023e0130fcd5d106f1402b4707'
    },
    {
      id: 'spotify-sad-2',
      title: 'Sad Beats',
      description: 'Melancholy sounds for reflective moments',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DXbm0dp7JzNeL',
      thumbnail: 'https://i.scdn.co/image/ab67706f00000002bd0e19e810bb4b55ab164a95'
    }
  ],
  anxious: [
    {
      id: 'spotify-anxious-1',
      title: 'Calm Down',
      description: 'Mellow tunes to soothe anxiety',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa',
      thumbnail: 'https://i.scdn.co/image/ab67706f0000000213601c153ccfc3d432e5704d'
    },
    {
      id: 'spotify-anxious-2',
      title: 'Anti-Anxiety',
      description: 'Scientifically-designed music to reduce stress',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
      thumbnail: 'https://i.scdn.co/image/ab67706f000000025ec8c003898b36c6f73dfac7'
    }
  ],
  angry: [
    {
      id: 'spotify-angry-1',
      title: 'Rage Workout',
      description: 'Channel your anger into energy with these intense tracks',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX4eRPd9frC1m',
      thumbnail: 'https://i.scdn.co/image/ab67706f00000002c84ff408ffae5da68d146156'
    },
    {
      id: 'spotify-angry-2',
      title: 'Chill Your Rage',
      description: 'Cool down with these mellowing tunes',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6',
      thumbnail: 'https://i.scdn.co/image/ab67706f00000002c414e7daf34690c9f983f76e'
    }
  ],
  neutral: [
    {
      id: 'spotify-neutral-1',
      title: 'Focus Flow',
      description: 'Uptempo instrumental hip hop beats',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DWZZbwlv3Vmtr',
      thumbnail: 'https://i.scdn.co/image/ab67706f000000023ca7b35c35c7d6d5cb7147b0'
    },
    {
      id: 'spotify-neutral-2',
      title: 'Instrumental Study',
      description: 'Focus with soft study music in the background',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
      thumbnail: 'https://i.scdn.co/image/ab67706f000000025d87659dcadef82dd0e73f56'
    }
  ]
};

// Simulates a call to YouTube API
export const fetchYouTubeVideos = async (mood: MoodEntry['moodCategory']): Promise<YouTubeVideo[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would call your backend which would use the YouTube API
  // For now, return mock data
  return mockYouTubeVideos[mood];
};

// Simulates a call to Spotify API
export const fetchSpotifyPlaylists = async (mood: MoodEntry['moodCategory']): Promise<SpotifyPlaylist[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would call your backend which would use the Spotify API
  // For now, return mock data
  return mockSpotifyPlaylists[mood];
};

// Simulate Speech-to-Text API
export const convertSpeechToText = async (audioBlob: Blob): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would send the audio to Google Speech-to-Text or similar
  // For now, return mock transcriptions based on random selection
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

// Simulate OpenAI/Gemini API for mood analysis
export const analyzeText = async (text: string): Promise<{
  moodCategory: MoodEntry['moodCategory'];
  sentiment: string;
  stress: number;
  energy: number;
  dominantEmotion: string;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // In a real app, this would call OpenAI or Gemini
  // For now, use simple keyword matching for demo
  
  const keywords = {
    happy: ['good', 'great', 'happy', 'joy', 'excited', 'wonderful', 'fantastic'],
    calm: ['calm', 'relaxed', 'peaceful', 'meditation', 'tranquil', 'serene'],
    sad: ['sad', 'low', 'down', 'unhappy', 'miss', 'lonely', 'depressed'],
    anxious: ['stress', 'anxious', 'nervous', 'worry', 'concerned', 'presentation'],
    angry: ['angry', 'mad', 'frustrated', 'annoyed', 'irritated'],
    neutral: ['normal', 'okay', 'fine', 'alright', 'nothing special']
  };
  
  // Count keyword matches
  const counts: Record<string, number> = {
    happy: 0,
    calm: 0,
    sad: 0,
    anxious: 0,
    angry: 0,
    neutral: 0
  };
  
  const lowerText = text.toLowerCase();
  
  // Count occurrences of mood keywords
  Object.entries(keywords).forEach(([mood, words]) => {
    words.forEach(word => {
      if (lowerText.includes(word)) {
        counts[mood]++;
      }
    });
  });
  
  // Find mood with most keyword matches
  let maxCount = 0;
  let detectedMood: MoodEntry['moodCategory'] = 'neutral';
  
  Object.entries(counts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      detectedMood = mood as MoodEntry['moodCategory'];
    }
  });
  
  // Generate mock emotional metrics
  const emotions = {
    happy: ['joy', 'excitement', 'contentment', 'satisfaction'],
    calm: ['peace', 'tranquility', 'relaxation', 'serenity'],
    sad: ['melancholy', 'grief', 'disappointment', 'sorrow'],
    anxious: ['worry', 'fear', 'nervousness', 'tension'],
    angry: ['frustration', 'irritation', 'resentment', 'annoyance'],
    neutral: ['neutrality', 'indifference', 'balance', 'steadiness'],
  };
  
  // Generate appropriate metrics for the detected mood
  let stress = 5;
  let energy = 5;
  let sentiment = 'neutral';
  
  // Use if statements instead of switch/case with the string-type comparison
  if (detectedMood === 'happy') {
    stress = Math.floor(Math.random() * 3) + 1; // 1-3
    energy = Math.floor(Math.random() * 3) + 7; // 7-9
    sentiment = 'positive';
  } else if (detectedMood === 'calm') {
    stress = Math.floor(Math.random() * 3) + 1; // 1-3
    energy = Math.floor(Math.random() * 3) + 3; // 3-5
    sentiment = 'positive';
  } else if (detectedMood === 'sad') {
    stress = Math.floor(Math.random() * 3) + 5; // 5-7
    energy = Math.floor(Math.random() * 3) + 1; // 1-3
    sentiment = 'negative';
  } else if (detectedMood === 'anxious') {
    stress = Math.floor(Math.random() * 3) + 7; // 7-9
    energy = Math.floor(Math.random() * 5) + 5; // 5-9
    sentiment = 'negative';
  } else if (detectedMood === 'angry') {
    stress = Math.floor(Math.random() * 3) + 7; // 7-9
    energy = Math.floor(Math.random() * 3) + 7; // 7-9
    sentiment = 'negative';
  } else {
    // neutral
    stress = Math.floor(Math.random() * 5) + 3; // 3-7
    energy = Math.floor(Math.random() * 5) + 3; // 3-7
    sentiment = 'neutral';
  }
  
  const dominantEmotion = emotions[detectedMood][Math.floor(Math.random() * emotions[detectedMood].length)];
  
  return {
    moodCategory: detectedMood,
    sentiment,
    stress,
    energy,
    dominantEmotion
  };
};

// Simulate PDF generation API
export const generatePDF = async (moodHistory: MoodEntry[]): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real app, this would use pdf-lib or call a backend API to generate a PDF
  // For now, just return a mock URL
  return "https://example.com/mock-mood-report.pdf";
};
