import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Heart, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/audio";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function Discover() {
  const [location] = useLocation();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  
  const { backendUser, loading: authLoading } = useAuth();
  const userId = backendUser?.id;
  
  // Extract category ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const catId = params.get('category');
    setCategoryId(catId ? parseInt(catId) : null);
  }, [location]);
  
  // Query categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Query playlists, filtered by category if specified
  const { data: playlists = [], isLoading } = useQuery({
    queryKey: categoryId ? ['/api/playlists', { categoryId }] : ['/api/playlists'],
  });
  
  // Get favorited playlist IDs
  const { data: favoritesList = [] } = useQuery({
    queryKey: ['/api/favorites', { userId }],
    enabled: !!userId && !authLoading,
  });
  
  // Set favorited playlist IDs when favorites are loaded
  useEffect(() => {
    if (favoritesList && favoritesList.length > 0) {
      setFavoriteIds(new Set(favoritesList.map((p: any) => p.id)));
    }
  }, [favoritesList]);
  
  const toggleFavorite = async (playlistId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (favoriteIds.has(playlistId)) {
        await apiRequest(
          'DELETE', 
          `/api/favorites?userId=${userId}&playlistId=${playlistId}`
        );
        const newFavoriteIds = new Set(favoriteIds);
        newFavoriteIds.delete(playlistId);
        setFavoriteIds(newFavoriteIds);
      } else {
        await apiRequest(
          'POST', 
          '/api/favorites', 
          { userId, playlistId }
        );
        const newFavoriteIds = new Set(favoriteIds);
        newFavoriteIds.add(playlistId);
        setFavoriteIds(newFavoriteIds);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Find the selected category name
  const selectedCategory = categoryId !== null 
    ? categories.find((c: any) => Number(c.id) === categoryId) 
    : null;
  
  // Helper function to check if a category is the active one
  const isCategoryActive = (id: any) => {
    return categoryId === Number(id);
  };
  
  const handleFavorite = async (playlistId: number) => {
    if (!userId) return;
    await apiRequest('POST', '/api/favorites', { userId, playlistId });
    queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
  };
  
  return (
    <div className="py-4">
      <h1 className="text-2xl font-semibold mb-6">Discover</h1>
      
      {/* Category filter */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Categories</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/discover">
            <a className={`px-4 py-2 rounded-full text-sm font-medium ${!categoryId ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-lighter'}`}>
              All
            </a>
          </Link>
          
          {categories.map((category: any) => (
            <Link key={category.id} href={`/discover?category=${category.id}`}>
              <a 
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isCategoryActive(category.id) ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-lighter'
                }`}
              >
                {category.name}
              </a>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Playlists grid */}
      <div>
        <h2 className="text-lg font-medium mb-4">
          {selectedCategory ? `${selectedCategory.name} Playlists` : 'All Playlists'}
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-dark-light rounded-lg overflow-hidden shadow-sm">
                <Skeleton className="h-36 w-full" />
                <div className="p-3">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.map((playlist: any) => (
              <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                <div className="bg-white dark:bg-dark-light rounded-lg overflow-hidden shadow-sm cursor-pointer">
                  <div 
                    className="h-36 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(to bottom right, ${playlist.coverGradientStart}, ${playlist.coverGradientEnd})`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-25">
                      <i className={`bx bx-${playlist.icon} text-7xl text-white`}></i>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1">{playlist.title}</h3>
                   
                    <div className="flex items-center justify-between mt-2">
                      
                      <button 
                        className="text-primary dark:text-primary-light"
                        onClick={(e) => toggleFavorite(playlist.id, e)}
                      >
                        <Heart 
                          className={`h-5 w-5 ${favoriteIds.has(playlist.id) ? 'fill-primary text-primary' : ''}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">No playlists found</p>
          </div>
        )}
      </div>
    </div>
  );
}
