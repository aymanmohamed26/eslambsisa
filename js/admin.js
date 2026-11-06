/**
 * ESLAM BSISA PHOTOGRAPHY - Admin CMS Controller
 * Local content management, CRUD for Locations & Sessions, Photo Manager, and JSON Export/Import.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.DataStore) await window.DataStore.init();

  initAdminNavigation();
  await refreshAdminDashboard();
  initExportImportHandlers();
});

let editingSessionId = null;
let editingLocationId = null;
let currentSessionPhotos = [];
let currentCoverImage = '';

/* ==========================================================================
   Admin Navigation & View Switching
   ========================================================================== */
function initAdminNavigation() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const sections = document.querySelectorAll('.admin-view-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(s => {
        if (s.id === `view-${targetView}`) {
          s.style.display = 'block';
        } else {
          s.style.display = 'none';
        }
      });

      // Refresh appropriate table
      if (targetView === 'dashboard') refreshAdminDashboard();
      if (targetView === 'locations') renderLocationsTable();
      if (targetView === 'sessions') renderSessionsTable();
      if (targetView === 'settings') loadSettingsForm();
    });
  });

  // Mobile sidebar toggle
  const sidebar = document.querySelector('.admin-sidebar');
  const toggleBtn = document.getElementById('admin-sidebar-toggle');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

/* ==========================================================================
   Dashboard Metrics
   ========================================================================== */
