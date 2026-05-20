import { GOOGLE_SHEET_WEB_APP_URL } from "./config.js";
import { averageScore, itemStatus } from "./rating.js";

export function isGoogleSheetSyncEnabled() {
  return Boolean(GOOGLE_SHEET_WEB_APP_URL && GOOGLE_SHEET_WEB_APP_URL.includes("script.google.com"));
}

export async function syncItemToGoogleSheet(item) {
  if (!isGoogleSheetSyncEnabled()) return { skipped: true };

  const params = new URLSearchParams({
    action: "save_item",
    timestamp: new Date().toISOString(),
    name: item.author || "",
    title: item.title || "",
    url: item.url || "",
    type: item.type || "",
    reason: item.reason || "",
    notes: item.notes || "",
    suggested_categories: "",
    allow_demo: "",
    file_urls: item.sourceFileUrl || item.sourceFileName || "",
    system_categories: (item.categories || []).join(" / "),
    tags: (item.tags || []).join(" / "),
    average_score: averageScore(item).toFixed(2),
    rating_count: String(item.ratings?.length || 0),
    status: itemStatus(item),
    extracted: item.extracted ? "yes" : "no",
    created_at: item.createdAt || "",
    updated_at: item.updatedAt || ""
  });

  await fetch(`${GOOGLE_SHEET_WEB_APP_URL}?${params.toString()}`, {
    method: "GET",
    mode: "no-cors"
  });

  return { skipped: false };
}

export async function syncRatingToGoogleSheet(item, rating) {
  if (!isGoogleSheetSyncEnabled()) return { skipped: true };

  const params = new URLSearchParams({
    action: "save_rating",
    timestamp: new Date().toISOString(),
    item_id: item.id || "",
    title: item.title || "",
    created_by: rating.createdBy || "",
    useful: String(rating.useful || ""),
    copy: String(rating.copy || ""),
    insight: String(rating.insight || ""),
    convert: String(rating.convert || ""),
    fit: String(rating.fit || ""),
    average_score: averageScore(item).toFixed(2),
    comment: rating.comment || "",
    created_at: rating.createdAt || ""
  });

  await fetch(`${GOOGLE_SHEET_WEB_APP_URL}?${params.toString()}`, {
    method: "GET",
    mode: "no-cors"
  });

  return { skipped: false };
}
