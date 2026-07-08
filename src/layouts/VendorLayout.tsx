import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/vendor/Sidebar';
import { Header } from '@/components/vendor/Header';
import { MobileNav } from '@/components/vendor/MobileNav';
import { useSidebarContext } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function VendorLayout() {
  const { isCollapsed } = useSidebarContext();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
