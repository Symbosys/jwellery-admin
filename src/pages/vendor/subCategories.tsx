import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Folder,
  Info,
  Tag,
  Loader2
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  useCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  DBCategory,
  DBSubCategory,
} from '@/api/hooks/category.hooks';

export default function SubCategories() {
  const { toast } = useToast();
  
  // Live Query
  const { data: categoriesData, isLoading } = useCategoriesQuery({ limit: 100 });
  const categoriesList = categoriesData?.categories || [];

  // Mutations
  const createSubMutation = useCreateSubCategoryMutation();
  const updateSubMutation = useUpdateSubCategoryMutation();
  const deleteSubMutation = useDeleteSubCategoryMutation();

  // Dialog & Form States
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState('');
  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');

  const [editSub, setEditSub] = useState<DBSubCategory | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubDesc, setEditSubDesc] = useState('');
  const [editParentCategoryId, setEditParentCategoryId] = useState('');
  const [subImage, setSubImage] = useState<File | null>(null);
  const [editSubImageFile, setEditSubImageFile] = useState<File | null>(null);

  // Extract all subcategories for display
  const subCategoriesList = categoriesList.flatMap(category => 
    (category.subCategories || []).map(sub => ({
      ...sub,
      categoryName: category.name,
    }))
  );

  // Handlers
  const handleCreateSubCategory = async () => {
    if (!selectedParentCategoryId) {
      toast({ title: 'Validation Error', description: 'Parent Category is required', variant: 'destructive' });
      return;
    }
    if (!subName.trim()) {
      toast({ title: 'Validation Error', description: 'Subcategory Name is required', variant: 'destructive' });
      return;
    }
    if (!subImage) {
      toast({ title: 'Validation Error', description: 'Subcategory Image is required', variant: 'destructive' });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', subName.trim());
      formData.append('categoryId', selectedParentCategoryId);
      if (subDesc.trim()) {
        formData.append('description', subDesc.trim());
      }
      if (subImage) {
        formData.append('image', subImage);
      }

      await createSubMutation.mutateAsync(formData);
      toast({ title: 'Subcategory Created', description: 'New subcategory has been successfully created' });
      setSubName('');
      setSubDesc('');
      setSubImage(null);
      setSelectedParentCategoryId('');
      setIsAddSubOpen(false);
    } catch (err: any) {
      toast({ title: 'Error Creating Subcategory', description: err.message || 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleUpdateSubCategory = async () => {
    if (!editSub) return;
    if (!editSubName.trim()) {
      toast({ title: 'Validation Error', description: 'Subcategory Name is required', variant: 'destructive' });
      return;
    }
    if (!editParentCategoryId) {
      toast({ title: 'Validation Error', description: 'Parent Category is required', variant: 'destructive' });
      return;
    }
    if (!editSub.image && !editSubImageFile) {
      toast({ title: 'Validation Error', description: 'Subcategory Image is required', variant: 'destructive' });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', editSubName.trim());
      formData.append('categoryId', editParentCategoryId);
      if (editSubDesc.trim()) {
        formData.append('description', editSubDesc.trim());
      }
      if (editSubImageFile) {
        formData.append('image', editSubImageFile);
      }

      await updateSubMutation.mutateAsync({
        id: editSub.id,
        data: formData,
      });
      toast({ title: 'Subcategory Updated', description: 'Subcategory has been successfully updated' });
      setEditSub(null);
      setEditSubImageFile(null);
    } catch (err: any) {
      toast({ title: 'Error Updating Subcategory', description: err.message || 'Something went wrong', variant: 'destructive' });
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
          <h1 className="text-2xl lg:text-3xl font-bold">Subcategories</h1>
          <p className="text-muted-foreground">Manage and organize your product subcategories</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddSubOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Subcategory
        </Button>
      </motion.div>

      {/* Main Content Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground animate-pulse font-medium text-lg">Loading subcategories...</p>
        </div>
      ) : subCategoriesList.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">No subcategories found</p>
          <p className="text-sm">Click 'Add Subcategory' to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subCategoriesList.map((sub, index) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="bg-card border border-border rounded-xl shadow-soft p-4 flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 overflow-hidden flex items-center justify-center text-primary flex-shrink-0">
                {sub.image ? (
                  <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                ) : (
                  <Folder className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base truncate">{sub.name}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditSub(sub);
                        setEditSubName(sub.name);
                        setEditSubDesc(sub.description || '');
                        setEditParentCategoryId(sub.categoryId);
                        setEditSubImageFile(null);
                      }}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSubCategory(sub.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Parent Category Badge */}
                <div className="flex items-center gap-1.5 mt-1">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                    {sub.categoryName}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {sub.description || 'No description provided.'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Subcategory Dialog */}
      <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="parent-cat-select">Parent Category *</Label>
              <Select value={selectedParentCategoryId} onValueChange={setSelectedParentCategoryId}>
                <SelectTrigger id="parent-cat-select">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesList.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcat-name">Subcategory Name *</Label>
              <Input 
                id="subcat-name"
                placeholder="Enter subcategory name" 
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcat-image">Image File</Label>
              <Input 
                id="subcat-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSubImage(e.target.files[0]);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcat-desc">Description</Label>
              <Textarea 
                id="subcat-desc"
                placeholder="Write a brief description..." 
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4 justify-end">
              <Button variant="outline" onClick={() => setIsAddSubOpen(false)} disabled={createSubMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleCreateSubCategory} disabled={createSubMutation.isPending}>
                {createSubMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Subcategory
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
              <Label htmlFor="edit-parent-cat">Parent Category *</Label>
              <Select value={editParentCategoryId} onValueChange={setEditParentCategoryId}>
                <SelectTrigger id="edit-parent-cat">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesList.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subcat-name">Subcategory Name *</Label>
              <Input 
                id="edit-subcat-name"
                value={editSubName}
                onChange={(e) => setEditSubName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subcat-image">Image File</Label>
              {editSub?.image && (
                <div className="mb-2">
                  <img src={editSub.image} alt="Current" className="w-16 h-16 object-cover rounded-md border" />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to keep this image</p>
                </div>
              )}
              <Input 
                id="edit-subcat-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setEditSubImageFile(e.target.files[0]);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subcat-desc">Description</Label>
              <Textarea 
                id="edit-subcat-desc"
                value={editSubDesc}
                onChange={(e) => setEditSubDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4 justify-end">
              <Button variant="outline" onClick={() => setEditSub(null)} disabled={updateSubMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSubCategory} disabled={updateSubMutation.isPending}>
                {updateSubMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
