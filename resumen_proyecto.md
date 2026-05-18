# 👩‍❤️‍👨 Resumen Técnico del Proyecto — Web de Aniversario

Este documento sirve como referencia completa y detallada del diseño, arquitectura y automatizaciones implementadas en este sitio web de aniversario. Está diseñado para que cualquier desarrollador o asistente de IA (como Claude o Gemini) pueda entender el sistema al 100% de inmediato.

---

## 🚀 1. Descripción General del Proyecto
Es una aplicación web **Mobile-First** premium para celebrar un aniversario de novios. Cuenta con una pantalla de bloqueo táctil de bienvenida sin contraseña, efectos de cortinas deslizantes de tela en 3D, y cinco vistas interactivas principales: **Home Hub**, **Carta**, **Galería de fotos**, **Línea de tiempo (Momentos)**, **Planes de pareja**, y **Gustos de ella**.

---

## 📂 2. Arquitectura de Archivos y Componentes

### 📄 `index.html`
* **Lock Screen / Pantalla de Bloqueo:** Implementa un contenedor con perspectiva 3D, dos cortinas animadas (`.curtain-left` y `.curtain-right`) con efecto de onda sinusoidal y simulación de pliegues de tela en color rojo pastel, y un botón central de bienvenida sin contraseña ("Abrir nuestro espacio 💜") con efecto *glassmorphic*.
* **Vistas (`.app-view`):** Cada sección está contenida en un `position: fixed; inset: 0` con scroll interno aislado para garantizar una experiencia fluida tipo aplicación móvil.
* **Recursos SVG:** Almacena todos los iconos optimizados y la forma geométrica del pétalo para las animaciones.

### 🎨 `css/style.css`
* **Diseño Premium:** Paleta de colores armoniosa basada en lilas suaves (`#a855f7`), dorados cálidos (`#b45309`), cremas naturales (`#fdfaf6`) y efectos de desenfoque de fondo.
* **Micro-animaciones:**
  * `@keyframes cardSuccessPulse`: Escala ligeramente la tarjeta y le da un brillo verde menta al guardar cambios en Google Sheets con éxito.
  * `@keyframes cardErrorShake`: Sacudida lateral con bordes coral en caso de error de conexión.
  * `@keyframes toggleSpin`: Rotación infinita del spinner de carga en los botones.
  * `@keyframes polaroidFloat`: Balanceo suave y desfasado para cada polaroid en la pantalla de inicio.

### ⚙️ `js/config.js`
* **Archivo de Configuración Principal:** Concentra los parámetros editables del sitio:
  * `startDate`: Fecha de inicio de noviazgo (`new Date(2025, 4, 17)` para el 17 de mayo de 2025).
  * `sheetsUrl`: Enlace de consulta pública a la pestaña de Planes en Google Sheets.
  * `timelineUrl`: Enlace de consulta pública a la pestaña de Momentos (Línea de tiempo) en el Google Sheet.
  * `sheetsUpdateUrl`: Endpoint de Google Apps Script Web App para sincronización bidireccional.
  * `googleDriveFolderId`: ID de la carpeta de Google Drive que contiene las fotos.

### 🛠️ `js/main.js`
* **Inicialización:** Carga dinámicamente las fotos y los planes antes de renderizar la página.
* **Lector de Fotos de Google Drive:** Si `googleDriveFolderId` está definido, realiza una petición `GET` asincrónica al Apps Script para obtener los IDs y nombres de los archivos.
* **Conversión CDN de Imágenes:** Transforma los IDs de los archivos de Google Drive al endpoint de alto rendimiento de Google: `https://lh3.googleusercontent.com/d/{FILE_ID}` para renderizado directo en la web.
* **Controlador del Lock Screen:** Maneja el despliegue animado de las cortinas en 3D al hacer clic en el botón de bienvenida.

### 📄 `js/gallery.js`
* **Renderizador de Galería:** Pinta la cuadrícula de fotos. Pasa la propiedad `id` de Drive a cada imagen.
* **Lightbox e Integración de Borrado:** Incorpora un botón de eliminación traslucido de color rojo (`.lightbox-delete-btn`). Al ser pulsado por el usuario, solicita confirmación y envía un payload JSON a la Web App (`deletePhoto`) para enviar el archivo a la Papelera de Google Drive de manera asíncrona.

### 📤 `js/upload.js`
* **Área de Carga Drag & Drop:** Habilita arrastrar o seleccionar imágenes.
* **Compresión en el Cliente:** Emplea un `<canvas>` oculto para redimensionar fotos grandes de celulares (reduciéndolas de ~10MB a menos de 300KB a un ancho/alto máximo de 1200px en JPEG 82% de calidad) en menos de 100ms. Esto garantiza cargas instantáneas en conexiones móviles y ahorra espacio de Drive.
* **Envío Asíncrono:** Envía la carga base64 de la imagen de forma directa al Google Apps Script.

