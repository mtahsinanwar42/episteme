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
import type { Submission } from "@/models/submission";
import { formatDate } from "@/utils/dateFormatter";
import { useSelector } from "react-redux";
import type { RootState } from "@/stores/store";
import { UserRole } from "@/models/user";
import { Button } from "@/components/ui/button";
import {
  getPaymentStatusBadge,
  getSubmissionStatusBadge,
} from "@/components/common/ResourceStatusBadge";

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
    paginate: true,
  });

  const submissions = response?.data || [];
  const total = response?.total || 0;

  const currentPage = page;
  const currentLimit = response?.pagination?.next?.limit || pageSize;
  const totalPages = Math.ceil(total / currentLimit);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const columns: ColumnDef<Submission>[] = useMemo(() => {
    const ownerColumn: ColumnDef<Submission> = {
      accessorKey: "owner",
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
        header: ({ column }) => {
          return (
            <div
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center gap-4 justify-center w-full"
            >
              Title
              <ArrowUpDown className="size-4 text-muted-foreground" />
            </div>
          );
        },
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.getValue("title")}</span>
        ),
        sortingFn: (rowA, rowB, columnId) => {
          const a = String(rowA.getValue(columnId) ?? "").toLowerCase();
          const b = String(rowB.getValue(columnId) ?? "").toLowerCase();
          return a.localeCompare(b);
        },
      },
      {
        accessorKey: "conferenceTitle",
        header: "Conference",
        cell: ({ row }) => (
          <span className="text-sm">{row.getValue("conferenceTitle")}</span>
        ),
        enableSorting: false,
      },
      ...(isAdmin ? [ownerColumn] : []),
      {
        accessorKey: "topics",
        header: "Topics",
        cell: ({ row }) => {
          const topics = row.getValue("topics") as string[];
          return (
            <div className="flex gap-1 flex-wrap">{topics?.join(", ")}</div>
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
        cell: ({ row }) => {
          const status = row.getValue("status") as number;
          return (
            <div className="flex place-self-center">
              {getSubmissionStatusBadge(status)}
            </div>
          );
        },
        enableSorting: true,
      },
      ...(isAdmin ? [paymentColumn] : []),
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <div
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="flex items-center gap-4 justify-center w-full"
            >
              Created At
              <ArrowUpDown className="size-4 text-muted-foreground" />
            </div>
          );
        },
        cell: ({ row }) => (
          <span className="text-sm">
            {formatDate(row.getValue("createdAt") as string)}
          </span>
        ),
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

        {currentRoles?.includes(UserRole.USER) && (
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => navigate("/submissions/new")}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add New Submission
            </Button>
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
