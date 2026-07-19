import { motion } from 'framer-motion';
import {
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  AlertTriangle,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { StatCard } from '@/components/vendor/StatCard';
import { SalesChart } from '@/components/vendor/SalesChart';
import { OrdersChart } from '@/components/vendor/OrdersChart';
import { AlertsPanel } from '@/components/vendor/AlertsPanel';
import { RecentOrders } from '@/components/vendor/RecentOrders';
import { useAdminDashboardStatsQuery } from '@/api/hooks/admin.hooks';

export default function Dashboard() {
  const { data: statsData, isLoading } = useAdminDashboardStatsQuery();

  const stats = [
    { 
      title: 'Total Orders', 
      value: statsData ? statsData.totalOrders.value.toLocaleString() : '0', 
      change: statsData?.totalOrders.change, 
      icon: ShoppingCart 
    },
    { 
      title: 'Total Sales', 
      value: statsData ? `₹${statsData.totalSales.value.toLocaleString()}` : '₹0', 
      change: statsData?.totalSales.change, 
      icon: DollarSign 
    },
    { 
      title: 'Pending Orders', 
      value: statsData ? statsData.pendingOrders.value.toLocaleString() : '0', 
      change: statsData?.pendingOrders.change, 
      icon: Clock 
    },
    { 
      title: 'Completed', 
      value: statsData ? statsData.completedOrders.value.toLocaleString() : '0', 
      change: statsData?.completedOrders.change, 
      icon: CheckCircle 
    },
    { 
      title: 'Cancelled', 
      value: statsData ? statsData.cancelledOrders.value.toLocaleString() : '0', 
      change: statsData?.cancelledOrders.change, 
      icon: XCircle 
    },
    { 
      title: 'Products Listed', 
      value: statsData ? statsData.totalProducts.value.toLocaleString() : '0', 
      change: undefined, 
      icon: Package 
    },
    { 
      title: 'Low Stock Items', 
      value: statsData ? statsData.lowStockItems.value.toLocaleString() : '0', 
      change: undefined, 
      icon: AlertTriangle 
    },
    { 
      title: 'Return Requests', 
      value: statsData ? statsData.returnRequests.value.toLocaleString() : '0', 
      change: undefined, 
      icon: RotateCcw 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
      </motion.div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 bg-card border border-border rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading dashboard stats…</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              delay={index * 0.05}
            />
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <OrdersChart />
      </div>

      {/* Alerts & Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        <AlertsPanel />
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}

