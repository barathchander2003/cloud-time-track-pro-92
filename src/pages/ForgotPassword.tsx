
import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Password reset failed",
          description: error.message || "An error occurred. Please try again.",
        });
      } else {
        setSubmitted(true);
        toast({
          title: "Reset link sent",
          description: "Check your email for a password reset link.",
        });
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-lg shadow-sm mb-4">
            <Clock className="h-8 w-8 text-brand-600" />
            <span className="text-2xl font-bold text-brand-600 ml-2">TimeTrack</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground mt-1">
            We'll send you a link to reset your password
          </p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle>{submitted ? "Check Your Email" : "Forgot Password"}</CardTitle>
            <CardDescription>
              {submitted 
                ? "We've sent a password reset link to your email address." 
                : "Enter your email address to receive a password reset link."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {submitted ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  If you don't receive an email within a few minutes, please check your spam folder or try again.
                </p>
                <Button 
                  onClick={() => setSubmitted(false)} 
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-4">
            <Link to="/login" className="flex items-center text-sm text-brand-600 hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
