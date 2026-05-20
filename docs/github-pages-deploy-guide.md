# GitHub Pages 上線指南

## 適不適合放 GitHub？

適合。

這個專案目前是純靜態網站：

```text
index.html
assets/styles.css
src/*.js
```

GitHub Pages 正是用來放這種 HTML、CSS、JavaScript 網站的。

## 你需要知道的限制

GitHub Pages 只負責「讓大家用網址打開這個網頁」。

它不會自動幫你收資料。

所以：

- 可以展示工具
- 可以讓學員手機打開
- 可以讓大家體驗投稿、評分、精修流程
- 但學員在網頁裡填的資料，仍然只會存在各自手機或電腦的 `localStorage`
- 正式收件還是要用 Google Form / Google Sheets

補充：

GitHub Pages 可以「搭配」Google Apps Script 寫入 Google Sheet。  
它自己不是後台，但前端可以呼叫 Apps Script 的 `/exec` 網址。

本專案已準備好這種串接方式，請看：

```text
docs/google-apps-script-setup-guide.md
```

## 推薦做法

建立一個新的 public repository。

建議 repo 名稱：

```text
media-refine-forum
```

上線後網址大概會是：

```text
https://你的GitHub帳號.github.io/media-refine-forum/
```

## 要上傳哪些檔案

如果只想上線網頁，至少要上傳：

```text
index.html
assets/
src/
```

如果你也想保留專案文件，建議整個資料夾內容都上傳：

```text
index.html
assets/
src/
docs/
README.md
LOG.md
明日展示指南.md
啟動展示伺服器.bat
停止展示伺服器.bat
```

## GitHub 網頁操作步驟

1. 到 GitHub，按右上角 `+`。
2. 選 `New repository`。
3. Repository name 填：

```text
media-refine-forum
```

4. 選 `Public`。
5. 建立 repository。
6. 進入 repo 後，點 `Add file`。
7. 選 `Upload files`。
8. 把 `自媒體精修論壇` 裡面的檔案拖上去。
9. 按 `Commit changes`。
10. 進入 `Settings`。
11. 左側找到 `Pages`。
12. Source 選 `Deploy from a branch`。
13. Branch 選 `main`，資料夾選 `/root`。
14. 按 `Save`。
15. 等幾分鐘，GitHub 會產生網站網址。

## 如果看不到網站

先檢查：

- `index.html` 是否在 repo 最外層。
- `assets` 資料夾是否在 repo 最外層。
- `src` 資料夾是否在 repo 最外層。
- GitHub Pages 是否選到 `main / root`。
- 等 5 到 10 分鐘再重新整理。

## 明天展示用法

展示時可以這樣分工：

```text
GitHub Pages 網址：讓學員打開工具
Google Form：正式收投稿
Google Sheet：你看投稿資料
```

不要只用 GitHub Pages 收正式資料，因為它沒有後端。

如果已設定 Google Apps Script，則可以改成：

```text
GitHub Pages 網址：讓學員打開工具
Google Apps Script：接收網頁資料
Google Sheet：你看投稿與評分資料
Google Form：仍可作為檔案上傳備案
```
