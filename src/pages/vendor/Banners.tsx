import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { 
  useBannersQuery, 
  useCreateBannerMutation, 
  useUpdateBannerMutation, 
  useDeleteBannerMutation 
} from '@/api/hooks/banner.hooks';

export default function Banners() {
  const { toast } = useToast();
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [placement, setPlacement] = useState<'HOME_HERO' | 'SIDEBAR' | 'CATEGORY_BANNER'>('HOME_HERO');
  const [expiryDate, setExpiryDate] = useState('');

  // Banners Query
  const { data: bannersList, isLoading } = useBannersQuery();
  const banners = bannersList || [];

  const createMutation = useCreateBannerMutation();
  const updateMutation = useUpdateBannerMutation();
  const deleteMutation = useDeleteBannerMutation();

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim() || !redirectUrl.trim() || !expiryDate) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        linkUrl: redirectUrl.trim(),
        position: placement,
        endDate: expiryDate
      },
      {
        onSuccess: () => {
          toast({ title: 'Banner Created', description: `Banner "${title}" has been created successfully.` });
          setTitle('');
          setImageUrl('');
          setRedirectUrl('');
          setPlacement('HOME_HERO');
          setExpiryDate('');
          setIsAddBannerOpen(false);
        },
        onError: (err: any) => {
          toast({ title: 'Creation Failed', description: err.message || 'Could not create banner', variant: 'destructive' });
        }
      }
    );
  };

  const handleDeleteBanner = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Banner Deleted', description: 'The promotional banner has been deleted.' }),
      onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' })
    });
  };

  const handleToggleStatus = (banner: any) => {
    const nextStatus = !banner.isActive;
    updateMutation.mutate(
      { id: banner.id, data: { isActive: nextStatus } },
      {
        onSuccess: () => toast({ title: `Banner status updated`, description: `"${banner.title}" is now ${nextStatus ? 'active' : 'inactive'}.` }),
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' })
      }
    );
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
          <h1 className="text-2xl lg:text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">Manage marketing sliders, hero ads, and sidebar promo images</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddBannerOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Promo Banner
        </Button>
      </motion.div>

      {/* Overview stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{banners.length}</p>
            <p className="text-sm text-muted-foreground">Total Banners</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 font-bold">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Total Click-Throughs</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">0%</p>
            <p className="text-sm text-muted-foreground">Average CTR</p>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground shadow-soft">
          <Info className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-semibold text-lg text-foreground">No promotional banners yet</p>
          <p className="text-sm mt-1">Click "Add Promo Banner" to design and upload your first advertisement.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => {
            return (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full relative overflow-hidden bg-muted border-b border-border">
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm",
                        banner.position === 'HOME_HERO' && "bg-primary/95 text-primary-foreground border-primary",
                        banner.position === 'SIDEBAR' && "bg-sky-500/95 text-white border-sky-600",
                        banner.position === 'CATEGORY_BANNER' && "bg-indigo-500/95 text-white border-indigo-600"
                      )}>
                        {banner.position?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-base truncate">{banner.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span className="truncate hover:underline cursor-pointer">{banner.linkUrl}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 text-center bg-muted/30 rounded-lg border border-border text-xs">
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold">Views</p>
                        <p className="font-bold text-foreground mt-0.5">0</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold">Clicks</p>
                        <p className="font-bold text-foreground mt-0.5">0</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold">CTR</p>
                        <p className="font-bold text-foreground mt-0.5">0%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Exp: {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'Never'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full border font-semibold shadow-sm transition-all",
                        banner.isActive 
                          ? "bg-success/15 text-success border-success/30 hover:bg-success/20" 
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      )}
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteBanner(banner.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Banner Dialog */}
      <Dialog open={isAddBannerOpen} onOpenChange={setIsAddBannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Promotional Banner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBanner} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="banner-title">Campaign Title *</Label>
              <Input 
                id="banner-title"
                placeholder="e.g. Exclusive Weekend Tech Discounts" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-image">Image URL *</Label>
              <Input 
                id="banner-image"
                placeholder="https://images.unsplash.com/... or cloud link" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-border mt-2">
                  <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-redirect">Redirect Link / Target URL *</Label>
              <Input 
                id="banner-redirect"
                placeholder="e.g. /products?category=electronics" 
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-placement">Placement Location</Label>
                <Select 
                  value={placement} 
                  onValueChange={(val: any) => setPlacement(val)}
                >
                  <SelectTrigger id="banner-placement">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME_HERO">Home Page Slider (Main)</SelectItem>
                    <SelectItem value="SIDEBAR">Sidebar Panel Add</SelectItem>
                    <SelectItem value="CATEGORY_BANNER">Category Header Hero</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner-expiry">Campaign Expiry *</Label>
                <Input 
                  id="banner-expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddBannerOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Banner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
