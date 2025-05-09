
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const EmployeeDashboard = () => {
  const { session, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState(0);
  const [approvedLeaveRequests, setApprovedLeaveRequests] = useState(0);
  const [pendingTimesheets, setPendingTimesheets] = useState(0);
  
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!session) return;
      
      try {
        setLoading(true);
        
        // Demo mode - always use this for now since we don't have leave_requests table
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set demo data
        setPendingLeaveRequests(1);
        setApprovedLeaveRequests(2);
        setPendingTimesheets(1);
        
        /* 
        // This code is commented out since we don't have leave_requests table
        // Only try to fetch real data if not in demo mode
        if (session.user.email !== 'employee@example.com') {
          // Fetch pending timesheets
          const { data: timesheetData, error: timesheetError } = await supabase
            .from('timesheets')
            .select('status')
            .eq('employee_id', session.user.id)
            .eq('status', 'pending');
          
          if (!timesheetError && timesheetData) {
            setPendingTimesheets(timesheetData.length);
          }
        }
        */
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load dashboard data",
          description: "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, [session]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}</h1>
        <p className="text-gray-500">
          Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
      
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-600" />
              Timesheet
            </CardTitle>
            <CardDescription>Track your working hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending timesheets:</span>
                <span className="font-medium">{loading ? '...' : pendingTimesheets}</span>
              </div>
              <Button className="w-full" asChild>
                <a href="/employee/timesheet">Fill Timesheet</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarRange className="mr-2 h-5 w-5 text-green-600" />
              Leave Requests
            </CardTitle>
            <CardDescription>Manage your time off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending requests:</span>
                <span className="font-medium">{loading ? '...' : pendingLeaveRequests}</span>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                <a href="/employee/leave">Request Leave</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-600" />
              Documents
            </CardTitle>
            <CardDescription>Access your files</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
              <a href="/employee/documents">View Documents</a>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Status summaries */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : pendingLeaveRequests === 0 && approvedLeaveRequests === 0 && pendingTimesheets === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                <p className="text-lg font-medium text-green-700">All caught up!</p>
                <p className="text-muted-foreground">You have no pending activities</p>
              </div>
            ) : (
              <>
                {pendingLeaveRequests > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-yellow-600 mr-3" />
                      <p>You have {pendingLeaveRequests} pending leave request{pendingLeaveRequests > 1 ? 's' : ''}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-yellow-200" asChild>
                      <a href="/employee/leave">View</a>
                    </Button>
                  </div>
                )}
                
                {pendingTimesheets > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-3" />
                      <p>You have {pendingTimesheets} pending timesheet{pendingTimesheets > 1 ? 's' : ''}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-blue-200" asChild>
                      <a href="/employee/timesheet">Complete</a>
                    </Button>
                  </div>
                )}
                
                {approvedLeaveRequests > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                      <p>You have {approvedLeaveRequests} approved leave request{approvedLeaveRequests > 1 ? 's' : ''}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-green-200" asChild>
                      <a href="/employee/leave">View</a>
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
