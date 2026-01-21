import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { STORAGE_KEYS } from "@/lib/constants";
import { useLocalStorage } from "@/lib/hooks";
import {
  IconHistory,
  IconTrash,
  IconEye,
  IconChartBar,
} from "@tabler/icons-react";

// Types matching AnalysisPage
interface AnalysisResultData {
  id: string;
  market: string;
  stockCode: string;
  date: string;
  timestamp?: string;
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

interface HistoryPageProps {
  onViewAnalysis?: (data: AnalysisResultData) => void;
}

function getMarketIcon(market: string) {
  switch (market) {
    case "TW":
      return "🇹🇼";
    case "US":
      return "🇺🇸";
    case "HK":
      return "🇭🇰";
    default:
      return "📊";
  }
}

function getMarketName(market: string) {
  switch (market) {
    case "TW":
      return "台股";
    case "US":
      return "美股";
    case "HK":
      return "港股";
    default:
      return market;
  }
}

function extractRecommendation(decision: string): string {
  try {
    const regex = /"recommendation"\s*:\s*"([^"]+)"/;
    const match = regex.exec(decision);
    return match ? match[1] : "持有";
  } catch {
    return "持有";
  }
}

function getRecommendationColor(recommendation: string) {
  const rec = recommendation.toLowerCase();
  if (rec.includes("買入") || rec.includes("buy") || rec.includes("強力")) {
    return "bg-green-500/10 text-green-600 border-green-200";
  }
  if (rec.includes("賣出") || rec.includes("sell")) {
    return "bg-red-500/10 text-red-600 border-red-200";
  }
  return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
}

function getScoreColor(score: number) {
  if (score >= 7) return "text-green-600";
  if (score >= 5) return "text-yellow-600";
  return "text-red-600";
}

export function HistoryPage({ onViewAnalysis }: HistoryPageProps) {
  const [history, setHistory] = useLocalStorage<AnalysisResultData[]>(
    STORAGE_KEYS.HISTORY,
    [],
  );
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRemove = (index: number) => {
    setDeleteIndex(index);
  };

  const confirmRemove = () => {
    if (deleteIndex !== null) {
      setHistory((prev) => prev.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
    }
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    setHistory([]);
    setShowClearConfirm(false);
  };

  const handleView = (item: AnalysisResultData) => {
    if (onViewAnalysis) {
      onViewAnalysis(item);
    }
  };

  // Empty State
  if (history.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconHistory className="size-5 text-blue-500" />
              分析歷史記錄
            </CardTitle>
            <CardDescription>查看過去的分析結果</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <IconChartBar className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">還沒有分析記錄</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              開始分析股票，您的分析結果將自動保存在這裡
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconHistory className="size-5 text-blue-500" />
                分析歷史記錄
              </CardTitle>
              <CardDescription>
                查看過去的分析結果 · 共 {history.length} 筆
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {history.length}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleClearAll}
              >
                <IconTrash className="size-4 mr-1" />
                清空歷史
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* History List */}
      <div className="flex flex-col gap-3">
        {history.map((item, index) => {
          const recommendation = extractRecommendation(item.decision);
          const displayDate = item.timestamp || item.date || item.id;
          const formattedDate = new Date(
            typeof displayDate === "string" && displayDate.length === 10
              ? displayDate + "T00:00:00"
              : Number(displayDate),
          ).toLocaleString("zh-TW");

          return (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleView(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Left: Stock Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {getMarketIcon(item.market)}
                      </span>
                      <span className="font-medium">
                        {getMarketName(item.market)}
                      </span>
                      <span className="text-primary font-semibold">
                        {item.stockCode}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formattedDate} | 深度: {item.depth}級
                    </div>
                  </div>

                  {/* Center: Recommendation & Score */}
                  <div className="flex items-center gap-4 mr-4">
                    <Badge
                      variant="outline"
                      className={getRecommendationColor(recommendation)}
                    >
                      {recommendation}
                    </Badge>
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${getScoreColor(
                          item.aiScore?.overall || 0,
                        )}`}
                      >
                        {(item.aiScore?.overall || 0).toFixed(1)}
                        <span className="text-xs text-muted-foreground">
                          /10
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        AI評分
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(item);
                      }}
                    >
                      <IconEye className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Single Confirmation Dialog */}
      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={() => setDeleteIndex(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除此記錄？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作將從您的歷史記錄中刪除該分析結果。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>
              確定刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要清空所有歷史記錄？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法撤銷，所有分析記錄將被永久刪除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              確定清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
