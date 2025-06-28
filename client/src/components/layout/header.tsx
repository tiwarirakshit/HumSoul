import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Search, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user: authUser, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Query to get current user
  const { data: user } = useQuery<{
    id: number;
    username: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  }>({
    queryKey: ['/api/users/1'],
  });
  
  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });
      // Redirect to login page
      setLocation('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="px-4 pt-6 pb-2 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/">
          <h1 className="text-2xl font-semibold text-primary dark:text-primary-light cursor-pointer">
            HumSoul
          </h1>
        </Link>
      </div>
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-light dark:bg-dark-light"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-light dark:bg-dark-light"
        >
          <Search className="h-[1.2rem] w-[1.2rem]" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer">
              {authUser?.photoURL ? (
                <AvatarImage src={authUser.photoURL} alt={authUser.displayName || 'User'} />
              ) : user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user?.name || user?.username || 'User'} />
              ) : (
                <AvatarFallback className="bg-primary text-white">
                  {authUser?.displayName?.[0] || user?.name?.[0] || user?.username?.[0] || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">
                Profile
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
