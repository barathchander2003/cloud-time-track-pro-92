
import { useState } from "react";
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
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const timeOffData = [
  { month: 'Jan', annual: 12, sick: 5, personal: 2 },
  { month: 'Feb', annual: 15, sick: 4, personal: 1 },
  { month: 'Mar', annual: 22, sick: 3, personal: 3 },
  { month: 'Apr', annual: 18, sick: 7, personal: 2 },
  { month: 'May', annual: 25, sick: 4, personal: 0 },
  { month: 'Jun', annual: 32, sick: 5, personal: 1 },
];

const timesheetData = [
  { month: 'Jan', submitted: 245, approved: 240, rejected: 5 },
  { month: 'Feb', submitted: 230, approved: 225, rejected: 5 },
  { month: 'Mar', submitted: 252, approved: 250, rejected: 2 },
  { month: 'Apr', submitted: 248, approved: 245, rejected: 3 },
  { month: 'May', submitted: 256, approved: 252, rejected: 4 },
  { month: 'Jun', submitted: 254, approved: 250, rejected: 4 },
];

const Reports = () => {
  const [timeOffPeriod, setTimeOffPeriod] = useState("6months");
  const [timesheetPeriod, setTimesheetPeriod] = useState("6months");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          View analytics and generate reports on employee data
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Leave Utilization</CardTitle>
              <CardDescription>
                Employee leave by type and month
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={timeOffPeriod}
                onValueChange={setTimeOffPeriod}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                  <Bar dataKey="annual" name="Annual Leave" stackId="a" fill="#4285f4" />
                  <Bar dataKey="sick" name="Sick Leave" stackId="a" fill="#f4b400" />
                  <Bar dataKey="personal" name="Personal Leave" stackId="a" fill="#0f9d58" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Timesheet Analytics</CardTitle>
              <CardDescription>
                Monthly timesheet submissions and approval status
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={timesheetPeriod}
                onValueChange={setTimesheetPeriod}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                  <Bar dataKey="submitted" name="Submitted" fill="#1a73e8" />
                  <Bar dataKey="approved" name="Approved" fill="#0f9d58" />
                  <Bar dataKey="rejected" name="Rejected" fill="#ea4335" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
