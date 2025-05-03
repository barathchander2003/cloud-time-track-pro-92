
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  organization: string;
  employmentType: "full-time" | "contractor";
  status: "active" | "inactive";
  initials: string;
}

export const filterEmployees = (employees: Employee[], searchTerm: string): Employee[] => {
  return employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      fullName.includes(search) ||
      employee.email.toLowerCase().includes(search) ||
      employee.jobTitle.toLowerCase().includes(search) ||
      employee.organization.toLowerCase().includes(search) ||
      employee.id.toLowerCase().includes(search)
    );
  });
};
