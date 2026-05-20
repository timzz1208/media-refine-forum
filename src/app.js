import { categoryRules, classify, inferTags } from "./classifier.js";
import { createItem, schemaFields } from "./data-model.js";
import { buildExtraction } from "./refine.js";
import { isGoogleSheetSyncEnabled, syncItemToGoogleSheet, syncRatingToGoogleSheet } from "./google-sheet-sync.js";
import { averageScore, itemStatus, toFixedScore } from "./rating.js";
import { clearItems, downloadText, exportCsv, exportJson, loadItems, readJsonFile, saveItems } from "./storage.js";

let items = loadItems();
let selectedRefineId = null;

const el = id => document.getElementById(id);

const viewCopy = {
  submit: ["投稿", "貼上影片或文章連結，補一句你覺得有料的原因，系統會先用文字線索自動分類。"],
  pool: ["內容池", "查看所有投稿，依分類、狀態、分數篩選，找出值得精修的內容。"],
  rate: ["評分", "用五個維度評估內容是否真的能被同學會拿來使用。"],
  refine: ["精修", "把高分內容萃取成方法論、腳本模板、PPT 大綱與 DEMO CLAUDE 筆記草稿。"],
  handoff: ["正式收件", "目前原型先跑流程；正式要收到學員投稿，建議用 Google Form + Google Sheets。"]
};

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(message) {
  const node = el("toast");
  node.textContent = message;
  node.classList.add("show");
  setTimeout(() => node.classList.remove("show"), 2200);
}

function persist() {
  saveItems(items);
  renderAll();
}

function renderStats() {
  el("statTotal").textContent = items.length;
  el("statRated").textContent = items.filter(item => item.ratings.length).length;
  el("statHot").textContent = items.filter(item => averageScore(item) >= 4).length;
  el("statExtracted").textContent = items.filter(item => item.extracted).length;
}

function syncLabel() {
  return isGoogleSheetSyncEnabled() ? "Google Sheet 同步已啟用" : "Google Sheet 同步未設定";
}

function renderLegend() {
  el("categoryLegend").innerHTML = categoryRules
    .map(rule => `<span class="pill ${rule.color}">${rule.name}</span>`)
    .join("");
}

function renderFilters() {
  const categories = ["全部分類", ...categoryRules.map(rule => rule.name)];
  el("categoryFilter").innerHTML = categories.map(value => `<option value="${value}">${value}</option>`).join("");

  const statuses = [["all", "全部狀態"], ["pending", "待評分"], ["refining", "高分精修"], ["extracted", "已萃取"]];
  el("statusFilter").innerHTML = statuses.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
}

function renderSchema() {
  el("schemaTable").innerHTML = schemaFields
    .map(([field, usage]) => `<tr><td>${escapeHtml(field)}</td><td>${escapeHtml(usage)}</td></tr>`)
    .join("");
}

