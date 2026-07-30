import Image from "next/image";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
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
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { Input } from "../ui/input";
import { generateNotification } from "@/data/gemini";
import {
  GeneratedNotification,
  GeneratedNotificationResponse,
} from "@/types/notification";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  context: z.string(),
  geminiApiKey: z.string().optional(),
});

const GenerateNotification = ({
  onSelect,
}: Readonly<{
  onSelect: (data: GeneratedNotification) => void;
}>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<GeneratedNotificationResponse>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      setError(undefined);
      const result: GeneratedNotificationResponse = await generateNotification(
        values.context,
        values.geminiApiKey,
      );
      setResult(result);
      setLoading(false);
    } catch (error) {
      setError(`${error}`);
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Image alt="Gemini" src={"/gemini.svg"} width={20} height={20} />{" "}
          Generate Notification
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-[80vw] top-8 translate-y-0"
      >
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full bg-white/25 backdrop-blur-xs z-50 grid items-center justify-center rounded-lg">
            <Spinner className="size-6" />
          </div>
        )}
        <DialogHeader>
          <DialogTitle>Generate Notification</DialogTitle>
          <DialogDescription>
            Generate Notification Using Gemini.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-h-[80vh] overflow-y-auto px-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your context here"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="geminiApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gemini API Key</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Insert your API Key if default API Key has reached the
                      limit.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose>Cancel</DialogClose>
                <Button type="submit">Generate</Button>
              </DialogFooter>
            </form>
          </Form>
          <div className="grid gap-2">
            {error && (
              <Card>
                <CardContent>
                  <p className="font-medium mb-2">
                    Failed to Generate Notification, please try again.
                  </p>
                  <p>{error}</p>
                </CardContent>
              </Card>
            )}
            {!error && (result?.data?.length ?? 0) > 0 && (
              <p>
                Result
                {(result?.model?.length ?? 0) > 0 && (
                  <Badge className="capitalize mx-2" variant={"positive"}>
                    {result?.model?.replaceAll("-", " ")}{" "}
                  </Badge>
                )}
                :
              </p>
            )}
            {!error &&
              result?.data?.map((e) => (
                <Card key={e.type}>
                  <CardContent className="group relative">
                    <DialogClose asChild>
                      <Button
                        variant={"secondary"}
                        className="absolute top-0 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        onClick={() => onSelect(e)}
                      >
                        Use as Notification
                      </Button>
                    </DialogClose>
                    <Badge className="capitalize">
                      {e.type.replaceAll("_", " ")}
                    </Badge>
                    <div className="grid gap-2">
                      <div>
                        <p>Indonesia</p>
                        <div className="ps-4 grid gap-2">
                          <p className="font-medium">{e.id_title}</p>
                          <p>{e.id_description}</p>
                          <div>
                            <p className="text-gray-500 text-sm">
                              Short Description:
                            </p>
                            <p>{e.id_short_description}</p>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p>English</p>
                        <div className="ps-4 grid gap-2">
                          <p className="font-medium">{e.en_title}</p>
                          <p>{e.en_description}</p>
                          <div>
                            <p className="text-gray-500 text-sm">
                              Short Description:
                            </p>
                            <p>{e.en_short_description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateNotification;
