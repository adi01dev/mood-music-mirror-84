
import { Recommendation } from "@/contexts/MoodContext";
import { ExternalLink, Music, Video, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
}) => {
  const getIcon = () => {
    switch (recommendation.type) {
      case "music":
        return <Music className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "article":
        return <BookOpen className="h-5 w-5" />;
      case "activity":
        return <Lightbulb className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (recommendation.type) {
      case "music":
        return "Music";
      case "video":
        return "Video";
      case "article":
        return "Article";
      case "activity":
        return "Activity";
      default:
        return "Recommendation";
    }
  };

  const getTypeColor = () => {
    switch (recommendation.type) {
      case "music":
        return "bg-purple-100 text-purple-700";
      case "video":
        return "bg-red-100 text-red-700";
      case "article":
        return "bg-mhm-blue-100 text-mhm-blue-700";
      case "activity":
        return "bg-mhm-green-100 text-mhm-green-700";
      default:
        return "bg-mhm-blue-100 text-mhm-blue-700";
    }
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full">
      {recommendation.thumbnail && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={recommendation.thumbnail}
            alt={recommendation.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1",
              getTypeColor()
            )}
          >
            {getIcon()}
            <span className="ml-1">{getTypeLabel()}</span>
          </span>
        </div>

        <h3 className="font-medium mb-2">{recommendation.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {recommendation.description}
        </p>

        {recommendation.url !== "#" ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 flex items-center space-x-1"
            asChild
          >
            <a href={recommendation.url} target="_blank" rel="noopener noreferrer">
              <span>Open</span>
              <ExternalLink size={14} />
            </a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="mt-2">
            Start
          </Button>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;
