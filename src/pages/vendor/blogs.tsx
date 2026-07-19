import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  HelpCircle,
  Eye,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  useBlogsQuery,
  useDeleteBlogMutation,
  DBBlog,
} from "@/api/hooks/blog.hooks";

export default function Blogs() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
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
  const deleteBlogMutation = useDeleteBlogMutation();

  const processImageUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168."));
    const baseUrl = isLocal ? "http://localhost:4000" : "https://protien-backend.vercel.app";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
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
        description:
          err.response?.data?.message || err.message || "Something went wrong",
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
        <Button onClick={() => navigate("/blogs/new")}>
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
              Write your first blog post to share educational nutrition and
              fitness insights.
            </p>
            <Button onClick={() => navigate("/blogs/new")}>
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
                        src={processImageUrl(blog.image)}
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
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-green-500 block border border-white"
                          title="Published"
                        />
                      ) : (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-amber-500 block border border-white"
                          title="Draft"
                        />
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 flex-shrink-0"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/blogs/${blog.id}/edit`)}>
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
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
