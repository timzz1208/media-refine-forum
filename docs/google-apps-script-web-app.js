const SPREADSHEET_ID = '1lqQoJonAZTC7gCk8SkMJ7nbh9NOyKnuE2SbfKJoaYj4';

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
    appendRow_('評分紀錄', RATING_HEADERS, params);
    return text_('rating saved');
  }

  appendRow_('投稿資料', ITEM_HEADERS, params);
  return text_('item saved');
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
