import { SiteHeader } from "@/components/site-header";
import TopicForm from "@/components/topic/form";
import { SidebarInset } from "@/components/ui/sidebar";

const CreateTopicPage = () => {
  return (
    <SidebarInset>
      <SiteHeader title="Create Topic" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <TopicForm />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default CreateTopicPage;
