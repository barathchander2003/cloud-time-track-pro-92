
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Timesheets from "./pages/Timesheets";
import Approvals from "./pages/Approvals";
import Documents from "./pages/Documents";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoadingSpinner } from "./components/ui/loading-spinner";

const queryClient = new QueryClient();

// Protected route component that checks authentication
const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { session, isLoading, profile } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role restrictions if specified
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// Route wrapper for the AuthProvider
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timesheets" element={<Timesheets />} />
        <Route path="/approvals" element={<Approvals />} />
      </Route>
      
      {/* Admin/HR only routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "hr"]} />}>
        <Route path="/employees" element={<Employees />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      
      {/* Admin only routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
