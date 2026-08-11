# Malla Builder Web

Complemento en GitHub Pages del módulo **Malla Builder** de ArgOS.

**URL publicada:** https://soporteaiwis-lab.github.io/argos-malla-builder-web/

> Este es un repo **separado y público**, dedicado solo a esta página, porque
> GitHub Pages no está disponible en repos privados en este plan de cuenta.
> El proyecto completo (ArgOS, incluido el módulo Malla Builder local y los
> datos reales de BCI) vive privado en `soporteaiwis-lab/argos`, bajo
> `docs/malla-builder/` — esa carpeta es la copia de referencia/documentación;
> este repo es la fuente que realmente sirve GitHub Pages. Mismo contenido,
> mantener ambos sincronizados a mano si se edita.

## Qué es

Formulario amigable para cargar los requerimientos de una malla Control-M sin
editar el Excel de orden de cambio a mano. Los datos se pueden guardar en una
Google Sheet propia (vía Apps Script) o importarse directo desde el Excel real
de BCI — con cualquiera de los dos orígenes, la página genera el mismo XML
(Definition Table) y JSON (Automation API) que el módulo Malla Builder local
de ArgOS (`src/frontend/malla_builder.html` + `src/backend/malla_builder.py`).

`index.html` es un archivo único y autocontenido (sin build, sin dependencias
del resto del repo) — la única dependencia externa es la librería
[SheetJS](https://sheetjs.com/) (CDN) para leer `.xlsx` en el navegador. El
motor de parseo/generación es un puerto 1:1 en JavaScript de
`src/backend/malla_builder.py`, validado contra la misma malla de muestra
(`SUC_PYME_DBK`) — produce exactamente el mismo XML/JSON.

## Archivos

- `index.html` — la página (todo: UI, parser de Excel, generador XML/JSON, vista Planning simulada).
- `Code.gs` — código de Apps Script para la Google Sheet "formulario amigable" (instrucciones de instalación dentro del archivo y dentro de la página, sección "Paso 1").

## Nota de privacidad

Esta página no incluye ni referencia ningún dato real de BCI (nombres,
teléfonos, mails de soporte) — esos datos viven solo en el repo privado
`argos`, en `MALLA BUILDER/`, que nunca se copia a este repo público.
