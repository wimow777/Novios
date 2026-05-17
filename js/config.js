// ============================================================
//  CONFIGURACIÓN — edita solo este archivo
// ============================================================

const CONFIG = {
  password: "nosotros",

  startDate: new Date(2025, 4, 17),   // 17 mayo 2025

  // ── Google Sheets → Planes & Metas ───────────────────────
  // 1. Crea un Google Sheet con columnas: Emoji | Plan | Descripción | Estado
  // 2. Archivo → Compartir → "Cualquier persona con el enlace" (solo lectura)
  // 3. Copia el ID del link: docs.google.com/spreadsheets/d/[ESTE_ID]/edit
  // 4. Pega abajo reemplazando TU_SHEET_ID
  sheetsUrl: "https://docs.google.com/spreadsheets/d/1GCzx4Fe8Al75Ue2sVV33eZbqrlbO6DjJtND7w_to7OI/gviz/tq?tqx=out:json&sheet=Sheet1",

  // 5. [OPCIONAL] Para marcar como hecho/pendiente desde la página web:
  //    Crea un Google Apps Script en tu Sheet, publícalo como Web App y pega la URL aquí:
  sheetsUpdateUrl: "https://script.google.com/macros/s/AKfycbxljaj8p6h-mYLIcMFEnk-nlazm9h8ecLhteGbrsFcuPaM3e2E8py7Yyj77qyuTa5c1/exec",

  // 6. [OPCIONAL] Para cargar TODAS tus fotos automáticamente desde una carpeta de Google Drive:
  //    Crea una carpeta en Google Drive, compártela como "Cualquier persona con el enlace" (lector),
  //    y pega el ID de la carpeta aquí (el código largo al final del link de la carpeta):
  googleDriveFolderId: "",

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

  moments: [
    {
      date: "Noviembre 2022",
      event: "Cuando nos conocimos",
      desc: "Todavía no sabíamos lo que vendría. Pero algo empezó ahí."
    },
    {
      date: "17 de mayo, 2025",
      event: "La primera noche como novios",
      desc: "Flores, lluvia, comida buena. Y tú que te fuiste a dormir con las flores."
    },
    {
      date: "Junio 2025",
      event: "Haikyuu y pizza en casa de Riki",
      desc: "Juntarnos y terminar viendo anime juntos. El partido del Shiratorizawa nos esperaba."
    },
    {
      date: "Todo el año",
      event: "INTEC, tapones y todo lo demás",
      desc: "Parciales, profes insoportables, bolas, apagones — y nosotros en medio de todo eso igual."
    },
    {
      date: "Mayo 2026",
      event: "Un año juntos",
      desc: "Llegamos. Y ojalá que sean muchos más, mi reinaa."
    },
  ]
};
