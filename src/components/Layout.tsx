
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { InactivityWarning } from "@/components/InactivityWarning";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto bg-slate-50">
            {children}
          </main>
        </div>
      </div>
      <InactivityWarning />
    </SidebarProvider>
  );
};

export default Layout;