async function refreshAdminDashboard() {
  const locations = await window.DataStore.getLocations();
  const sessions = await window.DataStore.getSessions(true);

  let totalPhotos = 0;
  let publishedCount = 0;
  let draftCount = 0;

  sessions.forEach(s => {
    totalPhotos += (s.photos || []).length;
    if (s.published) {
      publishedCount++;
    } else {
      draftCount++;
    }
  });

  document.getElementById('metric-total-locations').textContent = locations.length;
  document.getElementById('metric-total-sessions').textContent = sessions.length;
  document.getElementById('metric-total-photos').textContent = totalPhotos;
  document.getElementById('metric-published-sessions').textContent = publishedCount;
  document.getElementById('metric-draft-sessions').textContent = draftCount;

  // Render recent sessions list on dashboard
  const recentTable = document.getElementById('dashboard-recent-sessions-tbody');
  if (recentTable) {
    recentTable.innerHTML = sessions.slice(0, 5).map(s => {
      const cover = window.DataStore.resolvePath(s.coverImage);
      return `
        <tr>
          <td><img src="${cover}" class="admin-table-thumb" alt="${window.DataStore.escapeAttr(s.title)}" /></td>
          <td><strong>${window.DataStore.escapeHtml(s.title)}</strong><br><small style="color:#888;">${window.DataStore.escapeHtml(s.titleAr || '')}</small></td>
          <td><span class="badge ${s.published ? 'badge-gold' : 'badge-dark'}">${s.published ? 'Published' : 'Draft'}</span></td>
          <td>${window.DataStore.escapeHtml(s.date || '')}</td>
          <td>${(s.photos || []).length} photos</td>
          <td>
            <button class="action-btn" onclick="openSessionModal('${s.id}')" title="Edit Session">✏️</button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

/* ==========================================================================
   Locations Management (CRUD + Pre-deletion Safety Verification)
   ========================================================================== */
async function renderLocationsTable() {
  const locations = await window.DataStore.getLocations();
  const sessions = await window.DataStore.getSessions(true);
  const tbody = document.getElementById('locations-table-tbody');
  if (!tbody) return;

  if (locations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#888;">No locations found. Add your first location!</td></tr>`;
    return;
  }

  tbody.innerHTML = locations.map(loc => {
    const locSessions = sessions.filter(s => s.locationId === loc.id);
    const cover = window.DataStore.resolvePath(loc.coverImage);

    return `
      <tr>
        <td><img src="${cover}" class="admin-table-thumb" alt="${window.DataStore.escapeAttr(loc.name)}" /></td>
        <td>
          <strong>${window.DataStore.escapeHtml(loc.name)}</strong>
          <br><small style="color:var(--admin-accent);">${window.DataStore.escapeHtml(loc.nameAr || '')}</small>
        </td>
        <td>${window.DataStore.escapeHtml(loc.governorate)} / ${window.DataStore.escapeHtml(loc.governorateAr || '')}</td>
        <td><span class="badge badge-gold">${locSessions.length} sessions</span></td>
        <td style="max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${window.DataStore.escapeHtml(loc.description || '')}</td>
        <td>
          <div class="action-btn-group">
            <button class="action-btn" onclick="openLocationModal('${loc.id}')" title="Edit Location">✏️</button>
            <button class="action-btn delete" onclick="confirmDeleteLocation('${loc.id}')" title="Delete Location">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.openLocationModal = async (locationId = null) => {
  editingLocationId = locationId;
  const modal = document.getElementById('location-modal');
  const titleEl = document.getElementById('location-modal-title');
  const form = document.getElementById('location-form');

  form.reset();

  if (locationId) {
    titleEl.textContent = 'Edit Photography Location';
    const locations = await window.DataStore.getLocations();
    const loc = locations.find(l => l.id === locationId);
    if (loc) {
      document.getElementById('loc-id').value = loc.id;
      document.getElementById('loc-id').disabled = true;
      document.getElementById('loc-name').value = loc.name || '';
      document.getElementById('loc-name-ar').value = loc.nameAr || '';
      document.getElementById('loc-gov').value = loc.governorate || '';
      document.getElementById('loc-gov-ar').value = loc.governorateAr || '';
      document.getElementById('loc-cover').value = loc.coverImage || '';
      document.getElementById('loc-desc').value = loc.description || '';
      document.getElementById('loc-desc-ar').value = loc.descriptionAr || '';
    }
  } else {
    titleEl.textContent = 'Add New Photography Location';
    document.getElementById('loc-id').disabled = false;
  }

  modal.classList.add('open');
};

window.closeLocationModal = () => {
  document.getElementById('location-modal').classList.remove('open');
  editingLocationId = null;
};

// Auto generate slug
document.getElementById('loc-name')?.addEventListener('input', (e) => {
  if (!editingLocationId) {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    document.getElementById('loc-id').value = slug;
  }
});

// Save Location Handler
document.getElementById('location-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const locations = await window.DataStore.getLocations();

  const id = document.getElementById('loc-id').value.trim();
  const name = document.getElementById('loc-name').value.trim();
  const nameAr = document.getElementById('loc-name-ar').value.trim();
  const governorate = document.getElementById('loc-gov').value.trim();
  const governorateAr = document.getElementById('loc-gov-ar').value.trim();
  const coverImage = document.getElementById('loc-cover').value.trim() || 'assets/images/locations/cairo.jpg';
  const description = document.getElementById('loc-desc').value.trim();
  const descriptionAr = document.getElementById('loc-desc-ar').value.trim();

  if (!id || !name) {
    alert('Please enter a location ID and Name');
    return;
  }

  const locData = { id, name, nameAr, governorate, governorateAr, coverImage, description, descriptionAr };

  if (editingLocationId) {
    const idx = locations.findIndex(l => l.id === editingLocationId);
    if (idx !== -1) locations[idx] = locData;
  } else {
    if (locations.some(l => l.id === id)) {
      alert('A location with this ID already exists. Please choose a unique ID.');
      return;
    }
    locations.push(locData);
  }

  window.DataStore.saveLocations(locations);
  closeLocationModal();
  renderLocationsTable();
  refreshAdminDashboard();
  window.showToast('Location saved successfully!');
});

// Safety check before deleting location
window.confirmDeleteLocation = async (locationId) => {
  const sessions = await window.DataStore.getSessions(true);
  const associatedSessions = sessions.filter(s => s.locationId === locationId);

  if (associatedSessions.length > 0) {
    const titles = associatedSessions.map(s => `• ${s.title}`).join('\n');
    alert(
      `⛔ CANNOT DELETE LOCATION:\n\n` +
      `This location has ${associatedSessions.length} photography sessions associated with it:\n\n` +
      `${titles}\n\n` +
      `Please reassign or delete these sessions first so existing sessions do not break.`
    );
    return;
  }

  if (confirm(`Are you sure you want to delete location "${locationId}"?`)) {
    let locations = await window.DataStore.getLocations();
    locations = locations.filter(l => l.id !== locationId);
    window.DataStore.saveLocations(locations);
    renderLocationsTable();
    refreshAdminDashboard();
    window.showToast('Location deleted.');
  }
};

/* ==========================================================================
   Sessions Management (CRUD + Photo Manager)
   ========================================================================== */
async function renderSessionsTable() {
  const sessions = await window.DataStore.getSessions(true);
  const categories = await window.DataStore.getCategories();
  const locations = await window.DataStore.getLocations();
  const tbody = document.getElementById('sessions-table-tbody');
  if (!tbody) return;

  if (sessions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:#888;">No sessions found. Create your first session!</td></tr>`;
    return;
  }

  tbody.innerHTML = sessions.map(session => {
    const cat = categories.find(c => c.id === session.category) || {};
    const loc = locations.find(l => l.id === session.locationId) || {};
    const cover = window.DataStore.resolvePath(session.coverImage);

    return `
      <tr>
        <td><img src="${cover}" class="admin-table-thumb" alt="${window.DataStore.escapeAttr(session.title)}" /></td>
        <td>
          <strong>${window.DataStore.escapeHtml(session.title)}</strong>
          <br><small style="color:var(--admin-accent);">${window.DataStore.escapeHtml(session.titleAr || '')}</small>
        </td>
        <td><span class="badge badge-dark">${window.DataStore.escapeHtml(cat.name || session.category)}</span></td>
        <td>${window.DataStore.escapeHtml(loc.name || session.locationId)}</td>
        <td>${window.DataStore.escapeHtml(session.date || '')}</td>
        <td>
          ${session.featured ? '<span class="badge badge-gold">Featured</span>' : '<span style="color:#666;">-</span>'}
        </td>
        <td>
          <span class="badge ${session.published ? 'badge-gold' : 'badge-dark'}">
            ${session.published ? 'Published' : 'Draft'}
          </span>
        </td>
        <td>
          <div class="action-btn-group">
            <a href="../session.html?id=${encodeURIComponent(session.id)}" target="_blank" class="action-btn" title="View Public Page">👁️</a>
            <button class="action-btn" onclick="openSessionModal('${session.id}')" title="Edit Session">✏️</button>
            <button class="action-btn delete" onclick="confirmDeleteSession('${session.id}')" title="Delete Session">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.openSessionModal = async (sessionId = null) => {
  editingSessionId = sessionId;
  const modal = document.getElementById('session-modal');
  const titleEl = document.getElementById('session-modal-title');
  const form = document.getElementById('session-form');

  form.reset();

  // Populate Categories dropdown
  const categories = await window.DataStore.getCategories();
  const catSelect = document.getElementById('sess-category');
  catSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name} (${c.nameAr})</option>`).join('');

  // Populate Locations dropdown
  const locations = await window.DataStore.getLocations();
  const locSelect = document.getElementById('sess-location');
  locSelect.innerHTML = locations.map(l => `<option value="${l.id}">${l.name} (${l.governorate})</option>`).join('');

  if (sessionId) {
    titleEl.textContent = 'Edit Photography Session';
    const sessions = await window.DataStore.getSessions(true);
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      document.getElementById('sess-id').value = session.id;
      document.getElementById('sess-id').disabled = true;
      document.getElementById('sess-title').value = session.title || '';
      document.getElementById('sess-title-ar').value = session.titleAr || '';
      document.getElementById('sess-category').value = session.category || '';
      document.getElementById('sess-location').value = session.locationId || '';
      document.getElementById('sess-date').value = session.date || '';
      document.getElementById('sess-desc').value = session.description || '';
      document.getElementById('sess-desc-ar').value = session.descriptionAr || '';
      document.getElementById('sess-featured').checked = !!session.featured;
      document.getElementById('sess-published').checked = session.published !== false;

      currentSessionPhotos = [...(session.photos || [session.coverImage])];
      currentCoverImage = session.coverImage || currentSessionPhotos[0];
    }
  } else {
    titleEl.textContent = 'Create New Photography Session';
    document.getElementById('sess-id').disabled = false;
    document.getElementById('sess-published').checked = true;
    currentSessionPhotos = [];
    currentCoverImage = '';
  }

  renderPhotoPreviews();
  modal.classList.add('open');
};

window.closeSessionModal = () => {
  document.getElementById('session-modal').classList.remove('open');
  editingSessionId = null;
  currentSessionPhotos = [];
  currentCoverImage = '';
};

// Auto generate session slug
document.getElementById('sess-title')?.addEventListener('input', (e) => {
  if (!editingSessionId) {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    document.getElementById('sess-id').value = slug;
  }
});

// Photo Management UI
function renderPhotoPreviews() {
  const container = document.getElementById('photo-manager-preview-grid');
  if (!container) return;

  if (currentSessionPhotos.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:1.5rem; color:#777; font-size:0.85rem;">No photos added yet. Select image files or enter image paths below.</div>`;
    return;
  }

  container.innerHTML = currentSessionPhotos.map((photo, index) => {
    const isCover = (photo === currentCoverImage) || (index === 0 && !currentCoverImage);
    const resolved = window.DataStore.resolvePath(photo);

    return `
      <div class="photo-preview-item ${isCover ? 'is-cover' : ''}" data-index="${index}">
        <img src="${resolved}" class="photo-preview-img" alt="Photo ${index + 1}" onerror="this.src='../assets/images/hero/hero-main.jpg';" />
        <div class="photo-preview-actions">
          <button type="button" class="photo-preview-btn" onclick="movePhoto(${index}, -1)" title="Move Left" ${index === 0 ? 'disabled' : ''}>←</button>
          <button type="button" class="photo-preview-btn" onclick="movePhoto(${index}, 1)" title="Move Right" ${index === currentSessionPhotos.length - 1 ? 'disabled' : ''}>→</button>
          <button type="button" class="photo-preview-btn delete-btn" onclick="removePhoto(${index})" title="Remove Photo">✕</button>
        </div>
        <div class="photo-order-badge">#${index + 1}</div>
        ${isCover ? '<div class="photo-cover-tag">Cover</div>' : `<button type="button" class="photo-cover-tag" style="background:#333; color:#fff;" onclick="setCoverPhoto(${index})">Set Cover</button>`}
      </div>
    `;
  }).join('');
}

window.movePhoto = (index, delta) => {
  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= currentSessionPhotos.length) return;
  const temp = currentSessionPhotos[index];
  currentSessionPhotos[index] = currentSessionPhotos[targetIndex];
  currentSessionPhotos[targetIndex] = temp;
  renderPhotoPreviews();
};

window.removePhoto = (index) => {
  const removed = currentSessionPhotos.splice(index, 1)[0];
  if (removed === currentCoverImage && currentSessionPhotos.length > 0) {
    currentCoverImage = currentSessionPhotos[0];
  }
  renderPhotoPreviews();
};

window.setCoverPhoto = (index) => {
  currentCoverImage = currentSessionPhotos[index];
  renderPhotoPreviews();
  window.showToast('Cover photo updated.');
};

// Add photo via relative path / URL
window.addPhotoByPath = () => {
  const input = document.getElementById('photo-path-input');
  const path = input.value.trim();
  if (!path) return;

  // Basic validation check
  const ext = path.split('.').pop().toLowerCase();
  if (!['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
    if (!confirm('The image path does not end with .jpg, .jpeg, .png, or .webp. Continue anyway?')) {
      return;
    }
  }

  currentSessionPhotos.push(path);
  if (!currentCoverImage) currentCoverImage = path;
  input.value = '';
  renderPhotoPreviews();
};

// Add photos via file picker
document.getElementById('photo-file-picker')?.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  const sessionId = document.getElementById('sess-id').value.trim() || 'new-session';

  files.forEach(file => {
    // Basic format and size validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert(`Invalid format: ${file.name}. Only JPG, PNG, and WebP are allowed.`);
      return;
    }

    // Save target path according to repository conventions
    const targetPath = `assets/images/sessions/${sessionId}/${file.name}`;
    currentSessionPhotos.push(targetPath);
    if (!currentCoverImage) currentCoverImage = targetPath;
  });

  renderPhotoPreviews();
  window.showToast(`Selected ${files.length} photos! Note: place actual image files in repository folder.`);
});

