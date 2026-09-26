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
  IndianRupee,
  AlertCircle,
  Landmark,
  Wallet,
  Receipt,
  Check,
  Building2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  useReturnOrderMutation,
  useProcessRefundMutation,
} from '@/api/hooks/order.hooks';
import { useUserQuery } from '@/api/hooks/user.hooks';

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

const refundReasonPresets = [
  "Customer Cancellation / Changed Mind",
  "Defective or Damaged Product Received",
  "Incorrect / Wrong Item Shipped",
  "Product Quality Not as Expected",
  "Order Lost / Delayed in Transit",
  "Double Payment / Technical Overcharge",
  "Customer Return Request Approved",
  "Out of Stock / Item Unavailable",
  "Other (Specified in Notes)",
];

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: order, isLoading, error } = useOrderDetailQuery(orderId || '');
  const { data: customerUserData } = useUserQuery(order?.userId || '', !!order?.userId);

  const updateStatusMutation = useUpdateOrderStatusMutation();
  const updatePaymentStatusMutation = useUpdateOrderPaymentStatusMutation();
  const updateAddressMutation = useUpdateOrderAddressMutation();
  const returnOrderMutation = useReturnOrderMutation();
  const processRefundMutation = useProcessRefundMutation();

  const [status, setStatus] = useState<string>('PENDING');
  const [paymentStatus, setPaymentStatus] = useState<string>('UNPAID');
  const [internalNote, setInternalNote] = useState('');
  
  // Process Refund State
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundType, setRefundType] = useState<'FULL' | 'CUSTOM'>('FULL');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundMethod, setRefundMethod] = useState<string>('ORIGINAL_PAYMENT_METHOD');
  const [refundReasonCategory, setRefundReasonCategory] = useState<string>(refundReasonPresets[0]);
  const [refundReason, setRefundReason] = useState('');
  const [refundAdminNote, setRefundAdminNote] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [refundTxnId, setRefundTxnId] = useState('');
  const [hasAutoFetchedBank, setHasAutoFetchedBank] = useState<boolean>(false);
  const [hasAutoFetchedUpi, setHasAutoFetchedUpi] = useState<boolean>(false);
  const [isEditingBank, setIsEditingBank] = useState<boolean>(false);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [adminReturnReason, setAdminReturnReason] = useState('');

  const handleOpenRefundDialog = () => {
    if (order) {
      const orderTotal = Number(order.totalAmount).toFixed(2);
      setRefundAmount(orderTotal);
      setRefundType('FULL');
      setRefundMethod(order.paymentMethod === 'COD' ? 'BANK_TRANSFER' : 'ORIGINAL_PAYMENT_METHOD');
      setRefundReasonCategory(refundReasonPresets[0]);
      setRefundReason('');
      setRefundAdminNote('');
      setRefundTxnId('');

      // Auto-fetch user bank details from live customer profile, order.user, or past refund records in database
      const customer = customerUserData || order.user;
      const prevRefund = 
        order.refunds?.find((r: any) => r.bankName || r.accountNumber || r.ifscCode || r.upiId) || 
        order.user?.orderRefunds?.find((r: any) => r.bankName || r.accountNumber || r.ifscCode || r.upiId) ||
        order.refunds?.[0] || 
        order.user?.orderRefunds?.[0];

      const fetchedAccountHolder = 
        customer?.accountHolderName || 
        prevRefund?.accountHolderName || 
        `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() ||
        order.shippingName || 
        '';
      const fetchedBankName = 
        customer?.bankName || 
        prevRefund?.bankName || 
        '';
      const fetchedAccountNumber = 
        customer?.accountNumber || 
        prevRefund?.accountNumber || 
        '';
      const fetchedIfscCode = 
        customer?.ifscCode || 
        prevRefund?.ifscCode || 
        '';
      const fetchedUpiId = 
        customer?.upiId || 
        prevRefund?.upiId || 
        '';

      setAccountHolderName(fetchedAccountHolder);
      setBankName(fetchedBankName);
      setAccountNumber(fetchedAccountNumber);
      setIfscCode(fetchedIfscCode);
      setUpiId(fetchedUpiId);

      const hasBank = !!(fetchedBankName && fetchedAccountNumber) || !!(fetchedBankName || fetchedAccountNumber || fetchedIfscCode);
      const hasUpi = !!fetchedUpiId;
      setHasAutoFetchedBank(hasBank);
      setHasAutoFetchedUpi(hasUpi);
      setIsEditingBank(!hasBank);

      setIsRefundDialogOpen(true);
    }
  };

  // Reactively auto-fill bank details when user query completes asynchronously
  useEffect(() => {
    if (isRefundDialogOpen && customerUserData) {
      const hasDbBank = !!(customerUserData.bankName || customerUserData.accountNumber || customerUserData.ifscCode);
      if (hasDbBank) {
        if (customerUserData.bankName) setBankName(customerUserData.bankName);
        if (customerUserData.accountNumber) setAccountNumber(customerUserData.accountNumber);
        if (customerUserData.ifscCode) setIfscCode(customerUserData.ifscCode);
        if (customerUserData.accountHolderName) {
          setAccountHolderName(customerUserData.accountHolderName);
        } else if (customerUserData.firstName || customerUserData.lastName) {
          setAccountHolderName(`${customerUserData.firstName || ''} ${customerUserData.lastName || ''}`.trim());
        }
        setHasAutoFetchedBank(true);
        setIsEditingBank(false);
      }
      if (customerUserData.upiId) {
        setUpiId(customerUserData.upiId);
        setHasAutoFetchedUpi(true);
      }
    }
  }, [customerUserData, isRefundDialogOpen]);



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
    if (!order) return;
    const numAmount = parseFloat(refundAmount);
    const orderTotal = Number(order.totalAmount);

    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Refund Amount",
        description: "Please enter a valid refund amount greater than ₹0",
      });
      return;
    }

    if (numAmount > orderTotal) {
      toast({
        variant: "destructive",
        title: "Amount Exceeds Order Total",
        description: `Refund amount cannot exceed total order value of ₹${orderTotal.toFixed(2)}`,
      });
      return;
    }

    const fullReason = refundReason.trim()
      ? `${refundReasonCategory}: ${refundReason.trim()}`
      : refundReasonCategory;

    processRefundMutation.mutate(
      {
        orderId: order.id,
        amount: numAmount,
        reason: fullReason,
        refundMethod,
        adminNote: refundAdminNote,
        accountHolderName: refundMethod === 'BANK_TRANSFER' ? accountHolderName : undefined,
        bankName: refundMethod === 'BANK_TRANSFER' ? bankName : undefined,
        accountNumber: refundMethod === 'BANK_TRANSFER' ? accountNumber : undefined,
        ifscCode: refundMethod === 'BANK_TRANSFER' ? ifscCode : undefined,
        upiId: refundMethod === 'UPI' ? upiId : undefined,
        transactionId: refundTxnId || undefined,
      },
      {
        onSuccess: () => {
          setIsRefundDialogOpen(false);
          setPaymentStatus('REFUNDED');
          toast({
            title: "Refund Processed",
            description: `Refund of ₹${numAmount.toFixed(2)} processed successfully for ${order.orderNumber}`,
          });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Refund Failed",
            description: err?.message || "Failed to process refund. Please try again.",
          });
        },
      }
    );
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
                <Button variant="outline" size="sm" onClick={handleOpenRefundDialog}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refund
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                {/* Header with gradient top */}
                <div className="p-6 border-b border-border bg-gradient-to-b from-primary/5 via-transparent to-transparent">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold">Process Order Refund</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                          Initiate & record a refund for order #{order.orderNumber}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  {/* Section 1: Kis Order Ka Refund Hai */}
                  <div className="mt-4 p-3.5 rounded-xl border border-border bg-card/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        <span className="font-mono font-bold text-sm">{order.orderNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={cn('text-[11px] px-2 py-0.5', currentStatus.color)}>
                          {currentStatus.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                          {order.paymentMethod || 'Online'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-border/50 text-muted-foreground">
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">Customer</span>
                        <span className="font-medium text-foreground truncate block">{order.shippingName || 'Customer'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">Phone</span>
                        <span className="font-medium text-foreground">{order.shippingPhone}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">Order Date</span>
                        <span className="font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Section 2: Order Items Summary Mini-Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>Order Items ({order.items?.length || 0})</span>
                      <span>Total Paid: ₹{Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1 border border-border/60 rounded-lg p-2 bg-muted/20">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 p-1.5 rounded-md bg-background border border-border/40 text-xs">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-9 h-9 rounded object-cover border border-border bg-muted shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-foreground">{item.productName}</p>
                            <p className="text-[11px] text-muted-foreground">Qty: {item.quantity} {item.size && `• ${item.size}`}</p>
                          </div>
                          <span className="font-semibold text-foreground shrink-0">₹{Number(item.totalPrice).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Kitna Refund Hai (Amount Calculation & Selection) */}
                  <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4 text-primary" />
                        Refund Amount (Kitna Refund Karna Hai)
                      </Label>
                      <Badge variant="outline" className="bg-background text-primary border-primary/30 text-xs">
                        Max: ₹{Number(order.totalAmount).toFixed(2)}
                      </Badge>
                    </div>

                    {/* Quick Selection Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRefundType('FULL');
                          setRefundAmount(Number(order.totalAmount).toFixed(2));
                        }}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-xs flex flex-col justify-between",
                          refundType === 'FULL'
                            ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary font-medium"
                            : "border-border bg-background/80 hover:bg-background text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Full Order Refund</span>
                          {refundType === 'FULL' && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <span className="text-sm font-bold text-primary mt-1">₹{Number(order.totalAmount).toFixed(2)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRefundType('CUSTOM')}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-xs flex flex-col justify-between",
                          refundType === 'CUSTOM'
                            ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary font-medium"
                            : "border-border bg-background/80 hover:bg-background text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Partial / Custom Amount</span>
                          {refundType === 'CUSTOM' && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">Enter custom refund amount</span>
                      </button>
                    </div>

                    {/* Amount Input */}
                    <div className="relative mt-2">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground font-semibold">
                        ₹
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="1"
                        max={Number(order.totalAmount)}
                        value={refundAmount}
                        onChange={(e) => {
                          setRefundAmount(e.target.value);
                          if (e.target.value !== Number(order.totalAmount).toFixed(2)) {
                            setRefundType('CUSTOM');
                          } else {
                            setRefundType('FULL');
                          }
                        }}
                        placeholder="Enter refund amount"
                        className="pl-8 font-semibold text-base h-11 bg-background"
                      />
                    </div>

                    {/* Order Financial Breakdown Chips */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1 text-[11px] text-center text-muted-foreground">
                      <div className="p-1.5 rounded bg-background/60 border border-border/40">
                        <span className="block text-[10px]">Subtotal</span>
                        <span className="font-medium text-foreground">₹{Number(order.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="p-1.5 rounded bg-background/60 border border-border/40">
                        <span className="block text-[10px]">Shipping</span>
                        <span className="font-medium text-foreground">{Number(order.shippingCharge) > 0 ? `₹${Number(order.shippingCharge).toFixed(2)}` : 'Free'}</span>
                      </div>
                      <div className="p-1.5 rounded bg-background/60 border border-border/40">
                        <span className="block text-[10px]">Tax</span>
                        <span className="font-medium text-foreground">₹{Number(order.tax).toFixed(2)}</span>
                      </div>
                      <div className="p-1.5 rounded bg-background/60 border border-border/40">
                        <span className="block text-[10px]">Discount</span>
                        <span className="font-medium text-foreground">{Number(order.discount) > 0 ? `-₹${Number(order.discount).toFixed(2)}` : '₹0.00'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Refund Method Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-primary" />
                      Refund Destination / Method
                    </Label>
                    <Select value={refundMethod} onValueChange={setRefundMethod}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ORIGINAL_PAYMENT_METHOD">
                          Original Payment Method ({order.paymentMethod || 'Razorpay / Gateway'})
                        </SelectItem>
                        <SelectItem value="BANK_TRANSFER">
                          Direct Bank Transfer (NEFT / IMPS)
                        </SelectItem>
                        <SelectItem value="UPI">
                          UPI Transfer (GPay / PhonePe / Paytm)
                        </SelectItem>
                        <SelectItem value="STORE_CREDIT">
                          Store Credit / Wallet Balance
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Conditional Bank Details */}
                    {refundMethod === 'BANK_TRANSFER' && (
                      <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-xs space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-border/50">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <Landmark className="w-3.5 h-3.5 text-primary" />
                            Customer Bank Account Details
                          </span>
                          {hasAutoFetchedBank ? (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 flex items-center">
                                <Check className="w-3 h-3 mr-1" />
                                Auto-fetched from database
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditingBank(!isEditingBank)}
                                className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10"
                              >
                                {isEditingBank ? "Use Auto-Fetched" : "Edit / Change"}
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              No bank saved — Add Details
                            </Badge>
                          )}
                        </div>

                        {hasAutoFetchedBank && !isEditingBank ? (
                          <div className="p-3 rounded-md bg-background border border-border/70 space-y-2.5 shadow-sm">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[11px] text-muted-foreground block">Bank Name</span>
                                <span className="font-semibold text-foreground">{bankName || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[11px] text-muted-foreground block">Account Holder</span>
                                <span className="font-semibold text-foreground">{accountHolderName || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[11px] text-muted-foreground block">Account Number</span>
                                <span className="font-mono font-bold text-foreground">
                                  {accountNumber ? `•••• •••• ${accountNumber.slice(-4)} (${accountNumber})` : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[11px] text-muted-foreground block">IFSC Code</span>
                                <span className="font-mono font-semibold text-foreground uppercase">{ifscCode || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {!hasAutoFetchedBank && (
                              <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed">
                                💡 <strong>No saved bank account in database:</strong> Enter the bank details below. Processing this refund will automatically save these details to the customer's database profile for future payouts.
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-medium text-muted-foreground block mb-1">Account Holder Name</label>
                                <Input
                                  placeholder="Full name as per bank"
                                  value={accountHolderName}
                                  onChange={(e) => setAccountHolderName(e.target.value)}
                                  className="h-8 text-xs bg-background"
                                />
                              </div>
                              <div>
                                <label className="font-medium text-muted-foreground block mb-1">Bank Name</label>
                                <Input
                                  placeholder="e.g. HDFC Bank, SBI"
                                  value={bankName}
                                  onChange={(e) => setBankName(e.target.value)}
                                  className="h-8 text-xs bg-background"
                                />
                              </div>
                              <div>
                                <label className="font-medium text-muted-foreground block mb-1">Account Number</label>
                                <Input
                                  placeholder="Enter bank account number"
                                  value={accountNumber}
                                  onChange={(e) => setAccountNumber(e.target.value)}
                                  className="h-8 text-xs bg-background"
                                />
                              </div>
                              <div>
                                <label className="font-medium text-muted-foreground block mb-1">IFSC Code</label>
                                <Input
                                  placeholder="e.g. HDFC0001234"
                                  value={ifscCode}
                                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                  className="h-8 text-xs bg-background uppercase"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Conditional UPI Details */}
                    {refundMethod === 'UPI' && (
                      <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-medium text-muted-foreground block">Customer UPI ID / VPA</label>
                          {hasAutoFetchedUpi ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 flex items-center">
                              <Check className="w-3 h-3 mr-1" />
                              Auto-fetched from database
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              No UPI saved — Enter ID
                            </Badge>
                          )}
                        </div>
                        <Input
                          placeholder="e.g. mobile@upi or username@okhdfcbank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="h-9 text-xs bg-background"
                        />
                        {!hasAutoFetchedUpi && (
                          <p className="text-[10px] text-muted-foreground">
                            Will be saved to customer profile for future refunds automatically.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 5: Reason for Refund */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      Reason for Refund
                    </Label>
                    <Select value={refundReasonCategory} onValueChange={setRefundReasonCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {refundReasonPresets.map((preset) => (
                          <SelectItem key={preset} value={preset}>
                            {preset}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Textarea
                      placeholder="Additional details / customer notes about this refund..."
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      rows={2}
                      className="text-xs"
                    />
                  </div>

                  {/* Section 6: Optional Reference / Admin Note */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-medium text-muted-foreground block mb-1">Gateway Ref / Txn ID (Optional)</label>
                      <Input
                        placeholder="e.g. rfr_123456789"
                        value={refundTxnId}
                        onChange={(e) => setRefundTxnId(e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground block mb-1">Internal Note (Optional)</label>
                      <Input
                        placeholder="Visible only to admin team"
                        value={refundAdminNote}
                        onChange={(e) => setRefundAdminNote(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  </div>

                  {/* Confirmation Notice Box */}
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        Ready to refund ₹{Number(refundAmount || 0).toFixed(2)} to {order.shippingName || 'customer'}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        This action will mark order payment as REFUNDED and log a permanent audit record in the database.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)} disabled={processRefundMutation.isPending}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRefund}
                    disabled={processRefundMutation.isPending || !refundAmount || Number(refundAmount) <= 0}
                    className="bg-primary text-primary-foreground font-semibold"
                  >
                    {processRefundMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing Refund...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Confirm Refund (₹{Number(refundAmount || 0).toFixed(2)})
                      </>
                    )}
                  </Button>
                </div>
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
                    <span className="font-semibold text-primary">₹{Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Refund Details (if refunded or has refunds) */}
          {(paymentStatus === 'REFUNDED' || (order.refunds && order.refunds.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
            >
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <RotateCcw className="w-5 h-5" />
                    Refund Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {order.refunds && order.refunds.length > 0 ? (
                    order.refunds.map((ref: any, idx: number) => (
                      <div key={ref.id || idx} className="p-3 rounded-lg bg-background/80 border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-xs text-foreground">{ref.refundNumber}</span>
                          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300">
                            {ref.status || 'COMPLETED'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Amount Refunded</span>
                          <span className="font-bold text-primary text-sm">₹{Number(ref.amount).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Method</span>
                          <span className="font-medium text-foreground">{ref.refundMethod?.replace(/_/g, ' ') || 'Original Method'}</span>
                        </div>
                        {ref.reason && (
                          <div className="pt-1.5 border-t border-border/60 text-xs text-muted-foreground">
                            <span className="font-semibold block text-[10px] uppercase text-muted-foreground/70">Reason</span>
                            <p className="mt-0.5 text-foreground">{ref.reason}</p>
                          </div>
                        )}
                        {ref.upiId && (
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>UPI ID:</span>
                            <span className="font-mono text-foreground">{ref.upiId}</span>
                          </div>
                        )}
                        {ref.accountNumber && (
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>Bank Account:</span>
                            <span className="font-mono text-foreground">{ref.accountNumber} ({ref.ifscCode})</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg bg-background/80 border border-border space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300">
                          REFUNDED
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-primary text-sm">₹{Number(order.totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

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
