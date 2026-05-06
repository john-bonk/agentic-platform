/**
 * Coming Soon Page
 * 
 * Minimalist placeholder for views still in development.
 */

import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ComingSoonPage() {
  const [location, setLocation] = useLocation();

  const pageName = location
    .split("/")
    .filter(Boolean)
    .map(segment => segment.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" "))
    .join(" / ") || "This Feature";

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[#266C92] flex items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}figmaAssets/auditboard-logo.png`}
              alt="AuditBoard"
              className="w-10 h-auto brightness-0 invert"
            />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-2" data-testid="coming-soon-title">
            Coming Soon
          </h1>
          
          <p className="text-gray-500 dark:text-muted-foreground mb-6" data-testid="coming-soon-feature">
            {pageName}
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              data-testid="button-go-back"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              size="sm"
              className="bg-[#266C92]"
              onClick={() => setLocation("/")}
              data-testid="button-go-home"
            >
              Home
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
