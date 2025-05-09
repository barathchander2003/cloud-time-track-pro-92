
import { useState } from "react";
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the leave types according to the specification
const leaveTypes = [
  { value: "work", label: "Work Day" },
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "personal", label: "Personal Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "holiday", label: "Public Holiday" },
];

// Mock data for the demo
const initialTimeEntries: Record<string, { hours: number; leaveType: string; notes: string }> = {};

const TimesheetCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [timeEntries, setTimeEntries] = useState(initialTimeEntries);
  const [currentHours, setCurrentHours] = useState<number>(8);
  const [currentLeaveType, setCurrentLeaveType] = useState<string>("work");
  const [currentNotes, setCurrentNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState("entry");
  
  // Format date key for timeEntries object
  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");
  
  // Get all days in the current month for the summary view
  const daysInMonth = selectedDate
    ? eachDayOfInterval({
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate),
      })
    : [];
  
  // Save the current entry to the timeEntries state
  const saveEntry = () => {
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    setTimeEntries((prev) => ({
      ...prev,
      [dateKey]: {
        hours: currentHours,
        leaveType: currentLeaveType,
        notes: currentNotes,
      },
    }));
    
    // Reset notes after saving
    setCurrentNotes("");
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
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Monthly Timesheet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={month}
                  onMonthChange={setMonth}
                  className="p-3 pointer-events-auto border rounded-md"
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
                    Day: ({ date, ...props }) => {
                      const status = getDayStatus(date);
                      return (
                        <div
                          {...props}
                          className={`${props.className} ${status} h-9 w-9 p-0 font-normal aria-selected:opacity-100`}
                        >
                          {date.getDate()}
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
                                <SelectTrigger>
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
                                className="w-full mt-1 px-3 py-2 border rounded-md"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Notes</label>
                              <textarea
                                value={currentNotes}
                                onChange={(e) => setCurrentNotes(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded-md"
                                rows={3}
                              />
                            </div>
                            
                            <Button onClick={saveEntry} className="w-full">
                              Save Entry
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
                          <div className="flex justify-between p-2 bg-gray-50 rounded-md">
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
                      
                      <Button variant="outline" className="w-full">
                        Submit Monthly Timesheet
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Monthly Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-yellow-50 text-yellow-800">
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
                  <div className="p-2 border rounded-md flex items-center justify-between">
                    <span className="text-sm">April 2025</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Approved</span>
                  </div>
                  <div className="p-2 border rounded-md flex items-center justify-between">
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
