"use client";

import { UserAdmin } from "@/types/user-admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import { updateAdminUser } from "@/data/user-admin";

const formSchema = z.object({
  is_admin: z.boolean(),
});

const UserAdminForm = ({
  user,
}: Readonly<{
  user: UserAdmin;
}>) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_admin: user.is_admin,
    },
  });

  const update = async (uuid: string, data: { is_admin: boolean }) => {
    const toastID = toast.loading("Updating user admin...", {
      position: "top-center",
    });
    try {
      await updateAdminUser(uuid, data.is_admin);

      toast.success("User admin updated successfully", {
        id: toastID,
        position: "top-center",
      });
      router.push("/dashboard/user-admin");
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
      toast.error("Failed to update user admin", {
        id: toastID,
        position: "top-center",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await update(user.uuid, values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-2">
          <p className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive">
            Name
          </p>
          <div className="dark:bg-input/30 border-input flex justify-start items-center h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none selection:text-primary-foreground selection:bg-primary text-sm">
            {user.name}
          </div>
        </div>
        <div className="grid gap-2">
          <p className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive">
            Email
          </p>
          <div className="dark:bg-input/30 border-input flex justify-start items-center h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none selection:text-primary-foreground selection:bg-primary text-sm">
            {user.email}
          </div>
        </div>
        <FormField
          control={form.control}
          name="is_admin"
          render={() => (
            <FormItem>
              <FormLabel>Admin Status</FormLabel>
              <FormControl>
                <Switch
                  checked={form.watch("is_admin")}
                  onCheckedChange={(value) => form.setValue("is_admin", value)}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="inline-flex gap-2">
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
            Update
          </Button>
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
            asChild
          >
            <Link href="/dashboard/user-admin">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserAdminForm;
