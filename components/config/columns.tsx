import { AllstatsConfig } from "@/types/allstats-config";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EditAllstatsConfigDialog from "./edit";
import DeleteAllstatsConfig from "./delete";
import { Button } from "../ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import { toast } from "sonner";
import { sendConfigNotification } from "@/data/allstats-config";
import { Separator } from "../ui/separator";

const ConfigColumns: ColumnDef<AllstatsConfig>[] = [
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
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "value",
    header: "Value",
    enableSorting: false,
    cell: ({ row }) => row.original.value,
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
    enableSorting: true,
    cell: ({ row }) =>
      row.original.updated_at === null
        ? "-"
        : new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(row.original.updated_at!)) + " WIB",
  },
  {
    accessorKey: "updated_by",
    header: "Updated By",
    enableSorting: false,
    cell: ({ row }) => row.original.updated_by,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <EditAllstatsConfigDialog
            id={row.original.id}
            name={row.original.name}
            value={row.original.value}
            // refreshTable={refreshTable}
          />
          <DeleteAllstatsConfig id={row.original.id} />
          <Separator className="my-0.5" />
          <DropdownMenuItem
            className="hover:cursor-pointer"
            asChild
            onClick={async () => {
              const toastID = toast.loading("Sending notification...", {
                position: "top-center",
              });
              try {
                const result = await sendConfigNotification(row.original.id);
                if (result) {
                  toast.success("Notification send successfully", {
                    id: toastID,
                    position: "top-center",
                  });
                  window.location.reload();
                } else {
                  toast.error("Failed to send notification", {
                    id: toastID,
                    position: "top-center",
                  });
                }
              } catch (error) {
                toast.error("Failed to send notification", {
                  id: toastID,
                  position: "top-center",
                  description:
                    error instanceof Error ? error.message : undefined,
                });
              }
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start px-3"
            >
              Send Background Notification
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default ConfigColumns;
