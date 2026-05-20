# Claude Code 交接資料

## 專案一句話

`自媒體精修論壇` 是一個給自媒體同學會成員使用的投稿、分類、評分、精修工具。

目前已上線 GitHub Pages，並已串接 Google Apps Script，把投稿與評分寫入 Google Sheet。

## 目前狀態

### 本機路徑

```text
C:\彥廷資料庫\自媒體精修論壇
```

### GitHub Repo

```text
https://github.com/timzz1208/media-refine-forum
```

### GitHub Pages

```text
https://timzz1208.github.io/media-refine-forum/
```

### Google Sheet 後台

```text
https://docs.google.com/spreadsheets/d/1lqQoJonAZTC7gCk8SkMJ7nbh9NOyKnuE2SbfKJoaYj4/edit
```

### Google Apps Script Web App

```text
https://script.google.com/macros/s/AKfycbwGuuXCxmud6zslhXb-k7wSfasoUwulLLyueJ3gdyIMlSIdEbnuf4FBTnCm7sBOmiKb/exec
```

此網址已寫在：

```text
src/config.js
```

## 已完成

- 建立靜態網站原型。
- 拆分成可維護架構：
  - `index.html`：網頁骨架
  - `assets/styles.css`：樣式
  - `src/app.js`：前端總控
  - `src/storage.js`：localStorage、JSON/CSV 匯出入
  - `src/classifier.js`：分類規則
  - `src/rating.js`：評分計算
  - `src/refine.js`：精修輸出
  - `src/google-sheet-sync.js`：Google Sheet 同步
  - `src/config.js`：Apps Script URL 設定
- GitHub Pages 已上線。
- Apps Script 已部署。
- 投稿資料可寫入 Google Sheet 的 `投稿資料` 分頁。
- 評分資料可寫入 Google Sheet 的 `評分紀錄` 分頁。
- 手機版分頁列已修正，五個分頁均可點：
  - 投稿
  - 內容池
  - 評分
  - 精修
  - 正式收件
- 已新增重要文件：
  - `README.md`
  - `LOG.md`
  - `明日展示指南.md`
  - `超重要但不緊急更新資訊.md`
  - `docs/architecture.md`
  - `docs/github-pages-deploy-guide.md`
  - `docs/google-apps-script-setup-guide.md`
  - `docs/google-apps-script-web-app.js`
  - `docs/google-sheets-form-spec.md`

## 最近 Git Commit

```text
43b3244 Improve mobile navigation layout
13bf376 Enable Google Sheet sync endpoint
7eaf208 Initial self-media refine forum prototype
```

目前本機 `main` 已追蹤 `origin/main`。

## 驗證紀錄

已驗證：

- `https://timzz1208.github.io/media-refine-forum/` 可開。
- 線上 `src/config.js` 已含 Apps Script `/exec` URL。
- Apps Script API 直接測試：
  - 投稿回應：`item saved`
  - 評分回應：`rating saved`
- 線上網站前端測試：
  - 可以投稿
  - 可以評分
  - 可以寫入 Google Sheet
- 手機尺寸測試：
  - `390x844` 可點五個分頁
  - 沒有橫向撐寬

## 目前已知問題

### 1. API 仍有濫用風險

Apps Script Web App 目前需設定 `Anyone` 才能讓公開網頁寫入。

這代表知道 `/exec` 網址的人可以嘗試送資料。

正式公開前要處理：

- 加 token
- 限制欄位長度
- 加審核狀態
- 分開投稿與評分權限
- 記錄來源資訊

細節在：

```text
超重要但不緊急更新資訊.md
```

### 2. 檔案上傳尚未進 Google Drive

目前網頁可選檔案，但：

- 文字檔可讀入摘要。
- 圖片/PDF 只記錄檔名。
- 還沒有真的上傳到 Drive。

短期建議：檔案上傳仍用 Google Form。

### 3. 中文編碼顯示在 PowerShell 可能亂碼

部分檔案在 PowerShell `Get-Content` 顯示可能亂碼，但瀏覽器/GitHub Pages 上目前可正常顯示。

後續修改請注意編碼保持 UTF-8。

### 4. Sheet 會累積測試資料

Google Sheet 目前有測試資料，例如：

- `SheetSyncTest`
- `GitHub Pages Sync Test`
- `Mobile nav regression test`

正式展示前可手動清掉測試列。

## 明天展示建議

推薦展示流程：

1. 開啟 GitHub Pages：

```text
https://timzz1208.github.io/media-refine-forum/?v=mobile-fix
```

2. 點「載入示範資料」。
3. 切「內容池」展示卡片與分類。
4. 切「評分」送出評分。
5. 切「精修」產生方法論、腳本、PPT 大綱。
6. 打開 Google Sheet，展示後台收到資料。

## 後續優先工作

### P0：展示前

- 清理 Google Sheet 測試資料。
- 用手機實機再打開一次 GitHub Pages。
- 檢查 Apps Script 權限沒有被改回「只有我」。

### P1：安全

- Apps Script 加 token。
- 前端 `src/config.js` 加 token 或改成更安全的提交方式。
- Apps Script 驗證 token，不符合就不寫入。

### P2：功能

- 內容池從 Google Sheet 讀資料，而不是只讀 localStorage。
- 新增管理者視角。
- 加審核狀態。
- 高分內容可匯出成 DEMO CLAUDE 筆記。

### P3：檔案

- 檔案上傳改走 Google Form 或 Drive API。
- Sheet 記錄 Drive file URL。

## 重要檔案怎麼改

### 改後台網址

```text
src/config.js
```

### 改 Apps Script 後台

```text
docs/google-apps-script-web-app.js
```

改完後要手動貼到 Google Apps Script，重新部署新版本。

### 改手機版樣式

```text
assets/styles.css
```

特別看：

```text
@media (max-width: 620px)
```

### 改投稿/評分同步

```text
src/google-sheet-sync.js
```

### 改精修輸出格式

```text
src/refine.js
```

### 改分類規則

```text
src/classifier.js
```

## Git 操作

目前 remote：

```text
origin https://github.com/timzz1208/media-refine-forum.git
```

常用流程：

```powershell
cd "C:\彥廷資料庫\自媒體精修論壇"
git status
git add .
git commit -m "你的訊息"
git push
```

GitHub Pages 通常推上去後幾十秒到幾分鐘更新。

可用 cache bust 測：

```text
https://timzz1208.github.io/media-refine-forum/?v=任意字串
```

## 交接提醒

此專案使用者沒有編程背景。後續回覆與文件請保持白話：

- `index.html` = 網頁骨架
- `styles.css` = 網頁裝潢
- `storage.js` = 資料倉庫
- `classifier.js` = 分類助手
- `rating.js` = 評分計算器
- `refine.js` = 精修產生器
- `google-sheet-sync.js` = 送資料到 Google Sheet 的郵差

不要只用工程術語。
