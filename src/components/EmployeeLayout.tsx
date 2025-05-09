
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  FileText,
  LogOut,
  User,
  Home,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EmployeeLayout = () => {
  const { session, profile, isLoading } = useAuth();
  const { toast } = useToast();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <Clock className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin/HR - if so, redirect to main layout
  if (profile && (profile.role === "admin" || profile.role === "hr")) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Simplified sidebar for employees */}
      <div className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <Clock className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-blue-800">TimeTrack</span>
        </div>
        
        <div className="flex flex-col flex-1 py-4">
          <div className="px-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-gray-500">Employee</p>
              </div>
            </div>
          </div>
          
          <nav className="px-2 space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/employee">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </a>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/employee/timesheet">
                <Clock className="mr-2 h-4 w-4" />
                My Timesheet
              </a>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/employee/leave">
                <Calendar className="mr-2 h-4 w-4" />
                Leave Requests
              </a>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/employee/documents">
                <FileText className="mr-2 h-4 w-4" />
                My Documents
              </a>
            </Button>
          </nav>
          
          <div className="mt-auto px-4">
            <Button
              variant="outline"
              className="w-full justify-start border-gray-200"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-blue-800">TimeTrack</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="flex justify-around border-t border-gray-100">
          <Button variant="ghost" className="flex-1 flex flex-col py-2 h-auto" asChild>
            <a href="/employee">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </a>
          </Button>
          
          <Button variant="ghost" className="flex-1 flex flex-col py-2 h-auto" asChild>
            <a href="/employee/timesheet">
              <Clock className="h-5 w-5" />
              <span className="text-xs mt-1">Timesheet</span>
            </a>
          </Button>
          
          <Button variant="ghost" className="flex-1 flex flex-col py-2 h-auto" asChild>
            <a href="/employee/leave">
              <Calendar className="h-5 w-5" />
              <span className="text-xs mt-1">Leave</span>
            </a>
          </Button>
          
          <Button variant="ghost" className="flex-1 flex flex-col py-2 h-auto" asChild>
            <a href="/employee/documents">
              <FileText className="h-5 w-5" />
              <span className="text-xs mt-1">Docs</span>
            </a>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 md:mt-0 mt-24">
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
