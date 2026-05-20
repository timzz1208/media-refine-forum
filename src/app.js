import { categoryRules, classify, inferTags } from "./classifier.js";
import { createItem, schemaFields } from "./data-model.js";
import { buildExtraction } from "./refine.js";
import { fetchItemsFromSheet, isGoogleSheetSyncEnabled, syncItemToGoogleSheet, syncRatingToGoogleSheet, uploadFileToDrive } from "./google-sheet-sync.js";
import { averageScore, itemStatus, toFixedScore } from "./rating.js";
import { clearItems, downloadText, exportCsv, exportJson, loadItems, readJsonFile, saveItems } from "./storage.js";

let items = loadItems();
let selectedRefineId = null;

const el = id => document.getElementById(id);

const ADMIN_PASSWORD = "polo114477";
const ADMIN_STORAGE_KEY = "mrf.admin";

function isAdmin() {
  try {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function applyAdminState() {
  const on = isAdmin();
  document.body.dataset.admin = on ? "true" : "false";
  const label = el("adminToggleLabel");
  if (label) label.textContent = on ? "管理者模式 · 登出" : "管理者登入";
  if (!on && document.querySelector(".nav-btn.active[data-admin-only]")) {
    setView("submit");
  }
}

function handleAdminToggle() {
  if (isAdmin()) {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    applyAdminState();
    toast("已登出管理者模式。");
    return;
  }
  const input = prompt("請輸入管理者密碼");
  if (input === null) return;
  if (input === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_STORAGE_KEY, "1");
    applyAdminState();
    toast("已進入管理者模式。");
  } else {
    toast("密碼錯誤。");
  }
}

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

// 頭像配色 hash —— 同名永遠同色
const AVATAR_PALETTES = [
  ["#ef6c4d", "#ffb088"],
  ["#5ec79a", "#a7e6c4"],
  ["#f5a623", "#ffd584"],
  ["#8b5a8c", "#d4a3d5"],
  ["#4a90c9", "#88c0e8"],
  ["#e85a8c", "#ffa3c2"],
  ["#7c9c5c", "#c2db9c"],
  ["#d97757", "#f0a884"]
];
function hashName(name) {
  if (!name) return AVATAR_PALETTES[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTES[h % AVATAR_PALETTES.length];
}
function paintAvatars(root = document) {
  root.querySelectorAll("[data-name]").forEach(node => {
    const [c1, c2] = hashName(node.dataset.name);
    node.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
  });
}
function avatarLetter(name) {
  const trimmed = String(name || "").trim();
  return trimmed ? trimmed[0] : "?";
}

// stat 數字平滑跳動
function animateNumber(node, target) {
  const start = Number(node.textContent) || 0;
  if (start === target) {
    node.textContent = target;
    return;
  }
  const duration = 700;
  const t0 = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    node.textContent = Math.round(start + (target - start) * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// 輸入框 placeholder 輪播（不打斷使用者打字）
function setupPlaceholderRotation() {
  document.querySelectorAll("[data-rotate-placeholder]").forEach(node => {
    let list;
    try { list = JSON.parse(node.dataset.rotatePlaceholder); } catch { return; }
    if (!Array.isArray(list) || !list.length) return;
    let i = 0;
    node.placeholder = list[0];
    setInterval(() => {
      if (document.activeElement === node || node.value) return;
      i = (i + 1) % list.length;
      node.placeholder = list[i];
    }, 4000);
  });
}

// 送出後彩屑慶祝
function fireConfetti() {
  const host = el("confettiHost");
  if (!host) return;
  const colors = ["#ef6c4d", "#ffb088", "#5ec79a", "#f5a623", "#8b5a8c", "#e85a8c"];
  const count = 60;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    const size = 6 + Math.random() * 8;
    const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
    const startY = window.innerHeight / 2;
    const angle = Math.random() * Math.PI * 2;
    const velocity = 220 + Math.random() * 280;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 200;
    const rot = (Math.random() - 0.5) * 720;
    const dur = 900 + Math.random() * 700;
    piece.style.cssText = `
      position: absolute;
      left: ${startX}px; top: ${startY}px;
      width: ${size}px; height: ${size * 1.4}px;
      background: ${colors[i % colors.length]};
      border-radius: 2px;
      will-change: transform, opacity;
      transition: transform ${dur}ms cubic-bezier(.2,.6,.4,1), opacity ${dur}ms ease-out;
    `;
    host.appendChild(piece);
    requestAnimationFrame(() => {
      piece.style.transform = `translate(${dx}px, ${dy + 600}px) rotate(${rot}deg)`;
      piece.style.opacity = "0";
    });
    setTimeout(() => piece.remove(), dur + 100);
  }
}

function persist() {
  saveItems(items);
  renderAll();
}

function renderStats() {
  animateNumber(el("statTotal"), items.length);
  animateNumber(el("statRated"), items.filter(item => item.ratings.length).length);
  animateNumber(el("statHot"), items.filter(item => averageScore(item) >= 4).length);
  animateNumber(el("statExtracted"), items.filter(item => item.extracted).length);
}

function renderHotBanner() {
  const banner = el("hotBanner");
  if (!banner) return;
  const rated = items
    .filter(item => item.ratings.length)
    .map(item => ({ item, score: averageScore(item) }))
    .sort((a, b) => b.score - a.score);
  const top = rated[0];
  if (!top || top.score < 4) {
    banner.style.display = "none";
    return;
  }
  banner.style.display = "grid";
  el("hotBannerText").innerHTML =
    `「${escapeHtml(top.item.title)}」拿到 <em>${toFixedScore(top.score)} 分</em> · 投稿者：${escapeHtml(top.item.author || "匿名")}`;
}

function renderRecentActive() {
  const wrap = el("recentActive");
  const list = el("recentList");
  if (!wrap || !list) return;

  const events = [];
  for (const item of items) {
    if (item.author) {
      events.push({
        name: item.author,
        when: item.createdAt || item.updatedAt || "",
        action: "投了 1 則"
      });
    }
    for (const r of item.ratings || []) {
      if (r.createdBy) {
        events.push({
          name: r.createdBy,
          when: r.createdAt || "",
          action: "評分 1 則"
        });
      }
    }
  }
  events.sort((a, b) => (b.when || "").localeCompare(a.when || ""));

  const seen = new Map();
  for (const ev of events) {
    if (seen.has(ev.name)) continue;
    seen.set(ev.name, ev);
    if (seen.size >= 4) break;
  }

  if (seen.size === 0) {
    wrap.style.display = "none";
    return;
  }

  wrap.style.display = "block";
  list.innerHTML = [...seen.values()]
    .map(ev => `
      <div class="recent-item">
        <div class="mini-avatar" data-name="${escapeHtml(ev.name)}">${escapeHtml(avatarLetter(ev.name))}</div>
        <div class="recent-text">
          <div class="recent-name">${escapeHtml(ev.name)}</div>
          <div class="recent-action">${escapeHtml(ev.action)}</div>
        </div>
      </div>
    `).join("");
  paintAvatars(list);
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
        <div class="avatar" data-name="${escapeHtml(item.author || "匿名")}">${escapeHtml(avatarLetter(item.author))}</div>
        <div class="item-title-block">
          <h3 class="item-title">${escapeHtml(item.title)}</h3>
          <div class="item-meta">
            <span>${escapeHtml(item.type)}</span>
            <span>投稿者：${escapeHtml(item.author || "匿名")}</span>
            <span>${new Date(item.createdAt).toLocaleDateString("zh-TW")}</span>
            ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">開啟來源</a>` : ""}
            ${(item.sourceFileUrls || []).map((u, i) => `<a href="${escapeHtml(u)}" target="_blank" rel="noreferrer">附件 ${i + 1}</a>`).join("")}
            ${(!item.sourceFileUrls || !item.sourceFileUrls.length) && item.sourceFileName ? `<span>檔案：${escapeHtml(item.sourceFileName)}</span>` : ""}
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
  const node = el("poolList");
  node.innerHTML = list.length
    ? list.map(cardHtml).join("")
    : `<div class="empty" data-icon="🌱">同學會剛開張，還沒有符合條件的內容～</div>`;
  paintAvatars(node);
}

function renderRateSelect() {
  el("rateSelect").innerHTML = items.length
    ? items.map(item => `<option value="${item.id}">${escapeHtml(item.title)}</option>`).join("")
    : `<option value="">尚無內容可評分</option>`;
  renderRatePreview();
}

function renderRatePreview() {
  const item = items.find(entry => entry.id === el("rateSelect").value);
  const node = el("ratePreview");
  node.innerHTML = item ? cardHtml(item) : `<div class="empty" data-icon="✏️">請先建立內容卡，再回來評分。</div>`;
  paintAvatars(node);
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
    : `<div class="empty" data-icon="☕">還沒有 4 分以上的高分內容，先去評分區看看其他人的投稿吧～</div>`;

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
  renderHotBanner();
  renderRecentActive();
}

let lastAutoRefresh = 0;
function maybeAutoRefresh(view) {
  if (view !== "pool" && view !== "rate") return;
  if (!isGoogleSheetSyncEnabled()) return;
  const now = Date.now();
  if (now - lastAutoRefresh < 8000) return;
  lastAutoRefresh = now;
  refreshFromSheet({ silent: true });
}

function setView(view) {
  document.querySelectorAll(".section").forEach(section => section.classList.toggle("active", section.id === view));
  document.querySelectorAll(".nav-btn").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  el("viewTitle").textContent = viewCopy[view][0];
  el("viewIntro").textContent = viewCopy[view][1];
  renderAll();
  maybeAutoRefresh(view);
}

function rowToItem(row) {
  const fileUrlsRaw = String(row.file_urls || "").trim();
  const parts = fileUrlsRaw.split(/\s*,\s*/).filter(Boolean);
  const fileUrls = parts.filter(p => /^https?:\/\//i.test(p));
  const nonUrlNames = parts.filter(p => !/^https?:\/\//i.test(p)).join(", ");

  const createdAt = String(row.created_at || row.timestamp || new Date().toISOString());
  const updatedAt = String(row.updated_at || createdAt);

  const ratings = (row.ratings || []).map(r => ({
    useful: Number(r.useful) || 0,
    copy: Number(r.copy) || 0,
    insight: Number(r.insight) || 0,
    convert: Number(r.convert) || 0,
    fit: Number(r.fit) || 0,
    createdBy: String(r.created_by || ""),
    comment: String(r.comment || ""),
    createdAt: String(r.created_at || r.timestamp || "")
  }));

  return {
    id: createdAt,
    title: String(row.title || ""),
    url: String(row.url || ""),
    type: String(row.type || ""),
    author: String(row.name || ""),
    reason: String(row.reason || ""),
    notes: String(row.notes || ""),
    sourceFileName: nonUrlNames,
    sourceFileUrl: "",
    sourceFileUrls: fileUrls,
    categories: String(row.system_categories || "").split(/\s*\/\s*/).filter(Boolean),
    tags: String(row.tags || "").split(/\s*\/\s*/).filter(Boolean),
    ratings,
    extracted: String(row.extracted || "").toLowerCase() === "yes",
    createdAt,
    updatedAt
  };
}

let isRefreshing = false;
async function refreshFromSheet({ silent = false } = {}) {
  if (!isGoogleSheetSyncEnabled() || isRefreshing) return;
  isRefreshing = true;
  const refreshBtn = el("refreshBtn");
  if (refreshBtn) refreshBtn.disabled = true;
  try {
    const { items: rows, skipped } = await fetchItemsFromSheet();
    if (skipped) return;
    items = rows
      .map(rowToItem)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    saveItems(items);
    renderAll();
    if (!silent) toast(`已從雲端同步 ${items.length} 筆內容。`);
  } catch (err) {
    console.error("refresh from sheet failed", err);
    if (!silent) toast("從雲端讀取失敗：" + (err.message || "未知錯誤"));
  } finally {
    isRefreshing = false;
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

function isTextFile(file) {
  if (!file) return false;
  return file.type.startsWith("text/") || /\.(txt|md)$/i.test(file.name);
}

function readTextFile(file) {
  return new Promise(resolve => {
    if (!isTextFile(file)) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

async function processSubmitFiles(files) {
  const textParts = [];
  const fileNames = [];
  const fileUrls = [];
  const uploadErrors = [];

  for (const file of files) {
    fileNames.push(file.name);
    if (isTextFile(file)) {
      const text = await readTextFile(file);
      if (text) textParts.push(text);
      continue;
    }
    if (!isGoogleSheetSyncEnabled()) {
      continue;
    }
    try {
      const result = await uploadFileToDrive(file);
      if (result && result.url) fileUrls.push(result.url);
    } catch (err) {
      uploadErrors.push(file.name);
      console.error("upload failed", file.name, err);
    }
  }

  return { textParts, fileNames, fileUrls, uploadErrors };
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
    const files = Array.from(el("fileInput").files || []);
    if (files.length) toast(`處理 ${files.length} 個檔案中…`);
    const { textParts, fileNames, fileUrls, uploadErrors } = await processSubmitFiles(files);
    if (uploadErrors.length) {
      toast(`下列檔案上傳失敗：${uploadErrors.join("、")}`);
    }
    const base = {
      title: el("titleInput").value.trim(),
      url: el("urlInput").value.trim(),
      type: el("typeInput").value,
      author: el("authorInput").value.trim(),
      reason: el("reasonInput").value.trim(),
      notes: [el("notesInput").value.trim(), ...textParts].filter(Boolean).join("\n\n"),
      sourceFileName: fileNames.join(", "),
      sourceFileUrls: fileUrls
    };
    const categories = classify(`${base.title} ${base.reason} ${base.notes}`);
    const item = createItem({ ...base, categories, tags: inferTags(base) });
    items.unshift(item);
    saveItems(items);
    syncItemToGoogleSheet(item).then(result => {
      if (!result.skipped) toast("內容卡已同步到 Google Sheet。");
    }).catch(() => toast("本機已保存，但 Google Sheet 同步失敗。"));
    event.target.reset();
    fireConfetti();
    toast(`🎉 投稿成功！${fileUrls.length ? `已上傳 ${fileUrls.length} 個檔案到 Drive。` : "你是同學會第 " + items.length + " 則投稿。"}`);
    setView("pool");
  });

  el("ratingForm").addEventListener("submit", event => {
    event.preventDefault();
    const item = items.find(entry => entry.id === el("rateSelect").value);
    if (!item) {
      toast("目前沒有可評分的內容。");
      return;
    }
    const rating = isAdmin()
      ? {
          useful: Number(el("scoreUseful").value),
          copy: Number(el("scoreCopy").value),
          insight: Number(el("scoreInsight").value),
          convert: Number(el("scoreConvert").value),
          fit: Number(el("scoreFit").value)
        }
      : (() => {
          const v = Number(el("scoreSimple").value);
          return { useful: v, copy: v, insight: v, convert: v, fit: v };
        })();
    Object.assign(rating, {
      createdBy: el("ratingBy").value.trim() || "匿名",
      comment: el("ratingComment").value.trim(),
      createdAt: new Date().toISOString()
    });
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

  el("adminToggle").addEventListener("click", handleAdminToggle);
  const refreshBtn = el("refreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", () => refreshFromSheet());
  const hotCta = el("hotBannerCta");
  if (hotCta) hotCta.addEventListener("click", () => setView("pool"));
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
    if (!isAdmin()) {
      toast("僅管理者可清空本機資料。");
      return;
    }
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
applyAdminState();
setupPlaceholderRotation();
renderAll();
console.info(syncLabel());
refreshFromSheet({ silent: true });
