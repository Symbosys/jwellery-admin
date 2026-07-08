import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Gift,
  Tag,
  Search,
  Calendar,
  Info,
  CheckCircle2,
  XCircle,
  Percent,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useOffersQuery,
  useCreateOfferMutation,
  useDeleteOfferMutation,
  useUpdateOfferMutation,
  OfferType,
  DBOffer,
} from "@/api/hooks/offer.hooks";

const offerTypeLabels: Record<OfferType, string> = {
  FLAT_DISCOUNT: "Flat Discount",
  PERCENTAGE_DISCOUNT: "Percentage Discount",
  MAKING_CHARGE_DISCOUNT: "Making Charge Discount",
  FREE_GIFT: "Free Gift",
  CASHBACK: "Cashback",
  EXCHANGE: "Exchange Offer",
  FESTIVAL: "Festival Special",
  BUY_ONE_GET_ONE_FREE: "Buy 1 Get 1 Free",
  GOLD_SAVINGS: "Gold Savings",
  LOYALTY_REWARD: "Loyalty Reward",
};

export default function Offer() {
  const { toast } = useToast();
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [offerType, setOfferType] = useState<OfferType>("PERCENTAGE_DISCOUNT");
  const [discountValue, setDiscountValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [giftDescription, setGiftDescription] = useState("");
  const [cashbackDetails, setCashbackDetails] = useState("");
  const [exchangeDetails, setExchangeDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: offers = [], isLoading } = useOffersQuery();
  const createMutation = useCreateOfferMutation();
  const updateMutation = useUpdateOfferMutation();
  const deleteMutation = useDeleteOfferMutation();

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in the offer name",
        variant: "destructive",
      });
      return;
    }

    const payload: Partial<DBOffer> = {
      name: name.trim(),
      description: description.trim() || null,
      offerType,
      minPurchase: minPurchase ? Number(minPurchase) : null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      isActive: true,
    };

    // Conditional values based on type
    if (
      offerType === "FLAT_DISCOUNT" ||
      offerType === "PERCENTAGE_DISCOUNT" ||
      offerType === "MAKING_CHARGE_DISCOUNT"
    ) {
      payload.discountValue = Number(discountValue) || 0;
    } else if (offerType === "FREE_GIFT") {
      payload.giftDescription = giftDescription.trim() || null;
    } else if (offerType === "CASHBACK") {
      payload.cashbackDetails = cashbackDetails.trim() || null;
    } else if (offerType === "EXCHANGE") {
      payload.exchangeDetails = exchangeDetails.trim() || null;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Offer Created",
          description: `Offer "${name}" has been created successfully.`,
        });
        resetForm();
        setIsAddOfferOpen(false);
      },
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err.message || "Failed to create offer",
          variant: "destructive",
        });
      },
    });
  };

  const handleToggleStatus = (offer: DBOffer) => {
    updateMutation.mutate(
      {
        id: offer.id,
        data: { isActive: !offer.isActive },
      },
      {
        onSuccess: () => {
          toast({
            title: "Status Updated",
            description: `Offer status is now ${
              !offer.isActive ? "Active" : "Inactive"
            }.`,
          });
        },
        onError: (err: any) => {
          toast({
            title: "Error",
            description: err.message || "Failed to update status",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteOffer = (id: string) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Offer Deleted",
            description: "The offer has been successfully deleted.",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Error",
            description: err.message || "Failed to delete offer",
            variant: "destructive",
          });
        },
      });
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setOfferType("PERCENTAGE_DISCOUNT");
    setDiscountValue("");
    setMinPurchase("");
    setGiftDescription("");
    setCashbackDetails("");
    setExchangeDetails("");
    setStartDate("");
    setEndDate("");
  };

  const filteredOffers = offers.filter((o) => {
    const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || o.offerType === typeFilter;
    return matchesSearch && matchesType;
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
          <h1 className="text-2xl lg:text-3xl font-bold">Offers</h1>
          <p className="text-muted-foreground">
            Manage store promotions, gifts, cashback, and special campaign events
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOfferOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Offer
        </Button>
      </motion.div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {offers.filter((o) => o.isActive).length}
            </p>
            <p className="text-sm text-muted-foreground">Active Offers</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {new Set(offers.map((o) => o.offerType)).size}
            </p>
            <p className="text-sm text-muted-foreground">Promo Formats</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {offers.filter((o) => !o.isActive).length}
            </p>
            <p className="text-sm text-muted-foreground">Paused/Inactive</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{offers.length}</p>
            <p className="text-sm text-muted-foreground">Total Campaigns</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-soft">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="ALL">All Formats</option>
            {Object.entries(offerTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Offers Table / Empty state */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading campaigns...
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No offers found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
              Try adjusting your search query, or create a brand new marketing campaign.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Campaign Name</th>
                  <th className="px-6 py-4">Offer Format</th>
                  <th className="px-6 py-4">Benefit / Value</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOffers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {offer.name}
                        </p>
                        {offer.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {offer.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {offerTypeLabels[offer.offerType]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary">
                        {offer.offerType === "PERCENTAGE_DISCOUNT" && (
                          <span className="flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5" />
                            {offer.discountValue}% Off
                          </span>
                        )}
                        {offer.offerType === "FLAT_DISCOUNT" && (
                          <span>₹{offer.discountValue} Flat Off</span>
                        )}
                        {offer.offerType === "MAKING_CHARGE_DISCOUNT" && (
                          <span>{offer.discountValue}% off making charges</span>
                        )}
                        {offer.offerType === "FREE_GIFT" && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            {offer.giftDescription}
                          </span>
                        )}
                        {offer.offerType === "CASHBACK" && (
                          <span>{offer.cashbackDetails}</span>
                        )}
                        {offer.offerType === "EXCHANGE" && (
                          <span>{offer.exchangeDetails}</span>
                        )}
                        {!offer.discountValue &&
                          !offer.giftDescription &&
                          !offer.cashbackDetails &&
                          !offer.exchangeDetails &&
                          "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(offer)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors",
                          offer.isActive
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {offer.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {offer.startDate || offer.endDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {offer.startDate
                              ? new Date(offer.startDate).toLocaleDateString()
                              : "Start"}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                          <span>
                            {offer.endDate
                              ? new Date(offer.endDate).toLocaleDateString()
                              : "End"}
                          </span>
                        </div>
                      ) : (
                        "Always Active"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteOffer(offer.id)}
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

      {/* Add Offer Dialog */}
      <Dialog open={isAddOfferOpen} onOpenChange={setIsAddOfferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Marketing Offer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOffer} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Special discount"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Details of the target promotion"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="type">Offer Format</Label>
                <select
                  id="type"
                  value={offerType}
                  onChange={(e) => setOfferType(e.target.value as OfferType)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.entries(offerTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="minPurchase">Min Purchase Amount (₹)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  placeholder="e.g., 500"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                />
              </div>
            </div>

            {/* Conditional Fields based on OfferType */}
            {(offerType === "FLAT_DISCOUNT" ||
              offerType === "PERCENTAGE_DISCOUNT" ||
              offerType === "MAKING_CHARGE_DISCOUNT") && (
              <div className="space-y-1">
                <Label htmlFor="value">
                  {offerType === "PERCENTAGE_DISCOUNT" ||
                  offerType === "MAKING_CHARGE_DISCOUNT"
                    ? "Discount Percentage (%) *"
                    : "Discount Value (₹) *"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="e.g., 20"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                />
              </div>
            )}

            {offerType === "FREE_GIFT" && (
              <div className="space-y-1">
                <Label htmlFor="gift">Gift Description *</Label>
                <Input
                  id="gift"
                  placeholder="e.g., Free Shaker Bottle"
                  value={giftDescription}
                  onChange={(e) => setGiftDescription(e.target.value)}
                  required
                />
              </div>
            )}

            {offerType === "CASHBACK" && (
              <div className="space-y-1">
                <Label htmlFor="cashback">Cashback Terms *</Label>
                <Input
                  id="cashback"
                  placeholder="e.g., 5% cashback on HDFC cards"
                  value={cashbackDetails}
                  onChange={(e) => setCashbackDetails(e.target.value)}
                  required
                />
              </div>
            )}

            {offerType === "EXCHANGE" && (
              <div className="space-y-1">
                <Label htmlFor="exchange">Exchange Rules *</Label>
                <Input
                  id="exchange"
                  placeholder="e.g., get extra ₹1000 value on exchanges"
                  value={exchangeDetails}
                  onChange={(e) => setExchangeDetails(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="start">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="end">End Date</Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOfferOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Create Offer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
