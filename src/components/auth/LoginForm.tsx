
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@example.com",
      password: "password123",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);
    
    try {
      console.log("Attempting login with:", data.email);
      const { data: sessionData, error } = await signIn(data.email, data.password);
      
      if (error) {
        console.error("Login error:", error);
        
        // Handle specific error types
        if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email not confirmed",
            description: "Please check your email and confirm your account before logging in.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error.message || "Invalid email or password.",
          });
        }
      } else if (sessionData) {
        toast({
          title: "Login successful",
          description: "Welcome to TimeTrack HR system.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Use the exact demo credentials
    const demoCredentials = {
      email: "admin@example.com",
      password: "password123"
    };
    
    form.setValue("email", demoCredentials.email);
    form.setValue("password", demoCredentials.password);
    
    // Submit the form directly
    form.handleSubmit(onSubmit)(new Event('submit') as any);
  };

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="admin@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <a 
              href="/forgot-password" 
              className="text-sm text-brand-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Demo Login (HR/Admin)
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
