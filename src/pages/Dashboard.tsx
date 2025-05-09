
import { useState, useEffect } from "react";
import { Clock, Users, CheckSquare, FileText, AlertCircle } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import TimeOffCard from "@/components/dashboard/TimeOffCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import RecentEmployeesCard from "@/components/dashboard/RecentEmployeesCard";
import ApprovalRequestsCard from "@/components/dashboard/ApprovalRequestsCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  employeeCount: number;
  pendingApprovals: number;
  documentsUploaded: number;
  timesheets: number;
}

const Dashboard = () => {
  const { profile, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    employeeCount: 0,
    pendingApprovals: 0,
    documentsUploaded: 0,
    timesheets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    if (!session?.user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Starting to fetch dashboard data...");
        
        // Use demo data if in development
        if (session.user.id === "demo-user-id") {
          console.log("Using demo data for dashboard");
          // Set mock data for demo user
          setStats({
            employeeCount: 32,
            pendingApprovals: 5,
            documentsUploaded: 45,
            timesheets: 28
          });
          setLoading(false);
          return;
        }
        
        // Fetch real stats from Supabase
        const promises = [];
        
        // Employee count
        if (profile?.role === "admin" || profile?.role === "hr") {
          promises.push(
            supabase.from('employees')
              .select('id', { count: 'exact', head: true })
              .then(({ count, error }) => {
                if (error) {
                  console.error("Error fetching employee count:", error);
                  throw error;
                }
                console.log("Employee count fetched:", count);
                return { employeeCount: count || 0 };
              })
              .then(
                result => result,
                error => {
                  console.error("Failed employee count fetch:", error);
                  return { employeeCount: 0 };
                }
              )
          );
          
          // Pending approvals
          promises.push(
            supabase.from('timesheets')
              .select('id', { count: 'exact', head: true })
              .eq('status', 'pending')
              .then(({ count, error }) => {
                if (error) {
                  console.error("Error fetching pending approvals:", error);
                  throw error;
                }
                console.log("Pending approvals fetched:", count);
                return { pendingApprovals: count || 0 };
              })
              .then(
                result => result,
                error => {
                  console.error("Failed pending approvals fetch:", error);
                  return { pendingApprovals: 0 };
                }
              )
          );
        }
        
        // Documents uploaded
        const userId = session.user.id;
        promises.push(
          supabase.from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('uploaded_by', userId)
            .then(({ count, error }) => {
              if (error) {
                console.error("Error fetching documents count:", error);
                throw error;
              }
              console.log("Documents count fetched:", count);
              return { documentsUploaded: count || 0 };
            })
            .then(
              result => result,
              error => {
                console.error("Failed documents count fetch:", error);
                return { documentsUploaded: 0 };
              }
            )
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
              if (error) {
                console.error("Error fetching timesheets count:", error);
                throw error;
              }
              console.log("Timesheets count fetched:", count);
              return { timesheets: count || 0 };
            })
            .then(
              result => result,
              error => {
                console.error("Failed timesheets count fetch:", error);
                return { timesheets: 0 };
              }
            )
        );
        
        // Process all promises
        const results = await Promise.allSettled(promises);
        console.log("All dashboard data promises settled:", results);
        
        // Combine results from successful promises
        const newStats = results.reduce((acc, result) => {
          if (result.status === 'fulfilled') {
            return { ...acc, ...result.value };
          }
          return acc;
        }, {} as DashboardStats);
        
        // Set default values for any missing properties
        setStats({
          employeeCount: newStats.employeeCount || 0,
          pendingApprovals: newStats.pendingApprovals || 0,
          documentsUploaded: newStats.documentsUploaded || 0,
          timesheets: newStats.timesheets || 0
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Could not load dashboard data. Please try again later.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load dashboard data",
        });
        
        // Use fallback data on error
        setStats({
          employeeCount: 0,
          pendingApprovals: 0,
          documentsUploaded: 0,
          timesheets: 0
        });
        
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, profile, toast]);

  const isAdminOrHR = profile?.role === "admin" || profile?.role === "hr";
  
  // Handle time off request
  const handleTimeOffRequest = () => {
    navigate("/timesheets");
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-100 to-indigo-100 p-6 rounded-lg shadow-sm border border-sky-200">
        <h2 className="text-3xl font-bold tracking-tight text-blue-800">Dashboard</h2>
        <p className="text-blue-600">
          Welcome back, {profile?.first_name || "User"}
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

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
        <TimeOffCard onRequestTimeOff={handleTimeOffRequest} />
        <ActivityCard />
        {isAdminOrHR && <RecentEmployeesCard />}
      </div>

      <ApprovalRequestsCard />
    </div>
  );
};

export default Dashboard;
