import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Users, Music, Crown, Play, Loader2 } from "lucide-react";
import AdminLayout from "./layout";
import { apiRequest } from "@/lib/queryClient";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DashboardStats {
  totalUsers: number;
  totalTracks: number;
  totalSubscribers: number;
  totalPlays: number;
  userGrowth: Array<{ name: string; users: number }>;
  listeningData: Array<{ name: string; minutes: number }>;
  subscriptionData: Array<{ name: string; value: number }>;
  categoryData: Array<{ name: string; value: number }>;
  userGrowthPercent?: number;
  newTracksThisWeek?: number;
  conversionRate?: number;
  playsGrowthPercent?: number;
}

interface PieLabelProps {
  name: string;
  percent: number;
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  index: number;
}

// Responsive Pie label for better mobile visibility
const renderPieLabel = ({ name, percent, cx, cy, midAngle, outerRadius, index }: PieLabelProps) => {
  const RADIAN = Math.PI / 180;
  const isXs = window.innerWidth < 400;
  const isSm = window.innerWidth < 640;
  // Position label outside the pie
  const radius = outerRadius + (isXs ? 10 : isSm ? 16 : 24);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  let labelText = `${name}: ${(percent * 100).toFixed(0)}%`;
  if (isXs) labelText = `${name}`;
  return (
    <text
      x={x}
      y={y}
      fill="#222"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={isXs ? 10 : isSm ? 12 : 16}
      fontWeight={isXs ? "normal" : "bold"}
      style={{ pointerEvents: 'none' }}
    >
      {labelText}
    </text>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTracks: 0,
    totalSubscribers: 0,
    totalPlays: 0,
    userGrowth: [],
    listeningData: [],
    subscriptionData: [],
    categoryData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/admin/dashboard-stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading dashboard</p>
            <p className="text-sm text-gray-600">{error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const filteredCategoryData = stats.categoryData.filter(
    (entry) => entry.value > 0 && entry.name
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.userGrowthPercent && stats.userGrowthPercent > 0 ? '+' : ''}{stats.userGrowthPercent || 0}% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Audio Tracks</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTracks}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newTracksThisWeek || 0} new this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionRate || 0}% conversion rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlays.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.playsGrowthPercent && stats.playsGrowthPercent > 0 ? '+' : ''}{stats.playsGrowthPercent || 0}% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* <Card>
            <CardHeader>
              <CardTitle>Listening Time (Minutes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.listeningData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card> */}
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.subscriptionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieLabel}
                      outerRadius={window.innerWidth < 400 ? 36 : window.innerWidth < 640 ? 48 : 100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.subscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieLabel}
                      outerRadius={window.innerWidth < 400 ? 36 : window.innerWidth < 640 ? 48 : 100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {filteredCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}