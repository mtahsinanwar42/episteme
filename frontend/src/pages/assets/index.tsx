import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

import { useFiles } from "@/hooks/useFiles";
import type { File } from "@/models/file";

export default function Assets() {
  const columns: ColumnDef<File>[] = [
    {
      id: "serial",
      header: "SL",
      cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
    },

    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return (
          <div className="font-medium max-w-96 wrap-break-word">{name}</div>
        );
      },
    },
    {
      accessorKey: "storageKey",
      header: "Storage Key",
      cell: ({ row }) => (
        <div className="text-sm max-w-96 break-all">
          {row.getValue("storageKey")}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        return (
          <span className="text-sm">
            {new Date(row.getValue("createdAt") as string).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => {
        return <div className="text-center">Actions</div>;
      },
      cell: ({ row }) => {
        return (
          <div className="flex gap-4 place-self-center">
            <Link to={`/assets/${row?.original?.id}`}>
              <Eye className="size-4 text-gray-600 hover:text-gray-800 cursor-pointer" />
            </Link>
          </div>
        );
      },
    },
  ];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: response,
    isLoading,
    error,
  } = useFiles({
    page,
    limit: pageSize,
    sort: "-createdAt",
    paginate: true,
  });

  const files = response?.data || [];
  const total = response?.total || 0;

  // Calculate pagination info from API response
  const currentPage = page;
  const currentLimit = response?.pagination?.next?.limit || pageSize;
  const totalPages = Math.ceil(total / currentLimit);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl text-accent font-bold mb-2">Assets</h1>
        <p className="text-slate-600">View and manage all assets</p>
      </div>

      <div className="flex flex-col gap-4">
        <DataTable
          columns={columns}
          data={files}
          isLoading={isLoading}
          error={error ? (error as Error).message : null}
          pageSize={pageSize}
        />

        {!isLoading && !error && total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={currentLimit}
            totalItems={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
