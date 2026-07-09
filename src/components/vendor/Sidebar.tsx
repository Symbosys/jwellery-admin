import { useState } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Layers,
  Users,
  Megaphone,
  ChevronDown,
  MessageSquare,
  BarChart3,
  Wallet,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Store,
  X,
  Boxes,
  BookOpen,
} from "lucide-react";
import { useSidebarContext } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

interface NavSubItem {
  label: string;
  path: string;
}

interface NavItem {
  icon: any;
  label: string;
  path?: string;
  subItems?: NavSubItem[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Package, label: "Products", path: "/products" },
  { icon: Boxes, label: "Inventory", path: "/inventory" },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  { icon: FolderTree, label: "Categories", path: "/categories" },
  { icon: Layers, label: "Subcategories", path: "/subcategories" },
  { icon: Store, label: "Brands", path: "/brands" },
  { 
    icon: Users, 
    label: "Customers", 
    subItems: [
      { label: "Customers", path: "/customers/list" },
      { label: "Reviews", path: "/customers/reviews" }
    ] 
  },
  { 
    icon: Megaphone, 
    label: "Marketing", 
    subItems: [
      { label: "Coupons", path: "/marketing/coupons" },
      { label: "Banners", path: "/marketing/banners" },
      { label: "Offers", path: "/marketing/offers" }
    ] 
  },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Wallet, label: "Payments", path: "/payments" },
  { icon: BookOpen, label: "Blogs", path: "/blogs" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } =
    useSidebarContext();
  const location = useLocation();

  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    navItems.forEach(item => {
      if (item.subItems) {
        const isActive = item.subItems.some(sub => location.pathname === sub.path);
        initialState[item.label] = isActive;
      }
    });
    return initialState;
  });

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleParentClick = (item: NavItem) => {
    if (isCollapsed) {
      toggleCollapsed();
      setOpenSubMenus(prev => ({ ...prev, [item.label]: true }));
    } else {
      toggleSubMenu(item.label);
    }
  };

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
          "fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-all duration-300",
          "lg:sticky lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-[72px]" : "w-64",
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
              if (item.subItems) {
                const isOpen = openSubMenus[item.label] || false;
                const isSubActive = item.subItems.some(sub => location.pathname === sub.path);
                
                return (
                  <li key={item.label} className="space-y-1">
                    <button
                      onClick={() => handleParentClick(item)}
                      className={cn(
                        "nav-link w-full text-left flex items-center justify-between",
                        isSubActive ? "nav-link-active" : "nav-link-inactive"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("w-5 h-5 flex-shrink-0", isSubActive && "text-primary")} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown className={cn(
                          "w-4 h-4 text-sidebar-foreground/55 transition-transform duration-250",
                          isOpen && "rotate-180"
                        )} />
                      )}
                    </button>
                    
                    {isOpen && !isCollapsed && (
                      <motion.ul 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-9 space-y-1"
                      >
                        {item.subItems.map((sub) => {
                          const isSubItemActive = location.pathname === sub.path;
                          return (
                            <li key={sub.path}>
                              <NavLink
                                to={sub.path}
                                onClick={closeMobile}
                                className={cn(
                                  "nav-link text-xs py-1.5",
                                  isSubItemActive ? "nav-link-active font-semibold" : "nav-link-inactive"
                                )}
                              >
                                {sub.label}
                              </NavLink>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </li>
                );
              }

              // Normal link
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path || "/"}
                    onClick={closeMobile}
                    className={cn(
                      "nav-link",
                      isActive ? "nav-link-active" : "nav-link-inactive",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive && "text-primary",
                      )}
                    />
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
