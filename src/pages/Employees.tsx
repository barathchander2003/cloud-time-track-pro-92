
import { useState } from "react";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeSearch from "@/components/employees/EmployeeSearch";
import EmployeeHeader from "@/components/employees/EmployeeHeader";
import { employees } from "@/data/employeesData";
import { filterEmployees } from "@/types/employee";

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  
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
      <EmployeeTable employees={filteredEmployees} />
    </div>
  );
};

export default Employees;
