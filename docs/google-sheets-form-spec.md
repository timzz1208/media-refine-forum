# Google Form / Google Sheets 串接規格

## 目的

在還沒有正式後端之前，先用 Google Form 收學員投稿，用 Google Sheets 集中資料，用 Google Drive 收檔案。

這是明天展示最穩的正式收件備案。

## 已建立的 Google Sheet

已建立一份正式收件資料表：

```text
https://docs.google.com/spreadsheets/d/1lqQoJonAZTC7gCk8SkMJ7nbh9NOyKnuE2SbfKJoaYj4/edit
```

目前已完成：

- 分頁名稱：`投稿資料`
- 第一列表頭
- 凍結第一列
- 表頭底色與粗體

卡點：

- 目前工具可以建立 Google Sheet，但沒有可用的 Google Form 建立工具。
- Google Form 需要手動照下方欄位建立，並把回覆連到這份 Google Sheet。

## Google Form 欄位

| 欄位名稱 | 類型 | 是否必填 | 說明 |
|---|---|---:|---|
| 姓名 | 簡答 | 是 | 投稿者名稱 |
| 內容標題 | 簡答 | 是 | 影片、文章或筆記標題 |
| 內容連結 | 簡答 | 否 | YouTube、IG、TikTok、Threads、文章網址 |
| 內容類型 | 單選 | 是 | 影片連結、文章連結、逐字稿、截圖摘要、手動筆記 |
| 我覺得它有料的原因 | 段落 | 是 | 為什麼值得同學會拆解 |
| 補充摘要或逐字稿 | 段落 | 否 | 可貼重點段落或逐字稿 |
| 建議分類 | 核取方塊 | 否 | Hook 開場、人設定位、說故事、銷售轉化、知識型內容、情緒共鳴、案例拆解、短影音腳本、PPT/教學素材 |
| 是否願意被精修示範 | 單選 | 是 | 願意 / 不願意 |
| 檔案上傳 | 檔案上傳 | 否 | 圖片、PDF、逐字稿 |

## Google Sheets 建議表頭

已提供一份 CSV 表頭模板：

```text
docs/google-sheets-template.csv
```

```text
timestamp
name
title
url
type
reason
notes
suggested_categories
allow_demo
file_urls
system_categories
tags
average_score
rating_count
status
extracted
created_at
updated_at
```

## 手動操作流程

1. 建立 Google Form。
2. 表單回覆連到已建立的 Google Sheets。
3. 表單允許檔案上傳，檔案會進 Google Drive。
4. 明天現場請學員用 Google Form 投稿。
5. 原型網頁負責展示未來系統長相與操作流程。
6. 會後再把 Google Sheets 資料匯入下一版工具。

## 之後自動化方向

第一階段：

- 從 Google Sheets 匯出 CSV。
- 匯入本工具。
- 在本工具評分與精修。

第二階段：

- `storage.js` 直接讀寫 Google Sheets。
- 檔案仍由 Google Drive 保存。

第三階段：

- 加入會員登入。
- 評分記錄評分者身份。
- 管理者可審核投稿。
