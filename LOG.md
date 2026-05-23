# 自媒體精修論壇 LOG

## 2026-05-23

### 今日完成 — Layer 1「超低摩擦擷取」改造

收到兩篇關於系統架構演化與營運方向的反饋文章，把產品定位從「群體內容 intelligence」砍回真正眼前的問題：**讓投稿變成自然行為**。先停掉 AI / 爬蟲 / 情緒模型構想，集中火力在「丟進來爽不爽」。

- **首頁從表單改為靈感牆**
  - 預設打開的頁面從「投稿」(submit) 切到「靈感牆」(pool)
  - 側欄導覽改名：`投稿` → `詳細投稿`、`內容池` → `靈感牆`
  - 標題與導文改為社群口吻
  - 改檔：`index.html`（active section、nav-btn 文字、viewTitle/viewIntro）

- **閃投欄（quick submit bar）**
  - 靈感牆最頂部加入一個常駐閃投區塊：1 個輸入框 + 1 個感想欄 + 5 個情緒按鈕 + 送出
  - 自動辨識輸入是 URL 還是標題；URL 自動判斷類型（YouTube / TikTok / IG / 文章）
  - 5 個情緒選項：🤯 震撼 / 😭 共鳴 / 🔥 想模仿 / 😂 好笑 / 📌 想收藏（可複選 toggle）
  - 至少有「情緒」或「一句話感想」其中一項才允許送出
  - 送出後重用現有 `createItem` / `saveItems` / `syncItemToGoogleSheet` / `fireConfetti` 管線
  - Enter 鍵直接送出
  - 改檔：`index.html`、`src/app.js`（`handleQuickSubmit`、`EMOTION_MAP`、事件綁定）

- **作者名只問一次**
  - 新 localStorage key `mrf.author`：第一次投稿時 `prompt` 問名字並記住
  - 之後所有閃投不再要求填寫
  - 詳細投稿表單和評分表單也會自動帶入儲存的名字
  - 閃投欄右側「換名字」按鈕可隨時修改
  - 改檔：`src/app.js`（`getStoredAuthor` / `setStoredAuthor` / `ensureAuthor` / `updateAuthorHint`）

- **情緒標籤完整接入 schema**
  - `data-model.js`：`createItem` 新增 `emotionTags: []` 欄位
  - `cardHtml`：卡片顯示彩色情緒徽章（5 色配對 plum/blue/coral/amber/mint）
  - `google-sheet-sync.js`：`syncItemToGoogleSheet` 新增 `emotion_tags` 欄位（逗號分隔）
  - `rowToItem`：從 Sheet 回讀時解析 `emotion_tags` 欄
  - 改檔：`src/data-model.js`、`src/app.js`、`src/google-sheet-sync.js`

- **樣式**：在 `assets/styles.css` 加入閃投區塊、情緒按鈕、情緒徽章樣式，含 620px 以下 mobile 響應

- **語法驗證**：三個改動的 JS 檔 `node --check` 通過

### 今日判斷

- 第一輪計畫想做 P0~P3（閃投 → 情緒 schema → Claude API → 趨勢雷達），第二篇文章敲醒：MVP 任務不是證明世界觀，是證明「真的有人會自然丟內容」。砍掉 P2 / P3，只做 P0 + P1 的最小版本
- AI 分析、Hook 拆解、自動雷達全 defer，等實際有內容流動再說（「那時候 AI 才有東西可吃」）
- 系統定位從「ERP / 管理系統」明確切換為「靈感社群」——首頁要看到內容流，不是看到欄位
- 既有 9 欄位詳細表單沒刪，留給想填細節的人，但已從預設動線退場
- 下一步不是寫程式，是「親自當第一個瘋狂使用的人」：每天丟 3 篇 + 標情緒

### 今日完成 — 意見回饋區（同日追加）

用戶要求加一個「使用者反饋區」可上傳截圖 + 管理者回覆。

