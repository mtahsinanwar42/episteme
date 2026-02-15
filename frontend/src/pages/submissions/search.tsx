import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import { SubmissionStatus, type Submission } from "@/models/submission";
import {
  submissionService,
  type SearchSubmissionsParams,
} from "@/services/submissionService";
import { conferenceService } from "@/services/conferenceService";
import { userService } from "@/services/userService";
import { miscService } from "@/services/miscService";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageTitle from "@/components/common/PageTitle";
import PageSubTitle from "@/components/common/PageSubTitle";
import { formatDateTime } from "@/utils/dateFormatter";
import {
  getPaymentStatusBadge,
  getSubmissionStatusBadge,
} from "@/components/common/ResourceStatusBadge";

const SUBMISSION_STATUS_OPTIONS = [
  SubmissionStatus.PENDING_APPROVAL,
  SubmissionStatus.RETURNED,
  SubmissionStatus.APPROVED,
  SubmissionStatus.REJECTED,
  SubmissionStatus.DELETED,
];

const getSubmissionStatusLabel = (status: number | undefined) => {
  switch (status) {
    case SubmissionStatus.DRAFT:
      return "Draft";
    case SubmissionStatus.PENDING_APPROVAL:
      return "Pending Approval";
    case SubmissionStatus.RETURNED:
      return "Returned";
    case SubmissionStatus.APPROVED:
      return "Approved";
    case SubmissionStatus.REJECTED:
      return "Rejected";
    case SubmissionStatus.DELETED:
      return "Deleted";
    default:
      return `${status}`;
  }
};

