import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Heart, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/audio";
import { useState, useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useQueryParams } from "@/hooks/use-query";

export default function Discover() {
  const [location, setLocation] = useLocation();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { backendUser, loading: authLoading } = useAuth();
  let userId = backendUser?.id;
  if (!userId) {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) userId = JSON.parse(userStr).id;
    } catch {}
  }
  
  const params = useQueryParams();

  useEffect(() => {
    const catId = params.get('category');
    setCategoryId(catId ? Number(catId) : null);
    const search = params.get('search') || '';
    setSearchQuery(search);
    if (searchInputRef.current) {
      searchInputRef.current.value = search;
      console.log('searchInputRef.current.value', searchInputRef.current.value);
    }

  }, [categoryId]);
  
  // Query categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });
  
  // Query playlists, filtered by category if specified
  const { data: playlists = [], isLoading } = useQuery<any[]>({
    queryKey: categoryId ? ['/api/playlists', { categoryId }] : ['/api/playlists'],
  });
  
  console.log('Discover userId used for API calls:', userId);
  // Get favorited playlist IDs
  const { data: favoritesList = [] } = useQuery({
    queryKey: ['/api/favorites', { userId }],
    queryFn: () => userId ? apiRequest('GET', `/api/favorites?userId=${userId}`).then(res => res.json()) : Promise.resolve([]),
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
    ? categories.find((c: any) => Number(c.id) === Number(categoryId)) 
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
  
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safePlaylists = Array.isArray(playlists) ? playlists : [];
  
  // Filter playlists by search query if present
  const filteredPlaylists = searchQuery
    ? safePlaylists.filter((playlist: any) =>
        playlist.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safePlaylists;
  
  // Helper to build discover URL with both params
  const buildDiscoverUrl = (catId: number | null, search: string) => {
    const params = new URLSearchParams();
    if (catId !== null) params.set('category', String(catId));
    if (search) params.set('search', search);
    const paramStr = params.toString();
    return paramStr ? `/discover?${paramStr}` : '/discover';
  };

  console.log('activeCategoryId', activeCategoryId);
  
  const categoriesWithAll = [{ id: null, name: 'All' }, ...safeCategories];
  
  return (
    <div className="min-h-screen bg-background text-foreground py-4">
      <h1 className="text-2xl font-semibold mb-6">Discover</h1>
      
      {/* Search bar */}
      <form
        className="mb-6 flex items-center gap-2"
        onSubmit={e => {
          e.preventDefault();
          const value = searchInputRef.current?.value || '';
          setLocation(buildDiscoverUrl(categoryId, value));
        }}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search playlists..."
          defaultValue={searchQuery}
          className="px-4 py-2 rounded-lg border border-muted bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full max-w-xs transition"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
        >
          Search
        </button>
      </form>
      {/* Category filter */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Categories</h2>
        <div className="flex flex-wrap gap-3 md:gap-2">
          {categoriesWithAll.map((category: any, index: number) => (
            <Link
              key={category.id}
              href={buildDiscoverUrl(category.id, searchQuery)}
            >
              <button onClick={() => setActiveCategoryId(index)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                activeCategoryId === index
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-muted text-foreground dark:bg-muted dark:text-foreground'
              } hover:scale-105`}>
                {category.name}
              </button>
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
              <div key={i} className="bg-card text-card-foreground rounded-lg overflow-hidden shadow-sm">
                <Skeleton className="h-36 w-full" />
                <div className="p-3">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !filteredPlaylists || filteredPlaylists.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No playlists found{searchQuery ? ` for "${searchQuery}"` : ''}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPlaylists.map((playlist: any) => (
              <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                <div className="bg-card text-card-foreground rounded-lg overflow-hidden shadow-sm cursor-pointer">
                  <div 
                    className="h-36 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(to bottom right, ${playlist.coverGradientStart}, ${playlist.coverGradientEnd})`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-25">
                      <i className={`bx bx-${playlist.icon} text-7xl text-primary-foreground`}></i>
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
        )}
      </div>
    </div>
  );
}
