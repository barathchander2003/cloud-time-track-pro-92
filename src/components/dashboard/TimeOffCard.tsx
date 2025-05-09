
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface LeaveBalance {
  type: string;
  used: number;
  total: number;
  name: string;
  color: string;
}

const TimeOffCard = () => {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([
    { type: "annual", name: "Annual Leave", used: 0, total: 25, color: "bg-blue-500" },
    { type: "sick", name: "Sick Leave", used: 0, total: 10, color: "bg-red-500" },
    { type: "personal", name: "Personal Leave", used: 0, total: 5, color: "bg-purple-500" },
  ]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  
  // Fetch leave data from Supabase
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        
        // Get the current year
        const currentYear = new Date().getFullYear();
        
        // Fetch timesheets for the current user this year
        const { data: timesheets, error: timesheetError } = await supabase
          .from('timesheets')
          .select('id')
          .eq('employee_id', session.user.id)
          .eq('year', currentYear);
          
        if (timesheetError) {
          throw new Error(timesheetError.message);
        }
        
        if (!timesheets || timesheets.length === 0) {
          // No timesheets yet
          setLoading(false);
          return;
        }
        
        // Get timesheet IDs
        const timesheetIds = timesheets.map((ts) => ts.id);
        
        // Fetch leave entries
        const { data: entries, error: entriesError } = await supabase
          .from('timesheet_entries')
          .select('leave_type, date')
          .in('timesheet_id', timesheetIds)
          .neq('leave_type', 'work');
          
        if (entriesError) {
          throw new Error(entriesError.message);
        }
        
        if (!entries) {
          setLoading(false);
          return;
        }
        
        // Count used leave days by type
        const leaveUsed: Record<string, number> = {
          annual: 0,
          sick: 0,
          personal: 0
        };
        
        entries.forEach((entry) => {
          if (leaveUsed[entry.leave_type] !== undefined) {
            leaveUsed[entry.leave_type]++;
          }
        });
        
        // Update leave balances
        setLeaveBalances((prev) => 
          prev.map((balance) => ({
            ...balance,
            used: leaveUsed[balance.type] || 0
          }))
        );
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leave data:", error);
        setLoading(false);
      }
    };
    
    fetchLeaveData();
  }, [session]);

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-blue-800 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Time Off Overview
        </CardTitle>
        <CardDescription className="text-blue-600">Leave balances for this year</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
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
            
            <Button variant="outline" className="w-full mt-4 border-blue-200 text-blue-600 hover:bg-blue-50">
              Request Time Off
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeOffCard;