- **新分頁「意見回饋」**：放在「評分」後面，所有人可見
- **任何人都可投反饋**：文字（必填）+ 截圖（選填，重用既有 `uploadFileToDrive` 上傳到 Drive）
- **只有管理者能回覆**：reply form 用 `data-admin-only`，登入管理者模式後才出現
- **時間顯示**：新增 `timeAgo()` 函式（剛剛 / 分鐘前 / 小時前 / 天前 / 日期）
- **資料**：新 localStorage key `media_refine_forum_feedback_v1`，schema `{ id, author, text, screenshotUrl, screenshotName, createdAt, replies: [{author, text, createdAt}] }`
- **Sheet 同步**（前端已寫，後端 Apps Script 需新增 actions 才會真寫入）：
  - `syncFeedbackToSheet` — `action=save_feedback`
  - `syncFeedbackReplyToSheet` — `action=save_feedback_reply`
  - `fetchFeedbackFromSheet` — `action=list_feedback`（fetch 失敗會靜默 fallback 到 localStorage）
- **進入 feedback 分頁時自動拉取**：8 秒節流
- **改檔**：
  - `src/storage.js`：`loadFeedback` / `saveFeedback` + `FEEDBACK_KEY`
  - `src/google-sheet-sync.js`：三個 feedback sync 函式
  - `src/app.js`：`feedbacks` state、`renderFeedback` / `feedbackCardHtml` / `timeAgo` / `handleFeedbackSubmit` / `handleFeedbackReply` / `refreshFeedbackFromSheet`、`viewCopy.feedback`、bind feedback form、`maybeAutoRefresh` 擴充
  - `index.html`：新 nav button + `<section id="feedback">`
  - `assets/styles.css`：feedback-card / feedback-reply / feedback-screenshot 等樣式
- **語法**：三個改動 JS 檔 `node --check` 通過

### 今日完成 — 後端 Apps Script 接通（同日追加，clasp 串接）

裝 `@google/clasp` 串接 Apps Script，把後端缺的 actions 一次補齊：

- **安裝 clasp v3.3.0** 並用 `timzz1208usa@gmail.com` 登入 OAuth
- **Clone Apps Script** 到專案內 `apps-script/` 子資料夾（兩個檔：`程式碼.js`、`appsscript.json`），未來這層也跟著 git 版控
- **修改 `apps-script/程式碼.js`**：
  - `ITEM_HEADERS` 尾端加 `emotion_tags`（放尾端而非中間，避免跟既有資料錯位）
  - 新增常數 `FEEDBACK_SHEET_NAME` / `FEEDBACK_REPLY_SHEET_NAME` / `FEEDBACK_HEADERS` / `FEEDBACK_REPLY_HEADERS`
  - `doGet` 加三個 action：`save_feedback` / `save_feedback_reply` / `list_feedback`
  - `doPost` 加 `list_feedback`
  - 新增 `listFeedback_()` 函式（join 意見回饋與反饋回覆兩張表回傳巢狀結構）
  - 強化 `getOrCreateSheet_`：對既有 sheet 自動補上缺漏的 header 欄位（emotion_tags 不用人工到 sheet 補標題了）
- **`clasp push`** 程式碼上線
- **`clasp deploy -i AKfycbwGuuXCxmud6...`** 更新**既有** deployment（@3 → @4），URL 不變，前端 `src/config.js` 不用改
- **同步** `docs/google-apps-script-web-app.js` ← `apps-script/程式碼.js`，保持文件一致

### 今日判斷

- 用 clasp 比手動複製貼上強太多：Apps Script 進入 git 版控、改動可 `git revert`、未來改 backend 都能自動化
- Apps Script v3 部署用 `-i <deploymentId>` 更新既有部署，URL 與權限設定都保留，前端零改動
- 意見回饋的兩張新分頁不用人工建立 — `appendRow_` 第一次寫入會自動 `insertSheet` + 寫 headers + 凍結首行 + 加粗格式
- `emotion_tags` 放 `ITEM_HEADERS` 結尾（不是中間），避免既有 14 列資料被欄位偏移破壞

### 今日完成 — PWA + Web Share Target（同日追加）

用戶意識到團隊已經在 IG 群組自然分享內容了，問能不能把論壇接到那個現場行為。結論：IG DM 抓取技術上走不通（Meta 鎖死），但可以讓**搬運自己變得超輕**。

把論壇升級為 PWA 並註冊成 Android 系統分享目標，從 IG 看到神內容 → 分享 → 選「精修」→ 自動帶連結 → 送，整路 3 tap 完事。

