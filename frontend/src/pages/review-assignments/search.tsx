import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import type { ReviewAssignment } from "@/models/reviewAssignment";
import {
  ReviewAssignmentStatus,
  ContentSubmissionStatus,
} from "@/models/reviewAssignment";
import { ConferenceStatus } from "@/models/conference";
import {
  reviewAssignmentService,
  type SearchReviewAssignmentsParams,
} from "@/services/reviewAssignmentService";
import { conferenceService } from "@/services/conferenceService";
import { userService } from "@/services/userService";
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
import { formatDateTime, isDueAtNotPassed } from "@/utils/dateFormatter";
import {
  getSubmissionStatusBadge,
  getSubmissionStatusLabel,
} from "@/components/common/SubmissionStatusBadge";
import {
  getReviewAssignmentStatusBadge,
  getReviewAssignmentStatusLabel,
} from "@/components/common/ReviewAssignmentStatusBadge";
import { ReviewAssignmentStatusUpdateModal } from "@/components/reviewAssignment/ReviewAssignmentStatusUpdateModal";

const SUBMISSION_STATUS_OPTIONS = [
  ContentSubmissionStatus.PENDING_APPROVAL,
  ContentSubmissionStatus.RETURNED,
  ContentSubmissionStatus.APPROVED,
  ContentSubmissionStatus.REJECTED,
  ContentSubmissionStatus.DELETED,
];

const ASSIGNMENT_STATUS_OPTIONS = [
  ReviewAssignmentStatus.ASSIGNED,
  ReviewAssignmentStatus.ACCEPTED,
  ReviewAssignmentStatus.DECLINED,
  ReviewAssignmentStatus.COMPLETED,
  ReviewAssignmentStatus.CANCELLED,
  ReviewAssignmentStatus.OVERDUE,
  ReviewAssignmentStatus.DELETED,
];

const ADMIN_ALLOWED_STATUSES = [
  ReviewAssignmentStatus.ASSIGNED,
  ReviewAssignmentStatus.CANCELLED,
  ReviewAssignmentStatus.DELETED,
];

const REVIEWER_ALLOWED_STATUSES = [
  ReviewAssignmentStatus.ACCEPTED,
  ReviewAssignmentStatus.DECLINED,
];

function canAdminUpdateStatus(assignment: ReviewAssignment): boolean {
  const isAssignmentUpdatable =
    assignment.assignmentStatus !== ReviewAssignmentStatus.CANCELLED &&
    assignment.assignmentStatus !== ReviewAssignmentStatus.OVERDUE &&
    assignment.assignmentStatus !== ReviewAssignmentStatus.DELETED;

  const isSubmissionEligible =
    assignment.submissionStatus === ContentSubmissionStatus.PENDING_APPROVAL ||
    assignment.submissionStatus === ContentSubmissionStatus.RETURNED;

  const isConferenceActive =
    assignment.conferenceStatus === ConferenceStatus.ACTIVE;

  return isAssignmentUpdatable && isSubmissionEligible && isConferenceActive;
}

function canReviewerUpdateStatus(assignment: ReviewAssignment): boolean {
  const isStatusUpdatable =
    assignment.assignmentStatus === ReviewAssignmentStatus.ASSIGNED ||
    assignment.assignmentStatus === ReviewAssignmentStatus.ACCEPTED ||
    assignment.assignmentStatus === ReviewAssignmentStatus.DECLINED;

  const isNotOverdue = isDueAtNotPassed(assignment.dueAt);

  const isSubmissionEligible =
    assignment.submissionStatus === ContentSubmissionStatus.PENDING_APPROVAL ||
    assignment.submissionStatus === ContentSubmissionStatus.RETURNED;

  const isConferenceActive =
    assignment.conferenceStatus === ConferenceStatus.ACTIVE;

  return isStatusUpdatable && isNotOverdue && isSubmissionEligible && isConferenceActive;
}

