
import { useMood } from "@/contexts/MoodContext";
import Layout from "@/components/Layout";
import MoodChart from "@/components/MoodChart";
import MoodDisplay from "@/components/MoodDisplay";
import RecommendationCard from "@/components/RecommendationCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { moodHistory, currentMood, recommendations, isLoading } = useMood();

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Mood Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Current Mood</CardTitle>
            <CardDescription>
              Based on your latest check-in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-mhm-blue-500 border-r-transparent align-[-0.125em]"></div>
              </div>
            ) : currentMood ? (
              <MoodDisplay mood={currentMood} showDetails />
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">You haven't checked in yet</p>
                <Button asChild>
                  <Link to="/check-in">Check In Now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
            <CardDescription>
              Your wellness at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Check-ins this week</span>
                <span className="font-medium">{moodHistory.filter(entry => {
                  const oneWeekAgo = new Date();
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                  return new Date(entry.timestamp) >= oneWeekAgo;
                }).length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total check-ins</span>
                <span className="font-medium">{moodHistory.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current streak</span>
                <span className="font-medium">3 days</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Weekly wellness score</span>
                <span className="font-medium">7.2/10</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood History Chart Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Mood History</CardTitle>
            <CardDescription>
              Your emotional journey over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-mhm-blue-500 border-r-transparent align-[-0.125em]"></div>
              </div>
            ) : moodHistory.length > 0 ? (
              <MoodChart moodHistory={moodHistory} days={7} />
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No mood history available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations Card */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recommendations For You</CardTitle>
              <CardDescription>
                Personalized suggestions based on your current mood
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/recommendations">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center p-6">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-mhm-blue-500 border-r-transparent align-[-0.125em]"></div>
                </div>
              ) : recommendations.length > 0 ? (
                recommendations.slice(0, 3).map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-6">
                  <p className="text-muted-foreground">No recommendations available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
