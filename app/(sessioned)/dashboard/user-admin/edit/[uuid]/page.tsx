import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import UserAdminForm from "@/components/user-admin/user-admin-form";
import { getAdminUser } from "@/data/user-admin";

const EditUserAdmin = async ({
  params,
}: Readonly<{
  params: Promise<{
    uuid: string;
  }>;
}>) => {
  const { uuid } = await params;
  const user = await getAdminUser(uuid);

  if (!user.status || !user.data) {
    throw new Error(user.message ?? "Unknown error");
  }
  return (
    <SidebarInset>
      <SiteHeader title="Edit UserAdmin" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <UserAdminForm user={user.data} />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default EditUserAdmin;
