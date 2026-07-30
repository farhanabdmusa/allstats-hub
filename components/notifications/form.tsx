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
import { GeneratedNotification, Notification } from "@/types/notification";
import TopicSelect from "./form/topic";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import GenerateNotification from "./ai-generate";
import { BPSDomain } from "@/types/bps_domain";
import SelectDomain from "./form/select_domain";

const Editor = dynamic(() => import("@/components/blocks/editor-x/editor"), {
  ssr: false,
  loading: () => <Skeleton className="rounded-md h-1/3 min-h-72 w-full" />,
});

const formSchema = z.object({
  id_title: z.string().min(2).max(50),
  id_content: z.string(),
  id_short_description: z.string().min(0).max(100).optional(),
  en_title: z.string().min(2).max(50),
  en_content: z.string(),
  en_short_description: z.string().min(0).max(100).optional(),
  mfd: z.string().length(4).optional(),
  topics: z.array(z.number()).optional(),
  push_notification: z.boolean(),
});

const NotificationForm = ({
  data,
  domains,
  topics,
}: Readonly<{
  topics: Topic[];
  domains: BPSDomain[];
  data?: Omit<Notification, "timestamp" | "notification_sent">;
}>) => {
  const router = useRouter();
  const [editorKey, setEditorKey] = useState<string>();
  const [idEditorState, setIdEditorState] = useState<
    SerializedEditorState | undefined
  >(data?.id_content ? htmlToLexical(data?.id_content) : undefined);
  const [enEditorState, setEnEditorState] = useState<
    SerializedEditorState | undefined
  >(data?.en_content ? htmlToLexical(data?.en_content) : undefined);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_title: data?.id_title ?? "",
      id_content: data?.id_content ?? "",
      id_short_description: data?.id_short_description ?? undefined,
      en_title: data?.en_title ?? "",
      en_content: data?.en_content ?? "",
      en_short_description: data?.en_short_description ?? undefined,
      mfd: data?.mfd ?? undefined,
      topics:
        data?.notification_topic?.map((topic) => topic.topic.id) ?? undefined,
      push_notification: data?.push_notification ?? false,
    },
  });

  const selectGenerateNotification = async (data: GeneratedNotification) => {
    form.setValue("push_notification", true);
    form.setValue("id_short_description", data.id_short_description);
    form.setValue("id_title", data.id_title);
    form.setValue("id_content", data.id_description);
    form.setValue("en_short_description", data.en_short_description);
    form.setValue("en_title", data.en_title);
    form.setValue("en_content", data.en_description);
    setEditorKey(undefined);
    setTimeout(() => {
      setEditorKey(data.type);
      setIdEditorState(htmlToLexical(data.id_description));
      setEnEditorState(htmlToLexical(data.en_description));
    }, 100);
    form.clearErrors();
  };

  const update = async (
    id: number,
    data: Omit<
      Notification,
      "id" | "timestamp" | "notification_sent" | "topics"
    > & { topics?: number[] | undefined },
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
    },
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
    <>
      {!data && <GenerateNotification onSelect={selectGenerateNotification} />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

          {form.watch("push_notification") && (
            <FormField
              control={form.control}
              name="mfd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User&apos;s MFD</FormLabel>
                  <FormControl>
                    <SelectDomain
                      domains={domains}
                      selected={field.value}
                      onChange={(value) => {
                        form.setValue("mfd", value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="id_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Notification Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Content</FormLabel>
                    <FormControl>
                      <Editor
                        key={editorKey}
                        {...field}
                        editorSerializedState={idEditorState}
                        onSerializedChange={(value) => setIdEditorState(value)}
                        onChange={(value) => {
                          return form.setValue(
                            "id_content",
                            lexicalToHtml(value.toJSON()),
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("push_notification") && (
                <FormField
                  control={form.control}
                  name="id_short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Short Description"
                          {...field}
                          maxLength={100}
                        />
                      </FormControl>
                      <p className="text-right text-sm text-muted-foreground mt-1">
                        {field.value?.length ?? 0}/100
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="en_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EN Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Notification Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="en_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EN Content</FormLabel>
                    <FormControl>
                      <Editor
                        key={editorKey}
                        {...field}
                        editorSerializedState={enEditorState}
                        onSerializedChange={(value) => setIdEditorState(value)}
                        onChange={(value) => {
                          return form.setValue(
                            "en_content",
                            lexicalToHtml(value.toJSON()),
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("push_notification") && (
                <FormField
                  control={form.control}
                  name="en_short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EN Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Short Description"
                          {...field}
                          maxLength={100}
                        />
                      </FormControl>
                      <p className="text-right text-sm text-muted-foreground mt-1">
                        {field.value?.length ?? 0}/100
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

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
    </>
  );
};

export default NotificationForm;
