# 自媒體精修論壇

## 這是什麼

`自媒體精修論壇` 是給自媒體同學會成員使用的內容精修工具。

它不是單純收藏影片或文章，而是把成員看到的好內容，整理成可分類、可評分、可精修、可沉澱的方法庫。

核心定位：

> 自媒體方法庫 + 精修論壇 + 內容素材煉成器

第一版已完成靜態網頁原型，入口是：

```text
index.html
```

因為現在已經拆成多個 JavaScript 模組，建議用展示伺服器開啟，不要直接雙擊 `index.html`。

最簡單方式：

```text
啟動展示伺服器.bat
```

雙擊後，用瀏覽器開：

```text
http://127.0.0.1:8000/
```

如果 8000 被占用，或想關閉展示環境，可雙擊：

```text
停止展示伺服器.bat
```

目前資料暫存在使用者瀏覽器的 `localStorage`。這適合驗證流程，但不適合正式收件，因為你不會收到其他人電腦上的資料，也不適合存圖片、影片、PDF 或大量逐字稿。

目前已經拆成小單元，之後可以局部修改，不需要每次從頭讀整個網頁。

## 目前已完成

- 建立獨立資料夾：`自媒體精修論壇`
- 建立第一版靜態網頁：`index.html`
- 建立展示啟動檔：`啟動展示伺服器.bat`
- 建立展示停止檔：`停止展示伺服器.bat`
- 拆出樣式檔：`assets/styles.css`
- 拆出功能模組：`src/`
- 建立本說明文件：`README.md`
- 建立進度紀錄：`LOG.md`
- 建立架構文件：`docs/architecture.md`
- 建立 Google Form / Google Sheets 規格：`docs/google-sheets-form-spec.md`
- 建立 Google Sheets 表頭模板：`docs/google-sheets-template.csv`
- 已建立正式收件 Google Sheet：
  - `https://docs.google.com/spreadsheets/d/1lqQoJonAZTC7gCk8SkMJ7nbh9NOyKnuE2SbfKJoaYj4/edit`
- 完成四個主要頁面：
  - 投稿
  - 內容池
  - 評分
  - 精修
- 完成第一版核心流程：
  - 成員貼連結、補投稿理由
  - 可選擇上傳文字檔、圖片或 PDF
  - 文字檔會讀入摘要
  - 圖片與 PDF 目前只記錄檔名，不會真正上傳
  - 系統用關鍵字模擬 AI 分類
  - 成員可做五維度評分
  - 平均 4 分以上進入高分精修池
  - 可萃取成方法論、腳本模板、PPT 大綱、DEMO CLAUDE 筆記草稿
  - 可匯出 JSON 備份
  - 可匯入 JSON 還原
  - 可匯出 CSV 給 Google Sheets 使用

## 現在的限制

### 1. localStorage 只能當原型

現在資料存在使用者自己的瀏覽器。

意思是：

- 同學投稿後，你不會自動收到。
- 換瀏覽器、換電腦、清除網站資料後，資料可能消失。
- 多人無法共用同一份資料池。

### 2. 儲存空間不足以正式收件

`localStorage` 通常只有約 5MB 左右。

適合存：

- 標題
- 連結
- 摘要
- 分類
- 評分
- 評論

不適合存：

- 圖片
- PDF
- 影片
- 大量逐字稿
- 多人長期投稿資料

### 3. 圖片與 PDF 尚未真正上傳

目前圖片與 PDF 只會記錄檔名，沒有傳到你的電腦、雲端或資料庫。

這是刻意保守設計，避免把大檔案塞進 `localStorage` 導致資料爆掉。

## 建議升級架構

下一版要升級成「你收得到」的版本。

建議採用：

```text
前端網頁
  -> 投稿表單
  -> 後端 API 或自動化流程
  -> 資料庫 / Google Sheets
  -> 檔案儲存 / Google Drive
  -> 精修輸出 / DEMO CLAUDE
```

### MVP 2.0 推薦方案

最適合現在階段的是：

```text
Google Sheets + Google Drive
```

分工：

