import { EmptyState } from "@/components/ui/empty-state";
import { FileQuestion } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <EmptyState
        icon={FileQuestion}
        heading="Page Not Found"
        description="The page you're looking for doesn't exist or may have been moved."
        primaryAction={{
          label: "Go Home",
          onClick: () => setLocation("/"),
        }}
        secondaryAction={{
          label: "Go Back",
          onClick: () => window.history.back(),
        }}
      />
    </div>
  );
}
