import * as React from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  error?: string | null;
  pageSize?: number;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  isLoading = false,
  error = null,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      // pagination: {
      //   pageSize: pageSize,
      // },
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--color-text)" }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--color-text)" }}>
        No data available
      </div>
    );
  }

  // const pageCount = table.getPageCount();

  return (
    <div>
      <div className="rounded-2xl border border-border shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-accent border-b border-slate-200 dark:border-slate-700"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-semibold transition-colors cursor-pointer text-accent-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-slate-300! dark:border-slate-700 hover:bg-slate-900! dark:hover:bg-blue-950/20 transition-colors duration-200 group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="group-hover:text-foreground dark:group-hover:text-foreground/90 transition-colors"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-slate-500 dark:text-slate-400"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {/* {pageCount > 1 && (
        <div className="flex items-center justify-between mt-8 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Showing page{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {pageCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="First page"
              className="hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:text-blue-600"
            >
              <ChevronsLeft className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              title="Previous page"
              className="hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:text-blue-600"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1)
                .filter((page) => {
                  const distance = Math.abs(
                    page - (table.getState().pagination.pageIndex + 1),
                  );
                  return distance <= 2 || page === 1 || page === pageCount;
                })
                .map((page, index, array) => {
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-2">
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={page}
                      variant={
                        page === table.getState().pagination.pageIndex + 1
                          ? "default"
                          : "ghost"
                      }
                      size="sm"
                      onClick={() => table.setPageIndex(page - 1)}
                      className={`min-w-9 transition-all ${
                        page === table.getState().pagination.pageIndex + 1
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-md"
                          : "hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:text-blue-600"
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              title="Next page"
              className="hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:text-blue-600"
            >
              <ChevronRight className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              title="Last page"
              className="hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:text-blue-600"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )} */}
    </div>
  );
}
