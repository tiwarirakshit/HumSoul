import { useState, useEffect } from "react";
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
import { apiRequest } from "@/lib/queryClient";

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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    interval: 'monthly' as 'monthly' | 'yearly',
    features: '',
    isPopular: false
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/admin/subscriptions');
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      window.alert('Failed to fetch subscriptions: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      // If plans API doesn't exist, use default plans
      setPlans([
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
    }
  };

  const handleAddPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!planForm.name || !planForm.description || !planForm.price) {
      window.alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const features = planForm.features.split('\n').filter(f => f.trim());
      
      const planData = {
        name: planForm.name,
        description: planForm.description,
        price: parseFloat(planForm.price),
        interval: planForm.interval,
        features: features,
        isPopular: planForm.isPopular
      };

      const response = await apiRequest('POST', '/api/admin/plans', planData);
      const data = await response.json();

      window.alert('Plan created successfully');
      setCreateDialogOpen(false);
      setPlanForm({
        name: '',
        description: '',
        price: '',
        interval: 'monthly',
        features: '',
        isPopular: false
      });
      await fetchPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
      window.alert('Failed to create plan: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      await apiRequest('DELETE', `/api/admin/plans/${id}`);
      window.alert('Plan deleted successfully');
      await fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      window.alert('Failed to delete plan: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCancelSubscription = async (id: string) => {
    try {
      await apiRequest('PUT', `/api/admin/subscriptions/${id}`, { status: 'cancelled' });
      window.alert('Subscription cancelled successfully');
      await fetchSubscriptions();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      window.alert('Failed to cancel subscription: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
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
              
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setCreateDialogOpen(true)}>
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
                        <Input 
                          id="name" 
                          placeholder="Premium Monthly"
                          value={planForm.name}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input 
                          id="price" 
                          type="number" 
                          step="0.01" 
                          placeholder="9.99"
                          value={planForm.price}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, price: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interval">Interval</Label>
                      <select
                        id="interval"
                        value={planForm.interval}
                        onChange={(e) => setPlanForm(prev => ({ ...prev, interval: e.target.value as 'monthly' | 'yearly' }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Monthly subscription plan with all premium features"
                        value={planForm.description}
                        onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                        required
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
                        value={planForm.features}
                        onChange={(e) => setPlanForm(prev => ({ ...prev, features: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPopular"
                        checked={planForm.isPopular}
                        onChange={(e) => setPlanForm(prev => ({ ...prev, isPopular: e.target.checked }))}
                      />
                      <Label htmlFor="isPopular">Mark as Popular</Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting ? 'Creating...' : 'Create Plan'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCreateDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
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