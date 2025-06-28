import { useEffect, useState } from "react";
import FeaturedSection from "@/components/home/featured-section";
import CategoriesSection from "@/components/home/categories-section";
import PlaylistsSection from "@/components/home/playlists-section";
import RecentPlaysSection from "@/components/home/recent-plays-section";
import { TrialPopup } from "@/components/subscription/trial-popup";
import { AudioTest } from "@/components/ui/audio-test";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();
  const [trialDaysLeft, setTrialDaysLeft] = useState(7); // Default trial period

  useEffect(() => {
    // Calculate days left in trial
    if (user) {
      // You would typically calculate this based on user's creation date
      // or a specific trial_end field from your database
      const calculateDaysLeft = () => {
        // Example: If user was created 3 days ago, they have 7-3 = 4 days left
        // For now, using a mock calculation
        const creationDate = (user as any).createdAt ? new Date((user as any).createdAt) : new Date();
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - creationDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, 7 - diffDays); // Assuming 7-day trial
        return daysLeft;
      };
      
      setTrialDaysLeft(calculateDaysLeft());
    }
  }, [user]);

  // Only show popup for non-subscribed users
  const showTrialPopup = user && !(user as any).isSubscribed && trialDaysLeft > 0;

  return (
    <>
      <FeaturedSection />
      <CategoriesSection />
      <PlaylistsSection />
      <RecentPlaysSection />
      
      {/* Audio Test Component - Remove after debugging */}
      <div className="mb-6">
        <AudioTest />
      </div>
      
      {showTrialPopup && <TrialPopup daysLeft={trialDaysLeft} />}
    </>
  );
}
