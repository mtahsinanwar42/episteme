import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye } from "lucide-react";
import { Link } from "react-router-dom";

import { useFiles } from "@/hooks/useFiles";
import type { File } from "@/models/file";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { formatDateTime } from "@/utils/dateFormatter";

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
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-4 justify-center w-full"
          >
            Storage Key
            <ArrowUpDown className="size-4 text-muted-foreground" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm text-left lg:max-w-lg break-all">
          {row.getValue("storageKey")}
        </div>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const a = String(rowA.getValue(columnId) ?? "").toLowerCase();
        const b = String(rowB.getValue(columnId) ?? "").toLowerCase();
        return a.localeCompare(b);
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-4 justify-center w-full"
          >
            Created At
            <ArrowUpDown className="size-4 text-muted-foreground" />
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-sm text-center">
            {formatDateTime(row.getValue("createdAt") as string)}
          </div>
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
              <Eye className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
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
      <Breadcrumb items={[{ label: "Assets", href: "/assets" }]} />

      <div className="mb-6">
        <PageTitle title="Assets" />
        <PageSubTitle text="View and manage all assets" />
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
