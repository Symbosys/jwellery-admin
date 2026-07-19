import { useProductsQuery, useUpdateProductMutation } from '@/api/hooks/product.hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  ChevronUp,
  Info,
  Minus,
  PackageX,
  Plus,
  RefreshCw,
  Save,
  Search,
  TrendingUp
} from 'lucide-react';
import { Fragment, useState } from 'react';

interface StockAdjustment {
  productId: string;
  variantId?: string;
  originalQty: number;
  newQty: number;
}

export default function Inventory() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Track offline changes before saving
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Query products
  const { data, isLoading, isError, refetch } = useProductsQuery({
    limit: 100, // Load all products for full inventory view
    search: searchQuery || undefined,
  });

  const updateProductMutation = useUpdateProductMutation();

  const products = data?.products || [];

  // Toggle variant rows
  const toggleRow = (productId: string) => {
    setExpandedRows(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Quick adjust handlers
  const handleQtyChange = (idKey: string, currentVal: number, step: number) => {
    const currentAdjusted = adjustments[idKey] !== undefined ? adjustments[idKey] : currentVal;
    const newVal = Math.max(0, currentAdjusted + step);
    setAdjustments(prev => ({ ...prev, [idKey]: newVal }));
  };

  const handleInputChange = (idKey: string, value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setAdjustments(prev => ({ ...prev, [idKey]: parsed }));
    } else if (value === '') {
      setAdjustments(prev => ({ ...prev, [idKey]: 0 }));
    }
  };

  // Save stock level change for product
  const handleSaveStock = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Build update payload
    const updatedQty = adjustments[productId] !== undefined ? adjustments[productId] : product.quantity;

    // Build update variant payload if variants exist
    let updatedVariants = undefined;
    if (product.variants && product.variants.length > 0) {
      updatedVariants = product.variants.map(v => {
        const variantQty = adjustments[`${productId}-${v.id}`] !== undefined
          ? adjustments[`${productId}-${v.id}`]
          : v.quantity;
        return {
          sku: v.sku || undefined,
          price: Number(v.price),
          discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined,
          quantity: variantQty,
          image: v.image || "",
          attributeValues: (v.attributeValues || []).map((av: any) => typeof av === 'string' ? av : av.id)
        };
      });
    }

    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        data: {
          quantity: updatedQty,
          variants: updatedVariants
        }
      });

      // Clear the local adjustment tracking
      setAdjustments(prev => {
        const copy = { ...prev };
        delete copy[productId];
        if (product.variants) {
          product.variants.forEach(v => {
            delete copy[`${productId}-${v.id}`];
          });
        }
        return copy;
      });

      toast({
        title: "Stock Level Updated",
        description: `Successfully updated stock for "${product.name}".`,
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Failed to update inventory",
        variant: "destructive"
      });
    }
  };

  // Calculate high-fidelity stats
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const outOfStockItems = products.filter(p => p.quantity === 0).length;
  const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= 10).length;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * p.quantity), 0);

  // Filter products by stock type
  const filteredProducts = products.filter(p => {
    if (stockFilter === 'OUT_OF_STOCK') return p.quantity === 0;
    if (stockFilter === 'LOW_STOCK') return p.quantity > 0 && p.quantity <= 10;
    if (stockFilter === 'IN_STOCK') return p.quantity > 10;
    return true;
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
          <h1 className="text-2xl lg:text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Monitor and manage product stock levels, variants, and thresholds</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Sync Stock
        </Button>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Units in Stock</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{lowStockItems}</p>
            <p className="text-sm text-muted-foreground">Low Stock Alert (≤10)</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
            <PackageX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{outOfStockItems}</p>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm text-muted-foreground">Total Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-card border border-border rounded-xl p-4 shadow-soft">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-muted p-1 rounded-lg border border-border">
            {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStockFilter(filter)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  stockFilter === filter
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filter === 'ALL' && 'All'}
                {filter === 'IN_STOCK' && 'In Stock'}
                {filter === 'LOW_STOCK' && 'Low Stock'}
                {filter === 'OUT_OF_STOCK' && 'Out of Stock'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-soft">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground mt-2">Loading inventory list...</p>
        </div>
      ) : isError ? (
        <div className="bg-card border border-destructive/20 rounded-xl p-12 text-center text-muted-foreground shadow-soft">
          <Info className="w-10 h-10 mx-auto mb-3 text-destructive opacity-80" />
          <p className="font-semibold text-lg text-foreground">Failed to load inventory data</p>
          <p className="text-sm mt-1">Please try again or contact support.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground shadow-soft">
          <Info className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-semibold text-lg text-foreground">No inventory records found</p>
          <p className="text-sm mt-1">Try resetting filters or adjusting search queries.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Base SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-48 text-center">Stock Level</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const hasVariants = product.variants && product.variants.length > 0;
                  const isExpanded = !!expandedRows[product.id];
                  const hasPendingChanges = adjustments[product.id] !== undefined ||
                    (product.variants?.some(v => adjustments[`${product.id}-${v.id}`] !== undefined) ?? false);

                  // Current quantity (considering local unsaved adjustments)
                  const displayQty = adjustments[product.id] !== undefined ? adjustments[product.id] : product.quantity;

                  return (
                    <Fragment key={product.id}>
                      <TableRow key={product.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell>
                          {hasVariants && (
                            <button onClick={() => toggleRow(product.id)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-semibold text-foreground block">{product.name}</span>
                              <span className="text-xs text-muted-foreground block">{product.brand || 'No Brand'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {product.variants?.[0]?.sku || 'N/A'}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{Number(product.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {displayQty === 0 ? (
                            <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Out of Stock</Badge>
                          ) : displayQty <= 10 ? (
                            <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Low Stock</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQtyChange(product.id, product.quantity, -1)}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <Input
                              type="number"
                              className="h-8 w-20 text-center font-bold px-1"
                              value={displayQty}
                              onChange={(e) => handleInputChange(product.id, e.target.value)}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQtyChange(product.id, product.quantity, 1)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <AnimatePresence>
                            {hasPendingChanges && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                              >
                                <Button
                                  size="sm"
                                  className="h-8 gap-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => handleSaveStock(product.id)}
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  Save
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </TableCell>
                      </TableRow>

                      {/* Variants Sub-table */}
                      {hasVariants && isExpanded && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={7} className="p-4">
                            <div className="pl-10 space-y-3">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Variants Stock</h4>
                              <div className="bg-card border border-border rounded-lg overflow-hidden max-w-3xl">
                                <Table>
                                  <TableHeader className="bg-muted/50">
                                    <TableRow>
                                      <TableHead className="text-xs">Variant Specification</TableHead>
                                      <TableHead className="text-xs">SKU</TableHead>
                                      <TableHead className="text-xs text-center w-48">Stock Level</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {product.variants?.map((variant) => {
                                      const specs = variant.attributeValues.map(av => `${av.attribute.name}: ${av.value}`).join(', ');
                                      const variantKey = `${product.id}-${variant.id}`;
                                      const displayVariantQty = adjustments[variantKey] !== undefined ? adjustments[variantKey] : variant.quantity;

                                      return (
                                        <TableRow key={variant.id} className="hover:bg-muted/20">
                                          <TableCell className="font-medium text-xs">
                                            {specs || 'Default'}
                                          </TableCell>
                                          <TableCell className="font-mono text-[11px] text-muted-foreground">
                                            {variant.sku || 'N/A'}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => handleQtyChange(variantKey, variant.quantity, -1)}
                                              >
                                                <Minus className="w-3 h-3" />
                                              </Button>
                                              <Input
                                                type="number"
                                                className="h-7 w-16 text-center font-semibold text-xs px-1"
                                                value={displayVariantQty}
                                                onChange={(e) => handleInputChange(variantKey, e.target.value)}
                                              />
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => handleQtyChange(variantKey, variant.quantity, 1)}
                                              >
                                                <Plus className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
