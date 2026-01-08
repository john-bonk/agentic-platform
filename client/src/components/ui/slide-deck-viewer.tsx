/**
 * SlideDeckViewer Component
 * 
 * A Google Slides-like viewer for report artifacts.
 * Displays contextual slide content with navigation, metrics, and export options.
 */

import { useState } from "react";
import { 
  ChevronLeft, ChevronRight, Download, Maximize2, X,
  TrendingUp, TrendingDown, Minus, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Slide, SlideDeck, SlideMetric } from "@/lib/reportingContent";

interface SlideDeckViewerProps {
  deck: SlideDeck;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onExport?: () => void;
}

function MetricCard({ metric }: { metric: SlideMetric }) {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "down":
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
      <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
      <p className="text-xl font-bold text-gray-900">{metric.value}</p>
      {metric.trendValue && (
        <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{metric.trendValue}</span>
        </div>
      )}
    </div>
  );
}

function SlideContent({ slide }: { slide: Slide }) {
  switch (slide.type) {
    case "title":
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[#266C92]/10 flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-[#266C92]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{slide.title}</h2>
          {slide.subtitle && (
            <p className="text-sm text-gray-500">{slide.subtitle}</p>
          )}
        </div>
      );

    case "metrics":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{slide.title}</h3>
          <div className="grid grid-cols-2 gap-3">
            {slide.metrics?.map((metric, idx) => (
              <MetricCard key={idx} metric={metric} />
            ))}
          </div>
        </div>
      );

    case "bullets":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{slide.title}</h3>
          <ul className="space-y-2 mb-4">
            {slide.bulletPoints?.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#266C92] mt-2 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          {slide.conclusion && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-green-800">{slide.conclusion}</p>
            </div>
          )}
          {slide.cta && (
            <Badge className="bg-[#266C92] text-white">{slide.cta}</Badge>
          )}
        </div>
      );

    case "chart":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{slide.title}</h3>
          <div className="space-y-2">
            {slide.chartData?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-20 truncate">{item.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${item.value}%`, 
                      backgroundColor: item.color 
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-10">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 text-center">
          <p className="text-gray-500">Slide content</p>
        </div>
      );
  }
}

export function SlideDeckViewer({ deck, onClose, onNavigate, onExport }: SlideDeckViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < deck.slides.length) {
      setCurrentSlide(index);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else if (deck.exportPath) {
      onNavigate(deck.exportPath);
    }
  };

  return (
    <Card className="border-slate-200 overflow-hidden" data-testid="slide-deck-viewer">
      <div className="bg-gradient-to-r from-[#266C92] to-[#1e5a7a] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white text-sm truncate">{deck.title}</h4>
            <p className="text-xs text-white/70 truncate">{deck.description}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={handleExport}
              data-testid="button-export-deck"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={onClose}
              data-testid="button-close-viewer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="bg-slate-100 min-h-[280px] relative">
          <SlideContent slide={deck.slides[currentSlide]} />
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToSlide(currentSlide - 1)}
            disabled={currentSlide === 0}
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2">
            {deck.slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentSlide ? "bg-[#266C92]" : "bg-gray-300"
                }`}
                data-testid={`button-slide-dot-${idx}`}
              />
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => goToSlide(currentSlide + 1)}
            disabled={currentSlide === deck.slides.length - 1}
            data-testid="button-next-slide"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-[#266C92] hover:bg-[#1e5a7a]"
            onClick={handleExport}
            data-testid="button-export-to-library"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Export to Library
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onClose}
            data-testid="button-done-viewing"
          >
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
