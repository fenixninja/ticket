# 🎟️ TICKEES — WhatAUTH & WhatsApp QR Demo

Demostración técnica de ticketing interactivo y diseño de boletos digitales orientados a la integración de autenticación, validación y entrega de entradas mediante **WhatAUTH** y **códigos QR de WhatsApp**.

> 🌐 **Demo en vivo:** [https://tickees.fenix.ninja/](https://tickees.fenix.ninja/)

---

## 📌 Propósito del Proyecto

El objetivo primordial de este proyecto es ilustrar y servir de prueba de concepto (PoC) para:
- **Demostrar el uso de WhatAUTH**: Autenticación fluida y sin contraseñas a través de WhatsApp.
- **Validación y entrega vía QR de WhatsApp**: Emisión, visualización e interacción con tickets digitales vinculados directamente al ecosistema de WhatsApp para validación de accesos en eventos y conciertos en tiempo real.
- **Experiencia de usuario inmersiva (Ticketing)**: Modelado de entrada con perforado y corte troquelado realista, datos desacoplados en esquemas dinámicos, soporte multi-idioma nativo (i18n) y fechas inteligentes siempre vigentes.

---

## 🚀 Características Principales

- **Integración Conceptual WhatAUTH / WhatsApp QR**: Flujo visual preparado para asociar la identidad del comprador y la validez de la entrada a través de un canal directo y seguro de WhatsApp.
- **Diseño Troquelado Físico (Die-Cut Effect)**: Recreación visual de perforaciones y dientes de rasgado de entradas clásicas mediante CSS puro y matemáticas de recorte sin artefactos de renderizado.
- **Desacoplamiento de Datos (JSON-Driven)**: El catálogo de conciertos y las entradas se alimentan enteramente desde `data/concerts.json`.
- **Motor de Fechas Dinámicas**: Algoritmo que calcula eventos siempre a futuro a partir de la fecha de apertura (`daysOffset`), garantizando que la demo nunca expire.
- **Internacionalización (i18n) Completa**: Detección automática del idioma del navegador, persistencia en `localStorage` y soporte para 7 idiomas:
  - 🇪🇸 Español (`es`)
  - 🇺🇸 English (`en`)
  - 🇩🇪 Deutsch (`de`)
  - 🇫🇷 Français (`fr`)
  - 🇮🇳 हिन्दी (`hi`)
  - 🇨🇳 中文 (`zh`)
  - 🇯🇵 日本語 (`ja`)
- **Código de Barras y Seriales Generados por Software**: Renderizado dinámico de patrones de barras binarias y secuencias seriales de seguridad.
- **Preparado para PWA**: Soporte de favicons y manifiesto para comportamiento standalone e instalable.

---

## 📂 Estructura del Repositorio

```plaintext
ticket/
├── index.html              # Estructura semántica HTML5
├── style.css               # Sistema de diseño, layout flex/grid y efectos troquelados
├── index.js                # Lógica de render dinámico, cálculo de fechas e i18n
├── guide.md                # Guía técnica profunda de la arquitectura
├── agent.md                # Especificaciones funcionales del prototipo
├── data/
│   ├── concerts.json       # Base de datos de conciertos y tickets
│   └── translations.json   # Diccionario con 7 idiomas
├── img/
│   └── fnx_paradise.jpeg   # Poster de muestra del concierto
└── fenix_icons/            # Assets de iconos y favicons multiplataforma
```

---

## 🛠️ Instalación y Uso Local

No requiere dependencias complejas ni transpiladores:

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/ticket.git
   cd ticket
   ```

2. Abre la aplicación con un servidor local (por ejemplo, con Live Server de VSCode o Python):
   ```bash
   # Con Python 3
   python3 -m http.server 8080
   ```

3. Accede en tu navegador a `http://localhost:8080`.

---

## ⚖️ Licencia de Uso No Comercial y Atribución

Este proyecto está publicado bajo una **Licencia No Comercial con Atribución**.

- **Atribución Requerida**: Debes otorgar el crédito correspondiente, proporcionar un enlace a este repositorio y especificar si se han realizado cambios.
- **Uso No Comercial**: No está permitido el uso de este material, su código o derivados con propósitos comerciales o de lucro directo o indirecto sin el consentimiento expreso previo del autor original.

---

## 🙏 Reconocimientos e Inspiración de Diseño

El diseño visual, estilo de entrada y detalles de maquetación han sido inspirados en los trabajos y conceptos de los siguientes autores:

- **A.J. Skelton**: [Movie Ticket en CodePen](https://codepen.io/ajskelton/pen/NdrjBm)
- **Dribbble Movie Ticket Concept**: [Movie Ticket Attachment en Dribbble](https://dribbble.com/shots/1166639-Movie-Ticket/attachments/1166639?mode=media)
- **Kyle Wetton**: [CSS Ticket en CodePen](https://codepen.io/kylewetton/pen/yLBwdJX)
