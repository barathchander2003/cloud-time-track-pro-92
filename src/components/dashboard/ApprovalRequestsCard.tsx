
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ApprovalRequest {
  id: string;
  employee: string;
  type: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

const ApprovalRequestsCard = () => {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch approval requests from Supabase
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchApprovalRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching approval requests...");
        
        // Use demo data for development
        if (session.user.id === "demo-user-id") {
          console.log("Using demo data for approvals");
          const demoApprovals = [
            {
              id: "apr-001",
              employee: "Michael Chen",
              type: "Monthly Timesheet",
              date: "May 2025",
              status: "pending" as const
            },
            {
              id: "apr-002",
              employee: "Jessica Williams",
              type: "Monthly Timesheet",
              date: "May 2025", 
              status: "pending" as const
            },
            {
              id: "apr-003",
              employee: "David Rodriguez",
              type: "Monthly Timesheet",
              date: "May 2025",
              status: "pending" as const
            }
          ];
          setApprovalRequests(demoApprovals);
          setLoading(false);
          return;
        }
        
        // Only fetch if user is admin or HR
        if (profile?.role !== "admin" && profile?.role !== "hr") {
          console.log("User is not admin or HR, skipping approval fetching");
          setLoading(false);
          return;
        }
        
        // Fetch pending timesheet approvals
        const { data: timesheets, error } = await supabase
          .from('timesheets')
          .select(`
            id, 
            employee_id, 
            year, 
            month, 
            status, 
            submitted_at
          `)
          .eq('status', 'pending')
          .order('submitted_at', { ascending: false })
          .limit(5);
          
        if (error) {
          console.error("Error fetching approvals:", error);
          throw new Error("Could not retrieve approval requests");
        }
        
        if (!timesheets || timesheets.length === 0) {
          console.log("No pending approvals found");
          setApprovalRequests([]);
          setLoading(false);
          return;
        }
        
        console.log("Found pending approvals:", timesheets.length);
        
        // For each timesheet, get the employee details
        const requestsPromises = timesheets.map(async (ts: any) => {
          const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .select('first_name, last_name')
            .eq('id', ts.employee_id)
            .maybeSingle();
            
          if (employeeError) {
            console.error("Error fetching employee:", employeeError);
            return {
              id: ts.id,
              employee: "Unknown User",
              type: "Monthly Timesheet",
              date: `${getMonthName(ts.month)} ${ts.year}`,
              status: ts.status as "pending" | "approved" | "rejected",
            };
          }
          
          return {
            id: ts.id,
            employee: `${employeeData?.first_name || 'Unknown'} ${employeeData?.last_name || 'User'}`,
            type: "Monthly Timesheet",
            date: `${getMonthName(ts.month)} ${ts.year}`,
            status: ts.status as "pending" | "approved" | "rejected",
          };
        });
        
        const requests = await Promise.all(requestsPromises);
        console.log("Processed approval requests:", requests);
        setApprovalRequests(requests);
      } catch (error: any) {
        console.error("Error loading approval requests:", error);
        setError(error.message || "Failed to load approval requests");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load approval requests",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApprovalRequests();
  }, [session, profile, toast]);
  
  const getMonthName = (monthNumber: number): string => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNumber >= 1 && monthNumber <= 12 ? months[monthNumber - 1] : "Unknown";
  };
  
  const handleNavigateToApproval = (id: string) => {
    navigate(`/approvals?id=${id}`);
  };
  
  const handleViewAll = () => {
    navigate("/approvals");
  };

  return (
    <Card className="col-span-full xl:col-span-2 border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-purple-800">Pending Approvals</CardTitle>
        <CardDescription className="text-purple-600">Recent requests requiring your attention</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : approvalRequests.length === 0 ? (
          <div className="text-center py-10 bg-gray-50/70 rounded-lg">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-700">All caught up!</p>
            <p className="text-muted-foreground">No pending approvals at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvalRequests.map((request) => (
              <div 
                key={request.id}
                data-id={request.id}
                className="flex items-center justify-between p-3 rounded-lg border shadow-sm hover:shadow transition-shadow group bg-white hover:bg-purple-50/50"
              >
                <div>
                  <p className="font-medium">{request.employee}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{request.type}</Badge>
                    <span className="text-xs text-muted-foreground">{request.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleNavigateToApproval(request.id)}
                    className="group-hover:bg-purple-50 group-hover:text-purple-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={handleViewAll}
            >
              View All Requests
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalRequestsCard;
