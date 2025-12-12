import { useState } from 'react';
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
  Package
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

const products = [
  {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    sku: 'WBH-001',
    category: 'Electronics',
    stock: 145,
    price: 129.99,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
  },
  {
    id: 2,
    name: 'Smart Watch Series 5',
    sku: 'SWS-005',
    category: 'Electronics',
    stock: 89,
    price: 299.00,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
  },
  {
    id: 3,
    name: 'Premium Leather Wallet',
    sku: 'PLW-012',
    category: 'Accessories',
    stock: 5,
    price: 49.99,
    status: 'low_stock',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=100&h=100&fit=crop',
  },
  {
    id: 4,
    name: 'Mechanical Gaming Keyboard',
    sku: 'MGK-007',
    category: 'Electronics',
    stock: 0,
    price: 159.00,
    status: 'out_of_stock',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100&h=100&fit=crop',
  },
  {
    id: 5,
    name: 'Portable Bluetooth Speaker',
    sku: 'PBS-003',
    category: 'Electronics',
    stock: 234,
    price: 79.99,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop',
  },
  {
    id: 6,
    name: 'Stainless Steel Water Bottle',
    sku: 'SSWB-018',
    category: 'Home & Living',
    stock: 67,
    price: 24.99,
    status: 'draft',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100&h=100&fit=crop',
  },
];

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

export default function Products() {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleProduct = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
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
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
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
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="home">Home & Living</SelectItem>
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
                    checked={selectedProducts.length === products.length}
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
              {products.map((product, index) => (
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
                    <span className="text-sm text-muted-foreground font-mono">{product.sku}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm">{product.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "font-medium",
                      product.stock === 0 && "text-destructive",
                      product.stock > 0 && product.stock <= 10 && "text-warning"
                    )}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium">${product.price.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={cn(statusStyles[product.status as keyof typeof statusStyles])}>
                      {statusLabels[product.status as keyof typeof statusLabels]}
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing 1-6 of 342 products
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