- Google Sheets：存連結、分類、評分、評論、精修狀態。
- Google Drive：存圖片、PDF、逐字稿等檔案。
- 網頁前端：顯示投稿、內容池、評分、精修。
- DEMO CLAUDE：接收沉澱後的方法論筆記與概念條目。
- PPT 萃取機：未來接收 PPT 大綱並生成簡報。

這個方案比一開始就做完整會員系統更快，也比較適合同學會內部試跑。

## 是否需要切分小單元

需要。

目前 `index.html` 是單檔原型，適合快速驗證，但不適合長期維護。下一階段應該拆成小單元，之後要修版面、修評分、修儲存、修精修輸出時，就不用從頭讀整份檔案。

## 白話版：每個單元是做什麼的

你可以先把這個網頁想像成一間餐廳。

現在的 `index.html` 就像「所有事情都塞在同一本筆記」：菜單、裝潢、廚房流程、點餐紀錄、客人評分、出餐方式全部寫在一起。這樣很快可以開張，但之後要改一個地方會很累。

所以未來要拆成幾個小單元。每個單元只負責一件事。

### `index.html`

白話：網頁的骨架。

它決定畫面上有哪些區塊，例如：

- 左邊選單
- 投稿頁
- 內容池
- 評分頁
- 精修頁

以後它應該只負責「有哪些房間」，不要塞太多邏輯。

### `assets/styles.css`

白話：網頁的裝潢。

它決定畫面長什麼樣子，例如：

- 顏色
- 字體大小
- 按鈕樣式
- 卡片排列
- 手機版畫面

如果你說「這個版面需要修」、「這個按鈕不好看」、「手機上太擠」，通常就是改這裡。

### `src/app.js`

白話：總指揮。

它負責把各個部分串起來，例如：

- 使用者點「投稿」就切到投稿頁
- 使用者點「評分」就切到評分頁
- 網頁一打開要先載入資料
- 哪些功能要先啟動

它像店長，不是親自煮菜，而是指揮各區運作。

### `src/storage.js`

白話：倉庫與資料保存。

它負責資料要放哪裡，例如：

- 現在先放在瀏覽器 `localStorage`
- 未來改放 Google Sheets
- 未來圖片/PDF 改放 Google Drive
- 未來也可能改成真正資料庫

如果你說「我收不到同學投稿」、「我要改成雲端保存」、「我要備份資料」，主要就是改這裡。

### `src/data-model.js`

白話：表格欄位規格。

它決定一筆投稿要有哪些資料，例如：

- 標題
- 連結
- 投稿者
- 分類
- 標籤
- 評分
- 是否已精修

你可以把它想成 Google Sheets 的表頭設計。

如果一開始欄位設計清楚，未來接 Google Sheets 或資料庫會比較順。

### `src/classifier.js`

白話：分類助手。

它負責判斷一筆內容屬於哪一類，例如：

- Hook 開場
- 人設定位
- 說故事
- 銷售轉化
- 短影音腳本
- PPT/教學素材

現在只是用關鍵字簡單判斷。未來如果要接 AI 自動分類，主要就是改這裡。

### `src/rating.js`

白話：評分計算器。

它負責算分數，例如：

- 實用度幾分
- 可模仿度幾分
- 啟發度幾分
- 平均分是多少
- 有沒有達到高分精修池門檻

如果你說「4 分以上才進精修池」、「至少 3 個人評分才算數」、「某些維度權重比較高」，主要就是改這裡。

### `src/refine.js`

白話：精修產生器。

它負責把高分內容變成可用產物，例如：

- 方法論筆記
- 可模仿腳本
- PPT 大綱
- DEMO CLAUDE 知識庫草稿

如果你覺得「萃取出來的格式要改」、「PPT 大綱要更像課程」、「DEMO CLAUDE 筆記要有固定格式」，主要就是改這裡。

### `src/ui-submit.js`

白話：投稿頁的操作。

它負責投稿頁上發生的事，例如：

- 使用者填標題
- 使用者貼連結
- 使用者上傳檔案
- 按下建立內容卡

如果你想改投稿表單欄位，通常就是改這裡。

### `src/ui-pool.js`

白話：內容池頁的操作。

它負責顯示所有投稿，例如：

