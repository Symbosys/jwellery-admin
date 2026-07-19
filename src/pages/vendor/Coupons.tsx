import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  Percent,
  Tag,
  Users,
  TrendingUp,
  Search,
  Calendar,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useCouponsQuery, useCreateCouponMutation, useDeleteCouponMutation } from '@/api/hooks/coupon.hooks';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minSpend: number;
  status: 'ACTIVE' | 'EXPIRED';
  expiryDate: string;
  usageCount: number;
  totalDiscountClaimed: number;
}

export default function Coupons() {
  const { toast } = useToast();
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [value, setValue] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { data: dbCoupons = [], isLoading } = useCouponsQuery();
  const createMutation = useCreateCouponMutation();
  const deleteMutation = useDeleteCouponMutation();

  const coupons: Coupon[] = dbCoupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.discountType === 'PERCENTAGE' ? 'PERCENT' : 'FIXED',
    value: Number(c.discountValue),
    minSpend: Number(c.minOrderAmount) || 0,
    status: c.isActive && (!c.endDate || new Date(c.endDate) > new Date()) ? 'ACTIVE' : 'EXPIRED',
    expiryDate: c.endDate || '',
    usageCount: c.usedCount || 0,
    totalDiscountClaimed: 0,
  }));

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value || !expiryDate) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      code: code.trim().toUpperCase(),
      discountType: type === 'PERCENT' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
      discountValue: Number(value),
      minOrderAmount: Number(minSpend) || 0,
      endDate: new Date(expiryDate).toISOString(),
      isActive: true,
    }, {
      onSuccess: () => {
        toast({ title: 'Coupon Created', description: `Coupon ${code.toUpperCase()} has been created successfully.` });
        setCode('');
        setValue('');
        setMinSpend('');
        setExpiryDate('');
        setIsAddCouponOpen(false);
      },
      onError: (err: any) => {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
    });
  };

  const handleDeleteCoupon = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Coupon Deleted', description: 'The coupon has been successfully deleted.' });
      },
      onError: (err: any) => {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
    });
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Manage promo codes and discount vouchers for checkouts</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddCouponOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </motion.div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{coupons.filter(c => c.status === 'ACTIVE').length}</p>
            <p className="text-sm text-muted-foreground">Active Coupons</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Claims</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              ₹{coupons.reduce((sum, c) => sum + c.totalDiscountClaimed, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Saved by Users</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">12.5%</p>
            <p className="text-sm text-muted-foreground">Average Discount</p>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft p-6 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-lg">Vouchers & Coupons List</h3>
            <p className="text-sm text-muted-foreground">View and manage your custom promo codes</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search coupon code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filteredCoupons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No coupons found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs text-foreground uppercase border-b border-border bg-muted/20">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Code</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Discount</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Min Spend</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Times Claimed</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Total Discount Value</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Expiry Date</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Status</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-foreground font-mono">{coupon.code}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-0.5 font-bold text-primary">
                        {coupon.type === 'PERCENT' ? (
                          <>
                            <span>{coupon.value}%</span>
                            <Percent className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <span>₹{coupon.value}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">₹{coupon.minSpend}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-foreground">{coupon.usageCount}</td>
                    <td className="py-3.5 px-4 text-center text-foreground font-semibold">₹{coupon.totalDiscountClaimed}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No Expiry'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={cn(
                        "badge text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                        coupon.status === 'ACTIVE'
                          ? "bg-success/10 text-success border-success/30"
                          : "bg-destructive/10 text-destructive border-destructive/30"
                      )}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Coupon Dialog */}
      <Dialog open={isAddCouponOpen} onOpenChange={setIsAddCouponOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Promotion Coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCoupon} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Coupon Code *</Label>
              <Input
                id="coupon-code"
                placeholder="e.g. EXTRA20"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono uppercase font-bold text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <div className="flex bg-muted p-1 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setType('PERCENT')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all",
                      type === 'PERCENT' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('FIXED')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all",
                      type === 'FIXED' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Fixed Cash
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-value">Value *</Label>
                <Input
                  id="coupon-value"
                  type="number"
                  placeholder={type === 'PERCENT' ? '15%' : '₹20'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-min-spend">Minimum Spend (₹)</Label>
                <Input
                  id="coupon-min-spend"
                  type="number"
                  placeholder="0"
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-expiry">Expiry Date *</Label>
                <Input
                  id="coupon-expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddCouponOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Coupon'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
