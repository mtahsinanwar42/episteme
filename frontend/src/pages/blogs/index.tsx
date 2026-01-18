import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useBlogs } from "@/hooks/useBlogs";
import { DataTable } from "@/components/ui/data-table";
import type { Blog } from "@/models/blog";

type BlogData = Blog & { author: string; published_at: string };

export default function Blogs() {
  const navigate = useNavigate();
  const { data: blogs, isLoading, error } = useBlogs();

  const columns: ColumnDef<BlogData, unknown>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-none transition-colors font-semibold"
        >
          Title
          {column.getIsSorted() && (
            <span className="inline-block">
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
            </span>
          )}
        </div>
      ),
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/blogs/${row.original.id}`)}
          className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer text-left font-medium transition-colors"
        >
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "body",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-left max-w-[400px]">{row.getValue("body")}</div>
      ),
    },
    {
      accessorKey: "published_at",
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-none transition-colors font-semibold"
        >
          Date
          {column.getIsSorted() && (
            <span className="inline-block">
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
            </span>
          )}
        </div>
      ),
      cell: ({ row }) => {
        const blog = row.original;
        return (
          <div className="text-left max-w-[400px]">
            By {blog.author} on{" "}
            {new Date(blog.published_at).toLocaleDateString()}
          </div>
        );
      },
    },
  ];

  return (
    <div className="mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Blogs
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Explore and discover our latest articles
        </p>
      </div>
      <DataTable
        columns={columns}
        data={(blogs || []).filter((blog): blog is BlogData => !!blog.title)}
        isLoading={isLoading}
        error={error ? (error as Error).message : null}
        pageSize={10}
      />
    </div>
  );
}
