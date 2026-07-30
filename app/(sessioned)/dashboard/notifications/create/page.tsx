import NotificationForm from "@/components/notifications/form";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import getDomain from "@/data/bps_mfd";
import { getAllTopic } from "@/data/topic";

export const dynamic = "force-dynamic";

const CreateNotificationPage = async () => {
  const topics = await getAllTopic();
  const domains = await getDomain();
  if (!domains.status) {
    return (
      <SidebarInset>
        <SiteHeader title="Create Notification" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div>
                <p>Failed to get BPS Domain</p>
                <p>
                  {domains.message ?? "Unkown error"}. Please refresh this page
                  or call admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (domains.data?.length == 0) {
    return (
      <SidebarInset>
        <SiteHeader title="Create Notification" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div>
                <p>Failed to get BPS Domain</p>
                <p>Empty domain. Please refresh this page or call admin.</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }
  return (
    <SidebarInset>
      <SiteHeader title="Create Notification" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <NotificationForm topics={topics} domains={domains.data ?? []} />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default CreateNotificationPage;
