import NotificationForm from "@/components/notifications/form";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { getNotification } from "@/data/notifications";
import { getAllTopic } from "@/data/topic";
import { notFound } from "next/navigation";

const EditNotificationPage = async ({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) => {
  const notificationId = Number((await params).id);
  if (isNaN(notificationId)) {
    notFound();
  }
  const notification = await getNotification(notificationId);
  if (!notification) {
    notFound();
  }
  const topics = await getAllTopic();
  return (
    <SidebarInset>
      <SiteHeader title="Edit Notification" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <NotificationForm
              data={{ id: notificationId, ...notification }}
              topics={topics}
            />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default EditNotificationPage;
