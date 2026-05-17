# 👩‍❤️‍👨 Resumen Técnico del Proyecto — Web de Aniversario

Este documento sirve como referencia completa y detallada del diseño, arquitectura y automatizaciones implementadas en este sitio web de aniversario. Está diseñado para que cualquier desarrollador o asistente de IA (como Claude o Gemini) pueda entender el sistema al 100% de inmediato.

---

## 🚀 1. Descripción General del Proyecto
Es una aplicación web **Mobile-First** premium para celebrar un aniversario de novios. Cuenta con una pantalla de bloqueo con clave de seguridad, efectos de cortinas deslizantes de tela en 3D, y cinco vistas interactivas principales: **Home Hub**, **Carta**, **Galería de fotos**, **Línea de tiempo (Momentos)**, **Planes de pareja**, y **Gustos de ella**. 

---

## 📂 2. Arquitectura de Archivos y Componentes

### 📄 `index.html`
* **Lock Screen / Pantalla de Bloqueo:** Implementa un contenedor con perspectiva 3D, dos cortinas animadas (`.curtain-left` y `.curtain-right`) con efecto de onda sinusoidal y simulación de pliegues de tela en color rojo pastel, y un cuadro de contraseña central con efecto vidrio esmerilado (*glassmorphic*).
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
  * `password`: Clave de desbloqueo (por defecto: `"nosotros"`).
  * `startDate`: Fecha de inicio de noviazgo (`new Date(2025, 4, 17)` para el 17 de mayo de 2025).
  * `sheetsUrl`: Enlace de consulta pública a Google Sheets.
  * `sheetsUpdateUrl`: Endpoint de Google Apps Script Web App para sincronización bidireccional.
  * `googleDriveFolderId`: ID de la carpeta de Google Drive que contiene las fotos.

### 🛠️ `js/main.js`
* **Inicialización:** Carga dinámicamente las fotos y los planes antes de renderizar la página.
* **Lector de Fotos de Google Drive:** Si `googleDriveFolderId` está definido, realiza una petición `GET` asincrónica al Apps Script para obtener los IDs y nombres de los archivos. 
* **Conversión CDN de Imágenes:** Transforma los IDs de los archivos de Google Drive al endpoint de alto rendimiento de Google: `https://lh3.googleusercontent.com/d/{FILE_ID}` para renderizado directo en la web.
* **Controlador del Lock Screen:** Compara la contraseña en formato SHA-256 (o texto plano para facilidad) y despliega las cortinas en 3D (`.open`) reproduciendo la música de fondo en bucle.

### 📝 `js/planes.js`
* **Lector de Sheets API:** Consulta la API de Visualización de Google (`/gviz/tq`) para traer los planes en formato JSON.
* **Filtros Robustos:** Excluye automáticamente las cabeceras visuales de las primeras filas del Sheet (`A, B, C, D`, `Emoji`, `Plan`, `Estado`, etc.).
* **Actualización Optimista (Optimistic UI):** Cuando el usuario presiona el botón de check (`✓`):
  1. Cambia el estado en la interfaz inmediatamente de forma visual (de *Pendiente* a *Hecho* o viceversa).
  2. Activa un estado de carga (`.is-updating`) con un spinner giratorio dentro del botón.
  3. Envía una petición `POST` segura (`Content-Type: text/plain` y `mode: 'no-cors'` para saltar restricciones de CORS) al Apps Script de Google.
  4. Si la petición es exitosa, dispara una animación de pulso verde brillante.
  5. Si falla, hace rollback (revierte) al estado anterior de forma transparente y sacude la tarjeta en color rojo.

### 🌸 `js/animations.js`
* **createPetals():** Genera 20 pétalos flotantes con variaciones aleatorias de tamaño, color lila/rosa, velocidad y retraso, cayendo en cascada en la pantalla principal.
* **createNotes():** Genera notas musicales flotantes en el inicio para simular melodía.
* **createPolaroids():** Construye dinámicamente **5 polaroids flotantes** en el Home Hub:
  * Ubicaciones calibradas en los cuatro extremos de la pantalla y una quinta en la zona media-derecha para balance visual.
  * Selecciona 5 fotos aleatorias sin repetir del pool de Google Drive (o de la lista estática).
  * Asigna a cada polaroid una rotación, duración y desfase de flotación únicos.

---

## 🔗 3. Backend e Integración con Google Cloud

Para lograr un sistema 100% gratuito, seguro y sin necesidad de base de datos ni servidores externos, se implementó un **puente serverless** en **Google Apps Script** conectado al Google Sheet del usuario.

### Código del Apps Script (Desplegado como Web App):
```javascript
function doGet(e) {
  var action = e.parameter.action;
  
  // Endpoint para listar fotos de Google Drive
  if (action === "getPhotos") {
    var folderId = e.parameter.folderId;
    if (!folderId) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Folder ID no provisto" }))
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
            name: file.getName().replace(/\.[^/.]+$/, "") // Quita la extensión del archivo
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ photos: photos }))
                           .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput("Endpoint activo").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var planName = data.plan;
    var nextEstado = data.estado;
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getLastRow();
    
    // Busca la fila que coincida con el nombre del plan y actualiza la columna D (Estado)
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
