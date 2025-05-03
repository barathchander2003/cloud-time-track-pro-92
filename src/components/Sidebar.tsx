
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Sidebar as SidebarComponent, 
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { 
  Calendar, 
  User, 
  Users, 
  FileText, 
  Clock, 
  Settings, 
  Database, 
  ChartBar, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [role] = useState<"admin" | "hr" | "manager">("admin");

  const menuItems = [
    {
      title: "Dashboard",
      icon: ChartBar,
      href: "/",
      roles: ["admin", "hr", "manager"]
    },
    {
      title: "Employees",
      icon: Users,
      href: "/employees",
      roles: ["admin", "hr"]
    },
    {
      title: "Timesheets",
      icon: Calendar,
      href: "/timesheets",
      roles: ["admin", "hr", "manager"]
    },
    {
      title: "Approvals",
      icon: Clock,
      href: "/approvals",
      roles: ["admin", "hr", "manager"]
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/documents",
      roles: ["admin", "hr"]
    },
    {
      title: "Reports",
      icon: Database,
      href: "/reports",
      roles: ["admin", "hr", "manager"]
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      roles: ["admin"]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(role)
  );

  return (
    <SidebarComponent>
      <SidebarHeader className="py-6 px-4 flex items-center justify-center border-b">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-brand-600" />
          <span className="text-xl font-bold text-brand-600">TimeTrack</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.href} 
                      className={({ isActive }) => 
                        cn(
                          "flex items-center gap-3 rounded-md",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">System Admin</p>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};

export default Sidebar;
