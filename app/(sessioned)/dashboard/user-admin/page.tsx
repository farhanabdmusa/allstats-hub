import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { UserAdminDataTable } from "@/components/user-admin/data-table";

const Page = () => {
  return (
    <SidebarInset>
      <SiteHeader title="User Admin" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 flex flex-col justify-start gap-2">
              <UserAdminDataTable />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default Page;
