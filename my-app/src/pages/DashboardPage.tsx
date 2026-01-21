import { DataTable } from "@/components/data-table";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { IconLayoutDashboard } from "@tabler/icons-react";

// Sample data for the table
const tableData = [
  {
    id: 1,
    header: "台積電 (2330.TW)",
    type: "技術分析",
    status: "Done",
    target: "92",
    limit: "85",
    reviewer: "AI 分析師",
  },
  {
    id: 2,
    header: "聯發科 (2454.TW)",
    type: "基本面分析",
    status: "Done",
    target: "88",
    limit: "80",
    reviewer: "AI 分析師",
  },
  {
    id: 3,
    header: "鴻海 (2317.TW)",
    type: "技術分析",
    status: "In Progress",
    target: "75",
    limit: "70",
    reviewer: "待分配",
  },
  {
    id: 4,
    header: "Apple (AAPL)",
    type: "綜合分析",
    status: "Done",
    target: "95",
    limit: "90",
    reviewer: "AI 分析師",
  },
  {
    id: 5,
    header: "NVIDIA (NVDA)",
    type: "技術分析",
    status: "Done",
    target: "98",
    limit: "92",
    reviewer: "AI 分析師",
  },
  {
    id: 6,
    header: "Microsoft (MSFT)",
    type: "基本面分析",
    status: "In Progress",
    target: "90",
    limit: "85",
    reviewer: "待分配",
  },
  {
    id: 7,
    header: "Tesla (TSLA)",
    type: "情緒分析",
    status: "Done",
    target: "72",
    limit: "65",
    reviewer: "AI 分析師",
  },
  {
    id: 8,
    header: "國泰金 (2882.TW)",
    type: "基本面分析",
    status: "Done",
    target: "78",
    limit: "72",
    reviewer: "AI 分析師",
  },
];

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 @container/main">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLayoutDashboard className="size-5 text-blue-500" />
            投資儀表板
          </CardTitle>
          <CardDescription>
            全方位投資分析視圖 - 管理您的股票分析任務
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Area Chart */}
      <ChartAreaInteractive />

      {/* DataTable */}
      <DataTable data={tableData} />
    </div>
  );
}
