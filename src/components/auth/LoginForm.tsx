
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
import { Clock } from "lucide-react";
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
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);
    
    try {
      console.log("Attempting login with:", data.email);
      const { data: sessionData, error } = await signIn(data.email, data.password);
      
      if (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid email or password. Try using the demo buttons below.",
        });
      } else if (sessionData) {
        toast({
          title: "Login successful",
          description: "Welcome to TimeTrack HR system.",
        });
        navigate("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "No session returned. Try using the demo buttons below.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred. Try using the demo buttons below.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email: string) => {
    setLoading(true);
    form.setValue("email", email);
    form.setValue("password", "password123");
    
    try {
      console.log("Attempting demo login with:", email);
      const { data: sessionData, error } = await signIn(email, "password123");
      
      if (error) {
        console.error("Demo login error:", error);
        toast({
          variant: "destructive",
          title: "Demo login failed",
          description: "The demo account credentials are invalid. Please contact the administrator.",
        });
      } else if (sessionData) {
        toast({
          title: "Demo login successful",
          description: `Welcome to TimeTrack HR system. You are logged in as ${email.includes("admin") ? "Admin" : "HR"}.`,
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast({
        variant: "destructive",
        title: "Demo login failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-card rounded-lg shadow-lg">
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
        </form>
      </Form>
      <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
        <p>Demo credentials (password123):</p>
        <div className="flex gap-2 justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDemoLogin("admin@example.com")}
            disabled={loading}
          >
            Admin
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDemoLogin("hr@example.com")}
            disabled={loading}
          >
            HR
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
