
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
        
        // Fetch real stats from Supabase
        const promises = [];
        
        // Employee count
        if (profile?.role === "admin" || profile?.role === "hr") {
          promises.push(
            supabase.from('employees')
              .select('id', { count: 'exact', head: true })
              .then(({ count, error }) => {
                if (error) throw error;
                return { employeeCount: count || 0 };
              })
          );
          
          // Pending approvals
          promises.push(
            supabase.from('timesheets')
              .select('id', { count: 'exact', head: true })
              .eq('status', 'pending')
              .then(({ count, error }) => {
                if (error) throw error;
                return { pendingApprovals: count || 0 };
              })
          );
        }
        
        // Documents uploaded
        promises.push(
          supabase.from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('employee_id', user.id)
            .then(({ count, error }) => {
              if (error) throw error;
              return { documentsUploaded: count || 0 };
            })
        );
        
        // Current month's timesheets
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        promises.push(
          supabase.from('timesheets')
            .select('id', { count: 'exact', head: true })
            .eq('year', currentYear)
            .eq('month', currentMonth)
            .then(({ count, error }) => {
              if (error) throw error;
              return { timesheets: count || 0 };
            })
        );
        
        // Process all promises
        const results = await Promise.all(promises);
        
        // Combine results
        const newStats = results.reduce((acc, result) => ({ ...acc, ...result }), {} as DashboardStats);
        
        // Set default values for any missing properties
        setStats({
          employeeCount: newStats.employeeCount || 0,
          pendingApprovals: newStats.pendingApprovals || 0,
          documentsUploaded: newStats.documentsUploaded || 0,
          timesheets: newStats.timesheets || 0
        });
        
        setLoading(false);
        
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
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile, toast]);

  const isAdminOrHR = profile?.role === "admin" || profile?.role === "hr";

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold tracking-tight text-blue-800">Dashboard</h2>
        <p className="text-blue-600">
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
