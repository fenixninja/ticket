# Guía Técnica de Arquitectura y Funcionamiento: TICKEES

Este documento detalla en profundidad la arquitectura, estructura de datos, diseño visual y la lógica de cada función y archivo que compone el proyecto **TICKEES**.

---

## 1. Visión General del Proyecto

**TICKEES** es una aplicación web de venta y gestión de entradas para conciertos (*ticketing*) diseñada bajo un enfoque modular, dinámico y responsivo. Se caracteriza por:
- **Desacoplamiento de datos**: Cero datos quemados (*hardcoded*) en la vista; el contenido proviene de esquemas JSON.
- **Motor de fechas automáticas**: Algoritmo que calcula eventos siempre futuros a la fecha de apertura de la aplicación.
- **Internacionalización nativa (i18n)**: Soporte multilenguaje con detección automática por navegador y persistencia local.
- **Efecto troquelado 3D realista**: Simulación física de un boleto perforado utilizando matemáticas de posicionamiento CSS y fusión cromática sin sombras conflictivas.

---

## 2. Árbol de Archivos y Responsabilidades

```plaintext
ticket/
├── index.html              # Estructura semántica base (HTML5)
├── style.css               # Sistema de diseño, layout, efectos 3D y troquelado
├── index.js                # Lógica de negocio, motor i18n, fechas y render dinámico
├── guide.md                # Documentación técnica exhaustiva
├── agent.md                # Especificación funcional y de requerimientos del sistema
├── data/
│   ├── concerts.json       # Base de datos local de conciertos y metadatos del ticket
│   └── translations.json   # Diccionario de cadenas traducidas en 7 idiomas
├── img/
│   └── fnx_paradise.jpeg   # Poster / imagen del artista del concierto
└── fenix_icons/            # Recursos de favicons y assets para PWA
```

---

## 3. Estructura de Datos (JSON)

### 3.1. `data/concerts.json`
Define el contrato de datos para cada evento/ticket:

```json
[
  {
    "id": "c1",
    "artist": "FNX PARADISE",
    "tour": "LIVE TOUR 2026",
    "poster": "img/fnx_paradise.jpeg",
    "daysOffset": 5,
    "time": "21:30",
    "price": 45.00,
    "currency": "€",
    "screen": "STAGE A",
    "row": "VIP",
    "seat": "12",
    "serialNumber": "9173754445414787341452",
    "barcode": "11010010000100111011001011101111..."
  }
]
```

- **`daysOffset`**: Número entero de días en el futuro a partir de la fecha actual (`Date.now()`). Permite que el concierto nunca expire en la demostración.
- **`barcode`**: Cadena binaria de 0s y 1s que el motor JavaScript transforma directamente en barras negras y espacios en blanco.
- **`serialNumber`**: Dígitos alfanuméricos formateados en celdas individuales para simular la numeración de seguridad de la entrada.

### 3.2. `data/translations.json`
Diccionario de internacionalización indexado por código ISO de idioma:
- **Idiomas soportados**: `es` (Español), `en` (Inglés), `de` (Alemán), `fr` (Francés), `hi` (Hindi), `zh` (Chino), `ja` (Japonés).
- **Campos clave**:
  - `appTitle`: Nombre de la aplicación.
  - `presents`: Cadena de encabezado ("PRESENTA EN CONCIERTO", "PRESENTS IN CONCERT", etc.).
  - `screen`, `row`, `seat`: Encabezados de ubicación de butaca.
  - `price`, `date`, `time`: Encabezados de facturación y temporalidad.

---

## 4. Análisis Detallado de Archivos y Funciones

### 4.1. `index.html`
- **Metadatos y Tipografías**:
  - Preconexión a Google Fonts e importación de **Luckiest Guy** (título 3D y números destacados) y **Outfit** (tipografía moderna para datos y textos).
- **Header (`<header class="header">`)**:
  - Contenedor flexible (`display: flex; justify-content: space-between`).
  - Lado izquierdo: Título corporativo `<h1 class="logo-title"><span>TICK</span><span>EES</span></h1>`.
  - Lado derecho: Selector desplegable `<select id="langSelect">` con banderas y códigos de idioma.
- **Main (`<main class="main-content">`)**:
  - Aloja la sección `<section id="concertsContainer" class="concerts-grid">`, donde JavaScript inyecta los tickets de forma reactiva.
- **Footer (`<footer class="footer">`)**:
  - Pie de página con créditos del autor (`fenix.ninja`) y enlace directo al repositorio de GitHub (`https://github.com/fenixninja/ticket`).

---

### 4.2. `index.js` (Núcleo Funcional)

El script gestiona el ciclo de vida completo de la aplicación sin librerías externas.

#### Objeto de Estado (`AppState`)
```javascript
const AppState = {
  currentLang: 'es',
  translations: {},
  concerts: []
};
```
Mantiene la fuente única de verdad para el idioma activo, el diccionario cargado en memoria y el array de conciertos.

#### Funciones y Lógica Interna:

#### `initI18n(): Promise<void>`
- **Objetivo**: Inicializar el sistema de traducción.
- **Mecanismo**:
  1. Descarga asíncrona de `data/translations.json` mediante `fetch`.
  2. Consulta la preferencia guardada en `localStorage.getItem('tickees_lang')`.
  3. Si no existe en almacenamiento local, inspecciona `navigator.language` / `navigator.userLanguage` tomando los dos primeros caracteres (`es`, `en`, etc.).
  4. Aplica fallback a `'es'` si el idioma del navegador no está soportado.
  5. Sincroniza el valor del `<select id="langSelect">` y registra el *listener* de evento `'change'`.

