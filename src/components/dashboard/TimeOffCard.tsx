
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LeaveBalance {
  type: string;
  used: number;
  total: number;
  name: string;
  color: string;
}

interface TimeOffCardProps {
  onRequestTimeOff?: () => void;
}

const TimeOffCard = ({ onRequestTimeOff }: TimeOffCardProps) => {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([
    { type: "annual", name: "Annual Leave", used: 0, total: 25, color: "bg-blue-500" },
    { type: "sick", name: "Sick Leave", used: 0, total: 10, color: "bg-red-500" },
    { type: "personal", name: "Personal Leave", used: 0, total: 5, color: "bg-purple-500" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();
  
  // Fetch leave data from Supabase
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching leave data...");
        
        // Use demo data for development
        if (session.user.id === "demo-user-id") {
          console.log("Using demo data for leave balances");
          // Demo data - simulate some used leave
          setLeaveBalances([
            { type: "annual", name: "Annual Leave", used: 5, total: 25, color: "bg-blue-500" },
            { type: "sick", name: "Sick Leave", used: 2, total: 10, color: "bg-red-500" },
            { type: "personal", name: "Personal Leave", used: 1, total: 5, color: "bg-purple-500" },
          ]);
          setLoading(false);
          return;
        }
        
        // Get the current year
        const currentYear = new Date().getFullYear();
        
        // First, get the employee id for the current user
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (employeeError) {
          console.error("Error fetching employee data:", employeeError);
          throw new Error("Could not find your employee record");
        }
        
        if (!employeeData) {
          console.log("No employee record found for this user");
          setLoading(false);
          return;
        }
        
        console.log("Found employee ID:", employeeData.id);
        
        // Fetch timesheets for this employee this year
        const { data: timesheets, error: timesheetError } = await supabase
          .from('timesheets')
          .select('id')
          .eq('employee_id', employeeData.id)
          .eq('year', currentYear);
          
        if (timesheetError) {
          console.error("Error fetching timesheets:", timesheetError);
          throw new Error("Could not retrieve timesheet data");
        }
        
        if (!timesheets || timesheets.length === 0) {
          console.log("No timesheets found for this year");
          setLoading(false);
          return;
        }
        
        console.log("Found timesheets:", timesheets.length);
        
        // Get timesheet IDs
        const timesheetIds = timesheets.map((ts) => ts.id);
        
        // Fetch leave entries
        const { data: entries, error: entriesError } = await supabase
          .from('timesheet_entries')
          .select('leave_type, date')
          .in('timesheet_id', timesheetIds)
          .neq('leave_type', 'work');
          
        if (entriesError) {
          console.error("Error fetching leave entries:", entriesError);
          throw new Error("Could not retrieve leave data");
        }
        
        if (!entries) {
          console.log("No leave entries found");
          setLoading(false);
          return;
        }
        
        console.log("Found leave entries:", entries.length);
        
        // Count used leave days by type
        const leaveUsed: Record<string, number> = {
          annual: 0,
          sick: 0,
          personal: 0
        };
        
        entries.forEach((entry) => {
          if (entry.leave_type && leaveUsed[entry.leave_type] !== undefined) {
            leaveUsed[entry.leave_type]++;
          }
        });
        
        console.log("Leave used counts:", leaveUsed);
        
        // Update leave balances
        setLeaveBalances((prev) => 
          prev.map((balance) => ({
            ...balance,
            used: leaveUsed[balance.type] || 0
          }))
        );
        
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching leave data:", error);
        setError(error.message || "Could not load leave balances");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load leave balances",
        });
        setLoading(false);
      }
    };
    
    fetchLeaveData();
  }, [session, toast]);

  // Handle time off request button click
  const handleRequestTimeOff = () => {
    if (onRequestTimeOff) {
      onRequestTimeOff();
    }
  };

  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-blue-800 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Time Off Overview
        </CardTitle>
        <CardDescription className="text-blue-600">Leave balances for this year</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
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
        ) : leaveBalances.every(b => b.used === 0) ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-lg font-medium text-green-700">No leave taken yet this year</p>
            <p className="text-sm text-gray-500 mt-1">Your full balance is available</p>
            <Button 
              variant="outline" 
              className="w-full mt-6 border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={handleRequestTimeOff}
            >
              Request Time Off
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {leaveBalances.map((leave) => (
              <div key={leave.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{leave.name}</span>
                  <span className="text-sm">
                    {leave.used} / {leave.total} days used
                  </span>
                </div>
                <Progress
                  value={(leave.used / leave.total) * 100}
                  className="h-2"
                  indicatorClassName={leave.color}
                />
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={handleRequestTimeOff}
            >
              Request Time Off
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeOffCard;
