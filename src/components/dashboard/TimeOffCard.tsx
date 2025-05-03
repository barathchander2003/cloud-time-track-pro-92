
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TimeOffCategory {
  name: string;
  used: number;
  total: number;
  color: string;
}

const timeOffCategories: TimeOffCategory[] = [
  {
    name: "Annual Leave",
    used: 8,
    total: 25,
    color: "bg-brand-600"
  },
  {
    name: "Sick Leave",
    used: 3,
    total: 12,
    color: "bg-amber-500"
  },
  {
    name: "Personal Leave",
    used: 1,
    total: 5,
    color: "bg-violet-500"
  }
];

const TimeOffCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Time Off Overview</CardTitle>
        <CardDescription>Leave utilization in the current year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeOffCategories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  {category.used} / {category.total} days
                </span>
              </div>
              <Progress 
                value={(category.used / category.total) * 100} 
                className="h-2"
                indicatorClassName={category.color}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeOffCard;
