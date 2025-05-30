import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mic, 
  Play, 
  Pause, 
  Square, 
  Save,
  AlertTriangle,
  Check
} from "lucide-react";
import { formatTime } from "@/lib/audio";
import { useToast } from "@/hooks/use-toast";

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const { toast } = useToast();
  
  const handleStartRecording = () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your affirmation",
        variant: "destructive"
      });
      return;
    }
    
    if (!text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter the text of your affirmation",
        variant: "destructive"
      });
      return;
    }
    
    setIsRecording(true);
    setIsPaused(false);
    
    // Simulate recording time increase
    const interval = setInterval(() => {
      setRecordingTime(time => time + 1);
    }, 1000);
    
    // Store the interval ID in a data attribute to clear it later
    const recordBtn = document.getElementById("record-button");
    if (recordBtn) {
      recordBtn.dataset.intervalId = String(interval);
    }
  };
  
  const handlePauseRecording = () => {
    setIsPaused(true);
    
    // Clear the interval
    const recordBtn = document.getElementById("record-button");
    if (recordBtn && recordBtn.dataset.intervalId) {
      clearInterval(Number(recordBtn.dataset.intervalId));
    }
  };
  
  const handleResumeRecording = () => {
    setIsPaused(false);
    
    // Resume the interval
    const interval = setInterval(() => {
      setRecordingTime(time => time + 1);
    }, 1000);
    
    const recordBtn = document.getElementById("record-button");
    if (recordBtn) {
      recordBtn.dataset.intervalId = String(interval);
    }
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    
    // Clear the interval
    const recordBtn = document.getElementById("record-button");
    if (recordBtn && recordBtn.dataset.intervalId) {
      clearInterval(Number(recordBtn.dataset.intervalId));
    }
    
    // Show a success toast
    if (recordingTime > 2) {
      toast({
        title: "Recording Saved",
        description: "Your affirmation recording has been saved successfully",
        variant: "default"
      });
    } else {
      toast({
        title: "Recording Discarded",
        description: "Recording was too short and has been discarded",
        variant: "destructive"
      });
    }
    
    // Reset recording time
    setRecordingTime(0);
  };
  
  const handleSaveRecording = () => {
    toast({
      title: "Recording Saved",
      description: "Your affirmation recording has been saved to your library",
      variant: "default"
    });
    
    // Reset form
    setTitle("");
    setText("");
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
  };
  
  return (
    <div className="py-4">
      <h1 className="text-2xl font-semibold mb-6">Record Affirmation</h1>
      
      <div className="bg-white dark:bg-dark-light p-4 rounded-xl shadow-sm mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Affirmation Title</Label>
            <Input 
              id="title" 
              placeholder="Enter a title for your affirmation" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isRecording}
            />
          </div>
          
          <div>
            <Label htmlFor="text">Affirmation Text</Label>
            <Textarea 
              id="text" 
              placeholder="Enter the text you want to record..." 
              className="min-h-[100px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isRecording}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-dark-light p-4 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-4">Recording</h2>
        
        <div className="flex justify-center items-center mb-6">
          {isRecording ? (
            <div className="text-4xl font-mono text-primary">{formatTime(recordingTime)}</div>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-2">🎙️</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Tap the microphone button to start recording
              </p>
            </div>
          )}
        </div>
        
        {isRecording && (
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <div className="text-sm text-red-500 font-medium">Recording</div>
          </div>
        )}
        
        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <Button 
              id="record-button"
              variant="destructive"
              size="lg"
              className="h-16 w-16 rounded-full"
              onClick={handleStartRecording}
            >
              <Mic className="h-8 w-8" />
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button 
                  variant="primary"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={handleResumeRecording}
                >
                  <Play className="h-6 w-6" />
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={handlePauseRecording}
                >
                  <Pause className="h-6 w-6" />
                </Button>
              )}
              
              <Button 
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleStopRecording}
              >
                <Square className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {recordingTime > 0 && !isRecording && (
        <div className="bg-white dark:bg-dark-light p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-medium mb-4">Your Recording</h2>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-lighter rounded-lg mb-4">
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatTime(recordingTime)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="primary" onClick={handleSaveRecording}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
          
          <div className="flex items-start p-3 bg-gray-50 dark:bg-dark-lighter rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Please note:</p>
              <p className="text-gray-500 dark:text-gray-400">
                In this prototype, recordings are simulated and not actually saved.
                In a full version, your voice recordings would be stored securely.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
