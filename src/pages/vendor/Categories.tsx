import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Folder,
  GripVertical,
  ChevronRight,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const categories = [
  {
    id: 1,
    name: 'Electronics',
    icon: '📱',
    productCount: 156,
    subcategories: ['Smartphones', 'Laptops', 'Audio', 'Accessories'],
  },
  {
    id: 2,
    name: 'Fashion',
    icon: '👕',
    productCount: 89,
    subcategories: ['Men', 'Women', 'Kids', 'Footwear'],
  },
  {
    id: 3,
    name: 'Home & Living',
    icon: '🏠',
    productCount: 67,
    subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding'],
  },
  {
    id: 4,
    name: 'Beauty',
    icon: '💄',
    productCount: 45,
    subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrances'],
  },
  {
    id: 5,
    name: 'Sports',
    icon: '⚽',
    productCount: 34,
    subcategories: ['Equipment', 'Clothing', 'Footwear', 'Accessories'],
  },
];

export default function Categories() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize your products by category</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input placeholder="Enter category name" />
              </div>
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input placeholder="📦" className="w-20" />
              </div>
              <div className="space-y-2">
                <Label>Parent Category (optional)</Label>
                <Input placeholder="Select parent category" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                  Create Category
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl shadow-soft overflow-hidden"
          >
            <div 
              className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => setExpandedCategory(
                expandedCategory === category.id ? null : category.id
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.productCount} products • {category.subcategories.length} subcategories
                  </p>
                </div>
                <ChevronRight className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform",
                  expandedCategory === category.id && "rotate-90"
                )} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Plus className="mr-2 h-4 w-4" /> Add Subcategory
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Subcategories */}
            {expandedCategory === category.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-border bg-muted/20"
              >
                <div className="p-3 space-y-1">
                  {category.subcategories.map((sub, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-background transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{sub}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subcategory
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
