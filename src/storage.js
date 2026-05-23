const STORAGE_KEY = "media_refine_forum_items_v2";
const LEGACY_KEY = "media_refine_forum_items_v1";
const FEEDBACK_KEY = "media_refine_forum_feedback_v1";

export function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function clearItems() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEY);
}

export function loadFeedback() {
  const raw = localStorage.getItem(FEEDBACK_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveFeedback(list) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
}

export function downloadText(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportJson(items) {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadText(`自媒體精修論壇-${stamp}.json`, JSON.stringify(items, null, 2), "application/json;charset=utf-8");
}

export function exportCsv(items, averageScore, itemStatus) {
  const headers = [
    "id", "title", "url", "type", "author", "reason", "notes", "sourceFileName",
    "categories", "tags", "averageScore", "ratingCount", "status", "extracted", "createdAt", "updatedAt"
  ];
  const rows = items.map(item => [
    item.id,
    item.title,
    item.url,
    item.type,
    item.author,
    item.reason,
    item.notes,
    item.sourceFileName,
    item.categories.join(" / "),
    item.tags.join(" / "),
    averageScore(item).toFixed(2),
    item.ratings.length,
    itemStatus(item),
    item.extracted ? "yes" : "no",
    item.createdAt,
    item.updatedAt
  ]);
  const csv = [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  downloadText(`自媒體精修論壇-表格-${stamp}.csv`, `\ufeff${csv}`, "text/csv;charset=utf-8");
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result || "[]")));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}
