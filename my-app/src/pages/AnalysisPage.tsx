import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { STORAGE_KEYS } from "@/lib/constants";
import { AnalysisPrompts, callChatGPT, sleep } from "@/lib/api";
import { formatContent, extractScore } from "@/lib/utils";
import { useLocalStorage } from "@/lib/hooks";
import {
  IconChartBar,
  IconBriefcase,
  IconMessageCircle,
  IconNews,
  IconAlertTriangle,
  IconBulb,
  IconRocket,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";

// Types
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

interface AnalysisPageProps {
  initialResult?: AnalysisResultData | null;
  onResultCleared?: () => void;
}

export function AnalysisPage({
  initialResult,
  onResultCleared,
}: AnalysisPageProps) {
  const [market, setMarket] = useState("TW");
  const [stockCode, setStockCode] = useState("");
  const [depth, setDepth] = useState(3);
  const [agents, setAgents] = useState({
    technical: true,
    fundamental: true,
    news: true,
    sentiment: true,
  });

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [result, setResult] = useState<AnalysisResultData | null>(
    initialResult || null,
  );
  const [, setHistory] = useLocalStorage<AnalysisResultData[]>(
    STORAGE_KEYS.HISTORY,
    [],
  );

  // Sync with initialResult when it changes
  if (initialResult && result?.id !== initialResult.id) {
    setResult(initialResult);
    setStockCode(initialResult.stockCode);
    setMarket(initialResult.market);
    setDepth(initialResult.depth);
  }

  const selectedAgentCount = Object.values(agents).filter(Boolean).length;

  const getAgentName = (agent: string) => {
    const names: Record<string, string> = {
      technical: "📈 技術分析師",
      fundamental: "💼 基本面分析師",
      news: "📰 新聞分析師",
      sentiment: "💬 情緒分析師",
    };
    return names[agent] || agent;
  };

  const handleAnalyze = async () => {
    if (!stockCode) return;

    setIsAnalyzing(true);
    setResult(null);
    setProgress(0);
    setProgressStep("初始化分析環境...");

    try {
      const selectedAgents = Object.entries(agents)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const agentResults: Record<string, string> = {};
      const date = new Date().toISOString().split("T")[0];

      // 1. Run Agents
      for (let i = 0; i < selectedAgents.length; i++) {
        const agent = selectedAgents[i];
        const p = 10 + ((i + 1) / selectedAgents.length) * 50;
        setProgress(p);
        setProgressStep(`${getAgentName(agent)} 正在分析...`);

        const promptFn = AnalysisPrompts[agent as keyof typeof AnalysisPrompts];
        if (typeof promptFn === "function") {
          const prompt = (
            promptFn as (
              m: string,
              s: string,
              d: string,
              depth: number,
            ) => string
          )(market, stockCode, date, depth);
          agentResults[agent] = await callChatGPT(prompt);
        }

        await sleep(1000);
      }

      // 2. Debate
      setProgress(70);
      setProgressStep("多空辯論中...");
      const allAnalysis = Object.values(agentResults).join("\n\n");
      const bullCase = await callChatGPT(
        AnalysisPrompts.debate(allAnalysis, market, stockCode, "bull"),
      );
      await sleep(1000);
      const bearCase = await callChatGPT(
        AnalysisPrompts.debate(allAnalysis, market, stockCode, "bear"),
      );

      // 3. Risk
      setProgress(85);
      setProgressStep("風險評估中...");
      const risk = await callChatGPT(
        AnalysisPrompts.risk(
          JSON.stringify({ agentResults, bullCase, bearCase }),
        ),
      );

      // 4. Decision
      setProgress(95);
      setProgressStep("生成最終建議...");
      const decision = await callChatGPT(
        AnalysisPrompts.decision(
          market,
          stockCode,
          JSON.stringify({
            agentResults,
            debate: { bullCase, bearCase },
            risk,
          }),
        ),
      );

      // Finish
      setProgress(100);
      setProgressStep("分析完成！");

      const aiScore = {
        technical: extractScore(agentResults.technical || ""),
        fundamental: extractScore(agentResults.fundamental || ""),
        sentiment: extractScore(agentResults.sentiment || ""),
        overall: 0,
      };
      aiScore.overall =
        (aiScore.technical + aiScore.fundamental + aiScore.sentiment) / 3;

      const finalData: AnalysisResultData = {
        id: Date.now().toString(),
        stockCode,
        market,
        date,
        depth,
        agentResults,
        debate: { bullCase, bearCase },
        risk,
        decision,
        aiScore,
      };

      setResult(finalData);
      setHistory((prev) => [finalData, ...prev].slice(0, 50));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "分析失敗";
      setProgressStep(`錯誤: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* AI Score Section - Only show when result exists */}
      {result && <ScoreCard result={result} />}

      {/* Analysis Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartBar className="size-5" />
            分析配置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Market & Stock Input */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>選擇市場</Label>
              <Select value={market} onValueChange={setMarket}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">🤖 自動識別</SelectItem>
                  <SelectItem value="TW">🇹🇼 台股</SelectItem>
                  <SelectItem value="US">🇺🇸 美股</SelectItem>
                  <SelectItem value="HK">🇭🇰 港股</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>股票代碼</Label>
              <Input
                placeholder="例如：TSLA, 2330, 00700"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <Label>研究深度: {depth} 級</Label>
              <input
                type="range"
                min="1"
                max="5"
                value={depth}
                onChange={(e) => setDepth(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>快速</span>
                <span>標準</span>
                <span>深度</span>
              </div>
            </div>
          </div>

          {/* Agent Selection */}
          <div className="space-y-3">
            <Label>👥 選擇分析師團隊</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: "technical", icon: IconTrendingUp, label: "技術分析師" },
                {
                  key: "fundamental",
                  icon: IconBriefcase,
                  label: "基本面分析師",
                },
                { key: "news", icon: IconNews, label: "新聞分析師" },
                {
                  key: "sentiment",
                  icon: IconMessageCircle,
                  label: "情緒分析師",
                },
              ].map(({ key, icon: Icon, label }) => (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    agents[key as keyof typeof agents]
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() =>
                    setAgents((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof agents],
                    }))
                  }
                >
                  <Checkbox
                    checked={agents[key as keyof typeof agents]}
                    onCheckedChange={(checked) =>
                      setAgents((prev) => ({
                        ...prev,
                        [key]: !!checked,
                      }))
                    }
                  />
                  <Icon className="size-4" />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              已選擇 <strong>{selectedAgentCount}</strong> 個分析師
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !stockCode || selectedAgentCount === 0}
              className="gap-2"
            >
              <IconRocket className="size-4" />
              {isAnalyzing ? "分析中..." : "開始分析"}
            </Button>
            {result && (
              <Button variant="outline" className="gap-2">
                <IconStar className="size-4" />
                加入觀察清單
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>分析進度</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              當前步驟: <strong>{progressStep}</strong>
            </p>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-right text-sm text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && <ResultSection result={result} />}
    </div>
  );
}

// Score Card Component
function ScoreCard({ result }: { result: AnalysisResultData }) {
  const overall = result.aiScore.overall;
  const scoreLabel =
    overall >= 8
      ? "強力推薦"
      : overall >= 6
        ? "建議買入"
        : overall >= 4
          ? "中性觀望"
          : "建議賣出";
  const scoreColor =
    overall >= 8
      ? "text-green-500"
      : overall >= 6
        ? "text-blue-500"
        : overall >= 4
          ? "text-yellow-500"
          : "text-red-500";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="relative">
            <svg width="160" height="160" className="transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-muted"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * overall) / 10}
                className={scoreColor}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${scoreColor}`}>
                {overall.toFixed(1)}
              </span>
              <span className="text-muted-foreground">/10</span>
            </div>
          </div>

          {/* Score Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold">
                {result.market} - {result.stockCode}
              </h3>
              <Badge variant="secondary" className={scoreColor}>
                {scoreLabel}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <IconTrendingUp className="size-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">技術面</p>
                <p className="font-semibold">
                  {result.aiScore.technical.toFixed(1)}
                </p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <IconBriefcase className="size-5 mx-auto mb-1 text-green-500" />
                <p className="text-xs text-muted-foreground">基本面</p>
                <p className="font-semibold">
                  {result.aiScore.fundamental.toFixed(1)}
                </p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <IconMessageCircle className="size-5 mx-auto mb-1 text-purple-500" />
                <p className="text-xs text-muted-foreground">情緒面</p>
                <p className="font-semibold">
                  {result.aiScore.sentiment.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Result Section Component
function ResultSection({ result }: { result: AnalysisResultData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 詳細分析報告</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="technical">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="technical" className="gap-1">
              <IconTrendingUp className="size-4" />
              <span className="hidden sm:inline">技術面</span>
            </TabsTrigger>
            <TabsTrigger value="fundamental" className="gap-1">
              <IconBriefcase className="size-4" />
              <span className="hidden sm:inline">基本面</span>
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="gap-1">
              <IconMessageCircle className="size-4" />
              <span className="hidden sm:inline">情緒面</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-1">
              <IconNews className="size-4" />
              <span className="hidden sm:inline">新聞</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="gap-1">
              <IconAlertTriangle className="size-4" />
              <span className="hidden sm:inline">風險</span>
            </TabsTrigger>
            <TabsTrigger value="decision" className="gap-1">
              <IconBulb className="size-4" />
              <span className="hidden sm:inline">建議</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="mt-4">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: formatContent(
                  result.agentResults.technical || "無資料",
                ),
              }}
            />
          </TabsContent>

          <TabsContent value="fundamental" className="mt-4">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: formatContent(
                  result.agentResults.fundamental || "無資料",
                ),
              }}
            />
          </TabsContent>

          <TabsContent value="sentiment" className="mt-4">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: formatContent(
                  result.agentResults.sentiment || "無資料",
                ),
              }}
            />
          </TabsContent>

          <TabsContent value="news" className="mt-4">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: formatContent(result.agentResults.news || "無資料"),
              }}
            />
          </TabsContent>

          <TabsContent value="risk" className="mt-4">
            <div className="space-y-4">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: formatContent(result.risk || "無資料"),
                }}
              />
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">🐻 空頭觀點</h4>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert bg-red-50 dark:bg-red-950/20 p-4 rounded-lg"
                  dangerouslySetInnerHTML={{
                    __html: formatContent(result.debate.bearCase || "無資料"),
                  }}
                />
              </div>
              <div>
                <h4 className="font-semibold mb-2">🐂 多頭觀點</h4>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert bg-green-50 dark:bg-green-950/20 p-4 rounded-lg"
                  dangerouslySetInnerHTML={{
                    __html: formatContent(result.debate.bullCase || "無資料"),
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="decision" className="mt-4">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: formatContent(result.decision || "無資料"),
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
