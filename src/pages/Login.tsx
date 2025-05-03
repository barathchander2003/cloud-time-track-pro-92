
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Clock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  const { session, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse flex flex-col items-center">
          <Clock className="h-8 w-8 text-brand-600" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-lg shadow-sm mb-4">
            <Clock className="h-8 w-8 text-brand-600" />
            <span className="text-2xl font-bold text-brand-600 ml-2">TimeTrack</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1">
            Sign in to access your account
          </p>
        </div>
        
        <Card className="border-none shadow-lg">
          <LoginForm />
          <div className="flex items-center justify-center w-full gap-2 text-sm text-muted-foreground p-4 border-t">
            <ShieldCheck className="h-4 w-4" />
            <span>Use the demo buttons above to log in</span>
          </div>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Note: Demo accounts use the password "password123"
        </p>
      </div>
    </div>
  );
};

export default Login;