function cardHtml(item) {
  const score = averageScore(item);
  const status = itemStatus(item);
  const statusClass = status === "refining" ? "ready" : status === "extracted" ? "hot" : "draft";
  const statusLabel = { pending: "待評分", refining: "高分精修", extracted: "已萃取" }[status];
  return `
    <article class="item-card">
      <div class="item-head">
        <div>
          <h3 class="item-title">${escapeHtml(item.title)}</h3>
          <div class="item-meta">
            <span>${escapeHtml(item.type)}</span>
            <span>投稿者：${escapeHtml(item.author)}</span>
            <span>${new Date(item.createdAt).toLocaleDateString("zh-TW")}</span>
            ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">開啟來源</a>` : ""}
            ${item.sourceFileName ? `<span>檔案：${escapeHtml(item.sourceFileName)}</span>` : ""}
          </div>
        </div>
        <div class="score">${score ? toFixedScore(score) : "--"}</div>
      </div>
      <p class="summary">${escapeHtml(item.reason)}</p>
      <div class="tags">
        <span class="pill ${statusClass}">${statusLabel}</span>
        ${item.categories.map(cat => `<span class="pill">${escapeHtml(cat)}</span>`).join("")}
        ${item.tags.map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}
      </div>
      ${item.ratings.length ? `<p class="summary">最新短評：${escapeHtml(item.ratings[item.ratings.length - 1].comment)}</p>` : ""}
    </article>
  `;
}

function filteredItems() {
  const keyword = el("searchInput").value.trim().toLowerCase();
  const category = el("categoryFilter").value || "全部分類";
  const status = el("statusFilter").value || "all";
  const scoreFilter = el("scoreFilter").value || "all";

  return items.filter(item => {
    const score = averageScore(item);
    const text = `${item.title} ${item.reason} ${item.notes} ${item.categories.join(" ")} ${item.tags.join(" ")}`.toLowerCase();
    const keywordOk = !keyword || text.includes(keyword);
    const categoryOk = category === "全部分類" || item.categories.includes(category);
    const statusOk = status === "all" || itemStatus(item) === status;
    const scoreOk =
      scoreFilter === "all" ||
      (scoreFilter === "hot" && score >= 4) ||
      (scoreFilter === "rated" && item.ratings.length) ||
      (scoreFilter === "unrated" && !item.ratings.length);
    return keywordOk && categoryOk && statusOk && scoreOk;
  });
}

function renderPool() {
  const list = filteredItems();
  el("poolList").innerHTML = list.length
    ? list.map(cardHtml).join("")
    : `<div class="empty">目前沒有符合條件的內容。</div>`;
}

function renderRateSelect() {
  el("rateSelect").innerHTML = items.length
    ? items.map(item => `<option value="${item.id}">${escapeHtml(item.title)}</option>`).join("")
    : `<option value="">尚無內容可評分</option>`;
  renderRatePreview();
}

function renderRatePreview() {
  const item = items.find(entry => entry.id === el("rateSelect").value);
  el("ratePreview").innerHTML = item ? cardHtml(item) : `<div class="empty">請先建立內容卡。</div>`;
}

function renderRefineList() {
  const hotItems = items.filter(item => averageScore(item) >= 4);
  if (!selectedRefineId && hotItems.length) selectedRefineId = hotItems[0].id;
  if (!hotItems.some(item => item.id === selectedRefineId)) selectedRefineId = hotItems[0]?.id || null;

  el("refineList").innerHTML = hotItems.length
    ? hotItems.map(item => `
        <button class="refine-item ${item.id === selectedRefineId ? "active" : ""}" data-refine-id="${item.id}">
          <strong>${escapeHtml(item.title)}</strong>
          <span>平均分 ${toFixedScore(averageScore(item))}｜${item.categories.map(escapeHtml).join("、")}</span>
        </button>
      `).join("")
    : `<div class="empty">尚無 4 分以上內容。</div>`;

  document.querySelectorAll("[data-refine-id]").forEach(button => {
    button.addEventListener("click", () => {
      selectedRefineId = button.dataset.refineId;
      renderRefineList();
      el("extractOutput").textContent = "已選取內容，按下「萃取成方法庫」產生精修稿。";
    });
  });
}

function renderAll() {
  renderStats();
  renderLegend();
  renderPool();
  renderRateSelect();
  renderRefineList();
}

function setView(view) {
  document.querySelectorAll(".section").forEach(section => section.classList.toggle("active", section.id === view));
  document.querySelectorAll(".nav-btn").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  el("viewTitle").textContent = viewCopy[view][0];
  el("viewIntro").textContent = viewCopy[view][1];
  renderAll();
}

function readTextFile(file) {
  return new Promise(resolve => {
    if (!file || (!file.type.startsWith("text/") && !file.name.match(/\.(txt|md)$/i))) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
}

function currentExtractionItem() {
  return items.find(entry => entry.id === selectedRefineId);
}

function seedDemo() {
  const demoItems = [
    {
      title: "三秒 Hook 拆解：先講反直覺，再給方法",
      url: "https://example.com/hook-video",
      type: "影片連結",
      author: "彥廷",
      reason: "這個短影音開場直接打破觀眾預設，很適合同學會練習短影音腳本與 Hook 開場。",
      notes: "重點是不要先自我介紹，而是先講觀眾在意的錯誤觀念，再用三步驟修正。",
      ratings: [{ useful: 5, copy: 5, insight: 4, convert: 4, fit: 5, createdBy: "示範", comment: "很適合保險業務員改成專業內容開場。", createdAt: new Date().toISOString() }]
    },
    {
      title: "把專業文章改成 Reels 腳本的方法",
      url: "https://example.com/article-to-reels",
      type: "文章連結",
      author: "同學會成員",
      reason: "它把知識型內容轉成短影音流程，適合做成 PPT 教材。",
      notes: "文章架構：問題、案例、框架、行動。可轉成課程講義。",
      ratings: [{ useful: 4, copy: 4, insight: 5, convert: 3, fit: 4, createdBy: "示範", comment: "適合沉澱成 DEMO CLAUDE 的概念條目。", createdAt: new Date().toISOString() }]
    }
  ].map(input => {
    const categories = classify(`${input.title} ${input.reason} ${input.notes}`);
    return createItem({ ...input, categories, tags: inferTags(input) });
  });
  items = [...demoItems, ...items];
  persist();
  toast("示範資料已載入。");
}

function bindEvents() {
  document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  ["searchInput", "categoryFilter", "statusFilter", "scoreFilter"].forEach(id => {
    el(id).addEventListener("input", renderPool);
    el(id).addEventListener("change", renderPool);
  });

  el("rateSelect").addEventListener("change", renderRatePreview);

  el("submitForm").addEventListener("submit", async event => {
    event.preventDefault();
    const file = el("fileInput").files[0];
    const fileText = await readTextFile(file);
    const base = {
      title: el("titleInput").value.trim(),
      url: el("urlInput").value.trim(),
      type: el("typeInput").value,
      author: el("authorInput").value.trim(),
      reason: el("reasonInput").value.trim(),
      notes: [el("notesInput").value.trim(), fileText].filter(Boolean).join("\n\n"),
      sourceFileName: file ? file.name : ""
    };
    const categories = classify(`${base.title} ${base.reason} ${base.notes}`);
    const item = createItem({ ...base, categories, tags: inferTags(base) });
    items.unshift(item);
    saveItems(items);
    syncItemToGoogleSheet(item).then(result => {
      if (!result.skipped) toast("內容卡已同步到 Google Sheet。");
    }).catch(() => toast("本機已保存，但 Google Sheet 同步失敗。"));
    event.target.reset();
    toast(`內容卡已建立，並完成初步分類。${isGoogleSheetSyncEnabled() ? "正在同步。" : ""}`);
    setView("pool");
  });

  el("ratingForm").addEventListener("submit", event => {
    event.preventDefault();
    const item = items.find(entry => entry.id === el("rateSelect").value);
    if (!item) {
      toast("目前沒有可評分的內容。");
      return;
    }
    const rating = {
      useful: Number(el("scoreUseful").value),
      copy: Number(el("scoreCopy").value),
      insight: Number(el("scoreInsight").value),
      convert: Number(el("scoreConvert").value),
      fit: Number(el("scoreFit").value),
      createdBy: el("ratingBy").value.trim() || "匿名",
      comment: el("ratingComment").value.trim(),
      createdAt: new Date().toISOString()
    };
    item.ratings.push(rating);
    item.updatedAt = new Date().toISOString();
    saveItems(items);
    syncRatingToGoogleSheet(item, rating).then(result => {
      if (!result.skipped) toast("評分已同步到 Google Sheet。");
    }).catch(() => toast("本機已保存，但 Google Sheet 評分同步失敗。"));
    el("ratingComment").value = "";
    toast(averageScore(item) >= 4 ? "評分完成，已進入高分精修池。" : "評分完成。");
    renderAll();
  });

  el("extractBtn").addEventListener("click", () => {
    const item = currentExtractionItem();
    if (!item) {
      toast("請先選擇高分內容。");
      return;
    }
    el("extractOutput").textContent = buildExtraction(item);
  });

  el("copyBtn").addEventListener("click", async () => {
    const text = el("extractOutput").textContent;
    if (!text || text.includes("請先")) {
      toast("目前沒有可複製的精修稿。");
      return;
    }
    await copyText(text);
    toast("精修稿已複製。");
  });

  el("downloadMdBtn").addEventListener("click", () => {
    const item = currentExtractionItem();
    const text = el("extractOutput").textContent;
    if (!item || !text || text.includes("請先")) {
      toast("目前沒有可下載的精修稿。");
      return;
    }
    downloadText(`${item.title.replace(/[\\/:*?"<>|]/g, "_")}.md`, text, "text/markdown;charset=utf-8");
  });

  el("markDoneBtn").addEventListener("click", () => {
    const item = currentExtractionItem();
    if (!item) {
      toast("請先選擇高分內容。");
      return;
    }
    item.extracted = true;
    item.updatedAt = new Date().toISOString();
    persist();
    toast("已標記為已萃取，可移入 DEMO CLAUDE。");
  });

  el("seedBtn").addEventListener("click", seedDemo);
  el("exportBtn").addEventListener("click", () => exportJson(items));
  el("csvBtn").addEventListener("click", () => exportCsv(items, averageScore, itemStatus));
  el("importBtn").addEventListener("click", () => el("importFile").click());
  el("importFile").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = await readJsonFile(file);
      if (!Array.isArray(imported)) throw new Error("JSON 必須是陣列");
      items = imported;
      saveItems(items);
      toast("JSON 已匯入。");
      renderAll();
    } catch {
      toast("匯入失敗，請確認檔案是本工具匯出的 JSON。");
    } finally {
      event.target.value = "";
    }
  });

  el("clearBtn").addEventListener("click", () => {
    if (!confirm("確定要清空本機資料？")) return;
    items = [];
    selectedRefineId = null;
    clearItems();
    el("extractOutput").textContent = "請先從左側選擇一筆高分內容。";
    toast("資料已清空。");
    renderAll();
  });
}

renderFilters();
renderSchema();
bindEvents();
renderAll();
console.info(syncLabel());
