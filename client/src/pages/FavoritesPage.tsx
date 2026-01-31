/**
 * Favorites Page
 * 
 * Displays favorited items for the current workspace.
 * Uses the shared ActivityList component with contextually appropriate data.
 */

import { AppLayout, PageHeader } from "@/components/layout";
import { ActivityList } from "@/components/ui/activity-list";
import { getWorkspaceActivityData } from "@/config/activityData";
import { useWorkspaceStore } from "@/lib/workspaceStore";

export function FavoritesPage() {
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
          title="Favorites" 
          description="Your pinned and frequently accessed items"
        />
        
        <div className="flex-1 mt-4 overflow-hidden">
          <ActivityList
            items={activityData.favorites}
            mode="favorites"
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default FavoritesPage;
