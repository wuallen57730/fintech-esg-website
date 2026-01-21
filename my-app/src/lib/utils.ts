import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatContent(text: string) {
  if (!text) return "<p>暫無數據</p>";

  // Remove markdown code blocks
  let formatted = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");

  // Headers
  formatted = formatted.replace(
    /^####\s+(.+)$/gm,
    '<h4 class="text-blue-600 mt-5 mb-2 font-bold text-lg">$1</h4>',
  );
  formatted = formatted.replace(
    /^###\s+(.+)$/gm,
    '<h3 class="text-blue-700 mt-5 mb-2 font-bold text-xl">$1</h3>',
  );
  formatted = formatted.replace(
    /^##\s+(.+)$/gm,
    '<h2 class="text-blue-800 mt-5 mb-2 font-bold text-2xl">$1</h2>',
  );
  formatted = formatted.replace(
    /^#\s+(.+)$/gm,
    '<h1 class="text-blue-900 mt-5 mb-2 font-bold text-3xl">$1</h1>',
  );

  // Bold
  formatted = formatted.replace(
    /\*\*([^\*]+)\*\*/g,
    '<strong class="text-blue-600 font-semibold">$1</strong>',
  );

  // Lists
  formatted = formatted.replace(
    /^(\d+)\.\s+(.+)$/gm,
    '<div class="ml-5 mb-2 flex"><span class="mr-2">$1.</span><span>$2</span></div>',
  );
  formatted = formatted.replace(
    /^[-*]\s+(.+)$/gm,
    '<div class="ml-5 mb-2 flex"><span class="mr-2">•</span><span>$1</span></div>',
  );

  return formatted;
}

export function extractScore(text: string): number {
  if (!text || typeof text !== "string") return 5;

  const patterns = [
    /評分[：:]\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*[\/\/]10/,
    /(\d+(?:\.\d+)?)\s*分/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseFloat(match[1]);
      if (score >= 1 && score <= 10) return score;
    }
  }
  return 5;
}
