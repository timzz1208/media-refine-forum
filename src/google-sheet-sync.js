import { GOOGLE_SHEET_WEB_APP_URL } from "./config.js";
import { averageScore, itemStatus } from "./rating.js";

export function isGoogleSheetSyncEnabled() {
  return Boolean(GOOGLE_SHEET_WEB_APP_URL && GOOGLE_SHEET_WEB_APP_URL.includes("script.google.com"));
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      resolve(dataUrl.split(",")[1] || "");
    };
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

export async function uploadFileToDrive(file) {
  if (!isGoogleSheetSyncEnabled()) {
    throw new Error("Google Sheet 同步未設定");
  }
  const data = await fileToBase64(file);
  const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "upload_file",
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      data
    })
  });
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
  const result = await response.json();
  if (!result.ok) {
    throw new Error(result.error || "upload failed");
  }
  return { url: result.url, id: result.id, name: result.name };
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
    file_urls: (item.sourceFileUrls && item.sourceFileUrls.length ? item.sourceFileUrls.join(", ") : (item.sourceFileUrl || item.sourceFileName || "")),
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
