const SPREADSHEET_ID = '1lqQoJonAZTC7gCk8SkMJ7nbh9NOyKnuE2SbfKJoaYj4';
const UPLOAD_FOLDER_ID = '1jLhNxm-kQYI-xE0Nh7CtawhJUGzPEMLP';

const ITEM_SHEET_NAME = '投稿資料'; // 投稿資料
const RATING_SHEET_NAME = '評分紀錄'; // 評分紀錄
const FEEDBACK_SHEET_NAME = '意見回饋'; // 使用者反饋
const FEEDBACK_REPLY_SHEET_NAME = '反饋回覆'; // 管理者回覆

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12MB

const ITEM_HEADERS = [
  'timestamp',
  'name',
  'title',
  'url',
  'type',
  'reason',
  'notes',
  'suggested_categories',
  'allow_demo',
  'file_urls',
  'system_categories',
  'tags',
  'average_score',
  'rating_count',
  'status',
  'extracted',
  'created_at',
  'updated_at',
  'emotion_tags'
];

const RATING_HEADERS = [
  'timestamp',
  'item_id',
  'title',
  'created_by',
  'useful',
  'copy',
  'insight',
  'convert',
  'fit',
  'average_score',
  'comment',
  'created_at'
];

const FEEDBACK_HEADERS = [
  'timestamp',
  'id',
  'author',
  'text',
  'screenshot_url',
  'screenshot_name',
  'created_at'
];

const FEEDBACK_REPLY_HEADERS = [
  'timestamp',
  'feedback_id',
  'author',
  'text',
  'created_at'
];

function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || 'save_item';

  if (action === 'list_items') {
    return json_(listItems_());
  }

  if (action === 'list_feedback') {
    return json_(listFeedback_());
  }

  if (action === 'save_rating') {
    appendRow_(RATING_SHEET_NAME, RATING_HEADERS, params);
    return text_('rating saved');
  }

  if (action === 'save_feedback') {
    appendRow_(FEEDBACK_SHEET_NAME, FEEDBACK_HEADERS, params);
    return text_('feedback saved');
  }

  if (action === 'save_feedback_reply') {
    appendRow_(FEEDBACK_REPLY_SHEET_NAME, FEEDBACK_REPLY_HEADERS, params);
    return text_('feedback reply saved');
  }

  appendRow_(ITEM_SHEET_NAME, ITEM_HEADERS, params);
  return text_('item saved');
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || '';

    if (action === 'upload_file') {
      return json_(uploadFile_(body));
    }

    if (action === 'list_items') {
      return json_(listItems_());
    }

    if (action === 'list_feedback') {
      return json_(listFeedback_());
    }

    return json_({ ok: false, error: 'unknown action: ' + action });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function listItems_() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const itemSheet = ss.getSheetByName(ITEM_SHEET_NAME);
    const ratingSheet = ss.getSheetByName(RATING_SHEET_NAME);

    const items = sheetToObjects_(itemSheet);
    const ratings = ratingSheet ? sheetToObjects_(ratingSheet) : [];

    const ratingMap = {};
    ratings.forEach(function (r) {
      const key = String(r.item_id || '');
      if (!key) return;
      if (!ratingMap[key]) ratingMap[key] = [];
      ratingMap[key].push(r);
    });

    const withRatings = items.map(function (item) {
      const key = String(item.created_at || '');
      const merged = {};
      Object.keys(item).forEach(function (k) { merged[k] = item[k]; });
      merged.ratings = ratingMap[key] || [];
      return merged;
    });

    return { ok: true, items: withRatings };
  } catch (err) {
    return { ok: false, error: String(err && err.message || err) };
  }
}

function listFeedback_() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const feedbackSheet = ss.getSheetByName(FEEDBACK_SHEET_NAME);
    const replySheet = ss.getSheetByName(FEEDBACK_REPLY_SHEET_NAME);

    const feedbacks = feedbackSheet ? sheetToObjects_(feedbackSheet) : [];
    const replies = replySheet ? sheetToObjects_(replySheet) : [];

    const replyMap = {};
    replies.forEach(function (r) {
      const key = String(r.feedback_id || '');
      if (!key) return;
      if (!replyMap[key]) replyMap[key] = [];
      replyMap[key].push(r);
    });

    const withReplies = feedbacks.map(function (f) {
      const key = String(f.id || '');
      const merged = {};
      Object.keys(f).forEach(function (k) { merged[k] = f[k]; });
      merged.replies = replyMap[key] || [];
      return merged;
    });

    return { ok: true, items: withReplies };
  } catch (err) {
    return { ok: false, error: String(err && err.message || err) };
  }
}

function sheetToObjects_(sheet) {
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(function (h) { return String(h); });
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    let hasContent = false;
    for (let j = 0; j < row.length; j++) {
      if (row[j] !== '' && row[j] !== null && row[j] !== undefined) { hasContent = true; break; }
    }
    if (!hasContent) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      let val = row[j];
      if (val instanceof Date) val = val.toISOString();
      obj[headers[j]] = val;
    }
    out.push(obj);
  }
  return out;
}

function uploadFile_(body) {
  const data = body.data || '';
  const filename = (body.filename || ('upload-' + Date.now())).replace(/[\\/:*?"<>|]/g, '_');
  const mimeType = body.mimeType || 'application/octet-stream';

  if (!data) {
    return { ok: false, error: 'missing data' };
  }

  const bytes = Utilities.base64Decode(data);
  if (bytes.length > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'file too large: ' + bytes.length + ' bytes' };
  }

  const folder = DriveApp.getFolderById(UPLOAD_FOLDER_ID);
  const blob = Utilities.newBlob(bytes, mimeType, filename);
  const file = folder.createFile(blob);

  return {
    ok: true,
    id: file.getId(),
    name: file.getName(),
    url: file.getUrl()
  };
}

function appendRow_(sheetName, headers, params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet_(ss, sheetName, headers);
  const row = headers.map(header => params[header] || '');
  sheet.appendRow(row);
}

function getOrCreateSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasAnyHeader = firstRow.some(value => value);

  if (!hasAnyHeader) {
    // 全新分頁 — 寫入完整 headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e5f2f4');
  } else {
    // 既有分頁 — 只補上空白的 header 欄位（不覆蓋既有的）
    const updated = firstRow.slice();
    let changed = false;
    for (let i = 0; i < headers.length; i++) {
      if (!updated[i]) {
        updated[i] = headers[i];
        changed = true;
      }
    }
    if (changed) {
      sheet.getRange(1, 1, 1, headers.length).setValues([updated]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }

  return sheet;
}

function text_(message) {
  return ContentService.createTextOutput(message).setMimeType(ContentService.MimeType.TEXT);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function authorizeDrive() {
  const folder = DriveApp.getFolderById(UPLOAD_FOLDER_ID);
  const blob = Utilities.newBlob('test ' + new Date(), 'text/plain', 'auth-test.txt');
  const file = folder.createFile(blob);
  Logger.log('OK，測試檔已建立：' + file.getUrl());
}