// Save Session Handler
document.getElementById('session-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sessions = await window.DataStore.getSessions(true);

  const id = document.getElementById('sess-id').value.trim();
  const title = document.getElementById('sess-title').value.trim();
  const titleAr = document.getElementById('sess-title-ar').value.trim();
  const category = document.getElementById('sess-category').value;
  const locationId = document.getElementById('sess-location').value;
  const date = document.getElementById('sess-date').value;
  const description = document.getElementById('sess-desc').value.trim();
  const descriptionAr = document.getElementById('sess-desc-ar').value.trim();
  const featured = document.getElementById('sess-featured').checked;
  const published = document.getElementById('sess-published').checked;

  if (!id || !title) {
    alert('Please enter a session ID and title.');
    return;
  }

  if (currentSessionPhotos.length === 0) {
    if (!confirm('This session currently has no photos. Save anyway?')) {
      return;
    }
  }

  const coverImage = currentCoverImage || (currentSessionPhotos[0] || 'assets/images/hero/hero-main.jpg');

  const sessionData = {
    id,
    title,
    titleAr,
    category,
    locationId,
    date,
    featured,
    published,
    coverImage,
    description,
    descriptionAr,
    photos: currentSessionPhotos.length > 0 ? currentSessionPhotos : [coverImage]
  };

  if (editingSessionId) {
    const idx = sessions.findIndex(s => s.id === editingSessionId);
    if (idx !== -1) sessions[idx] = sessionData;
  } else {
    if (sessions.some(s => s.id === id)) {
      alert('A session with this ID already exists. Please choose a unique ID.');
      return;
    }
    sessions.unshift(sessionData);
  }

  window.DataStore.saveSessions(sessions);
  closeSessionModal();
  renderSessionsTable();
  refreshAdminDashboard();
  window.showToast('Session saved successfully!');
});

