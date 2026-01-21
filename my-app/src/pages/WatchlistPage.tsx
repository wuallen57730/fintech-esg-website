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
import { Separator } from "@/components/ui/separator";
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
  IconStar,
  IconTrash,
  IconEye,
  IconClipboardList,
} from "@tabler/icons-react";

// Types matching AnalysisPage
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

interface WatchlistItem {
  stock: string;
  market: string;
  aiScore: number;
  recommendation: string;
  addedDate: string;
  data: AnalysisResultData;
}

interface WatchlistPageProps {
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

export function WatchlistPage({ onViewAnalysis }: WatchlistPageProps) {
  const [watchlist, setWatchlist] = useLocalStorage<WatchlistItem[]>(
    STORAGE_KEYS.WATCHLIST,
    [],
  );
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleRemove = (index: number) => {
    setDeleteIndex(index);
  };

  const confirmRemove = () => {
    if (deleteIndex !== null) {
      setWatchlist((prev) => prev.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
    }
  };

  const handleView = (item: WatchlistItem) => {
    if (onViewAnalysis) {
      onViewAnalysis(item.data);
    }
  };

  // Empty State
  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconStar className="size-5 text-yellow-500" />
              我的觀察清單
            </CardTitle>
            <CardDescription>追蹤您感興趣的股票</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <IconClipboardList className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">觀察清單是空的</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              分析股票後，點擊「加入觀察清單」來追蹤它們
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
                <IconStar className="size-5 text-yellow-500" />
                我的觀察清單
              </CardTitle>
              <CardDescription>
                追蹤您感興趣的股票 · 共 {watchlist.length} 支
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {watchlist.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Watchlist Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {watchlist.map((item, index) => (
          <Card
            key={`${item.stock}-${item.addedDate}`}
            className="overflow-hidden"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{getMarketIcon(item.market)}</span>
                    <span>{getMarketName(item.market)}</span>
                    <span className="text-primary">{item.stock}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    加入日期:{" "}
                    {new Date(item.addedDate).toLocaleDateString("zh-TW")}
                  </CardDescription>
                </div>
                <div
                  className={`text-3xl font-bold ${getScoreColor(item.aiScore)}`}
                >
                  {item.aiScore.toFixed(1)}
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">建議:</span>
                <Badge
                  variant="outline"
                  className={getRecommendationColor(item.recommendation)}
                >
                  {item.recommendation}
                </Badge>
              </div>

              <Separator className="mb-4" />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleView(item)}
                >
                  <IconEye className="size-4 mr-1" />
                  查看詳情
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemove(index)}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={() => setDeleteIndex(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要移除此股票？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作將從您的觀察清單中移除該股票。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>
              確定移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
