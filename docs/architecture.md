# 架構說明

## 白話版

現在這個工具已經從「所有東西塞在一個檔案」改成「每個小單元各做一件事」。

你可以這樣理解：

```text
index.html          網頁骨架
assets/styles.css   網頁裝潢
src/app.js          總指揮
src/storage.js      資料倉庫
src/classifier.js   分類助手
src/rating.js       評分計算器
src/refine.js       精修產生器
src/data-model.js   表格欄位規格
```

## 目前資料流

```text
使用者投稿
  -> app.js 收表單
  -> classifier.js 自動分類
  -> data-model.js 建立內容卡
  -> storage.js 存到 localStorage
  -> app.js 重新畫面
```

評分流程：

```text
使用者評分
  -> app.js 收評分
  -> rating.js 計算平均分
  -> 4 分以上進入精修池
```

精修流程：

```text
使用者選高分內容
  -> refine.js 產出方法論 / 腳本 / PPT 大綱 / DEMO CLAUDE 草稿
  -> 可複製或下載 Markdown
```

## 下一版資料流

正式收件時，`storage.js` 會是最重要的替換點。

現在：

```text
storage.js -> localStorage
```

未來：

```text
storage.js -> Google Sheets / Supabase / Firebase
檔案上傳 -> Google Drive / Storage
```

這代表：

- 畫面不用大改。
- 分類不用大改。
- 評分不用大改。
- 精修不用大改。
- 主要改資料倉庫即可。

## 明天展示建議

明天先用這個原型展示產品流程。

如果真的要收學員投稿，請用 Google Form。原因是目前 localStorage 仍然只存在各自手機，你不會收到學員手機裡的資料。