- **`manifest.json`**：標準 PWA manifest + `share_target`（GET，吃 `title` / `text` / `url` 三個參數），名稱「自媒體精修論壇」、短名「精修」、theme color 珊瑚 `#ef6c4d`
- **`sw.js`**：最小 service worker（install + activate + 空 fetch handler）— Chrome 把網站視為可安裝 PWA 的必要條件
- **`icons/`**：用 PowerShell + `System.Drawing` 生成
  - `icon-192.png`（圓角珊瑚漸層 + 白色「精」字）
  - `icon-512.png`（同樣風格、大尺寸）
  - `icon-maskable.png`（滿版設計，符合 Android 自適應 icon 安全區規範）
- **`index.html`** 加 manifest 連結、theme-color、apple-touch-icon、apple/android web-app-capable meta；body 結尾註冊 service worker
- **`src/app.js`** 新增 `applyShareParams()`：頁面開啟時讀 `?url=...&text=...&title=...`，自動切到靈感牆、帶入閃投欄、focus 到感想欄、清掉網址列參數防重複觸發、跳 toast「從 IG 拉進來囉」
- **同檔內變更**：startup 流程在 `renderAll()` 後呼叫 `applyShareParams()`

### 為什麼選 PWA 而不是 IG 爬取

- Meta Instagram Messaging API 只給 Business 帳號回客服訊息用，**不能讀群組訊息**
- 群組訊息爬取會違反 ToS，封號風險
- 真正的解法：去行為發生的地方接得**更近**，而不是事後爬資料 — 讓論壇出現在 IG 的分享選單裡

### Android vs iPhone

- Samsung / Android：Chrome 或 Samsung Internet 開論壇 → 安裝 → 自動出現在系統分享選單（最佳體驗）
- iPhone：Safari「加入主畫面」可用，但 iOS 不支援 Web Share Target，要用 iOS Shortcuts 才能在分享選單看到，這個之後再補

### 待辦 / 後續

- 觀察實際使用：哪種內容最多人丟？哪種情緒最多？大家投完會不會回來？
- 等有真實流動後再考慮：AI 摘要、本週熱詞、Hook 分析、跨平台雷達
- 使用者操作行為追蹤（先前討論的 Option A）尚未實作，等基礎流動證實後再做
- iPhone 用戶的 iOS Shortcut JSON（給彥廷以外的 iPhone 同學會成員）

---

## 2026-05-21

### 今日完成

- 比較五個視覺風格方案，建立獨立預覽檔（不污染正式網站）：
  - `preview/A-quality.html`：質感升級（青藍工具感）
  - `preview/B-magazine.html`：雜誌編輯感（明體 + 卡其）
  - `preview/C-saas.html`：現代 SaaS（淺色側欄 + 紫）
  - `preview/D-creator-club.html`：創作者俱樂部（珊瑚 + 桃粉，**選定**）
  - `preview/E-studio-dark.html`：創作者深色工作室（暖黑 + 琥珀）
- D 方案套用 10 項互動細節:
  1. 卡片便利貼歪頭（hover 微旋）
  2. score 分數呼吸光暈
  3. stat 數字從 0 平滑跳動
  4. 輸入框 placeholder 每 4 秒輪播
  5. 標題下手繪波浪 SVG 底線
  6. 空狀態加人味文案（🌱 ☕ ✏️）
  7. 「本週最熱」漸層 banner
  8. 投稿送出後彩屑爆炸 + 慶祝 toast
  9. 頭像按名字 hash 配色（同名永遠同色）
  10. 側欄「最近活躍」4 人區塊
- 套用到正式網站:
  - 完整重寫 `assets/styles.css`（涵蓋全部 5 個分頁）
  - 更新 `index.html`：加入 Google Fonts、hot banner、squiggle SVG、最近活躍、confetti host
  - 更新 `src/app.js`：新增 avatar hash、count-up、placeholder 輪播、confetti、hot banner 與最近活躍渲染
  - **JS 核心功能完全保留**：投稿、評分、Google Sheet 同步、admin 模式、JSON/CSV 匯出、檔案上傳
- 建立 `IDEAS.md` 點子收件匣
- 把「貢獻者排行榜系統」完整構想存進 IDEAS.md（三個榜算法、獎勵機制、顯示位置、MVP 三步走、5 個待決策問題）
- commit `d403085` push 到 main
- GitHub Pages 自動重建完成，新版上線

### 今日判斷

