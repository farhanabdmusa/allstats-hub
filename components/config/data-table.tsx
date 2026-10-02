"use client";

import {
  IconArrowDown,
  IconArrowsUpDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Fragment, use, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AllstatsConfig } from "@/types/allstats-config";
import { useRouter } from "next/navigation";
import { DATATABLE_PAGE_SIZE } from "@/constants/data-table";
import ConfigColumns from "./columns";

const columns = ConfigColumns;

const AllstatsConfigDataTable = ({
  configs,
  page,
  pageSize,
}: Readonly<{
  page: number;
  pageSize: number;
  configs: Promise<{
    status: boolean;
    data?: AllstatsConfig[];
    message?: string;
    total?: number;
  }>;
}>) => {
  const resolvedConfig = use(configs);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState(resolvedConfig.status);
  const [error, setError] = useState(resolvedConfig.message);
  const [total, setTotal] = useState(resolvedConfig.total ?? 0);
  const [data, setData] = useState<AllstatsConfig[]>(resolvedConfig.data ?? []);
  const [columnWidth, setColumnWidth] = useState<number[]>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: page,
    pageSize: pageSize,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setError(resolvedConfig.message);
    setTotal(resolvedConfig.total ?? 0);
    setData(resolvedConfig.data ?? []);
    setStatus(resolvedConfig.status);
  }, [resolvedConfig]);

  useEffect(() => {
    if (mounted) {
      const theads = document.querySelectorAll("thead th");
      setColumnWidth([
        ...Array.from(theads.values()).map((val) => val.clientWidth),
      ]);
    }
  }, [mounted]);

  useEffect(() => {
    function handleResize() {
      const theads = document.querySelectorAll("thead th");
      setColumnWidth([
        ...Array.from(theads.values()).map((val) => val.clientWidth),
      ]);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const url = new URL("/dashboard/config", window.location.href);

    url.searchParams.set("page", (pagination.pageIndex + 1).toString());
    url.searchParams.set("pageSize", pagination.pageSize.toString());
    sorting?.map((e) =>
      url.searchParams.append("sort[]", `${e.id}:${e.desc ? "desc" : "asc"}`),
    );

    router.push(url.href);
  }, [pagination.pageIndex, pagination.pageSize, sorting, router]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnPinning: {
        right: ["actions"],
      },
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    rowCount: total,
  });

  if (!status && error) {
    return (
      <div className="overflow-hidden rounded-lg border p-4 h-full min-h-0 flex justify-center items-center flex-col">
        <h2 className="font-medium text-destructive">
          Error when fetching data
        </h2>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : "",
                      )}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      style={{
                        width:
                          header.id == "actions" ? 48 : columnWidth?.at(idx),
                      }}
                    >
                      <div className="flex justify-between items-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getCanSort() ? (
                          <div className="relative w-[14px] h-[14px]">
                            <IconArrowDown
                              size={14}
                              className={cn(
                                "absolute transition-all opacity-0 text-gray-500",
                                {
                                  "rotate-180":
                                    header.column.getIsSorted() === "asc",
                                  "opacity-100":
                                    header.column.getIsSorted() != false,
                                },
                              )}
                            />
                            <IconArrowsUpDown
                              size={14}
                              className={cn(
                                "absolute transition-all opacity-0",
                                {
                                  "rotate-180 opacity-100 text-gray-300":
                                    header.column.getIsSorted() == false,
                                },
                              )}
                            />
                          </div>
                        ) : null}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {
              // loading ? (
              //   <TableRow>
              //     <TableCell
              //       colSpan={columns.length}
              //       className="h-24 text-center"
              //     >
              //       <IconLoader2 className="animate-spin mx-auto" />
              //     </TableCell>
              //   </TableRow>
              // ) :
              table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn({
                          "right-0 sticky z-10 bg-white shadow":
                            cell.column.getIsPinned() == "right",
                        })}
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
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          Showing {pagination.pageIndex * pagination.pageSize + 1} -{" "}
          {Math.min(
            pagination.pageIndex * pagination.pageSize + pagination.pageSize,
            table.getRowCount(),
          )}{" "}
          of {table.getRowCount()} results
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {DATATABLE_PAGE_SIZE.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default AllstatsConfigDataTable;
