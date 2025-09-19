"use client";

import {
  IconArrowDown,
  IconArrowsUpDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLoader2,
} from "@tabler/icons-react";
import {
  ColumnDef,
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
import { Fragment, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { countAllUser, getAllUser } from "@/data/user";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserDeviceTable } from "./user-device-table";

const columns: ColumnDef<User>[] = [
  {
    id: "no",
    header: "No.",
    cell: ({ row, table }) =>
      table.getState().pagination.pageIndex *
        table.getState().pagination.pageSize +
      row.index +
      1,
    enableSorting: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
    cell: ({ row }) => row.getValue("email") || "N/A",
  },
  {
    accessorKey: "sign_up_type",
    header: "Sign Up Type",
    enableSorting: true,
    cell: ({ row }) => row.getValue("sign_up_type") || "N/A",
  },
  {
    accessorKey: "user_device",
    header: "User Devices",
    enableSorting: false,
    cell: ({ row }) => (
      <Dialog>
        <form>
          <DialogTrigger asChild>
            <Button variant="outline">
              Show {row.original.user_device.length} Device
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[80vw]">
            <DialogHeader>
              <DialogTitle>User Device</DialogTitle>
              <DialogDescription>
                List of devices used by {row.original.email || "N/A"}
              </DialogDescription>
            </DialogHeader>
            <UserDeviceTable data={row.original.user_device} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    ),
  },
];

export function DataTable() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnWidth, setColumnWidth] = useState<number[]>();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

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
    const getData = async () => {
      setLoading(true);
      const totalTopics = await countAllUser();
      const data = await getAllUser(
        pagination.pageSize,
        pagination.pageIndex,
        sorting
      );
      setTotal(totalTopics);
      setData([...data]);
      setLoading(false);
      setMounted(true);
    };
    getData();
  }, [pagination.pageIndex, pagination.pageSize, sorting]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
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
                          : ""
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
                              header.getContext()
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
                                }
                              )}
                            />
                            <IconArrowsUpDown
                              size={14}
                              className={cn(
                                "absolute transition-all opacity-0",
                                {
                                  "rotate-180 opacity-100 text-gray-300":
                                    header.column.getIsSorted() == false,
                                }
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <IconLoader2 className="animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          Showing {pagination.pageIndex * pagination.pageSize + 1} -{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} results
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
                {[10, 20, 30, 40, 50].map((pageSize) => (
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
}
