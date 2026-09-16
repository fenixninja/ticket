// Estado global de la aplicación
const AppState = {
  currentLang: 'es',
  translations: {},
  concerts: []
};

// 1. Selector e inicializador de idioma (Detección automática + fallback + localStorage)
async function initI18n() {
  try {
    const res = await fetch('data/translations.json');
    AppState.translations = await res.json();
  } catch (e) {
    console.error('Error cargando traducciones:', e);
    AppState.translations = {};
  }

  const savedLang = localStorage.getItem('tickees_lang');
  const browserLang = (navigator.language || navigator.userLanguage || 'es').slice(0, 2).toLowerCase();
  
  if (savedLang && AppState.translations[savedLang]) {
    AppState.currentLang = savedLang;
  } else if (AppState.translations[browserLang]) {
    AppState.currentLang = browserLang;
  } else {
    AppState.currentLang = 'es';
  }

  // Sincronizar select si existe
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = AppState.currentLang;
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
}

function setLanguage(lang) {
  if (AppState.translations[lang]) {
    AppState.currentLang = lang;
    localStorage.setItem('tickees_lang', lang);
    renderApp();
  }
}

function t(key) {
  return AppState.translations[AppState.currentLang]?.[key] || AppState.translations['es']?.[key] || key;
}

// 2. Motor de Fechas Automáticas (Siempre posteriores al día en que se abre la web)
function getFutureDate(daysOffset = 3) {
  const now = new Date();
  const future = new Date(now);
  future.setDate(now.getDate() + Math.max(1, daysOffset));

  // Formatear según el idioma actual
  const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
  try {
    return new Intl.DateTimeFormat(AppState.currentLang, options).format(future);
  } catch (e) {
    return `${future.getDate()}/${future.getMonth() + 1}/${String(future.getFullYear()).slice(-2)}`;
  }
}

// 3. Renderizado del código de barras
function generateBarcodeHTML(binaryCode) {
  let cells = '';
  for (let i = 0; i < binaryCode.length; i++) {
    const bg = binaryCode[i] === '1' ? '#000000' : '#ffffff';
    cells += `<td style="background-color: ${bg};"></td>`;
  }
  return `<table class="barcode-table"><tr>${cells}</tr></table>`;
}

// Renderizado de números seriales
function generateSerialNumbersHTML(serialNumber) {
  const digits = serialNumber.split('');
  const cells = digits.map(d => `<td>${d}</td>`).join('');
  return `<table class="numbers-table"><tr>${cells}</tr></table>`;
}

// 4. Renderizado de las tarjetas de conciertos en el contenedor
function renderConcerts() {
  const container = document.getElementById('concertsContainer');
  if (!container) return;

  container.innerHTML = '';

  AppState.concerts.forEach(concert => {
    const calculatedDate = getFutureDate(concert.daysOffset || 3);
    const barcodeHTML = generateBarcodeHTML(concert.barcode);
    const serialHTML = generateSerialNumbersHTML(concert.serialNumber);

    const ticketCard = document.createElement('article');
    ticketCard.className = 'ticket-card';
    ticketCard.innerHTML = `
      <div class="ticket-holes-top"></div>
      
      <div class="ticket-header">
        <p class="ticket-venue">${concert.tour} ${t('presents')}</p>
        <h2 class="ticket-artist">${concert.artist}</h2>
      </div>

      <div class="ticket-poster">
        <img src="${concert.poster}" alt="${concert.artist}" loading="lazy" />
      </div>

      <div class="ticket-info">
        <table class="ticket-data-table">
          <thead>
            <tr>
              <th>${t('screen')}</th>
              <th>${t('row')}</th>
              <th>${t('seat')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="bigger">${concert.screen}</td>
              <td class="bigger">${concert.row}</td>
              <td class="bigger">${concert.seat}</td>
            </tr>
          </tbody>
        </table>

        <table class="ticket-data-table">
          <thead>
            <tr>
              <th>${t('price')}</th>
              <th>${t('date')}</th>
              <th>${t('time')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${concert.currency}${concert.price.toFixed(2)}</td>
              <td>${calculatedDate}</td>
              <td>${concert.time}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ticket-holes-lower"></div>

      <div class="ticket-serial">
        <div class="barcode-wrapper">
          ${barcodeHTML}
        </div>
        <div class="numbers-wrapper">
          ${serialHTML}
        </div>
      </div>
    `;

    container.appendChild(ticketCard);
  });
}

// 5. Renderizado del Announcement Bar (Top Bar dinámico con conciertos y multi-idioma)
function renderAnnouncements() {
  const track = document.getElementById('announcementTrack');
  const badgeText = document.getElementById('announcementBadgeText');
  if (badgeText) {
    badgeText.textContent = t('liveNow');
  }
  if (!track) return;

  if (!AppState.concerts || AppState.concerts.length === 0) {
    track.innerHTML = '';
    return;
  }

  // Generamos los items para los conciertos
  const concertItems = AppState.concerts.map((concert, index) => {
    const formattedDate = getFutureDate(concert.daysOffset || 3);
    return `
      <div class="announcement-item" data-concert-index="${index}">
        <span class="announcement-ticket-icon">🎟️</span>
        <strong class="announcement-artist">${concert.artist}</strong>
        <span class="announcement-separator">•</span>
        <span class="announcement-tour">${concert.tour}</span>
        <span class="announcement-badge-stage">${concert.screen}</span>
        <span class="announcement-date">📅 ${formattedDate}</span>
        <span class="announcement-price">${t('fromPrice')} ${concert.currency}${concert.price.toFixed(2)}</span>
        <span class="announcement-btn">${t('buyTicket')} →</span>
      </div>
    `;
  }).join('<span class="announcement-bullet">★</span>');

  // Duplicamos el contenido para garantizar un bucle continuo e infinito (seamless marquee)
  track.innerHTML = `
    <div class="announcement-content">${concertItems}</div>
    <div class="announcement-content" aria-hidden="true">${concertItems}</div>
  `;

  // Interacción al hacer click en un item del ticker: scroll suave al ticket correspondiente
  track.querySelectorAll('.announcement-item').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = el.getAttribute('data-concert-index');
      const cards = document.querySelectorAll('.ticket-card');
      if (cards && cards[idx]) {
        cards[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        cards[idx].classList.add('ticket-highlight');
        setTimeout(() => {
          cards[idx].classList.remove('ticket-highlight');
        }, 1800);
      }
    });
  });
}

// Cargar conciertos
async function loadConcerts() {
  try {
    const res = await fetch('data/concerts.json');
    AppState.concerts = await res.json();
  } catch (e) {
    console.error('Error cargando conciertos:', e);
    AppState.concerts = [];
  }
}

function renderApp() {
  renderAnnouncements();
  renderConcerts();
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  await initI18n();
  await loadConcerts();
  renderApp();
});

