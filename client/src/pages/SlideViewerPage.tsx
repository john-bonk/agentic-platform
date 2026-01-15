/**
 * Slide Viewer Page
 * 
 * Full-screen Google Slides-like presentation viewer for reports and decks.
 */

import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, ChevronRight, X, Download, Maximize2, 
  BarChart3, TrendingUp, AlertTriangle, CheckCircle2,
  DollarSign, Globe, Shield, Users, Building2
} from "lucide-react";
import { getSlideDeck, type Slide, type SlideDeck } from "@/lib/reportingContent";

const reportToWorkspaceMap: Record<string, { workspaceId: string; deckKey: string }> = {
  "rpt-1": { workspaceId: "enterprise-risk", deckKey: "board-report" },
  "rpt-2": { workspaceId: "enterprise-audit", deckKey: "audit-committee-report" },
  "rpt-3": { workspaceId: "it-security", deckKey: "compliance-report" },
  "rpt-4": { workspaceId: "enterprise-risk", deckKey: "board-report" },
};

const directDeckMap: Record<string, { workspaceId: string; deckKey: string }> = {
  "board-report": { workspaceId: "enterprise-risk", deckKey: "board-report" },
  "audit-committee-report": { workspaceId: "enterprise-audit", deckKey: "audit-committee-report" },
  "compliance-report": { workspaceId: "it-security", deckKey: "compliance-report" },
};

const defaultMapping = { workspaceId: "enterprise-risk", deckKey: "board-report" };

