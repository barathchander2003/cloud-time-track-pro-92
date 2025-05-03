
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Employee {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  initials: string;
  joinDate: string;
}

const recentEmployees: Employee[] = [
  {
    id: "1",
    name: "Robert Thompson",
    role: "Software Engineer",
    initials: "RT",
    joinDate: "May 1, 2025"
  },
  {
    id: "2",
    name: "Emily Davis",
    role: "Product Manager",
    initials: "ED",
    joinDate: "Apr 25, 2025"
  },
  {
    id: "3",
    name: "Aiden Wilson",
    role: "UX Designer",
    initials: "AW",
    joinDate: "Apr 20, 2025"
  }
];

const RecentEmployeesCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Employees</CardTitle>
        <CardDescription>New team members who joined recently</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEmployees.map((employee) => (
            <div 
              key={employee.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar>
                <AvatarImage src={employee.avatarUrl} />
                <AvatarFallback className="bg-brand-100 text-brand-600">
                  {employee.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.role}</p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                Joined {employee.joinDate}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentEmployeesCard;
