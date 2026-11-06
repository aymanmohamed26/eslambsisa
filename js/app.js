/**
 * ESLAM BSISA PHOTOGRAPHY - Core Application Controller
 * Handles navigation, page rendering, dynamic filtering, responsive interactions, and contact flows.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Storage and i18n
  if (window.DataStore) {
    await window.DataStore.init();
  }
  if (window.I18n) {
    window.I18n.init();
  }

  // Global UI Setup
  initHeader();
  initMobileMenu();
  initLangSwitcher();
  initToasts();

  // Page Specific Inits
  const pageType = document.body.getAttribute('data-page');
  const settings = await window.DataStore.getSettings();

  // Populate dynamic header/footer branding
  applyBranding(settings);

  switch (pageType) {
    case 'home':
      await initHomePage(settings);
      break;
    case 'work':
      await initWorkPage();
      break;
    case 'locations':
      await initLocationsPage();
      break;
    case 'about':
      await initAboutPage(settings);
      break;
    case 'contact':
      await initContactPage(settings);
      break;
  }

  // Listen for language changes to re-render dynamic content
  window.addEventListener('languageChanged', async () => {
    applyBranding(settings);
    if (pageType === 'home') await initHomePage(settings);
    if (pageType === 'work') await initWorkPage();
    if (pageType === 'locations') await initLocationsPage();
    if (pageType === 'about') await initAboutPage(settings);
    if (pageType === 'contact') await initContactPage(settings);
  });
});

/* ==========================================================================
   Header & Mobile Navigation
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-nav-backdrop');
  const navLinks = document.querySelectorAll('.mobile-nav-links .nav-link');

  if (!toggleBtn || !drawer) return;

  const toggle = (open) => {
    const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
    drawer.classList.toggle('open', isOpen);
    toggleBtn.classList.toggle('open', isOpen);
    if (backdrop) backdrop.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', () => toggle());
  if (backdrop) backdrop.addEventListener('click', () => toggle(false));
  navLinks.forEach(link => link.addEventListener('click', () => toggle(false)));
}

function initLangSwitcher() {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = btn.getAttribute('data-lang');
      if (window.I18n) {
        window.I18n.setLanguage(targetLang);
      }
    });
  });
}

function initToasts() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  window.showToast = (msg, duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">✨</span> <span>${window.DataStore.escapeHtml(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 350);
    }, duration);
  };
}

function applyBranding(settings) {
  const isAr = window.I18n && window.I18n.isRTL();
  const brandName = isAr ? (settings.brandNameAr || settings.brandName) : settings.brandName;
  const tagline = isAr ? (settings.taglineAr || settings.tagline) : settings.tagline;

  document.querySelectorAll('.brand-name-title').forEach(el => {
    el.textContent = brandName || 'ESLAM BSISA';
  });

  document.querySelectorAll('.footer-brand-desc').forEach(el => {
    el.textContent = tagline || '';
  });

  // Dynamic booking / WhatsApp buttons across header and footer
  const whatsappNum = settings.whatsapp || '201012345678';
  const whatsappText = encodeURIComponent(
    isAr 
      ? 'مرحباً، أود الاستفسار عن حجز جلسة تصوير فوتوغرافي مع إسلام بسيسة.'
      : 'Hello! I would like to inquire about booking a photography session with Eslam Bsisa.'
  );
  const waUrl = `https://wa.me/${whatsappNum}?text=${whatsappText}`;

  document.querySelectorAll('.wa-link-btn').forEach(btn => {
    btn.setAttribute('href', waUrl);
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');
  });

  // Social Links
  if (settings.instagram) {
    document.querySelectorAll('.instagram-link').forEach(el => {
      el.setAttribute('href', settings.instagram);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  }
  if (settings.facebook) {
    document.querySelectorAll('.facebook-link').forEach(el => {
      el.setAttribute('href', settings.facebook);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  }
}

/* ==========================================================================
   Home Page Controller
   ========================================================================== */
