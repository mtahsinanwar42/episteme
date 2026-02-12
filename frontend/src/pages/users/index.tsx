import { useState, useMemo, useCallback } from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserStatus, type User } from "@/models/user";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Eye, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/models/user";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageSubTitle from "@/components/common/PageSubTitle";
import PageTitle from "@/components/common/PageTitle";
import { StatusUpdateModal } from "@/components/user/StatusUpdateModal";

export default function Users() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const currentPage = page;
  const currentLimit = response?.pagination?.next?.limit || pageSize;
  const totalPages = Math.ceil(total / currentLimit);

  const getStatusBadge = useCallback((status: UserStatus) => {
    switch (status) {
      case UserStatus.INACTIVE:
        return <Badge variant="disabled">{UserStatus[status]}</Badge>;
      case UserStatus.ACTIVE:
        return <Badge variant="default">{UserStatus[status]}</Badge>;
      case UserStatus.SUSPENDED:
        return <Badge variant="secondary">{UserStatus[status]}</Badge>;
      case UserStatus.DELETED:
        return <Badge variant="destructive">{UserStatus[status]}</Badge>;
      default:
        return <Badge variant="default">{UserStatus[status]}</Badge>;
    }
  }, []);

  const handleOpenStatusModal = useCallback((user: User) => {
    setSelectedUser(user);
    setIsStatusModalOpen(true);
  }, []);

  const handleCloseStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
    setSelectedUser(null);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("firstName")}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("lastName")}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <div
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center gap-4 justify-center w-full"
            >
              Email
              <ArrowUpDown className="size-4 text-muted-foreground" />
            </div>
          );
        },
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("email")}</span>
        ),
        sortingFn: (rowA, rowB, columnId) => {
          const a = String(rowA.getValue(columnId) ?? "").toLowerCase();
          const b = String(rowB.getValue(columnId) ?? "").toLowerCase();
          return a.localeCompare(b);
        },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("phone")}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "institution",
        header: "Institution",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("institution")}</span>
        ),
        enableSorting: false,
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
        enableSorting: false,
      },
      {
        id: "status",
        accessorFn: (row) => UserStatus[row.status] ?? String(row.status),
        header: ({ column }) => {
          return (
            <div
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center gap-4 justify-center w-full"
            >
              Status
              <ArrowUpDown className="size-4 text-muted-foreground" />
            </div>
          );
        },
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex place-self-center">
              {getStatusBadge(status)}
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
                <Eye className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
              </Link>

              {row?.original?.status === UserStatus.DELETED ? null : (
                <div onClick={() => handleOpenStatusModal(row?.original)}>
                  <RefreshCw className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [handleOpenStatusModal, getStatusBadge],
  );

  return (
    <div>
      <Breadcrumb items={[{ label: "Users", href: "/users" }]} />
      <div className="mb-6">
        <PageTitle title="Users" />
        <PageSubTitle text="View and manage all registered users" />
        {currentRoles?.includes(UserRole.ADMIN) && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/users/search")}
              className="mb-4 px-4 py-2"
            >
              Advanced Search
            </Button>
            <Button
              onClick={() => navigate("/users/new")}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add New User
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          error={error ? (error as Error).message : null}
          pageSize={pageSize}
          enableSearch
          searchPlaceholder="Filter Users"
          searchableColumnIds={[
            "firstName",
            "lastName",
            "email",
            "institution",
            "status",
          ]}
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

      <StatusUpdateModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedUser={selectedUser}
        onClose={handleCloseStatusModal}
      />
    </div>
  );
}
