import { useState, useMemo, useCallback } from "react";
import { useSubmissions } from "@/hooks/useSubmissions";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpDown, Eye } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import PageSubTitle from "@/components/common/PageSubTitle";
import PageTitle from "@/components/common/PageTitle";
import { SubmissionStatus, type Submission } from "@/models/submission";
import { formatDateTime } from "@/utils/dateFormatter";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import { Button } from "@/components/ui/button";
import {
  getPaymentStatusBadge,
  getSubmissionStatusBadge,
} from "@/components/common/ResourceStatusBadge";

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

export default function Submissions() {
  const navigate = useNavigate();
  const currentRoles = useSelector(
    (state: RootState) => state?.auth?.user?.roles,
  );
  const isAdmin = Boolean(currentRoles?.includes(UserRole.ADMIN));

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: response,
    isLoading,
    error,
  } = useSubmissions({
    page,
    limit: pageSize,
    sort: "-createdAt",
  });

  const submissions = response?.data || [];
  const total = response?.total || 0;

  const currentPage = page;
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

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
          return (
            <div className="flex gap-1 flex-wrap">{topics?.join(", ")}</div>
          );
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
          <span className="text-sm">
            {formatDateTime(row.original.createdAt || "")}
          </span>
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

  return (
    <div>
      <Breadcrumb items={[{ label: "Submissions", href: "/submissions" }]} />
      <div className="mb-6 flex justify-between items-end">
        <div>
          <PageTitle title="Submissions" />
          <PageSubTitle text="View and manage content submissions" />
        </div>

        {(currentRoles?.includes(UserRole.USER) ||
          currentRoles?.includes(UserRole.ADMIN)) && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/submissions/search")}
              className="mb-4"
            >
              Advanced Search
            </Button>
            {currentRoles?.includes(UserRole.USER) && (
              <Button
                onClick={() => navigate("/submissions/new")}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add New Submission
              </Button>
            )}
          </div>
        )}
      </div>

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
            "status",
            "conferenceTitle",
            "owner",
            "topics",
          ]}
        />

        {!isLoading && !error && total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