window.confirmDeleteSession = async (sessionId) => {
  if (confirm(`Are you sure you want to delete session "${sessionId}"?`)) {
    let sessions = await window.DataStore.getSessions(true);
    sessions = sessions.filter(s => s.id !== sessionId);
    window.DataStore.saveSessions(sessions);
    renderSessionsTable();
    refreshAdminDashboard();
    window.showToast('Session deleted.');
  }
};

/* ==========================================================================
   Website Settings Management
   ========================================================================== */
async function loadSettingsForm() {
  const settings = await window.DataStore.getSettings();
  document.getElementById('set-brand').value = settings.brandName || '';
  document.getElementById('set-brand-ar').value = settings.brandNameAr || '';
  document.getElementById('set-tagline').value = settings.tagline || '';
  document.getElementById('set-tagline-ar').value = settings.taglineAr || '';
  document.getElementById('set-photographer').value = settings.photographerName || '';
  document.getElementById('set-photographer-ar').value = settings.photographerNameAr || '';
  document.getElementById('set-whatsapp').value = settings.whatsapp || '';
  document.getElementById('set-phone').value = settings.phone || '';
  document.getElementById('set-instagram').value = settings.instagram || '';
  document.getElementById('set-facebook').value = settings.facebook || '';
  document.getElementById('set-address').value = settings.address || '';
  document.getElementById('set-address-ar').value = settings.addressAr || '';
  document.getElementById('set-about').value = settings.aboutFull || '';
  document.getElementById('set-about-ar').value = settings.aboutFullAr || '';
}