- 內容卡列表
- 搜尋
- 分類篩選
- 分數篩選
- 狀態篩選

如果你想改內容卡長相、列表排序、篩選方式，通常就是改這裡。

### `src/ui-rating.js`

白話：評分頁的操作。

它負責評分表單，例如：

- 選擇要評分的內容
- 填五個分數
- 留短評
- 送出評分

如果你想改評分項目，或改成星星、滑桿、按鈕，通常就是改這裡。

### `src/ui-refine.js`

白話：精修頁的操作。

它負責高分內容的精修畫面，例如：

- 顯示高分精修池
- 選擇要萃取的內容
- 按下萃取
- 複製結果
- 標記已萃取

如果你想改精修頁流程，通常就是改這裡。

### `docs/architecture.md`

白話：系統地圖。

它會說明整個系統怎麼運作，像是：

- 投稿後資料去哪裡
- 評分怎麼算
- 圖片存在什麼地方
- 高分內容怎麼進 DEMO CLAUDE

這是給未來維護者看的地圖。

### `docs/upgrade-plan.md`

白話：升級施工計畫。

它會記錄接下來要怎麼從本機原型升級成正式版本，例如：

- 第一步先拆檔案
- 第二步加匯出/匯入
- 第三步接 Google Sheets
- 第四步接 Google Drive
- 第五步再考慮登入與權限

這是避免做到一半迷路用的。

## 白話版：之後你要改功能時，要看哪裡

如果你想改「畫面好不好看」：看 `assets/styles.css`。

如果你想改「投稿欄位」：看 `src/ui-submit.js` 和 `src/data-model.js`。

如果你想改「資料存哪裡」：看 `src/storage.js`。

如果你想改「分類規則」：看 `src/classifier.js`。

如果你想改「幾分算高分」：看 `src/rating.js`。

如果你想改「萃取出來的文案格式」：看 `src/refine.js`。

如果你想改「內容池顯示方式」：看 `src/ui-pool.js`。

如果你想改「精修頁操作」：看 `src/ui-refine.js`。

如果你想知道「整個系統現在怎麼設計」：看 `docs/architecture.md`。

如果你想知道「下一步要做什麼」：看 `docs/upgrade-plan.md` 和 `LOG.md`。

建議拆分如下：

```text
自媒體精修論壇/
  index.html
  README.md
  LOG.md
  assets/
    styles.css
  src/
    app.js
    storage.js
    data-model.js
    classifier.js
    rating.js
    refine.js
    ui-submit.js
    ui-pool.js
    ui-rating.js
    ui-refine.js
  docs/
    architecture.md
    upgrade-plan.md
```

### 各單元職責

- `index.html`：只放頁面骨架，不放大量樣式與邏輯。
- `assets/styles.css`：所有版面與視覺樣式。
- `src/app.js`：啟動程式、切換頁面、串接各模組。
- `src/storage.js`：資料儲存層。先支援 localStorage，未來改接 Google Sheets 或資料庫。
- `src/data-model.js`：內容卡、評分、精修結果的資料格式。
- `src/classifier.js`：分類邏輯。先用關鍵字，未來可換 AI API。
- `src/rating.js`：平均分、是否進入精修池、狀態判斷。
- `src/refine.js`：產出方法論、腳本、PPT 大綱、DEMO CLAUDE 草稿。
- `src/ui-submit.js`：投稿頁。
- `src/ui-pool.js`：內容池頁。
- `src/ui-rating.js`：評分頁。
- `src/ui-refine.js`：精修頁。

## 資料模型草案

每一筆內容卡建議至少包含：

```text
id
title
url
type
author
reason
notes
sourceFileName
sourceFileUrl
categories
tags
ratings
status
extracted
createdAt
updatedAt
```

每一筆評分建議包含：

```text
useful
copy
insight
convert
fit
comment
createdAt
createdBy
```

未來如果接 Google Sheets，可以先用這些欄位當表頭。

## 與其他資料夾分工

