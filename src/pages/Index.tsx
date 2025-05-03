
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FullPageLoader } from "@/components/ui/loading-spinner";

const Index = () => {
  const { session, isLoading } = useAuth();
  
  if (isLoading) {
    return <FullPageLoader />;
  }
  
  // Redirect to the dashboard if logged in, otherwise to login page
  return <Navigate to={session ? "/dashboard" : "/login"} replace />;
};

export default Index;
