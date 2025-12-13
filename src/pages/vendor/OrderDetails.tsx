import { useState } from 'react';
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
  Mail,
  Phone,
  CreditCard,
  Printer,
  Download,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  Copy,
  ExternalLink,
  Calendar,
  DollarSign,
  ShoppingBag,
  Edit,
  RotateCcw,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// Mock order data
const ordersData: Record<string, any> = {
  'ORD-2024-7842': {
    id: 'ORD-2024-7842',
    customer: {
      name: 'John Smith',
      email: 'john@email.com',
      phone: '+1 (555) 123-4567',
      avatar: 'JS',
    },
    items: [
      { id: 1, name: 'Wireless Headphones Pro', qty: 1, price: 129.99, sku: 'WHP-001', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
      { id: 2, name: 'USB-C Cable', qty: 2, price: 14.99, sku: 'USC-002', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop' },
    ],
    subtotal: 159.97,
    shipping: 9.99,
    tax: 14.40,
    discount: 10.00,
    total: 174.36,
    status: 'processing',
    payment: {
      status: 'paid',
      method: 'Credit Card',
      last4: '4242',
      transactionId: 'TXN-987654321',
    },
    shipping_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
    },
    billing_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
    },
    date: '2024-01-15 14:32',
    notes: 'Please leave at the door.',
    tracking: {
      carrier: 'FedEx',
      number: '',
      url: '',
    },
    timeline: [
      { status: 'Order Placed', date: '2024-01-15 14:32', completed: true, description: 'Customer placed the order' },
      { status: 'Payment Confirmed', date: '2024-01-15 14:35', completed: true, description: 'Payment verified successfully' },
      { status: 'Processing', date: '2024-01-15 15:00', completed: true, description: 'Order is being prepared' },
      { status: 'Shipped', date: '', completed: false, description: 'Package handed to carrier' },
      { status: 'Delivered', date: '', completed: false, description: 'Package delivered to customer' },
    ],
  },
  'ORD-2024-7841': {
    id: 'ORD-2024-7841',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '+1 (555) 234-5678',
      avatar: 'SJ',
    },
    items: [
      { id: 1, name: 'Smart Watch Series 5', qty: 1, price: 299.00, sku: 'SWS-005', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop' },
    ],
    subtotal: 299.00,
    shipping: 0,
    tax: 26.91,
    discount: 0,
    total: 325.91,
    status: 'shipped',
    payment: {
      status: 'paid',
      method: 'PayPal',
      last4: '',
      transactionId: 'TXN-123456789',
    },
    shipping_address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'United States',
    },
    billing_address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'United States',
    },
    date: '2024-01-15 12:18',
    notes: '',
    tracking: {
      carrier: 'UPS',
      number: '1Z999AA10123456784',
      url: 'https://www.ups.com/track',
    },
    timeline: [
      { status: 'Order Placed', date: '2024-01-15 12:18', completed: true, description: 'Customer placed the order' },
      { status: 'Payment Confirmed', date: '2024-01-15 12:20', completed: true, description: 'Payment verified successfully' },
      { status: 'Processing', date: '2024-01-15 13:00', completed: true, description: 'Order is being prepared' },
      { status: 'Shipped', date: '2024-01-16 09:30', completed: true, description: 'Package handed to UPS' },
      { status: 'Delivered', date: '', completed: false, description: 'Package delivered to customer' },
    ],
  },
};

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', class: 'badge-warning', color: 'bg-warning/10 text-warning border-warning/20' },
  processing: { icon: Package, label: 'Processing', class: 'badge-info', color: 'bg-info/10 text-info border-info/20' },
  shipped: { icon: Truck, label: 'Shipped', class: 'badge-info', color: 'bg-info/10 text-info border-info/20' },
  delivered: { icon: CheckCircle, label: 'Delivered', class: 'badge-success', color: 'bg-success/10 text-success border-success/20' },
  cancelled: { icon: XCircle, label: 'Cancelled', class: 'badge-destructive', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const order = ordersData[orderId || ''] || ordersData['ORD-2024-7842'];
  
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking.number);
  const [trackingCarrier, setTrackingCarrier] = useState(order.tracking.carrier);
  const [internalNote, setInternalNote] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const currentStatus = statusConfig[status as keyof typeof statusConfig];
  const StatusIcon = currentStatus?.icon || Package;

  const handleStatusUpdate = (newStatus: string) => {
    setStatus(newStatus);
    toast({
      title: 'Status Updated',
      description: `Order status changed to ${statusOptions.find(s => s.value === newStatus)?.label}`,
    });
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    toast({ title: 'Copied!', description: 'Order ID copied to clipboard' });
  };

  const handlePrintInvoice = () => {
    toast({ title: 'Printing Invoice', description: 'Invoice is being prepared for printing' });
  };

  const handlePrintShippingLabel = () => {
    toast({ title: 'Printing Label', description: 'Shipping label is being prepared' });
  };

  const handleSaveTracking = () => {
    toast({ title: 'Tracking Updated', description: 'Tracking information has been saved' });
  };

  const handleRefund = () => {
    setIsRefundDialogOpen(false);
    toast({ title: 'Refund Initiated', description: 'Refund process has been started' });
  };

  const handleCancelOrder = () => {
    setIsCancelDialogOpen(false);
    setStatus('cancelled');
    toast({ title: 'Order Cancelled', description: 'Order has been cancelled successfully' });
  };

  const handleContactCustomer = () => {
    navigate('/messages');
  };

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
              <h1 className="text-2xl lg:text-3xl font-bold">{order.id}</h1>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyOrderId}>
                <Copy className="w-4 h-4" />
              </Button>
              <Badge variant="outline" className={cn('border', currentStatus?.color)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {currentStatus?.label}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {order.date}
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
          <Button variant="outline" size="sm" onClick={handleContactCustomer}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Customer
          </Button>
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
                <Label>Reason for refund</Label>
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
                  Are you sure you want to cancel this order? This will notify the customer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Keep Order</Button>
                <Button variant="destructive" onClick={handleCancelOrder}>Cancel Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.qty).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{order.shipping > 0 ? `$${order.shipping.toFixed(2)}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${order.total.toFixed(2)}</span>
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
                  {order.timeline.map((step: any, index: number) => (
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
                        {index < order.timeline.length - 1 && (
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

          {/* Shipping & Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping & Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Carrier</Label>
                    <Select value={trackingCarrier} onValueChange={setTrackingCarrier}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FedEx">FedEx</SelectItem>
                        <SelectItem value="UPS">UPS</SelectItem>
                        <SelectItem value="USPS">USPS</SelectItem>
                        <SelectItem value="DHL">DHL</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tracking Number</Label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveTracking}>Save Tracking</Button>
                  {trackingNumber && (
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Track Package
                    </Button>
                  )}
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
                <Select value={status} onValueChange={handleStatusUpdate}>
                  <SelectTrigger>
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
                <div>
                  <Label>Internal Note</Label>
                  <Textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Add internal note..."
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
                <Button className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Update Order
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
                    <span className="text-primary font-semibold">{order.customer.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{order.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{order.customer.phone}</span>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {order.shipping_address.street}<br />
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}<br />
                  {order.shipping_address.country}
                </p>
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
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={cn(
                    order.payment.status === 'paid' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                  )}>
                    {order.payment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span>{order.payment.method}{order.payment.last4 && ` •••• ${order.payment.last4}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">{order.payment.transactionId}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Note */}
          {order.notes && (
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
                  <p className="text-sm italic text-muted-foreground">"{order.notes}"</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
