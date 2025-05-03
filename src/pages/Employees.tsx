
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, User } from "lucide-react";
import NewEmployeeForm from "@/components/employees/NewEmployeeForm";

interface Employee {
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

const employees: Employee[] = [
  {
    id: "EMP001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    jobTitle: "Senior Project Manager",
    organization: "Market Cloud Ltd, London, UK",
    employmentType: "full-time",
    status: "active",
    initials: "SJ"
  },
  {
    id: "EMP002",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@example.com",
    jobTitle: "Software Engineer",
    organization: "Market Cloud Ltd, London, UK",
    employmentType: "contractor",
    status: "active",
    initials: "MC"
  },
  {
    id: "EMP003",
    firstName: "Jessica",
    lastName: "Williams",
    email: "jessica.williams@example.com",
    jobTitle: "UX Designer",
    organization: "Saas Market Cloud Software Pvt. Ltd, India",
    employmentType: "full-time",
    status: "active",
    initials: "JW"
  },
  {
    id: "EMP004",
    firstName: "David",
    lastName: "Rodriguez",
    email: "david.rodriguez@example.com",
    jobTitle: "Data Analyst",
    organization: "Market Cloud KFT, Hungary",
    employmentType: "full-time",
    status: "active",
    initials: "DR"
  },
  {
    id: "EMP005",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    jobTitle: "Product Manager",
    organization: "Market Cloud ScientiFix GmbH, Germany",
    employmentType: "contractor",
    status: "active",
    initials: "ED"
  }
];

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  
  const filteredEmployees = employees.filter(employee => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">
            Manage employee profiles and information
          </p>
        </div>
        <Dialog open={newEmployeeOpen} onOpenChange={setNewEmployeeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Complete the form to add a new employee to the system
              </DialogDescription>
            </DialogHeader>
            <NewEmployeeForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand-100 text-brand-600">
                        {employee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {employee.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{employee.id}</TableCell>
                <TableCell>{employee.jobTitle}</TableCell>
                <TableCell>
                  <div className="max-w-[300px] truncate">
                    {employee.organization}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {employee.employmentType === "full-time" ? "Full Time" : "Contractor"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline" 
                    className={`
                      ${employee.status === "active" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"}
                    `}
                  >
                    {employee.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No employees found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or add a new employee
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Employees;
