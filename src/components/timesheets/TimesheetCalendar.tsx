
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

type DayEntry = {
  type: "work" | "leave" | "holiday" | "weekend" | "none";
  hours?: number;
  note?: string;
}

const TimesheetCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<Record<string, DayEntry>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEntryType, setSelectedEntryType] = useState<"work" | "leave" | "holiday">("work");
  const [hours, setHours] = useState<string>("8");
  const [note, setNote] = useState<string>("");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEntryForDay = (day: Date): DayEntry => {
    const dateKey = format(day, "yyyy-MM-dd");
    
    if (entries[dateKey]) {
      return entries[dateKey];
    }
    
    if (isWeekend(day)) {
      return { type: "weekend" };
    }
    
    return { type: "none" };
  };

  const saveEntry = () => {
    if (!selectedDay) return;
    
    const newEntries = { ...entries };
    newEntries[selectedDay] = {
      type: selectedEntryType,
      hours: selectedEntryType === "work" ? Number(hours) : undefined,
      note: note || undefined
    };
    
    setEntries(newEntries);
    setSelectedDay(null);
    setSelectedEntryType("work");
    setHours("8");
    setNote("");
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case "work": return "bg-blue-500";
      case "leave": return "bg-amber-500";
      case "holiday": return "bg-green-500";
      case "weekend": return "bg-gray-200";
      default: return "";
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case "work": return "Work";
      case "leave": return "Leave";
      case "holiday": return "Holiday";
      case "weekend": return "Weekend";
      default: return "Not Set";
    }
  };

  const totalHours = Object.values(entries)
    .filter(entry => entry.type === "work" && entry.hours)
    .reduce((sum, entry) => sum + (entry.hours || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-brand-600" />
            <CardTitle>Monthly Timesheet</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={prevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <Badge variant="outline" className="text-brand-600">
              Total Hours: {totalHours}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div 
                key={day} 
                className="text-center font-medium py-2 text-sm"
              >
                {day}
              </div>
            ))}
            
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div key={`empty-start-${index}`} className="h-24 border rounded-md bg-muted/20"></div>
            ))}
            
            {daysInMonth.map(day => {
              const dateKey = format(day, "yyyy-MM-dd");
              const entry = getEntryForDay(day);
              
              return (
                <div 
                  key={dateKey}
                  className={`h-24 border rounded-md p-2 transition-colors ${
                    !isSameMonth(day, currentDate) 
                      ? "bg-muted/20" 
                      : selectedDay === dateKey 
                      ? "ring-2 ring-brand-500" 
                      : ""
                  } hover:bg-muted/30 cursor-pointer`}
                  onClick={() => {
                    if (isSameMonth(day, currentDate) && !isWeekend(day)) {
                      setSelectedDay(dateKey);
                      const existingEntry = entries[dateKey];
                      if (existingEntry) {
                        setSelectedEntryType(existingEntry.type as "work" | "leave" | "holiday");
                        setHours(existingEntry.hours?.toString() || "8");
                        setNote(existingEntry.note || "");
                      } else {
                        setSelectedEntryType("work");
                        setHours("8");
                        setNote("");
                      }
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${
                      isWeekend(day) ? "text-muted-foreground" : ""
                    }`}>
                      {format(day, "d")}
                    </span>
                    
                    {entry.type !== "none" && (
                      <span className={`${getTypeColor(entry.type)} text-white text-xs px-1.5 py-0.5 rounded-sm`}>
                        {getTypeLabel(entry.type)}
                      </span>
                    )}
                  </div>
                  
                  {entry.type === "work" && entry.hours !== undefined && (
                    <div className="mt-1 text-xs text-right">
                      <span className="font-medium">{entry.hours} hrs</span>
                    </div>
                  )}
                  
                  {entry.note && (
                    <div className="mt-1 text-xs line-clamp-2 text-muted-foreground">
                      {entry.note}
                    </div>
                  )}
                </div>
              );
            })}
            
            {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
              <div key={`empty-end-${index}`} className="h-24 border rounded-md bg-muted/20"></div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle>Day Entry: {format(new Date(selectedDay), "PPP")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Entry Type</label>
                  <Select 
                    value={selectedEntryType} 
                    onValueChange={(value) => setSelectedEntryType(value as "work" | "leave" | "holiday")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="leave">Leave</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedEntryType === "work" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hours</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="24" 
                      value={hours} 
                      onChange={(e) => setHours(e.target.value)} 
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <Input 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  placeholder="Add a note for this day" 
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDay(null)}
                >
                  Cancel
                </Button>
                <Button onClick={saveEntry}>Save Entry</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimesheetCalendar;
