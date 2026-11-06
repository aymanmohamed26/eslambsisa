/**
 * ESLAM BSISA PHOTOGRAPHY - Gallery & Lightbox Controller
 * Session Details page, fullscreen image viewer, navigation, touch swipe, and social sharing.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (document.body.getAttribute('data-page') !== 'session') return;

  if (window.DataStore) await window.DataStore.init();
  if (window.I18n) window.I18n.init();

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('id');

  if (!sessionId) {
    renderSessionNotFound();
    return;
  }

  await loadSessionDetails(sessionId);

  window.addEventListener('languageChanged', async () => {
    await loadSessionDetails(sessionId);
  });
});

let currentSession = null;
let currentPhotos = [];
let currentLightboxIndex = 0;

async function loadSessionDetails(sessionId) {
  const isAr = window.I18n && window.I18n.isRTL();
  const session = await window.DataStore.getSessionById(sessionId);

  if (!session) {
    renderSessionNotFound();
    return;
  }

  currentSession = session;
  currentPhotos = session.photos || [session.coverImage];

  const categories = await window.DataStore.getCategories();
  const locations = await window.DataStore.getLocations();
  const allSessions = await window.DataStore.getSessions(false);

  const cat = categories.find(c => c.id === session.category) || {};
  const loc = locations.find(l => l.id === session.locationId) || {};
  const catName = isAr ? (cat.nameAr || cat.name) : (cat.name || session.category);
  const locName = isAr ? (loc.nameAr || loc.name) : (loc.name || session.locationId);
  const title = isAr ? (session.titleAr || session.title) : session.title;
  const desc = isAr ? (session.descriptionAr || session.description) : session.description;

  // Update Page Title & OpenGraph
  document.title = `${title} — ESLAM BSISA PHOTOGRAPHY`;
  updateMetaTags(title, desc, session.coverImage);

  // Populate Hero Elements
  const heroCover = document.getElementById('session-hero-cover');
  const sessionTitleEl = document.getElementById('session-title');
  const sessionCatBadge = document.getElementById('session-cat-badge');
  const sessionLocBadge = document.getElementById('session-loc-badge');
  const sessionDateBadge = document.getElementById('session-date-badge');
  const sessionDescEl = document.getElementById('session-description');
  const sessionPhotoCountEl = document.getElementById('session-photo-count');

  if (heroCover) heroCover.src = window.DataStore.resolvePath(session.coverImage);
  if (sessionTitleEl) sessionTitleEl.textContent = title;
  if (sessionCatBadge) sessionCatBadge.textContent = catName;
  if (sessionLocBadge) sessionLocBadge.textContent = `📍 ${locName}`;
  if (sessionDateBadge) sessionDateBadge.textContent = `📅 ${session.date || ''}`;
  if (sessionDescEl) sessionDescEl.textContent = desc;
  if (sessionPhotoCountEl) sessionPhotoCountEl.textContent = `${currentPhotos.length} ${isAr ? 'صورة فوتوغرافية' : 'Photographs'}`;

  // Render Photo Gallery Grid
  const galleryGrid = document.getElementById('session-gallery-grid');
  if (galleryGrid) {
    galleryGrid.innerHTML = currentPhotos.map((photoPath, index) => {
      const resolved = window.DataStore.resolvePath(photoPath);
      // Vary aspect ratio slightly for editorial masonry feel
      const isLandscape = index % 3 === 0;
      return `
        <div class="gallery-item ${isLandscape ? 'landscape' : ''}" data-index="${index}">
          <img src="${resolved}" alt="${window.DataStore.escapeAttr(title)} - ${index + 1}" class="gallery-img" loading="lazy" />
          <div class="gallery-item-overlay">
            <div class="gallery-zoom-icon">🔍</div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers to open lightbox
    galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        openLightbox(idx);
      });
    });
  }

  // Setup Share Session
  const shareBtn = document.getElementById('session-share-btn');
  if (shareBtn) {
    shareBtn.onclick = () => shareCurrentSession(title, desc);
  }

  // Previous & Next Session Navigation
  setupPrevNextSessionNav(allSessions, session.id);

  // Related Sessions
  renderRelatedSessions(allSessions, session, categories, locations);

  // Initialize Lightbox Controls & Touch Gestures
  initLightbox();
}

function updateMetaTags(title, desc, coverImg) {
  const setMeta = (property, content) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('og:title', title);
  setMeta('og:description', desc);
  setMeta('og:image', window.location.origin + '/' + coverImg);
  setMeta('og:url', window.location.href);
}

function renderSessionNotFound() {
  const main = document.querySelector('main');
  const isAr = window.I18n && window.I18n.isRTL();
  if (main) {
    main.innerHTML = `
      <section class="section" style="min-height:70vh; display:flex; align-items:center; justify-content:center; text-align:center;">
        <div class="container">
          <h1 class="serif-font" style="font-size:3rem; margin-bottom:1.5rem; color:var(--gold-accent);">404</h1>
          <h2 style="margin-bottom:1rem;">${isAr ? 'الجلسة غير موجودة' : 'Session Not Found'}</h2>
          <p style="color:var(--text-secondary); margin-bottom:2rem; max-width:480px; margin-inline:auto;">
            ${isAr ? 'عذراً، الجلسة التي تبحث عنها غير متاحة أو تم تعديل الرابط الخاص بها.' : 'The photography session you are looking for is either unpublished or moved.'}
          </p>
          <a href="work.html" class="btn btn-primary">
            ${isAr ? 'العودة لمعرض الأعمال' : 'Back to Portfolio'}
          </a>
        </div>
      </section>
    `;
  }
}

function setupPrevNextSessionNav(allSessions, currentId) {
  const isAr = window.I18n && window.I18n.isRTL();
  const currentIndex = allSessions.findIndex(s => s.id === currentId);
  if (currentIndex === -1) return;

  const prevSession = currentIndex > 0 ? allSessions[currentIndex - 1] : null;
  const nextSession = currentIndex < allSessions.length - 1 ? allSessions[currentIndex + 1] : null;

  const prevBtn = document.getElementById('session-nav-prev');
  const nextBtn = document.getElementById('session-nav-next');

  if (prevBtn) {
    if (prevSession) {
      const prevTitle = isAr ? (prevSession.titleAr || prevSession.title) : prevSession.title;
      prevBtn.href = `session.html?id=${encodeURIComponent(prevSession.id)}`;
      prevBtn.style.visibility = 'visible';
      prevBtn.querySelector('.nav-label').textContent = prevTitle;
    } else {
      prevBtn.style.visibility = 'hidden';
    }
  }

  if (nextBtn) {
    if (nextSession) {
      const nextTitle = isAr ? (nextSession.titleAr || nextSession.title) : nextSession.title;
      nextBtn.href = `session.html?id=${encodeURIComponent(nextSession.id)}`;
      nextBtn.style.visibility = 'visible';
      nextBtn.querySelector('.nav-label').textContent = nextTitle;
    } else {
      nextBtn.style.visibility = 'hidden';
    }
  }
}

function renderRelatedSessions(allSessions, currentSession, categories, locations) {
  const isAr = window.I18n && window.I18n.isRTL();
  const relatedGrid = document.getElementById('related-sessions-grid');
  if (!relatedGrid) return;

  const related = allSessions
    .filter(s => s.id !== currentSession.id && (s.category === currentSession.category || s.locationId === currentSession.locationId))
    .slice(0, 3);

  if (related.length === 0) {
    document.getElementById('related-sessions-section').style.display = 'none';
    return;
  }

  relatedGrid.innerHTML = related.map(session => {
    const cat = categories.find(c => c.id === session.category) || {};
    const loc = locations.find(l => l.id === session.locationId) || {};
    const catName = isAr ? (cat.nameAr || cat.name) : (cat.name || session.category);
    const locName = isAr ? (loc.nameAr || loc.name) : (loc.name || session.locationId);
    const title = isAr ? (session.titleAr || session.title) : session.title;
    const coverImg = window.DataStore.resolvePath(session.coverImage);
    const sessionUrl = `session.html?id=${encodeURIComponent(session.id)}`;

    return `
      <article class="session-card">
        <a href="${sessionUrl}" class="session-card-thumb-wrapper" aria-label="${window.DataStore.escapeAttr(title)}">
          <img src="${coverImg}" alt="${window.DataStore.escapeAttr(title)}" class="session-card-img" loading="lazy" />
          <div class="session-badge-group">
            <span class="badge badge-gold">${window.DataStore.escapeHtml(catName)}</span>
          </div>
        </a>
        <div class="session-card-body">
          <h4 class="session-card-title" style="font-size:1.15rem;">
            <a href="${sessionUrl}">${window.DataStore.escapeHtml(title)}</a>
          </h4>
          <div class="session-card-meta" style="margin-bottom:0;">
            <span>📍 ${window.DataStore.escapeHtml(locName)}</span>
            <span>📅 ${window.DataStore.escapeHtml(session.date || '')}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

async function shareCurrentSession(title, desc) {
  const shareData = {
    title: title,
    text: desc,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (e) {
      // Fallback to clipboard
    }
  }

  // Fallback: Copy link
  try {
    await navigator.clipboard.writeText(window.location.href);
    const isAr = window.I18n && window.I18n.isRTL();
    if (window.showToast) {
      window.showToast(isAr ? 'تم نسخ رابط الجلسة إلى الحافظة بنجاح!' : 'Session link copied to clipboard!');
    } else {
      alert('Link copied to clipboard!');
    }
  } catch (err) {
    prompt('Copy session link:', window.location.href);
  }
}

/* ==========================================================================
   Fullscreen Lightbox Modal with Keyboard & Mobile Touch Gestures
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('gallery-lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');
  const fullscreenBtn = document.getElementById('lightbox-fullscreen-btn');

  if (!modal) return;

  closeBtn?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', prevLightboxImage);
  nextBtn?.addEventListener('click', nextLightboxImage);

  fullscreenBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      modal.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightboxImage();
    if (e.key === 'ArrowLeft') prevLightboxImage();
  });

  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
  }, { passive: true });

  function handleSwipeGesture() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left
        nextLightboxImage();
      } else {
        // Swiped right
        prevLightboxImage();
      }
    }
  }
}

function openLightbox(index) {
  const modal = document.getElementById('gallery-lightbox-modal');
  if (!modal) return;

  currentLightboxIndex = index;
  updateLightboxView();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const modal = document.getElementById('gallery-lightbox-modal');
  if (!modal) return;

  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

function prevLightboxImage() {
  if (currentPhotos.length <= 1) return;
  currentLightboxIndex = (currentLightboxIndex - 1 + currentPhotos.length) % currentPhotos.length;
  updateLightboxView();
}

function nextLightboxImage() {
  if (currentPhotos.length <= 1) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % currentPhotos.length;
  updateLightboxView();
}

function updateLightboxView() {
  const imgEl = document.getElementById('lightbox-active-img');
  const counterEl = document.getElementById('lightbox-counter-text');
  const isAr = window.I18n && window.I18n.isRTL();

  if (imgEl && currentPhotos[currentLightboxIndex]) {
    imgEl.src = window.DataStore.resolvePath(currentPhotos[currentLightboxIndex]);
  }

  if (counterEl) {
    counterEl.textContent = `${currentLightboxIndex + 1} / ${currentPhotos.length}`;
  }
}
