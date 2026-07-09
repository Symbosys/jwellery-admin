import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Upload,
  Search,
  CheckCircle,
  XCircle,
  HelpCircle,
  Eye,
  Clock,
  User,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  DBBlog,
} from "@/api/hooks/blog.hooks";

const BLOG_PRESETS = [
  { name: "Gym Workout", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600" },
  { name: "Healthy Diet", url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600" },
  { name: "Supplements", url: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600" },
  { name: "Running", url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600" }
];

export default function Blogs() {
  const { toast } = useToast();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Hooks Query
  const { data: blogsData, isLoading } = useBlogsQuery({
    page,
    limit,
    search: searchTerm || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
  });

  const blogsList = blogsData?.blogs || [];
  const pagination = blogsData?.pagination;

  // Mutations
  const createBlogMutation = useCreateBlogMutation();
  const updateBlogMutation = useUpdateBlogMutation();
  const deleteBlogMutation = useDeleteBlogMutation();

  // Dialog & Form States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("Admin");
  const [blogReadTime, setBlogReadTime] = useState("");
  const [blogTags, setBlogTags] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogFile, setBlogFile] = useState<File | null>(null);
  const [blogImageMode, setBlogImageMode] = useState<"url" | "upload" | "preset">("preset");
  const [blogActive, setBlogActive] = useState(true);

  // Edit states
  const [editBlog, setEditBlog] = useState<DBBlog | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editReadTime, setEditReadTime] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editImageMode, setEditImageMode] = useState<"url" | "upload" | "preset">("preset");
  const [editActive, setEditActive] = useState(true);

  // Form Handlers
  const handleCreateBlog = async () => {
    if (!blogTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Blog Title is required",
        variant: "destructive",
      });
      return;
    }
    if (!blogContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Blog Content is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedTags = blogTags
        ? blogTags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      const parsedReadTime = blogReadTime ? parseInt(blogReadTime, 10) : undefined;

      if (blogImageMode === "upload" && blogFile) {
        const formData = new FormData();
        formData.append("title", blogTitle.trim());
        formData.append("content", blogContent.trim());
        if (blogExcerpt.trim()) formData.append("excerpt", blogExcerpt.trim());
        formData.append("author", blogAuthor.trim());
        if (parsedReadTime) formData.append("readTime", String(parsedReadTime));
        formData.append("isActive", String(blogActive));
        formData.append("image", blogFile);
        parsedTags.forEach((tag) => formData.append("tags[]", tag));

        await createBlogMutation.mutateAsync(formData);
      } else {
        await createBlogMutation.mutateAsync({
          title: blogTitle.trim(),
          content: blogContent.trim(),
          excerpt: blogExcerpt.trim() || undefined,
          author: blogAuthor.trim() || "Admin",
          readTime: parsedReadTime,
          image: blogImageMode === "preset" ? blogImage : blogImage.trim() || undefined,
          isActive: blogActive,
          tags: parsedTags,
        });
      }

      toast({
        title: "Blog Created",
        description: "Blog post has been successfully created.",
      });

      // Reset
      setBlogTitle("");
      setBlogContent("");
      setBlogExcerpt("");
      setBlogAuthor("Admin");
      setBlogReadTime("");
      setBlogTags("");
      setBlogImage("");
      setBlogFile(null);
      setBlogImageMode("preset");
      setBlogActive(true);
      setIsAddOpen(false);
    } catch (err: any) {
      toast({
        title: "Error Creating Blog",
        description: err.response?.data?.message || err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const startEdit = (blog: DBBlog) => {
    setEditBlog(blog);
    setEditTitle(blog.title);
    setEditContent(blog.content);
    setEditExcerpt(blog.excerpt || "");
    setEditAuthor(blog.author);
    setEditReadTime(blog.readTime ? String(blog.readTime) : "");
    setEditTags(blog.tags ? blog.tags.join(", ") : "");
    setEditImage(blog.image || "");
    setEditFile(null);
    setEditImageMode(blog.image && blog.image.startsWith("https://images.unsplash.com") ? "preset" : "url");
    setEditActive(blog.isActive);
  };

  const handleUpdateBlog = async () => {
    if (!editBlog) return;
    if (!editTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Blog Title is required",
        variant: "destructive",
      });
      return;
    }
    if (!editContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Blog Content is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedTags = editTags
        ? editTags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      const parsedReadTime = editReadTime ? parseInt(editReadTime, 10) : undefined;

      if (editImageMode === "upload" && editFile) {
        const formData = new FormData();
        formData.append("title", editTitle.trim());
        formData.append("content", editContent.trim());
        formData.append("excerpt", editExcerpt.trim());
        formData.append("author", editAuthor.trim());
        if (parsedReadTime) formData.append("readTime", String(parsedReadTime));
        formData.append("isActive", String(editActive));
        formData.append("image", editFile);
        parsedTags.forEach((tag) => formData.append("tags[]", tag));

        await updateBlogMutation.mutateAsync({ id: editBlog.id, data: formData });
      } else {
        await updateBlogMutation.mutateAsync({
          id: editBlog.id,
          data: {
            title: editTitle.trim(),
            content: editContent.trim(),
            excerpt: editExcerpt.trim() || null,
            author: editAuthor.trim(),
            readTime: parsedReadTime || null,
            image: editImageMode === "preset" ? editImage : editImage.trim() || null,
            isActive: editActive,
            tags: parsedTags,
          },
        });
      }

      toast({
        title: "Blog Updated",
        description: "Blog post has been successfully updated.",
      });

      setEditBlog(null);
    } catch (err: any) {
      toast({
        title: "Error Updating Blog",
        description: err.response?.data?.message || err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await deleteBlogMutation.mutateAsync(id);
      toast({
        title: "Blog Deleted",
        description: "Blog post has been successfully deleted.",
      });
    } catch (err: any) {
      toast({
        title: "Error Deleting Blog",
        description: err.response?.data?.message || err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground text-sm">
            Create, edit, and publish health and fitness articles.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Blog Post
        </Button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            Published
          </Button>
          <Button
            variant={statusFilter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("inactive")}
          >
            Drafts
          </Button>
        </div>
      </div>

      {/* Main List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : blogsList.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4 pt-6">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">No Blogs Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Write your first blog post to share educational nutrition and fitness insights.
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Blog Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogsList.map((blog) => (
            <motion.div
              layout
              key={blog.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-all border border-border h-full">
                <CardContent className="p-4 flex gap-4 items-start">
                  {/* Thumbnail Image */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-border">
                    {blog.image ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        Blog
                      </span>
                    )}
                    <div className="absolute top-1 left-1">
                      {blog.isActive ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 block border border-white" title="Published" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block border border-white" title="Draft" />
                      )}
                    </div>
                  </div>

                  {/* Blog Info & Actions */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-24 sm:h-28">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base leading-snug line-clamp-2 text-foreground">
                          {blog.title}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEdit(blog)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Post
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-muted-foreground text-xs line-clamp-2">
                        {blog.excerpt || "No summary excerpt provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border mt-auto">
                      <span className="flex items-center gap-1 font-medium truncate max-w-[80px]">
                        <User className="w-3 h-3" />
                        {blog.author}
                      </span>
                      {blog.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {blog.readTime}m read
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {blog.viewsCount} views
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add Blog Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="blog-title">Blog Title *</Label>
              <Input
                id="blog-title"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="Enter title (e.g. Benefits of Creatine Monohydrate)"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="blog-slug">Slug (Optional)</Label>
              <Input
                id="blog-slug"
                value={blogExcerpt} // Note: utilizing temporary field mappings
                onChange={(e) => setBlogExcerpt(e.target.value)}
                placeholder="benefits-of-creatine"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="blog-author">Author</Label>
                <Input
                  id="blog-author"
                  value={blogAuthor}
                  onChange={(e) => setBlogAuthor(e.target.value)}
                  placeholder="Admin"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="blog-read-time">Read Time (minutes)</Label>
                <Input
                  id="blog-read-time"
                  type="number"
                  value={blogReadTime}
                  onChange={(e) => setBlogReadTime(e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="blog-tags">Tags (Comma-separated)</Label>
              <Input
                id="blog-tags"
                value={blogTags}
                onChange={(e) => setBlogTags(e.target.value)}
                placeholder="fitness, health, whey"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="blog-excerpt">Excerpt / Summary (Optional)</Label>
              <Textarea
                id="blog-excerpt"
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
                placeholder="Brief summary of the blog post (shows on list views)..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="blog-content">Article Content *</Label>
              <Textarea
                id="blog-content"
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                placeholder="Write the full blog post in rich Markdown or text..."
                className="min-h-[150px]"
              />
            </div>

            {/* Image Selector */}
            <div className="space-y-3">
              <Label>Cover Image Source</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={blogImageMode === "preset" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBlogImageMode("preset")}
                >
                  Presets
                </Button>
                <Button
                  type="button"
                  variant={blogImageMode === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBlogImageMode("url")}
                >
                  Image URL
                </Button>
                <Button
                  type="button"
                  variant={blogImageMode === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBlogImageMode("upload")}
                >
                  Upload File
                </Button>
              </div>

              {blogImageMode === "preset" && (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {BLOG_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBlogImage(preset.url)}
                      className={cn(
                        "aspect-square rounded border-2 border-border overflow-hidden relative transition-all",
                        blogImage === preset.url ? "border-primary scale-95" : "hover:border-primary/50"
                      )}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {blogImageMode === "url" && (
                <Input
                  value={blogImage}
                  onChange={(e) => setBlogImage(e.target.value)}
                  placeholder="https://example.com/blog-cover.jpg"
                  className="mt-1"
                />
              )}

              {blogImageMode === "upload" && (
                <div className="border border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="blog-image-file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setBlogFile(e.target.files[0]);
                    }}
                  />
                  <Label htmlFor="blog-image-file" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    <span className="block text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                  </Label>
                  {blogFile && (
                    <p className="mt-2 text-xs text-muted-foreground font-medium">
                      Selected: {blogFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="space-y-0.5">
                <Label>Publish Status</Label>
                <p className="text-xs text-muted-foreground">
                  Publish immediately (Active) or save as draft (Inactive)
                </p>
              </div>
              <Switch checked={blogActive} onCheckedChange={setBlogActive} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateBlog}>
                Create Article
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Blog Dialog */}
      <Dialog open={!!editBlog} onOpenChange={(open) => !open && setEditBlog(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
          {editBlog && (
            <div className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">Blog Title *</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter title"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-slug">Slug (Optional)</Label>
                <Input
                  id="edit-slug"
                  value={editExcerpt} // Temporary edit hook matching create
                  onChange={(e) => setEditExcerpt(e.target.value)}
                  placeholder="slug-value"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-author">Author</Label>
                  <Input
                    id="edit-author"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    placeholder="Admin"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-read-time">Read Time (minutes)</Label>
                  <Input
                    id="edit-read-time"
                    type="number"
                    value={editReadTime}
                    onChange={(e) => setEditReadTime(e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-tags">Tags (Comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="fitness, health"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-excerpt">Excerpt / Summary (Optional)</Label>
                <Textarea
                  id="edit-excerpt"
                  value={editExcerpt}
                  onChange={(e) => setEditExcerpt(e.target.value)}
                  placeholder="Brief summary..."
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-content">Article Content *</Label>
                <Textarea
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Article body content..."
                  className="min-h-[150px]"
                />
              </div>

              {/* Edit Image Source */}
              <div className="space-y-3">
                <Label>Cover Image Source</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={editImageMode === "preset" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditImageMode("preset")}
                  >
                    Presets
                  </Button>
                  <Button
                    type="button"
                    variant={editImageMode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditImageMode("url")}
                  >
                    Image URL
                  </Button>
                  <Button
                    type="button"
                    variant={editImageMode === "upload" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditImageMode("upload")}
                  >
                    Upload File
                  </Button>
                </div>

                {editImageMode === "preset" && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {BLOG_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditImage(preset.url)}
                        className={cn(
                          "aspect-square rounded border-2 border-border overflow-hidden relative transition-all",
                          editImage === preset.url ? "border-primary scale-95" : "hover:border-primary/50"
                        )}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {editImageMode === "url" && (
                  <Input
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="https://example.com/blog-cover.jpg"
                    className="mt-1"
                  />
                )}

                {editImageMode === "upload" && (
                  <div className="border border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="edit-blog-image-file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setEditFile(e.target.files[0]);
                      }}
                    />
                    <Label htmlFor="edit-blog-image-file" className="cursor-pointer block">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                      <span className="block text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                    </Label>
                    {editFile && (
                      <p className="mt-2 text-xs text-muted-foreground font-medium">
                        Selected: {editFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="space-y-0.5">
                  <Label>Publish Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Publish immediately (Active) or save as draft (Inactive)
                  </p>
                </div>
                <Switch checked={editActive} onCheckedChange={setEditActive} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setEditBlog(null)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleUpdateBlog}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
