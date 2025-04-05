
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { fetchYouTubeVideos, fetchSpotifyPlaylists } from "@/lib/api";

// Define types
export type MoodEntry = {
  id: string;
  timestamp: Date;
  moodScore: number; // 1-10 scale
  moodCategory: 'happy' | 'calm' | 'sad' | 'anxious' | 'angry' | 'neutral';
  voiceNote?: string; // URL to audio file
  notes?: string;
  analysis?: {
    sentiment: string;
    stress: number;
    energy: number;
    dominantEmotion: string;
  };
};

export type Recommendation = {
  id: string;
  type: 'music' | 'video' | 'activity' | 'article';
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  moodCategory: MoodEntry['moodCategory'];
};

type MoodContextType = {
  moodHistory: MoodEntry[];
  recommendations: Recommendation[];
  isLoading: boolean;
  currentMood: MoodEntry | null;
  addMoodEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
  analyzeMood: (audioUrl: string) => Promise<Partial<MoodEntry>>;
  getRecommendations: (mood: MoodEntry['moodCategory']) => void;
};

// Create the context
const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Mock data for recommendations
const mockRecommendations: Record<MoodEntry['moodCategory'], Recommendation[]> = {
  happy: [
    {
      id: '1',
      type: 'music',
      title: 'Good Vibes Playlist',
      description: 'Upbeat songs to maintain your happy mood',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0',
      thumbnail: 'https://i.scdn.co/image/ab67706f00000002e4eadd417a05b2546e866934',
      moodCategory: 'happy'
    },
    {
      id: '2',
      type: 'activity',
      title: 'Gratitude Journaling',
      description: "Write down three things you're grateful for today",
      url: '#',
      moodCategory: 'happy'
    }
  ],
  calm: [
    {
      id: '3',
      type: 'music',
      title: 'Peaceful Piano',
      description: 'Relaxing piano pieces for inner peace',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
      thumbnail: 'https://i.scdn.co/image/ab67706f000000025ec8c003898b36c6f73dfac7',
      moodCategory: 'calm',
    },
    {
      id: '4',
      type: 'video',
      title: 'Forest Walk Meditation',
      description: '15-minute guided meditation through a peaceful forest',
      url: 'https://www.youtube.com/watch?v=oWTVEm7LCxc',
      thumbnail: 'https://img.youtube.com/vi/oWTVEm7LCxc/hqdefault.jpg',
      moodCategory: 'calm',
    }
  ],
  sad: [
    {
      id: '5',
      type: 'music',
      title: 'Mood Booster',
      description: 'Uplifting songs to elevate your spirits',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0',
      thumbnail: 'https://i.scdn.co/image/ab67706f00000002bd0e19e810bb4b55ab164a95',
      moodCategory: 'sad',
    },
    {
      id: '6',
      type: 'activity',
      title: 'Mindful Walking',
      description: 'Take a 20-minute walk focusing on your surroundings',
      url: '#',
      moodCategory: 'sad',
    }
  ],
  anxious: [
    {
      id: '7',
      type: 'music',
      title: 'Calm Down Playlist',
      description: 'Soothing melodies to reduce anxiety',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa',
      thumbnail: 'https://i.scdn.co/image/ab67706f0000000213601c153ccfc3d432e5704d',
      moodCategory: 'anxious',
    },
    {
      id: '8',
      type: 'video',
      title: 'Box Breathing Technique',
      description: '5-minute guided breathing exercise for anxiety relief',
      url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
      thumbnail: 'https://img.youtube.com/vi/tEmt1Znux58/hqdefault.jpg',
      moodCategory: 'anxious',
    }
  ],
  angry: [
    {
      id: '9',
      type: 'music',
      title: 'Chill Out Playlist',
      description: 'Cool down with these relaxing tracks',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6',
      thumbnail: 'https://i.scdn.co/image/ab67706f00000002c414e7daf34690c9f983f76e',
      moodCategory: 'angry',
    },
    {
      id: '10',
      type: 'activity',
      title: 'Tension Release Exercise',
      description: '10-minute progressive muscle relaxation technique',
      url: '#',
      moodCategory: 'angry',
    }
  ],
  neutral: [
    {
      id: '11',
      type: 'music',
      title: 'Focus Flow',
      description: 'Music to help you concentrate and be productive',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX2L0iB23Enbq',
      thumbnail: 'https://i.scdn.co/image/ab67706f000000025d87659dcadef82dd0e73f56',
      moodCategory: 'neutral',
    },
    {
      id: '12',
      type: 'article',
      title: 'Mindfulness Basics',
      description: 'Introduction to mindfulness practices for everyday life',
      url: '#',
      moodCategory: 'neutral',
    }
  ]
};

