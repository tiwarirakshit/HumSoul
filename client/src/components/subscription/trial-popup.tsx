import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Crown, CheckCircle } from "lucide-react";

interface TrialPopupProps {
  daysLeft: number;
}

export function TrialPopup({ daysLeft }: TrialPopupProps) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if popup has been shown before
    const hasShownPopup = localStorage.getItem('premium_popup_shown');
    
    if (!hasShownPopup) {
      // Set a small delay to show the popup (better UX to not show immediately)
      const timer = setTimeout(() => {
        setOpen(true);
        // Save to localStorage that we've shown the popup
        localStorage.setItem('premium_popup_shown', 'true');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleUpgrade = () => {
    setOpen(false);
    navigate('/subscription');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center">Your Free Trial</DialogTitle>
          <DialogDescription className="text-center">
            You have <span className="font-bold text-primary">{daysLeft} days</span> left in your free trial
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <h3 className="font-medium">Upgrade to Premium to enjoy:</h3>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Unlimited Affirmations</p>
                <p className="text-sm text-muted-foreground">Access our entire library of affirmations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Ad-Free Experience</p>
                <p className="text-sm text-muted-foreground">Enjoy uninterrupted meditation sessions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Custom Playlists</p>
                <p className="text-sm text-muted-foreground">Create personalized meditation journeys</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Offline Access</p>
                <p className="text-sm text-muted-foreground">Download and listen without internet connection</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Later
          </Button>
          <Button onClick={handleUpgrade} className="flex-1">
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 