#### `setLanguage(lang: string): void`
- **Objetivo**: Cambiar el idioma activo en tiempo de ejecución.
- **Mecanismo**: Valida la existencia del idioma en el diccionario, actualiza `AppState.currentLang`, persiste en `localStorage` y ejecuta `renderApp()` para actualizar los textos de la interfaz sin recargar la página.

#### `t(key: string): string`
- **Objetivo**: Función traductora (*helper* de traducción).
- **Mecanismo**: Retorna la traducción de la clave en el idioma actual. Si no existe, recurre a español (`es`), y si tampoco existe, devuelve la propia clave como salvaguarda.

#### `getFutureDate(daysOffset: number): string`
- **Objetivo**: Motor de fechas automáticas relativas a la ejecución.
- **Mecanismo**:
  ```javascript
  const now = new Date();
  const future = new Date(now);
  future.setDate(now.getDate() + Math.max(1, daysOffset));
  ```
  Aplica `Intl.DateTimeFormat(AppState.currentLang, { year: '2-digit', month: '2-digit', day: '2-digit' })` para que la fecha calculada no solo sea siempre posterior al día de apertura de la web, sino que además se formatee según las convenciones culturales del idioma activo (ej. `DD/MM/AA` frente a `MM/DD/AA`).

#### `generateBarcodeHTML(binaryCode: string): string`
- **Objetivo**: Generar un código de barras realista en SVG/HTML sin dependencias externas.
- **Mecanismo**: Itera cada caracter de la cadena binaria:
  - Si es `'1'`: celda `<td>` con fondo `#000000`.
  - Si es `'0'`: celda `<td>` con fondo `#ffffff`.
  - Embolsa el resultado en una tabla con `border-collapse: collapse` y celdas de ancho ultra delgado (2px) y altura definida (45px).

#### `generateSerialNumbersHTML(serialNumber: string): string`
- **Objetivo**: Generar la hilera de dígitos de control bajo el código de barras.
- **Mecanismo**: Divide el string en un arreglo de caracteres individuales y crea una fila de tabla monoespaciada para alinearse exactamente bajo el código.

#### `renderConcerts(): void`
- **Objetivo**: Construir e inyectar el DOM de los tickets en `#concertsContainer`.
- **Mecanismo**:
  1. Limpia el contenedor (`container.innerHTML = ''`).
  2. Recorre `AppState.concerts` generando un elemento `<article class="ticket-card">` con su cabecera, poster, tablas de auditorio/precio y zona perforada.
  3. Conecta las llamadas a `t()` para las etiquetas traducibles y `getFutureDate()` para la fecha dinámica.

#### `loadConcerts(): Promise<void>`
- **Objetivo**: Obtener el catálogo de conciertos desde `data/concerts.json` y popular `AppState.concerts`.

#### Inicialización (`DOMContentLoaded`)
- Ejecuta en secuencia: `await initI18n()`, `await loadConcerts()`, y finalmente `renderApp()`.

---

### 4.3. `style.css` (Técnicas de Render y Diseño)

#### 1. Sistema de Color y Variables
```css
:root {
  --bg-page: #d8bfd8;      /* Thistle (#D8BFD8) base */
  --bg-page-shade: #ccb0cc;
  --aurora-teal: #0fe1b7;
  --aurora-cyan: #00d2ff;
  --aurora-purple: #7b2cbf;
  --dark-text: #1a1a24;
}
```

#### 2. Título 3D con Animación Bop (`.logo-title`)
- **Técnica 3D**: Capas superpuestas mediante `text-shadow` con desplazamientos sutiles en los cuatro cuadrantes para esculpir un relieve tridimensional blanco con contorno negro marcado.
- **Animaciones `@keyframes bop` y `bopB`**: Escalan y rotan sutilmente cada `<span>` (`TICK` y `EES`) de forma desfasada mediante curvas de Bézier cúbicas (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`), generando una sensación elástica y viva.

#### 3. Troquelado Físico del Ticket (Simulación de Perforaciones)
Para que el ticket parezca un billete de papel cortado y con orificios sin recurrir a imágenes externas pesadas:
- **Perforaciones superiores (`.ticket-holes-top`)**:
  - Elemento central circular con `border-radius: 50%` y posición absoluta anclado en `top: -24px`.
  - Pseudoelementos `::before` y `::after` desplazados a la izquierda (`-200px`) y derecha (`200px`) para generar las muescas de las esquinas.
  - **Color**: Utilizan estrictamente `background-color: var(--bg-page)` (`#d8bfd8`), igualando el fondo del `body`.
- **Línea de rasgado inferior (`.ticket-holes-lower`)**:
  - Línea punteada `border-top: 2px dashed #cbd5e0`.
  - Pseudoelementos circulares izquierdo (`left: -18px`) y derecho (`right: -18px`) con `background-color: var(--bg-page)` que recortan limpiamente los laterales del billete.
- **Supresión de sombras (`box-shadow: none`)**:
  - Al no haber sombras proyectadas sobre los agujeros, la ilusión óptica de recorte troquelado es total y sin rebordes oscuros.

---

## 5. Guía de Extensión y Escalabilidad

1. **Añadir más conciertos a la grid**:
   - Basta con agregar nuevos objetos en `data/concerts.json` con su respectiva imagen en la carpeta `img/` y el valor `daysOffset`.
   - Cambiar en CSS la clase `.concerts-grid` a `display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 2rem;` cuando se deseen mostrar los 6 conciertos simultáneamente.
2. **Añadir un nuevo idioma**:
   - Agregar el nuevo código de idioma en `data/translations.json`.
   - Agregar el `<option value="...">` correspondiente en el selector `<select id="langSelect">` de `index.html`.
