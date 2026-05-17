// ============================================================
//  CONFIGURACIÓN — edita solo este archivo
// ============================================================

const CONFIG = {
  startDate: new Date(2025, 4, 17),   // 17 mayo 2025

  // ── Google Sheets → Planes & Metas ───────────────────────
  // 1. Crea un Google Sheet con columnas: Emoji | Plan | Descripción | Estado
  // 2. Archivo → Compartir → "Cualquier persona con el enlace" (solo lectura)
  // 3. Copia el ID del link: docs.google.com/spreadsheets/d/[ESTE_ID]/edit
  // 4. Pega abajo reemplazando TU_SHEET_ID
  sheetsUrl: "https://docs.google.com/spreadsheets/d/1B54bGOcCBammuZ_ShrcYPnfmyepbJLUPg1SkAJCuqIY/gviz/tq?tqx=out:json",

  // ── Google Sheets → Línea de Tiempo (Momentos) ─────────────
  // Crea una nueva pestaña llamada "Momentos" en el mismo Google Sheet
  // con columnas: Fecha | Evento | Descripción (comparte la misma visibilidad)
  timelineUrl: "https://docs.google.com/spreadsheets/d/1B54bGOcCBammuZ_ShrcYPnfmyepbJLUPg1SkAJCuqIY/gviz/tq?tqx=out:json&sheet=Momentos",

  // 5. [OPCIONAL] Para marcar como hecho/pendiente desde la página web:
  //    Crea un Google Apps Script en tu Sheet, publícalo como Web App y pega la URL aquí:
  sheetsUpdateUrl: "https://script.google.com/macros/s/AKfycbw7kJthYhoO2NNT_Fi_AzmP53mO9Bs98h7N6I9gjOMDGUjrhNBCU-NDuHjz9TwDk2Ml/exec",

  // 6. [OPCIONAL] Para cargar TODAS tus fotos automáticamente desde una carpeta de Google Drive:
  //    Crea una carpeta en Google Drive, compártela como "Cualquier persona con el enlace" (lector),
  //    y pega el ID de la carpeta aquí (el código largo al final del link de la carpeta):
  googleDriveFolderId: "1A7yPvXrgOzis2ZARpbeksgvBI4VKA1AG",

  // ════════════════════════════════════════════════════════════
  //  FOTOS — una sola lista, todo va a img/album/
  //
  //  Los polaroids flotantes del home agarran 4 fotos al azar
  //  de esta misma lista cada vez que se abre la página.
  //  La galería muestra todas en orden.
  // ════════════════════════════════════════════════════════════
  photos: [
    // { src: "img/album/foto1.jpg", caption: "Nuestra primera salida" },
    // { src: "img/album/foto2.jpg", caption: "En INTEC" },
    // { src: "img/album/foto3.jpg", caption: "" },
  ],

  moments: []
};
