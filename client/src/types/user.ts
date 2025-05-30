export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionEndDate?: string;
  subscriptionPlan?: 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
} 