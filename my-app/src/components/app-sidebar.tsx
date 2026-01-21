import * as React from "react";
import {
  IconChartBar,
  IconHistory,
  IconSettings,
  IconStar,
  IconInnerShadowTop,
  IconLayoutDashboard,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "股票分析",
    url: "#analysis",
    id: "analysis",
    icon: IconChartBar,
  },
  {
    title: "儀表板",
    url: "#dashboard",
    id: "dashboard",
    icon: IconLayoutDashboard,
  },
  {
    title: "觀察清單",
    url: "#watchlist",
    id: "watchlist",
    icon: IconStar,
  },
  {
    title: "分析歷史",
    url: "#history",
    id: "history",
    icon: IconHistory,
  },
  {
    title: "設定",
    url: "#settings",
    id: "settings",
    icon: IconSettings,
  },
];

export function AppSidebar({
  activePage,
  onNavigate,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activePage: string;
  onNavigate: (page: string) => void;
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => onNavigate("analysis")}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
                <IconInnerShadowTop className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">AI 投資助手</span>
                <span className="truncate text-xs">智能決策系統</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={activePage === item.id}
                onClick={() => onNavigate(item.id)}
                tooltip={item.title}
                className="text-base py-3"
              >
                {item.icon && <item.icon className="size-5" />}
                <span className="text-base">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-gray-400">v2.0.0 (React Refactor)</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
