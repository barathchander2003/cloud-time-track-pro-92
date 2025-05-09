import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewEmployeeForm from "./NewEmployeeForm";

interface EmployeeHeaderProps {
  newEmployeeOpen: boolean;
  setNewEmployeeOpen: (open: boolean) => void;
}

const EmployeeHeader = ({ newEmployeeOpen, setNewEmployeeOpen }: EmployeeHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-blue-800">Employees</h2>
        <p className="text-blue-600">
          Manage your organization's workforce
        </p>
      </div>
      <Button 
        onClick={() => setNewEmployeeOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Employee
      </Button>
      
      <Dialog open={newEmployeeOpen} onOpenChange={setNewEmployeeOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-800">Add New Employee</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new employee to your organization.
            </DialogDescription>
          </DialogHeader>
          <NewEmployeeForm onClose={() => setNewEmployeeOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeHeader;
