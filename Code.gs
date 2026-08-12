/**
 * ArgOS — Malla Builder Web · Apps Script backend para la Google Sheet
 * "formulario amigable" de requerimientos Control-M. Base de datos única y
 * compartida entre la página local de ArgOS y la página pública de GitHub
 * Pages — ambas leen/escriben esta misma Sheet vía este mismo Web App.
 */

const SHEET_NAME = "Jobs";
const HEADERS = [
  "id", "job_name", "accion", "responsable", "application", "sub_application",
  "nombre_proceso", "description", "tipo", "file_path", "file_name",
  "databricks_job_id", "pipeline_name", "detalle_otro", "host", "run_as",
  "predecesores", "sucesores", "weekdays", "calendario", "hora_inicio",
  "rerun_every_minutes", "confirm", "keep_active_days", "mail_on_notok",
  "observaciones", "actualizado_en",
];

function _sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sheet;
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// id determinista: aplicación + nombre de job. Se recalcula siempre acá
// (nunca se confía en lo que mande el cliente) para que dos mallas distintas
// nunca puedan pisarse una fila por casualidad, y para que re-enviar el mismo
// job (por ejemplo al reimportar un Excel) actualice la fila en vez de duplicarla.
function _idDe(body) {
  return String(body.application || "") + "::" + String(body.job_name || "");
}

function doGet(e) {
  const sheet = _sheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const jobs = data.slice(1)
    .filter(function (row) { return row[0]; })
    .map(function (row) {
      const obj = {};
      headers.forEach(function (h, i) { obj[h] = row[i]; });
      return obj;
    });
  return _json({ ok: true, jobs: jobs });
}

function doPost(e) {
  const sheet = _sheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const body = JSON.parse(e.postData.contents);
  const idCol = headers.indexOf("id");
  const id = _idDe(body);
  const data = sheet.getDataRange().getValues();

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === id) { rowIndex = i + 1; break; }
  }

  const rowValues = headers.map(function (h) {
    if (h === "id") return id;
    if (h === "actualizado_en") return new Date().toISOString();
    return body[h] !== undefined && body[h] !== null ? body[h] : "";
  });

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  return _json({ ok: true, id: id, job_name: body.job_name });
}
