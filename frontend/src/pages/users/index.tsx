import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/models/user";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<User>[] = [
  {
    id: "serial",
    header: "SL",
    cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => {
      const firstName = row.getValue("firstName") as string;
      return <span className="font-medium">{firstName}</span>;
    },
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-sm">{row.getValue("email")}</span>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span className="text-sm">{row.getValue("phone")}</span>,
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.getValue("roles") as string[];
      return (
        <div className="flex gap-1 flex-wrap">
          {roles?.map((role) => (
            <Badge key={role} variant="outline" className="text-xs">
              {role}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as number;
      return (
        <Badge
          variant={status === 1 ? "default" : "destructive"}
          className="text-xs"
        >
          {status === 1 ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
];

export default function Users() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: response,
    isLoading,
    error,
  } = useUsers({
    page,
    limit: pageSize,
    // sort: "-createdAt",
    paginate: true,
  });

  const users = response?.data || [];
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
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: "var(--color-primary)" }}
        >
          Users
        </h1>
        <p className="text-slate-600">View and manage all registered users</p>
      </div>

      <div className="flex flex-col gap-4">
        <DataTable
          columns={columns}
          data={users}
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
