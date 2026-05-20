# 自媒體精修論壇 LOG

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
