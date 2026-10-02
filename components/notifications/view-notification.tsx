import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Notification } from "@/types/notification";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { resendNotification } from "@/data/notifications";
import { useState } from "react";

const ViewNotification = ({
  notification,
}: Readonly<{ notification: Notification }>) => {
  const [isSending, setIsSending] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          View Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80vw]">
        <DialogHeader>
          <DialogTitle>Notification</DialogTitle>
        </DialogHeader>
        <div className="-mx-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-h-[80vh] overflow-y-auto px-2">
          <Card>
            <CardContent>
              <div className="grid gap-2">
                <div>
                  <p>Indonesia</p>
                  <div className="ps-4 grid gap-2">
                    <p className="font-medium">{notification.id_title}</p>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: notification.id_content,
                      }}
                    />
                    <div>
                      <p className="text-gray-500 text-sm">
                        Short Description:
                      </p>
                      <p>{notification.id_short_description}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <p>English</p>
                  <div className="ps-4 grid gap-2">
                    <p className="font-medium">{notification.en_title}</p>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: notification.en_content,
                      }}
                    />
                    <div>
                      <p className="text-gray-500 text-sm">
                        Short Description:
                      </p>
                      <p>{notification.en_short_description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button
            variant={"default"}
            disabled={isSending}
            onClick={async () => {
              setIsSending(true);
              const toastID = toast.loading("Sending notification...", {
                position: "top-center",
              });
              const result = await resendNotification(notification.id);
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
              setIsSending(false);
            }}
          >
            Resend Notification
          </Button>
          <DialogClose asChild>
            <Button variant={"secondary"}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNotification;
