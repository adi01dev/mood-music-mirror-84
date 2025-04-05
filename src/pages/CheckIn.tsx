
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMood, MoodEntry } from "@/contexts/MoodContext";
import Layout from "@/components/Layout";
import VoiceRecorder from "@/components/VoiceRecorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CheckIn = () => {
  const { analyzeMood, addMoodEntry, isLoading } = useMood();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'record' | 'result' | 'notes'>('record');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [moodAnalysis, setMoodAnalysis] = useState<Partial<MoodEntry> | null>(null);
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRecordingComplete = async (url: string) => {
    setAudioUrl(url);
    setIsAnalyzing(true);
    
    try {
      // Analyze the mood based on the recording
      const analysis = await analyzeMood(url);
      setMoodAnalysis(analysis);
      setStep('result');
    } catch (error) {
      console.error("Error analyzing mood:", error);
      toast.error("Could not analyze your mood. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (!moodAnalysis) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    
    addMoodEntry({
      moodScore: moodAnalysis.moodScore || 5,
      moodCategory: moodAnalysis.moodCategory || 'neutral',
      analysis: moodAnalysis.analysis,
      notes,
      voiceNote: audioUrl || undefined,
    });
    
    navigate('/dashboard');
  };

  const getMoodIcon = (category: MoodEntry['moodCategory']) => {
    const moodIcons: Record<string, string> = {
      happy: "😊",
      calm: "😌",
      sad: "😔",
      anxious: "😰",
      angry: "😠",
      neutral: "😐",
    };
    
    return moodIcons[category] || "😐";
  };

  const MoodOptions = () => {
    const options: MoodEntry['moodCategory'][] = ['happy', 'calm', 'sad', 'anxious', 'angry', 'neutral'];
    
    return (
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <Button
            key={option}
            variant="outline"
            className={cn(
              "flex flex-col items-center h-auto py-3 px-2",
              moodAnalysis?.moodCategory === option ? 
                "border-2 border-mhm-blue-500 bg-mhm-blue-50" : ""
            )}
            onClick={() => setMoodAnalysis(prev => ({ ...prev, moodCategory: option }))}
          >
            <span className="text-2xl mb-1">{getMoodIcon(option)}</span>
            <span className="text-sm capitalize">{option}</span>
            {moodAnalysis?.moodCategory === option && (
              <Check className="absolute top-1 right-1 h-3 w-3 text-mhm-blue-500" />
            )}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <Layout title="Daily Check-In">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'record' && "How are you feeling today?"}
              {step === 'result' && "Your Mood Analysis"}
              {step === 'notes' && "Add Notes (Optional)"}
            </CardTitle>
            <CardDescription>
              {step === 'record' && "Record a short voice message about your day"}
              {step === 'result' && "Here's what we detected from your voice"}
              {step === 'notes' && "Add any additional thoughts or context"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 'record' && (
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                isAnalyzing={isAnalyzing}
              />
            )}
            
            {step === 'result' && moodAnalysis && (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center bg-mhm-blue-50 p-6 rounded-lg">
                  <div className="text-5xl mb-2">
                    {getMoodIcon(moodAnalysis.moodCategory || 'neutral')}
                  </div>
                  <h3 className="text-xl font-medium capitalize mb-1">
                    {moodAnalysis.moodCategory || 'neutral'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Mood score: {moodAnalysis.moodScore}/10
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Is this how you're feeling?</p>
                  <MoodOptions />
                </div>
                
                {moodAnalysis.analysis && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Analysis Details:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
                        <p className="text-sm capitalize">{moodAnalysis.analysis.sentiment}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Stress Level</p>
                        <p className="text-sm">{moodAnalysis.analysis.stress}/10</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Energy Level</p>
                        <p className="text-sm">{moodAnalysis.analysis.energy}/10</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Dominant Emotion</p>
                        <p className="text-sm capitalize">{moodAnalysis.analysis.dominantEmotion}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {step === 'notes' && (
              <div className="space-y-4">
                <Textarea
                  placeholder="How was your day? What's on your mind? (optional)"
                  className="min-h-[150px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                
                <div className="flex items-center px-3 py-2 rounded-md bg-mhm-blue-50 text-mhm-blue-800">
                  <div className="text-2xl mr-2">
                    {getMoodIcon(moodAnalysis?.moodCategory || 'neutral')}
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      {moodAnalysis?.moodCategory || 'neutral'}
                    </p>
                    <p className="text-xs">Mood score: {moodAnalysis?.moodScore || 5}/10</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {step === 'record' ? (
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                disabled={isAnalyzing}
              >
                Cancel
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                onClick={() => setStep(step === 'result' ? 'record' : 'result')}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            
            {step === 'result' && (
              <Button
                onClick={() => setStep('notes')}
                disabled={!moodAnalysis}
                className="bg-gradient-to-r from-mhm-blue-500 to-mhm-green-500 hover:from-mhm-blue-600 hover:to-mhm-green-600"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {step === 'notes' && (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-mhm-blue-500 to-mhm-green-500 hover:from-mhm-blue-600 hover:to-mhm-green-600"
              >
                Save Check-In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default CheckIn;
