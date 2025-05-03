
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
  id: string;
  description: string;
  timestamp: string;
}

const activities: Activity[] = [
  {
    id: "1",
    description: "Sarah Johnson submitted her April timesheet",
    timestamp: "1 hour ago"
  },
  {
    id: "2",
    description: "Michael Chen requested leave for May 10-15",
    timestamp: "3 hours ago"
  },
  {
    id: "3",
    description: "Jessica Williams uploaded a new document",
    timestamp: "5 hours ago"
  },
  {
    id: "4",
    description: "You approved David Rodriguez's timesheet",
    timestamp: "Yesterday"
  },
  {
    id: "5",
    description: "Emily Davis joined the team",
    timestamp: "2 days ago"
  }
];

const ActivityCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Latest updates in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[250px] overflow-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-2">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-brand-600" />
              <div>
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
