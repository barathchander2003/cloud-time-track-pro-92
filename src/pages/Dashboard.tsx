
import { useState, useEffect } from "react";
import { Clock, Users, CheckSquare, FileText } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import TimeOffCard from "@/components/dashboard/TimeOffCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import RecentEmployeesCard from "@/components/dashboard/RecentEmployeesCard";
import ApprovalRequestsCard from "@/components/dashboard/ApprovalRequestsCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  employeeCount: number;
  pendingApprovals: number;
  documentsUploaded: number;
  timesheets: number;
}

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    employeeCount: 0,
    pendingApprovals: 0,
    documentsUploaded: 0,
    timesheets: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // For simplicity in this demo, we're setting mock data
        // In a real app, this would fetch from Supabase
        setTimeout(() => {
          setStats({
            employeeCount: 42,
            pendingApprovals: 12,
            documentsUploaded: 156,
            timesheets: 38
          });
          setLoading(false);
        }, 800);
        
        // Create a welcome notification for demo purposes
        if (user) {
          const { error } = await supabase
            .from('notifications')
            .insert([
              {
                user_id: user.id,
                title: 'Welcome to TimeTrack',
                message: 'Thank you for logging in to the TimeTrack HR system.',
                read: false
              }
            ]);
            
          if (error && error.code !== '23505') { // Ignore duplicate key errors
            console.error('Error creating notification:', error);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load dashboard data",
        });
      }
    };

    fetchDashboardData();
  }, [user]);

  const isAdminOrHR = profile?.role === "admin" || profile?.role === "hr";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {profile?.first_name || profile?.role}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {isAdminOrHR && (
          <StatsCard
            title="Total Employees"
            value={loading ? "Loading..." : stats.employeeCount.toString()}
            icon={Users}
            iconColor="text-blue-600"
            iconBackground="bg-blue-100"
            trend={{ value: 4.3, positive: true }}
          />
        )}
        
        <StatsCard
          title="Pending Approvals"
          value={loading ? "Loading..." : stats.pendingApprovals.toString()}
          icon={CheckSquare}
          iconColor="text-amber-600"
          iconBackground="bg-amber-100"
          description="Requiring your attention"
        />
        
        {isAdminOrHR && (
          <StatsCard
            title="Documents"
            value={loading ? "Loading..." : stats.documentsUploaded.toString()}
            icon={FileText}
            iconColor="text-violet-600"
            iconBackground="bg-violet-100"
            description="Total uploaded"
          />
        )}
        
        <StatsCard
          title="Timesheets"
          value={loading ? "Loading..." : stats.timesheets.toString()}
          icon={Clock}
          iconColor="text-green-600"
          iconBackground="bg-green-100"
          description="Submitted this month"
          trend={{ value: 2.1, positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <TimeOffCard />
        <ActivityCard />
        {isAdminOrHR && <RecentEmployeesCard />}
      </div>

      <ApprovalRequestsCard />
    </div>
  );
};

export default Dashboard;