// Mock mood history data
const mockMoodHistory: MoodEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    moodScore: 7,
    moodCategory: 'happy',
    notes: 'Had a productive day at work. Finished a big project.',
    analysis: {
      sentiment: 'positive',
      stress: 3,
      energy: 7,
      dominantEmotion: 'satisfaction',
    },
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    moodScore: 8,
    moodCategory: 'calm',
    notes: 'Went for a walk in the park. Weather was nice.',
    analysis: {
      sentiment: 'positive',
      stress: 2,
      energy: 5,
      dominantEmotion: 'contentment',
    },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    moodScore: 4,
    moodCategory: 'anxious',
    notes: 'Upcoming presentation making me nervous.',
    analysis: {
      sentiment: 'negative',
      stress: 8,
      energy: 6,
      dominantEmotion: 'worry',
    },
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    moodScore: 3,
    moodCategory: 'sad',
    notes: 'Missing my family.',
    analysis: {
      sentiment: 'negative',
      stress: 5,
      energy: 3,
      dominantEmotion: 'melancholy',
    },
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    moodScore: 5,
    moodCategory: 'neutral',
    notes: 'Regular day. Nothing special happened.',
    analysis: {
      sentiment: 'neutral',
      stress: 4,
      energy: 5,
      dominantEmotion: 'neutrality',
    },
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    moodScore: 6,
    moodCategory: 'calm',
    notes: 'Had a relaxing evening with a good book.',
    analysis: {
      sentiment: 'positive',
      stress: 2,
      energy: 4,
      dominantEmotion: 'relaxation',
    },
  },
];

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null);

  // Fetch initial data (mock data for now)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load mood history from localStorage or use mock data
        const storedMoodHistory = localStorage.getItem('mhm-mood-history');
        
        if (storedMoodHistory) {
          const parsedHistory = JSON.parse(storedMoodHistory);
          // Convert string timestamps back to Date objects
          const formattedHistory = parsedHistory.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }));
          
          setMoodHistory(formattedHistory);
          
          // Set current mood to most recent entry
          if (formattedHistory.length > 0) {
            const sortedEntries = [...formattedHistory].sort(
              (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
            );
            
            setCurrentMood(sortedEntries[0]);
            
            // Load recommendations for current mood
            getRecommendations(sortedEntries[0].moodCategory);
          }
        } else {
          // Use mock data for demonstration
          setMoodHistory(mockMoodHistory);
          
          // Set current mood to most recent entry
          const latestEntry = [...mockMoodHistory].sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
          )[0];
          
          setCurrentMood(latestEntry);
          
          // Load recommendations for current mood
          getRecommendations(latestEntry.moodCategory);
          
          // Save to localStorage
          localStorage.setItem('mhm-mood-history', JSON.stringify(mockMoodHistory));
        }
      } catch (error) {
        console.error('Error fetching mood data:', error);
        toast.error('Failed to load mood data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const addMoodEntry = (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    const updatedHistory = [newEntry, ...moodHistory];
    setMoodHistory(updatedHistory);
    setCurrentMood(newEntry);
    
    // Save to localStorage
    localStorage.setItem('mhm-mood-history', JSON.stringify(updatedHistory));
    
    // Get recommendations for new mood
    getRecommendations(newEntry.moodCategory);
    
    toast.success('Mood entry added successfully!');
  };

  const analyzeMood = async (audioUrl: string): Promise<Partial<MoodEntry>> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would send the audio to an API for analysis
      // We'll simulate AI analysis with a more sophisticated approach
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated AI analysis results
      // In a real implementation, this would call an AI API like OpenAI or AssemblyAI
      const simulateAIAnalysis = () => {
        // Weighted random to make some moods more likely in certain situations
        const moodWeights = {
          happy: 0.2,
          calm: 0.2, 
          sad: 0.2,
          anxious: 0.15,
          angry: 0.1,
          neutral: 0.15
        };
        
        // Select mood based on weighted probability
        const random = Math.random();
        let cumulativeProbability = 0;
        let selectedMood: MoodEntry['moodCategory'] = 'neutral';
        
        for (const [mood, probability] of Object.entries(moodWeights)) {
          cumulativeProbability += probability;
          if (random <= cumulativeProbability) {
            selectedMood = mood as MoodEntry['moodCategory'];
            break;
          }
        }
        
        // Generate random score that aligns with the mood
        let randomScore: number;
        switch (selectedMood) {
          case 'happy': 
            randomScore = Math.floor(Math.random() * 3) + 8; // 8-10
            break;
          case 'calm': 
            randomScore = Math.floor(Math.random() * 3) + 7; // 7-9
            break;
          case 'neutral': 
            randomScore = Math.floor(Math.random() * 3) + 5; // 5-7
            break;
          case 'anxious': 
            randomScore = Math.floor(Math.random() * 3) + 3; // 3-5
            break;
          case 'sad': 
            randomScore = Math.floor(Math.random() * 3) + 2; // 2-4
            break;
          case 'angry': 
            randomScore = Math.floor(Math.random() * 3) + 2; // 2-4
            break;
          default: 
            randomScore = Math.floor(Math.random() * 10) + 1;
        }
        
        return {
          moodCategory: selectedMood,
          moodScore: randomScore,
        };
      };
      
      const { moodCategory, moodScore } = simulateAIAnalysis();
      
      const analysisResult: Partial<MoodEntry> = {
        moodCategory,
        moodScore,
        analysis: {
          sentiment: moodScore > 6 ? 'positive' : moodScore < 5 ? 'negative' : 'neutral',
          stress: moodCategory === 'anxious' || moodCategory === 'angry' ? 
            Math.floor(Math.random() * 3) + 7 : // 7-9 for high stress moods
            Math.floor(Math.random() * 7) + 1,  // 1-7 for others
          energy: moodCategory === 'happy' || moodCategory === 'angry' ? 
            Math.floor(Math.random() * 3) + 7 : // 7-9 for high energy moods
            Math.floor(Math.random() * 7) + 1,  // 1-7 for others
          dominantEmotion: getEmotionForMood(moodCategory),
        },
      };
      
      return analysisResult;
    } catch (error) {
      console.error('Error analyzing mood:', error);
      toast.error('Failed to analyze your mood. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getEmotionForMood = (mood: MoodEntry['moodCategory']): string => {
    const emotionMap: Record<MoodEntry['moodCategory'], string[]> = {
      happy: ['joy', 'excitement', 'contentment', 'satisfaction'],
      calm: ['peace', 'tranquility', 'relaxation', 'serenity'],
      sad: ['melancholy', 'grief', 'disappointment', 'sorrow'],
      anxious: ['worry', 'fear', 'nervousness', 'tension'],
      angry: ['frustration', 'irritation', 'resentment', 'annoyance'],
      neutral: ['neutrality', 'indifference', 'balance', 'steadiness'],
    };
    
    const emotions = emotionMap[mood];
    return emotions[Math.floor(Math.random() * emotions.length)];
  };

  const getRecommendations = async (mood: MoodEntry['moodCategory']) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would make API calls to YouTube and Spotify
      // For now, we'll use a mix of mock data and simulated API responses
      
      // Start with existing mock recommendations
      let moodRecommendations = [...mockRecommendations[mood]];
      
      try {
        // Simulate fetching YouTube videos
        const youtubeVideos = await fetchYouTubeVideos(mood);
        if (youtubeVideos && youtubeVideos.length > 0) {
          // Add YouTube recommendations
          moodRecommendations = [
            ...moodRecommendations,
            ...youtubeVideos.map((video, index) => ({
              id: `yt-${mood}-${index}`,
              type: 'video' as const,
              title: video.title,
              description: video.description,
              url: video.url,
              thumbnail: video.thumbnail,
              moodCategory: mood
            }))
          ];
        }
        
        // Simulate fetching Spotify playlists
        const spotifyPlaylists = await fetchSpotifyPlaylists(mood);
        if (spotifyPlaylists && spotifyPlaylists.length > 0) {
          // Add Spotify recommendations
          moodRecommendations = [
            ...moodRecommendations,
            ...spotifyPlaylists.map((playlist, index) => ({
              id: `sp-${mood}-${index}`,
              type: 'music' as const,
              title: playlist.title,
              description: playlist.description,
              url: playlist.url,
              thumbnail: playlist.thumbnail,
              moodCategory: mood
            }))
          ];
        }
      } catch (apiError) {
        console.error('Error fetching external recommendations:', apiError);
        // Continue with mock data if API calls fail
      }
      
      setRecommendations(moodRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations.');
      // Fallback to mock data
      setRecommendations(mockRecommendations[mood]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MoodContext.Provider value={{
      moodHistory,
      recommendations,
      isLoading,
      currentMood,
      addMoodEntry,
      analyzeMood,
      getRecommendations,
    }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  
  return context;
};
