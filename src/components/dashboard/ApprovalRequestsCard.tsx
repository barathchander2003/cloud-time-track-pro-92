
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ApprovalRequest {
  id: string;
  employee: string;
  type: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

const approvalRequests: ApprovalRequest[] = [
  {
    id: "1",
    employee: "Sarah Johnson",
    type: "Monthly Timesheet",
    date: "Apr 2025",
    status: "pending"
  },
  {
    id: "2",
    employee: "Michael Chen",
    type: "Monthly Timesheet",
    date: "Apr 2025",
    status: "pending"
  },
  {
    id: "3",
    employee: "Jessica Williams",
    type: "Leave Request",
    date: "May 10-15, 2025",
    status: "pending"
  },
  {
    id: "4",
    employee: "David Rodriguez",
    type: "Monthly Timesheet",
    date: "Apr 2025",
    status: "pending"
  }
];

const ApprovalRequestsCard = () => {
  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Pending Approvals</CardTitle>
        <CardDescription>Recent requests requiring your attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvalRequests.map((request) => (
            <div 
              key={request.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div>
                <p className="font-medium">{request.employee}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{request.type}</Badge>
                  <span className="text-xs text-muted-foreground">{request.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Pending</Badge>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2">
            View All Requests
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalRequestsCard;
