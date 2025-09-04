"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import { Topic } from "@/types/topic";
import { createTopic, updateTopic } from "@/data/topic";

const formSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores are allowed."
    ),
  display_name: z.string().min(2).max(50),
});

const TopicForm = ({
  data,
}: Readonly<{
  data?: Topic;
}>) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name ?? "",
      display_name: data?.display_name ?? "",
    },
  });

  const update = async (id: number, data: Omit<Topic, "id">) => {
    const toastID = toast.loading("Updating topic...", {
      position: "top-center",
    });
    try {
      await updateTopic(id, data);

      toast.success("Topic updated successfully", {
        id: toastID,
        position: "top-center",
      });
      router.push("/dashboard/topic");
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
      toast.error("Failed to update topic", {
        id: toastID,
        position: "top-center",
      });
    }
  };

  const create = async (data: Omit<Topic, "id">) => {
    // Send the form data to your API or perform any other async action.
    const toastID = toast.loading("Creating topic...", {
      position: "top-center",
    });
    try {
      await createTopic(data);
      toast.success("Topic created successfully", {
        id: toastID,
        position: "top-center",
      });
      router.push("/dashboard/topic");
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
      toast.error("Failed to create topic", {
        id: toastID,
        position: "top-center",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (data) {
      await update(data.id, values);
    } else {
      await create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Topic Name" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Topic Display Name" {...field} />
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
            {data ? "Update Topic" : "Create Topic"}
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
            <Link href="/dashboard/topic">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TopicForm;
