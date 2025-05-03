
import { useState, useEffect } from 'react';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const InactivityWarning = () => {
  const { showWarning, remainingTime, resetTimer } = useInactivityTimer();
  const [timeString, setTimeString] = useState('');
  
  useEffect(() => {
    if (remainingTime <= 0) return;
    
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    setTimeString(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
  }, [remainingTime]);
  
  const handleContinue = () => {
    resetTimer();
  };
  
  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <div className="flex items-center gap-3 mb-2 text-amber-500">
          <Clock className="h-5 w-5" />
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
        </div>
        <AlertDialogDescription>
          Your session will expire in {timeString} due to inactivity. Click continue to stay signed in.
        </AlertDialogDescription>
        <div className="flex justify-end">
          <AlertDialogAction asChild>
            <Button onClick={handleContinue}>Continue Session</Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
