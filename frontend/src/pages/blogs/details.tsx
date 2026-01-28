import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useBlogById } from "@/hooks/useBlogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil } from "lucide-react";
import { BlogStatus } from "@/models/blog";
import { config } from "@/config/config";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useSelector } from "react-redux";
import { type RootState } from "@/stores/store";
import { UserRole } from "@/models/user";

export default function BlogDetails() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useBlogById(blogId);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.roles?.includes(UserRole.ADMIN);
  const [metadata, setMetadata] = useState<any>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Fetch metadata JSON file
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!data?.data?.metadataFilePath) return;

      try {
        setMetadataLoading(true);
        setMetadataError(null);
        const metadataUrl = `${new URL(config.baseUrl).origin}/${data.data.metadataFilePath}`;
        const response = await fetch(metadataUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const jsonData = await response.json();
        setMetadata(jsonData);
      } catch (err) {
        console.error("Error fetching metadata:", err);
        setMetadataError(
          err instanceof Error ? err.message : "Failed to load metadata",
        );
      } finally {
        setMetadataLoading(false);
      }
    };

    fetchMetadata();
  }, [data?.data?.metadataFilePath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 text-destructive rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Error Loading Blog</h3>
            <p className="text-sm">{error?.message}</p>
            <Button className="mt-4" onClick={() => navigate("/blogs")}>
              Back to Blogs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Blog Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The blog you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/blogs")}>Back to Blogs</Button>
        </div>
      </div>
    );
  }

  const blog = data.data;

  const getStatusBadge = (status: BlogStatus) => {
    switch (status) {
      case BlogStatus.DRAFT:
        return "Draft";
      case BlogStatus.PUBLISHED:
        return "Published";
      case BlogStatus.DELETED:
        return "Deleted";
      default:
        return `${status}`;
    }
  };

  const handleEdit = () => {
    navigate(`/blogs/edit/${blogId}`);
  };

  return (
    <div>
      <Breadcrumb
        items={[{ label: "Blogs", href: "/blogs" }, { label: blog.title }]}
      />

      <div className="space-y-6">
        <div className="rounded-lg border border-border shadow-sm relative gradient-card">
          {!metadataLoading && !metadataError && metadata ? (
            <img
              src={`${new URL(config.baseUrl).origin}/${metadata?.heroImagePath}`}
              crossOrigin="anonymous"
              alt="Blog Image"
              className="w-full h-96 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 animate-pulse">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-2xl">{blog.title}</h3>
                <h6 className="text-foreground/60">{metadata?.summary}</h6>
              </div>
              {isAdmin && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>

            <div className="flex gap-4 flex-wrap">
              <Badge variant="outline">ID: {blog.id}</Badge>
              <Badge variant="outline">{getStatusBadge(blog?.status)}</Badge>
              <Badge variant="outline">
                Created: {new Date(blog.createdAt).toLocaleString()}
              </Badge>
              <Badge variant="outline">
                Updated: {new Date(blog.updatedAt).toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>

        {!metadataLoading && !metadataError && metadata && (
          <>
            {metadata?.sections &&
              metadata?.sections?.length > 0 &&
              metadata?.sections?.map((section: any, index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-border shadow-sm"
                >
                  <div className="p-4 gradient-card shadow-sm rounded-t-lg">
                    <h3 className="font-semibold">{section.heading}</h3>
                  </div>

                  <div className="p-4">
                    <MarkdownRenderer content={section.content} />
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
