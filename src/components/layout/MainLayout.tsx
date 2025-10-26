import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ModernAppSidebar } from "@/components/navigation/ModernAppSidebar";
import Navbar from "@/components/Navbar";
import { InstitutionalFooter } from "@/components/InstitutionalFooter";
import { BottomNav } from "@/components/mobile/BottomNav";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAuth } from "@/hooks/useAuth";

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export const MainLayout = ({ children, showSidebar = true }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Show sidebar only for authenticated users on desktop
  const shouldShowSidebar = showSidebar && user && !isMobile;
  
  if (!shouldShowSidebar) {
    return (
      <>
        <Navbar showSidebarTrigger={false} />
        <div className="min-h-screen pt-16 pb-20 md:pb-0">
          {children}
        </div>
        <InstitutionalFooter />
        <BottomNav />
      </>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <ModernAppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <Navbar showSidebarTrigger={true} />
          <div className="flex-1 pt-16 pb-20 md:pb-0 w-full">
            {children}
          </div>
          <InstitutionalFooter />
          <BottomNav />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
