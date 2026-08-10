import CreateAllstatsConfigDialog from "@/components/config/create";
import AllstatsConfigDataTable from "@/components/config/data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { DATATABLE_PAGE_SIZE } from "@/constants/data-table";
import { getAllstatsConfigs } from "@/data/allstats-config";
import { AllstatsConfig } from "@/types/allstats-config";
import { Suspense } from "react";

const getData = async ({
  page,
  pageSize,
  sort,
}: Readonly<{
  page: number;
  pageSize: number;
  sort?: string | string[];
}>): Promise<{
  data?: AllstatsConfig[];
  status: boolean;
  message?: string;
  total?: number;
}> => {
  try {
    const result = await getAllstatsConfigs({
      page: page,
      pageSize: pageSize,
      sort,
    });

    return {
      status: true,
      data: result.data,
      total: result.total,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        status: false,
        message: error.message,
      };
    }
    return {
      status: false,
      message: `${error}`,
    };
  }
};

const ConfigPage = async ({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    "sort[]"?: string | string[];
  }>;
}>) => {
  const resolvedParams = await searchParams;
  const sort = resolvedParams["sort[]"];
  const page = resolvedParams.page;
  const pageSize = resolvedParams.pageSize;

  const pageSizeFinal = DATATABLE_PAGE_SIZE.includes(Number(pageSize ?? "10"))
    ? Number(pageSize ?? "10")
    : 10;
  const pageFinal = Number(page ?? "1") - 1 >= 0 ? Number(page ?? "1") : 1;
  const data = getData({
    page: pageFinal - 1,
    pageSize: pageSizeFinal,
    sort,
  });

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

              <Suspense fallback={<Skeleton className="w-full min-h-0 grow" />}>
                <AllstatsConfigDataTable
                  configs={data}
                  page={pageFinal - 1}
                  pageSize={pageSizeFinal}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default ConfigPage;
