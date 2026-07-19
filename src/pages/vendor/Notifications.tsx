import { motion } from 'framer-motion';
import {
  Bell,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const notifications = [
  {
    id: 1,
    type: 'order',
    icon: ShoppingCart,
    title: 'New Order Received',
    description: 'Order #ORD-7842 for Wireless Headphones Pro',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'stock',
    icon: AlertTriangle,
    title: 'Low Stock Alert',
    description: 'Premium Leather Wallet is running low (5 units left)',
    time: '15 minutes ago',
    read: false,
  },
  {
    id: 3,
    type: 'payment',
    icon: DollarSign,
    title: 'Payment Received',
    description: '₹299.00 received for order #ORD-7841',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 4,
    type: 'info',
    icon: Info,
    title: 'Product Approved',
    description: 'Your product "Smart Watch Series 5" has been approved',
    time: '3 hours ago',
    read: true,
  },
  {
    id: 5,
    type: 'order',
    icon: Package,
    title: 'Order Delivered',
    description: 'Order #ORD-7838 has been delivered successfully',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 6,
    type: 'success',
    icon: CheckCircle,
    title: 'Payout Completed',
    description: '₹2,500.00 has been transferred to your bank account',
    time: 'Yesterday',
    read: true,
  },
];

const typeStyles = {
  order: 'bg-primary/10 text-primary',
  stock: 'bg-warning/10 text-warning',
  payment: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
};

export default function Notifications() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Check className="w-4 h-4" />
            Mark All Read
          </Button>
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </motion.div>

      {/* Notification Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        <Button variant="secondary" size="sm">All</Button>
        <Button variant="ghost" size="sm">Orders</Button>
        <Button variant="ghost" size="sm">Payments</Button>
        <Button variant="ghost" size="sm">Alerts</Button>
        <Button variant="ghost" size="sm">System</Button>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl shadow-soft overflow-hidden"
      >
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
            className={cn(
              "flex items-start gap-4 p-4 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/30",
              !notification.read && "bg-primary/5"
            )}
          >
            <div className={cn(
              "p-2.5 rounded-xl flex-shrink-0",
              typeStyles[notification.type as keyof typeof typeStyles]
            )}>
              <notification.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={cn("font-medium", !notification.read && "text-foreground")}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {notification.description}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
