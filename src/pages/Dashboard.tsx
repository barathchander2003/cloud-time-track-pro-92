
import StatsCard from "@/components/dashboard/StatsCard";
import ApprovalRequestsCard from "@/components/dashboard/ApprovalRequestsCard";
import TimeOffCard from "@/components/dashboard/TimeOffCard";
import RecentEmployeesCard from "@/components/dashboard/RecentEmployeesCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import { Clock, Calendar, User, FileText, Check } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the TimeTrack HR system dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Employees"
          value="256"
          icon={User}
          iconColor="text-blue-600"
          iconBackground="bg-blue-100"
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          title="Pending Approvals"
          value="12"
          icon={Clock}
          iconColor="text-amber-600"
          iconBackground="bg-amber-100"
        />
        <StatsCard
          title="Approved Timesheets"
          value="185"
          icon={Check}
          iconColor="text-green-600"
          iconBackground="bg-green-100"
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Total Documents"
          value="847"
          icon={FileText}
          iconColor="text-violet-600"
          iconBackground="bg-violet-100"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ApprovalRequestsCard />
        <div className="space-y-6">
          <TimeOffCard />
          <RecentEmployeesCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ActivityCard />
      </div>
    </div>
  );
};

export default Dashboard;
