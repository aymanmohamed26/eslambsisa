# ESLAM BSISA PHOTOGRAPHY — Luxury Portfolio & CMS

A high-end, responsive, editorial photography portfolio website engineered specifically for **ESLAM BSISA PHOTOGRAPHY**. Built with **HTML5, CSS3, Vanilla JavaScript, and JSON** data storage, configured to be hosted **100% free on GitHub Pages** with zero backend or paid server dependencies.

---

## 🌟 Key Highlights & Design Identity

- **Visual Luxury Aesthetic**: Deep obsidian background (`#111111`), warm gold accent (`#C6A66B`), cards (`#1B1B1B`), and crisp typography combining classic serif editorial titles with modern sans-serif body.
- **Multilingual & Full Arabic RTL**: Instant language toggle (`EN` / `عربي`) with full layout direction mirroring (`dir="rtl"`), Arabic fonts (`Cairo` & `Amiri`), and localized content.
- **Zero-Backend Architecture**: All portfolio data is stored in structured, readable JSON files in the `data/` directory.
- **Client-Side Content Management System (CMS)**: An intuitive admin panel at `/admin/index.html` allowing the photographer to manage sessions, locations, photos, and settings with an export/import workflow.
- **Interactive Lightbox & Gestures**: Fullscreen photo viewer with keyboard shortcuts (`←`, `→`, `Esc`), zoom/fullscreen toggle, and mobile touch swipe gestures.
- **Direct WhatsApp Booking**: Automatic pre-filled booking inquiry generator formatted directly into `wa.me` links.
- **Subpath Friendly**: Uses relative asset paths, working seamlessly on both custom domains (`https://eslambsisa.com`) and GitHub Pages subpaths (`https://USERNAME.github.io/REPOSITORY-NAME/`).

---

## 📂 Project Structure

```
eslambsisa/
├── index.html                   # Luxury Home Page with Hero, Stats, Featured Work & Locations
├── work.html                    # Complete Portfolio with Category & Search Filters
├── locations.html               # Dedicated Locations Showcase & Location Session Explorer
├── session.html                 # Session Details, Fullscreen Lightbox, Prev/Next & Share
├── about.html                   # Artist Profile, Philosophy, Credentials & Gear
├── contact.html                 # Inquiries, WhatsApp Booking Form & FAQ
├── sitemap.xml                  # Search Engine Sitemap with deep session links
├── robots.txt                   # Search Engine Crawler Directives
├── favicon.svg                  # Custom Gold Monogram "EB" Vector Favicon
├── README.md                    # Complete Documentation & Deployment Manual
│
├── admin/
│   └── index.html               # CMS Admin Panel (Sessions, Locations, Photos, Settings, Export)
│
├── css/
│   ├── main.css                 # Core Luxury Design System, Breakpoints & Animations
│   ├── rtl.css                  # Arabic Right-to-Left Layout Rules & Font Overrides
│   └── admin.css                # Admin CMS Dashboard & Modal Styles
│
├── js/
│   ├── storage.js               # Data Layer: JSON fetching, localStorage sync, safe HTML escaper
│   ├── i18n.js                  # Internationalization (EN / AR) & direction switcher
│   ├── app.js                   # Application Controller: page rendering, filters & WhatsApp flow
│   ├── gallery.js               # Lightbox Viewer, mobile touch swipe & social sharing
│   └── admin.js                 # Admin CRUD logic, photo manager & JSON export/import
│
├── data/
│   ├── settings.json            # Brand details, contacts, WhatsApp, bio & social links
│   ├── categories.json          # Portfolio categories (Weddings, Engagement, Outdoor, etc.)
│   ├── locations.json           # Photography locations (Cairo, Giza, Alexandria, Minya)
│   └── sessions.json            # Curated sessions with titles, dates, descriptions & photo arrays
│
└── assets/
    └── images/
        ├── logo/logo.svg        # Brand Monogram & Wordmark SVG
        ├── hero/                # High-resolution hero imagery
        ├── profile/             # Photographer portraits
        ├── locations/           # Location cover photographs
        └── sessions/            # Session photo collections
```

---

## 🚀 How to Deploy on GitHub Pages (Completely Free)

