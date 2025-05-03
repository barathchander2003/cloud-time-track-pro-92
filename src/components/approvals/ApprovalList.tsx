
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Approval {
  id: string;
  employeeName: string;
  employeeId: string;
  type: "timesheet" | "leave" | "document";
  submissionDate: Date;
  period?: string;
  leaveType?: string;
  leaveDate?: string;
  documentName?: string;
  status: "pending" | "approved" | "rejected";
}

const initialApprovals: Approval[] = [
  {
    id: "1",
    employeeName: "Sarah Johnson",
    employeeId: "EMP001",
    type: "timesheet",
    submissionDate: new Date("2025-04-29T14:30:00"),
    period: "April 2025",
    status: "pending"
  },
  {
    id: "2",
    employeeName: "Michael Chen",
    employeeId: "EMP002",
    type: "timesheet",
    submissionDate: new Date("2025-04-28T09:15:00"),
    period: "April 2025",
    status: "pending"
  },
  {
    id: "3",
    employeeName: "Jessica Williams",
    employeeId: "EMP003",
    type: "leave",
    submissionDate: new Date("2025-04-27T16:45:00"),
    leaveType: "Annual Leave",
    leaveDate: "May 10-15, 2025",
    status: "pending"
  },
  {
    id: "4",
    employeeName: "David Rodriguez",
    employeeId: "EMP004",
    type: "document",
    submissionDate: new Date("2025-04-26T11:20:00"),
    documentName: "Medical Certificate.pdf",
    status: "pending"
  },
  {
    id: "5",
    employeeName: "Emily Davis",
    employeeId: "EMP005",
    type: "timesheet",
    submissionDate: new Date("2025-04-25T13:40:00"),
    period: "April 2025",
    status: "pending"
  }
];

const ApprovalList = () => {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  const handleApprove = (approval: Approval) => {
    setSelectedApproval(approval);
    setApprovalAction("approve");
    setComment("");
    setDialogOpen(true);
  };

  const handleReject = (approval: Approval) => {
    setSelectedApproval(approval);
    setApprovalAction("reject");
    setComment("");
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedApproval || !approvalAction) return;
    
    const newStatus = approvalAction === "approve" ? "approved" : "rejected";
    
    setApprovals(
      approvals.map(a => 
        a.id === selectedApproval.id 
          ? { ...a, status: newStatus as "approved" | "rejected" } 
          : a
      )
    );
    
    toast({
      title: `${approvalAction === "approve" ? "Approved" : "Rejected"}`,
      description: `You have ${approvalAction === "approve" ? "approved" : "rejected"} ${selectedApproval.employeeName}'s ${selectedApproval.type}.`,
    });
    
    setDialogOpen(false);
  };

  const getApprovalDetails = (approval: Approval) => {
    switch (approval.type) {
      case "timesheet":
        return `Monthly Timesheet - ${approval.period}`;
      case "leave":
        return `${approval.leaveType} - ${approval.leaveDate}`;
      case "document":
        return `Document - ${approval.documentName}`;
      default:
        return "Unknown submission";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
          <CardDescription>
            Manage employee timesheet, leave, and document submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div 
                key={approval.id} 
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{approval.employeeName}</h3>
                      <span className="text-xs text-muted-foreground">
                        ({approval.employeeId})
                      </span>
                    </div>
                    <p className="text-sm">{getApprovalDetails(approval)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted on {formatDate(approval.submissionDate)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(approval.status)}
                    
                    {approval.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleReject(approval)}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-brand-600 hover:bg-brand-700"
                          onClick={() => handleApprove(approval)}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {approvals.length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No pending approvals at this time</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {approvals.length} approval request{approvals.length !== 1 ? 's' : ''}
          </p>
          <Button variant="outline">View History</Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "Approve" : "Reject"} Submission
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approve"
                ? "Please confirm you want to approve this submission."
                : "Please provide a reason for rejecting this submission."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApproval && (
            <div className="py-3">
              <p><strong>Employee:</strong> {selectedApproval.employeeName}</p>
              <p><strong>Request:</strong> {getApprovalDetails(selectedApproval)}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Comment {approvalAction === "reject" && "(required)"}</p>
            <Textarea
              placeholder={
                approvalAction === "approve"
                  ? "Add an optional comment..."
                  : "Please provide a reason for rejection..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              variant={approvalAction === "approve" ? "default" : "destructive"}
              disabled={approvalAction === "reject" && comment.trim() === ""}
            >
              {approvalAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApprovalList;
