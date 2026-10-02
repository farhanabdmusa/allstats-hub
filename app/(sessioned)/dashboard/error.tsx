"use client";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Error({
  error,
  unstable_retryAction,
}: {
  error: Error & { digest?: string };
  unstable_retryAction: () => void;
}) {
  return (
    <SidebarInset>
      <SiteHeader title="Error" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 justify-center items-center">
            <h2 className="font-medium">{error.name}</h2>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button variant={"default"} onClick={() => unstable_retryAction()}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