- 原本的青藍工具感不適合「同學會」氛圍，應該走「創作者社群感」——溫暖、有頭像、有活動感
- 新點子優先進 `IDEAS.md`，不污染正在進行的工作；動工前再從 IDEAS 挑出來決策
- 本機預覽 ES modules 必須用 http server（`python -m http.server 8000`），file:// 協議會被 CORS 擋
- 部署方式確認是 **GitHub Pages**（`has_pages: true`，無 GitHub Actions、無 Netlify 設定檔），auto-build on push to main
- 排行榜系統不該直接動工，應該先決定演算法、獎勵、顯示位置、時間維度等設計問題
- 視覺方案要實機預覽才能判斷，文字描述難以決定——五個 preview 檔留著當未來改版參考
- 升級視覺時要小心保留所有既有 JS 功能（admin、Sheet 同步、檔案上傳），不能因為換 CSS 就破壞行為

### 已知限制

- 排行榜系統尚未實作（五個演算法／顯示問題未決策）
- 投稿者名字未正規化，「彥廷／Yan-Ting／彥廷 Tim」會被視為不同人，影響未來排行榜
- 沒有 favicon，瀏覽器分頁顯示空白圖示
- 沒有 OG meta，分享到 LINE / Threads 抓不到預覽圖與描述
- `hot-banner` 跟「最近活躍」側欄需要有資料才會顯示（沒投稿時自動隱藏）
- 手機版（< 980px）會自動關閉「最近活躍」區塊節省畫面

### 測試紀錄

- 本機 `http://localhost:8000/` 測試:
  - 五個分頁切換通過
  - stat 數字從 0 跳到目前值通過
  - 卡片 hover 歪頭通過
  - 投稿表單送出觸發彩屑 + 慶祝 toast 通過
  - 頭像按名字 hash 配色通過
- 線上 `https://timzz1208.github.io/media-refine-forum/` 部署驗證:
  - `index.html` 包含「👋 同學會原型」、`Plus+Jakarta`、`hot-banner`、`recent-active`
  - `assets/styles.css` 包含 `--coral`、`scorePulse`
  - GitHub Pages 自動重建成功

### 下一步建議

1. 給同學會實際試用，收集反饋
2. 若決定做排行榜，先回 IDEAS.md 把 5 個問題決策完，再進實作:
   - 投稿榜算法（推薦：總得分 = 張數 × 平均分）
   - 評分榜算法（推薦：評分次數 + 短評平均字數）
   - 顯示位置（推薦：新分頁 + 側欄 Top 3 雙軌）
   - 時間維度（推薦：本週 + 全時段兩個 tab）
   - 獎勵層次（推薦：先做徽章 + 解鎖功能）
3. 補 favicon 與 OG meta（分享到社群有預覽圖）
4. 投稿者欄位改下拉選單，避免名字漂移影響統計
5. `WORKLOG.md`（誤建）已刪除，未來工作紀錄一律寫在 `LOG.md`

### 待決策

- 排行榜系統的 5 個問題（算法、顯示、時間、獎勵）
- 投稿者欄位要不要鎖死選單
- 同學會試用後，視覺要不要再微調

---

## 2026-05-20

### 今日完成

- 將點子具象化為獨立產品專案：`自媒體精修論壇`。
- 建立第一版靜態網頁原型：`index.html`。
- 建立專案說明文件：`README.md`。
- 建立進度紀錄文件：`LOG.md`。
- 建立明日展示文件：`明日展示指南.md`。
- 建立展示啟動檔：`啟動展示伺服器.bat`，讓不熟悉指令的人也可以雙擊啟動手機展示環境。
- 建立展示停止檔：`停止展示伺服器.bat`，用於釋放 8000 連接埠。
- 建立 Google Sheets 表頭模板：`docs/google-sheets-template.csv`。
- 建立 GitHub Pages 上線指南：`docs/github-pages-deploy-guide.md`。
- 建立 Google Apps Script 後台程式：`docs/google-apps-script-web-app.js`。
- 建立 Google Apps Script 設定指南：`docs/google-apps-script-setup-guide.md`。
- 建立超重要但不緊急文件：`超重要但不緊急更新資訊.md`，記錄 API 濫用與正式公開前安全事項。
- 新增前端 Google Sheet 同步模組：`src/google-sheet-sync.js`。
- 新增後台網址設定檔：`src/config.js`。
- 完成明天展示流程自動化測試：
  - 手機尺寸 390x844：投稿、內容池、評分、精修、正式收件頁通過。
  - 桌面尺寸 1440x900：示範資料、內容池、精修輸出通過。
