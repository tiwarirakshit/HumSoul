import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ban, CheckCircle, UserPlus, Pencil, Crown } from "lucide-react";
import AdminLayout from "./layout";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "suspended";
  subscriptionStatus: "free" | "premium";
  joinedAt: string;
  lastLogin: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      subscriptionStatus: "premium",
      joinedAt: "2024-01-15",
      lastLogin: "2024-03-10"
    },
    // Add more sample users as needed
  ]);

  const handleStatusToggle = (id: string) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return {
          ...user,
          status: user.status === "active" ? "suspended" : "active"
        };
      }
      return user;
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name">Name</label>
                    <Input id="name" placeholder="Enter name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email">Email</label>
                    <Input id="email" type="email" placeholder="Enter email" />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add User</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search users..."
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "active" ? "default" : "destructive"}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.subscriptionStatus === "premium" ? "default" : "secondary"}
                    >
                      <Crown className="mr-1 h-3 w-3" />
                      {user.subscriptionStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.joinedAt}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusToggle(user.id)}
                      >
                        {user.status === "active" ? (
                          <Ban className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
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