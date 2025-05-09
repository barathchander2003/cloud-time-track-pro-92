
import { useState, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const Timesheets = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { session } = useAuth();

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !session?.user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file to upload",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload to Supabase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const filePath = `timesheets/${session.user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);
        
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      // Save record in documents table
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          employee_id: session.user.id,
          document_type: 'timesheet',
          file_name: fileName,
          file_path: filePath,
          uploaded_by: session.user.id
        });
        
      if (dbError) {
        throw new Error(dbError.message);
      }

      toast({
        title: "Upload successful",
        description: "Timesheet has been uploaded successfully",
      });
      setShowUploadDialog(false);
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "There was an error uploading your file",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Export current month's timesheet data
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      if (!session?.user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to export timesheet data",
        });
        return;
      }

      // Fetch timesheet data
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
        toast({
          variant: "destructive",
          title: "No data to export",
          description: "No timesheet entries found for the selected month",
        });
        return;
      }
      
      // Get entries
      const { data: entries, error: entriesError } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('timesheet_id', timesheet.id);
        
      if (entriesError) {
        throw new Error(entriesError.message);
      }
      
      // Create CSV content
      let csvContent = "Date,Hours,Type,Notes\n";
      
      entries.forEach(entry => {
        const formattedDate = format(new Date(entry.date), "yyyy-MM-dd");
        const escapedNotes = entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : '';
        csvContent += `${formattedDate},${entry.hours},${entry.leave_type},${escapedNotes}\n`;
      });
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Timesheet-${format(currentMonth, 'yyyy-MM')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Timesheet data has been exported",
      });
      
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error.message || "There was an error exporting your data",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-blue-800">Timesheets</h2>
          <p className="text-blue-600">
            Manage and track employee time records
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Timesheet</DialogTitle>
                <DialogDescription>
                  Upload a timesheet document or spreadsheet for processing.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-300 transition-colors">
                  <input
                    type="file"
                    id="timesheet-upload"
                    className="hidden"
                    accept=".xlsx,.xls,.csv,.pdf"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="timesheet-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-10 w-10 text-blue-500 mb-2" />
                    <p className="text-sm font-medium mb-1">
                      {selectedFile ? selectedFile.name : "Drop files here or click to browse"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports Excel, CSV, and PDF formats
                    </p>
                  </label>
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isUploading ? "Uploading..." : "Upload & Process"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <Button variant="ghost" size="icon" onClick={previousMonth} className="hover:bg-blue-50 hover:text-blue-600">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-xl font-medium text-gray-800">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-blue-50 hover:text-blue-600">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <TimesheetCalendar />
    </div>
  );
};

export default Timesheets;
