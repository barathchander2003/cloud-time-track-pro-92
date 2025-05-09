
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Edit, Trash, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Define the Employee interface to match our Supabase data structure
interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  employment_type: string;
  start_date: string;
  email: string;
  salaries?: {
    amount: number;
    currency: string;
    salary_type: string;
  }[];
}

interface EmployeeTableProps {
  employees: Employee[];
}

const EmployeeTable = ({ employees }: EmployeeTableProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEdit = (employee: Employee) => {
    // In a real app, this would navigate to an edit form
    console.log("Edit employee:", employee);
    toast({
      title: "Edit Employee",
      description: "This feature is coming soon.",
    });
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    
    try {
      // Delete employee from Supabase
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', selectedEmployee.id);
        
      if (error) throw new Error(error.message);
      
      toast({
        title: "Employee deleted",
        description: `${selectedEmployee.first_name} ${selectedEmployee.last_name} has been removed.`,
      });
      
      // Refresh page to update list
      window.location.reload();
      
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error removing the employee."
      });
    } finally {
      setConfirmDelete(false);
      setSelectedEmployee(null);
    }
  };

  const confirmDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setConfirmDelete(true);
  };

  const formatSalary = (employee: Employee) => {
    if (!employee.salaries || employee.salaries.length === 0) {
      return "Not set";
    }
    
    // Get the most recent salary
    const salary = employee.salaries[0];
    return `${salary.amount} ${salary.currency} ${salary.salary_type === 'hourly' ? '/ hour' : salary.salary_type === 'daily' ? '/ day' : '/ month'}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <>
      <div className="rounded-lg border border-gray-100 shadow-sm bg-white overflow-hidden">
        <Table>
          <TableCaption>List of all employees</TableCaption>
          <TableHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
            <TableRow>
              <TableHead className="font-bold text-blue-900">Name</TableHead>
              <TableHead className="font-bold text-blue-900">Position</TableHead>
              <TableHead className="font-bold text-blue-900">Status</TableHead>
              <TableHead className="font-bold text-blue-900">Start Date</TableHead>
              <TableHead className="font-bold text-blue-900">Salary</TableHead>
              <TableHead className="font-bold text-blue-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-blue-50/30">
                  <TableCell className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell>{employee.role || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={employee.employment_type === "fixed" ? "outline" : "secondary"}>
                      {employee.employment_type === "fixed" ? "Full-time" : "Contractor"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                      {formatDate(employee.start_date)}
                    </div>
                  </TableCell>
                  <TableCell>{formatSalary(employee)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <span className="sr-only">Open menu</span>
                          Actions <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(employee)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDeleteEmployee(employee)} className="cursor-pointer text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                          <FileText className="mr-2 h-4 w-4" />
                          View Documents
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedEmployee && `${selectedEmployee.first_name} ${selectedEmployee.last_name}`}'s
              account and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeeTable;
