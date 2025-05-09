
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface TimeOffData {
  month: string;
  annual: number;
  sick: number;
  personal: number;
  unpaid: number;
  holiday: number;
}

interface TimesheetData {
  month: string;
  submitted: number;
  approved: number;
  rejected: number;
}

const Reports = () => {
  const [timeOffPeriod, setTimeOffPeriod] = useState("6months");
  const [timesheetPeriod, setTimesheetPeriod] = useState("6months");
  const [timeOffData, setTimeOffData] = useState<TimeOffData[]>([]);
  const [timesheetData, setTimesheetData] = useState<TimesheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { session, profile } = useAuth();

  // Fetch report data
  useEffect(() => {
    if (!session?.user || (profile?.role !== 'admin' && profile?.role !== 'hr')) return;
    
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Get current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        // Calculate start date based on period
        let startYear = currentYear;
        let startMonth = currentMonth;
        
        if (timeOffPeriod === "3months") {
          startMonth = currentMonth - 2;
        } else if (timeOffPeriod === "6months") {
          startMonth = currentMonth - 5;
        } else if (timeOffPeriod === "12months") {
          startMonth = currentMonth - 11;
        }
        
        // Adjust year if needed
        while (startMonth <= 0) {
          startMonth += 12;
          startYear--;
        }
        
        // Fetch timesheet entries to analyze leave usage
        const { data: timesheetEntries, error: entriesError } = await supabase
          .from('timesheet_entries')
          .select(`
            date,
            leave_type,
            timesheets!inner(
              year,
              month
            )
          `)
          .gte('timesheets.year', startYear)
          .lte('timesheets.year', currentYear);
          
        if (entriesError) {
          throw new Error("Error fetching leave data: " + entriesError.message);
        }
        
        // Process timesheet entries into leave data
        const monthData: Record<string, TimeOffData> = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize month data
        for (let i = 0; i < (timeOffPeriod === "3months" ? 3 : timeOffPeriod === "6months" ? 6 : 12); i++) {
          let month = currentMonth - i;
          let year = currentYear;
          
          while (month <= 0) {
            month += 12;
            year--;
          }
          
          const monthKey = `${year}-${month}`;
          const monthName = monthNames[month - 1];
          
          monthData[monthKey] = {
            month: monthName,
            annual: 0,
            sick: 0,
            personal: 0,
            unpaid: 0,
            holiday: 0
          };
        }
        
        // Count leaves by type and month
        if (timesheetEntries) {
          timesheetEntries.forEach((entry: any) => {
            const entryDate = new Date(entry.date);
            const entryYear = entryDate.getFullYear();
            const entryMonth = entryDate.getMonth() + 1;
            const monthKey = `${entryYear}-${entryMonth}`;
            
            if (monthData[monthKey] && entry.leave_type && entry.leave_type !== 'work') {
              if (monthData[monthKey][entry.leave_type as keyof Omit<TimeOffData, 'month'>] !== undefined) {
                monthData[monthKey][entry.leave_type as keyof Omit<TimeOffData, 'month'>]++;
              }
            }
          });
        }
        
        // Convert to array for chart
        const timeOffChartData: TimeOffData[] = Object.values(monthData).reverse();
        setTimeOffData(timeOffChartData);
        
        // Fetch timesheet status data
        const { data: timesheets, error: timesheetsError } = await supabase
          .from('timesheets')
          .select('year, month, status')
          .gte('year', startYear)
          .lte('year', currentYear);
          
        if (timesheetsError) {
          throw new Error("Error fetching timesheet data: " + timesheetsError.message);
        }
        
        // Process timesheet status data
        const timesheetMonthData: Record<string, TimesheetData> = {};
        
        // Initialize month data for timesheets
        for (let i = 0; i < (timesheetPeriod === "3months" ? 3 : timesheetPeriod === "6months" ? 6 : 12); i++) {
          let month = currentMonth - i;
          let year = currentYear;
          
          while (month <= 0) {
            month += 12;
            year--;
          }
          
          const monthKey = `${year}-${month}`;
          const monthName = monthNames[month - 1];
          
          timesheetMonthData[monthKey] = {
            month: monthName,
            submitted: 0,
            approved: 0,
            rejected: 0
          };
        }
        
        // Count timesheets by status and month
        if (timesheets) {
          timesheets.forEach((sheet: any) => {
            const monthKey = `${sheet.year}-${sheet.month}`;
            
            if (timesheetMonthData[monthKey]) {
              timesheetMonthData[monthKey].submitted++;
              
              if (sheet.status === 'approved') {
                timesheetMonthData[monthKey].approved++;
              } else if (sheet.status === 'rejected') {
                timesheetMonthData[monthKey].rejected++;
              }
            }
          });
        }
        
        // Convert to array for chart
        const timesheetChartData: TimesheetData[] = Object.values(timesheetMonthData).reverse();
        setTimesheetData(timesheetChartData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading report data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load report data",
          description: "There was an error loading the report data. Please try again."
        });
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [session, profile, timeOffPeriod, timesheetPeriod]);

  const exportChartData = (chartType: 'timeOff' | 'timesheet') => {
    try {
      const data = chartType === 'timeOff' ? timeOffData : timesheetData;
      const filename = chartType === 'timeOff' ? 'leave-utilization.csv' : 'timesheet-analytics.csv';
      
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add headers
      if (chartType === 'timeOff') {
        csvContent += "Month,Annual Leave,Sick Leave,Personal Leave,Unpaid Leave,Public Holiday\n";
      } else {
        csvContent += "Month,Submitted,Approved,Rejected\n";
      }
      
      // Add data rows
      data.forEach(row => {
        if (chartType === 'timeOff') {
          csvContent += `${row.month},${row.annual},${row.sick},${row.personal},${row.unpaid},${row.holiday}\n`;
        } else {
          csvContent += `${row.month},${row.submitted},${row.approved},${row.rejected}\n`;
        }
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `The ${chartType === 'timeOff' ? 'leave utilization' : 'timesheet analytics'} data has been exported.`
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting the data."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold tracking-tight text-blue-800">Reports</h2>
        <p className="text-blue-600">
          View analytics and generate reports on employee data
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-green-50 to-teal-50 rounded-t-lg">
            <div>
              <CardTitle className="text-xl font-bold text-green-800">Leave Utilization</CardTitle>
              <CardDescription className="text-green-600">
                Employee leave by type and month
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={timeOffPeriod}
                onValueChange={setTimeOffPeriod}
              >
                <SelectTrigger className="w-[180px] border-green-200 focus:ring-green-500">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => exportChartData('timeOff')}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[350px] w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              </div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeOffData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="annual" name="Annual Leave" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="sick" name="Sick Leave" stackId="a" fill="#ef4444" />
                    <Bar dataKey="personal" name="Personal Leave" stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="unpaid" name="Unpaid Leave" stackId="a" fill="#a1a1aa" />
                    <Bar dataKey="holiday" name="Public Holiday" stackId="a" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div>
              <CardTitle className="text-xl font-bold text-blue-800">Timesheet Analytics</CardTitle>
              <CardDescription className="text-blue-600">
                Monthly timesheet submissions and approval status
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={timesheetPeriod}
                onValueChange={setTimesheetPeriod}
              >
                <SelectTrigger className="w-[180px] border-blue-200 focus:ring-blue-500">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => exportChartData('timesheet')}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[350px] w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timesheetData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="submitted" name="Submitted" fill="#1a73e8" />
                    <Bar dataKey="approved" name="Approved" fill="#0f9d58" />
                    <Bar dataKey="rejected" name="Rejected" fill="#ea4335" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
