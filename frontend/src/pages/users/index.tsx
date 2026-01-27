import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserStatus, type User } from "@/models/user";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Edit, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserDetailsMutation } from "@/hooks/useUsers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageSubTitle from "@/components/common/PageSubTitle";
import PageTitle from "@/components/common/PageTitle";

export default function Users() {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number>(1);
  const updateStatusMutation = useUserDetailsMutation();

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
          <div className="flex place-self-center">{getStatusBadge(status)}</div>
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
              <Edit className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
            </Link>

            <div onClick={() => handleOpenStatusModal(row?.original)}>
              <RefreshCw className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
            </div>
          </div>
        );
      },
    },
  ];

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="destructive">{UserStatus[status]}</Badge>;
      case 1:
        return <Badge variant="default">{UserStatus[status]}</Badge>;
      case 2:
        return <Badge variant="secondary">{UserStatus[status]}</Badge>;
      case 9:
        return <Badge variant="disabled">{UserStatus[status]}</Badge>;
      default:
        return <Badge variant="default">{UserStatus[status]}</Badge>;
    }
  };

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

  const handleOpenStatusModal = (user: User) => {
    setSelectedUser(user);
    setSelectedStatus(user.status);
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateStatus = () => {
    if (!selectedUser) return;

    updateStatusMutation.mutate(
      {
        userId: selectedUser.id,
        postData: { status: selectedStatus },
      },
      {
        onSuccess: () => {
          handleCloseStatusModal();
          console.log("User status updated successfully");
        },
        onError: (error) => {
          console.error("Error updating user status:", error);
        },
      },
    );
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Users", href: "/users" }]} />
      <div className="mb-6">
        <PageTitle title="Users" />
        <PageSubTitle text="View and manage all registered users" />
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

      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent onClose={handleCloseStatusModal}>
          <DialogHeader>
            <DialogTitle>Update user status</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Name: {selectedUser?.firstName} {selectedUser?.lastName}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Current status:{" "}
                  {selectedUser && UserStatus[selectedUser.status]}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select new status
                </label>
                <Select
                  value={selectedStatus.toString()}
                  onValueChange={(value) => setSelectedStatus(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserStatus.INACTIVE.toString()}>
                      Inactive
                    </SelectItem>
                    <SelectItem value={UserStatus.ACTIVE.toString()}>
                      Active
                    </SelectItem>
                    <SelectItem value={UserStatus.SUSPENDED.toString()}>
                      Suspended
                    </SelectItem>
                    <SelectItem value={UserStatus.DELETED.toString()}>
                      Deleted
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseStatusModal}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
