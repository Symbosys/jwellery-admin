import { useState } from 'react';
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
import { useOrdersQuery, useCancelOrderMutation, DBOrder } from '@/api/hooks/order.hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';


const statusConfig = {
  pending: { icon: Clock, label: 'Pending', class: 'badge-warning' },
  confirmed: { icon: Clock, label: 'Confirmed', class: 'badge-info' },
  processing: { icon: Package, label: 'Processing', class: 'badge-info' },
  shipped: { icon: Truck, label: 'Shipped', class: 'badge-info' },
  delivered: { icon: CheckCircle, label: 'Delivered', class: 'badge-success' },
  cancelled: { icon: XCircle, label: 'Cancelled', class: 'badge-destructive' },
  returned: { icon: XCircle, label: 'Returned', class: 'badge-destructive' },
};

export default function Orders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: dbOrders = [] as DBOrder[], isLoading, error } = useOrdersQuery();
  const cancelOrderMutation = useCancelOrderMutation();

  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState<DBOrder | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleOpenCancelDialog = (order: DBOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderToCancel(order);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancelOrder = () => {
    if (!selectedOrderToCancel) return;
    cancelOrderMutation.mutate(selectedOrderToCancel.id, {
      onSuccess: () => {
        setIsCancelDialogOpen(false);
        setSelectedOrderToCancel(null);
        toast({
          title: 'Order Cancelled',
          description: `Order #${selectedOrderToCancel.orderNumber} has been manually cancelled and synced to Shiprocket`,
        });
      },
      onError: (err: any) => {
        toast({
          variant: 'destructive',
          title: 'Cancellation Failed',
          description: err.message || 'Failed to cancel order',
        });
      },
    });
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };


  const handlePrintLabel = (orderId: string) => {
    toast({ title: 'Printing Label', description: `Shipping label for ${orderId} is being prepared` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive font-medium">Failed to load orders: {error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  // Calculate stats based on actual DB status
  const getStatusCount = (statusKey: string) => {
    return dbOrders.filter(o => o.status.toLowerCase() === statusKey.toLowerCase()).length;
  };

  // Filter orders based on search and status
  const filteredOrders = dbOrders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.shippingName?.toLowerCase().includes(searchLower) ||
      order.shippingPhone?.includes(searchLower) ||
      order.shippingAddress?.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

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
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = getStatusCount(key);
          return (
            <div
              key={key}
              className={cn(
                "bg-card border rounded-xl p-4 shadow-soft cursor-pointer transition-colors hover:bg-muted/10",
                statusFilter === key ? "border-primary" : "border-border"
              )}
              onClick={() => setStatusFilter(key)}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg", config.class.replace('badge-', 'bg-').replace('-foreground', '/10'))}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{config.label}</span>
                </div>
                <p className="text-xl font-bold mt-1">{count}</p>
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
            <Input
              placeholder="Search orders by number, name, phone..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={statusFilter !== "all" || searchQuery !== "" ? "secondary" : "outline"}
              size="icon"
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
              }}
              title="Reset Filters"
            >
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const statusKey = order.status.toLowerCase() as keyof typeof statusConfig;
                  const status = statusConfig[statusKey] || { label: order.status, class: "badge-muted", icon: Clock };

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
                        <span className="font-medium text-primary">{order.orderNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium">{order.shippingName}</p>
                          <p className="text-xs text-muted-foreground">{order.shippingPhone}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className={cn(
                          order.paymentStatus === 'PAID' ? 'badge-success' :
                            order.paymentStatus === 'UNPAID' ? 'badge-warning' : 'badge-muted',
                          "capitalize"
                        )}>
                          {order.paymentStatus.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium">₹{Number(order.totalAmount).toFixed(2)}</td>
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePrintLabel(order.orderNumber); }}>
                              <Printer className="mr-2 h-4 w-4" /> Print Label
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewOrder(order.id); }}>
                              Update Status
                            </DropdownMenuItem>
                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => handleOpenCancelDialog(order, e)}
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Cancellation Confirmation Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manually Cancel Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel Order <strong>#{selectedOrderToCancel?.orderNumber}</strong>?
                This will restore inventory stock and cancel the order in Shiprocket.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                Keep Order
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancelOrder}
                disabled={cancelOrderMutation.isPending}
              >
                {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {dbOrders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
