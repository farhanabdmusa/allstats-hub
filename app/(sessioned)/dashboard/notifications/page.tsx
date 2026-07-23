import { DataTable } from "@/components/notifications/data-table";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

const NotificationsPage = () => {
  return (
    <SidebarInset>
      <SiteHeader title="Notifications" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 flex flex-col justify-start gap-2">
              <div className="ml-0 mr-auto">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/notifications/create">
                    <IconPlus />
                    <span className="hidden lg:inline">
                      Create Notification
                    </span>
                  </Link>
                </Button>
              </div>
              <DataTable />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default NotificationsPage;
