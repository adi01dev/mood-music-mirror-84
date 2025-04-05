
import { useState } from "react";
import { useMood, Recommendation } from "@/contexts/MoodContext";
import Layout from "@/components/Layout";
import RecommendationCard from "@/components/RecommendationCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GridIcon, ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Recommendations = () => {
  const { recommendations, isLoading } = useMood();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "music" | "video" | "activity" | "article">("all");

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === "all") return true;
    return rec.type === filter;
  });

  const GroupedList = () => {
    const groupedByType: Record<string, Recommendation[]> = {
      music: [],
      video: [],
      activity: [],
      article: [],
    };

    filteredRecommendations.forEach(rec => {
      groupedByType[rec.type].push(rec);
    });

    return (
      <div className="space-y-8">
        {Object.entries(groupedByType).map(([type, recs]) => {
          if (recs.length === 0) return null;
          return (
            <div key={type} className="space-y-4">
              <h3 className="text-xl font-medium capitalize">{type}s</h3>
              
              <div className="space-y-2">
                {recs.map(rec => (
                  <div key={rec.id} className="flex items-start p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                    {rec.thumbnail && (
                      <div className="w-16 h-16 rounded overflow-hidden mr-4 shrink-0">
                        <img
                          src={rec.thumbnail}
                          alt={rec.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground my-1">
                        {rec.description}
                      </p>
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-mhm-blue-500 hover:underline"
                      >
                        Open Link
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Layout title="Recommendations">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Your Personalized Recommendations</CardTitle>
              <CardDescription>
                Content and activities tailored to your mood and preferences
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="hidden sm:block">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="music">Music</TabsTrigger>
                  <TabsTrigger value="video">Videos</TabsTrigger>
                  <TabsTrigger value="activity">Activities</TabsTrigger>
                  <TabsTrigger value="article">Articles</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex border rounded-md">
                <button
                  className={cn(
                    "p-2 transition-colors",
                    view === "grid"
                      ? "bg-mhm-blue-100 text-mhm-blue-600"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setView("grid")}
                >
                  <GridIcon size={16} />
                </button>
                <button
                  className={cn(
                    "p-2 transition-colors",
                    view === "list"
                      ? "bg-mhm-blue-100 text-mhm-blue-600"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setView("list")}
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="block sm:hidden mt-2">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="activity">Activities</TabsTrigger>
              <TabsTrigger value="article">Articles</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-mhm-blue-500 border-r-transparent align-[-0.125em]"></div>
            </div>
          ) : filteredRecommendations.length > 0 ? (
            view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecommendations.map(recommendation => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                  />
                ))}
              </div>
            ) : (
              <GroupedList />
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No recommendations available for the selected filter</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Recommendations;
