import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Bell,
  VolumeX,
  Headphones,
  Download,
  LogOut,
  User,
  Heart,
  Clock,
  Mail,
  Globe,
  CreditCard,
  Crown,
  Calendar,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Profile() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Query to get current user
  const { data: user, isLoading } = useQuery<{
    id: number;
    username: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  }>({
    queryKey: ['/api/users/1'],
  });

  // Query favorites count
  const { data: favorites = [] } = useQuery<Array<any>>({
    queryKey: ['/api/favorites', { userId: 1 }],
  });
  
  // Query recent plays
  const { data: recentPlays = [] } = useQuery<Array<any>>({
    queryKey: ['/api/recent-plays', { userId: 1 }],
  });
  
  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const goToSubscription = () => {
    setLocation('/subscription');
  };

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="flex items-center mb-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="ml-4">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <Skeleton className="h-36 w-full mb-6" />
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 pb-28">
      {/* Profile Header */}
      <div className="flex items-center mb-6">
        <Avatar className="h-20 w-20">
          {authUser?.photoURL ? (
            <AvatarImage src={authUser.photoURL} alt={authUser.displayName || 'User'} />
          ) : user?.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.name || user.username} />
          ) : (
            <AvatarFallback className="bg-primary text-white text-2xl">
              {authUser?.displayName?.[0] || user?.name?.[0] || user?.username?.[0] || 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="ml-4">
          <h1 className="text-2xl font-semibold">{authUser?.displayName || user?.name || user?.username}</h1>
          <p className="text-gray-500">{authUser?.email || user?.email || "@" + user?.username}</p>
          {authUser?.emailVerified && (
            <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
              <span className="mr-1">✓</span> Verified
            </Badge>
          )}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <div className="flex justify-center mb-1">
            <Headphones className="text-primary h-6 w-6" />
          </div>
          <p className="text-xl font-semibold">{recentPlays?.length || 0}</p>
          <p className="text-xs text-gray-500">Listened</p>
        </div>
        
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <div className="flex justify-center mb-1">
            <Heart className="text-primary h-6 w-6" />
          </div>
          <p className="text-xl font-semibold">{favorites?.length || 0}</p>
          <p className="text-xs text-gray-500">Favorites</p>
        </div>
        
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <div className="flex justify-center mb-1">
            <Clock className="text-primary h-6 w-6" />
          </div>
          <p className="text-xl font-semibold">0</p>
          <p className="text-xs text-gray-500">Hours</p>
        </div>
      </div>
      
      {/* Settings */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Settings
        </h2>
        
        <div className="space-y-4">          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-3 text-primary" />
              <Label htmlFor="notifications">Notifications</Label>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <VolumeX className="h-5 w-5 mr-3 text-primary" />
              <Label htmlFor="sound-effects">Sound Effects</Label>
            </div>
            <Switch id="sound-effects" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Download className="h-5 w-5 mr-3 text-primary" />
              <div>
                <Label>Offline Mode</Label>
                <p className="text-xs text-gray-500">
                  Download affirmations for offline listening
                </p>
              </div>
            </div>
            <Switch id="offline-mode" />
          </div>
        </div>
      </div>
      
      {/* Subscription */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <Crown className="h-5 w-5 mr-2" />
          Subscription
        </h2>
        
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">
                {authUser?.isSubscribed ? "Premium" : "Free Plan"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {authUser?.isSubscribed 
                  ? "You have access to all premium features" 
                  : "Upgrade to unlock all premium features"}
              </p>
            </div>
            {authUser?.isSubscribed && (
              <Badge className="bg-primary text-white">Active</Badge>
            )}
          </div>

          {authUser?.isSubscribed && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Plan:</span>
              </div>
              <span className="font-medium">
                {authUser?.subscriptionPlan === "monthly" ? "Monthly" : "Yearly"}
              </span>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Renews:</span>
              </div>
              <span className="font-medium">
                {authUser?.subscriptionEndDate 
                  ? new Date(authUser.subscriptionEndDate).toLocaleDateString() 
                  : "N/A"}
              </span>
            </div>
          )}
        </div>
        
        <Button 
          variant={authUser?.isSubscribed ? "outline" : "default"} 
          className="w-full justify-between"
          onClick={goToSubscription}
        >
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 mr-3 text-primary" />
            {authUser?.isSubscribed ? "Manage Subscription" : "Upgrade to Premium"}
          </div>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Account */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Account
        </h2>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start"
          onClick={() => setLocation('/edit-profile')}
          >
            <User className="h-5 w-5 mr-3 text-primary" 
            
            />
            Edit Profile
          </Button>
          
          <Button variant="outline" className="w-full justify-start" 
          onClick={() => setLocation('/notification-preferences')}
          >
            <Bell className="h-5 w-5 mr-3 text-primary" />
            Notification Preferences
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-500 hover:text-red-600"
            onClick={handleSignOut}
            disabled={!authUser}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
