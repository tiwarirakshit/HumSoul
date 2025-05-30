import { useLocation } from "wouter";
import { ChevronLeft, User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    dob: "1990-01-01",
    location: "New York, USA",
    bio: "Meditation enthusiast and mindfulness practitioner"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('PUT', '/api/users/profile', formData);
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4 px-4 py-4" style={{
          background:"white"
        }}>
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
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-12 w-12 text-primary" />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full"
              >
                Change
              </Button>
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