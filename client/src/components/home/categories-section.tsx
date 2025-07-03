import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Smile, 
  Heart, 
  Users, 
  Trophy, 
  Leaf, 
  Star, 
  Cloud, 
  Moon,
  Target,
  Zap,
  Sun
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Icon mapping for categories
const iconMap: Record<string, React.ReactNode> = {
  smile: <Smile className="h-6 w-6" />,
  money: <span className="text-2xl font-bold">₹</span>,
  heart: <Heart className="h-6 w-6" />,
  group: <Users className="h-6 w-6" />,
  trophy: <Trophy className="h-6 w-6" />,
  leaf: <Leaf className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
  cloud: <Cloud className="h-6 w-6" />,
  moon: <Moon className="h-6 w-6" />,
  target: <Target className="h-6 w-6" />,
  zap: <Zap className="h-6 w-6" />,
  sun: <Sun className="h-6 w-6" />
};

export default function CategoriesSection() {
  // Query categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  if (isLoading) {
    return (
      <section className="py-4">
        <h2 className="text-xl font-medium mb-4">Categories</h2>
        <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex-shrink-0 text-center">
              <Skeleton className="w-16 h-16 rounded-full mb-2" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <section className="py-4">
        <h2 className="text-xl font-medium mb-4">Categories</h2>
        <p className="text-center text-gray-500 dark:text-gray-400">No categories available</p>
      </section>
    );
  }
  
  return (
    <section className="py-4">
      <h2 className="text-xl font-medium mb-4 text-foreground">Categories</h2>
      <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((category: any) => (
          <Link key={category.id} href={`/discover?category=${category.id}`}>
            <div className="flex-shrink-0 text-center cursor-pointer">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-card text-card-foreground"
                style={{ 
                  backgroundColor: `${category.color}20`,
                  color: category.color 
                }}
              >
                {iconMap[category.icon] || <Star className="h-6 w-6" />}
              </div>
              <span className="text-xs font-medium text-muted-foreground">{category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
