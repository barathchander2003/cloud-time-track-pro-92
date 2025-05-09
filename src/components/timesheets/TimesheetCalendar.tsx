
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isValid } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

// Define the leave types according to the specification
const leaveTypes = [
  { value: "work", label: "Work Day" },
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "personal", label: "Personal Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "holiday", label: "Public Holiday" },
];

// Initial timesheet entries state
const initialTimeEntries: Record<string, { hours: number; leaveType: string; notes: string }> = {};

const TimesheetCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [timeEntries, setTimeEntries] = useState(initialTimeEntries);
  const [currentHours, setCurrentHours] = useState<number>(8);
  const [currentLeaveType, setCurrentLeaveType] = useState<string>("work");
  const [currentNotes, setCurrentNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState("entry");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timesheetId, setTimesheetId] = useState<string | null>(null);
  const { toast } = useToast();
  const { session } = useAuth();
  
  // Format date key for timeEntries object - with safety check
  const formatDateKey = (date: Date | undefined) => {
    // Ensure the date is valid before formatting
    if (!date || !isValid(date)) {
      console.error("Invalid date provided to formatDateKey", date);
      return format(new Date(), "yyyy-MM-dd"); // Fallback to current date
    }
    return format(date, "yyyy-MM-dd");
  };
  
  // Get all days in the current month for the summary view
  const daysInMonth = selectedDate
    ? eachDayOfInterval({
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate),
      })
    : [];

  // Load timesheet entries from Supabase when month changes
  const loadTimeEntries = async () => {
    if (!session?.user) return;
    
    try {
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      
      // If using demo user, provide mock data
      if (session.user.id === "demo-user-id") {
        console.log("Using demo data for timesheet");
        // Mock data for demonstration
        const mockEntries = {
          [format(new Date(year, monthNum - 1, 10), "yyyy-MM-dd")]: {
            hours: 8,
            leaveType: "work",
            notes: "Regular work day"
          },
          [format(new Date(year, monthNum - 1, 15), "yyyy-MM-dd")]: {
            hours: 8,
            leaveType: "annual",
            notes: "Annual leave"
          },
          [format(new Date(year, monthNum - 1, 20), "yyyy-MM-dd")]: {
            hours: 8,
            leaveType: "sick",
            notes: "Sick leave"
          }
        };
        setTimeEntries(mockEntries);
        setTimesheetId("demo-timesheet-id");
        return;
      }
      
      // First check if there's a timesheet for this month
      const { data: timesheetData, error: timesheetError } = await supabase
        .from('timesheets')
        .select('id')
        .eq('employee_id', session.user.id)
        .eq('year', year)
        .eq('month', monthNum)
        .maybeSingle();
        
      if (timesheetError) {
        console.error("Error fetching timesheet:", timesheetError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load timesheet data"
        });
        return;
      }
      
      if (!timesheetData) {
        // Create a new timesheet
        const { data: newTimesheetData, error: newTimesheetError } = await supabase
          .from('timesheets')
          .insert({
            employee_id: session.user.id,
            year: year,
            month: monthNum,
            status: 'draft'
          })
          .select('id')
          .single();
          
        if (newTimesheetError) {
          console.error("Error creating timesheet:", newTimesheetError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create new timesheet"
          });
          return;
        }
        
        // Empty entries for a new timesheet
        setTimeEntries({});
        setTimesheetId(newTimesheetData.id);
        return;
      }
      
      // Store timesheet ID
      setTimesheetId(timesheetData.id);
      
      // Fetch entries for existing timesheet
      const { data: entriesData, error: entriesError } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('timesheet_id', timesheetData.id);
        
      if (entriesError) {
        console.error("Error fetching timesheet entries:", entriesError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load timesheet entries"
        });
        return;
      }
      
      // Convert DB entries to our local format
      const entries = entriesData.reduce((acc, entry) => {
        // Validate the date before formatting
        const entryDate = new Date(entry.date);
        if (!isValid(entryDate)) {
          console.error("Invalid date in entry:", entry);
          return acc;
        }
        
        const dateKey = format(entryDate, "yyyy-MM-dd");
        acc[dateKey] = {
          hours: entry.hours || 0,
          leaveType: entry.leave_type || "work",
          notes: entry.notes || "",
        };
        return acc;
      }, {} as Record<string, { hours: number; leaveType: string; notes: string }>);
      
      setTimeEntries(entries);
    } catch (error) {
      console.error("Error loading timesheet data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load timesheet data"
      });
    }
  };
  
  // Effect to load entries when month changes
  useEffect(() => {
    loadTimeEntries();
  }, [month, session]);

  // Effect to update form when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const dateKey = formatDateKey(selectedDate);
      const entry = timeEntries[dateKey];
      
      if (entry) {
        setCurrentHours(entry.hours);
        setCurrentLeaveType(entry.leaveType);
        setCurrentNotes(entry.notes);
      } else {
        // Default values for new entry
        setCurrentHours(8);
        setCurrentLeaveType("work");
        setCurrentNotes("");
      }
    }
  }, [selectedDate, timeEntries]);
  
  // Save the current entry to Supabase
  const saveEntry = async () => {
    if (!session?.user || !selectedDate) return;
    
    try {
      setIsSubmitting(true);
      const dateKey = formatDateKey(selectedDate);
      
      // If using demo user, just update local state
      if (session.user.id === "demo-user-id") {
        console.log("Demo user - updating local timesheet state only");
        setTimeEntries((prev) => ({
          ...prev,
          [dateKey]: {
            hours: currentHours,
            leaveType: currentLeaveType,
            notes: currentNotes,
          },
        }));
        toast({
          title: "Entry saved",
          description: "Your timesheet entry has been saved (demo mode).",
        });
        setIsSubmitting(false);
        return;
      }
      
      // If we don't have a timesheet ID yet, we need to create one
      if (!timesheetId) {
        const year = selectedDate.getFullYear();
        const monthNum = selectedDate.getMonth() + 1;
        
        // Create a new timesheet
        const { data: newTimesheet, error: createError } = await supabase
          .from('timesheets')
          .insert({
            employee_id: session.user.id,
            year: year,
            month: monthNum,
            status: 'draft'
          })
          .select('id')
          .single();
          
        if (createError) {
          throw new Error("Error creating timesheet: " + createError.message);
        }
        
        setTimesheetId(newTimesheet.id);
      }
      
      // Check if entry exists
      const { data: existingEntry, error: checkError } = await supabase
        .from('timesheet_entries')
        .select('id')
        .eq('timesheet_id', timesheetId)
        .eq('date', dateKey)
        .maybeSingle();
        
      if (checkError) {
        throw new Error("Error checking existing entry: " + checkError.message);
      }
      
      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('timesheet_entries')
          .update({
            hours: currentHours,
            leave_type: currentLeaveType,
            notes: currentNotes
          })
          .eq('id', existingEntry.id);
          
        if (updateError) {
          throw new Error("Error updating entry: " + updateError.message);
        }
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
          .from('timesheet_entries')
          .insert({
            timesheet_id: timesheetId,
            date: dateKey,
            hours: currentHours,
            leave_type: currentLeaveType,
            notes: currentNotes
          });
          
        if (insertError) {
          throw new Error("Error inserting entry: " + insertError.message);
        }
      }
      
      // Update local state
      setTimeEntries((prev) => ({
        ...prev,
        [dateKey]: {
          hours: currentHours,
          leaveType: currentLeaveType,
          notes: currentNotes,
        },
      }));
      
      toast({
        title: "Entry saved",
        description: "Your timesheet entry has been saved.",
      });
      
    } catch (error: any) {
      console.error("Error saving entry:", error);
      toast({
        variant: "destructive",
        title: "Failed to save entry",
        description: error.message || "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Submit the timesheet for approval
  const submitTimesheet = async () => {
    if (!session?.user) return;
    
    try {
      setIsSubmitting(true);
      
      // If using demo user, just simulate success
      if (session.user.id === "demo-user-id") {
        setTimeout(() => {
          toast({
            title: "Timesheet submitted",
            description: "Your timesheet has been submitted for approval (demo mode).",
          });
          setIsSubmitting(false);
        }, 1000);
        return;
      }
      
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      
      // Make sure we have a timesheetId
      if (!timesheetId) {
        throw new Error("No timesheet found to submit");
      }
      
      // Update timesheet status
      const { error } = await supabase
        .from('timesheets')
        .update({
          status: 'pending',
          submitted_at: new Date().toISOString()
        })
        .eq('id', timesheetId);
        
      if (error) {
        throw new Error("Error submitting timesheet: " + error.message);
      }
      
      toast({
        title: "Timesheet submitted",
        description: "Your timesheet has been submitted for approval.",
      });
      
    } catch (error: any) {
      console.error("Error submitting timesheet:", error);
      toast({
        variant: "destructive",
        title: "Failed to submit timesheet",
        description: error.message || "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate total hours for the current month
  const totalHours = Object.values(timeEntries).reduce((sum, entry) => sum + entry.hours, 0);
  
  // Get leave type counts for the summary
  const leaveTypeCounts = Object.values(timeEntries).reduce((counts, entry) => {
    const type = entry.leaveType;
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  // Function to determine day status for styling calendar days
  const getDayStatus = (date: Date) => {
    // Ensure date is valid before proceeding
    if (!date || !isValid(date)) {
      console.error("Invalid date provided to getDayStatus", date);
      return "";
    }
    
    const dateKey = formatDateKey(date);
    const entry = timeEntries[dateKey];
    
    if (!entry) return "";
    
    switch (entry.leaveType) {
      case "work":
        return "bg-blue-100 text-blue-800";
      case "annual":
        return "bg-green-100 text-green-800";
      case "sick":
        return "bg-red-100 text-red-800";
      case "personal":
        return "bg-purple-100 text-purple-800";
      case "unpaid":
        return "bg-gray-100 text-gray-800";
      case "holiday":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-blue-800">Monthly Timesheet</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={month}
                  onMonthChange={(newMonth) => {
                    setMonth(newMonth);
                    loadTimeEntries();
                  }}
                  className="p-3 pointer-events-auto border rounded-md shadow-sm"
                  modifiersClassNames={{
                    selected: "bg-primary text-primary-foreground",
                  }}
                  modifiers={{
                    customModifier: (date) => {
                      const dateKey = formatDateKey(date);
                      return !!timeEntries[dateKey];
                    }
                  }}
                  components={{
                    Day: (props) => {
                      const status = getDayStatus(props.date);
                      return (
                        <div
                          onClick={() => props.onSelect?.(props.date)}
                          className={`${status} h-9 w-9 p-0 font-normal aria-selected:opacity-100`}
                        >
                          {props.date.getDate()}
                        </div>
                      );
                    }
                  }}
                />
              </div>
              
              <div className="flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="entry">Time Entry</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="entry" className="space-y-4 pt-4">
                    {selectedDate ? (
                      <>
                        <div>
                          <h3 className="font-medium mb-2">
                            {format(selectedDate, "EEEE, MMMM d, yyyy")}
                          </h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Type</label>
                              <Select
                                value={currentLeaveType}
                                onValueChange={setCurrentLeaveType}
                              >
                                <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {leaveTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Hours</label>
                              <input
                                type="number"
                                value={currentHours}
                                onChange={(e) => setCurrentHours(Number(e.target.value))}
                                min="0"
                                max="24"
                                step="0.5"
                                className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Notes</label>
                              <textarea
                                value={currentNotes}
                                onChange={(e) => setCurrentNotes(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                              />
                            </div>
                            
                            <Button 
                              onClick={saveEntry}
                              disabled={isSubmitting}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                              {isSubmitting ? "Saving..." : "Save Entry"}
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        Please select a date on the calendar
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="summary" className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">
                          {format(month, "MMMM yyyy")}
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex justify-between p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md">
                            <span>Total Hours Logged:</span>
                            <span className="font-medium">{totalHours} hrs</span>
                          </div>
                          {Object.entries(leaveTypeCounts).map(([type, count]) => {
                            const leaveType = leaveTypes.find(lt => lt.value === type);
                            return (
                              <div key={type} className="flex justify-between p-2 bg-gray-50 rounded-md">
                                <span>{leaveType?.label || type}:</span>
                                <span className="font-medium">{count} day{count !== 1 ? 's' : ''}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={submitTimesheet}
                        disabled={isSubmitting}
                        variant="outline"
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Monthly Timesheet"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-purple-800">Monthly Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-yellow-50 text-yellow-800 shadow-sm">
                <h3 className="font-medium mb-2">Pending Submission</h3>
                <p className="text-sm">
                  Your timesheet for {format(month, "MMMM yyyy")} needs to be submitted by the end of the month.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Legend</h3>
                <div className="grid grid-cols-2 gap-2">
                  {leaveTypes.map((type) => (
                    <div key={type.value} className="flex items-center">
                      <div className={`w-4 h-4 rounded mr-2 ${
                        type.value === "work" ? "bg-blue-100" :
                        type.value === "annual" ? "bg-green-100" :
                        type.value === "sick" ? "bg-red-100" :
                        type.value === "personal" ? "bg-purple-100" :
                        type.value === "unpaid" ? "bg-gray-100" :
                        "bg-yellow-100"
                      }`}></div>
                      <span className="text-xs">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Previous Submissions</h3>
                <div className="space-y-2">
                  <div className="p-2 border rounded-md flex items-center justify-between shadow-sm hover:bg-gray-50">
                    <span className="text-sm">April 2025</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Approved</span>
                  </div>
                  <div className="p-2 border rounded-md flex items-center justify-between shadow-sm hover:bg-gray-50">
                    <span className="text-sm">March 2025</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimesheetCalendar;
