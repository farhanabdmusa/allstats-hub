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
import { SerializedEditorState } from "lexical";
import { useState } from "react";
import { createNotification, updateNotification } from "@/data/notifications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { lexicalToHtml } from "@/lib/lexical_to_json";
import { htmlToLexical } from "@/lib/html_to_lexical";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Topic } from "@/types/topic";
import { Notification } from "@/types/notification";
import TopicSelect from "./form/topic";
import { Switch } from "@/components/ui/switch";

const Editor = dynamic(() => import("@/components/blocks/editor-x/editor"), {
  ssr: false,
  loading: () => <Skeleton className="rounded-md h-1/3 min-h-72 w-full" />,
});

const formSchema = z.object({
  title: z.string().min(2).max(50),
  content: z.string(),
  topics: z.array(z.number()).optional(),
  push_notification: z.boolean(),
});

const NotificationForm = ({
  data,
  topics,
}: Readonly<{
  topics: Topic[];
  data?: Omit<Notification, "timestamp" | "notification_sent">;
}>) => {
  const router = useRouter();
  const [editorState, setEditorState] = useState<
    SerializedEditorState | undefined
  >(data?.content ? htmlToLexical(data?.content) : undefined);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title ?? "",
      content: data?.content ?? "",
      topics:
        data?.notification_topic?.map((topic) => topic.topic.id) ?? undefined,
      push_notification: data?.push_notification ?? false,
    },
  });

  const update = async (
    id: number,
    data: Omit<
      Notification,
      "id" | "timestamp" | "notification_sent" | "topics"
    > & { topics?: number[] | undefined }
  ) => {
    const toastID = toast.loading("Updating notification...", {
      position: "top-center",
    });
    try {
      await updateNotification(id, data);

      toast.success("Notification updated successfully", {
        id: toastID,
        position: "top-center",
      });
      router.push("/dashboard/notifications");
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
      toast.error("Failed to update notification", {
        id: toastID,
        position: "top-center",
      });
    }
  };

  const create = async (
    data: Omit<
      Notification,
      "id" | "timestamp" | "notification_sent" | "topics"
    > & {
      topics?: number[];
    }
  ) => {
    // Send the form data to your API or perform any other async action.
    const toastID = toast.loading("Creating notification...", {
      position: "top-center",
    });
    try {
      await createNotification(data);
      toast.success("Notification created successfully", {
        id: toastID,
        position: "top-center",
      });
      router.push("/dashboard/notifications");
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
      toast.error("Failed to create notification", {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Notification Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Editor
                  {...field}
                  editorSerializedState={editorState}
                  onSerializedChange={(value) => setEditorState(value)}
                  onChange={(value) =>
                    form.setValue("content", lexicalToHtml(value.toJSON()))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="push_notification"
          render={() => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Switch
                  checked={form.watch("push_notification")}
                  onCheckedChange={(value) =>
                    form.setValue("push_notification", value)
                  }
                />
              </FormControl>
              <FormLabel>Push Notification</FormLabel>
            </FormItem>
          )}
        />
        {form.watch("push_notification") && (
          <FormField
            control={form.control}
            name="topics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User&apos;s Topic</FormLabel>
                <FormControl>
                  <TopicSelect
                    topics={topics}
                    values={field.value}
                    onChange={(value) => {
                      const selected = value.map((v) => v);
                      form.setValue("topics", selected);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
            {data ? "Update Notification" : "Create Notification"}
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
            <Link href="/dashboard/notifications">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NotificationForm;
