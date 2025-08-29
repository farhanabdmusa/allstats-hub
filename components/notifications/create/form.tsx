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
import { Editor } from "@/components/blocks/editor-x/editor";
import { SerializedEditorState } from "lexical";
import { useState } from "react";
import { createNotification } from "@/data/notifications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { lexicalToHtml } from "@/lib/lexical_to_json";

const formSchema = z.object({
  title: z.string().min(2).max(50),
  content: z.string(),
});

const CreateNotificationForm = () => {
  const router = useRouter();
  const [editorState, setEditorState] = useState<SerializedEditorState>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Send the form data to your API or perform any other async action.
    const toastID = toast.loading("Creating notification...", {
      position: "top-center",
    });
    try {
      await createNotification(values);
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
          Create Notification
        </Button>
      </form>
    </Form>
  );
};

export default CreateNotificationForm;
