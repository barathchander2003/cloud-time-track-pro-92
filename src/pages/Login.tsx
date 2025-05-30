import { useState, useEffect } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
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
import { Clock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  remember: z.boolean().default(true),
});

type LoginValues = z.infer<typeof loginSchema>;

type SavedCredentials = {
  email: string;
  password: string;
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [savedCredentials, setSavedCredentials] = useState<SavedCredentials[]>([]);
  const { toast } = useToast();
  const { session, isLoading, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved credentials from localStorage
    const saved = localStorage.getItem('savedCredentials');
    if (saved) {
      try {
        setSavedCredentials(JSON.parse(saved));
      } catch (e) {
        console.error("Could not parse saved credentials");
      }
    }
  }, []);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  // Handle email input to auto-append @gmail.com if not present
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setEmailInput(value);
    
    // If @ is not in the input and input is not empty, append @gmail.com
    if (!value.includes('@') && value) {
      form.setValue('email', `${value}@gmail.com`);
    } else {
      form.setValue('email', value);
    }
  };

  // If already logged in, redirect to dashboard
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse flex flex-col items-center">
          <Clock className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

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
          description: error.message || "Invalid email or password.",
        });
      } else if (sessionData) {
        // Save credentials if remember is checked
        if (data.remember) {
          const newCredential = { email: data.email, password: data.password };
          const updatedCredentials = [...savedCredentials.filter(cred => cred.email !== data.email), newCredential];
          localStorage.setItem('savedCredentials', JSON.stringify(updatedCredentials));
        }
        
        toast({
          title: "Login successful",
          description: "Welcome to TimeTrack HR system.",
        });

        // Navigate to dashboard after successful login
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
  
  const useSavedCredential = (cred: SavedCredentials) => {
    form.setValue("email", cred.email);
    form.setValue("password", cred.password);
    setEmailInput(cred.email);
    
    // Submit the form immediately
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20"></div>
              <div className="relative bg-white rounded-full p-4 shadow-lg">
                <Clock className="h-10 w-10 text-blue-600" />
              </div>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            TimeTrack HR
          </h1>
          <p className="mt-2 text-slate-600">
            Employee management & time tracking system
          </p>
        </div>
        
        <Card className="border-none shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field: { onChange, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="username" 
                          autoComplete="email"
                          className="bg-gray-50 border-gray-200" 
                          {...rest} 
                          value={emailInput}
                          onChange={handleEmailChange}
                        />
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link 
                          to="/forgot-password" 
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          autoComplete="current-password"
                          className="bg-gray-50 border-gray-200" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Remember my credentials</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
               
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
            
            {savedCredentials.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Saved accounts</p>
                <div className="space-y-2">
                  {savedCredentials.map((cred, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      className="w-full justify-start text-left border-gray-200 hover:bg-blue-50"
                      onClick={() => useSavedCredential(cred)}
                    >
                      {cred.email}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <div className="text-center text-sm">
              <p>Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline font-medium">
                  Register
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
