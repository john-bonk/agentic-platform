/**
 * Recent Page
 * 
 * Displays recently accessed items for the current workspace.
 * Uses the shared ActivityList component with contextually appropriate data.
 */

import { AppLayout, PageHeader } from "@/components/layout";
import { ActivityList } from "@/components/ui/activity-list";
import { getWorkspaceActivityData } from "@/config/activityData";
import { useWorkspaceStore } from "@/lib/workspaceStore";

export function RecentPage() {
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace);
  const refreshKey = useWorkspaceStore(state => state.refreshKey);

  const activityData = getWorkspaceActivityData(
    currentWorkspace?.persona || "CRO",
    currentWorkspace?.isCustom
  );

  return (
    <AppLayout key={refreshKey}>
      <div className="flex flex-col h-full overflow-hidden p-6">
        <PageHeader 
          title="Recent" 
          description="Recently accessed items in your workspace"
        />
        
        <div className="flex-1 mt-4 overflow-hidden">
          <ActivityList
            items={activityData.recent}
            mode="recent"
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default RecentPage;
