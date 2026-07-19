import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link2,
  List,
  ListOrdered,
  Eye,
  Edit3,
  Upload,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from "@/api/hooks/blog.hooks";

const BLOG_PRESETS = [
  {
    name: "Gym Workout",
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600",
  },
  {
    name: "Healthy Diet",
    url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600",
  },
  {
    name: "Supplements",
    url: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600",
  },
  {
    name: "Running",
    url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600",
  },
];

export default function BlogForm() {
  const { blogId } = useParams<{ blogId?: string }>();
  const isEdit = !!blogId;
  const navigate = useNavigate();
  const { toast } = useToast();

  // Queries & Mutations
  const { data: blog, isLoading: isLoadingBlog } = useBlogQuery(blogId || "");
  const createBlogMutation = useCreateBlogMutation();
  const updateBlogMutation = useUpdateBlogMutation();

  // Form States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [readTime, setReadTime] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageMode, setImageMode] = useState<"preset" | "url" | "upload">("preset");
  const [isActive, setIsActive] = useState(true);

  // Editor states
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (blog && isEdit) {
      setTitle(blog.title);
      setContent(blog.content);
      setExcerpt(blog.excerpt || "");
      setAuthor(blog.author || "Admin");
      setReadTime(blog.readTime ? String(blog.readTime) : "");
      setTags(blog.tags ? blog.tags.join(", ") : "");
      setImage(blog.image || "");
      setIsActive(blog.isActive);

      if (blog.image) {
        if (blog.image.startsWith("https://images.unsplash.com")) {
          setImageMode("preset");
        } else if (blog.image.startsWith("http://") || blog.image.startsWith("https://")) {
          setImageMode("url");
        } else {
          setImageMode("upload");
          setImagePreview(processImageUrl(blog.image));
        }
      }
    }
  }, [blog, isEdit]);

  const processImageUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168."));
    const baseUrl = isLocal ? "http://localhost:4000" : "https://protien-backend.vercel.app";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Editor Formatting Helper
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    setContent(
      text.substring(0, start) + replacement + text.substring(end)
    );

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const generateHtmlTable = (headers: string[], rows: string[][]) => {
    const headerCols = headers.map(h => `<th class="border-b border-gray-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black bg-gray-50">${h}</th>`).join("");
    const rowHtml = rows.map(row => {
      const cols = row.map(cell => `<td class="border-b border-gray-100 px-4 py-3 text-sm text-gray-600">${cell}</td>`).join("");
      return `<tr class="hover:bg-gray-50/50 transition-colors">${cols}</tr>`;
    }).join("");

    const tableHtml = `
      <div class="overflow-x-auto my-6 border border-gray-200 rounded-xl shadow-sm">
        <table class="min-w-full border-collapse bg-white">
          <thead>
            <tr>${headerCols}</tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${rowHtml}
          </tbody>
        </table>
      </div>
    `;

    return tableHtml.replace(/\n/g, " ").replace(/\s+/g, " ");
  };

  const parseMarkdown = (markdown: string) => {
    if (!markdown) return "";
    
    let html = markdown;

    // Process Code blocks first
    const codeBlocks: string[] = [];
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<pre class="bg-muted p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto border text-muted-foreground"><code>${code}</code></pre>`);
      return placeholder;
    });

    const inlineCodes: string[] = [];
    html = html.replace(/`(.*?)`/g, (match, code) => {
      const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
      inlineCodes.push(`<code class="bg-muted px-1.5 py-0.5 rounded font-mono text-xs border text-muted-foreground">${code}</code>`);
      return placeholder;
    });

    // Parse Markdown Tables
    const lines = html.split("\n");
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    let newLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("|") && line.endsWith("|")) {
        const cells = line.split("|").map(c => c.trim()).slice(1, -1);
        
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
        } else {
          const isSeparator = cells.every(c => /^:?-+:?$/.test(c));
          if (isSeparator) {
            continue;
          } else {
            tableRows.push(cells);
          }
        }
      } else {
        if (inTable) {
          const tableHtml = generateHtmlTable(tableHeaders, tableRows);
          newLines.push(tableHtml);
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
        newLines.push(lines[i]);
      }
    }
    if (inTable) {
      const tableHtml = generateHtmlTable(tableHeaders, tableRows);
      newLines.push(tableHtml);
    }

    html = newLines.join("\n");

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-5 mb-2 text-foreground">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-foreground border-b pb-1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground border-b pb-2">$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-1 my-4 italic text-muted-foreground bg-primary/5 rounded-r">$1</blockquote>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>');

    // Lists
    html = html.replace(/^[\-\*] (.*$)/gim, '<li class="list-disc ml-5 mb-1 text-muted-foreground">$1</li>');

    // Restore placeholders
    codeBlocks.forEach((code, index) => {
      html = html.replace(`__CODE_BLOCK_${index}__`, code);
    });
    inlineCodes.forEach((code, index) => {
      html = html.replace(`__INLINE_CODE_${index}__`, code);
    });

    // Paragraphs
    const blocks = html.split(/\n{2,}/);
    const parsedBlocks = blocks.map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<p") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<div class=\"overflow-x-auto my-6\"") ||
        trimmed.startsWith("##") ||
        trimmed.startsWith("#") ||
        trimmed.startsWith(">") ||
        trimmed.startsWith("-") ||
        trimmed.startsWith("*")
      ) {
        return block;
      }
      return `<p class="mb-4 leading-relaxed text-muted-foreground">${block.replace(/\n/g, "<br />")}</p>`;
    });

    return parsedBlocks.join("\n");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Validation Error", description: "Title is required", variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: "Validation Error", description: "Content is required", variant: "destructive" });
      return;
    }

    const parsedTags = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const parsedReadTime = readTime ? parseInt(readTime, 10) : undefined;

    try {
      const isUploadingFile = imageMode === "upload" && imageFile;
      const isUpdatingUpload = isEdit && imageMode === "upload" && imageFile;

      if (isUploadingFile || isUpdatingUpload) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("content", content.trim());
        formData.append("excerpt", excerpt.trim());
        formData.append("author", author.trim());
        if (parsedReadTime) formData.append("readTime", String(parsedReadTime));
        formData.append("isActive", String(isActive));
        if (imageFile) formData.append("image", imageFile);
        parsedTags.forEach((tag) => formData.append("tags[]", tag));

        if (isEdit) {
          await updateBlogMutation.mutateAsync({ id: blogId!, data: formData });
        } else {
          await createBlogMutation.mutateAsync(formData);
        }
      } else {
        const payload = {
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || undefined,
          author: author.trim(),
          readTime: parsedReadTime,
          image: imageMode === "preset" ? image : image.trim() || undefined,
          isActive,
          tags: parsedTags,
        };

        if (isEdit) {
          await updateBlogMutation.mutateAsync({ id: blogId!, data: payload });
        } else {
          await createBlogMutation.mutateAsync(payload);
        }
      }

      toast({
        title: isEdit ? "Blog Updated" : "Blog Created",
        description: `Successfully ${isEdit ? "updated" : "created"} the blog post.`,
      });
      navigate("/blogs");
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.response?.data?.message || err.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const isPending = createBlogMutation.isPending || updateBlogMutation.isPending;

  if (isEdit && isLoadingBlog) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading blog details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/blogs")} disabled={isPending}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? "Edit Blog Post" : "Create Blog Post"}</h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "Modify and update your health article details" : "Write a professional educational nutrition or fitness article"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/blogs")} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="gap-2">
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? "Save Changes" : "Publish Article"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Main Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-soft space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="blog-form-title">Blog Title *</Label>
              <Input
                id="blog-form-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5 Nutrition Tips for Muscle Growth"
                className="text-lg font-semibold py-6"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="blog-form-excerpt">Excerpt / Summary (Optional)</Label>
              <Textarea
                id="blog-form-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Provide a brief summary of the article..."
                rows={2}
                disabled={isPending}
              />
            </div>

            {/* Rich Editor Pane */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border border-b-0 border-border bg-muted/30 px-3 py-2 rounded-t-lg">
                <div className="flex items-center gap-1.5 overflow-x-auto flex-wrap py-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Bold"
                    onClick={() => insertMarkdown("**", "**")}
                    type="button"
                    disabled={isPending || editorTab === "preview"}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Italic"
                    onClick={() => insertMarkdown("*", "*")}
                    type="button"
                    disabled={isPending || editorTab === "preview"}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="H1"
                    onClick={() => insertMarkdown("# ", "")}
                    type="button"
                    disabled={isPending || editorTab === "preview"}
                  >
                    <Heading1 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="H2"
                    onClick={() => insertMarkdown("## ", "")}
                    type="button"
                    disabled={isPending || editorTab === "preview"}
                  >
                    <Heading2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="H3"
                    onClick={() => insertMarkdown("### ", "")}
                    type="button"
                    disabled={isPending || editorTab === "preview"}
                  >
                    <Heading3 className="w-4 h-4" />
                  </Button>
                  <div className="w-[1px] h-5 bg-border mx-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Blockquote"
                    onClick={() => insertMarkdown("> ", "")}
                    type="button"
                    disabled={isPending || editorTab === "preview"}
                  >
                    <Quote className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Code block"
                    onClick={() => insertMarkdown("\n```\n", "\n```\n")}
                    type="button"
                    disabled={isPending || editorTab === "preview"}
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Link"
                    onClick={() => insertMarkdown("[", "](url)")}
                    type="button"
                    disabled={isPending || editorTab === "preview"}
                  >
                    <Link2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="List"
                    onClick={() => insertMarkdown("- ", "")}
                    type="button"
                    disabled={isPending || editorTab === "preview"}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Ordered List"
                    onClick={() => insertMarkdown("1. ", "")}
                    type="button"
                    disabled={isPending || editorTab === "preview"}
                  >
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-1 border rounded-lg bg-card p-0.5 ml-2">
                  <Button
                    variant={editorTab === "write" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setEditorTab("write")}
                    type="button"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Write
                  </Button>
                  <Button
                    variant={editorTab === "preview" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setEditorTab("preview")}
                    type="button"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>

              {editorTab === "write" ? (
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full post content using professional Markdown formatting..."
                  className="min-h-[400px] rounded-t-none border-t-0 font-mono resize-y"
                  disabled={isPending}
                />
              ) : (
                <div 
                  className="min-h-[400px] border border-border p-6 rounded-b-lg overflow-y-auto bg-card prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(content) || '<p class="text-muted-foreground italic">Nothing to preview yet. Write some content first!</p>' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings Section */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-soft space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Publish Settings</h3>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="blog-active-status">Active / Published</Label>
                <p className="text-xs text-muted-foreground">Draft or active publish status</p>
              </div>
              <Switch
                id="blog-active-status"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="blog-form-author">Author</Label>
              <Input
                id="blog-form-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Admin"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="blog-form-read">Read Time (minutes)</Label>
              <Input
                id="blog-form-read"
                type="number"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="5"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="blog-form-tags">Tags (Comma-separated)</Label>
              <Input
                id="blog-form-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="health, bodybuilding, whey"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Cover Image Selection */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-soft space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Cover Image</h3>

            <div className="flex gap-1.5 bg-muted/40 p-0.5 rounded-lg border">
              <Button
                type="button"
                variant={imageMode === "preset" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 text-xs py-1 h-8"
                onClick={() => setImageMode("preset")}
                disabled={isPending}
              >
                Presets
              </Button>
              <Button
                type="button"
                variant={imageMode === "url" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 text-xs py-1 h-8"
                onClick={() => setImageMode("url")}
                disabled={isPending}
              >
                URL
              </Button>
              <Button
                type="button"
                variant={imageMode === "upload" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 text-xs py-1 h-8"
                onClick={() => setImageMode("upload")}
                disabled={isPending}
              >
                Upload
              </Button>
            </div>

            {imageMode === "preset" && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {BLOG_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={cn(
                      "aspect-video rounded-lg border-2 border-border overflow-hidden relative transition-all",
                      image === preset.url
                        ? "border-primary scale-95"
                        : "hover:border-primary/50"
                    )}
                    disabled={isPending}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {imageMode === "url" && (
              <div className="space-y-1.5">
                <Label htmlFor="cover-url">Image URL</Label>
                <Input
                  id="cover-url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  disabled={isPending}
                />
              </div>
            )}

            {imageMode === "upload" && (
              <div className="space-y-3">
                <div className="border border-dashed border-border rounded-lg p-4 text-center bg-muted/10 relative overflow-hidden">
                  {imagePreview ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Label htmlFor="blog-form-file" className="cursor-pointer text-white font-medium text-xs bg-primary px-3 py-1.5 rounded-md">
                          Change Image
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <Label htmlFor="blog-form-file" className="cursor-pointer block py-4">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-1.5" />
                      <span className="font-semibold text-primary text-sm">Click to upload</span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">PNG, JPG up to 5MB</span>
                    </Label>
                  )}
                  <input
                    type="file"
                    id="blog-form-file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileChange}
                    disabled={isPending}
                  />
                </div>
                {imageFile && (
                  <p className="text-xs text-muted-foreground font-medium text-center truncate">
                    Selected: {imageFile.name}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
