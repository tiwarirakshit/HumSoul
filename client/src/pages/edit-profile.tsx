import { useLocation } from "wouter";
import { ChevronLeft, User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { backendUser, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    location: '',
    bio: '',
    avatarUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Populate form with real user data when loaded
  useEffect(() => {
    if (backendUser) {
      setFormData({
        name: backendUser.name || '',
        email: backendUser.email || '',
        phone: backendUser.phone || '',
        dob: backendUser.dob || '',
        location: backendUser.location || '',
        bio: backendUser.bio || '',
        avatarUrl: backendUser.avatarUrl || ''
      });
    }
  }, [backendUser]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('PUT', '/api/users/profile', { id: backendUser.id, ...formData });
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
      // Fetch the latest user data from the backend
      const updatedUserRes = await apiRequest('GET', `/api/users/${backendUser.id}`);
      const updatedUser = await updatedUserRes.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-profile-updated'));
      queryClient.invalidateQueries({ queryKey: [`/api/users/${backendUser.id}`] });
      // Optionally, trigger a context update if needed (e.g., window.location.reload() or context setter)
      setLocation('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append("avatar", file);
    try {
      const response = await fetch("/api/users/upload-avatar", {
        method: "POST",
        body: formDataObj,
      });
      const data = await response.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, avatarUrl: data.url }));
        // Update localStorage user object with new avatarUrl
        const userFromStorage = localStorage.getItem('user');
        let userObj = null;
        try {
          userObj = userFromStorage ? JSON.parse(userFromStorage) : null;
        } catch (e) {
          userObj = null;
        }
        if (userObj) {
          userObj.avatarUrl = data.url;
          localStorage.setItem('user', JSON.stringify(userObj));
          window.dispatchEvent(new Event('user-profile-updated'));
        }
      } else {
        alert("Failed to upload image");
      }
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/profile')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Edit Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-24 px-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="mt-2 w-60 px-3 py-1 rounded border border-gray-300 text-sm"
                disabled={uploading}
              />
              {uploading && <div className="text-xs text-primary mt-2">Uploading...</div>}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="pl-9"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-9"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="pl-9"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className="pl-9"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="pl-9"
                placeholder="Enter your location"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Tell us about yourself"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 