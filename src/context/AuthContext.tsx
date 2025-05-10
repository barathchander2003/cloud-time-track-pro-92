
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isHR: boolean;
  signIn: (email: string, password: string) => Promise<{
    data: Session | null;
    error: AuthError | null;
  }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        // If profile doesn't exist, use the user's metadata for role
        const { data } = await supabase.auth.getUser();
        const userRole = data?.user?.user_metadata?.role || 'employee';
        
        return { 
          id: userId, 
          role: userRole,
          first_name: data?.user?.user_metadata?.first_name,
          last_name: data?.user?.user_metadata?.last_name
        };
      }
      
      console.log("Profile fetched:", data);
      return data as UserProfile;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return { id: userId, role: "employee" };
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const userProfile = await fetchProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener...");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession ? "session exists" : "no session");
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Fetch user profile separately to avoid auth deadlock
          if (currentSession?.user) {
            setTimeout(async () => {
              const userProfile = await fetchProfile(currentSession.user.id);
              setProfile(userProfile);
              
              // Check if we need to redirect based on the current URL
              const currentPath = window.location.pathname;
              if (currentPath === '/confirm-email') {
                // Set a short timeout to allow the confirmation process to complete
                setTimeout(() => {
                  navigate('/login?verified=true');
                }, 500);
              }
            }, 0);
          }
        } 
        else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
        } 
        else if (event === 'USER_UPDATED') {
          // Refresh user data when updated
          if (currentSession?.user) {
            setTimeout(async () => {
              const userProfile = await fetchProfile(currentSession.user.id);
              setProfile(userProfile);
            }, 0);
          }
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
        }
        
        if (data.session) {
          console.log("Existing session found");
          setSession(data.session);
          setUser(data.session.user);
          
          // Fetch user profile
          const userProfile = await fetchProfile(data.session.user.id);
          setProfile(userProfile);
        } else {
          console.log("No existing session");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email);
      
      // For demo purposes, create a mock successful response if using specific credentials
      if (email === "admin@example.com" && password === "password123") {
        console.log("Using demo credentials - creating mock session");
        
        // Create a proper User object with all required fields
        const mockUser = {
          id: "demo-user-id",
          email: email,
          user_metadata: { name: "Admin User", role: "admin" },
          app_metadata: { role: "admin" },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          // Add other required properties from the User type
          role: "",
          confirmed_at: new Date().toISOString(), // Mark as confirmed
          last_sign_in_at: "",
          updated_at: "",
          identities: [],
          factors: [],
          email_confirmed_at: new Date().toISOString() // Critical for demo user
        } as unknown as User;
        
        // Create a mock session
        const mockSession = {
          user: mockUser,
          access_token: "demo-access-token",
          refresh_token: "demo-refresh-token",
          expires_at: Date.now() + 3600
        } as Session;
        
        // Update local state
        setUser(mockUser);
        setSession(mockSession);
        setProfile({ id: mockUser.id, role: "admin" });
        
        return { data: mockSession, error: null };
      }
      
      // Regular Supabase authentication for non-demo credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Sign in response:", 
        data?.session ? "Session received" : "No session", 
        error ? `Error: ${error.message}` : "No error"
      );
      
      return { 
        data: data?.session,
        error 
      };
    } catch (error: any) {
      console.error("Error in signIn function:", error);
      return { 
        data: null, 
        error: new AuthError(error.message || "An unknown error occurred")
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again",
      });
    }
  };

  const isAdmin = profile?.role === "admin";
  const isHR = profile?.role === "hr";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAdmin,
        isHR,
        signIn,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
