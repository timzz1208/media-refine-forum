export const categoryRules = [
  { name: "Hook 開場", keywords: ["hook", "開場", "前三秒", "標題", "注意力", "停下來", "破題"], color: "hot" },
  { name: "人設定位", keywords: ["人設", "定位", "個人品牌", "角色", "受眾", "差異化"], color: "draft" },
  { name: "說故事", keywords: ["故事", "案例", "衝突", "轉折", "情緒", "經歷"], color: "" },
  { name: "銷售轉化", keywords: ["銷售", "成交", "私訊", "轉化", "名單", "CTA", "諮詢"], color: "ready" },
  { name: "知識型內容", keywords: ["知識", "教學", "框架", "方法", "步驟", "模型"], color: "" },
  { name: "情緒共鳴", keywords: ["共鳴", "痛點", "焦慮", "低潮", "渴望", "情緒"], color: "" },
  { name: "案例拆解", keywords: ["拆解", "分析", "復盤", "為什麼", "案例"], color: "draft" },
  { name: "短影音腳本", keywords: ["腳本", "reels", "短影音", "口播", "tiktok", "影片"], color: "hot" },
  { name: "PPT/教學素材", keywords: ["ppt", "簡報", "課程", "教材", "講義", "工作坊"], color: "ready" }
];

export function classify(text) {
  const source = text.toLowerCase();
  const matched = categoryRules
    .filter(rule => rule.keywords.some(keyword => source.includes(keyword.toLowerCase())))
    .map(rule => rule.name);
  const unique = [...new Set(matched)];
  return unique.length ? unique : ["知識型內容"];
}

export function inferTags(item) {
  const source = `${item.title} ${item.reason} ${item.notes}`.toLowerCase();
  const tags = [];
  if (source.includes("保險")) tags.push("保險業可用");
  if (source.includes("ig") || source.includes("reels")) tags.push("IG/Reels");
  if (source.includes("youtube")) tags.push("YouTube");
  if (source.includes("tiktok")) tags.push("TikTok");
  if (source.includes("ppt") || source.includes("簡報")) tags.push("可轉簡報");
  if (source.includes("私訊") || source.includes("成交")) tags.push("轉化素材");
  if (tags.length === 0) tags.push("待觀察");
  return tags;
}
