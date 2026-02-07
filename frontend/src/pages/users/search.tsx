import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, RefreshCw } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { userService, type GetUsersParams } from "@/services/userService";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageSubTitle from "@/components/common/PageSubTitle";
import PageTitle from "@/components/common/PageTitle";
import { StatusUpdateModal } from "@/components/user/StatusUpdateModal";
import { UserRole, UserStatus, type User } from "@/models/user";

const ROLE_OPTIONS = [
  UserRole.ADMIN,
  UserRole.USER,
  UserRole.REVIEWER,
];

const STATUS_OPTIONS = [
  { value: UserStatus.INACTIVE, label: "INACTIVE" },
  { value: UserStatus.ACTIVE, label: "ACTIVE" },
  { value: UserStatus.SUSPENDED, label: "SUSPENDED" },
  { value: UserStatus.DELETED, label: "DELETED" },
];

export default function UserSearch() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    occupation: "",
    createdAtFrom: "",
    createdAtTo: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);

  const [searchParams, setSearchParams] = useState<GetUsersParams | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryParams = searchParams
    ? {
        ...searchParams,
        page,
        limit: pageSize,
        sort: "-createdAt",
        paginate: true,
      }
    : null;

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", "search", queryParams],
    queryFn: () => userService.getUsers(queryParams!),
    enabled: queryParams !== null,
  });

  const users = searchParams ? response?.data || [] : [];
  const total = searchParams ? response?.total || 0 : 0;
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
        accessorKey: "status",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hasAnyField = useMemo(() => {
    return (
      formData.firstName.trim() !== "" ||
      formData.lastName.trim() !== "" ||
      formData.email.trim() !== "" ||
      formData.institution.trim() !== "" ||
      formData.occupation.trim() !== "" ||
      formData.createdAtFrom !== "" ||
      formData.createdAtTo !== "" ||
      selectedRoles.length > 0 ||
      selectedStatuses.length > 0
    );
  }, [formData, selectedRoles, selectedStatuses]);

  const dateValidationError = useMemo(() => {
    const { createdAtFrom, createdAtTo } = formData;

    if (createdAtFrom && !createdAtTo) {
      return "Created Date To is required when Created Date From is provided";
    }
    if (!createdAtFrom && createdAtTo) {
      return "Created Date From is required when Created Date To is provided";
    }
    if (createdAtFrom && createdAtTo && createdAtFrom > createdAtTo) {
      return "Created Date From must not be after Created Date To";
    }

    return null;
  }, [formData.createdAtFrom, formData.createdAtTo]);

  const isSearchDisabled = !hasAnyField || dateValidationError !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSearchDisabled) return;

    const params: GetUsersParams = {};
    if (formData.firstName.trim()) params.firstName = formData.firstName.trim();
    if (formData.lastName.trim()) params.lastName = formData.lastName.trim();
    if (formData.email.trim()) params.email = formData.email.trim();
    if (formData.institution.trim())
      params.institution = formData.institution.trim();
    if (formData.occupation.trim()) params.occupation = formData.occupation.trim();
    if (formData.createdAtFrom) params.createdAtFrom = formData.createdAtFrom;
    if (formData.createdAtTo) params.createdAtTo = formData.createdAtTo;
    if (selectedRoles.length === 1) {
      params.roles = selectedRoles[0];
    }
    if (selectedStatuses.length === 1) {
      params.status = selectedStatuses[0];
    } else if (selectedStatuses.length > 1) {
      params.statusIn = selectedStatuses.join(",");
    }

    setPage(1);
    setSearchParams(params);
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      institution: "",
      occupation: "",
      createdAtFrom: "",
      createdAtTo: "",
    });
    setSelectedRoles([]);
    setSelectedStatuses([]);
    setSearchParams(null);
    setPage(1);
  };

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role],
    );
  };

  const handleStatusToggle = (status: number) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Users", href: "/users" },
          { label: "Advanced Search" },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Advanced Search - Users" />
        <PageSubTitle text="Search users using advanced filters" />
      </div>

      <div className="relative rounded-lg border border-border bg-card shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {dateValidationError && (
            <div className="text-red-600 text-sm">{dateValidationError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                First Name
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Search by First Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Last Name
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Search by Last Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Email
              </label>
              <Input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Search by Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Institution
              </label>
              <Input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                placeholder="Search by Institution"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Occupation
              </label>
              <Input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                placeholder="Search by Occupation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Roles
              </label>
              <div className="flex flex-wrap gap-4 mt-1">
                {ROLE_OPTIONS.map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                    />
                    <span className="text-sm text-body">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Status
              </label>
              <div className="flex flex-wrap gap-4 mt-1">
                {STATUS_OPTIONS.map((status) => (
                  <label
                    key={status.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedStatuses.includes(status.value)}
                      onCheckedChange={() => handleStatusToggle(status.value)}
                    />
                    <span className="text-sm text-body">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-heading">
                  Created Date From
                </label>
                <Input
                  type="date"
                  name="createdAtFrom"
                  value={formData.createdAtFrom}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-heading">
                  Created Date To
                </label>
                <Input
                  type="date"
                  name="createdAtTo"
                  value={formData.createdAtTo}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/users")}>
              Cancel
            </Button>

            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>

            <Button type="submit" disabled={isSearchDisabled}>
              Search
            </Button>
          </div>
        </form>
      </div>

      {searchParams && (
        <div className="flex flex-col gap-4">
          <DataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            error={error ? (error as Error).message : null}
            pageSize={pageSize}
            enableSearch
            searchPlaceholder="Filter Users"
          />

          {!isLoading && !error && total > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={currentLimit}
              totalItems={total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      )}

      <StatusUpdateModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedUser={selectedUser}
        onClose={handleCloseStatusModal}
      />
    </div>
  );
}