### Step 1: Create a GitHub Repository
1. Log into your [GitHub account](https://github.com).
2. Click **New Repository**.
3. Name your repository (e.g., `eslambsisa` or `portfolio`).
4. Set visibility to **Public** (required for free GitHub Pages).
5. Leave "Initialize with a README" unchecked, and click **Create repository**.

### Step 2: Upload Project Files
You can upload either via Git CLI or using GitHub's web interface:

#### Option A: Using Git CLI (Recommended)
Open your terminal inside this project folder:
```bash
git init
git add .
git commit -m "Initial release of Eslam Bsisa Photography portfolio"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY-NAME.git
git push -u origin main
```

#### Option B: Using GitHub Web Upload
1. In your new repository on GitHub, click **Upload files**.
2. Drag and drop all folders and files (`index.html`, `css/`, `js/`, `data/`, `assets/`, `admin/`, etc.).
3. Commit the files.

### Step 3: Enable GitHub Pages
1. Go to your repository **Settings** on GitHub.
2. In the left sidebar, click **Pages**.
3. Under **Branch**, select `main` (or `master`) and leave the folder set to `/(root)`.
4. Click **Save**.
5. After ~60 seconds, GitHub Pages will deploy your site at:
   ```
   https://USERNAME.github.io/REPOSITORY-NAME/
   ```

---

## 🛠️ How to Manage Content & Add New Sessions

Because GitHub Pages is a static host without a database server, the admin panel uses a secure **Export & Commit** workflow.

### Adding or Editing a Session:
1. Open `admin/index.html` in your browser (locally or online).
2. Click **+ Add New Session**.
3. Enter the session details:
   - Unique ID (e.g. `cairo-royal-wedding`)
   - Titles & Descriptions in English and Arabic
   - Category (Wedding, Engagement, Portrait, etc.)
   - Location (Cairo, Giza, Alexandria, Minya)
   - Date
4. In the **Manage Photographs** section:
   - Select multiple photos using the file picker.
   - Designate the **Cover Photo**.
   - Reorder photos using the `←` and `→` buttons.
5. Click **Save Session**.

### Publishing Changes to GitHub:
1. In the Admin Panel, navigate to **Export & Publish**.
2. Click **Download sessions.json** (or **Download All 4 Data Files**).
3. If you added new photos, copy the image files into your repository at:
   `assets/images/sessions/<your-session-id>/`
4. Replace the old file in `data/sessions.json` with your newly downloaded file.
5. Push to GitHub:
   ```bash
   git add .
   git commit -m "Add new photography session"
   git push origin main
   ```
GitHub Pages will automatically update your live website within 1 minute!

---

## 🔒 Security & Reliability Audit (OWASP Principles)

Even though this is a static site without a SQL backend, security best practices have been strictly implemented:

1. **XSS Prevention (Cross-Site Scripting)**:
   - All user inputs and JSON data are escaped using `DataStore.escapeHtml()` and `DataStore.escapeAttr()` before being inserted into the DOM.
   - Dynamic templates avoid unvalidated `innerHTML` interpolation of raw user data.
2. **Safe Link Practices**:
   - All external outbound links (Instagram, Facebook, WhatsApp, Google Maps) use `rel="noopener noreferrer"` and `target="_blank"`.
3. **No Hardcoded Secrets or Tokens**:
   - Zero GitHub Personal Access Tokens (PATs) or private API keys are stored in client-side code.
4. **File Upload Security in Admin**:
   - The photo picker only accepts safe image MIME types (`image/jpeg`, `image/png`, `image/webp`). Executable files (`.exe`, `.php`, `.js`) are strictly rejected.
5. **Pre-Deletion Safety Verification**:
   - The CMS validates location dependencies: you cannot delete a location if active sessions are still assigned to it, preventing broken session links.
6. **No `eval()`**:
   - The codebase contains zero calls to `eval()` or unsafe dynamic script execution.

---

## 📱 Responsive Breakpoints Tested

- **Mobile (320px – 479px)**: Optimized touch targets, single-column cards, mobile navigation drawer.
- **Large Mobile (480px – 767px)**: Fluid layouts, adaptive typography.
- **Tablet (768px – 1023px)**: 2-column session cards, tablet-optimized lightbox controls.
- **Desktop (1024px and above)**: Full editorial multi-column galleries, sticky header with backdrop blur.

---

## 📄 License & Credits

- **Brand**: ESLAM BSISA PHOTOGRAPHY
- **Lead Artist**: Eslam Bsisa
- **Development**: Clean Vanilla HTML5 / CSS3 / JavaScript
- **Royalty-free Imagery**: Unsplash curated editorial collections (used for sample portfolio display).