export default function SubmissionSearch() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = Boolean(currentRoles?.includes(UserRole.ADMIN));

  const [formData, setFormData] = useState({
    title: "",
    formId: "",
    doi: "",
    conferenceId: "",
    createdDateFrom: "",
    createdDateTo: "",
  });
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedOwnerUsrIds, setSelectedOwnerUsrIds] = useState<string[]>([]);
  const [searchParams, setSearchParams] =
    useState<SearchSubmissionsParams | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: conferencesResponse,
    isLoading: conferencesLoading,
    error: conferencesError,
  } = useQuery({
    queryKey: ["conferences", "submission-search-options"],
    queryFn: () => conferenceService.getActiveAndFinishedConferences(),
  });

  const {
    data: topicsResponse,
    isLoading: topicsLoading,
    error: topicsError,
  } = useQuery({
    queryKey: ["topics", "submission-search-options"],
    queryFn: () => miscService.getTopics(),
  });

  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users", "submission-search-options", "owners"],
    queryFn: () =>
      userService.getUsers({
        roles: UserRole.USER,
        paginate: false,
        sort: "firstName",
        limit: 500,
      }),
    enabled: isAdmin,
  });

  const queryParams = searchParams
    ? {
        ...searchParams,
        page,
        limit: pageSize,
      }
    : null;

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["submissions", "search", queryParams],
    queryFn: () => submissionService.searchSubmissions(queryParams!),
    enabled: queryParams !== null,
  });

  const conferences = conferencesResponse?.data ?? [];
  const topics = topicsResponse?.data ?? [];
  const ownerUsers = usersResponse?.data ?? [];

  const submissions = searchParams ? response?.data || [] : [];
  const total = searchParams ? response?.total || 0 : 0;
  const currentLimit = response?.limit || pageSize;
  const totalPages = Math.ceil(total / currentLimit || 1);

  const hasAnyField = useMemo(() => {
    return (
      formData.title.trim() !== "" ||
      formData.formId.trim() !== "" ||
      formData.doi.trim() !== "" ||
      formData.conferenceId !== "" ||
      formData.createdDateFrom !== "" ||
      formData.createdDateTo !== "" ||
      selectedTopics.length > 0 ||
      selectedStatuses.length > 0 ||
      selectedOwnerUsrIds.length > 0
    );
  }, [formData, selectedTopics, selectedStatuses, selectedOwnerUsrIds]);

  const dateValidationError = useMemo(() => {
    const { createdDateFrom, createdDateTo } = formData;

    if (createdDateFrom && !createdDateTo) {
      return "Created Date To is required when Created Date From is provided";
    }
    if (!createdDateFrom && createdDateTo) {
      return "Created Date From is required when Created Date To is provided";
    }
    if (createdDateFrom && createdDateTo && createdDateFrom > createdDateTo) {
      return "Created Date From must not be after Created Date To";
    }

    return null;
  }, [formData]);

  const isSearchDisabled = !hasAnyField || dateValidationError !== null;

  const statusOptions = isAdmin
    ? SUBMISSION_STATUS_OPTIONS
    : SUBMISSION_STATUS_OPTIONS.filter(
        (status) => status !== SubmissionStatus.DELETED,
      );

  const columns: ColumnDef<Submission>[] = useMemo(() => {
    const ownerColumn: ColumnDef<Submission> = {
      id: "owner",
      accessorFn: (row) =>
        `${row.ownerFirstName ?? ""} ${row.ownerLastName ?? ""} ${row.ownerEmail ?? ""}`,
      header: "Owner",
      cell: ({ row }) => (
        <div>
          <div>
            {row.original.ownerFirstName} {row.original.ownerLastName}
          </div>
          <div>Email: {row.original.ownerEmail}</div>
        </div>
      ),
      enableSorting: false,
    };

    const paymentColumn: ColumnDef<Submission> = {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as number;
        return (
          <div className="flex place-self-center">
            {getPaymentStatusBadge(status)}
          </div>
        );
      },
      enableSorting: false,
    };

    return [
      {
        accessorKey: "formId",
        header: "Form ID",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.formId || "-"}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.getValue("title")}</span>
        ),
        enableSorting: false,
      },
      {
        id: "topics",
        accessorFn: (row) => (row.topics ?? []).join(", "),
        header: "Topics",
        cell: ({ row }) => {
          const topics = row.original.topics ?? [];
          return <div className="flex gap-1 flex-wrap">{topics?.join(", ")}</div>;
        },
        enableSorting: false,
      },
      {
        accessorKey: "conferenceTitle",
        header: "Conference",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("conferenceTitle")}</span>
        ),
        enableSorting: false,
      },
      {
        id: "status",
        accessorFn: (row) => getSubmissionStatusLabel(row.status),
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
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex place-self-center">
              {getSubmissionStatusBadge(status)}
            </div>
          );
        },
        enableSorting: true,
      },
      ...(isAdmin ? [ownerColumn] : []),
      ...(isAdmin ? [paymentColumn] : []),
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <span className="text-sm">{formatDateTime(row.original.createdAt || "")}</span>
        ),
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
              <Link to={`/submissions/${row?.original?.submissionId}`}>
                <Eye className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
              </Link>
            </div>
          );
        },
        enableSorting: false,
      },
    ];
  }, [isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSearchDisabled) return;

    const params: SearchSubmissionsParams = {};
    if (formData.title.trim()) params.title = formData.title.trim();
    if (formData.formId.trim()) params.formId = formData.formId.trim();
    if (formData.doi.trim()) params.doi = formData.doi.trim();
    if (formData.conferenceId) params.conferenceId = Number(formData.conferenceId);
    if (formData.createdDateFrom) params.createdDateFrom = formData.createdDateFrom;
    if (formData.createdDateTo) params.createdDateTo = formData.createdDateTo;
    if (selectedTopics.length > 0) params.topics = selectedTopics;
    if (selectedStatuses.length > 0) {
      params.status = selectedStatuses.map((value) => Number(value));
    }
    if (isAdmin && selectedOwnerUsrIds.length > 0) {
      params.ownerUsrIds = selectedOwnerUsrIds.map((value) => Number(value));
    }

    setPage(1);
    setSearchParams(params);
  };

  const handleReset = () => {
    setFormData({
      title: "",
      formId: "",
      doi: "",
      conferenceId: "",
      createdDateFrom: "",
      createdDateTo: "",
    });
    setSelectedTopics([]);
    setSelectedStatuses([]);
    setSelectedOwnerUsrIds([]);
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
          { label: "Submissions", href: "/submissions" },
          { label: "Advanced Search" },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Advanced Search - Submissions" />
        <PageSubTitle text="Search submissions using advanced filters" />
      </div>

      <div className="relative rounded-lg border border-border bg-card shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {dateValidationError && (
            <div className="text-red-600 text-sm">{dateValidationError}</div>
          )}

          {conferencesError && (
            <div className="text-red-600 text-sm">
              {(conferencesError as Error).message}
            </div>
          )}
          {topicsError && (
            <div className="text-red-600 text-sm">
              {(topicsError as Error).message}
            </div>
          )}
          {isAdmin && usersError && (
            <div className="text-red-600 text-sm">
              {(usersError as Error).message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Form ID
              </label>
              <Input
                type="text"
                name="formId"
                value={formData.formId}
                onChange={handleInputChange}
                placeholder="Enter exact Form ID"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                DOI
              </label>
              <Input
                type="text"
                name="doi"
                value={formData.doi}
                onChange={handleInputChange}
                placeholder="Search by DOI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Conference
              </label>
              <Select
                value={formData.conferenceId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, conferenceId: value }))
                }
                disabled={conferencesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a conference" />
                </SelectTrigger>
                <SelectContent>
                  {conferences.map((conference) => (
                    <SelectItem
                      key={conference.id}
                      value={String(conference.id)}
                    >
                      {conference.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Topics
              </label>
              <MultiSelect
                options={topics.map((topic) => ({
                  label: topic,
                  value: topic,
                }))}
                value={selectedTopics}
                onValueChange={setSelectedTopics}
                placeholder={
                  topicsLoading ? "Loading topics..." : "Select topics"
                }
                disabled={topicsLoading}
                searchable
                hideSelectAll
                emptyIndicator="No topics available."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-heading">
                Status
              </label>
              <div className="flex flex-wrap gap-4 mt-1">
                {statusOptions.map((status) => {
                  const statusValue = String(status);
                  return (
                    <label
                      key={status}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedStatuses.includes(statusValue)}
                        onCheckedChange={() =>
                          setSelectedStatuses((prev) =>
                            prev.includes(statusValue)
                              ? prev.filter((s) => s !== statusValue)
                              : [...prev, statusValue],
                          )
                        }
                      />
                      <span className="text-sm text-body">
                        {getSubmissionStatusLabel(status)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {isAdmin && (
              <div>
                <label className="block text-sm font-medium mb-2 text-heading">
                  Owners
                </label>
                <MultiSelect
                  options={ownerUsers.map((user) => ({
                    label: `${user.firstName} ${user.lastName} (${user.email})`,
                    value: String(user.id),
                  }))}
                  value={selectedOwnerUsrIds}
                  onValueChange={setSelectedOwnerUsrIds}
                  placeholder={
                    usersLoading ? "Loading users..." : "Select owners"
                  }
                  disabled={usersLoading}
                  searchable
                  hideSelectAll
                  emptyIndicator="No users available."
                />
              </div>
            )}

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-heading">
                  Created Date From
                </label>
                <Input
                  type="date"
                  name="createdDateFrom"
                  value={formData.createdDateFrom}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-heading">
                  Created Date To
                </label>
                <Input
                  type="date"
                  name="createdDateTo"
                  value={formData.createdDateTo}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/submissions")}
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
            data={submissions}
            isLoading={isLoading}
            error={error ? (error as Error).message : null}
            pageSize={pageSize}
            enableSearch
            searchPlaceholder="Filter Submissions"
            searchableColumnIds={[
              "title",
              "formId",
              "status",
              "conferenceTitle",
              "owner",
              "topics",
            ]}
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
