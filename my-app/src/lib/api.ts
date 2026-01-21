import { STORAGE_KEYS } from "./constants";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getApiKey() {
  try {
    const key = localStorage.getItem(STORAGE_KEYS.API_KEY);
    return key ? JSON.parse(key) : null;
  } catch (e) {
    return null;
  }
}

function getModel() {
  try {
    const model = localStorage.getItem(STORAGE_KEYS.MODEL);
    return model ? JSON.parse(model) : "gpt-4o-mini";
  } catch (e) {
    return "gpt-4o-mini";
  }
}

export async function callChatGPT(prompt: string, retries = 3) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("請先在設定頁面設置您的 OpenAI API Key");
  }

  const model = getModel();

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: "你是專業的投資分析AI。" },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429 && attempt < retries - 1) {
          const waitTime = Math.pow(2, attempt) * 2000;
          console.log(`Rate limit, retrying in ${waitTime}ms...`);
          await sleep(waitTime);
          continue;
        }
        throw new Error(
          `API Error: ${error.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      if (
        attempt < retries - 1 &&
        (error.name === "TypeError" ||
          error.message.includes("Failed to fetch"))
      ) {
        await sleep(2000);
        continue;
      }
      throw error;
    }
  }
}

export const AnalysisPrompts = {
  technical: (market: string, stock: string, date: string, depth: number) =>
    `作為技術分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）。
請提供：1. 技術指標分析 2. 價格趨勢 3. 支撐壓力位 4. 量價關係 5. 買賣建議
深度等級：${depth}/5
請在回應末尾提供一個技術面評分（1-10分）。`,

  fundamental: (market: string, stock: string, date: string, depth: number) =>
    `作為基本面分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）。
請提供：1. 財務狀況 2. 成長性評估 3. 估值分析 4. 產業地位 5. 投資評價
深度等級：${depth}/5
請在回應末尾提供一個基本面評分（1-10分）。`,

  news: (market: string, stock: string, date: string, depth: number) =>
    `作為新聞分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）的相關新聞。
請提供：1. 重大新聞事件 2. 新聞影響評估 3. 政策面影響 4. 產業趨勢 5. 綜合評價
深度等級：${depth}/5`,

  sentiment: (market: string, stock: string, date: string, depth: number) =>
    `作為市場情緒分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）的市場情緒。
請提供：1. 社群情緒 2. 投資者情緒指標 3. 機構動向 4. 市場恐慌/貪婪程度 5. 綜合評價
深度等級：${depth}/5
請在回應末尾提供一個情緒面評分（1-10分）。`,

  debate: (
    results: string,
    market: string,
    stock: string,
    type: "bull" | "bear",
  ) =>
    `作為${type === "bull" ? "多頭" : "空頭"}分析師，基於以下分析，提出 ${market} ${stock} 的${type === "bull" ? "看多" : "看空"}論點：\n${results}`,

  risk: (data: string) =>
    `作為風險管理團隊，評估以下投資的風險：\n${data}
請提供：1. 風險評分（0-100） 2. 主要風險因素 3. 風險控制建議 4. 倉位配置建議`,

  decision: (market: string, stock: string, data: string) =>
    `作為投資組合經理，基於所有分析做出最終決策：
市場：${market}，股票：${stock}
分析：${data}

請提供JSON格式的決策（包含在回應中）：
{
  "recommendation": "買入/持有/賣出",
  "confidence": 85,
  "confidenceChange": 10,
  "riskScore": 45,
  "riskChange": -5,
  "targetPrice": "$XXX.XX",
  "reasoning": "詳細理由..."
}`,
};
