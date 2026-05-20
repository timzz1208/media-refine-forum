const SPREADSHEET_ID = '1lqQoJonAZTC7gCk8SkMJ7nbh9NOyKnuE2SbfKJoaYj4';
const UPLOAD_FOLDER_ID = '1jLhNxm-kQYI-xE0Nh7CtawhJUGzPEMLP';

const ITEM_SHEET_NAME = '投稿資料'; // 投稿資料
const RATING_SHEET_NAME = '評分紀錄'; // 評分紀錄

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
  'updated_at'
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

function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || 'save_item';

  if (action === 'save_rating') {
    appendRow_(RATING_SHEET_NAME, RATING_HEADERS, params);
    return text_('rating saved');
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

    return json_({ ok: false, error: 'unknown action: ' + action });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
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
  const hasHeaders = firstRow.some(value => value);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e5f2f4');
  }

  return sheet;
}

function text_(message) {
  return ContentService.createTextOutput(message).setMimeType(ContentService.MimeType.TEXT);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
