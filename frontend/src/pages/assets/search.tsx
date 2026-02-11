import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/fileService";
import type { File, GetFilesParams } from "@/models/file";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { formatDateTime } from "@/utils/dateFormatter";

export default function AssetSearch() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );

  // Redirect non-admin users
  useEffect(() => {
    if (!currentRoles?.includes(UserRole.ADMIN)) {
      navigate("/unauthorized");
    }
  }, [currentRoles, navigate]);

  if (!currentRoles?.includes(UserRole.ADMIN)) {
    return null;
  }

  const [formData, setFormData] = useState({
    name: "",
    storageKey: "",
    createdAtFrom: "",
    createdAtTo: "",
  });

  const [searchParams, setSearchParams] = useState<GetFilesParams | null>(null);
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
    queryKey: ["files", "search", queryParams],
    queryFn: () => fileService.getFiles(queryParams!),
    enabled: queryParams !== null,
  });

  const files = searchParams ? response?.data || [] : [];
  const total = searchParams ? response?.total || 0 : 0;
  const currentLimit = response?.pagination?.next?.limit || pageSize;
  const totalPages = Math.ceil(total / currentLimit);

  const columns: ColumnDef<File>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-4 justify-center w-full"
          >
            Name
            <ArrowUpDown className="size-4 text-muted-foreground" />
          </div>
        );
      },
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
      header: "Created At",
      cell: ({ row }) => {
        return (
          <div className="text-sm text-center">
            {formatDateTime(row.getValue("createdAt") as string)}
          </div>
        );
      },
      enableSorting: false,
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
      enableSorting: false,
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hasAnyField = useMemo(() => {
    return (
      formData.name.trim() !== "" ||
      formData.storageKey.trim() !== "" ||
      formData.createdAtFrom !== "" ||
      formData.createdAtTo !== ""
    );
  }, [formData]);

  const hasOtherFields = useMemo(() => {
    return formData.name.trim() !== "" || formData.storageKey.trim() !== "";
  }, [formData.name, formData.storageKey]);

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
    if (createdAtFrom && createdAtTo && createdAtFrom !== createdAtTo && !hasOtherFields) {
      const from = new Date(createdAtFrom);
      const to = new Date(createdAtTo);
      const sixMonthsLater = new Date(from);
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      if (to > sixMonthsLater) {
        return "Date range must not exceed 6 months when no other search fields are provided";
      }
    }
    return null;
  }, [formData.createdAtFrom, formData.createdAtTo, hasOtherFields]);

  const isSearchDisabled = !hasAnyField || dateValidationError !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSearchDisabled) return;

    const params: GetFilesParams = {};
    if (formData.name.trim()) params.name = formData.name.trim();
    if (formData.storageKey.trim()) params.storageKey = formData.storageKey.trim();
    if (formData.createdAtFrom) params.createdAtFrom = formData.createdAtFrom;
    if (formData.createdAtTo) params.createdAtTo = formData.createdAtTo;

    setPage(1);
    setSearchParams(params);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      storageKey: "",
      createdAtFrom: "",
      createdAtTo: "",
    });
    setSearchParams(null);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Assets", href: "/assets" },
          { label: "Advanced Search" },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Advanced Search - Assets" />
        <PageSubTitle text="Search assets using advanced filters" />
      </div>

      <div className="relative rounded-lg border border-border bg-card shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {dateValidationError && <div className="text-red-600 text-sm">{dateValidationError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Search by Name"
              />
            </div>

            {/* Storage Key Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Storage Key
              </label>
              <Input
                type="text"
                name="storageKey"
                value={formData.storageKey}
                onChange={handleInputChange}
                placeholder="Search by Storage Key"
              />
            </div>

            {/* Created Date From */}
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

            {/* Created Date To */}
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

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/assets")}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              Reset
            </Button>

            <Button
              type="submit"
              disabled={isSearchDisabled}
            >
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {searchParams && (
        <div className="flex flex-col gap-4">
          <DataTable
            columns={columns}
            data={files}
            isLoading={isLoading}
            error={error ? (error as Error).message : null}
            pageSize={pageSize}
            enableSearch
            searchPlaceholder="Filter Assets"
            searchableColumnIds={["name", "storageKey"]}
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
    </div>
  );
}
