/**
 * ESLAM BSISA PHOTOGRAPHY - Internationalization (i18n) Engine
 * Seamless English & Arabic (RTL) localization.
 */

const I18N_STORAGE_KEY = 'eslambsisa_lang';

const translations = {
  en: {
    // Nav
    nav_home: "Home",
    nav_work: "My Work",
    nav_locations: "Locations",
    nav_about: "About",
    nav_contact: "Contact",
    nav_book_cta: "Book a Session",
    nav_admin: "Admin CMS",

    // Hero
    hero_badge: "Luxury Editorial Photography",
    hero_title: "Capturing Eternal Emotion & Royal Luxury",
    hero_subtitle: "Specializing in destination luxury weddings, editorial portraits, and cinematic love stories across Egypt.",
    hero_cta_explore: "Explore My Work",
    hero_cta_book: "Book a Session",
    scroll_down: "Scroll Down",

    // Stats
    stat_sessions: "Sessions Captured",
    stat_years: "Years Experience",
    stat_clients: "Delighted Clients",
    stat_locations: "Iconic Destinations",

    // Home Sections
    featured_work_label: "Selected Portfolios",
    featured_work_title: "Featured Sessions",
    featured_work_subtitle: "Handpicked signature wedding and editorial love stories meticulously crafted with cinematic natural light.",
    featured_loc_label: "Destinations & Venues",
    featured_loc_title: "Iconic Locations",
    featured_loc_subtitle: "From historical palaces in Cairo to golden sunset dunes in Giza and Mediterranean sea breezes.",
    view_all_work: "View All Sessions",
    view_all_locations: "Explore All Locations",
    view_session: "View Session",
    sessions_count: "Sessions",

    // Work Page
    work_page_label: "Complete Portfolio",
    work_page_title: "Curated Visual Stories",
    work_page_subtitle: "Browse through our collection of royal weddings, sunset engagements, high-fashion portraits, and outdoor fine art.",
    filter_all: "All Stories",
    search_placeholder: "Search sessions by title or location...",

    // Locations Page
    locations_page_label: "Inspiring Backdrops",
    locations_page_title: "Photography Locations",
    locations_page_subtitle: "Discover the breathtaking palaces, historic streets, deserts, and seaside venues where we craft eternal memories.",
    explore_destination: "Explore Destination",

    // Session Details Page
    session_back_to_work: "Back to Portfolio",
    session_date: "Date",
    session_location: "Location",
    session_category: "Category",
    session_photos_count: "Photographs",
    session_share_btn: "Share Session",
    session_share_copied: "Link copied to clipboard!",
    session_prev: "Previous Session",
    session_next: "Next Session",
    session_related_title: "Related Stories",
    lightbox_counter_of: "of",

    // About Page
    about_page_label: "The Artist",
    about_page_title: "Eslam Bsisa",
    about_story_title: "Editorial Mastery & Heartfelt Storytelling",
    about_feature_1: "Natural & Atmospheric Lighting Mastery",
    about_feature_2: "Unobtrusive Cinematic Direction",
    about_feature_3: "High-End Magazine Color Grading",
    about_feature_4: "Destination & International Coverage",
    about_experience_label: "Years Capturing Elegance",

    // Contact Page
    contact_page_label: "Get In Touch",
    contact_page_title: "Reserve Your Date",
    contact_page_subtitle: "Every unforgettable story begins with a conversation. Let us create timeless fine art together.",
    contact_whatsapp_label: "Instant WhatsApp",
    contact_phone_label: "Direct Phone Call",
    contact_studio_label: "Studio Addresses",
    contact_social_label: "Follow Our Work",
    contact_form_title: "Session Reservation Inquiry",
    form_name: "Full Name",
    form_phone: "Phone / WhatsApp Number",
    form_type: "Session Type",
    form_date: "Preferred Date",
    form_location: "Preferred Location / Venue",
    form_message: "Tell Us About Your Vision & Story",
    form_submit_whatsapp: "Send Inquiry via WhatsApp",
    form_select_type: "Select Session Category",

    // Footer
    footer_tagline: "Timeless luxury editorial wedding & portrait photography.",
    footer_quick_links: "Quick Navigation",
    footer_categories: "Portfolio Categories",
    footer_contact_info: "Contact Information",
    footer_copyright: "All Rights Reserved. ESLAM BSISA PHOTOGRAPHY.",

    // General
    status_featured: "Featured",
    status_draft: "Draft",
    status_published: "Published"
  },

  ar: {
    // Nav
    nav_home: "الرئيسية",
    nav_work: "أعمالي",
    nav_locations: "الوجهات",
    nav_about: "عن المصور",
    nav_contact: "تواصل وحجز",
    nav_book_cta: "احجز جلستك",
    nav_admin: "لوحة التحكم",

    // Hero
    hero_badge: "تصوير فوتوغرافي فخم بطابع المجلات",
    hero_title: "توثيق مشاعر الحب والقصص الملكية الخالدة",
    hero_subtitle: "متخصص في حفلات الزفاف الفاخرة، وجلسات الخطوبة والبورتريه الفني في القاهرة وجميع أنحاء مصر.",
    hero_cta_explore: "استكشف أعمالي",
    hero_cta_book: "احجز جلستك الآن",
    scroll_down: "انتقل لأسفل",

    // Stats
    stat_sessions: "جلسة تصوير موثقة",
    stat_years: "سنوات من الخبرة",
    stat_clients: "عميل سعيد وفخور",
    stat_locations: "وجهة ومدن أيقونية",

    // Home Sections
    featured_work_label: "مختارات فوتوغرافية",
    featured_work_title: "أحدث الجلسات المميزة",
    featured_work_subtitle: "قصص حب وزفاف استثنائية صُممت بعناية فائقة وتناغم سينمائي مع الإضاءة الطبيعية الساحرة.",
    featured_loc_label: "وجهات وأماكن التصوير",
    featured_loc_title: "أبرز مواقع التصوير",
    featured_loc_subtitle: "من القصور التاريخية بالقاهرة إلى كثبان الغروب الذهبية بالجيزة ونسيم الإسكندرية الرومانسي.",
    view_all_work: "عرض كافة الجلسات",
    view_all_locations: "استكشف جميع الوجهات",
    view_session: "تفاصيل الجلسة",
    sessions_count: "جلسات",

    // Work Page
    work_page_label: "معرض الأعمال الكامل",
    work_page_title: "قصص بصرية راقية",
    work_page_subtitle: "تصفح مجموعتنا الحصرية لحفلات الزفاف الملكية، جلسات الغروب، البورتريه الإبداعي وتصوير المنتجات.",
    filter_all: "كافة الأعمال",
    search_placeholder: "ابحث عن جلسة بالعنوان أو المدينة...",

    // Locations Page
    locations_page_label: "أماكن تلهم الإبداع",
    locations_page_title: "وجهات التصوير المعتمدة",
    locations_page_subtitle: "تعرف على القصور الفاخرة، المعالم التاريخية، الصحاري والشواطئ التي نسجل فيها أجمل الذكريات.",
    explore_destination: "استكشاف الوجهة",

    // Session Details Page
    session_back_to_work: "العودة إلى المعرض",
    session_date: "التاريخ",
    session_location: "الموقع",
    session_category: "التصنيف",
    session_photos_count: "صور فوتوغرافية",
    session_share_btn: "مشاركة الجلسة",
    session_share_copied: "تم نسخ الرابط بنجاح إلى الحافظة!",
    session_prev: "الجلسة السابقة",
    session_next: "الجلسة التالية",
    session_related_title: "جلسات تصوير ذات صلة",
    lightbox_counter_of: "من",

    // About Page
    about_page_label: "الفنان خلف العدسة",
    about_page_title: "إسلام بسيسة",
    about_story_title: "حرفية إبداعية وسرد بصري مفعم بالمشاعر",
    about_feature_1: "إتقان الإضاءة الطبيعية والسينمائية الساحرة",
    about_feature_2: "توجيه عفوي غير متكلف يبرز الجمال الطبيعي",
    about_feature_3: "معالجة ألوان وتدرجات بطابع مجلات الأزياء الراقية",
    about_feature_4: "تغطية الجلسات وحفلات الزفاف في مصر وحول العالم",
    about_experience_label: "سنوات من الاحتراف والأناقة",

    // Contact Page
    contact_page_label: "تواصل معنا",
    contact_page_title: "احجز موعد جلستك",
    contact_page_subtitle: "كل قصة حب استثنائية تبدأ بحديث دافئ. دعنا نوثق لحظاتك الأثمن بحرفية فنية لا تنسى.",
    contact_whatsapp_label: "واتساب مباشر وسريع",
    contact_phone_label: "اتصال هاتفي مباشر",
    contact_studio_label: "فروع واستوديوهات التصوير",
    contact_social_label: "تابع أحدث أعمالنا",
    contact_form_title: "طلب حجز واستفسار عن جلسة",
    form_name: "الاسم الكريم",
    form_phone: "رقم الهاتف / الواتساب",
    form_type: "نوع الجلسة المطلوبة",
    form_date: "التاريخ المقترح",
    form_location: "الموقع أو القاعة المفضلة",
    form_message: "أخبرنا عن رؤيتك وتفاصيل مناسبتك",
    form_submit_whatsapp: "إرسال الطلب عبر واتساب مباشرة",
    form_select_type: "اختر تصنيف الجلسة",

    // Footer
    footer_tagline: "توثيق فوتوغرافي راقي لحفلات الزفاف وجلسات البورتريه الفني.",
    footer_quick_links: "روابط سريعة",
    footer_categories: "تصنيفات الأعمال",
    footer_contact_info: "بيانات التواصل",
    footer_copyright: "جميع الحقوق محفوظة. إسلام بسيسة للتصوير الفوتوغرافي.",

    // General
    status_featured: "مميز",
    status_draft: "مسودة",
    status_published: "منشور"
  }
};

const I18n = {
  currentLang: 'en',

  init() {
    const saved = localStorage.getItem(I18N_STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') {
      this.currentLang = saved;
    } else {
      // Default to Arabic or English based on browser language
      const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      this.currentLang = browserLang.startsWith('ar') ? 'ar' : 'en';
    }
    this.applyLanguage(this.currentLang, false);
  },

  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'ar') return;
    this.currentLang = lang;
    localStorage.setItem(I18N_STORAGE_KEY, lang);
    this.applyLanguage(lang, true);
  },

  applyLanguage(lang, dispatchEvent = true) {
    const isRtl = lang === 'ar';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

    // Update all elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // Update placeholders with data-i18n-placeholder
    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
      const key = input.getAttribute('data-i18n-placeholder');
      if (translations[lang] && translations[lang][key]) {
        input.setAttribute('placeholder', translations[lang][key]);
      }
    });

    // Update active state on language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (dispatchEvent) {
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
  },

  t(key) {
    return translations[this.currentLang]?.[key] || translations['en']?.[key] || key;
  },

  isRTL() {
    return this.currentLang === 'ar';
  }
};

window.I18n = I18n;
