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

// Form interfaces
interface CategoryForm {
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface PlaylistForm {
  title: string;
  description: string;
  categoryId: string;
  isFeatured: boolean;
}

interface AffirmationForm {
  title: string;
  description: string;
  file: File | null;
}

interface MusicForm {
  title: string;
  category: string;
  description: string;
  file: File | null;
}

export default function AdminMusic() {

  // State management
  const [activeTab, setActiveTab] = useState("categories");
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [backgroundMusic, setBackgroundMusic] = useState<BackgroundMusic[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);

  // Form state
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: '', description: '', icon: '', color: '#000000'
  });
  const [playlistForm, setPlaylistForm] = useState<PlaylistForm>({
    title: '', description: '', categoryId: '', isFeatured: false
  });
  const [affirmationForm, setAffirmationForm] = useState<AffirmationForm>({
    title: '', description: '', file: null
  });
  const [musicForm, setMusicForm] = useState<MusicForm>({
    title: '', category: '', description: '', file: null
  });

  // Initialize data
  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchPlaylists(),
      fetchBackgroundMusic()
    ]);
  }, []);

  // API functions
  const api = {
    async request(url: string, options: RequestInit = {}) {
      try {
        const response = await fetch(url, {
          headers: { 'Content-Type': 'application/json', ...options.headers },
          ...options
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Request failed' }));
          throw new Error(error.message);
        }

        return response.status === 204 ? null : await response.json();
      } catch (error) {
        alert({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive"
        });
        throw error;
      }
    },

    async upload(url: string, formData: FormData) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Upload failed' }));
          throw new Error(error.message);
        }

        return await response.json();
      } catch (error) {
        alert({
          title: "Upload Error",
          description: error instanceof Error ? error.message : "Upload failed",
          variant: "destructive"
        });
        throw error;
      }
    }
  };

  // Fetch functions
  const fetchCategories = () => api.request('/api/categories').then(setCategories);
  const fetchPlaylists = () => api.request('/api/playlists').then(setPlaylists);
  const fetchBackgroundMusic = () => api.request('/api/background-music').then(setBackgroundMusic);
  const fetchAffirmations = (playlistId: number) =>
    api.request(`/api/affirmations?playlistId=${playlistId}`).then(setAffirmations);

  // Form helpers
  const resetForms = () => {
    setCategoryForm({ name: '', description: '', icon: '', color: '#000000' });
    setPlaylistForm({ title: '', description: '', categoryId: '', isFeatured: false });
    setAffirmationForm({ title: '', description: '', file: null });
    setMusicForm({ title: '', category: '', description: '', file: null });
    setEditingItem(null);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForms();
  };

  const showSuccess = (message: string) => {
    alert({ title: "Success", description: message });
    closeDialog();
  };

  // Category operations
  const handleCategorySubmit = async () => {
    setIsLoading(true);
    try {
      if (editingItem) {
        await api.request(`/api/categories/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(categoryForm)
        });
        showSuccess('Category updated successfully');
      } else {
        await api.request('/api/categories', {
          method: 'POST',
          body: JSON.stringify(categoryForm)
        });
        showSuccess('Category created successfully');
      }
      await fetchCategories();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingItem(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#000000'
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.request(`/api/categories/${id}`, { method: 'DELETE' });
      alert({ title: "Success", description: "Category deleted successfully" });
      await fetchCategories();
    } catch (error) {
      // Error is already handled in api.request
    }
  };

  // Playlist operations
  const handlePlaylistSubmit = async () => {
    setIsLoading(true);
    try {
      const data = {
        ...playlistForm,
        categoryId: parseInt(playlistForm.categoryId),
        userId: 1 // Replace with actual admin user ID
      };

      if (editingItem) {
        await api.request(`/api/playlists/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        showSuccess('Playlist updated successfully');
      } else {
        await api.request('/api/playlists', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        showSuccess('Playlist created successfully');
      }
      await fetchPlaylists();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingItem(playlist);
    setPlaylistForm({
      title: playlist.title,
      description: playlist.description || '',
      categoryId: playlist.categoryId.toString(),
      isFeatured: playlist.isFeatured
    });
    setIsDialogOpen(true);
  };

  const handleDeletePlaylist = async (id: number) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await api.request(`/api/playlists/${id}`, { method: 'DELETE' });
      alert({ title: "Success", description: "Playlist deleted successfully" });
      await fetchPlaylists();
    } catch (error) {
      // Error is already handled in api.request
    }
  };

  // Affirmation operations
  const handleAffirmationUpload = async () => {
    if (!affirmationForm.file || !selectedPlaylist) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', affirmationForm.file);
      formData.append('text', affirmationForm.title);
      formData.append('description', affirmationForm.description);
      formData.append('playlistId', selectedPlaylist.toString());
      formData.append('path', affirmationForm.file.name);
      const audio = new Audio(URL.createObjectURL(affirmationForm.file));
      await new Promise(resolve => audio.addEventListener('loadedmetadata', resolve));
      formData.append('duration', String(audio.duration));
      URL.revokeObjectURL(audio.src);

      await api.upload('/api/affirmations/upload', formData);
      showSuccess('Affirmation uploaded successfully');
      await fetchAffirmations(selectedPlaylist);
    } finally {
      setIsLoading(false);
    }
  };

  // Background music operations
  const handleMusicUpload = async () => {
    if (!musicForm.file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', musicForm.file);
      formData.append('title', musicForm.title);
      formData.append('category', musicForm.category);
      formData.append('description', musicForm.description);

      await api.upload('/api/background-music/upload', formData);
      showSuccess('Background music uploaded successfully');
      await fetchBackgroundMusic();
    } finally {
      setIsLoading(false);
    }
  };

  // UI helpers
  const togglePlay = (id: string) => {
    setIsPlaying(isPlaying === id ? null : id);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlaylistSelect = (playlistId: string) => {
    const id = parseInt(playlistId);
    setSelectedPlaylist(id);
    fetchAffirmations(id);
  };

  const openCreateDialog = (type: string) => {
    resetForms();
    setActiveTab(type);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Music & Content Management</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Tabs List */}
        <TabsList className="w-full">
          <div className="flex overflow-x-auto no-scrollbar gap-2 px-2 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
            <TabsTrigger
              value="categories"
              className="flex-shrink-0 min-w-fit flex items-center gap-2 whitespace-nowrap"
            >
              <FolderOpen className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="flex-shrink-0 min-w-fit flex items-center gap-2 whitespace-nowrap"
            >
              <Music className="h-4 w-4" />
              Playlists
            </TabsTrigger>
            <TabsTrigger
              value="affirmations"
              className="flex-shrink-0 min-w-fit flex items-center gap-2 whitespace-nowrap"
            >
              <FileAudio className="h-4 w-4" />
              Affirmations
            </TabsTrigger>
            <TabsTrigger
              value="background-music"
              className="flex-shrink-0 min-w-fit flex items-center gap-2 whitespace-nowrap"
            >
              <Music className="h-4 w-4" />
              Background Music
            </TabsTrigger>
          </div>
        </TabsList>
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-xl font-semibold">Categories</h3>
            <Button onClick={() => openCreateDialog('categories')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-xl font-semibold">Playlists</h3>
            <Button onClick={() => openCreateDialog('playlists')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Playlist
            </Button>
          </div>

          <div className="space-y-4">
            {playlists.map((playlist) => (
              <Card key={playlist.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {playlist.title}
                        {playlist.isFeatured && (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" /> Featured
                          </Badge>
                        )}
                      </CardTitle>
                      {playlist.description && (
                        <p className="text-sm text-muted-foreground mt-1">{playlist.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditPlaylist(playlist)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePlaylist(playlist.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground gap-2">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-xl font-semibold">Affirmations</h3>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Select value={selectedPlaylist?.toString() || ""} onValueChange={handlePlaylistSelect}>
                <SelectTrigger className="w-full sm:w-64">
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

              <Button disabled={!selectedPlaylist} onClick={() => openCreateDialog('affirmations')}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Affirmation
              </Button>
            </div>
          </div>

          {selectedPlaylist && (
            <div className="space-y-4">
              {affirmations.map((affirmation) => (
                <Card key={affirmation.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="font-medium">{affirmation.title}</h4>
                        {affirmation.description && (
                          <p className="text-sm text-muted-foreground">{affirmation.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                          <span className="text-black font-bold">{affirmation.text || 'Unknown'}</span>
                          <span>Duration: {formatDuration(affirmation.duration)}</span>
                        </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-xl font-semibold">Background Music</h3>
            <Button onClick={() => openCreateDialog('background-music')}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Music
            </Button>
          </div>

          <div className="space-y-4">
            {backgroundMusic.map((music) => (
              <Card key={music.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" onClick={() => togglePlay(music.id.toString())}>
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
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
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


      {/* Universal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Create'}{' '}
              {activeTab === 'categories' && 'Category'}
              {activeTab === 'playlists' && 'Playlist'}
              {activeTab === 'affirmations' && 'Affirmation'}
              {activeTab === 'background-music' && 'Background Music'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category Form */}
            {activeTab === 'categories' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="category-name">Name</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Category description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-icon">Icon</Label>
                  <Input
                    id="category-icon"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="Icon name or URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-color">Color</Label>
                  <Input
                    id="category-color"
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </>
            )}

            {/* Playlist Form */}
            {activeTab === 'playlists' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="playlist-title">Title</Label>
                  <Input
                    id="playlist-title"
                    value={playlistForm.title}
                    onChange={(e) => setPlaylistForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Playlist title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playlist-description">Description</Label>
                  <Textarea
                    id="playlist-description"
                    value={playlistForm.description}
                    onChange={(e) => setPlaylistForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Playlist description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playlist-category">Category</Label>
                  <Select value={playlistForm.categoryId} onValueChange={(value) => setPlaylistForm(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger>
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
                  <input
                    type="checkbox"
                    id="playlist-featured"
                    checked={playlistForm.isFeatured}
                    onChange={(e) => setPlaylistForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  />
                  <Label htmlFor="playlist-featured">Featured Playlist</Label>
                </div>
              </>
            )}

            {/* Affirmation Form */}
            {activeTab === 'affirmations' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="affirmation-title">Title</Label>
                  <Input
                    id="affirmation-title"
                    value={affirmationForm.title}
                    onChange={(e) => setAffirmationForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Affirmation title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affirmation-description">Description</Label>
                  <Textarea
                    id="affirmation-description"
                    value={affirmationForm.description}
                    onChange={(e) => setAffirmationForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Affirmation description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affirmation-file">Audio File</Label>
                  <Input
                    id="affirmation-file"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAffirmationForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  />
                </div>
              </>
            )}

            {/* Background Music Form */}
            {activeTab === 'background-music' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="music-title">Title</Label>
                  <Input
                    id="music-title"
                    value={musicForm.title}
                    onChange={(e) => setMusicForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Music title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="music-category">Category</Label>
                  <Input
                    id="music-category"
                    value={musicForm.category}
                    onChange={(e) => setMusicForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Music category"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="music-description">Description</Label>
                  <Textarea
                    id="music-description"
                    value={musicForm.description}
                    onChange={(e) => setMusicForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Music description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="music-file">Audio File</Label>
                  <Input
                    id="music-file"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setMusicForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (activeTab === 'categories') handleCategorySubmit();
                else if (activeTab === 'playlists') handlePlaylistSubmit();
                else if (activeTab === 'affirmations') handleAffirmationUpload();
                else if (activeTab === 'background-music') handleMusicUpload();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (editingItem ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}