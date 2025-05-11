
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
      
      // Get user metadata from auth
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.error("No user data found when fetching profile");
        return null;
      }
      
      // Try to get the profile from the profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        
        // Get user metadata
        const userMetadata = userData.user.user_metadata;
        
        // Create a profile with metadata if it doesn't exist
        const userRole = userMetadata?.role || 'employee';
        const firstName = userMetadata?.first_name;
        const lastName = userMetadata?.last_name;
        
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([{ 
            id: userId, 
            role: userRole,
            first_name: firstName,
            last_name: lastName
          }])
          .select('*')
          .single();
          
        if (insertError) {
          console.error("Error creating profile:", insertError);
          // Return a basic profile based on metadata even if insert fails
          return { 
            id: userId, 
            role: userRole,
            first_name: firstName,
            last_name: lastName
          };
        } else if (newProfile) {
          console.log("Created new profile:", newProfile);
          return newProfile as UserProfile;
        }
      }
      
      console.log("Profile fetched:", data);
      return data as UserProfile;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
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
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession ? "session exists" : "no session");
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Fetch user profile separately to avoid auth deadlock
          if (currentSession?.user) {
            setTimeout(async () => {
              const userProfile = await fetchProfile(currentSession.user.id);
              setProfile(userProfile);
              setIsLoading(false);
            }, 0);
          }
        } 
        else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        } 
        else if (event === 'USER_UPDATED') {
          // Refresh user data when updated
          if (currentSession?.user) {
            setTimeout(async () => {
              const userProfile = await fetchProfile(currentSession.user.id);
              setProfile(userProfile);
              setIsLoading(false);
            }, 0);
          }
        }
      }
    );

    // THEN get initial session
    const initializeAuth = async () => {
      try {
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
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
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email);
      setIsLoading(true);
      
      // Direct sign in, no email verification check
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Sign in response:", 
        data?.session ? "Session received" : "No session", 
        error ? `Error: ${error.message}` : "No error"
      );
      
      if (data?.session) {
        setUser(data.session.user);
        setSession(data.session);
        
        // Fetch and set the user profile
        const userProfile = await fetchProfile(data.session.user.id);
        setProfile(userProfile);
      }
      
      setIsLoading(false);
      return { 
        data: data?.session,
        error 
      };
    } catch (error: any) {
      console.error("Error in signIn function:", error);
      setIsLoading(false);
      return { 
        data: null, 
        error: new AuthError(error.message || "An unknown error occurred")
      };
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      navigate("/login");
      setIsLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again",
      });
      setIsLoading(false);
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
