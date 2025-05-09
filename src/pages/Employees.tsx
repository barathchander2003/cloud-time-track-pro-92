
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeHeader from "@/components/employees/EmployeeHeader";
import EmployeeSearch from "@/components/employees/EmployeeSearch";
import NewEmployeeForm from "@/components/employees/NewEmployeeForm";
import { Employee } from "@/types/employee";

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { session } = useAuth();
  const { toast } = useToast();
  
  // Fetch employees from Supabase
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Get all employees
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('last_name');
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Transform data for the table
      const employeesData = data.map(emp => ({
        id: emp.id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        role: emp.role,
        start_date: emp.start_date,
        employment_type: emp.employment_type,
        work_location: emp.work_location,
        mobile_number: emp.mobile_number,
        end_date: emp.end_date,
        employee_number: emp.employee_number
      }));
      
      setEmployees(employeesData);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast({
        variant: "destructive",
        title: "Failed to load employees",
        description: error.message || "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    if (session) {
      fetchEmployees();
    }
  }, [session]);
  
  // Filtered employees based on search
  const filteredEmployees = searchQuery 
    ? employees.filter(employee => {
        const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || 
               employee.email.toLowerCase().includes(query) ||
               employee.role.toLowerCase().includes(query) ||
               (employee.employee_number && employee.employee_number.toLowerCase().includes(query));
      })
    : employees;
    
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Handle successful employee creation
  const handleEmployeeCreated = () => {
    setNewEmployeeOpen(false);
    fetchEmployees();
    toast({
      title: "Employee created",
      description: "The employee has been added successfully."
    });
  };
  
  // Handle form cancel
  const handleCancel = () => {
    setNewEmployeeOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-blue-800">Employees</h2>
          <p className="text-blue-600">
            Manage your organization's employee records
          </p>
        </div>
        
        <Button 
          onClick={() => setNewEmployeeOpen(true)} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>
      
      <EmployeeHeader 
        newEmployeeOpen={newEmployeeOpen}
        setNewEmployeeOpen={setNewEmployeeOpen}
      />
      
      <EmployeeSearch 
        onSearch={handleSearch}
      />
      
      <EmployeeTable 
        employees={filteredEmployees} 
        loading={loading}
      />
      
      {newEmployeeOpen && (
        <NewEmployeeForm
          onClose={handleCancel}
          onSuccess={handleEmployeeCreated}
        />
      )}
    </div>
  );
};

export default Employees;