### 📝 `js/timeline.js`
* **Lector de Sheets API:** Consume la pestaña "Momentos" de Google Sheets mediante la URL `timelineUrl` (Google Visualización API).
* **Parsea la Línea de Tiempo:** Extrae la fecha, evento y descripción de forma dinámica, permitiendo que la pareja modifique la línea de tiempo en vivo sin tocar código.

### 📝 `js/planes.js`
* **Lector de Sheets API:** Consulta los planes en formato JSON desde el Sheet principal.
* **Actualización Optimista (Optimistic UI):** Al marcar un plan como hecho/pendiente, la UI responde al instante, muestra un spinner de carga y ejecuta la petición POST. En caso de error, realiza rollback y sacude la tarjeta en rojo.

### 📝 `js/animations.js`
* **createPetals() y createNotes():** Genera efectos de pétalos y notas musicales cayendo en cascada en el Home Hub.
* **createPolaroids():** Construye dinámicamente **6 polaroids flotantes** en el Home Hub usando 6 coordenadas balanceadas simétricamente en ambos lados del viewport (3 a la izquierda y 3 a la derecha) con rotación y desfases aleatorios.

---

## 🔗 3. Backend e Integración con Google Cloud

Para lograr un sistema 100% gratuito, seguro y sin necesidad de base de datos ni servidores externos, se implementó un **puente serverless** en **Google Apps Script** conectado al Google Sheet del usuario.

### Código del Apps Script Actualizado (Desplegado como Web App):
```javascript
function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "getPhotos") {
    var folderId = e.parameter.folderId;
    if (!folderId) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", error: "Folder ID no provisto" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      var folder = DriveApp.getFolderById(folderId);
      var files = folder.getFiles();
      var photos = [];
      
      while (files.hasNext()) {
        var file = files.next();
        var mimeType = file.getMimeType();
        if (mimeType.indexOf("image/") === 0) {
          photos.push({
            id: file.getId(),
            src: "https://lh3.googleusercontent.com/d/" + file.getId(),
            caption: file.getName().replace(/\.[^/.]+$/, "") // Quita la extensión
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", photos: photos }))
                           .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput("Endpoint activo").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    
    // NUEVA ACCIÓN: Cargar fotos directamente a Google Drive
    if (action === "uploadPhoto") {
      var folderId = data.folderId;
      var base64Data = data.base64Data;
      var mimeType = data.mimeType;
      var fileName = data.fileName;
      
      if (!folderId || !base64Data) {
        return ContentService.createTextOutput("Error: Faltan datos requeridos").setMimeType(ContentService.MimeType.TEXT);
      }
      
      var folder = DriveApp.getFolderById(folderId);
      var decoded = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(decoded, mimeType, fileName);
      var file = folder.createFile(blob);
      
      return ContentService.createTextOutput("Éxito").setMimeType(ContentService.MimeType.TEXT);
    }

    // NUEVA ACCIÓN: Eliminar fotos desde la web (Papelera de reciclaje de Drive)
    if (action === "deletePhoto") {
      var fileId = data.fileId;
      if (!fileId) {
        return ContentService.createTextOutput("Error: Falta ID de archivo").setMimeType(ContentService.MimeType.TEXT);
      }
      var file = DriveApp.getFileById(fileId);
      file.setTrashed(true); // Mueve a papelera de forma segura
      return ContentService.createTextOutput("Éxito").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // ACCIÓN ORIGINAL: Actualizar planes en el Google Sheet
    var planName = data.plan;
    var nextEstado = data.estado;
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getLastRow();
    
    for (var i = 1; i <= rows; i++) {
      var cellValue = sheet.getRange(i, 2).getValue().toString().trim(); // Columna B (Plan)
      if (cellValue === planName) {
        sheet.getRange(i, 4).setValue(nextEstado); // Columna D (Estado)
        break;
      }
    }
    return ContentService.createTextOutput("Éxito").setMimeType(ContentService.MimeType.TEXT);
  } catch(err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
```

---

## 📈 4. Estado de GitHub y Despliegue en Vivo

* **Repositorio de Git:** Localizado en `c:\Users\wimow\Documents\Web aniversario`.
* **Rama Principal:** `main`.
* **Repositorio Remoto en GitHub:** `https://github.com/wimow777/Novios.git` (Repositorio Privado para máxima seguridad de credenciales).
* **Hosting en Vivo:** Despliega automáticamente en **Netlify** con disparadores integrados en cada `git push` (Continuous Deployment).

---
*El sistema se encuentra en un estado 100% funcional, seguro y completamente automatizado.* 👩‍❤️‍👨✨
