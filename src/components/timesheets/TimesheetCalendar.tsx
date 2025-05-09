import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isWeekend } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface DayProps {
  date: Date;
  onClick?: () => void;
  onSelect?: (date: Date) => void;
  isCurrentMonth: boolean;
  entries?: TimesheetEntry[];
}

interface TimesheetEntry {
  id?: string;
  date: string;
  hours: number;
  notes?: string;
  leave_type?: string | null;
}

const Day: React.FC<DayProps> = ({ date, onClick, onSelect, isCurrentMonth, entries }) => {
  const isWeekendDay = isWeekend(date);
  const today = isToday(date);
  const formattedDate = format(date, "d");
  
  // Calculate total hours for the day
  const totalHours = entries?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0;
  const hasEntries = entries && entries.length > 0;
  const isLeaveDay = entries?.some(entry => entry.leave_type);
  
  const handleClick = () => {
    if (onClick) onClick();
    if (onSelect) onSelect(date);
  };
  
  return (
    <div
      onClick={handleClick}
      className={cn(
        "h-24 p-2 border border-gray-200 overflow-hidden transition-colors",
        isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400",
        isWeekendDay && isCurrentMonth && "bg-blue-50",
        today && "border-blue-500 border-2",
        !isCurrentMonth && "pointer-events-none",
        isCurrentMonth && "cursor-pointer hover:bg-blue-50"
      )}
    >
      <div className="flex justify-between items-start">
        <span className={cn(
          "text-sm font-medium",
          today && "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
        )}>
          {formattedDate}
        </span>
        
        {hasEntries && (
          <div className="flex items-center">
            {isLeaveDay ? (
              <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                Leave
              </span>
            ) : (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded">
                {totalHours}h
              </span>
            )}
          </div>
        )}
      </div>
      
      {hasEntries && (
        <div className="mt-1">
          {entries?.map((entry, i) => (
            <div 
              key={entry.id || i} 
              className="text-xs truncate"
              title={entry.notes}
            >
              {entry.leave_type ? (
                <span className="text-purple-600">{entry.leave_type}</span>
              ) : (
                <span className="text-gray-600">{entry.notes?.substring(0, 20)}{entry.notes?.length > 20 ? '...' : ''}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TimesheetCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [entries, setEntries] = useState<Record<string, TimesheetEntry[]>>({});
  const [loading, setLoading] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimesheetEntry>({
    date: '',
    hours: 8,
    notes: '',
  });
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Fetch timesheet entries for the current month
  useEffect(() => {
    const fetchEntries = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        
        // For demo mode
        if (session.user.email === 'admin@example.com') {
          // Generate some demo data
          const demoEntries: Record<string, TimesheetEntry[]> = {};
          
          // Add some random entries
          const daysInMonth = monthDays.length;
          const workdays = monthDays.filter(day => !isWeekend(day)).slice(0, 15);
          
          workdays.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            demoEntries[dateStr] = [{
              id: `demo-${dateStr}`,
              date: dateStr,
              hours: 8,
              notes: `Demo work entry for ${format(day, 'MMM dd')}`,
            }];
          });
          
          // Add a leave day
          const leaveDay = workdays[workdays.length - 1];
          const leaveDateStr = format(leaveDay, 'yyyy-MM-dd');
          demoEntries[leaveDateStr] = [{
            id: `demo-leave-${leaveDateStr}`,
            date: leaveDateStr,
            hours: 8,
            leave_type: 'Annual Leave',
            notes: 'Vacation day',
          }];
          
          setEntries(demoEntries);
          setLoading(false);
          return;
        }
        
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        
        // First get the timesheet for this month
        const { data: timesheet, error: timesheetError } = await supabase
          .from('timesheets')
          .select('id')
          .eq('employee_id', session.user.id)
          .eq('year', year)
          .eq('month', month)
          .maybeSingle();
          
        if (timesheetError) {
          throw new Error(timesheetError.message);
        }
        
        if (!timesheet) {
          // No timesheet for this month yet
          setEntries({});
          return;
        }
        
        // Now get all entries for this timesheet
        const { data: entriesData, error: entriesError } = await supabase
          .from('timesheet_entries')
          .select('*')
          .eq('timesheet_id', timesheet.id);
          
        if (entriesError) {
          throw new Error(entriesError.message);
        }
        
        // Group entries by date
        const entriesByDate: Record<string, TimesheetEntry[]> = {};
        
        entriesData.forEach(entry => {
          const dateStr = entry.date;
          if (!entriesByDate[dateStr]) {
            entriesByDate[dateStr] = [];
          }
          entriesByDate[dateStr].push({
            id: entry.id,
            date: entry.date,
            hours: entry.hours,
            notes: entry.notes,
            leave_type: entry.leave_type,
          });
        });
        
        setEntries(entriesByDate);
        
      } catch (error: any) {
        console.error("Error fetching timesheet entries:", error);
        toast({
          variant: "destructive",
          title: "Failed to load timesheet",
          description: error.message || "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntries();
  }, [currentMonth, session]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentEntry({
      date: format(date, 'yyyy-MM-dd'),
      hours: 8,
      notes: '',
    });
    setIsAddingEntry(true);
  };
  
  const handleSaveEntry = async () => {
    if (!session?.user || !currentEntry.date) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required information",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // For demo mode
      if (session.user.email === 'admin@example.com') {
        // Just update the local state
        const dateStr = currentEntry.date;
        const updatedEntries = { ...entries };
        
        if (!updatedEntries[dateStr]) {
          updatedEntries[dateStr] = [];
        }
        
        updatedEntries[dateStr].push({
          id: `demo-${Date.now()}`,
          ...currentEntry
        });
        
        setEntries(updatedEntries);
        setIsAddingEntry(false);
        setSelectedDate(null);
        
        toast({
          title: "Entry saved",
          description: "Your timesheet entry has been saved",
        });
        
        return;
      }
      
      const date = parseISO(currentEntry.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      // Check if a timesheet exists for this month
      let { data: timesheet, error: timesheetError } = await supabase
        .from('timesheets')
        .select('id')
        .eq('employee_id', session.user.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();
        
      if (timesheetError) {
        throw new Error(timesheetError.message);
      }
      
      // If no timesheet exists, create one
      if (!timesheet) {
        const { data: newTimesheet, error: createError } = await supabase
          .from('timesheets')
          .insert({
            employee_id: session.user.id,
            year,
            month,
            status: 'draft',
          })
          .select('id')
          .single();
          
        if (createError) {
          throw new Error(createError.message);
        }
        
        timesheet = newTimesheet;
      }
      
      // Now add the entry
      const { data: newEntry, error: entryError } = await supabase
        .from('timesheet_entries')
        .insert({
          timesheet_id: timesheet.id,
          date: currentEntry.date,
          hours: currentEntry.hours,
          notes: currentEntry.notes,
          leave_type: currentEntry.leave_type,
        })
        .select('*')
        .single();
        
      if (entryError) {
        throw new Error(entryError.message);
      }
      
      // Update local state
      const dateStr = currentEntry.date;
      const updatedEntries = { ...entries };
      
      if (!updatedEntries[dateStr]) {
        updatedEntries[dateStr] = [];
      }
      
      updatedEntries[dateStr].push({
        id: newEntry.id,
        date: newEntry.date,
        hours: newEntry.hours,
        notes: newEntry.notes,
        leave_type: newEntry.leave_type,
      });
      
      setEntries(updatedEntries);
      setIsAddingEntry(false);
      setSelectedDate(null);
      
      toast({
        title: "Entry saved",
        description: "Your timesheet entry has been saved",
      });
      
    } catch (error: any) {
      console.error("Error saving timesheet entry:", error);
      toast({
        variant: "destructive",
        title: "Failed to save entry",
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelEntry = () => {
    setIsAddingEntry(false);
    setSelectedDate(null);
  };
  
  // Generate calendar grid with padding days
  const calendarDays = () => {
    const days = [];
    const startDay = new Date(monthStart);
    startDay.setDate(startDay.getDate() - startDay.getDay()); // Start from Sunday
    
    const endDay = new Date(monthEnd);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay())); // End on Saturday
    
    const daysArray = eachDayOfInterval({ start: startDay, end: endDay });
    
    return daysArray.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return (
        <Day
          key={dateStr}
          date={day}
          isCurrentMonth={isSameMonth(day, currentMonth)}
          entries={entries[dateStr]}
          onSelect={handleDateSelect}
        />
      );
    });
  };
  
  return (
    <div className="space-y-4">
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      )}
      
      <div className="grid grid-cols-7 gap-px">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div 
            key={day} 
            className="p-2 text-center font-medium bg-blue-50 text-blue-800"
          >
            {day}
          </div>
        ))}
        {calendarDays()}
      </div>
      
      {isAddingEntry && selectedDate && (
        <Card className="p-4 mt-4 border-blue-200">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-blue-600" />
            Add Entry for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={currentEntry.hours}
                  onChange={(e) => setCurrentEntry({
                    ...currentEntry,
                    hours: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leave-type">Leave Type (Optional)</Label>
                <select
                  id="leave-type"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={currentEntry.leave_type || ''}
                  onChange={(e) => setCurrentEntry({
                    ...currentEntry,
                    leave_type: e.target.value || null,
                    hours: e.target.value ? 8 : currentEntry.hours // Default to 8 hours for leave
                  })}
                >
                  <option value="">Not Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Public Holiday">Public Holiday</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="What did you work on today?"
                value={currentEntry.notes || ''}
                onChange={(e) => setCurrentEntry({
                  ...currentEntry,
                  notes: e.target.value
                })}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancelEntry}>
                Cancel
              </Button>
              <Button onClick={handleSaveEntry} disabled={loading}>
                {loading ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <div className="mt-4 flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-50 border border-gray-200"></div>
          <span className="text-xs text-gray-500">Weekend</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 border border-gray-200"></div>
          <span className="text-xs text-gray-500">Work Entry</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-purple-100 border border-gray-200"></div>
          <span className="text-xs text-gray-500">Leave</span>
        </div>
      </div>
    </div>
  );
};

export default TimesheetCalendar;
