
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
export const WARNING_TIMEOUT = 4 * 60 * 1000; // Show warning after 4 minutes

export const useInactivityTimer = () => {
  const { signOut, session } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(INACTIVITY_TIMEOUT);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  useEffect(() => {
    if (!session) return;
    
    // Set up timer to check inactivity
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const timeRemaining = INACTIVITY_TIMEOUT - timeSinceLastActivity;
      
      setRemainingTime(timeRemaining);
      
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        // Log out due to inactivity
        clearInterval(interval);
        toast({
          title: "Session expired",
          description: "You have been logged out due to inactivity",
        });
        signOut();
      } else if (timeSinceLastActivity >= WARNING_TIMEOUT) {
        // Show warning
        setShowWarning(true);
      }
    }, 1000); // Check every second
    
    // Set up event listeners to reset timer on user activity
    const resetTimer = () => {
      setLastActivity(Date.now());
      setShowWarning(false);
    };
    
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });
    
    // Cleanup function
    return () => {
      clearInterval(interval);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [session, signOut, toast, lastActivity]);
  
  return {
    showWarning,
    remainingTime,
    resetTimer: () => setLastActivity(Date.now())
  };
};
