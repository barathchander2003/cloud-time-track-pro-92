
import { useState } from "react";
import TimesheetCalendar from "@/components/timesheets/TimesheetCalendar";
import { Button } from "@/components/ui/button";
import { Download, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Timesheets = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Timesheets</h2>
          <p className="text-muted-foreground">
            Manage and track employee time records
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Timesheet</DialogTitle>
                <DialogDescription>
                  Upload a timesheet document or spreadsheet for processing.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="timesheet-upload"
                    className="hidden"
                    accept=".xlsx,.xls,.csv,.pdf"
                  />
                  <label
                    htmlFor="timesheet-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium mb-1">
                      Drop files here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports Excel, CSV, and PDF formats
                    </p>
                  </label>
                </div>
                <Button onClick={() => setShowUploadDialog(false)}>Upload & Process</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 bg-slate-50 p-4 rounded-lg">
        <Button variant="ghost" size="icon" onClick={previousMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-xl font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <TimesheetCalendar />
    </div>
  );
};

export default Timesheets;
