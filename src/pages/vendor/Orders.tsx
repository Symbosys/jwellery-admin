import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye,
  Printer,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const orders = [
  {
    id: 'ORD-2024-7842',
    customer: { name: 'John Smith', email: 'john@email.com' },
    items: [
      { name: 'Wireless Headphones Pro', qty: 1, price: 129.99 },
      { name: 'USB-C Cable', qty: 2, price: 14.99 },
    ],
    total: 159.97,
    status: 'processing',
    payment: 'paid',
    date: '2024-01-15 14:32',
    address: '123 Main St, New York, NY 10001',
  },
  {
    id: 'ORD-2024-7841',
    customer: { name: 'Sarah Johnson', email: 'sarah@email.com' },
    items: [{ name: 'Smart Watch Series 5', qty: 1, price: 299.00 }],
    total: 299.00,
    status: 'shipped',
    payment: 'paid',
    date: '2024-01-15 12:18',
    address: '456 Oak Ave, Los Angeles, CA 90001',
  },
  {
    id: 'ORD-2024-7840',
    customer: { name: 'Mike Brown', email: 'mike@email.com' },
    items: [{ name: 'Bluetooth Speaker', qty: 1, price: 79.99 }],
    total: 79.99,
    status: 'delivered',
    payment: 'paid',
    date: '2024-01-14 16:45',
    address: '789 Pine Rd, Chicago, IL 60601',
  },
  {
    id: 'ORD-2024-7839',
    customer: { name: 'Emily Davis', email: 'emily@email.com' },
    items: [{ name: 'Leather Wallet', qty: 1, price: 49.99 }],
    total: 49.99,
    status: 'pending',
    payment: 'pending',
    date: '2024-01-14 11:22',
    address: '321 Elm St, Houston, TX 77001',
  },
  {
    id: 'ORD-2024-7838',
    customer: { name: 'Alex Wilson', email: 'alex@email.com' },
    items: [{ name: 'Mechanical Keyboard', qty: 1, price: 159.00 }],
    total: 159.00,
    status: 'cancelled',
    payment: 'refunded',
    date: '2024-01-13 09:15',
    address: '654 Maple Dr, Phoenix, AZ 85001',
  },
];

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', class: 'badge-warning' },
  processing: { icon: Package, label: 'Processing', class: 'badge-info' },
  shipped: { icon: Truck, label: 'Shipped', class: 'badge-info' },
  delivered: { icon: CheckCircle, label: 'Delivered', class: 'badge-success' },
  cancelled: { icon: XCircle, label: 'Cancelled', class: 'badge-destructive' },
};

export default function Orders() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handlePrintLabel = (orderId: string) => {
    toast({ title: 'Printing Label', description: `Shipping label for ${orderId} is being prepared` });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Export</Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = orders.filter(o => o.status === key).length;
          return (
            <div key={key} className="bg-card border border-border rounded-xl p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", config.class.replace('badge-', 'bg-').replace('-foreground', '/10'))}>
                  <config.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-xl p-4 shadow-soft"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-10" />
          </div>
          <div className="flex gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl shadow-soft overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="table-header px-5 py-3 text-left">Order ID</th>
                <th className="table-header px-5 py-3 text-left">Customer</th>
                <th className="table-header px-5 py-3 text-left hidden md:table-cell">Date</th>
                <th className="table-header px-5 py-3 text-left hidden lg:table-cell">Payment</th>
                <th className="table-header px-5 py-3 text-left">Amount</th>
                <th className="table-header px-5 py-3 text-left">Status</th>
                <th className="table-header px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
                  {orders.map((order, index) => {
                    const status = statusConfig[order.status as keyof typeof statusConfig];
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <td className="px-5 py-4">
                          <span className="font-medium text-primary">{order.id}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium">{order.customer.name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell text-sm text-muted-foreground">
                          {order.date}
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className={cn(
                            order.payment === 'paid' ? 'badge-success' : 
                            order.payment === 'pending' ? 'badge-warning' : 'badge-muted',
                            "capitalize"
                          )}>
                            {order.payment}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium">${order.total.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className={cn(status.class, "capitalize")}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewOrder(order.id); }}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePrintLabel(order.id); }}>
                                <Printer className="mr-2 h-4 w-4" /> Print Label
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewOrder(order.id); }}>
                                Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">Showing 1-5 of 2,847 orders</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
