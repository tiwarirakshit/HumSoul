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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Check, Ban, ReceiptText } from "lucide-react";
import AdminLayout from "./layout";

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  amount: number;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  isPopular?: boolean;
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: "sub_1234",
      userId: "1",
      userName: "John Doe",
      userEmail: "john@example.com",
      plan: "Premium Yearly",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2025-01-15",
      amount: 89.99
    },
    {
      id: "sub_5678",
      userId: "2",
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      plan: "Premium Monthly",
      status: "active",
      startDate: "2024-03-10",
      endDate: "2024-04-10",
      amount: 9.99
    },
    {
      id: "sub_9012",
      userId: "3",
      userName: "Bob Johnson",
      userEmail: "bob@example.com",
      plan: "Premium Yearly",
      status: "cancelled",
      startDate: "2023-11-05",
      endDate: "2024-04-01",
      amount: 89.99
    }
  ]);

  const [plans, setPlans] = useState<Plan[]>([
    {
      id: "plan_monthly",
      name: "Premium Monthly",
      description: "Monthly subscription plan with all premium features",
      price: 9.99,
      interval: "monthly",
      features: [
        "Unlimited affirmations",
        "Background music",
        "Custom playlists",
        "Basic meditation guides",
        "Daily reminders",
        "Basic analytics"
      ]
    },
    {
      id: "plan_yearly",
      name: "Premium Yearly",
      description: "Yearly subscription plan with all premium features (save 25%)",
      price: 89.99,
      interval: "yearly",
      isPopular: true,
      features: [
        "All Monthly features",
        "Save 25%",
        "Priority support",
        "Advanced meditation guides",
        "Exclusive content",
        "Advanced analytics",
        "Custom themes",
        "Offline access"
      ]
    }
  ]);

  const handleAddPlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add plan logic
    console.log("Adding new plan...");
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(plan => plan.id !== id));
  };

  const handleCancelSubscription = (id: string) => {
    setSubscriptions(subscriptions.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          status: "cancelled"
        };
      }
      return sub;
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Subscription Management</h2>
        
        <Tabs defaultValue="plans">
          <TabsList className="mb-4">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="subscriptions">User Subscriptions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Manage Plans</h3>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Subscription Plan</DialogTitle>
                    <DialogDescription>
                      Create a new subscription plan for your users
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPlan} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Input id="name" placeholder="Premium Monthly" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" type="number" step="0.01" placeholder="9.99" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Monthly subscription plan with all premium features"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="features">Features (one per line)</Label>
                      <Textarea 
                        id="features" 
                        placeholder="Unlimited affirmations
Background music
Custom playlists"
                        rows={5}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create Plan
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={plan.isPopular ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      {plan.isPopular && (
                        <Badge>Popular</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">
                        /{plan.interval === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sub.userName}</div>
                          <div className="text-sm text-muted-foreground">{sub.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{sub.plan}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.status === "active" 
                              ? "default" 
                              : sub.status === "cancelled" 
                                ? "destructive" 
                                : "secondary"
                          }
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{sub.startDate}</TableCell>
                      <TableCell>{sub.endDate}</TableCell>
                      <TableCell>${sub.amount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelSubscription(sub.id)}
                            disabled={sub.status !== "active"}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <ReceiptText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 