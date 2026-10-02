"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteAllstatsConfig } from "@/data/allstats-config";

const DeleteAllstatsConfig = ({ id }: Readonly<{ id: number }>) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive w-full justify-start"
        >
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Config</DialogTitle>
          <hr />
          <DialogDescription className="text-gray-800">
            Are you sure you want to delete this config? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                const toastID = toast.loading("Deleting config...", {
                  position: "top-center",
                });
                const result = await deleteAllstatsConfig(id);
                if (result) {
                  toast.success("Config deleted successfully", {
                    id: toastID,
                    position: "top-center",
                  });
                  window.location.reload();
                } else {
                  toast.error("Failed to delete config", {
                    id: toastID,
                    position: "top-center",
                  });
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAllstatsConfig;
