/**
 * Coming Soon Page
 * 
 * A friendly placeholder page for views that are still in development.
 * Uses AuditBoard branding with teal accent colors.
 */

import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full text-center"
        >
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#266C92] to-[#1e5a7a] flex items-center justify-center shadow-lg">
              <img
                src="/figmaAssets/auditboard-logo.png"
                alt="AuditBoard"
                className="w-12 h-auto brightness-0 invert"
              />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#266C92]/10 text-[#266C92] text-sm font-medium mb-6">
              <Clock className="w-4 h-4" />
              <span>In Development</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3" data-testid="coming-soon-title">
            Coming Soon
          </h1>
          
          <p className="text-lg text-gray-600 mb-2" data-testid="coming-soon-feature">
            {pageName}
          </p>
          
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            We're working hard to bring you this feature. Check back soon for updates!
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              data-testid="button-go-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              className="bg-[#266C92]"
              onClick={() => setLocation("/")}
              data-testid="button-go-home"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              AuditBoard Workflow Builder
            </p>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
