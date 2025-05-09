
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  start_date: string;
  employment_type: string;
  work_location?: string;
  mobile_number?: string;
  end_date?: string | null;
  employee_number?: string | null;
}

export interface EmployeeHeaderProps {
  newEmployeeOpen: boolean;
  setNewEmployeeOpen: (open: boolean) => void;
}

export interface EmployeeSearchProps {
  onSearch: (query: string) => void;
}
