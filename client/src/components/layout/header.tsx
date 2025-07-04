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
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user: authUser, logout, backendUser } = useAuth();
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
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setLocation(`/discover?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  // Close search on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

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
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/images/Logo.jpg"
            alt="HumSoul Logo"
            className="h-8 w-8 rounded-full object-cover"
          />

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
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-[1.2rem] w-[1.2rem]" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer">
              {backendUser?.avatarUrl ? (
                <AvatarImage src={backendUser.avatarUrl} alt={backendUser.name || backendUser.username || 'User'} />
              ) : authUser?.photoURL ? (
                <AvatarImage src={authUser.photoURL} alt={authUser.displayName || 'User'} />
              ) : user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user?.name || user?.username || 'User'} />
              ) : (
                <AvatarFallback className="bg-primary text-white">
                  {backendUser?.name?.[0] || backendUser?.username?.[0] || authUser?.displayName?.[0] || user?.name?.[0] || user?.username?.[0] || 'U'}
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
      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30" onClick={() => setSearchOpen(false)}>
          <form
            className="mt-24 bg-white dark:bg-dark-light rounded-xl shadow-lg p-4 flex items-center gap-2 w-full max-w-md mx-auto"
            style={{ zIndex: 100 }}
            onClick={e => e.stopPropagation()}
            onSubmit={handleSearchSubmit}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search playlists, categories..."
              className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-background dark:bg-dark-light text-sm focus:outline-none"
            />
            <Button type="submit" variant="default">Search</Button>
          </form>
        </div>
      )}
    </header>
  );
}
