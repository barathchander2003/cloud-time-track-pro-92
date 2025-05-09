
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import EmployeeHeader from "@/components/employees/EmployeeHeader";
import EmployeeSearch from "@/components/employees/EmployeeSearch";
import EmployeeTable from "@/components/employees/EmployeeTable";
import NewEmployeeForm from "@/components/employees/NewEmployeeForm";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Define the Employee interface to match EmployeeTable.tsx
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

const Employees = () => {
  const [showNewEmployeeDialog, setShowNewEmployeeDialog] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch employees from Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        
        // Fetch employees with their latest salary information
        const { data, error } = await supabase
          .from('employees')
          .select(`
            id,
            first_name,
            last_name,
            role,
            employment_type,
            start_date,
            email,
            salaries (
              amount,
              currency,
              salary_type,
              effective_from,
              effective_to
            )
          `)
          .order('first_name', { ascending: true });
        
        if (error) throw error;
        
        // For each employee, sort their salaries to get the most recent one
        const processedEmployees = data.map((employee: any) => ({
          ...employee,
          salaries: employee.salaries ? 
            [...employee.salaries].sort((a, b) => 
              new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
            ) : []
        }));
        
        setEmployees(processedEmployees);
        setFilteredEmployees(processedEmployees);
        
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load employees data"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
  }, [toast]);
  
  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredEmployees(employees);
      return;
    }
    
    const searchTerm = query.toLowerCase();
    const filtered = employees.filter(employee => 
      employee.first_name.toLowerCase().includes(searchTerm) ||
      employee.last_name.toLowerCase().includes(searchTerm) ||
      employee.role.toLowerCase().includes(searchTerm) ||
      employee.email.toLowerCase().includes(searchTerm)
    );
    
    setFilteredEmployees(filtered);
  };
  
  // Handle successful employee creation
  const handleEmployeeCreated = () => {
    setShowNewEmployeeDialog(false);
    toast({
      title: "Success",
      description: "Employee created successfully"
    });
    
    // Refresh the employee list
    const fetchEmployees = async () => {
      try {
        // Same query as in useEffect
        const { data, error } = await supabase
          .from('employees')
          .select(`
            id,
            first_name,
            last_name,
            role,
            employment_type,
            start_date,
            email,
            salaries (
              amount,
              currency, 
              salary_type,
              effective_from,
              effective_to
            )
          `)
          .order('first_name', { ascending: true });
        
        if (error) throw error;
        
        const processedEmployees = data.map((employee: any) => ({
          ...employee,
          salaries: employee.salaries ? 
            [...employee.salaries].sort((a, b) => 
              new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
            ) : []
        }));
        
        setEmployees(processedEmployees);
        setFilteredEmployees(searchQuery ? filteredEmployees : processedEmployees);
        
      } catch (error) {
        console.error("Error refreshing employees:", error);
      }
    };
    
    fetchEmployees();
  };

  return (
    <div className="space-y-6">
      <EmployeeHeader />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <EmployeeSearch onSearch={handleSearch} />
        
        <Button 
          onClick={() => setShowNewEmployeeDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <EmployeeTable employees={filteredEmployees} />
      )}
      
      <Dialog open={showNewEmployeeDialog} onOpenChange={setShowNewEmployeeDialog}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the details of the new employee below.
            </DialogDescription>
          </DialogHeader>
          <NewEmployeeForm 
            onSuccess={handleEmployeeCreated}
            onCancel={() => setShowNewEmployeeDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
