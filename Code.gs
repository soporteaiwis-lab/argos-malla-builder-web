/**
 * ArgOS — Malla Builder Web · Apps Script backend para la Google Sheet
 * "formulario amigable" de requerimientos Control-M.
 *
 * Instrucciones:
 * 1. Crear una Google Sheet nueva. Renombrar la primera pestaña a "Jobs".
 * 2. En la fila 1 pegar (una celda por columna, en este orden) los encabezados
 *    que aparecen en HEADERS más abajo — o usar el botón "Copiar encabezados"
 *    de la página web y pegarlos en A1.
 * 3. Extensiones -> Apps Script. Borrar el contenido de Code.gs y pegar este
 *    archivo completo. Guardar.
 * 4. Implementar -> Nueva implementación -> Tipo "Aplicación web".
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquier usuario
 *    Implementar, autorizar permisos, y copiar la URL que te entrega
 *    (termina en /exec). Esa es la URL que se pega en la página web.
 */

const SHEET_NAME = "Jobs";
const HEADERS = [
  "job_name", "accion", "application", "sub_application", "nombre_proceso",
  "description", "tipo", "file_path", "file_name", "databricks_job_id",
  "pipeline_name", "detalle_otro", "host", "run_as", "predecesores",
  "sucesores", "weekdays", "calendario", "hora_inicio", "rerun_every_minutes",
  "confirm", "keep_active_days", "mail_on_notok", "observaciones", "actualizado_en",
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
  const jobNameCol = headers.indexOf("job_name");
  const appCol = headers.indexOf("application");
  const data = sheet.getDataRange().getValues();

  // clave compuesta (application + job_name): una Sheet puede recibir jobs de
  // varias mallas/pedidos distintos, y dos mallas distintas pueden reusar el
  // mismo nombre de job — sin esto, la segunda pisaría la fila de la primera.
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][jobNameCol] === body.job_name && data[i][appCol] === body.application) { rowIndex = i + 1; break; }
  }

  const rowValues = headers.map(function (h) {
    if (h === "actualizado_en") return new Date().toISOString();
    return body[h] !== undefined && body[h] !== null ? body[h] : "";
  });

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  return _json({ ok: true, job_name: body.job_name });
}
