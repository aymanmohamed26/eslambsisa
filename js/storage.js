/**
 * ESLAM BSISA PHOTOGRAPHY - Storage & Data Management Layer
 * Handles fetching JSON data, client-side persistence (localStorage), and export/import.
 */

const STORAGE_KEYS = {
  SETTINGS: 'eslambsisa_settings',
  CATEGORIES: 'eslambsisa_categories',
  LOCATIONS: 'eslambsisa_locations',
  SESSIONS: 'eslambsisa_sessions',
  DATA_INITIALIZED: 'eslambsisa_initialized_v1'
};

const DataStore = {
  // Safe HTML Escaper to prevent XSS across the application
  escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // Safe attribute escaper
  escapeAttr(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  // Relative path helper to guarantee compatibility with GitHub Pages subpaths
  resolvePath(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    // Determine path relative to root based on current folder
    const isInSubdir = window.location.pathname.includes('/admin/') || 
                       window.location.pathname.includes('/sessions/');
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return isInSubdir ? '../' + cleanPath : './' + cleanPath;
  },

  // Load initial dataset: first checks localStorage, if not present fetches from data/*.json
  async init() {
    try {
      const isInit = localStorage.getItem(STORAGE_KEYS.DATA_INITIALIZED);
      if (!isInit) {
        await this.syncFromFiles();
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, reading directly from JSON files', e);
      await this.syncFromFiles();
    }
  },

  async syncFromFiles() {
    const isSubdir = window.location.pathname.includes('/admin/') || 
                     window.location.pathname.includes('/sessions/');
    const basePath = isSubdir ? '../data/' : './data/';

    try {
      const [settingsRes, categoriesRes, locationsRes, sessionsRes] = await Promise.all([
        fetch(basePath + 'settings.json').then(r => r.json()),
        fetch(basePath + 'categories.json').then(r => r.json()),
        fetch(basePath + 'locations.json').then(r => r.json()),
        fetch(basePath + 'sessions.json').then(r => r.json())
      ]);

      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsRes));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesRes));
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locationsRes));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessionsRes));
      localStorage.setItem(STORAGE_KEYS.DATA_INITIALIZED, 'true');
    } catch (err) {
      console.error('Error fetching initial JSON data:', err);
    }
  },

  // Getters
  async getSettings() {
    const cached = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (cached) return JSON.parse(cached);
    await this.syncFromFiles();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  },

  async getCategories() {
    const cached = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (cached) return JSON.parse(cached);
    await this.syncFromFiles();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  },

  async getLocations() {
    const cached = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (cached) return JSON.parse(cached);
    await this.syncFromFiles();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS) || '[]');
  },

  async getSessions(includeUnpublished = false) {
    const cached = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    let sessions = [];
    if (cached) {
      sessions = JSON.parse(cached);
    } else {
      await this.syncFromFiles();
      sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
    }
    if (!includeUnpublished) {
      return sessions.filter(s => s.published !== false);
    }
    return sessions;
  },

  async getSessionById(id) {
    const sessions = await this.getSessions(true);
    return sessions.find(s => s.id === id) || null;
  },

  async getSessionsByLocation(locationId) {
    const sessions = await this.getSessions(false);
    return sessions.filter(s => s.locationId === locationId);
  },

  // Setters / Updates
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings, null, 2));
  },

  saveCategories(categories) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories, null, 2));
  },

  saveLocations(locations) {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations, null, 2));
  },

  saveSessions(sessions) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions, null, 2));
  },

  // Reset to original files
  async resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.DATA_INITIALIZED);
    await this.syncFromFiles();
  },

  // Helper for downloading a JSON file in browser
  downloadJSON(data, filename) {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

window.DataStore = DataStore;
