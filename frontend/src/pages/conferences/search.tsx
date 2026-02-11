import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Edit, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import {
  ConferenceStatus,
  type Conference,
  type GetConferencesParams,
} from "@/models/conference";
import { conferenceService } from "@/services/conferenceService";
import { ConferenceStatusUpdateModal } from "@/components/conference/ConferenceStatusUpdateModal";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import {
  getConferenceStatusBadge,
  getConferenceStatusLabel,
} from "@/components/common/ConferenceStatusBadge";
import { formatDateTime } from "@/utils/dateFormatter";

const STATUS_OPTIONS = [
  ConferenceStatus.INACTIVE,
  ConferenceStatus.ACTIVE,
  ConferenceStatus.FINISHED,
  ConferenceStatus.DELETED,
];

function exceedsSixMonths(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const sixMonthsLater = new Date(fromDate);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  return toDate > sixMonthsLater;
}

export default function ConferenceSearch() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = currentRoles?.includes(UserRole.ADMIN);

  const statusOptions = isAdmin
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter(
        (status) =>
          status !== ConferenceStatus.INACTIVE &&
          status !== ConferenceStatus.DELETED,
      );
  const nonAdminDefaultStatuses = [ConferenceStatus.ACTIVE, ConferenceStatus.FINISHED];

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    startAtFrom: "",
    startAtTo: "",
    submissionStartAtFrom: "",
    submissionStartAtTo: "",
    createdAtFrom: "",
    createdAtTo: "",
  });
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [searchParams, setSearchParams] = useState<GetConferencesParams | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(
    null,
  );

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
    queryKey: ["conferences", "search", queryParams],
    queryFn: () => conferenceService.getConferences(queryParams!),
    enabled: queryParams !== null,
  });

  const conferences = searchParams ? response?.data || [] : [];
  const total = searchParams ? response?.total || 0 : 0;
  const currentLimit = response?.pagination?.next?.limit || pageSize;
  const totalPages = Math.ceil(total / currentLimit || 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusToggle = (status: number) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const hasAnyField = useMemo(() => {
    return (
      formData.title.trim() !== "" ||
      (isAdmin && formData.slug.trim() !== "") ||
      selectedStatuses.length > 0 ||
      formData.startAtFrom !== "" ||
      formData.startAtTo !== "" ||
      formData.submissionStartAtFrom !== "" ||
      formData.submissionStartAtTo !== "" ||
      formData.createdAtFrom !== "" ||
      formData.createdAtTo !== ""
    );
  }, [formData, selectedStatuses, isAdmin]);

  const hasOtherFields = useMemo(() => {
    return (
      formData.title.trim() !== "" ||
      (isAdmin && formData.slug.trim() !== "") ||
      selectedStatuses.length > 0
    );
  }, [formData.title, formData.slug, selectedStatuses, isAdmin]);

  const dateValidationError = useMemo(() => {
    const validateRange = (
      from: string,
      to: string,
      fromLabel: string,
      toLabel: string,
    ) => {
      if (from && !to) {
        return `${toLabel} is required when ${fromLabel} is provided`;
      }
      if (!from && to) {
        return `${fromLabel} is required when ${toLabel} is provided`;
      }
      if (from && to && from > to) {
        return `${fromLabel} must not be after ${toLabel}`;
      }
      if (from && to && from !== to && !hasOtherFields && exceedsSixMonths(from, to)) {
        return "Date range must not exceed 6 months when no other search fields are provided";
      }
      return null;
    };

    return (
      validateRange(
        formData.startAtFrom,
        formData.startAtTo,
        "Start Date From",
        "Start Date To",
      ) ||
      validateRange(
        formData.submissionStartAtFrom,
        formData.submissionStartAtTo,
        "Submission Start Date From",
        "Submission Start Date To",
      ) ||
      validateRange(
        formData.createdAtFrom,
        formData.createdAtTo,
        "Created Date From",
        "Created Date To",
      )
    );
  }, [formData, hasOtherFields]);

  const isSearchDisabled = !hasAnyField || dateValidationError !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearchDisabled) return;

    const params: GetConferencesParams = {};
    if (formData.title.trim()) params.title = formData.title.trim();
    if (isAdmin && formData.slug.trim()) params.slug = formData.slug.trim();

    if (formData.startAtFrom) params.startAtFrom = formData.startAtFrom;
    if (formData.startAtTo) params.startAtTo = formData.startAtTo;
    if (formData.submissionStartAtFrom) {
      params.submissionStartAtFrom = formData.submissionStartAtFrom;
    }
    if (formData.submissionStartAtTo) {
      params.submissionStartAtTo = formData.submissionStartAtTo;
    }
    if (formData.createdAtFrom) params.createdAtFrom = formData.createdAtFrom;
    if (formData.createdAtTo) params.createdAtTo = formData.createdAtTo;

    if (isAdmin) {
      if (selectedStatuses.length > 0) {
        params.statusIn = selectedStatuses.join(",");
      }
    } else {
      const effectiveStatuses =
        selectedStatuses.length > 0 ? selectedStatuses : nonAdminDefaultStatuses;
      params.statusIn = effectiveStatuses.join(",");
    }

    setPage(1);
    setSearchParams(params);
  };

  const handleReset = () => {
    setFormData({
      title: "",
      slug: "",
      startAtFrom: "",
      startAtTo: "",
      submissionStartAtFrom: "",
      submissionStartAtTo: "",
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

  const handleOpenStatusModal = (conference: Conference) => {
    setSelectedConference(conference);
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setSelectedConference(null);
    setIsStatusModalOpen(false);
  };

  const columns: ColumnDef<Conference>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-4 justify-center w-full"
          >
            Title
            <ArrowUpDown className="size-4 text-muted-foreground" />
          </div>
        );
      },
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return <div className="font-medium max-w-96 wrap-break-word">{title}</div>;
      },
    },
    {
      accessorKey: "startAt",
      header: "Start Date",
      cell: ({ row }) => (
        <div className="text-sm text-center">
          {formatDateTime(row.getValue("startAt") as string)}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "endAt",
      header: "End Date",
      cell: ({ row }) => (
        <div className="text-sm text-center">
          {formatDateTime(row.getValue("endAt") as string)}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: "status",
      accessorFn: (row) => getConferenceStatusLabel(row.status),
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-4 justify-center w-full"
          >
            Status
            <ArrowUpDown className="size-4 text-muted-foreground" />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex justify-center w-full text-sm">
          {getConferenceStatusBadge(row.original.status)}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-sm text-center">
          {formatDateTime(row.getValue("createdAt") as string)}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const conference = row.original;
        const canManage =
          isAdmin && conference.status !== ConferenceStatus.DELETED;
        return (
          <div className="flex gap-4 place-self-center">
            <Link to={`/conferences/${conference.id}`}>
              <Eye className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
            </Link>
            {canManage && (
              <>
                <Link to={`/conferences/edit/${conference.id}`}>
                  <Edit className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
                </Link>
                <div onClick={() => handleOpenStatusModal(conference)}>
                  <RefreshCw className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Conferences", href: "/conferences" },
          { label: "Advanced Search" },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Advanced Search - Conferences" />
        <PageSubTitle text="Search conferences using advanced filters" />
      </div>

      <div className="relative rounded-lg border border-border bg-card shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {dateValidationError && (
            <div className="text-red-600 text-sm">{dateValidationError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {isAdmin && (
              <div>
                <label className="block text-sm font-medium mb-2 text-heading">
                  Slug
                </label>
                <Input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="Search by Slug"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-heading">
                Status
              </label>
              <div className="flex flex-wrap gap-4 mt-1">
                {statusOptions.map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <span className="text-sm text-body">
                      {getConferenceStatusLabel(status)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Start Date From
              </label>
              <Input
                type="date"
                name="startAtFrom"
                value={formData.startAtFrom}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Start Date To
              </label>
              <Input
                type="date"
                name="startAtTo"
                value={formData.startAtTo}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Submission Start Date From
              </label>
              <Input
                type="date"
                name="submissionStartAtFrom"
                value={formData.submissionStartAtFrom}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Submission Start Date To
              </label>
              <Input
                type="date"
                name="submissionStartAtTo"
                value={formData.submissionStartAtTo}
                onChange={handleInputChange}
              />
            </div>

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

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/conferences")}
            >
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
            data={conferences}
            isLoading={isLoading}
            error={error ? (error as Error).message : null}
            pageSize={pageSize}
            enableSearch
            searchPlaceholder="Filter Conferences"
            searchableColumnIds={["title", "status"]}
          />
          {!isLoading && !error && total > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={currentLimit}
              totalItems={total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[3, 6, 9, 12, 15]}
            />
          )}
        </div>
      )}

      <ConferenceStatusUpdateModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedConference={selectedConference}
        onClose={handleCloseStatusModal}
      />
    </div>
  );
}
