import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/vendor/Sidebar';
import { Header } from '@/components/vendor/Header';
import { MobileNav } from '@/components/vendor/MobileNav';
import { useSidebarContext } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

export function VendorLayout() {
  const { isCollapsed } = useSidebarContext();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}