async function initHomePage(settings) {
  const isAr = window.I18n && window.I18n.isRTL();

  // Populate Stats Counter
  const statSessionsEl = document.getElementById('stat-sessions-num');
  const statYearsEl = document.getElementById('stat-years-num');
  const statClientsEl = document.getElementById('stat-clients-num');
  const statLocationsEl = document.getElementById('stat-locations-num');

  if (statSessionsEl) statSessionsEl.textContent = `${settings.completedSessions || 650}+`;
  if (statYearsEl) statYearsEl.textContent = `${settings.experienceYears || 9}+`;
  if (statClientsEl) statClientsEl.textContent = `${settings.happyClients || 1200}+`;
  if (statLocationsEl) statLocationsEl.textContent = `${settings.destinationsCount || 18}+`;

  // Render Featured Sessions
  const sessions = await window.DataStore.getSessions(false);
  const categories = await window.DataStore.getCategories();
  const locations = await window.DataStore.getLocations();

  const featuredSessions = sessions.filter(s => s.featured).slice(0, 6);
  const sessionsContainer = document.getElementById('featured-sessions-grid');

  if (sessionsContainer) {
    if (featuredSessions.length === 0) {
      sessionsContainer.innerHTML = `<div class="empty-state">${isAr ? 'لا توجد جلسات مميزة حالياً' : 'No featured sessions found.'}</div>`;
    } else {
      sessionsContainer.innerHTML = featuredSessions.map(session => {
        const cat = categories.find(c => c.id === session.category) || {};
        const loc = locations.find(l => l.id === session.locationId) || {};
        const catName = isAr ? (cat.nameAr || cat.name) : (cat.name || session.category);
        const locName = isAr ? (loc.nameAr || loc.name) : (loc.name || session.locationId);
        const title = isAr ? (session.titleAr || session.title) : session.title;
        const desc = isAr ? (session.descriptionAr || session.description) : session.description;
        const coverImg = window.DataStore.resolvePath(session.coverImage);
        const sessionUrl = `session.html?id=${encodeURIComponent(session.id)}`;

        return `
          <article class="session-card">
            <a href="${sessionUrl}" class="session-card-thumb-wrapper" aria-label="${window.DataStore.escapeAttr(title)}">
              <img src="${coverImg}" alt="${window.DataStore.escapeAttr(title)}" class="session-card-img" loading="lazy" />
              <div class="session-badge-group">
                <span class="badge badge-gold">${window.DataStore.escapeHtml(catName)}</span>
                <span class="badge badge-dark">${window.DataStore.escapeHtml(locName)}</span>
              </div>
            </a>
            <div class="session-card-body">
              <div class="session-card-meta">
                <span>📍 ${window.DataStore.escapeHtml(locName)}</span>
                <span>📅 ${window.DataStore.escapeHtml(session.date || '')}</span>
              </div>
              <h3 class="session-card-title">
                <a href="${sessionUrl}">${window.DataStore.escapeHtml(title)}</a>
              </h3>
              <p class="session-card-desc">${window.DataStore.escapeHtml(desc)}</p>
              <div class="session-card-footer">
                <a href="${sessionUrl}" class="view-session-link">
                  <span>${isAr ? 'مشاهدة الجلسة' : 'View Session'}</span>
                  <span class="arrow-icon-flip">→</span>
                </a>
                <span style="font-size:0.75rem; color:var(--text-muted);">${(session.photos || []).length} ${isAr ? 'صور' : 'Photos'}</span>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }
  }

  // Render Featured Locations
  const locationsContainer = document.getElementById('featured-locations-grid');
  if (locationsContainer) {
    locationsContainer.innerHTML = locations.slice(0, 4).map(loc => {
      const locSessions = sessions.filter(s => s.locationId === loc.id);
      const locName = isAr ? (loc.nameAr || loc.name) : loc.name;
      const govName = isAr ? (loc.governorateAr || loc.governorate) : loc.governorate;
      const desc = isAr ? (loc.descriptionAr || loc.description) : loc.description;
      const coverImg = window.DataStore.resolvePath(loc.coverImage);
      const locUrl = `locations.html?location=${encodeURIComponent(loc.id)}`;

      return `
        <a href="${locUrl}" class="location-card">
          <img src="${coverImg}" alt="${window.DataStore.escapeAttr(locName)}" class="location-card-img" loading="lazy" />
          <div class="location-card-overlay"></div>
          <div class="location-card-content">
            <span class="location-card-badge">${window.DataStore.escapeHtml(govName)}</span>
            <h3 class="location-card-title">${window.DataStore.escapeHtml(locName)}</h3>
            <p class="location-card-desc">${window.DataStore.escapeHtml(desc)}</p>
            <div class="location-card-meta">
              <span>${locSessions.length} ${isAr ? 'جلسات موثقة' : 'Sessions Captured'}</span>
              <span class="arrow-icon-flip">→</span>
            </div>
          </div>
        </a>
      `;
    }).join('');
  }
}

/* ==========================================================================
   My Work / Portfolio Page Controller
   ========================================================================== */
async function initWorkPage() {
  const isAr = window.I18n && window.I18n.isRTL();
  const sessions = await window.DataStore.getSessions(false);
  const categories = await window.DataStore.getCategories();
  const locations = await window.DataStore.getLocations();

  const tabsWrapper = document.getElementById('category-filter-tabs');
  const sessionsContainer = document.getElementById('work-sessions-grid');
  const searchInput = document.getElementById('work-search-input');

  let activeCategory = 'all';
  let searchQuery = '';

  // Check URL query parameters for pre-selected category
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('category')) {
    activeCategory = urlParams.get('category');
  }

  // Render Filter Tabs
  if (tabsWrapper) {
    const allTabHtml = `
      <button class="filter-tab ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">
        ${isAr ? 'كافة الأعمال' : 'All Stories'}
      </button>
    `;
    const catTabsHtml = categories.map(cat => {
      const catName = isAr ? (cat.nameAr || cat.name) : cat.name;
      const isActive = activeCategory === cat.id ? 'active' : '';
      return `
        <button class="filter-tab ${isActive}" data-cat="${window.DataStore.escapeAttr(cat.id)}">
          ${window.DataStore.escapeHtml(catName)}
        </button>
      `;
    }).join('');

    tabsWrapper.innerHTML = allTabHtml + catTabsHtml;

    // Attach click events to tabs
    tabsWrapper.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsWrapper.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = tab.getAttribute('data-cat');
        renderFilteredSessions();
      });
    });
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderFilteredSessions();
    });
  }

  const renderFilteredSessions = () => {
    if (!sessionsContainer) return;

    let filtered = sessions;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(s => s.category === activeCategory);
    }

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(s => {
        const titleEn = (s.title || '').toLowerCase();
        const titleAr = (s.titleAr || '').toLowerCase();
        const loc = locations.find(l => l.id === s.locationId) || {};
        const locEn = (loc.name || '').toLowerCase();
        const locAr = (loc.nameAr || '').toLowerCase();
        return titleEn.includes(searchQuery) || 
               titleAr.includes(searchQuery) || 
               locEn.includes(searchQuery) || 
               locAr.includes(searchQuery);
      });
    }

    if (filtered.length === 0) {
      sessionsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 4rem 1rem;">
          <p style="color:var(--text-secondary); font-size:1.1rem; margin-bottom:1rem;">
            ${isAr ? 'لم نتمكن من العثور على جلسات مطابقة لبحثك.' : 'No photography sessions matched your selection.'}
          </p>
          <button class="btn btn-outline btn-sm" onclick="document.querySelector('[data-cat=\\'all\\']').click();">
            ${isAr ? 'إعادة ضبط التصفية' : 'Reset Filters'}
          </button>
        </div>
      `;
      return;
    }

    sessionsContainer.innerHTML = filtered.map(session => {
      const cat = categories.find(c => c.id === session.category) || {};
      const loc = locations.find(l => l.id === session.locationId) || {};
      const catName = isAr ? (cat.nameAr || cat.name) : (cat.name || session.category);
      const locName = isAr ? (loc.nameAr || loc.name) : (loc.name || session.locationId);
      const title = isAr ? (session.titleAr || session.title) : session.title;
      const desc = isAr ? (session.descriptionAr || session.description) : session.description;
      const coverImg = window.DataStore.resolvePath(session.coverImage);
      const sessionUrl = `session.html?id=${encodeURIComponent(session.id)}`;

      return `
        <article class="session-card">
          <a href="${sessionUrl}" class="session-card-thumb-wrapper" aria-label="${window.DataStore.escapeAttr(title)}">
            <img src="${coverImg}" alt="${window.DataStore.escapeAttr(title)}" class="session-card-img" loading="lazy" />
            <div class="session-badge-group">
              <span class="badge badge-gold">${window.DataStore.escapeHtml(catName)}</span>
              <span class="badge badge-dark">${window.DataStore.escapeHtml(locName)}</span>
            </div>
          </a>
          <div class="session-card-body">
            <div class="session-card-meta">
              <span>📍 ${window.DataStore.escapeHtml(locName)}</span>
              <span>📅 ${window.DataStore.escapeHtml(session.date || '')}</span>
            </div>
            <h3 class="session-card-title">
              <a href="${sessionUrl}">${window.DataStore.escapeHtml(title)}</a>
            </h3>
            <p class="session-card-desc">${window.DataStore.escapeHtml(desc)}</p>
            <div class="session-card-footer">
              <a href="${sessionUrl}" class="view-session-link">
                <span>${isAr ? 'مشاهدة الجلسة' : 'View Session'}</span>
                <span class="arrow-icon-flip">→</span>
              </a>
              <span style="font-size:0.75rem; color:var(--text-muted);">${(session.photos || []).length} ${isAr ? 'صور' : 'Photos'}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  };

  renderFilteredSessions();
}

/* ==========================================================================
   Locations Page Controller
   ========================================================================== */
async function initLocationsPage() {
  const isAr = window.I18n && window.I18n.isRTL();
  const locations = await window.DataStore.getLocations();
  const sessions = await window.DataStore.getSessions(false);
  const categories = await window.DataStore.getCategories();

  const locationsGrid = document.getElementById('locations-page-grid');
  const locationDetailSection = document.getElementById('location-detail-section');
  const locationDetailTitle = document.getElementById('location-detail-title');
  const locationDetailDesc = document.getElementById('location-detail-desc');
  const locationSessionsGrid = document.getElementById('location-sessions-grid');

  const urlParams = new URLSearchParams(window.location.search);
  const targetLocationId = urlParams.get('location');

  // Render all locations
  if (locationsGrid) {
    locationsGrid.innerHTML = locations.map(loc => {
      const locSessions = sessions.filter(s => s.locationId === loc.id);
      const locName = isAr ? (loc.nameAr || loc.name) : loc.name;
      const govName = isAr ? (loc.governorateAr || loc.governorate) : loc.governorate;
      const desc = isAr ? (loc.descriptionAr || loc.description) : loc.description;
      const coverImg = window.DataStore.resolvePath(loc.coverImage);
      const isSelected = targetLocationId === loc.id;

      return `
        <div class="location-card ${isSelected ? 'selected-border' : ''}" data-location-id="${window.DataStore.escapeAttr(loc.id)}">
          <img src="${coverImg}" alt="${window.DataStore.escapeAttr(locName)}" class="location-card-img" loading="lazy" />
          <div class="location-card-overlay"></div>
          <div class="location-card-content">
            <span class="location-card-badge">${window.DataStore.escapeHtml(govName)}</span>
            <h3 class="location-card-title">${window.DataStore.escapeHtml(locName)}</h3>
            <p class="location-card-desc">${window.DataStore.escapeHtml(desc)}</p>
            <div class="location-card-meta">
              <span>${locSessions.length} ${isAr ? 'جلسات موثقة' : 'Sessions Captured'}</span>
              <button class="btn btn-outline btn-sm view-location-sessions-btn" style="padding:0.3rem 0.8rem; font-size:0.7rem;">
                ${isAr ? 'عرض الجلسات' : 'View Sessions'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listener on location cards
    locationsGrid.querySelectorAll('.location-card').forEach(card => {
      card.addEventListener('click', () => {
        const locId = card.getAttribute('data-location-id');
        displayLocationSessions(locId);
      });
    });
  }

  // Display sessions for a selected location
  const displayLocationSessions = (locId) => {
    const loc = locations.find(l => l.id === locId);
    if (!loc || !locationDetailSection) return;

    const locSessions = sessions.filter(s => s.locationId === locId);
    const locName = isAr ? (loc.nameAr || loc.name) : loc.name;
    const govName = isAr ? (loc.governorateAr || loc.governorate) : loc.governorate;
    const desc = isAr ? (loc.descriptionAr || loc.description) : loc.description;

    locationDetailTitle.textContent = `${locName} — ${govName}`;
    locationDetailDesc.textContent = desc;

    if (locSessions.length === 0) {
      locationSessionsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 3rem 1rem;">
          <p style="color:var(--text-secondary);">${isAr ? 'لا توجد جلسات معروضة حالياً لهذه الوجهة.' : 'No published sessions found for this location yet.'}</p>
        </div>
      `;
    } else {
      locationSessionsGrid.innerHTML = locSessions.map(session => {
        const cat = categories.find(c => c.id === session.category) || {};
        const catName = isAr ? (cat.nameAr || cat.name) : (cat.name || session.category);
        const title = isAr ? (session.titleAr || session.title) : session.title;
        const desc = isAr ? (session.descriptionAr || session.description) : session.description;
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
              <div class="session-card-meta">
                <span>📍 ${window.DataStore.escapeHtml(locName)}</span>
                <span>📅 ${window.DataStore.escapeHtml(session.date || '')}</span>
              </div>
              <h3 class="session-card-title">
                <a href="${sessionUrl}">${window.DataStore.escapeHtml(title)}</a>
              </h3>
              <p class="session-card-desc">${window.DataStore.escapeHtml(desc)}</p>
              <div class="session-card-footer">
                <a href="${sessionUrl}" class="view-session-link">
                  <span>${isAr ? 'مشاهدة الجلسة' : 'View Session'}</span>
                  <span class="arrow-icon-flip">→</span>
                </a>
                <span style="font-size:0.75rem; color:var(--text-muted);">${(session.photos || []).length} ${isAr ? 'صور' : 'Photos'}</span>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    locationDetailSection.style.display = 'block';
    locationDetailSection.scrollIntoView({ behavior: 'smooth' });
  };

  // If a location is requested via URL query string, display it automatically
  if (targetLocationId) {
    displayLocationSessions(targetLocationId);
  }
}

/* ==========================================================================
   About Page Controller
   ========================================================================== */
async function initAboutPage(settings) {
  const isAr = window.I18n && window.I18n.isRTL();
  const nameEl = document.getElementById('about-photographer-name');
  const bioEl = document.getElementById('about-photographer-bio');
  const profileImgEl = document.getElementById('about-profile-img');

  if (nameEl) nameEl.textContent = isAr ? (settings.photographerNameAr || settings.photographerName) : settings.photographerName;
  if (bioEl) bioEl.textContent = isAr ? (settings.aboutFullAr || settings.aboutFull) : settings.aboutFull;
  if (profileImgEl && settings.profileImage) {
    profileImgEl.src = window.DataStore.resolvePath(settings.profileImage);
  }
}

/* ==========================================================================
   Contact Page & WhatsApp Reservation Flow
   ========================================================================== */
async function initContactPage(settings) {
  const isAr = window.I18n && window.I18n.isRTL();
  const categories = await window.DataStore.getCategories();
  const locations = await window.DataStore.getLocations();

  // Populate dynamic contact details
  const waDisplayEl = document.getElementById('contact-whatsapp-val');
  const phoneDisplayEl = document.getElementById('contact-phone-val');
  const addressDisplayEl = document.getElementById('contact-address-val');

  if (waDisplayEl) waDisplayEl.textContent = settings.whatsappDisplay || settings.whatsapp;
  if (phoneDisplayEl) phoneDisplayEl.textContent = settings.phoneDisplay || settings.phone;
  if (addressDisplayEl) addressDisplayEl.textContent = isAr ? (settings.addressAr || settings.address) : settings.address;

  // Category select options in booking form
  const typeSelect = document.getElementById('booking-session-type');
  if (typeSelect && typeSelect.options.length <= 1) {
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = isAr ? (cat.nameAr || cat.name) : cat.name;
      typeSelect.appendChild(opt);
    });
  }

  // Location select options
  const locationSelect = document.getElementById('booking-session-location');
  if (locationSelect && locationSelect.options.length <= 1) {
    locations.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc.name;
      opt.textContent = isAr ? `${loc.nameAr} (${loc.governorateAr})` : `${loc.name} (${loc.governorate})`;
      locationSelect.appendChild(opt);
    });
  }

  // Booking Form Submission -> WhatsApp
  const bookingForm = document.getElementById('booking-reservation-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('booking-name').value.trim();
      const phone = document.getElementById('booking-phone').value.trim();
      const type = document.getElementById('booking-session-type').value;
      const date = document.getElementById('booking-date').value;
      const loc = document.getElementById('booking-session-location').value;
      const msg = document.getElementById('booking-notes').value.trim();

      if (!name || !phone) {
        alert(isAr ? 'برجاء كتابة الاسم ورقم الهاتف للمتابعة' : 'Please provide your name and phone number to proceed.');
        return;
      }

      const catObj = categories.find(c => c.id === type);
      const catLabel = catObj ? (isAr ? catObj.nameAr : catObj.name) : type;

      let messageBody = isAr 
        ? `*طلب حجز جلسة تصوير جديدة*\n` +
          `------------------------------\n` +
          `👤 *الاسم:* ${name}\n` +
          `📱 *الهاتف:* ${phone}\n` +
          `📸 *نوع الجلسة:* ${catLabel || 'غير محدد'}\n` +
          `📅 *التاريخ المقترح:* ${date || 'مرن'}\n` +
          `📍 *الموقع:* ${loc || 'غير محدد'}\n` +
          `💬 *تفاصيل إضافية:* ${msg || 'لا توجد'}\n` +
          `------------------------------\n` +
          `مرسل من موقع ESLAM BSISA PHOTOGRAPHY`
        : `*New Photography Session Inquiry*\n` +
          `------------------------------\n` +
          `👤 *Name:* ${name}\n` +
          `📱 *Phone:* ${phone}\n` +
          `📸 *Session Type:* ${catLabel || 'Not specified'}\n` +
          `📅 *Date:* ${date || 'Flexible'}\n` +
          `📍 *Location:* ${loc || 'Not specified'}\n` +
          `💬 *Notes & Vision:* ${msg || 'None'}\n` +
          `------------------------------\n` +
          `Sent via ESLAM BSISA PHOTOGRAPHY Website`;

      const whatsappNumber = settings.whatsapp || '201012345678';
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageBody)}`;

      window.open(waUrl, '_blank');
      if (window.showToast) {
        window.showToast(isAr ? 'تم فتح تطبيق واتساب للتواصل المباشر!' : 'Opening WhatsApp for direct booking!');
      }
    });
  }
}
