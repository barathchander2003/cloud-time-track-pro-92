
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
import { EmployeeHeaderProps } from "@/types/employee";

const EmployeeHeader = ({ newEmployeeOpen, setNewEmployeeOpen }: EmployeeHeaderProps) => {
  const handleEmployeeCreated = () => {
    setNewEmployeeOpen(false);
    // We would refresh employee list here, but that's handled in the parent component
  };

  return (
    <Dialog open={newEmployeeOpen} onOpenChange={setNewEmployeeOpen}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-800">Add New Employee</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new employee to your organization.
          </DialogDescription>
        </DialogHeader>
        <NewEmployeeForm onClose={() => setNewEmployeeOpen(false)} onSuccess={() => handleEmployeeCreated()} />
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeHeader;
