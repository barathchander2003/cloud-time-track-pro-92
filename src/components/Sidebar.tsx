
import { NavLink, useNavigate } from "react-router-dom";
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
  Clock, 
  Settings, 
  Database, 
  ChartBar, 
  LogOut,
  FileText,
  Users,
  CheckSquare,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const role = profile?.role || "user";

  const menuItems = [
    {
      title: "Dashboard",
      icon: ChartBar,
      href: "/dashboard",
      roles: ["admin", "hr", "manager", "user"]
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
      roles: ["admin", "hr", "manager", "user"]
    },
    {
      title: "Approvals",
      icon: CheckSquare,
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
      icon: FileSpreadsheet,
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

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarComponent className="border-r bg-white">
      <SidebarHeader className="py-6 px-4 flex items-center justify-center border-b bg-brand-600 text-white">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6" />
          <span className="text-xl font-bold">TimeTrack</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.href} 
                      className={({ isActive }) => 
                        cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                          isActive 
                            ? "bg-brand-50 text-brand-700" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
      <SidebarFooter className="mt-auto p-4 border-t bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name[0]}${profile.last_name[0]}`
                : role.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut} 
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};

export default Sidebar;
