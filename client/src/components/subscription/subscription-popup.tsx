import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useSubscriptionPlans } from "@/hooks/use-subscription-plans";

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionPopup({ isOpen, onClose }: SubscriptionPopupProps) {
  const [, setLocation] = useLocation();
  const { plans, loading } = useSubscriptionPlans();
  const [selectedPlan, setSelectedPlan] = useState<number>(0);

  const handleSubscribe = () => {
    onClose();
    setLocation("/subscription");
  };

  // Helper function to get period display
  const getPeriodDisplay = (duration: number) => {
    if (duration === 30) return "month";
    if (duration === 365) return "year";
    return `${duration} days`;
  };

  // Helper function to determine if plan is popular (yearly plans are typically popular)
  const isPopular = (duration: number) => duration === 365;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Upgrade to Premium</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading plans...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Upgrade to Premium</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === index
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              } ${isPopular(plan.duration) ? "border-primary" : ""}`}
              onClick={() => setSelectedPlan(index)}
            >
              {isPopular(plan.duration) && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              )}
              
              <div className="text-center">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="my-2">
                  <span className="text-3xl font-bold">₹{plan.price}</span>
                  <span className="text-muted-foreground">/{getPeriodDisplay(plan.duration)}</span>
                </div>
                
                <ul className="mt-4 space-y-2 text-sm">
                  {plan.features?.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubscribe}
        >
          Subscribe Now
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          Cancel anytime. 7-day free trial available.
        </p>
      </DialogContent>
    </Dialog>
  );
} 