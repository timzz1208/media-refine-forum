# 自媒體精修論壇 LOG

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
