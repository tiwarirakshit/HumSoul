import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Play, Pause, Music, FileAudio, FolderOpen, Upload, Star } from "lucide-react";

// Types
interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface Playlist {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  isFeatured: boolean;
  userId: number;
  createdAt: string;
  affirmationCount?: number;
}

interface Affirmation {
  id: number;
  title: string;
  description?: string;
  playlistId: number;
  fileName: string;
  duration?: number;
  createdAt: string;
}

interface BackgroundMusic {
  id: number;
  title: string;
  category: string;
  description?: string;
  fileName: string;
  duration?: number;
  createdAt: string;
}

export default function AdminMusic() {
  const [activeTab, setActiveTab] = useState("playlists");
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for data
  const [categories, setCategories] = useState<Category[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [backgroundMusic, setBackgroundMusic] = useState<BackgroundMusic[]>([]);
  
  // Form states
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchPlaylists();
    fetchBackgroundMusic();
  }, []);

  // API calls
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists');
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const fetchAffirmations = async (playlistId: number) => {
    try {
      const response = await fetch(`/api/affirmations?playlistId=${playlistId}`);
      const data = await response.json();
      setAffirmations(data);
    } catch (error) {
      console.error('Error fetching affirmations:', error);
    }
  };

  const fetchBackgroundMusic = async () => {
    try {
      const response = await fetch('/api/background-music');
      const data = await response.json();
      setBackgroundMusic(data);
    } catch (error) {
      console.error('Error fetching background music:', error);
    }
  };

  // Category Management
  const handleCreateCategory = async (formData: {name: string, description: string, icon: string, color: string}) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchCategories();
        setIsDialogOpen(false);
        // Clear form
        (document.getElementById('name') as HTMLInputElement).value = '';
        (document.getElementById('description') as HTMLTextAreaElement).value = '';
        (document.getElementById('icon') as HTMLInputElement).value = '';
        (document.getElementById('color') as HTMLInputElement).value = '';
      }
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Playlist Management
  const handleCreatePlaylist = async (formData: {title: string, description: string, categoryId: string, isFeatured: boolean}) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          categoryId: parseInt(formData.categoryId),
          isFeatured: formData.isFeatured,
          userId: 1, // Replace with actual admin user ID
        }),
      });
      
      if (response.ok) {
        await fetchPlaylists();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // File Upload handlers
  const handleUploadAffirmation = async (files: FileList | null, formData: {title: string, description: string}) => {
    if (!files || !files[0] || !selectedPlaylist) return;
    
    setIsLoading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('audio', files[0]);
    uploadFormData.append('title', formData.title);
    uploadFormData.append('description', formData.description);
    uploadFormData.append('playlistId', selectedPlaylist.toString());
    
    try {
      const response = await fetch('/api/affirmations/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (response.ok) {
        await fetchAffirmations(selectedPlaylist);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error uploading affirmation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadBackgroundMusic = async (files: FileList | null, formData: {title: string, category: string, description: string}) => {
    if (!files || !files[0]) return;
    
    setIsLoading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('audio', files[0]);
    uploadFormData.append('title', formData.title);
    uploadFormData.append('category', formData.category);
    uploadFormData.append('description', formData.description);
    
    try {
      const response = await fetch('/api/background-music/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (response.ok) {
        await fetchBackgroundMusic();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error uploading background music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete functions
  const handleDeletePlaylist = async (id: number) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      const response = await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchPlaylists();
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const togglePlay = (id: string) => {
    setIsPlaying(isPlaying === id ? null : id);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Music & Content Management</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="affirmations" className="flex items-center gap-2">
            <FileAudio className="h-4 w-4" />
            Affirmations
          </TabsTrigger>
          <TabsTrigger value="background-music" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Background Music
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Categories</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Category name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Category description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Input id="icon" placeholder="Icon name or URL" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" type="color" />
                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      const name = (document.getElementById('name') as HTMLInputElement)?.value || '';
                      const description = (document.getElementById('description') as HTMLTextAreaElement)?.value || '';
                      const icon = (document.getElementById('icon') as HTMLInputElement)?.value || '';
                      const color = (document.getElementById('color') as HTMLInputElement)?.value || '';
                      handleCreateCategory({name, description, icon, color});
                    }} disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Category'}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Playlists Tab */}
        <TabsContent value="playlists" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Playlists</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Playlist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Playlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="playlist-title">Title</Label>
                    <Input id="playlist-title" placeholder="Playlist title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="playlist-description">Description</Label>
                    <Textarea id="playlist-description" placeholder="Playlist description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="playlist-category">Category</Label>
                    <Select>
                      <SelectTrigger id="playlist-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="playlist-featured" />
                    <Label htmlFor="playlist-featured">Featured Playlist</Label>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      const title = (document.getElementById('playlist-title') as HTMLInputElement)?.value || '';
                      const description = (document.getElementById('playlist-description') as HTMLTextAreaElement)?.value || '';
                      const categorySelect = document.getElementById('playlist-category') as HTMLSelectElement;
                      const categoryId = categorySelect?.value || '';
                      const isFeatured = (document.getElementById('playlist-featured') as HTMLInputElement)?.checked || false;
                      
                      if (title && categoryId) {
                        handleCreatePlaylist({title, description, categoryId, isFeatured});
                      }
                    }} disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Playlist'}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {playlists.map((playlist) => (
              <Card key={playlist.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {playlist.title}
                        {playlist.isFeatured && <Badge variant="secondary"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                      </CardTitle>
                      {playlist.description && (
                        <p className="text-sm text-muted-foreground mt-1">{playlist.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePlaylist(playlist.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Category: {playlist.categoryName || 'Unknown'}</span>
                    <span>Created: {new Date(playlist.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Affirmations Tab */}
        <TabsContent value="affirmations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Affirmations</h3>
            <div className="flex gap-4">
              <Select value={selectedPlaylist?.toString() || ""} onValueChange={(value) => {
                const playlistId = parseInt(value);
                setSelectedPlaylist(playlistId);
                fetchAffirmations(playlistId);
              }}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select playlist to view affirmations" />
                </SelectTrigger>
                <SelectContent>
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id.toString()}>
                      {playlist.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!selectedPlaylist}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Affirmation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Affirmation Audio</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="affirmation-title">Title</Label>
                      <Input id="affirmation-title" placeholder="Affirmation title" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="affirmation-description">Description</Label>
                      <Textarea id="affirmation-description" placeholder="Affirmation description" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="affirmation-audio">Audio File</Label>
                      <Input id="affirmation-audio" type="file" accept="audio/*" />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        const title = (document.getElementById('affirmation-title') as HTMLInputElement)?.value || '';
                        const description = (document.getElementById('affirmation-description') as HTMLTextAreaElement)?.value || '';
                        const fileInput = document.getElementById('affirmation-audio') as HTMLInputElement;
                        
                        if (title && fileInput?.files) {
                          handleUploadAffirmation(fileInput.files, {title, description});
                        }
                      }} disabled={isLoading}>
                        {isLoading ? 'Uploading...' : 'Upload Affirmation'}
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {selectedPlaylist && (
            <div className="space-y-4">
              {affirmations.map((affirmation) => (
                <Card key={affirmation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePlay(affirmation.id.toString())}
                        >
                          {isPlaying === affirmation.id.toString() ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <h4 className="font-medium">{affirmation.title}</h4>
                          {affirmation.description && (
                            <p className="text-sm text-muted-foreground">{affirmation.description}</p>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            <span>Duration: {formatDuration(affirmation.duration)}</span>
                            <span>Uploaded: {new Date(affirmation.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Background Music Tab */}
        <TabsContent value="background-music" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Background Music</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Music
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Background Music</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="music-title">Title</Label>
                    <Input id="music-title" placeholder="Music title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="music-category">Category</Label>
                    <Input id="music-category" placeholder="Music category" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="music-description">Description</Label>
                    <Textarea id="music-description" placeholder="Music description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="music-audio">Audio File</Label>
                    <Input id="music-audio" type="file" accept="audio/*" />
                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      const title = (document.getElementById('music-title') as HTMLInputElement)?.value || '';
                      const category = (document.getElementById('music-category') as HTMLInputElement)?.value || '';
                      const description = (document.getElementById('music-description') as HTMLTextAreaElement)?.value || '';
                      const fileInput = document.getElementById('music-audio') as HTMLInputElement;
                      
                      if (title && category && fileInput?.files) {
                        handleUploadBackgroundMusic(fileInput.files, {title, category, description});
                      }
                    }} disabled={isLoading}>
                      {isLoading ? 'Uploading...' : 'Upload Music'}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {backgroundMusic.map((music) => (
              <Card key={music.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePlay(music.id.toString())}
                      >
                        {isPlaying === music.id.toString() ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h4 className="font-medium">{music.title}</h4>
                        {music.description && (
                          <p className="text-sm text-muted-foreground">{music.description}</p>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>Category: {music.category}</span>
                          <span>Duration: {formatDuration(music.duration)}</span>
                          <span>Uploaded: {new Date(music.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}