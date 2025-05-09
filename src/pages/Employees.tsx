
import { useState, useEffect } from "react";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeSearch from "@/components/employees/EmployeeSearch";
import EmployeeHeader from "@/components/employees/EmployeeHeader";
import { filterEmployees } from "@/types/employee";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { session, profile } = useAuth();
  
  // Fetch employees from Supabase
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        
        // Only admins and HR can access employee data
        if (profile?.role !== 'admin' && profile?.role !== 'hr') {
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('employees')
          .select(`
            *,
            salaries (
              amount,
              currency,
              salary_type
            )
          `);
          
        if (error) {
          throw new Error(error.message);
        }
        
        setEmployees(data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast({
          variant: "destructive",
          title: "Failed to load employees",
          description: "There was an error loading employee data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, [session, profile, toast]);
  
  const filteredEmployees = filterEmployees(employees, searchTerm);

  return (
    <div className="space-y-6">
      <EmployeeHeader 
        newEmployeeOpen={newEmployeeOpen}
        setNewEmployeeOpen={setNewEmployeeOpen}
      />
      <EmployeeSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading employees...</p>
        </div>
      ) : (
        <EmployeeTable employees={filteredEmployees} />
      )}
    </div>
  );
};

export default Employees;
