import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Crown, CheckCircle } from "lucide-react";
import { useSubscriptionPlans } from "@/hooks/use-subscription-plans";

interface TrialPopupProps {
  daysLeft: number;
}

export function TrialPopup({ daysLeft }: TrialPopupProps) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const { plans, loading } = useSubscriptionPlans();

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

  // Get features from the first premium plan (non-free plan)
  const getPremiumFeatures = () => {
    const premiumPlan = plans.find(plan => parseFloat(plan.price) > 0);
    return premiumPlan?.features || [
      "Unlimited Affirmations",
      "Ad-Free Experience", 
      "Custom Playlists",
      "Offline Access"
    ];
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
            {getPremiumFeatures().slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{feature}</p>
                  <p className="text-sm text-muted-foreground">
                    {feature.toLowerCase().includes('affirmations') && "Access our entire library of affirmations"}
                    {feature.toLowerCase().includes('ad') && "Enjoy uninterrupted meditation sessions"}
                    {feature.toLowerCase().includes('playlist') && "Create personalized meditation journeys"}
                    {feature.toLowerCase().includes('offline') && "Download and listen without internet connection"}
                    {!feature.toLowerCase().includes('affirmations') && 
                     !feature.toLowerCase().includes('ad') && 
                     !feature.toLowerCase().includes('playlist') && 
                     !feature.toLowerCase().includes('offline') && 
                     "Premium feature included in your subscription"}
                  </p>
                </div>
              </div>
            ))}
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