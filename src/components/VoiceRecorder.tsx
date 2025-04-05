
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
  isAnalyzing?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  isAnalyzing = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;
      
      // Set up audio analyzer
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      microphone.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(url);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setAudioUrl(null);
      
      // Set up timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Start visualizing audio
      visualizeAudio();
      
      toast.success("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Stop animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Stop microphone
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      toast.success("Recording saved");
    }
  };

  const visualizeAudio = () => {
    const analyzeVolume = () => {
      if (!analyserRef.current || !isRecording) return;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate volume level (0-100)
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const volume = Math.min(100, Math.max(0, average));
      setAudioVolume(volume);
      
      animationFrameRef.current = requestAnimationFrame(analyzeVolume);
    };
    
    analyzeVolume();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6 w-full max-w-xs">
        <div className="relative h-4 bg-mhm-blue-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute top-0 left-0 h-full bg-gradient-to-r from-mhm-blue-400 to-mhm-green-400 transition-all",
              isRecording ? "duration-75" : "duration-300"
            )}
            style={{ width: `${isRecording ? audioVolume : 0}%` }}
          />
        </div>
      </div>
      
      <div className="text-2xl font-mono mb-8">
        {formatDuration(recordingDuration)}
      </div>
      
      <div className="flex space-x-4">
        {isRecording ? (
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full h-16 w-16"
            onClick={stopRecording}
            disabled={isAnalyzing}
          >
            <Square size={24} />
          </Button>
        ) : (
          <Button
            variant="default"
            size="lg"
            className="rounded-full h-16 w-16 bg-gradient-to-r from-mhm-blue-500 to-mhm-green-500 hover:from-mhm-blue-600 hover:to-mhm-green-600"
            onClick={startRecording}
            disabled={isAnalyzing}
          >
            <Mic size={24} />
          </Button>
        )}
      </div>
      
      {audioUrl && !isRecording && !isAnalyzing && (
        <div className="mt-6 w-full max-w-xs">
          <div className="flex items-center space-x-2">
            <Volume2 size={16} className="text-mhm-blue-500" />
            <audio className="w-full" src={audioUrl} controls />
          </div>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="mt-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-mhm-blue-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-sm text-muted-foreground">Analyzing your voice...</p>
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          {isRecording
            ? "Speak naturally about how you're feeling today..."
            : "Press the microphone button to start recording"}
        </p>
      </div>
    </div>
  );
};

export default VoiceRecorder;
