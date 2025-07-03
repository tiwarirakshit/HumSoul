import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useSubscriptionPlans } from "@/hooks/use-subscription-plans";

// Load Razorpay script
function loadRazorpayScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Subscription() {
  const [, setLocation] = useLocation();
  const { plans, loading } = useSubscriptionPlans();
  const [selectedPlan, setSelectedPlan] = useState<number>(0);

  const handleSubscribe = async () => {
    const res = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const plan = plans[selectedPlan];
    if (!plan) {
      alert("Please select a plan");
      return;
    }

    const razorpay = new (window as any).Razorpay({
      key: "rzp_test_o8ZBYNkHRr83ul", // Replace with your test key
      amount: Math.round(parseFloat(plan.price) * 100), // Convert to paise
      currency: "INR",
      name: "Humsoul",
      description: `${plan.name} Subscription`,
      image: "/images/Logo.jpg", // HumSoul logo
      handler: function (response: any) {
        // Handle payment success here (e.g., call backend to confirm subscription)
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
        setLocation("/thank-you"); // Redirect after payment
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
      },
      theme: {
        color: "#6366F1", // Tailwind primary color (adjust as needed)
      },
    });

    razorpay.open();
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
      <div className="container max-w-4xl py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Start your journey to a better you with our premium features
          </p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Start your journey to a better you with our premium features
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className={`relative p-8 rounded-2xl border-2 ${
              selectedPlan === index
                ? "border-primary bg-primary/5"
                : "border-border"
            } ${isPopular(plan.duration) ? "border-primary" : ""}`}
          >
            {isPopular(plan.duration) && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="text-muted-foreground">/{getPeriodDisplay(plan.duration)}</span>
              </div>
              
              <Button
                className="w-full mb-8"
                variant={selectedPlan === index ? "default" : "outline"}
                onClick={() => setSelectedPlan(index)}
              >
                {selectedPlan === index ? "Selected" : "Select Plan"}
              </Button>
              
              <ul className="space-y-3 text-left">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button 
          className="px-8 py-6 text-lg" 
          size="lg"
          onClick={handleSubscribe}
          disabled={plans.length === 0}
        >
          Subscribe Now
        </Button>
        
        <p className="mt-4 text-sm text-muted-foreground">
          Cancel anytime. 7-day free trial available. No credit card required.
        </p>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid gap-6">
          <div className="p-6 rounded-lg bg-muted">
            <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
            <p className="text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-muted">
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-muted-foreground">
              Yes, we offer a 7-day free trial for all new subscribers. No credit card is required to start your trial.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-muted">
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept UPI, all major credit/debit cards, net banking, and digital wallets like Paytm, PhonePe, and Google Pay for subscription payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}