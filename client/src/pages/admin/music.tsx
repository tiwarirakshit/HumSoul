import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Play, Pause } from "lucide-react";
import AdminLayout from "./layout";

interface Track {
  id: string;
  title: string;
  category: string;
  duration: string;
  uploadedAt: string;
  plays: number;
}

export default function AdminMusic() {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "1",
      title: "Morning Confidence",
      category: "Confidence",
      duration: "3:45",
      uploadedAt: "2024-03-10",
      plays: 1234
    },
    // Add more sample tracks as needed
  ]);

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle file upload logic here
    console.log("Uploading file...");
  };

  const handleDelete = (id: string) => {
    setTracks(tracks.filter(track => track.id !== id));
  };

  const togglePlay = (id: string) => {
    setIsPlaying(isPlaying === id ? null : id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Music Management</h2>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Music
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Track</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter track title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="Enter category" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Audio File</Label>
                  <Input id="file" type="file" accept="audio/*" />
                </div>
                <Button type="submit" className="w-full">
                  Upload
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Plays</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((track) => (
                <TableRow key={track.id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePlay(track.id)}
                    >
                      {isPlaying === track.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{track.title}</TableCell>
                  <TableCell>{track.category}</TableCell>
                  <TableCell>{track.duration}</TableCell>
                  <TableCell>{track.uploadedAt}</TableCell>
                  <TableCell>{track.plays.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(track.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
} 