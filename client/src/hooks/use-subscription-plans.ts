import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  features: string[] | null;
  isActive: boolean;
  createdAt: string;
}

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('GET', '/api/plans');
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
      // Fallback to default plans if API fails
      setPlans([
        {
          id: 1,
          name: "Premium Monthly",
          description: "Monthly subscription plan with all premium features",
          price: "9.99",
          duration: 30,
          features: [
            "Unlimited affirmations",
            "Background music",
            "Custom playlists",
            "Basic meditation guides",
            "Daily reminders",
            "Basic analytics"
          ],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: "Premium Yearly",
          description: "Yearly subscription plan with all premium features (save 25%)",
          price: "89.99",
          duration: 365,
          features: [
            "All Monthly features",
            "Save 25%",
            "Priority support",
            "Advanced meditation guides",
            "Exclusive content",
            "Advanced analytics",
            "Custom themes",
            "Offline access"
          ],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPlanById = (id: number) => {
    return plans.find(plan => plan.id === id);
  };

  const getPlanByDuration = (duration: number) => {
    return plans.find(plan => plan.duration === duration);
  };

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    getPlanById,
    getPlanByDuration
  };
} 