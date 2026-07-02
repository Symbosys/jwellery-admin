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
  Info,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  DBCategory,
  DBSubCategory,
} from '@/api/hooks/category.hooks';

const getCategoryEmoji = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('electronic') || n.includes('phone') || n.includes('laptop') || n.includes('audio') || n.includes('gadget') || n.includes('tech')) return '📱';
  if (n.includes('fashion') || n.includes('clot') || n.includes('shirt') || n.includes('wear') || n.includes('dress') || n.includes('shoe')) return '👕';
  if (n.includes('home') || n.includes('furniture') || n.includes('kitchen') || n.includes('decor') || n.includes('bed')) return '🏠';
  if (n.includes('beauty') || n.includes('cosmetic') || n.includes('makeup') || n.includes('care') || n.includes('fragrance')) return '💄';
  if (n.includes('sport') || n.includes('fit') || n.includes('game') || n.includes('play')) return '⚽';
  if (n.includes('toy') || n.includes('kid') || n.includes('baby')) return '🧸';
  if (n.includes('book') || n.includes('read')) return '📚';
  if (n.includes('food') || n.includes('grocery') || n.includes('eat')) return '🍎';
  return '📦';
};

const CATEGORY_PRESETS = [
  { name: 'Electronics', url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop' },
  { name: 'Fashion', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop' },
  { name: 'Home & Living', url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=400&fit=crop' },
  { name: 'Beauty', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop' },
  { name: 'Sports', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop' },
  { name: 'Books', url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop' },
  { name: 'Toys', url: 'https://images.unsplash.com/photo-1539627831859-a911cf04d3cd?w=400&h=400&fit=crop' },
  { name: 'Food & Groceries', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop' }
];

const CategoryImage = ({ src, name }: { src: string | null; name: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <span>{getCategoryEmoji(name)}</span>;
  }

  return (
    <img 
      src={src} 
      alt={name} 
      className="w-full h-full object-cover" 
      onError={() => setHasError(true)}
    />
  );
};

export default function Categories() {
  const { toast } = useToast();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Live Query
  const { data: categoriesData, isLoading } = useCategoriesQuery({ limit: 100 });
  const categoriesList = categoriesData?.categories || [];

  // Mutations
  const createCatMutation = useCreateCategoryMutation();
  const updateCatMutation = useUpdateCategoryMutation();
  const deleteCatMutation = useDeleteCategoryMutation();

  const createSubMutation = useCreateSubCategoryMutation();
  const updateSubMutation = useUpdateSubCategoryMutation();
  const deleteSubMutation = useDeleteSubCategoryMutation();

  // Dialog & Form States
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catFile, setCatFile] = useState<File | null>(null);
  const [catImageMode, setCatImageMode] = useState<'url' | 'upload' | 'preset'>('preset');

  const [activeParentCat, setActiveParentCat] = useState<DBCategory | null>(null);
  const [subCatName, setSubCatName] = useState('');
  const [subCatDesc, setSubCatDesc] = useState('');

  const [editCat, setEditCat] = useState<DBCategory | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatImage, setEditCatImage] = useState('');
  const [editCatFile, setEditCatFile] = useState<File | null>(null);
  const [editCatImageMode, setEditCatImageMode] = useState<'url' | 'upload' | 'preset'>('preset');

  const [editSub, setEditSub] = useState<DBSubCategory | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubDesc, setEditSubDesc] = useState('');

  // Handlers
  const handleCreateCategory = async () => {
    if (!catName.trim()) {
      toast({ title: 'Validation Error', description: 'Category Name is required', variant: 'destructive' });
      return;
    }
    try {
      if (catImageMode === 'upload' && catFile) {
        const formData = new FormData();
        formData.append('name', catName.trim());
        if (catDesc.trim()) formData.append('description', catDesc.trim());
        formData.append('image', catFile);
        
        await createCatMutation.mutateAsync(formData);
      } else {
        await createCatMutation.mutateAsync({
          name: catName.trim(),
          description: catDesc.trim() || undefined,
          image: catImage.trim() || undefined,
        });
      }
      toast({ title: 'Category Created', description: 'New category has been successfully created' });
      setCatName('');
      setCatDesc('');
      setCatImage('');
      setCatFile(null);
      setCatImageMode('preset');
      setIsAddCatOpen(false);
    } catch (err: any) {
      toast({ title: 'Error Creating Category', description: err.message || 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleCreateSubCategory = async () => {
    if (!activeParentCat) return;
    if (!subCatName.trim()) {
      toast({ title: 'Validation Error', description: 'Subcategory Name is required', variant: 'destructive' });
      return;
    }
    try {
      await createSubMutation.mutateAsync({
        name: subCatName.trim(),
        description: subCatDesc.trim() || '',
        categoryId: activeParentCat.id,
      });
      toast({ title: 'Subcategory Created', description: 'New subcategory has been successfully created' });
      setSubCatName('');
      setSubCatDesc('');
      setActiveParentCat(null);
    } catch (err: any) {
      toast({ title: 'Error Creating Subcategory', description: err.message || 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCat) return;
    if (!editCatName.trim()) {
      toast({ title: 'Validation Error', description: 'Category Name is required', variant: 'destructive' });
      return;
    }
    try {
      if (editCatImageMode === 'upload' && editCatFile) {
        const formData = new FormData();
        formData.append('name', editCatName.trim());
        if (editCatDesc.trim()) {
          formData.append('description', editCatDesc.trim());
        } else {
          formData.append('description', '');
        }
        formData.append('image', editCatFile);

        await updateCatMutation.mutateAsync({
          id: editCat.id,
          data: formData,
        });
      } else {
        await updateCatMutation.mutateAsync({
          id: editCat.id,
          data: {
            name: editCatName.trim(),
            description: editCatDesc.trim() || null,
            image: editCatImage.trim() || null,
          },
        });
      }
      toast({ title: 'Category Updated', description: 'Category has been successfully updated' });
      setEditCat(null);
      setEditCatFile(null);
      setEditCatImage('');
    } catch (err: any) {
      toast({ title: 'Error Updating Category', description: err.message || 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleUpdateSubCategory = async () => {
    if (!editSub) return;
    if (!editSubName.trim()) {
      toast({ title: 'Validation Error', description: 'Subcategory Name is required', variant: 'destructive' });
      return;
    }
    try {
      await updateSubMutation.mutateAsync({
        id: editSub.id,
        data: {
          name: editSubName.trim(),
          description: editSubDesc.trim(),
          categoryId: editSub.categoryId,
        },
      });
      toast({ title: 'Subcategory Updated', description: 'Subcategory has been successfully updated' });
      setEditSub(null);
    } catch (err: any) {
      toast({ title: 'Error Updating Subcategory', description: err.message || 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All its subcategories will be deleted.')) return;
    try {
      await deleteCatMutation.mutateAsync(id);
      toast({ title: 'Category Deleted', description: 'Category has been deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error Deleting Category', description: err.message || 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleDeleteSubCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await deleteSubMutation.mutateAsync(id);
      toast({ title: 'Subcategory Deleted', description: 'Subcategory has been deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error Deleting Subcategory', description: err.message || 'Something went wrong', variant: 'destructive' });
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
          <h1 className="text-2xl lg:text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize your products by category</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddCatOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </motion.div>

      {/* Main Categories Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground animate-pulse font-medium text-lg">Loading categories...</p>
        </div>
      ) : categoriesList.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">No categories found</p>
          <p className="text-sm">Click 'Add Category' to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesList.map((category, index) => {
            const productCount = category._count?.products || 0;
            const subcategoriesCount = category.subCategories?.length || 0;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
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
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl overflow-hidden border border-border">
                      <CategoryImage src={category.image} name={category.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{category.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {productCount} products • {subcategoriesCount} subcategories
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
                        <DropdownMenuItem onClick={() => {
                          setEditCat(category);
                          setEditCatName(category.name);
                          setEditCatDesc(category.description || '');
                          setEditCatImage(category.image || '');
                          setEditCatFile(null);
                          setEditCatImageMode(category.image ? 'url' : 'preset');
                        }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setActiveParentCat(category);
                          setSubCatName('');
                          setSubCatDesc('');
                        }}>
                          <Plus className="mr-2 h-4 w-4" /> Add Subcategory
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Subcategories Expanded */}
                {expandedCategory === category.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-border bg-muted/20"
                  >
                    <div className="p-3 space-y-1">
                      {category.subCategories && category.subCategories.length > 0 ? (
                        category.subCategories.map((sub) => (
                          <div 
                            key={sub.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-background transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Folder className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{sub.name}</span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditSub(sub);
                                  setEditSubName(sub.name);
                                  setEditSubDesc(sub.description || '');
                                }}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSubCategory(sub.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">No subcategories yet</p>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-2 text-primary hover:text-primary hover:bg-primary/5"
                        onClick={() => {
                          setActiveParentCat(category);
                          setSubCatName('');
                          setSubCatDesc('');
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subcategory
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="add-cat-name">Category Name *</Label>
              <Input 
                id="add-cat-name"
                placeholder="Enter category name" 
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-cat-desc">Description</Label>
              <Textarea 
                id="add-cat-desc"
                placeholder="Write a brief description..." 
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>Category Image</Label>
              <div className="flex gap-2 p-1 bg-muted/50 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setCatImageMode('preset')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                    catImageMode === 'preset' 
                      ? "bg-background text-foreground shadow-sm font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setCatImageMode('upload')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                    catImageMode === 'upload' 
                      ? "bg-background text-foreground shadow-sm font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setCatImageMode('url')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                    catImageMode === 'url' 
                      ? "bg-background text-foreground shadow-sm font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Image URL
                </button>
              </div>

              {catImageMode === 'preset' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORY_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setCatImage(preset.url);
                          setCatFile(null);
                        }}
                        className={cn(
                          "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.03]",
                          catImage === preset.url ? "border-primary" : "border-transparent"
                        )}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-end justify-center p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-semibold text-white truncate w-full text-center">{preset.name}</span>
                        </div>
                        {catImage === preset.url && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {catImageMode === 'upload' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-full">
                    <label className={cn(
                      "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all bg-muted/10 hover:bg-muted/20",
                      catFile ? "border-primary" : "border-border hover:border-muted-foreground"
                    )}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {catFile ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                              <img src={URL.createObjectURL(catFile)} alt="Upload Preview" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xs font-semibold text-foreground truncate max-w-[200px] mt-1">{catFile.name}</p>
                            <p className="text-[10px] text-muted-foreground">Click or drag to change file</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">Click to upload file</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (Max 2MB)</p>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCatFile(file);
                            setCatImage('');
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>
              )}

              {catImageMode === 'url' && (
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={catImage}
                    onChange={(e) => {
                      setCatImage(e.target.value);
                      setCatFile(null);
                    }}
                  />
                  {catImage && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border mt-2">
                      <img src={catImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4 justify-end">
              <Button variant="outline" onClick={() => setIsAddCatOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={!!activeParentCat} onOpenChange={(open) => !open && setActiveParentCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subcategory to {activeParentCat?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="add-subcat-name">Subcategory Name *</Label>
              <Input 
                id="add-subcat-name"
                placeholder="Enter subcategory name" 
                value={subCatName}
                onChange={(e) => setSubCatName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-subcat-desc">Description</Label>
              <Textarea 
                id="add-subcat-desc"
                placeholder="Write a brief description..." 
                value={subCatDesc}
                onChange={(e) => setSubCatDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4 justify-end">
              <Button variant="outline" onClick={() => setActiveParentCat(null)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSubCategory}>
                Create Subcategory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editCat} onOpenChange={(open) => !open && setEditCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cat-name">Category Name *</Label>
              <Input 
                id="edit-cat-name"
                value={editCatName}
                onChange={(e) => setEditCatName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cat-desc">Description</Label>
              <Textarea 
                id="edit-cat-desc"
                value={editCatDesc}
                onChange={(e) => setEditCatDesc(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>Category Image</Label>
              <div className="flex gap-2 p-1 bg-muted/50 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setEditCatImageMode('preset')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                    editCatImageMode === 'preset' 
                      ? "bg-background text-foreground shadow-sm font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setEditCatImageMode('upload')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                    editCatImageMode === 'upload' 
                      ? "bg-background text-foreground shadow-sm font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setEditCatImageMode('url')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                    editCatImageMode === 'url' 
                      ? "bg-background text-foreground shadow-sm font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Image URL
                </button>
              </div>

              {editCatImageMode === 'preset' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORY_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setEditCatImage(preset.url);
                          setEditCatFile(null);
                        }}
                        className={cn(
                          "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.03]",
                          editCatImage === preset.url ? "border-primary" : "border-transparent"
                        )}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-end justify-center p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-semibold text-white truncate w-full text-center">{preset.name}</span>
                        </div>
                        {editCatImage === preset.url && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {editCatImageMode === 'upload' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-full">
                    <label className={cn(
                      "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all bg-muted/10 hover:bg-muted/20",
                      editCatFile ? "border-primary" : "border-border hover:border-muted-foreground"
                    )}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {editCatFile ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                              <img src={URL.createObjectURL(editCatFile)} alt="Upload Preview" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xs font-semibold text-foreground truncate max-w-[200px] mt-1">{editCatFile.name}</p>
                            <p className="text-[10px] text-muted-foreground">Click or drag to change file</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">Click to upload file</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (Max 2MB)</p>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEditCatFile(file);
                            setEditCatImage('');
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>
              )}

              {editCatImageMode === 'url' && (
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={editCatImage}
                    onChange={(e) => {
                      setEditCatImage(e.target.value);
                      setEditCatFile(null);
                    }}
                  />
                  {editCatImage && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border mt-2">
                      <img src={editCatImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4 justify-end">
              <Button variant="outline" onClick={() => setEditCat(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCategory}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={!!editSub} onOpenChange={(open) => !open && setEditSub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sub-name">Subcategory Name *</Label>
              <Input 
                id="edit-sub-name"
                value={editSubName}
                onChange={(e) => setEditSubName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sub-desc">Description</Label>
              <Textarea 
                id="edit-sub-desc"
                value={editSubDesc}
                onChange={(e) => setEditSubDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4 justify-end">
              <Button variant="outline" onClick={() => setEditSub(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSubCategory}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