- `自媒體同學會資料`：課程、簡報、教學輸出。
- `PPT 萃取機`：未來作為高分內容轉 PPT 的工具。
- `DEMO CLAUDE`：接收沉澱後的方法論筆記、概念拆解、知識庫條目。
- `自媒體精修論壇`：產品原型、資料結構、網頁、投稿、分類、評分、精修流程。

## 下一步

建議下一步不要急著加功能，而是先做「架構拆分」：

1. 把 `index.html` 拆成 HTML / CSS / JS。
2. 把資料操作集中到 `storage.js`。
3. 把分類、評分、精修輸出各自獨立。
4. 加入匯出 JSON / 匯入 JSON，讓 localStorage 原型也能備份。
5. 再升級 Google Sheets + Google Drive 收件版本。

這樣之後版面要修，就只動 CSS 與 UI 檔；儲存方式要改，就只動 storage；精修輸出要改，就只動 refine。

## 明天展示

如果要在同學會展示，請先看：

```text
明日展示指南.md
```

如果要建立正式收件表單，請看：

```text
docs/google-sheets-form-spec.md
```

已先建立 Google Sheet 收件表：

```text
https://docs.google.com/spreadsheets/d/1lqQoJonAZTC7gCk8SkMJ7nbh9NOyKnuE2SbfKJoaYj4/edit
```

目前卡點：我可以建立 Google Sheet，但目前沒有可用的 Google Form 建立工具，所以 Google Form 需要手動依照規格建立。

## GitHub Pages 上線

如果要把這個工具放到 GitHub 免費帳號，請看：

```text
docs/github-pages-deploy-guide.md
```

結論：

- 適合放 GitHub Pages。
- 這個專案是 HTML/CSS/JS 靜態網站，剛好符合 GitHub Pages。
- 上線後大家可以用網址打開。
- 但正式投稿資料仍然不會回到你這邊，收件仍建議搭配 Google Form / Google Sheets。

## Google Sheet 自動同步

你提到的「開發日記網頁」能自動寫入 Google Sheet，是因為它有一個 Google Apps Script `/exec` 後台網址。

本專案現在也已經準備好同樣架構：

```text
src/config.js
src/google-sheet-sync.js
docs/google-apps-script-web-app.js
docs/google-apps-script-setup-guide.md
```

目前狀態：

- 前端同步程式已完成。
- Google Apps Script 後台程式已準備好。
- Google Sheet 已建立。
- 只差手動部署 Apps Script，拿到 `/exec` 網址後貼回 `src/config.js`。

設定方式請看：

```text
docs/google-apps-script-setup-guide.md
```

## 超重要但不緊急

正式公開前要回來處理安全與濫用風險，請看：

```text
超重要但不緊急更新資訊.md
```

目前最重要的一點：

- Google Apps Script `/exec` API 如果公開，可能被亂送資料。
- 明天展示可以接受。
- 正式公開前至少要加 token、欄位長度限制與審核機制。

重點是：

- 明天先展示流程，不要當正式收件系統。
- 學員手機上的資料目前只存在自己的手機。
- 如果真的要收投稿，先用 Google Form + Google Sheets。
- 這個網頁負責展示未來產品長相與操作流程。
- 展示時建議雙擊 `啟動展示伺服器.bat`，再讓手機連 `http://你的IPv4:8000/`。

## 還沒想到但很重要的事

- 投稿權限：誰可以投稿？是否只限同學會成員？
- 審核機制：投稿是否要先審核，避免低品質或無關內容灌入。
- 版權與引用：影片、文章、截圖能不能保存？可以保存到什麼程度？
- 隱私：如果內容含個資、客戶案例、私人對話，要不要遮蔽？
- 平台風險：IG、TikTok、YouTube 連結可能失效，是否要存摘要備份？
- 評分公平性：是否允許同一人重複評分？是否要記錄評分者？
- 分類標準：分類要固定，還是允許新增自訂標籤？
- 精修門檻：目前用平均 4 分以上，未來可能要加入評分人數門檻。
- 輸出格式：DEMO CLAUDE 筆記、PPT 大綱、短影音腳本是否要分成不同模板。
- 備份：正式使用前，需要固定匯出與備份機制。
- 管理者視角：你需要一個管理頁，看待審核、精修、已沉澱、待處理。
