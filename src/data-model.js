export const schemaFields = [
  ["姓名", "投稿者或評分者名稱"],
  ["內容標題", "影片、文章或筆記標題"],
  ["內容連結", "YouTube、IG、TikTok、Threads、文章網址"],
  ["內容類型", "影片連結、文章連結、逐字稿、截圖摘要、手動筆記"],
  ["我覺得它有料的原因", "投稿者的主觀判斷，之後精修會用到"],
  ["補充摘要或逐字稿", "可貼重點段落，或用檔案上傳補充"],
  ["建議分類", "Hook、人設、說故事、銷售轉化等"],
  ["是否願意被精修示範", "方便明天現場拿來示範"],
  ["檔案上傳", "圖片、PDF、逐字稿，建議用 Google Form 上傳到 Drive"]
];

export const statusLabels = {
  pending: "待評分",
  refining: "高分精修",
  extracted: "已萃取"
};

export function makeId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createItem(input) {
  return {
    id: makeId(),
    title: input.title,
    url: input.url || "",
    type: input.type,
    author: input.author,
    reason: input.reason,
    notes: input.notes || "",
    sourceFileName: input.sourceFileName || "",
    sourceFileUrl: input.sourceFileUrl || "",
    categories: input.categories || [],
    tags: input.tags || [],
    ratings: input.ratings || [],
    extracted: Boolean(input.extracted),
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