export default function ReviewAssignmentSearch() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = Boolean(currentRoles?.includes(UserRole.ADMIN));

  const [formData, setFormData] = useState({
    submissionTitle: "",
    formId: "",
    conferenceId: "",
    assignedDateFrom: "",
    assignedDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
  });
  const [selectedSubmissionStatuses, setSelectedSubmissionStatuses] = useState<
    string[]
  >([]);
  const [selectedAssignmentStatuses, setSelectedAssignmentStatuses] = useState<
    string[]
  >([]);
  const [selectedAssignedByUsrIds, setSelectedAssignedByUsrIds] = useState<
    string[]
  >([]);
  const [selectedSubmissionOwnerUsrIds, setSelectedSubmissionOwnerUsrIds] =
    useState<string[]>([]);
  const [selectedReviewerUsrIds, setSelectedReviewerUsrIds] = useState<
    string[]
  >([]);
  const [searchParams, setSearchParams] =
    useState<SearchReviewAssignmentsParams | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<ReviewAssignment | null>(null);

  const {
    data: conferencesResponse,
    isLoading: conferencesLoading,
    error: conferencesError,
  } = useQuery({
    queryKey: ["conferences", "review-assignment-search-options"],
    queryFn: () => conferenceService.getActiveAndFinishedConferences(),
  });

  const {
    data: assignedByUsersResponse,
    isLoading: assignedByUsersLoading,
    error: assignedByUsersError,
  } = useQuery({
    queryKey: ["users", "review-assignment-search-options", "assigned-by"],
    queryFn: () =>
      userService.getUsers({
        roles: UserRole.ADMIN,
        paginate: false,
        sort: "firstName",
        limit: 500,
      }),
    enabled: isAdmin,
  });

  const {
    data: ownerUsersResponse,
    isLoading: ownerUsersLoading,
    error: ownerUsersError,
  } = useQuery({
    queryKey: ["users", "review-assignment-search-options", "owners"],
    queryFn: () =>
      userService.getUsers({
        roles: UserRole.USER,
        paginate: false,
        sort: "firstName",
        limit: 500,
      }),
    enabled: isAdmin,
  });

  const {
    data: reviewerUsersResponse,
    isLoading: reviewerUsersLoading,
    error: reviewerUsersError,
  } = useQuery({
    queryKey: ["users", "review-assignment-search-options", "reviewers"],
    queryFn: () =>
      userService.getUsers({
        roles: UserRole.REVIEWER,
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
    queryKey: ["review-assignments", "search", queryParams],
    queryFn: () => reviewAssignmentService.searchReviewAssignments(queryParams!),
    enabled: queryParams !== null,
  });

  const conferences = conferencesResponse?.data ?? [];
  const assignedByUsers = assignedByUsersResponse?.data ?? [];
  const ownerUsers = ownerUsersResponse?.data ?? [];
  const reviewerUsers = reviewerUsersResponse?.data ?? [];

  const assignments = searchParams ? response?.data || [] : [];
  const total = searchParams ? response?.total || 0 : 0;
  const currentLimit = response?.limit || pageSize;
  const totalPages = Math.ceil(total / currentLimit || 1);

  const hasAnyField = useMemo(() => {
    return (
      formData.submissionTitle.trim() !== "" ||
      formData.formId.trim() !== "" ||
      formData.conferenceId !== "" ||
      formData.assignedDateFrom !== "" ||
      formData.assignedDateTo !== "" ||
      formData.dueDateFrom !== "" ||
      formData.dueDateTo !== "" ||
      selectedSubmissionStatuses.length > 0 ||
      selectedAssignmentStatuses.length > 0 ||
      (isAdmin && selectedAssignedByUsrIds.length > 0) ||
      (isAdmin && selectedSubmissionOwnerUsrIds.length > 0) ||
      selectedReviewerUsrIds.length > 0
    );
  }, [
    formData,
    selectedSubmissionStatuses,
    selectedAssignmentStatuses,
    isAdmin,
    selectedAssignedByUsrIds,
    selectedSubmissionOwnerUsrIds,
    selectedReviewerUsrIds,
  ]);

  const dateValidationError = useMemo(() => {
    const { assignedDateFrom, assignedDateTo, dueDateFrom, dueDateTo } = formData;

    if (assignedDateFrom && !assignedDateTo) {
      return "Assigned Date To is required when Assigned Date From is provided";
    }
    if (!assignedDateFrom && assignedDateTo) {
      return "Assigned Date From is required when Assigned Date To is provided";
    }
    if (assignedDateFrom && assignedDateTo && assignedDateFrom > assignedDateTo) {
      return "Assigned Date From must not be after Assigned Date To";
    }

    if (dueDateFrom && !dueDateTo) {
      return "Due Date To is required when Due Date From is provided";
    }
    if (!dueDateFrom && dueDateTo) {
      return "Due Date From is required when Due Date To is provided";
    }
    if (dueDateFrom && dueDateTo && dueDateFrom > dueDateTo) {
      return "Due Date From must not be after Due Date To";
    }

    return null;
  }, [formData]);

  const isSearchDisabled = !hasAnyField || dateValidationError !== null;

  const submissionStatusOptions = isAdmin
    ? SUBMISSION_STATUS_OPTIONS
    : SUBMISSION_STATUS_OPTIONS.filter(
        (status) => status !== ContentSubmissionStatus.DELETED,
      );

  const assignmentStatusOptions = isAdmin
    ? ASSIGNMENT_STATUS_OPTIONS
    : ASSIGNMENT_STATUS_OPTIONS.filter(
        (status) => status !== ReviewAssignmentStatus.DELETED,
      );

  const handleOpenStatusModal = useCallback((assignment: ReviewAssignment) => {
    setSelectedAssignment(assignment);
    setIsStatusModalOpen(true);
  }, []);

  const handleCloseStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
    setSelectedAssignment(null);
  }, []);

  const columns: ColumnDef<ReviewAssignment>[] = useMemo(() => {
    return [
      {
        accessorKey: "formId",
        header: "Submission Form ID",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.formId || "-"}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "submissionTitle",
        header: "Submission Title",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("submissionTitle")}</span>
        ),
        enableSorting: false,
      },
      {
        id: "submissionStatus",
        accessorFn: (row) => getSubmissionStatusLabel(row.submissionStatus),
        header: "Submission Status",
        cell: ({ row }) => (
          <div className="flex place-self-center">
            {getSubmissionStatusBadge(row.original.submissionStatus)}
          </div>
        ),
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
        id: "submitter",
        accessorFn: (row) =>
          `${row.ownerFirstName} ${row.ownerLastName} ${row.ownerEmail}`,
        header: "Submission Owner",
        cell: ({ row }) => (
          <div className="text-sm">
            <div>
              {row.original.ownerFirstName} {row.original.ownerLastName}
            </div>
            <div className="text-muted-foreground text-xs">{row.original.ownerEmail}</div>
          </div>
        ),
        enableSorting: false,
      },
      ...(isAdmin
        ? [
            {
              id: "reviewer",
              accessorFn: (row: ReviewAssignment) =>
                `${row.reviewerFirstName} ${row.reviewerLastName} ${row.reviewerEmail}`,
              header: "Reviewer",
              cell: ({ row }: { row: { original: ReviewAssignment } }) => (
                <div className="text-sm">
                  <div>
                    {row.original.reviewerFirstName} {row.original.reviewerLastName}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {row.original.reviewerEmail}
                  </div>
                </div>
              ),
              enableSorting: false,
            },
          ]
        : []),
      {
        id: "assignmentStatus",
        accessorFn: (row) => getReviewAssignmentStatusLabel(row.assignmentStatus),
        header: ({ column }) => {
          return (
            <div
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-4 justify-center w-full"
            >
              Assignment Status
              <ArrowUpDown className="size-4 text-muted-foreground" />
            </div>
          );
        },
        cell: ({ row }) => (
          <div className="flex place-self-center">
            {getReviewAssignmentStatusBadge(row.original.assignmentStatus)}
          </div>
        ),
      },
      {
        accessorKey: "assignedAt",
        header: "Assigned At",
        cell: ({ row }) => (
          <span className="text-sm">{formatDateTime(row.getValue("assignedAt") as string)}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "dueAt",
        header: "Due At",
        cell: ({ row }) => (
          <span className="text-sm">{formatDateTime(row.getValue("dueAt") as string)}</span>
        ),
        enableSorting: false,
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const assignment = row.original;

          return (
            <div className="flex gap-4 place-self-center">
              <Link to={`/submissions/${assignment.submissionId}`} title="View Submission">
                <Eye className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
              </Link>

              <div onClick={() => handleOpenStatusModal(assignment)} title="Assignment Details">
                <Info className="size-4 text-foreground hover:text-foreground/80 cursor-pointer" />
              </div>
            </div>
          );
        },
        enableSorting: false,
      },
    ] as ColumnDef<ReviewAssignment>[];
  }, [handleOpenStatusModal, isAdmin]);

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

    const params: SearchReviewAssignmentsParams = {};

    if (formData.submissionTitle.trim()) {
      params.submissionTitle = formData.submissionTitle.trim();
    }
    if (formData.formId.trim()) {
      params.formId = formData.formId.trim();
    }
    if (formData.conferenceId) {
      params.conferenceId = Number(formData.conferenceId);
    }
    if (formData.assignedDateFrom) {
      params.assignedDateFrom = formData.assignedDateFrom;
    }
    if (formData.assignedDateTo) {
      params.assignedDateTo = formData.assignedDateTo;
    }
    if (formData.dueDateFrom) {
      params.dueDateFrom = formData.dueDateFrom;
    }
    if (formData.dueDateTo) {
      params.dueDateTo = formData.dueDateTo;
    }
    if (selectedSubmissionStatuses.length > 0) {
      params.submissionStatuses = selectedSubmissionStatuses.map((value) =>
        Number(value),
      );
    }
    if (selectedAssignmentStatuses.length > 0) {
      params.assignmentStatuses = selectedAssignmentStatuses.map((value) =>
        Number(value),
      );
    }
    if (isAdmin && selectedAssignedByUsrIds.length > 0) {
      params.assignedByUsrIds = selectedAssignedByUsrIds.map((value) => Number(value));
    }
    if (isAdmin && selectedSubmissionOwnerUsrIds.length > 0) {
      params.submissionOwnerUsrIds = selectedSubmissionOwnerUsrIds.map((value) =>
        Number(value),
      );
    }
    if (isAdmin && selectedReviewerUsrIds.length > 0) {
      params.reviewerUsrIds = selectedReviewerUsrIds.map((value) => Number(value));
    }

    setPage(1);
    setSearchParams(params);
  };

  const handleReset = () => {
    setFormData({
      submissionTitle: "",
      formId: "",
      conferenceId: "",
      assignedDateFrom: "",
      assignedDateTo: "",
      dueDateFrom: "",
      dueDateTo: "",
    });
    setSelectedSubmissionStatuses([]);
    setSelectedAssignmentStatuses([]);
    setSelectedAssignedByUsrIds([]);
    setSelectedSubmissionOwnerUsrIds([]);
    setSelectedReviewerUsrIds([]);
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

  const backUrl = isAdmin ? "/review-assignments" : "/review-assignments/me";

  return (
    <div>
      <Breadcrumb
        items={[
          {
            label: isAdmin ? "Review Assignments" : "My Review Assignments",
            href: backUrl,
          },
          { label: "Advanced Search" },
        ]}
      />

      <div className="mb-8">
        <PageTitle title="Advanced Search - Review Assignments" />
        <PageSubTitle text="Search review assignments using advanced filters" />
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
          {isAdmin && assignedByUsersError && (
            <div className="text-red-600 text-sm">
              {(assignedByUsersError as Error).message}
            </div>
          )}
          {isAdmin && ownerUsersError && (
            <div className="text-red-600 text-sm">
              {(ownerUsersError as Error).message}
            </div>
          )}
          {isAdmin && reviewerUsersError && (
            <div className="text-red-600 text-sm">
              {(reviewerUsersError as Error).message}
            </div>
          )}

          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-heading">
                Submission Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-heading">
                    Submission Form ID
                  </label>
                  <Input
                    type="text"
                    name="formId"
                    value={formData.formId}
                    onChange={handleInputChange}
                    placeholder="Enter exact Submission Form ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-heading">
                    Submission Title
                  </label>
                  <Input
                    type="text"
                    name="submissionTitle"
                    value={formData.submissionTitle}
                    onChange={handleInputChange}
                    placeholder="Search by Submission Title"
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
                    Submission Status
                  </label>
                  <div className="flex flex-wrap gap-4 mt-1">
                    {submissionStatusOptions.map((status) => {
                      const statusValue = String(status);
                      return (
                        <label
                          key={status}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedSubmissionStatuses.includes(
                              statusValue,
                            )}
                            onCheckedChange={() =>
                              setSelectedSubmissionStatuses((prev) =>
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
                      Submission Owners
                    </label>
                    <MultiSelect
                      options={ownerUsers.map((user) => ({
                        label: `${user.firstName} ${user.lastName} (${user.email})`,
                        value: String(user.id),
                      }))}
                      value={selectedSubmissionOwnerUsrIds}
                      onValueChange={setSelectedSubmissionOwnerUsrIds}
                      placeholder={
                        ownerUsersLoading
                          ? "Loading users..."
                          : "Select submission owners"
                      }
                      disabled={ownerUsersLoading}
                      searchable
                      hideSelectAll
                      emptyIndicator="No users available."
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-heading">
                Assignment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-heading">
                    Assignment Status
                  </label>
                  <div className="flex flex-wrap gap-4 mt-1">
                    {assignmentStatusOptions.map((status) => {
                      const statusValue = String(status);
                      return (
                        <label
                          key={status}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedAssignmentStatuses.includes(
                              statusValue,
                            )}
                            onCheckedChange={() =>
                              setSelectedAssignmentStatuses((prev) =>
                                prev.includes(statusValue)
                                  ? prev.filter((s) => s !== statusValue)
                                  : [...prev, statusValue],
                              )
                            }
                          />
                          <span className="text-sm text-body">
                            {getReviewAssignmentStatusLabel(status)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-heading">
                      Assigned By
                    </label>
                    <MultiSelect
                      options={assignedByUsers.map((user) => ({
                        label: `${user.firstName} ${user.lastName} (${user.email})`,
                        value: String(user.id),
                      }))}
                      value={selectedAssignedByUsrIds}
                      onValueChange={setSelectedAssignedByUsrIds}
                      placeholder={
                        assignedByUsersLoading
                          ? "Loading users..."
                          : "Select assigners"
                      }
                      disabled={assignedByUsersLoading}
                      searchable
                      hideSelectAll
                      emptyIndicator="No users available."
                    />
                  </div>
                )}

                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-heading">
                      Reviewers
                    </label>
                    <MultiSelect
                      options={reviewerUsers.map((user) => ({
                        label: `${user.firstName} ${user.lastName} (${user.email})`,
                        value: String(user.id),
                      }))}
                      value={selectedReviewerUsrIds}
                      onValueChange={setSelectedReviewerUsrIds}
                      placeholder={
                        reviewerUsersLoading
                          ? "Loading users..."
                          : "Select reviewers"
                      }
                      disabled={reviewerUsersLoading}
                      searchable
                      hideSelectAll
                      emptyIndicator="No users available."
                    />
                  </div>
                )}

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-heading">
                      Assigned Date From
                    </label>
                    <Input
                      type="date"
                      name="assignedDateFrom"
                      value={formData.assignedDateFrom}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-heading">
                      Assigned Date To
                    </label>
                    <Input
                      type="date"
                      name="assignedDateTo"
                      value={formData.assignedDateTo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-heading">
                      Due Date From
                    </label>
                    <Input
                      type="date"
                      name="dueDateFrom"
                      value={formData.dueDateFrom}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-heading">
                      Due Date To
                    </label>
                    <Input
                      type="date"
                      name="dueDateTo"
                      value={formData.dueDateTo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(backUrl)}
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
            data={assignments}
            isLoading={isLoading}
            error={error ? (error as Error).message : null}
            pageSize={pageSize}
            enableSearch
            searchPlaceholder="Filter assignments"
            searchableColumnIds={[
              "submissionTitle",
              "formId",
              "submissionStatus",
              "conferenceTitle",
              "reviewer",
              "assignmentStatus",
              "submitter",
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

      <ReviewAssignmentStatusUpdateModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedAssignment={selectedAssignment}
        onClose={handleCloseStatusModal}
        showNotes={isAdmin}
        allowedStatuses={
          isAdmin ? ADMIN_ALLOWED_STATUSES : REVIEWER_ALLOWED_STATUSES
        }
        canUpdateStatus={
          selectedAssignment
            ? isAdmin
              ? canAdminUpdateStatus(selectedAssignment)
              : canReviewerUpdateStatus(selectedAssignment)
            : false
        }
        mode={isAdmin ? "admin" : "reviewer"}
      />
    </div>
  );
}
