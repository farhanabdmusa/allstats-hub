import NotificationForm from "@/components/notifications/form";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { getAllTopic } from "@/data/topic";

const CreateNotificationPage = async () => {
  const topics = await getAllTopic();
  return (
    <SidebarInset>
      <SiteHeader title="Create Notification" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <NotificationForm topics={topics} />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default CreateNotificationPage;
