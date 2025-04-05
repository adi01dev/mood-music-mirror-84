
import { MoodEntry } from "@/contexts/MoodContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MoodDisplayProps {
  mood: MoodEntry;
  showDetails?: boolean;
}

const MoodDisplay: React.FC<MoodDisplayProps> = ({ mood, showDetails = false }) => {
  const moodIcons: Record<string, string> = {
    happy: "😊",
    calm: "😌",
    sad: "😔",
    anxious: "😰",
    angry: "😠",
    neutral: "😐",
  };

  const moodColors: Record<string, string> = {
    happy: "bg-mhm-green-100 text-mhm-green-700",
    calm: "bg-mhm-blue-100 text-mhm-blue-700",
    sad: "bg-purple-100 text-purple-700",
    anxious: "bg-mhm-yellow-100 text-mhm-yellow-700",
    angry: "bg-red-100 text-red-700",
    neutral: "bg-gray-100 text-gray-700",
  };

  const moodDescriptions: Record<string, string> = {
    happy: "You're feeling positive and upbeat.",
    calm: "You're in a peaceful, relaxed state.",
    sad: "You're experiencing feelings of sadness.",
    anxious: "You're feeling worried or uneasy.",
    angry: "You're experiencing frustration or anger.",
    neutral: "You're in a balanced, even mood.",
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-4">
        <div className={cn("p-4 rounded-full text-2xl", moodColors[mood.moodCategory])}>
          {moodIcons[mood.moodCategory]}
        </div>
        <div>
          <h3 className="text-lg font-medium capitalize">{mood.moodCategory}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(mood.timestamp), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">{moodDescriptions[mood.moodCategory]}</p>
          
          {mood.notes && (
            <div>
              <h4 className="text-sm font-medium mb-1">Your notes:</h4>
              <p className="text-sm bg-muted p-3 rounded-md">{mood.notes}</p>
            </div>
          )}
          
          {mood.analysis && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1">Sentiment</h4>
                <p className="text-sm capitalize">{mood.analysis.sentiment}</p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1">Stress Level</h4>
                <p className="text-sm">{mood.analysis.stress}/10</p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1">Energy Level</h4>
                <p className="text-sm">{mood.analysis.energy}/10</p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1">Dominant Emotion</h4>
                <p className="text-sm capitalize">{mood.analysis.dominantEmotion}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodDisplay;
