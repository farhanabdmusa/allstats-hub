"use client";

import { Button } from "@/components/ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateAllstatsConfig } from "@/data/allstats-config";
import { useEffect, useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const formSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .trim()
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores are allowed.",
    ),
  value: z.string().min(2).max(50).trim(),
});

const EditAllstatsConfigDialog = ({
  id,
  name,
  value,
  refreshTable,
}: Readonly<{
  id: number;
  name: string;
  value: string;
  refreshTable?: () => void;
}>) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name,
      value: value,
    },
  });

  const [open, setOpen] = useState(false);

  const create = async (name: string, value: string) => {
    // Send the form data to your API or perform any other async action.
    const toastID = toast.loading("Updating config...", {
      position: "top-center",
    });
    try {
      const result = await updateAllstatsConfig({
        id,
        name,
        value,
      });
      if (result.status === false) {
        throw new Error(
          result.message ?? "Unknown error while updating config",
        );
      }

      toast.success("Config updated successfully", {
        id: toastID,
        position: "top-center",
      });
      setOpen(false);
      refreshTable?.();
    } catch (error) {
      toast.error("Failed to update config", {
        id: toastID,
        position: "top-center",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        form.reset();
      }, 20);
    }
  }, [open]);

  return (
    <Dialog open={open} defaultOpen={false} onOpenChange={setOpen}>
      <DialogTrigger className="text-sm px-2 py-1 w-full hover:bg-gray-100 cursor-pointer rounded text-left">
        <DropdownMenuItem
          className="w-full cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          Update
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Config</DialogTitle>
          <DialogDescription>
            Fill in the details to update the config.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              create(data.name, data.value),
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Config Name" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Config Value" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  disabled={
                    form.formState.disabled ||
                    form.formState.isSubmitting ||
                    form.formState.isLoading
                  }
                  aria-disabled={
                    form.formState.disabled ||
                    form.formState.isSubmitting ||
                    form.formState.isLoading
                  }
                  variant="secondary"
                  className="relative"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  form.formState.disabled ||
                  form.formState.isSubmitting ||
                  form.formState.isLoading
                }
                aria-disabled={
                  form.formState.disabled ||
                  form.formState.isSubmitting ||
                  form.formState.isLoading
                }
                className="relative"
              >
                {form.formState.disabled ||
                  form.formState.isSubmitting ||
                  (form.formState.isLoading && (
                    <div className="absolute w-full h-full bg-black rounded-md flex justify-center items-center">
                      <IconLoader2 className="animate-spin" />
                    </div>
                  ))}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAllstatsConfigDialog;
