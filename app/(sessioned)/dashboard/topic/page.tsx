import { SiteHeader } from "@/components/site-header";
import { DataTable } from "@/components/topic/data-table";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

const TopicPage = () => {
  return (
    <SidebarInset>
      <SiteHeader title="Topic" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 flex flex-col justify-start gap-2">
              <div className="ml-0 mr-auto">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/topic/create">
                    <IconPlus />
                    <span className="hidden lg:inline">Create Topic</span>
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

export default TopicPage;
