import { motion } from 'framer-motion';
import { Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const orders = [
  {
    id: 'ORD-7842',
    customer: 'John Smith',
    product: 'Wireless Headphones Pro',
    amount: '$129.99',
    status: 'processing',
    date: '2 min ago',
  },
  {
    id: 'ORD-7841',
    customer: 'Sarah Johnson',
    product: 'Smart Watch Series 5',
    amount: '$299.00',
    status: 'shipped',
    date: '15 min ago',
  },
  {
    id: 'ORD-7840',
    customer: 'Mike Brown',
    product: 'Bluetooth Speaker',
    amount: '$79.99',
    status: 'delivered',
    date: '1 hour ago',
  },
  {
    id: 'ORD-7839',
    customer: 'Emily Davis',
    product: 'USB-C Hub Adapter',
    amount: '$49.99',
    status: 'pending',
    date: '2 hours ago',
  },
  {
    id: 'ORD-7838',
    customer: 'Alex Wilson',
    product: 'Mechanical Keyboard',
    amount: '$159.00',
    status: 'delivered',
    date: '3 hours ago',
  },
];

const statusStyles = {
  pending: 'badge-warning',
  processing: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-destructive',
};

export function RecentOrders() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-card border border-border rounded-xl shadow-soft overflow-hidden"
    >
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <p className="text-sm text-muted-foreground">Latest customer orders</p>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </div>

      <div className="overflow-x-auto">
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
                  <span className={cn(statusStyles[order.status as keyof typeof statusStyles], "capitalize")}>
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
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Update Status</DropdownMenuItem>
                      <DropdownMenuItem>Print Label</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
