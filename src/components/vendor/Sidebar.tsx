import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  MessageSquare,
  BarChart3,
  Wallet,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Store,
  X
} from 'lucide-react';
import { useSidebarContext } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: FolderTree, label: 'Categories', path: '/categories' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Wallet, label: 'Payments', path: '/payments' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebarContext();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 h-full bg-sidebar z-50 flex flex-col transition-all duration-300",
          "lg:relative lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-sidebar-foreground text-lg"
              >
                VendorHub
              </motion.span>
            )}
          </div>
          
          {/* Mobile Close */}
          <button
            onClick={closeMobile}
            className="lg:hidden p-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={closeMobile}
                    className={cn(
                      "nav-link",
                      isActive ? "nav-link-active" : "nav-link-inactive"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <div className="hidden lg:block p-3 border-t border-sidebar-border">
          <button
            onClick={toggleCollapsed}
            className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
