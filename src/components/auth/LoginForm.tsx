
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
      const { data: sessionData, error } = await signIn(data.email, data.password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid email or password.",
        });
      } else {
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
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (email: string) => {
    form.setValue("email", email);
    form.setValue("password", "password");
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-card rounded-lg shadow-lg">
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-8 w-8 text-brand-600" />
          <span className="text-2xl font-bold text-brand-600">TimeTrack</span>
        </div>
      </div>
      <h1 className="text-2xl font-semibold text-center mb-6">Sign In</h1>
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
        <p>Demo credentials:</p>
        <div className="flex gap-2 justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDemoLogin("admin@example.com")}
          >
            Admin
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDemoLogin("hr@example.com")}
          >
            HR
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
