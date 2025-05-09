
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

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
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  
  // Fetch approval requests from Supabase
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchApprovalRequests = async () => {
      try {
        setLoading(true);
        
        // Only fetch if user is admin or HR
        if (profile?.role !== "admin" && profile?.role !== "hr") {
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
            submitted_at,
            employees!timesheet_employee_fkey (
              first_name,
              last_name
            )
          `)
          .eq('status', 'pending')
          .order('submitted_at', { ascending: false })
          .limit(5);
          
        if (error) {
          console.error("Error fetching approvals:", error);
          throw new Error(error.message);
        }
        
        // Format the requests for display
        const requests = timesheets.map((ts: any) => ({
          id: ts.id,
          employee: `${ts.employees?.first_name || 'Unknown'} ${ts.employees?.last_name || 'User'}`,
          type: "Monthly Timesheet",
          date: `${getMonthName(ts.month)} ${ts.year}`,
          status: ts.status as "pending" | "approved" | "rejected",
        }));
        
        setApprovalRequests(requests);
      } catch (error) {
        console.error("Error loading approval requests:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApprovalRequests();
  }, [session, profile]);
  
  const getMonthName = (monthNumber: number): string => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[monthNumber - 1];
  };
  
  const handleNavigateToApproval = (id: string) => {
    navigate(`/approvals?id=${id}`);
  };
  
  const handleViewAll = () => {
    navigate("/approvals");
  };

  return (
    <Card className="col-span-full xl:col-span-2 border-none shadow-md">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-purple-800">Pending Approvals</CardTitle>
        <CardDescription className="text-purple-600">Recent requests requiring your attention</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {approvalRequests.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">No pending approvals at this time</p>
              </div>
            ) : (
              approvalRequests.map((request) => (
                <div 
                  key={request.id}
                  data-id={request.id}
                  className="flex items-center justify-between p-3 rounded-lg border shadow-sm hover:shadow transition-shadow group"
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
              ))
            )}
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
