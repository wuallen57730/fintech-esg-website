import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SettingsPage() {
  const [apiKey, setApiKey] = React.useState(""); // TODO: Load from localStorage

  // Load key on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("ai_investment_api_key");
    if (stored) {
      setApiKey(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("ai_investment_api_key", JSON.stringify(apiKey));
    alert("API Key Saved!");
  };

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">設定</h2>
      <Card>
        <CardHeader>
          <CardTitle>OpenAI API 設定</CardTitle>
          <CardDescription>
            請輸入您的 OpenAI API Key 以啟用分析功能。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <input
              type="password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
          <Button onClick={handleSave}>儲存設定</Button>
        </CardContent>
      </Card>
    </div>
  );
}