- 建立 Claude Code 交接文件：`CLAUDE_CODE_HANDOFF.md`。
- 已建立正式收件 Google Sheet：`https://docs.google.com/spreadsheets/d/1lqQoJonAZTC7gCk8SkMJ7nbh9NOyKnuE2SbfKJoaYj4/edit`
- 已將 Google Sheet 分頁改名為 `投稿資料`，寫入表頭，並凍結第一列。
- 在 `README.md` 補上白話版模組說明，讓沒有編程經驗的人也能理解每個檔案負責什麼。
- 完成四個主要頁面：
  - 投稿
  - 內容池
  - 評分
  - 精修
- 完成第一版資料流程：
  - 投稿內容卡
  - 連結與手動摘要輸入
  - 可選檔案欄位
  - 文字檔讀入摘要
  - 圖片與 PDF 先記錄檔名
  - 關鍵字分類
  - 五維度評分
  - 平均 4 分以上進入高分精修池
  - 精修輸出方法論、腳本、PPT 大綱、DEMO CLAUDE 筆記草稿
- 確認第一版 `localStorage` 只能當本機原型，不適合作為正式多人收件系統。

### 今日判斷

- 這個專案需要獨立資料夾，不應只放在 `自媒體同學會資料` 裡。
- 下一版應該升級成「你收得到」的版本。
- MVP 2.0 建議採用 `Google Sheets + Google Drive`：
  - Google Sheets 存投稿、分類、評分、狀態。
  - Google Drive 存圖片、PDF、逐字稿。
  - DEMO CLAUDE 接收沉澱後的方法論筆記。
- 目前 `index.html` 是單檔原型，後續需要拆成小單元，避免每次修改都要從頭讀整份檔案。
- 已將單檔原型拆成 HTML / CSS / JS 模組，後續可局部修改。
- 文件必須保留白話說明，不能只寫工程師術語，因為主要決策者需要能直接看懂每個部分的用途。
- 如果明天要給學員用手機操作，應定位為體驗版；正式收件建議先用 Google Form + Google Sheets，避免 localStorage 造成「你收不到」的問題。
- GitHub Pages 適合用來提供公開測試網址，但它仍然只是靜態網站，不能取代正式收件後端。
- 既有「開發日記網頁」能寫入 Google Sheet，是因為它有 Google Apps Script `/exec` 後台；自媒體精修論壇已補上同模式，但仍需手動部署 Apps Script 並填入網址。
- Apps Script `/exec` 若公開可能被濫用；明天展示可接受，正式公開前需加 token、欄位限制與審核機制。

### 已知限制

- 同學在自己電腦投稿，你目前收不到。
- `localStorage` 容量太小，不適合存圖片、PDF、影片或大量逐字稿。
- 圖片與 PDF 尚未真正上傳，只記錄檔名。
- 沒有會員系統、審核系統、雲端資料庫與檔案儲存。
- 目前可建立 Google Sheet，但沒有可用工具直接建立 Google Form；Google Form 需手動建立後連到已建立的 Sheet。
- 目前沒有可用工具直接部署 Google Apps Script Web App；已提供可貼上的 Apps Script 程式與設定指南。

### 測試紀錄

- 本機展示網址可開啟：`http://127.0.0.1:8000/`
- 手機同 Wi-Fi 測試網址：`http://192.168.31.164:8000/`
- 自動化測試結果：
  - 載入示範資料：通過
  - 內容池顯示內容卡：通過
  - 評分送出：通過
  - 高分精修池：通過
  - 萃取成方法庫：通過
  - 正式收件頁含 Google Form 說明：通過
  - 新增投稿內容卡：通過

### 下一步建議

1. 先重構檔案架構：
   - `assets/styles.css`
   - `src/app.js`
   - `src/storage.js`
   - `src/classifier.js`
   - `src/rating.js`
   - `src/refine.js`
   - 各頁 UI 模組
2. 加入 JSON 匯出 / 匯入，讓本機資料可以備份。
3. 設計 Google Sheets 表頭與 Google Drive 檔案存放規則。
4. 再開始串接正式收件流程。

### 待決策

- 正式使用時，要先用 Google Sheets + Google Drive，還是直接上 Supabase / Firebase？
- 同學投稿是否需要登入？
- 內容是否需要管理者審核後才進入內容池？
- 評分是否要記錄評分者姓名？
- 高分精修門檻是否維持平均 4 分，還是要加入「至少 3 人評分」？
