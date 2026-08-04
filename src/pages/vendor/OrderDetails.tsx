import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  User,
  Phone,
  CreditCard,
  Printer,
  Download,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  Copy,
  Calendar,
  ShoppingBag,
  Edit,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  useOrderDetailQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderPaymentStatusMutation,
  useUpdateOrderAddressMutation,
  useReturnOrderMutation
} from '@/api/hooks/order.hooks';



const statusConfig = {
  pending: { icon: Clock, label: 'Pending', class: 'badge-warning', color: 'bg-warning/10 text-warning border-warning/20' },
  confirmed: { icon: Clock, label: 'Confirmed', class: 'badge-info', color: 'bg-info/10 text-info border-info/20' },
  processing: { icon: Package, label: 'Processing', class: 'badge-info', color: 'bg-info/10 text-info border-info/20' },
  shipped: { icon: Truck, label: 'Shipped', class: 'badge-info', color: 'bg-info/10 text-info border-info/20' },
  delivered: { icon: CheckCircle, label: 'Delivered', class: 'badge-success', color: 'bg-success/10 text-success border-success/20' },
  cancelled: { icon: XCircle, label: 'Cancelled', class: 'badge-destructive', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  returned: { icon: XCircle, label: 'Returned', class: 'badge-destructive', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURNED', label: 'Returned' },
];

const paymentStatusOptions = [
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PAID', label: 'Paid' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'FAILED', label: 'Failed' },
];

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: order, isLoading, error } = useOrderDetailQuery(orderId || '');

  const updateStatusMutation = useUpdateOrderStatusMutation();
  const updatePaymentStatusMutation = useUpdateOrderPaymentStatusMutation();
  const updateAddressMutation = useUpdateOrderAddressMutation();
  const returnOrderMutation = useReturnOrderMutation();

  const [status, setStatus] = useState<string>('PENDING');
  const [paymentStatus, setPaymentStatus] = useState<string>('UNPAID');
  const [internalNote, setInternalNote] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [adminReturnReason, setAdminReturnReason] = useState('');

  const handleReturnOrder = () => {
    if (!order) return;
    returnOrderMutation.mutate(
      { orderId: order.id, reason: adminReturnReason },
      {
        onSuccess: () => {
          setIsReturnDialogOpen(false);
          toast({
            title: "Return Pickup Created",
            description: "Shiprocket return order and pickup created successfully",
          });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Return Failed",
            description: err.message || "Failed to create return order",
          });
        },
      }
    );
  };


  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');

  const handleOpenEditAddress = () => {
    if (order) {
      setEditName(order.shippingName || '');
      setEditPhone(order.shippingPhone || '');
      setEditAddress(order.shippingAddress || '');
      setEditCity(order.shippingCity || '');
      setEditState(order.shippingState || '');
      setEditPincode(order.shippingPincode || '');
      setIsEditAddressOpen(true);
    }
  };

  const handleSaveAddress = () => {
    if (!order) return;
    updateAddressMutation.mutate(
      {
        orderId: order.id,
        shippingName: editName,
        shippingPhone: editPhone,
        shippingAddress: editAddress,
        shippingCity: editCity,
        shippingState: editState,
        shippingPincode: editPincode,
      },
      {
        onSuccess: () => {
          setIsEditAddressOpen(false);
          toast({
            title: "Address Updated",
            description: "Shipping address updated & synced with Shiprocket successfully",
          });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: err.message || "Failed to update shipping address",
          });
        },
      }
    );
  };


  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPaymentStatus(order.paymentStatus);
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive font-medium">Failed to load order: {error instanceof Error ? error.message : "Order not found"}</p>
        <Button variant="outline" onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const currentStatus = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || { icon: Package, label: status, class: 'badge-muted', color: 'bg-muted/10 text-muted border-muted/20' };
  const StatusIcon = currentStatus.icon;

  const handleStatusUpdate = (newStatus: any) => {
    updateStatusMutation.mutate(
      { id: order.id, status: newStatus },
      {
        onSuccess: (updatedOrder) => {
          setStatus(updatedOrder.status);
          toast({
            title: 'Status Updated',
            description: `Order status changed to ${statusOptions.find(s => s.value === newStatus)?.label}`,
          });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: err.message || "Failed to update order status"
          });
        }
      }
    );
  };

  const handlePaymentStatusUpdate = (newPaymentStatus: any) => {
    updatePaymentStatusMutation.mutate(
      { id: order.id, paymentStatus: newPaymentStatus },
      {
        onSuccess: (updatedOrder) => {
          setPaymentStatus(updatedOrder.paymentStatus);
          toast({
            title: 'Payment Status Updated',
            description: `Payment status changed to ${paymentStatusOptions.find(s => s.value === newPaymentStatus)?.label}`,
          });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: err.message || "Failed to update payment status"
          });
        }
      }
    );
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderNumber);
    toast({ title: 'Copied!', description: 'Order number copied to clipboard' });
  };

  const handlePrintInvoice = () => {
    toast({ title: 'Printing Invoice', description: 'Invoice is being prepared for printing' });
  };

  const handlePrintShippingLabel = () => {
    toast({ title: 'Printing Label', description: 'Shipping label is being prepared' });
  };

  const handleRefund = () => {
    setIsRefundDialogOpen(false);
    handlePaymentStatusUpdate('REFUNDED');
  };

  const handleCancelOrder = () => {
    setIsCancelDialogOpen(false);
    handleStatusUpdate('CANCELLED');
  };

  // Generate timeline milestones dynamically based on DB fields
  const timeline = [
    { status: 'Order Placed', date: order.createdAt ? new Date(order.createdAt).toLocaleString() : '', completed: true, description: 'Customer placed the order' },
    { status: 'Confirmed', date: order.placedAt ? new Date(order.placedAt).toLocaleString() : '', completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status), description: 'Order confirmed' },
    { status: 'Processing', date: '', completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status), description: 'Order is being prepared' },
    { status: 'Shipped', date: order.shippedAt ? new Date(order.shippedAt).toLocaleString() : '', completed: ['SHIPPED', 'DELIVERED'].includes(order.status), description: 'Package handed to carrier' },
    { status: 'Delivered', date: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : '', completed: order.status === 'DELIVERED', description: 'Package delivered to customer' },
  ];

  if (order.status === 'CANCELLED') {
    timeline.push({ status: 'Cancelled', date: order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : '', completed: true, description: 'Order was cancelled' });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold">{order.orderNumber}</h1>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyOrderId}>
                <Copy className="w-4 h-4" />
              </Button>
              <Badge variant="outline" className={cn('border', currentStatus.color)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {currentStatus.label}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintInvoice}>
            <Download className="w-4 h-4 mr-2" />
            Invoice
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintShippingLabel}>
            <Printer className="w-4 h-4 mr-2" />
            Shipping Label
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/messages')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Customer
          </Button>
          {status === 'DELIVERED' && (
            <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-amber-700 hover:text-amber-800 border-amber-300">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Return Order (Shiprocket)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Initiate Shiprocket Return Order</DialogTitle>
                  <DialogDescription>
                    This will create a return pickup request in Shiprocket and update order status to RETURNED.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium">Reason for Return</label>
                  <Textarea
                    placeholder="Enter reason for customer return..."
                    value={adminReturnReason}
                    onChange={(e) => setAdminReturnReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleReturnOrder} disabled={returnOrderMutation.isPending}>
                    {returnOrderMutation.isPending ? 'Processing...' : 'Create Return Pickup'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {paymentStatus !== 'REFUNDED' && (
            <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refund
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Process Refund</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to refund this order? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium">Reason for refund</label>
                  <Textarea
                    placeholder="Enter reason for refund..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleRefund}>Process Refund</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {status !== 'CANCELLED' && status !== 'DELIVERED' && (
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this order? This will restore stock.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Keep Order</Button>
                  <Button variant="destructive" onClick={handleCancelOrder}>Cancel Order</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 rounded-lg object-cover bg-background border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{Number(item.totalPrice).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">₹{Number(item.unitPrice).toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{Number(order.shippingCharge) > 0 ? `₹${Number(order.shippingCharge).toFixed(2)}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{Number(order.tax).toFixed(2)}</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-₹{Number(order.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {timeline.map((step: any, index: number) => (
                    <div key={index} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                          step.completed
                            ? "bg-primary border-primary"
                            : "bg-background border-muted-foreground/30"
                        )}>
                          {step.completed && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className={cn(
                            "w-0.5 flex-1 mt-2",
                            step.completed ? "bg-primary" : "bg-muted"
                          )} />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={cn(
                          "font-medium",
                          !step.completed && "text-muted-foreground"
                        )}>
                          {step.status}
                        </p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.date && (
                          <p className="text-xs text-muted-foreground mt-1">{step.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Update */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Update Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Order Status</label>
                  <Select value={status} onValueChange={handleStatusUpdate}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Internal Note</label>
                  <Textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Add internal note..."
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
                <Button className="w-full" onClick={() => toast({ title: "Note Saved", description: "Internal note has been attached to order" })}>
                  <Edit className="w-4 h-4 mr-2" />
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">{order.shippingName.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium">{order.shippingName}</p>
                    <p className="text-sm text-muted-foreground">Buyer</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{order.shippingPhone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Shipping Address
                </CardTitle>
                {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) && (
                  <Dialog open={isEditAddressOpen} onOpenChange={setIsEditAddressOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleOpenEditAddress}>
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Delivery Address</DialogTitle>
                        <DialogDescription>
                          Update customer shipping address and sync changes directly to Shiprocket.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-2 text-sm">
                        <div>
                          <label className="font-medium text-xs">Customer Name</label>
                          <input
                            type="text"
                            className="w-full mt-1 p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="font-medium text-xs">Phone Number</label>
                          <input
                            type="text"
                            className="w-full mt-1 p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="font-medium text-xs">Address</label>
                          <textarea
                            rows={2}
                            className="w-full mt-1 p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-medium text-xs">City</label>
                            <input
                              type="text"
                              className="w-full mt-1 p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              value={editCity}
                              onChange={(e) => setEditCity(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="font-medium text-xs">State</label>
                            <input
                              type="text"
                              className="w-full mt-1 p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              value={editState}
                              onChange={(e) => setEditState(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-xs">Pincode</label>
                          <input
                            type="text"
                            className="w-full mt-1 p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={editPincode}
                            onChange={(e) => setEditPincode(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditAddressOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveAddress} disabled={updateAddressMutation.isPending}>
                          {updateAddressMutation.isPending ? 'Saving...' : 'Save & Sync'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{order.shippingName}</p>
                    {order.address?.type && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0.2">
                        {order.address.type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{order.shippingAddress}</p>
                  {order.address?.locality && (
                    <p className="text-muted-foreground">Locality: {order.address.locality}</p>
                  )}
                  <p className="text-muted-foreground">
                    {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                  </p>
                  <p className="text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {order.shippingPhone}
                  </p>
                </div>

                {(order.latitude || order.longitude || order.address?.latitude || order.address?.longitude) && (
                  <div className="pt-3 border-t border-border space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Geographic Coordinates
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/50 p-2 rounded-lg border border-border">
                        <span className="text-[10px] text-muted-foreground block">Latitude</span>
                        <span className="font-mono font-medium">
                          {order.latitude || order.address?.latitude || 'N/A'}
                        </span>
                      </div>
                      <div className="bg-muted/50 p-2 rounded-lg border border-border">
                        <span className="text-[10px] text-muted-foreground block">Longitude</span>
                        <span className="font-mono font-medium">
                          {order.longitude || order.address?.longitude || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {(order.latitude && order.longitude) && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1 font-medium"
                      >
                        View location on Google Maps
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {(!order.latitude || !order.longitude) && (order.address?.latitude && order.address?.longitude) && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${order.address.latitude},${order.address.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1 font-medium"
                      >
                        View location on Google Maps
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select value={paymentStatus} onValueChange={handlePaymentStatusUpdate}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium">{order.paymentMethod || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-primary">${Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Note */}
          {order.note && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Customer Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic text-muted-foreground">"{order.note}"</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
