import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

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

interface TimesheetApproval {
  id: string;
  employee_id: string;
  year: number;
  month: number;
  status: string;
  submitted_at: string;
  employees?: {
    first_name?: string;
    last_name?: string;
    employee_number?: string;
  };
}

const ApprovalList = () => {
  const { toast } = useToast();
  const { session, profile } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [history, setHistory] = useState<Approval[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [historyVisible, setHistoryVisible] = useState(false);
  
  // Fetch approvals from Supabase
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching approval requests with user:", session.user.id);
        console.log("User profile role:", profile?.role);
        
        // For demo mode or when using test data
        if (process.env.NODE_ENV === 'development' && (!session.user.email || session.user.email.includes('example.com'))) {
          console.log("Using demo data for approvals");
          const demoApprovals = [
            {
              id: "apr-001",
              employeeName: "Michael Chen",
              employeeId: "EMP001",
              type: "timesheet" as const,
              submissionDate: new Date(),
              period: "May 2025",
              status: "pending" as const
            },
            {
              id: "apr-002",
              employeeName: "Jessica Williams",
              employeeId: "EMP002",
              type: "timesheet" as const,
              submissionDate: new Date(),
              period: "May 2025", 
              status: "pending" as const
            },
            {
              id: "apr-003",
              employeeName: "David Rodriguez",
              employeeId: "EMP003",
              type: "timesheet" as const,
              submissionDate: new Date(),
              period: "May 2025",
              status: "pending" as const
            }
          ];
          
          const demoHistory = [
            {
              id: "apr-004",
              employeeName: "Sarah Johnson",
              employeeId: "EMP004",
              type: "timesheet" as const,
              submissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              period: "April 2025",
              status: "approved" as const
            },
            {
              id: "apr-005",
              employeeName: "Robert Kim",
              employeeId: "EMP005",
              type: "timesheet" as const,
              submissionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
              period: "April 2025",
              status: "rejected" as const
            }
          ];
          
          setApprovals(demoApprovals);
          setHistory(demoHistory);
          setLoading(false);
          return;
        }
        
        // Only fetch if user is admin or HR
        if (profile?.role !== "admin" && profile?.role !== "hr") {
          console.log("User is not admin or HR, skipping approval fetching");
          setLoading(false);
          return;
        }
        
        // Fetch pending timesheets with employee information
        const { data: timesheets, error } = await supabase
          .from('timesheets')
          .select(`
            id, 
            employee_id, 
            year, 
            month, 
            status, 
            submitted_at,
            employees (
              first_name,
              last_name,
              employee_number
            )
          `)
          .eq('status', 'pending');
          
        if (error) {
          console.error("Error fetching approvals:", error);
          throw new Error(error.message);
        }
        
        console.log("Fetched timesheet data:", timesheets);
        
        // Transform data to match Approval interface
        const transformedApprovals: Approval[] = (timesheets || []).map((ts: any) => ({
          id: ts.id,
          employeeName: `${ts.employees?.first_name || 'Unknown'} ${ts.employees?.last_name || 'User'}`,
          employeeId: ts.employees?.employee_number || ts.employee_id,
          type: "timesheet",
          submissionDate: new Date(ts.submitted_at),
          period: `${getMonthName(ts.month)} ${ts.year}`,
          status: ts.status,
        }));
        
        setApprovals(transformedApprovals);
        
        // Fetch approval history
        const { data: historyData, error: historyError } = await supabase
          .from('timesheets')
          .select(`
            id, 
            employee_id, 
            year, 
            month, 
            status, 
            submitted_at,
            employees (
              first_name,
              last_name,
              employee_number
            )
          `)
          .in('status', ['approved', 'rejected'])
          .order('submitted_at', { ascending: false })
          .limit(10);
          
        if (historyError) {
          console.error("Error fetching approval history:", historyError);
        } else if (historyData) {
          const transformedHistory: Approval[] = (historyData || []).map((ts: any) => ({
            id: ts.id,
            employeeName: `${ts.employees?.first_name || 'Unknown'} ${ts.employees?.last_name || 'User'}`,
            employeeId: ts.employees?.employee_number || ts.employee_id,
            type: "timesheet",
            submissionDate: new Date(ts.submitted_at),
            period: `${getMonthName(ts.month)} ${ts.year}`,
            status: ts.status,
          }));
          
          setHistory(transformedHistory);
        }
      } catch (error: any) {
        console.error("Failed to fetch approvals:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load approval requests: " + (error.message || "Unknown error"),
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApprovals();
  }, [session, profile, toast]);

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

  const confirmAction = async () => {
    if (!selectedApproval || !approvalAction || !session?.user) return;
    
    try {
      const newStatus = approvalAction === "approve" ? "approved" : "rejected";
      
      // Update the timesheet status in Supabase
      const { error } = await supabase
        .from('timesheets')
        .update({
          status: newStatus,
          approved_by: session.user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: approvalAction === "reject" ? comment : null
        })
        .eq('id', selectedApproval.id);
        
      if (error) {
        throw new Error(error.message);
      }
      
      // Create a notification for the employee
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedApproval.employeeId,
          title: `Timesheet ${approvalAction === "approve" ? "Approved" : "Rejected"}`,
          message: `Your timesheet for ${selectedApproval.period} has been ${approvalAction === "approve" ? "approved" : "rejected"}${approvalAction === "reject" ? ": " + comment : ""}`,
          read: false
        });
      
      // Update UI
      setApprovals(prev => prev.filter(a => a.id !== selectedApproval.id));
      setHistory(prev => [...prev, {...selectedApproval, status: newStatus as "approved" | "rejected"}]);
      
      toast({
        title: `${approvalAction === "approve" ? "Approved" : "Rejected"}`,
        description: `You have ${approvalAction === "approve" ? "approved" : "rejected"} ${selectedApproval.employeeName}'s ${selectedApproval.type}.`,
      });
      
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Approval action error:", error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: error.message || "There was an error processing your request",
      });
    }
  };

  const getMonthName = (monthNumber: number): string => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNumber >= 1 && monthNumber <= 12 ? months[monthNumber - 1] : "Unknown";
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

  const toggleHistory = () => {
    setHistoryVisible(!historyVisible);
  };

  return (
    <>
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-purple-800">Approval Requests</CardTitle>
          <CardDescription>
            Manage employee timesheet, leave, and document submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 bg-gray-100">
              <TabsTrigger value="pending" className="data-[state=active]:bg-white">Pending</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading approvals...</p>
                </div>
              ) : (
                <>
                  {approvals.length > 0 ? (
                    approvals.map((approval) => (
                      <div 
                        key={approval.id} 
                        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
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
                                  className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                  onClick={() => handleReject(approval)}
                                >
                                  Reject
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                                  onClick={() => handleApprove(approval)}
                                >
                                  Approve
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-muted-foreground">No pending approvals at this time</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading history...</p>
                </div>
              ) : (
                <>
                  {history.length > 0 ? (
                    history.map((item) => (
                      <div 
                        key={item.id} 
                        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{item.employeeName}</h3>
                              <span className="text-xs text-muted-foreground">
                                ({item.employeeId})
                              </span>
                            </div>
                            <p className="text-sm">{getApprovalDetails(item)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted on {formatDate(item.submissionDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-muted-foreground">No approval history found</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={approvalAction === "approve" ? "text-green-700" : "text-red-700"}>
              {approvalAction === "approve" ? "Approve" : "Reject"} Submission
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approve"
                ? "Please confirm you want to approve this submission."
                : "Please provide a reason for rejecting this submission."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApproval && (
            <div className="py-3 border-y">
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
              className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-200">
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              variant={approvalAction === "approve" ? "default" : "destructive"}
              disabled={approvalAction === "reject" && comment.trim() === ""}
              className={approvalAction === "approve" ? 
                "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700" : 
                undefined}
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