document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const current = await window.DataStore.getSettings();

  const updated = {
    ...current,
    brandName: document.getElementById('set-brand').value.trim(),
    brandNameAr: document.getElementById('set-brand-ar').value.trim(),
    tagline: document.getElementById('set-tagline').value.trim(),
    taglineAr: document.getElementById('set-tagline-ar').value.trim(),
    photographerName: document.getElementById('set-photographer').value.trim(),
    photographerNameAr: document.getElementById('set-photographer-ar').value.trim(),
    whatsapp: document.getElementById('set-whatsapp').value.trim(),
    phone: document.getElementById('set-phone').value.trim(),
    instagram: document.getElementById('set-instagram').value.trim(),
    facebook: document.getElementById('set-facebook').value.trim(),
    address: document.getElementById('set-address').value.trim(),
    addressAr: document.getElementById('set-address-ar').value.trim(),
    aboutFull: document.getElementById('set-about').value.trim(),
    aboutFullAr: document.getElementById('set-about-ar').value.trim()
  };

  window.DataStore.saveSettings(updated);
  window.showToast('Website settings saved successfully!');
});

/* ==========================================================================
   JSON Export & Import & Deployment Flow
   ========================================================================== */
function initExportImportHandlers() {
  // Export Sessions
  document.getElementById('export-sessions-btn')?.addEventListener('click', async () => {
    const data = await window.DataStore.getSessions(true);
    window.DataStore.downloadJSON(data, 'sessions.json');
    window.showToast('Downloaded sessions.json');
  });

  // Export Locations
  document.getElementById('export-locations-btn')?.addEventListener('click', async () => {
    const data = await window.DataStore.getLocations();
    window.DataStore.downloadJSON(data, 'locations.json');
    window.showToast('Downloaded locations.json');
  });

  // Export Categories
  document.getElementById('export-categories-btn')?.addEventListener('click', async () => {
    const data = await window.DataStore.getCategories();
    window.DataStore.downloadJSON(data, 'categories.json');
    window.showToast('Downloaded categories.json');
  });

  // Export Settings
  document.getElementById('export-settings-btn')?.addEventListener('click', async () => {
    const data = await window.DataStore.getSettings();
    window.DataStore.downloadJSON(data, 'settings.json');
    window.showToast('Downloaded settings.json');
  });

  // Export All Bundle
  document.getElementById('export-all-bundle-btn')?.addEventListener('click', async () => {
    const [settings, categories, locations, sessions] = await Promise.all([
      window.DataStore.getSettings(),
      window.DataStore.getCategories(),
      window.DataStore.getLocations(),
      window.DataStore.getSessions(true)
    ]);

    // Download individual files one after another
    window.DataStore.downloadJSON(sessions, 'sessions.json');
    setTimeout(() => window.DataStore.downloadJSON(locations, 'locations.json'), 300);
    setTimeout(() => window.DataStore.downloadJSON(categories, 'categories.json'), 600);
    setTimeout(() => window.DataStore.downloadJSON(settings, 'settings.json'), 900);

    window.showToast('Exporting all 4 JSON files...');
  });

  // Import JSON handler
  const importInput = document.getElementById('import-json-input');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const fname = file.name.toLowerCase();

          if (fname.includes('session')) {
            window.DataStore.saveSessions(parsed);
            window.showToast('Successfully imported sessions.json!');
          } else if (fname.includes('location')) {
            window.DataStore.saveLocations(parsed);
            window.showToast('Successfully imported locations.json!');
          } else if (fname.includes('categor')) {
            window.DataStore.saveCategories(parsed);
            window.showToast('Successfully imported categories.json!');
          } else if (fname.includes('setting')) {
            window.DataStore.saveSettings(parsed);
            window.showToast('Successfully imported settings.json!');
          } else {
            alert('Could not determine JSON type by filename. Please rename to sessions.json, locations.json, etc.');
          }

          refreshAdminDashboard();
        } catch (err) {
          alert('Invalid JSON file format: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset to Defaults
  document.getElementById('reset-defaults-btn')?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all data back to the default shipped files? Any unsaved local edits will be cleared.')) {
      await window.DataStore.resetToDefaults();
      refreshAdminDashboard();
      window.showToast('Data reset to original shipped files.');
    }
  });
}
