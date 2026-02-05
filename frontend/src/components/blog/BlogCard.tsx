import { Card } from "@/components/ui/card";
import { type Blog } from "@/models/blog";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import type { RootState } from "@/stores/store";
import { Edit } from "lucide-react";
import { getBlogActivityResourceStatusBadge } from "@/components/common/ResourceStatusBadge";
import { formatDateTime } from "@/utils/dateFormatter";
import { useMetadataFile } from "@/hooks/useMetadataFiles";
import { config } from "@/config/config";

interface BlogCardProps {
  blog: Blog;
  showImage?: boolean;
}

export function BlogCard({ blog }: BlogCardProps) {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);

  const { data: metadata } = useMetadataFile({
    filePath: blog.metadataFilePath || "",
    resourceId: blog.id,
  });

  const imageUrl = metadata?.heroImagePath
    ? `${new URL(config.baseUrl).origin}/${metadata.heroImagePath}`
    : undefined;

  const createdDate = formatDateTime(blog.createdAt);

  const handleEdit = () => {
    navigate(`/blogs/edit/${blog.id}`);
  };

  return (
    <Card
      title={blog.title}
      description={<div className="truncate">{metadata?.summary}</div>}
      showImage
      imageUrl={imageUrl}
      statusBadge={<>{getBlogActivityResourceStatusBadge(blog.status)}</>}
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
      actions={
        isAdmin ? <Edit onClick={handleEdit} className="w-4 h-4" /> : undefined
      }
    />
  );
}
