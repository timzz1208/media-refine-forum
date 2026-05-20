# Google Apps Script 後台設定指南

## 這跟 GitHub Pages 有什麼不同？

GitHub Pages 只負責讓大家打開網頁。

Google Sheet 後台寫入，需要另一個東西負責接資料。你現有的「開發日記網頁」就是這樣做的：

```text
前台 index.html
  -> fetch Apps Script /exec 網址
  -> Apps Script 寫入 Google Sheet
```

所以真正的後台不是 GitHub Pages，而是 Google Apps Script。

## 現在自媒體精修論壇的狀態

目前已經準備好前端同步模組：

```text
src/config.js
src/google-sheet-sync.js
```

也準備好 Apps Script 後台程式：

```text
docs/google-apps-script-web-app.js
```

現在只差：

1. 建立 Google Apps Script 專案。
2. 貼上 `google-apps-script-web-app.js` 的內容。
3. 部署成 Web App。
4. 把 `/exec` 網址貼回 `src/config.js`。

## 設定步驟

### 1. 開啟 Apps Script

到：

```text
https://script.google.com/
```

建立新專案。

### 2. 貼上後台程式

打開本專案檔案：

```text
docs/google-apps-script-web-app.js
```

把內容全部複製，貼到 Apps Script 的 `Code.gs`。

### 3. 部署 Web App

在 Apps Script 右上角按：

```text
Deploy > New deployment
```

類型選：

```text
Web app
```

設定：

```text
Execute as: Me
Who has access: Anyone
```

部署後會得到一個網址，通常長這樣：

```text
https://script.google.com/macros/s/一串代碼/exec
```

### 4. 貼回前端設定

打開：

```text
src/config.js
```

把網址貼到這裡：

```js
export const GOOGLE_SHEET_WEB_APP_URL = "你的 /exec 網址";
```

例如：

```js
export const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfy.../exec";
```

### 5. 重新上傳到 GitHub Pages

如果你用 GitHub Pages，上傳修改後的：

```text
src/config.js
src/google-sheet-sync.js
```

GitHub Pages 更新後，投稿與評分就會開始送到 Google Sheet。

## 會寫到哪裡？

目前會寫到這份 Google Sheet：

```text
https://docs.google.com/spreadsheets/d/1lqQoJonAZTC7gCk8SkMJ7nbh9NOyKnuE2SbfKJoaYj4/edit
```

分成兩張表：

- `投稿資料`
- `評分紀錄`

## 注意事項

- 這是輕量版後台，適合展示與 MVP。
- 因為前端用 `no-cors` 送資料，所以畫面無法百分之百讀到 Google 回傳結果。
- 本機仍會先存 localStorage，即使網路不穩也不會立刻丟資料。
- 圖片與 PDF 還沒有自動上傳 Google Drive。檔案上傳建議先用 Google Form。
- 如果要正式商用，之後應該改成更完整的後端或權限設計。
