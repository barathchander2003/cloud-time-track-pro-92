
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Layout from "./components/Layout";
import EmployeeLayout from "./components/EmployeeLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Timesheets from "./pages/Timesheets";
import Approvals from "./pages/Approvals";
import Documents from "./pages/Documents";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoadingSpinner } from "./components/ui/loading-spinner";

const queryClient = new QueryClient();

// Protected route component that checks authentication
interface ProtectedRouteProps {
  allowedRoles?: string[];
  element?: React.ReactNode;
  children?: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { session, isLoading, profile } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    if (profile.role === "user" || profile.role === "employee") {
      return <Navigate to="/employee" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

// Layout wrapper for protected routes
const ProtectedLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// Employee route - only for employee/user role
const EmployeeRoute = () => {
  const { session, isLoading, profile } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profile && (profile.role === "admin" || profile.role === "hr")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Employee layout wrapper
const EmployeeLayoutWrapper = () => {
  return (
    <EmployeeLayout>
      <Outlet />
    </EmployeeLayout>
  );
};

// Route wrapper for the AuthProvider
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    {/* Employee routes */}
    <Route element={<EmployeeRoute />}>
      <Route element={<EmployeeLayoutWrapper />}>
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/timesheet" element={<Timesheets />} />
        <Route path="/employee/leave" element={<Approvals />} />
        <Route path="/employee/documents" element={<Documents />} />
      </Route>
    </Route>

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timesheets" element={<Timesheets />} />
        <Route path="/approvals" element={<Approvals />} />
      </Route>
    </Route>

    {/* Admin/HR only routes */}
    <Route element={<ProtectedRoute allowedRoles={["admin", "hr"]} />}>
      <Route element={<ProtectedLayout />}>
        <Route path="/employees" element={<Employees />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Route>

    {/* Admin only routes */}
    <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
      <Route element={<ProtectedLayout />}>
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Route>

    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

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
