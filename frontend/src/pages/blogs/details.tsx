import { useParams, useNavigate } from "react-router-dom";
import { useBlogById } from "@/hooks/useBlogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { config } from "@/config/config";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { getBlogActivityResourceStatusEnum } from "@/components/common/ResourceStatusBadge";

export default function BlogDetails() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useBlogById(blogId);
  const blog = data?.data;

  const { data: metadata, isLoading: metadataLoading } = useMetadataFile({
    filePath: blog?.metadataFilePath || "",
    resourceId: blog?.id || "",
    enabled: !!blog, // Only fetch metadata after blog is loaded
  });

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

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Blogs", href: "/blogs" },
          { label: blog?.title || "" },
        ]}
      />

      <div className="space-y-6">
        <div className="rounded-lg border border-border shadow-sm relative gradient-card">
          {!metadataLoading && metadata?.heroImagePath ? (
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
                <h3 className="font-semibold">{blog?.title}</h3>
                <h6 className="text-foreground/60">{metadata?.summary}</h6>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <Badge variant="outline">
                {getBlogActivityResourceStatusEnum(blog?.status)}
              </Badge>
              <Badge variant="outline">
                Created: {new Date(blog?.createdAt || "").toLocaleString()}
              </Badge>
              <Badge variant="outline">
                Updated: {new Date(blog?.updatedAt || "").toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>

        {!metadataLoading &&
          metadata?.sections &&
          metadata?.sections?.length > 0 && (
            <>
              {metadata?.sections?.map((section: any, index: number) => (
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
