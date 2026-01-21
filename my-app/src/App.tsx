import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AnalysisPage } from "@/pages/AnalysisPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { WatchlistPage } from "@/pages/WatchlistPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { Toaster } from "@/components/ui/sonner";

// Type for analysis result data
interface AnalysisResultData {
  id: string;
  market: string;
  stockCode: string;
  date: string;
  depth: number;
  agentResults: Record<string, string>;
  debate: { bullCase: string; bearCase: string };
  risk: string;
  decision: string;
  aiScore: {
    technical: number;
    fundamental: number;
    sentiment: number;
    overall: number;
  };
}

export default function App() {
  const [activePage, setActivePage] = useState("analysis");
  const [viewingResult, setViewingResult] = useState<AnalysisResultData | null>(
    null,
  );

  // Handler to view analysis from watchlist/history
  const handleViewAnalysis = (data: AnalysisResultData) => {
    setViewingResult(data);
    setActivePage("analysis");
  };

  return (
    <SidebarProvider>
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="font-medium">AI 投資決策助手</div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
          {activePage === "analysis" && (
            <AnalysisPage
              initialResult={viewingResult}
              onResultCleared={() => setViewingResult(null)}
            />
          )}
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "settings" && <SettingsPage />}
          {activePage === "watchlist" && (
            <WatchlistPage onViewAnalysis={handleViewAnalysis} />
          )}
          {activePage === "history" && (
            <HistoryPage onViewAnalysis={handleViewAnalysis} />
          )}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
