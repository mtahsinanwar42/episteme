import { Card } from "@/components/ui/card";
import { type Blog } from "@/models/blog";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserRole } from "@/models/user";
import type { RootState } from "@/stores/store";
import { Edit } from "lucide-react";
import { getBlogActivityResourceStatusBadge } from "@/components/common/ResourceStatusBadge";

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
  const createdDate = new Date(blog.createdAt).toLocaleString();

  const handleEdit = () => {
    navigate(`/blogs/edit/${blog.id}`);
  };

  return (
    <Card
      title={blog.title}
      statusBadge={<>{getBlogActivityResourceStatusBadge(blog.status)}</>}
      metadata={<span className="text-slate-500 text-sm">{createdDate}</span>}
      actions={
        isAdmin ? <Edit onClick={handleEdit} className="w-4 h-4" /> : undefined
      }
    />
  );
}
