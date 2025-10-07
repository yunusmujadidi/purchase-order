import { Navbar } from "@/components/layout/navbar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "@/components/auth/session-provider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Navbar />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
};

export default DashboardLayout;
