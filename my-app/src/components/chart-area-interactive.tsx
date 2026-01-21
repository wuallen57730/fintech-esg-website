"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "投資績效走勢圖";

// 投資績效數據 - profit(盈餘), loss(虧損), revenue(淨收益)
const chartData = [
  { date: "2024-04-01", profit: 2200, loss: -800, revenue: 1400 },
  { date: "2024-04-02", profit: 1500, loss: -1200, revenue: 300 },
  { date: "2024-04-03", profit: 3200, loss: -500, revenue: 2700 },
  { date: "2024-04-04", profit: 4500, loss: -300, revenue: 4200 },
  { date: "2024-04-05", profit: 5800, loss: -200, revenue: 5600 },
  { date: "2024-04-06", profit: 4200, loss: -1500, revenue: 2700 },
  { date: "2024-04-07", profit: 3800, loss: -900, revenue: 2900 },
  { date: "2024-04-08", profit: 6200, loss: -400, revenue: 5800 },
  { date: "2024-04-09", profit: 1200, loss: -2800, revenue: -1600 },
  { date: "2024-04-10", profit: 3500, loss: -600, revenue: 2900 },
  { date: "2024-04-11", profit: 4800, loss: -200, revenue: 4600 },
  { date: "2024-04-12", profit: 3900, loss: -1100, revenue: 2800 },
  { date: "2024-04-13", profit: 5200, loss: -300, revenue: 4900 },
  { date: "2024-04-14", profit: 2100, loss: -1800, revenue: 300 },
  { date: "2024-04-15", profit: 1800, loss: -2200, revenue: -400 },
  { date: "2024-04-16", profit: 2500, loss: -1500, revenue: 1000 },
  { date: "2024-04-17", profit: 6800, loss: -200, revenue: 6600 },
  { date: "2024-04-18", profit: 5500, loss: -800, revenue: 4700 },
  { date: "2024-04-19", profit: 3200, loss: -1200, revenue: 2000 },
  { date: "2024-04-20", profit: 1500, loss: -2500, revenue: -1000 },
  { date: "2024-04-21", profit: 2200, loss: -1600, revenue: 600 },
  { date: "2024-04-22", profit: 3800, loss: -900, revenue: 2900 },
  { date: "2024-04-23", profit: 2500, loss: -1800, revenue: 700 },
  { date: "2024-04-24", profit: 5800, loss: -400, revenue: 5400 },
  { date: "2024-04-25", profit: 3200, loss: -1200, revenue: 2000 },
  { date: "2024-04-26", profit: 1200, loss: -2800, revenue: -1600 },
  { date: "2024-04-27", profit: 5500, loss: -600, revenue: 4900 },
  { date: "2024-04-28", profit: 1800, loss: -1900, revenue: -100 },
  { date: "2024-04-29", profit: 4500, loss: -800, revenue: 3700 },
  { date: "2024-04-30", profit: 6500, loss: -300, revenue: 6200 },
  { date: "2024-05-01", profit: 2500, loss: -1500, revenue: 1000 },
  { date: "2024-05-02", profit: 4200, loss: -700, revenue: 3500 },
  { date: "2024-05-03", profit: 3500, loss: -1000, revenue: 2500 },
  { date: "2024-05-04", profit: 5800, loss: -400, revenue: 5400 },
  { date: "2024-05-05", profit: 7200, loss: -200, revenue: 7000 },
  { date: "2024-05-06", profit: 7800, loss: -100, revenue: 7700 },
  { date: "2024-05-07", profit: 5500, loss: -600, revenue: 4900 },
  { date: "2024-05-08", profit: 2200, loss: -1800, revenue: 400 },
  { date: "2024-05-09", profit: 3200, loss: -1200, revenue: 2000 },
  { date: "2024-05-10", profit: 4500, loss: -700, revenue: 3800 },
  { date: "2024-05-11", profit: 4800, loss: -500, revenue: 4300 },
  { date: "2024-05-12", profit: 2800, loss: -1400, revenue: 1400 },
  { date: "2024-05-13", profit: 2800, loss: -1600, revenue: 1200 },
  { date: "2024-05-14", profit: 6800, loss: -200, revenue: 6600 },
  { date: "2024-05-15", profit: 7200, loss: -300, revenue: 6900 },
  { date: "2024-05-16", profit: 4800, loss: -600, revenue: 4200 },
  { date: "2024-05-17", profit: 7500, loss: -200, revenue: 7300 },
  { date: "2024-05-18", profit: 4500, loss: -500, revenue: 4000 },
  { date: "2024-05-19", profit: 3200, loss: -1200, revenue: 2000 },
  { date: "2024-05-20", profit: 2500, loss: -1800, revenue: 700 },
  { date: "2024-05-21", profit: 1200, loss: -2500, revenue: -1300 },
  { date: "2024-05-22", profit: 1200, loss: -2800, revenue: -1600 },
  { date: "2024-05-23", profit: 3500, loss: -800, revenue: 2700 },
  { date: "2024-05-24", profit: 4200, loss: -600, revenue: 3600 },
  { date: "2024-05-25", profit: 2800, loss: -1200, revenue: 1600 },
  { date: "2024-05-26", profit: 3000, loss: -1400, revenue: 1600 },
  { date: "2024-05-27", profit: 6200, loss: -300, revenue: 5900 },
  { date: "2024-05-28", profit: 3200, loss: -1100, revenue: 2100 },
  { date: "2024-05-29", profit: 1200, loss: -2600, revenue: -1400 },
  { date: "2024-05-30", profit: 4800, loss: -600, revenue: 4200 },
  { date: "2024-05-31", profit: 2500, loss: -1800, revenue: 700 },
  { date: "2024-06-01", profit: 2500, loss: -1600, revenue: 900 },
  { date: "2024-06-02", profit: 7000, loss: -300, revenue: 6700 },
  { date: "2024-06-03", profit: 1500, loss: -2200, revenue: -700 },
  { date: "2024-06-04", profit: 6500, loss: -400, revenue: 6100 },
  { date: "2024-06-05", profit: 1200, loss: -2600, revenue: -1400 },
  { date: "2024-06-06", profit: 4200, loss: -800, revenue: 3400 },
  { date: "2024-06-07", profit: 4500, loss: -500, revenue: 4000 },
  { date: "2024-06-08", profit: 5500, loss: -400, revenue: 5100 },
  { date: "2024-06-09", profit: 6500, loss: -200, revenue: 6300 },
  { date: "2024-06-10", profit: 2200, loss: -1600, revenue: 600 },
  { date: "2024-06-11", profit: 1300, loss: -2400, revenue: -1100 },
  { date: "2024-06-12", profit: 7500, loss: -200, revenue: 7300 },
  { date: "2024-06-13", profit: 1200, loss: -2700, revenue: -1500 },
  { date: "2024-06-14", profit: 6200, loss: -400, revenue: 5800 },
  { date: "2024-06-15", profit: 4200, loss: -600, revenue: 3600 },
  { date: "2024-06-16", profit: 5200, loss: -500, revenue: 4700 },
  { date: "2024-06-17", profit: 7200, loss: -200, revenue: 7000 },
  { date: "2024-06-18", profit: 1500, loss: -2200, revenue: -700 },
  { date: "2024-06-19", profit: 4800, loss: -600, revenue: 4200 },
  { date: "2024-06-20", profit: 6000, loss: -300, revenue: 5700 },
  { date: "2024-06-21", profit: 2400, loss: -1700, revenue: 700 },
  { date: "2024-06-22", profit: 4500, loss: -700, revenue: 3800 },
  { date: "2024-06-23", profit: 7200, loss: -200, revenue: 7000 },
  { date: "2024-06-24", profit: 1800, loss: -2000, revenue: -200 },
  { date: "2024-06-25", profit: 2000, loss: -1900, revenue: 100 },
  { date: "2024-06-26", profit: 6200, loss: -400, revenue: 5800 },
  { date: "2024-06-27", profit: 6800, loss: -200, revenue: 6600 },
  { date: "2024-06-28", profit: 2200, loss: -1600, revenue: 600 },
  { date: "2024-06-29", profit: 1500, loss: -2200, revenue: -700 },
  { date: "2024-06-30", profit: 6500, loss: -400, revenue: 6100 },
];

const chartConfig = {
  performance: {
    label: "投資績效",
  },
  profit: {
    label: "盈餘",
    color: "hsl(142, 76%, 36%)",
  },
  loss: {
    label: "虧損",
    color: "hsl(0, 84%, 60%)",
  },
  revenue: {
    label: "淨收益",
    color: "hsl(221, 83%, 53%)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>投資績效走勢</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            顯示過去 3 個月的盈餘與虧損
          </span>
          <span className="@[540px]/card:hidden">過去 3 個月</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">過去 3 個月</ToggleGroupItem>
            <ToggleGroupItem value="30d">過去 30 天</ToggleGroupItem>
            <ToggleGroupItem value="7d">過去 7 天</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="選擇時間範圍"
            >
              <SelectValue placeholder="過去 3 個月" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                過去 3 個月
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                過去 30 天
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                過去 7 天
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-profit)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-profit)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillLoss" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-loss)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-loss)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("zh-TW", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("zh-TW", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="profit"
              type="natural"
              fill="url(#fillProfit)"
              stroke="var(--color-profit)"
            />
            <Area
              dataKey="loss"
              type="natural"
              fill="url(#fillLoss)"
              stroke="var(--color-loss)"
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
