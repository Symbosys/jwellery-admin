import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  Upload,
  Package,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useProductsQuery, useDeleteProductMutation } from '@/api/hooks/product.hooks';
import { useCategoriesQuery } from '@/api/hooks/category.hooks';
import { AttributeManagerModal } from '@/components/vendor/AttributeManagerModal';

const statusStyles = {
  active: 'badge-success',
  draft: 'badge-muted',
  low_stock: 'badge-warning',
  out_of_stock: 'badge-destructive',
};

const statusLabels = {
  active: 'Active',
  draft: 'Draft',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

const getProductStatus = (qty: number) => {
  if (qty === 0) return 'out_of_stock';
  if (qty <= 10) return 'low_stock';
  return 'active';
};

export default function Products() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);

  const { data: categoriesData } = useCategoriesQuery();
  const { data: productsData, isLoading } = useProductsQuery({
    search: searchQuery || undefined,
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
    limit: 50,
  });
  const deleteMutation = useDeleteProductMutation();

  const productsList = productsData?.products || [];

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedProducts.length === productsList.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productsList.map(p => p.id));
    }
  };

  const handleView = (id: string) => {
    navigate(`/products/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/products/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Product Deleted', description: 'Product has been deleted successfully' });
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
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsAttributeModalOpen(true)}>
            <Tag className="w-4 h-4" />
            Manage Attributes
          </Button>
          <Button className="gap-2" onClick={() => navigate('/products/new')}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-4 shadow-soft"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesData?.categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-3 mt-4 pt-4 border-t border-border"
          >
            <span className="text-sm text-muted-foreground">
              {selectedProducts.length} selected
            </span>
            <Button variant="outline" size="sm">Publish</Button>
            <Button variant="outline" size="sm">Unpublish</Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              Delete
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Products Table */}
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
                <th className="table-header px-5 py-3 text-left w-12">
                  <Checkbox
                    checked={selectedProducts.length === productsList.length && productsList.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="table-header px-5 py-3 text-left">Product</th>
                <th className="table-header px-5 py-3 text-left hidden md:table-cell">SKU</th>
                <th className="table-header px-5 py-3 text-left hidden lg:table-cell">Category</th>
                <th className="table-header px-5 py-3 text-left">Stock</th>
                <th className="table-header px-5 py-3 text-left">Price</th>
                <th className="table-header px-5 py-3 text-left">Status</th>
                <th className="table-header px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              ) : productsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                productsList.map((product, index) => {
                  const status = getProductStatus(product.quantity);
                  const sku = product.variants?.[0]?.sku || 'N/A';
                  const categoryName = product.category?.name || 'N/A';
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-muted"
                          />
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground font-mono">{sku}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm">{categoryName}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          "font-medium",
                          product.quantity === 0 && "text-destructive",
                          product.quantity > 0 && product.quantity <= 10 && "text-warning"
                        )}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium">₹{Number(product.price).toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={cn(statusStyles[status as keyof typeof statusStyles])}>
                          {statusLabels[status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(product.id)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(product.id)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {productsList.length} products
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </motion.div>

      <AttributeManagerModal
        open={isAttributeModalOpen}
        onOpenChange={setIsAttributeModalOpen}
      />
    </div>
  );
}
