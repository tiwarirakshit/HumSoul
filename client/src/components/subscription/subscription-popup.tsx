import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    name: "Monthly",
    price: "$9.99",
    period: "month",
    features: [
      "Unlimited affirmations",
      "Background music",
      "Custom playlists",
      "Basic meditation guides"
    ]
  },
  {
    name: "Yearly",
    price: "$89.99",
    period: "year",
    features: [
      "All Monthly features",
      "Save 25%",
      "Priority support",
      "Advanced meditation guides",
      "Exclusive content"
    ],
    popular: true
  }
];

export function SubscriptionPopup({ isOpen, onClose }: SubscriptionPopupProps) {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<number>(1); // Default to yearly plan

  const handleSubscribe = () => {
    onClose();
    setLocation("/subscription");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Upgrade to Premium</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === index
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              } ${plan.popular ? "border-primary" : ""}`}
              onClick={() => setSelectedPlan(index)}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              )}
              
              <div className="text-center">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="my-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                
                <ul className="mt-4 space-y-2 text-sm">
                  {plan.features.map((feature, i) => (
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