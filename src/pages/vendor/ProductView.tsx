import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProductDetailQuery, useDeleteProductMutation, useUpdateProductMutation } from '@/api/hooks/product.hooks';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Package,
  DollarSign,
  Tag,
  BarChart3,
  Eye,
  ShoppingCart,
  Star,
  TrendingUp,
  Archive,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AttributeManagerModal } from '@/components/vendor/AttributeManagerModal';
import { ProductVariantManagerModal } from '@/components/vendor/ProductVariantManagerModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const productsData: Record<string, any> = {
  '1': {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with noise cancellation technology. Experience crystal-clear audio with deep bass and exceptional comfort for extended listening sessions.',
    sku: 'WBH-001',
    category: 'Electronics',
    subcategory: 'Audio',
    price: 129.99,
    comparePrice: 159.99,
    cost: 65.00,
    stock: 145,
    lowStockThreshold: 10,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
    ],
    variants: [
      { id: 1, name: 'Black', sku: 'WBH-001-BLK', stock: 80, price: 129.99 },
      { id: 2, name: 'White', sku: 'WBH-001-WHT', stock: 65, price: 129.99 },
    ],
    stats: {
      views: 1234,
      orders: 89,
      revenue: 11579.11,
      rating: 4.7,
      reviews: 45,
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  '2': {
    id: 2,
    name: 'Smart Watch Series 5',
    description: 'Advanced smartwatch with health monitoring, GPS tracking, and water resistance up to 50 meters.',
    sku: 'SWS-005',
    category: 'Electronics',
    subcategory: 'Wearables',
    price: 299.00,
    comparePrice: 349.00,
    cost: 150.00,
    stock: 89,
    lowStockThreshold: 15,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    ],
    variants: [],
    stats: {
      views: 2567,
      orders: 156,
      revenue: 46644.00,
      rating: 4.9,
      reviews: 112,
    },
    createdAt: '2024-01-05',
    updatedAt: '2024-01-14',
  },
};

const statusStyles: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  draft: 'bg-muted text-muted-foreground border-muted',
  low_stock: 'bg-warning/10 text-warning border-warning/20',
  out_of_stock: 'bg-destructive/10 text-destructive border-destructive/20',
  archived: 'bg-muted text-muted-foreground border-muted',
};

const getProductStatus = (qty: number) => {
  if (qty === 0) return 'out_of_stock';
  if (qty <= 10) return 'low_stock';
  return 'active';
};

export default function ProductView() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: product, isLoading } = useProductDetailQuery(productId || "");
  const deleteMutation = useDeleteProductMutation();
  const updateMutation = useUpdateProductMutation();

  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse font-medium text-lg">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground font-medium text-lg">Product not found</p>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const status = getProductStatus(product.quantity || 0);
  const sku = product.variants?.[0]?.sku || 'N/A';
  const categoryName = product.category?.name || 'N/A';
  const subcategoryName = product.subCategory?.name || 'N/A';
  const imagesList = Array.isArray(product.images)
    ? product.images
    : (typeof product.images === 'string'
      ? JSON.parse(product.images)
      : []);

  const cost = 0;
  const profit = Number(product.price) - cost;
  const margin = product.price ? ((profit / Number(product.price)) * 100).toFixed(1) : '0';
  const stats = {
    views: 1234,
    orders: 89,
    revenue: 11579.11,
    rating: product.rating || 4.5,
    reviews: product.numReviews || 12,
  };


  const handleArchive = () => {
    toast({ title: 'Product Archived', description: 'Product has been moved to archive' });
    navigate('/products');
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(product.id);
      toast({ title: 'Product Deleted', description: 'Product has been deleted successfully' });
      navigate('/products');
    } catch (err: any) {
      toast({
        title: 'Error Deleting Product',
        description: err.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
              <Badge variant="outline" className={cn('border', statusStyles[status])}>
                {status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">SKU: {sku}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate(`/products/${product.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
          <Button variant="outline" onClick={() => setIsAttributeModalOpen(true)}>
            <Tag className="w-4 h-4 mr-2" />
            Attributes
          </Button>
          <Button variant="outline" onClick={() => setIsVariantModalOpen(true)}>
            <Package className="w-4 h-4 mr-2" />
            Variants
          </Button>

          <Button variant="outline" onClick={handleArchive}>
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Eye className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.views.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <ShoppingCart className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.orders}</p>
                <p className="text-sm text-muted-foreground">Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.revenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Star className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rating}</p>
                <p className="text-sm text-muted-foreground">{stats.reviews} reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{margin}%</p>
                <p className="text-sm text-muted-foreground">Margin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {imagesList.map((img: string, index: number) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Variants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-sm font-medium text-muted-foreground">Variant</th>
                          <th className="text-left py-2 text-sm font-medium text-muted-foreground">SKU</th>
                          <th className="text-left py-2 text-sm font-medium text-muted-foreground">Stock</th>
                          <th className="text-left py-2 text-sm font-medium text-muted-foreground">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.variants?.map((variant: any) => {
                          const variantName = variant.attributeValues?.map((av: any) => av.value).join(' / ') || 'Standard';
                          return (
                            <tr key={variant.id} className="border-b border-border last:border-0">
                              <td className="py-3 font-medium">{variantName}</td>
                              <td className="py-3 text-muted-foreground font-mono text-sm">{variant.sku || 'N/A'}</td>
                              <td className="py-3">{variant.quantity}</td>
                              <td className="py-3">${Number(variant.price).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold text-lg">${Number(product.price).toFixed(2)}</span>
                </div>
                {product.discountPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount Price</span>
                    <span className="text-muted-foreground">${Number(product.discountPrice).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost</span>
                  <span>${cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profit</span>
                  <span className="text-success">${profit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin</span>
                  <span>{margin}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Inventory */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Stock</span>
                  <span className={cn(
                    "font-semibold",
                    product.quantity <= 10 && "text-warning"
                  )}>
                    {product.quantity} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low Stock Alert</span>
                  <span>10 units</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Organization */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{categoryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subcategory</span>
                  <span>{subcategoryName}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <ProductVariantManagerModal 
        open={isVariantModalOpen}
        onOpenChange={setIsVariantModalOpen}
        productId={productId!}
        existingVariants={product.variants || []}
      />

      <AttributeManagerModal 
        open={isAttributeModalOpen} 
        onOpenChange={setIsAttributeModalOpen} 
      />
    </div>
  );
}
