
import TimesheetCalendar from "@/components/timesheets/TimesheetCalendar";

const Timesheets = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Timesheets</h2>
        <p className="text-muted-foreground">
          Manage and track employee time records
        </p>
      </div>

      <TimesheetCalendar />
    </div>
  );
};

export default Timesheets;
