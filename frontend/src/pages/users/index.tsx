import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/models/user";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { userService } from "@/services/userService";

export default function Users() {
  const columns: ColumnDef<User>[] = [
    {
      id: "serial",
      header: "SL",
      cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
    },
    {
      id: "id",
      header: "ID",
      cell: ({ row }) => <span className="text-sm">{row.original.id}</span>,
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
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("phone")}</span>
      ),
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
      header: () => {
        return <div className="text-center">Status</div>;
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as number;
        return (
          <div className="flex place-self-center">
            <Badge
              variant={status === 1 ? "default" : "destructive"}
              className="text-xs"
            >
              {status === 1 ? "Active" : "Inactive"}
            </Badge>
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
            <Link to={`/users/${row?.original?.id}`}>
              <Eye className="size-4 text-accent hover:brightness-70 cursor-pointer" />
            </Link>

            <Edit className="size-4 text-gray-600 hover:text-gray-800 cursor-pointer" />
            <div onClick={() => handleDeleteUser(row?.original?.id)}>
              {" "}
              <Trash className="size-4 text-red-600 hover:text-red-800 cursor-pointer" />
            </div>
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
  } = useUsers({
    page,
    limit: pageSize,
    sort: "-createdAt",
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

  const handleDeleteUser = async (userId: string | number) => {
    try {
      let deleteResponse = await userService.deleteUser(userId);

      if (deleteResponse.success) {
        // Optionally, refetch the users list or update the state to remove the deleted user
        console.log("User deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    return () => {
      // Implement user deletion logic here
      console.log("Delete user with ID:", userId);
    };
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
