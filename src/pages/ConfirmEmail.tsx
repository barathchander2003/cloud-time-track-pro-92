
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConfirmEmail = () => {
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get token from URL
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const type = params.get("type");
        
        if (!token || !type) {
          setError("Invalid verification link. Please try signing in again.");
          setVerifying(false);
          return;
        }

        console.log("Confirming email with token:", token, "type:", type);

        // Verify the token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (error) {
          console.error("Verification error:", error);
          setError(error.message || "Failed to verify email. The link may have expired.");
          setVerifying(false);
          return;
        }

        // If successful
        setVerified(true);
        setVerifying(false);
        toast({
          title: "Email verified successfully!",
          description: "Your account has been verified. You can now log in.",
        });
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
        
      } catch (error: any) {
        console.error("Error during verification:", error);
        setError(error.message || "An unexpected error occurred");
        setVerifying(false);
      }
    };

    confirmEmail();
  }, [location, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Email Verification</h1>
          <p className="text-muted-foreground mt-1">
            Confirming your email address
          </p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>
              {verifying ? "Verifying your email..." : 
                verified ? "Your email has been verified!" : 
                "Verification failed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            {verifying ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                <p className="text-center text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </div>
            ) : verified ? (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <p className="text-center text-green-700 font-medium">
                  Your email has been verified successfully!
                </p>
                <p className="text-center text-muted-foreground">
                  Redirecting you to login page in a few seconds...
                </p>
                <Button onClick={() => navigate("/login")} className="mt-4">
                  Go to Login
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <XCircle className="h-16 w-16 text-red-500" />
                <p className="text-center text-red-700 font-medium">
                  Verification failed
                </p>
                <p className="text-center text-muted-foreground">
                  {error || "An unknown error occurred during verification."}
                </p>
                <div className="flex gap-4 mt-4">
                  <Button onClick={() => navigate("/login")} variant="outline">
                    Back to Login
                  </Button>
                  <Button onClick={() => navigate("/register")}>
                    Register Again
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmEmail;