function SlideContent({ slide }: { slide: Slide }) {
  if (slide.type === "title") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-16">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">{slide.title}</h1>
        {slide.subtitle && (
          <p className="text-2xl text-gray-600 dark:text-gray-300">{slide.subtitle}</p>
        )}
      </div>
    );
  }

  if (slide.type === "metrics" && slide.metrics) {
    return (
      <div className="flex flex-col h-full p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{slide.title}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
          {slide.metrics.map((metric, idx) => {
            const colors = [
              "bg-[#266C92]/10 text-[#266C92]",
              "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
              "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
              "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
            ];
            const icons = [DollarSign, TrendingUp, Globe, Shield];
            const Icon = icons[idx % icons.length];
            
            return (
              <div 
                key={idx}
                className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${colors[idx % colors.length]}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{metric.value}</p>
                <p className="text-lg text-gray-500 dark:text-gray-400 text-center">{metric.label}</p>
                {metric.trendValue && (
                  <Badge 
                    variant="secondary" 
                    className={`mt-3 ${
                      metric.trend === "up" 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : metric.trend === "down" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : ""
                    }`}
                  >
                    {metric.trendValue}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (slide.type === "bullets" && slide.bulletPoints) {
    return (
      <div className="flex flex-col h-full p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{slide.title}</h2>
        <div className="flex-1 flex items-center">
          <ul className="space-y-6 w-full max-w-4xl">
            {slide.bulletPoints.map((bullet: string, idx: number) => (
              <li key={idx} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#266C92]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-5 h-5 text-[#266C92]" />
                </div>
                <span className="text-2xl text-gray-700 dark:text-gray-300 leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (slide.type === "chart" && slide.chartData) {
    const maxValue = Math.max(...slide.chartData.map(d => d.value));
    const formatValue = (val: number) => {
      switch (slide.chartUnit) {
        case "percent": return `${val}%`;
        case "currency": return `$${val}M`;
        case "count": return val.toString();
        default: return val.toString();
      }
    };
    return (
      <div className="flex flex-col h-full p-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{slide.title}</h2>
          {slide.subtitle && (
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">{slide.subtitle}</p>
          )}
        </div>
        <div className="flex-1 flex items-end justify-center gap-4 pb-8">
          {slide.chartData.map((item, idx) => {
            const heightPercent = (item.value / maxValue) * 100;
            return (
              <div key={idx} className="flex flex-col items-center gap-3" style={{ width: `${100 / slide.chartData!.length}%`, maxWidth: '120px' }}>
                <div className="relative w-full flex flex-col items-center" style={{ height: '280px' }}>
                  <span className="absolute -top-8 text-lg font-bold text-gray-700 dark:text-gray-300">
                    {formatValue(item.value)}
                  </span>
                  <div 
                    className="w-full rounded-t-lg transition-all duration-500 ease-out"
                    style={{ 
                      height: `${heightPercent}%`,
                      backgroundColor: item.color,
                      marginTop: 'auto'
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (slide.type === "summary" && slide.bulletPoints) {
    return (
      <div className="flex flex-col h-full p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{slide.title}</h2>
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-8 mb-6">
            <ul className="space-y-4">
              {slide.bulletPoints.map((bullet: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#266C92]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-[#266C92]" />
                  </div>
                  <span className="text-xl text-gray-700 dark:text-gray-300">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
          {slide.conclusion && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-lg text-green-800 dark:text-green-300 font-medium">{slide.conclusion}</p>
              </div>
            </div>
          )}
          {slide.cta && (
            <div className="bg-[#266C92]/10 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-[#266C92]" />
                <span className="text-lg font-semibold text-[#266C92]">Action Required:</span>
              </div>
              <span className="text-lg text-gray-900 dark:text-white font-medium">{slide.cta}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{slide.title}</h2>
    </div>
  );
}

function MiniSlideContent({ slide }: { slide: Slide }) {
  if (slide.type === "title") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-2">
        <h1 className="text-[6px] font-bold text-gray-900 dark:text-white leading-tight">{slide.title}</h1>
        {slide.subtitle && (
          <p className="text-[4px] text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">{slide.subtitle}</p>
        )}
      </div>
    );
  }

  if (slide.type === "metrics" && slide.metrics) {
    return (
      <div className="flex flex-col h-full p-1">
        <h2 className="text-[5px] font-bold text-gray-900 dark:text-white mb-1 truncate">{slide.title}</h2>
        <div className="grid grid-cols-2 gap-0.5 flex-1">
          {slide.metrics.slice(0, 4).map((metric, idx) => (
            <div 
              key={idx}
              className="flex flex-col items-center justify-center rounded bg-white dark:bg-slate-700 p-0.5"
            >
              <p className="text-[5px] font-bold text-[#266C92]">{metric.value}</p>
              <p className="text-[3px] text-gray-500 dark:text-gray-400 truncate w-full text-center">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "bullets" && slide.bulletPoints) {
    return (
      <div className="flex flex-col h-full p-1">
        <h2 className="text-[5px] font-bold text-gray-900 dark:text-white mb-1 truncate">{slide.title}</h2>
        <ul className="space-y-0.5 flex-1">
          {slide.bulletPoints.slice(0, 3).map((bullet: string, idx: number) => (
            <li key={idx} className="flex items-start gap-0.5">
              <div className="w-1 h-1 rounded-full bg-[#266C92] flex-shrink-0 mt-0.5" />
              <span className="text-[3px] text-gray-700 dark:text-gray-300 line-clamp-1">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (slide.type === "chart" && slide.chartData) {
    return (
      <div className="flex flex-col h-full p-1">
        <h2 className="text-[5px] font-bold text-gray-900 dark:text-white mb-1 truncate">{slide.title}</h2>
        <div className="flex-1 flex items-end justify-center gap-px px-1 pb-1">
          {slide.chartData.slice(0, 6).map((item, idx) => {
            const maxVal = Math.max(...slide.chartData!.map(d => d.value));
            const h = (item.value / maxVal) * 100;
            return (
              <div 
                key={idx} 
                className="flex-1 rounded-t-sm"
                style={{ height: `${h}%`, backgroundColor: item.color, minHeight: '2px' }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (slide.type === "summary" && slide.bulletPoints) {
    return (
      <div className="flex flex-col h-full p-1">
        <h2 className="text-[5px] font-bold text-gray-900 dark:text-white mb-1 truncate">{slide.title}</h2>
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="flex-1 bg-slate-100 dark:bg-slate-600 rounded-sm p-0.5">
            {slide.bulletPoints.slice(0, 2).map((_, idx) => (
              <div key={idx} className="flex items-center gap-0.5 mb-0.5">
                <div className="w-0.5 h-0.5 rounded-full bg-[#266C92]" />
                <div className="h-0.5 bg-gray-300 dark:bg-gray-500 rounded flex-1" />
              </div>
            ))}
          </div>
          {slide.conclusion && (
            <div className="h-2 bg-green-100 dark:bg-green-900/30 rounded-sm" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-1">
      <h2 className="text-[5px] font-bold text-gray-900 dark:text-white text-center">{slide.title}</h2>
    </div>
  );
}

export default function SlideViewerPage() {
  const [, params] = useRoute("/reporting/view/:deckId");
  const [, artifactParams] = useRoute("/reporting/artifacts/:id");
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [deck, setDeck] = useState<SlideDeck | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const deckId = params?.deckId || artifactParams?.id;

  useEffect(() => {
    if (!deckId) return;

    const mapping = directDeckMap[deckId] || reportToWorkspaceMap[deckId] || defaultMapping;
    const loadedDeck = getSlideDeck(mapping.workspaceId, mapping.deckKey);
    setDeck(loadedDeck);
  }, [deckId]);

  const handlePrevSlide = useCallback(() => {
    if (deck && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide, deck]);

  const handleNextSlide = useCallback(() => {
    if (deck && currentSlide < deck.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide, deck]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      handlePrevSlide();
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
      handleNextSlide();
    } else if (e.key === "Escape") {
      if (isFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        setLocation("/reporting");
      }
    }
  }, [handlePrevSlide, handleNextSlide, setLocation, isFullscreen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!deck) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl">Loading presentation...</p>
        </div>
      </div>
    );
  }

  const slide = deck.slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 flex flex-col z-50" data-testid="slide-viewer">
      <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setLocation("/reporting")}
            data-testid="button-close-viewer"
          >
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">{deck.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{deck.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {currentSlide + 1} / {deck.slides.length}
          </Badge>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={toggleFullscreen}
            data-testid="button-fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost"
            data-testid="button-download"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-48 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto p-3 space-y-2">
          {deck.slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-full aspect-[16/9] rounded-lg border-2 transition-all overflow-hidden ${
                idx === currentSlide 
                  ? "border-[#266C92] ring-2 ring-[#266C92]/30" 
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
              data-testid={`thumbnail-${idx}`}
            >
              <div className="w-full h-full bg-slate-50 dark:bg-slate-700">
                <MiniSlideContent slide={s} />
              </div>
            </button>
          ))}
        </aside>

        <div className="flex-1 flex items-center justify-center p-8 relative">
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl disabled:opacity-30"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div 
            className="w-full max-w-5xl aspect-[16/9] bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
            data-testid={`slide-${currentSlide}`}
          >
            <SlideContent slide={slide} />
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl disabled:opacity-30"
            onClick={handleNextSlide}
            disabled={currentSlide === deck.slides.length - 1}
            data-testid="button-next-slide"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <footer className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        {deck.slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentSlide 
                ? "bg-[#266C92] w-6" 
                : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
            }`}
            data-testid={`slide-indicator-${idx}`}
          />
        ))}
      </footer>
    </div>
  );
}
