import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { StatCard } from '@/components/vendor/StatCard';
import { SalesChart } from '@/components/vendor/SalesChart';
import { OrdersChart } from '@/components/vendor/OrdersChart';
import { AlertsPanel } from '@/components/vendor/AlertsPanel';
import { RecentOrders } from '@/components/vendor/RecentOrders';

const stats = [
  { title: 'Total Orders', value: '2,847', change: 12.5, icon: ShoppingCart },
  { title: 'Total Sales', value: '$84,254', change: 8.2, icon: DollarSign },
  { title: 'Pending Orders', value: '124', change: -3.1, icon: Clock },
  { title: 'Completed', value: '2,156', change: 15.3, icon: CheckCircle },
  { title: 'Cancelled', value: '47', change: -18.2, icon: XCircle },
  { title: 'Products Listed', value: '342', change: 5.4, icon: Package },
  { title: 'Low Stock Items', value: '18', change: 2.1, icon: AlertTriangle },
  { title: 'Return Requests', value: '12', change: -8.5, icon: RotateCcw },
];

export default function Dashboard() {
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
