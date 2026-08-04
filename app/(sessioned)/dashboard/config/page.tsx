import CreateAllstatsConfigDialog from "@/components/config/create";
import AllstatsConfigDataTable from "@/components/config/data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";

const ConfigPage = () => {
  return (
    <SidebarInset>
      <SiteHeader title="Allstats Configuration" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 min-h-full">
            <div className="px-4 lg:px-6 flex flex-col justify-start gap-2 min-h-full">
              <div className="ml-0 mr-auto">
                <CreateAllstatsConfigDialog />
              </div>
              <AllstatsConfigDataTable />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default ConfigPage;
