import { motion } from 'framer-motion';
import { Eye, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAdminDashboardRecentOrdersQuery } from '@/api/hooks/admin.hooks';
import { Link } from 'react-router-dom';

const statusStyles: Record<string, string> = {
  pending: 'badge-warning',
  processing: 'badge-info',
  shipped: 'badge-info',
  confirmed: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-destructive',
  returned: 'badge-destructive',
};

export function RecentOrders() {
  const { data: orders = [], isLoading } = useAdminDashboardRecentOrdersQuery();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-card border border-border rounded-xl shadow-soft overflow-hidden min-h-[380px] flex flex-col justify-between"
    >
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <p className="text-sm text-muted-foreground">Latest customer orders</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/orders">View All</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[250px]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[250px] text-muted-foreground text-sm">
          No orders found.
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="table-header px-5 py-3 text-left">Order ID</th>
                <th className="table-header px-5 py-3 text-left">Customer</th>
                <th className="table-header px-5 py-3 text-left hidden md:table-cell">Product</th>
                <th className="table-header px-5 py-3 text-left">Amount</th>
                <th className="table-header px-5 py-3 text-left">Status</th>
                <th className="table-header px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-medium text-primary">{order.id}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-sm truncate max-w-[200px]">{order.product}</p>
                  </td>
                  <td className="px-5 py-4 font-medium">{order.amount}</td>
                  <td className="px-5 py-4">
                    <span className={cn(statusStyles[order.status] || "badge-warning", "capitalize")}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/orders`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

