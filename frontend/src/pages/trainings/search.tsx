import { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { useQuery } from "@tanstack/react-query";
import { trainingService } from "@/services/trainingService";
import type { Training, GetTrainingsParams } from "@/models/training";
import { TrainingStatus } from "@/models/training";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { formatDateTime } from "@/utils/dateFormatter";
import { Badge } from "@/components/ui/badge";

const STATUS_OPTIONS = [
  { value: TrainingStatus.UPCOMING, label: "Upcoming" },
  { value: TrainingStatus.ONGOING, label: "Ongoing" },
  { value: TrainingStatus.COMPLETED, label: "Completed" },
  { value: TrainingStatus.DELETED, label: "Deleted" },
];

const getStatusBadge = (status: number) => {
  switch (status) {
    case TrainingStatus.UPCOMING:
      return <Badge variant="secondary">Upcoming</Badge>;
    case TrainingStatus.ONGOING:
      return <Badge variant="default">Ongoing</Badge>;
    case TrainingStatus.COMPLETED:
      return <Badge variant="outline">Completed</Badge>;
    case TrainingStatus.DELETED:
      return <Badge variant="destructive">Deleted</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function TrainingSearch() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);
  const statusOptions = isAdmin
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter((option) => option.value === 1 || option.value === 2);
  const defaultStatusValues = isAdmin ? [] : statusOptions.map((option) => option.value);


  const [formData, setFormData] = useState({
    title: "",
    createdAtFrom: "",
    createdAtTo: "",
  });

  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [searchParams, setSearchParams] = useState<GetTrainingsParams | null>(null);
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
    queryKey: ["trainings", "search", queryParams],
    queryFn: () => trainingService.getTrainings(queryParams!),
    enabled: queryParams !== null,
  });

  const items = searchParams ? response?.data || [] : [];
  const total = searchParams ? response?.total || 0 : 0;
  const currentLimit = response?.pagination?.next?.limit || pageSize;
  const totalPages = Math.ceil(total / currentLimit);

  const columns: ColumnDef<Training>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div className="font-medium max-w-96 wrap-break-word">{title}</div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center w-full text-sm">
            {getStatusBadge(row.getValue("status") as number)}
          </div>
        );
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
        const status = row?.original?.status;
        return (
          <div className="flex gap-4 place-self-center">
            <Link to={`/trainings/${row?.original?.id}`}>
              <Eye className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
            </Link>
            {isAdmin && status !== TrainingStatus.DELETED && (
              <Link to={`/trainings/edit/${row?.original?.id}`}>
                <Edit className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusToggle = (statusValue: number) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusValue)
        ? prev.filter((s) => s !== statusValue)
        : [...prev, statusValue],
    );
  };

  const hasAnyField = useMemo(() => {
    return (
      formData.title.trim() !== "" ||
      formData.createdAtFrom !== "" ||
      formData.createdAtTo !== "" ||
      selectedStatuses.length > 0
    );
  }, [formData, selectedStatuses]);

  const hasOtherFields = useMemo(() => {
    return (
      formData.title.trim() !== "" ||
      selectedStatuses.length > 0
    );
  }, [formData.title, selectedStatuses]);

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

    const params: GetTrainingsParams = {};
    if (formData.title.trim()) params.title = formData.title.trim();
    if (formData.createdAtFrom) params.createdAtFrom = formData.createdAtFrom;
    if (formData.createdAtTo) params.createdAtTo = formData.createdAtTo;
    if (isAdmin) {
      if (selectedStatuses.length > 0)
        params.statusIn = selectedStatuses.join(",");
    } else {
      const effectiveStatuses =
        selectedStatuses.length > 0 ? selectedStatuses : defaultStatusValues;
      if (effectiveStatuses.length > 0)
        params.statusIn = effectiveStatuses.join(",");
    }

    setPage(1);
    setSearchParams(params);
  };

  const handleReset = () => {
    setFormData({
      title: "",
      createdAtFrom: "",
      createdAtTo: "",
    });
    setSelectedStatuses([]);
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
          { label: "Trainings", href: "/trainings" },
          { label: "Advanced Search" },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Advanced Search - Trainings" />
        <PageSubTitle text="Search trainings using advanced filters" />
      </div>

      <div className="relative rounded-lg border border-border bg-card shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {dateValidationError && <div className="text-red-600 text-sm">{dateValidationError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Title
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Search by Title"
              />
            </div>

            {/* Status Multi-Select */}
            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Status
              </label>
              <div className="flex flex-wrap gap-4 mt-1">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedStatuses.includes(option.value)}
                      onCheckedChange={() => handleStatusToggle(option.value)}
                    />
                    <span className="text-sm text-body">{option.label}</span>
                  </label>
                ))}
              </div>
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
              onClick={() => navigate("/trainings")}
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
            data={items}
            isLoading={isLoading}
            error={error ? (error as Error).message : null}
            pageSize={pageSize}
            enableSearch
            searchPlaceholder="Filter Trainings"
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
