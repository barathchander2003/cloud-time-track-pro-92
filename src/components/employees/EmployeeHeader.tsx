
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewEmployeeForm from "@/components/employees/NewEmployeeForm";

interface EmployeeHeaderProps {
  newEmployeeOpen: boolean;
  setNewEmployeeOpen: (open: boolean) => void;
}

const EmployeeHeader = ({ newEmployeeOpen, setNewEmployeeOpen }: EmployeeHeaderProps) => {
  return (
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
  );
};

export default EmployeeHeader;
