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
import { IconLoader2, IconPlus } from "@tabler/icons-react";
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
import { createAllstatsConfig } from "@/data/allstats-config";
import { useEffect, useState } from "react";

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

const CreateAllstatsConfigDialog = ({
  refreshTable,
}: Readonly<{ refreshTable?: () => void }>) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "",
    },
  });

  const [open, setOpen] = useState(false);

  const create = async (name: string, value: string) => {
    // Send the form data to your API or perform any other async action.
    const toastID = toast.loading("Creating config...", {
      position: "top-center",
    });
    try {
      const result = await createAllstatsConfig({
        name,
        value,
      });
      if (result.status === false) {
        throw new Error(
          result.message ?? "Unknown error while creating config",
        );
      }

      toast.success("Config created successfully", {
        id: toastID,
        position: "top-center",
      });
      setOpen(false);
      refreshTable?.();
    } catch (error) {
      toast.error("Failed to create config", {
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
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Create Config</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create Config</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new config.
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
                Create Config
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAllstatsConfigDialog;
