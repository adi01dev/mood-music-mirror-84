
import { useState } from "react";
import { useMood, MoodEntry } from "@/contexts/MoodContext";
import Layout from "@/components/Layout";
import MoodChart from "@/components/MoodChart";
import MoodDisplay from "@/components/MoodDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronDown, ChevronUp, ListFilter } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const History = () => {
  const { moodHistory, isLoading } = useMood();
  const [selectedMood, setSelectedMood] = useState<MoodEntry | null>(null);
  const [timeframe, setTimeframe] = useState<"7days" | "30days" | "90days">("7days");
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [moodFilters, setMoodFilters] = useState<string[]>([]);

  const timeframeOptions = {
    "7days": { label: "7 Days", days: 7 },
    "30days": { label: "30 Days", days: 30 },
    "90days": { label: "90 Days", days: 90 },
  };

  const moodCategories = ["happy", "calm", "sad", "anxious", "angry", "neutral"];

  const toggleMoodFilter = (mood: string) => {
    if (moodFilters.includes(mood)) {
      setMoodFilters(moodFilters.filter(m => m !== mood));
    } else {
      setMoodFilters([...moodFilters, mood]);
    }
  };

  const sortedAndFilteredMoodHistory = [...moodHistory]
    .filter(mood => {
      // Apply mood category filters if any are selected
      if (moodFilters.length > 0) {
        return moodFilters.includes(mood.moodCategory);
      }
      return true;
    })
    .sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

  return (
    <Layout title="Mood History">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Mood Over Time</CardTitle>
                <CardDescription>
                  Track how your mood has changed over the past {timeframeOptions[timeframe].label.toLowerCase()}
                </CardDescription>
              </div>
              
              <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)} className="space-y-0">
                <TabsList>
                  <TabsTrigger value="7days">7 Days</TabsTrigger>
                  <TabsTrigger value="30days">30 Days</TabsTrigger>
                  <TabsTrigger value="90days">90 Days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-mhm-blue-500 border-r-transparent align-[-0.125em]"></div>
              </div>
            ) : (
              <MoodChart
                moodHistory={moodHistory}
                days={timeframeOptions[timeframe].days}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Mood Log</CardTitle>
                <CardDescription>
                  Browse through your past check-ins
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                  className="flex items-center gap-1"
                >
                  {sortOrder === "newest" ? (
                    <>
                      <ChevronDown size={14} />
                      Newest
                    </>
                  ) : (
                    <>
                      <ChevronUp size={14} />
                      Oldest
                    </>
                  )}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <ListFilter size={14} />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {moodCategories.map(mood => (
                      <DropdownMenuCheckboxItem
                        key={mood}
                        checked={moodFilters.includes(mood)}
                        onCheckedChange={() => toggleMoodFilter(mood)}
                        className="capitalize"
                      >
                        {mood}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-mhm-blue-500 border-r-transparent align-[-0.125em]"></div>
              </div>
            ) : sortedAndFilteredMoodHistory.length > 0 ? (
              <div className="space-y-4">
                {sortedAndFilteredMoodHistory.map(mood => (
                  <div
                    key={mood.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedMood?.id === mood.id
                        ? "border-mhm-blue-500 bg-mhm-blue-50"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedMood(selectedMood?.id === mood.id ? null : mood)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <MoodDisplay mood={mood} />
                      
                      <div className="mt-2 sm:mt-0 ml-0 sm:ml-4 flex items-center">
                        <Calendar size={14} className="text-muted-foreground mr-1" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(mood.timestamp), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    
                    {selectedMood?.id === mood.id && (
                      <div className="mt-4 pt-4 border-t">
                        {mood.notes && (
                          <div className="mb-4">
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
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No mood entries found</p>
                <Button asChild>
                  <a href="/check-in">Create your first entry</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;
