/* ==========================================================================
   sport.NAVOIY — Client Application v2.0
   Design System: Pitch Black Gold | Mobile-First & Desktop
   ========================================================================== */

(() => {
  "use strict";

  // Global State
  const state = {
    products: [],
    categories: [],
    selectedCategory: "all",
    searchQuery: "",
    selectedBrands: new Set(),
    inStockOnly: false,
    priceMin: null,
    priceMax: null,
    sort: "new",
    cart: JSON.parse(localStorage.getItem("sn_cart") || "[]"),
    wishlist: JSON.parse(localStorage.getItem("sn_wishlist") || "[]"),
    promoCode: "",
    promoDiscount: 0,
    user: null,
    language: localStorage.getItem("sn_lang") || "uz",
    theme: localStorage.getItem("sn_theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"),
    checkoutStep: 1,
    checkoutData: {
      deliveryMethod: "Yetkazib berish",
      region: "Navoiy viloyati",
      address: "",
      paymentMethod: "Naqd pul",
      comment: ""
    },
    activeDetailProduct: null,
    activeDetailPhotoIdx: 0,
    activeReviewRating: 5
  };

  const UZBEKISTAN_REGIONS = [
    "Navoiy viloyati",
    "Toshkent shahri",
    "Toshkent viloyati",
    "Samarqand viloyati",
    "Buxoro viloyati",
    "Andijon viloyati",
    "Farg‘ona viloyati",
    "Namangan viloyati",
    "Qashqadaryo viloyati",
    "Surxondaryo viloyati",
    "Xorazm viloyati",
    "Jizzax viloyati",
    "Sirdaryo viloyati",
    "Qoraqalpog‘iston Respublikasi"
  ];

  // Internationalization Dictionary (UZ, RU, EN)
  const I18N = {
    uz: {
      topShipping: "BTS Express bo'ylab butun O'zbekiston",
      themeLabel: "Rejim",
      allCategories: "Barcha toifalar",
      wishlist: "Sevimlilar",
      cart: "Savat",
      login: "Kirish",
      heroBadge: "Kelme Rasmiy Distribyutori",
      heroTitle: 'KELME &amp; MILLIY TERMA JAMOA — <span class="gold-text">YANGI MAVSUM</span> TO\'PLAMI',
      heroDescription: 'Professional futbol ekipirovkalari, rasmiy match-to\'plar va mashg\'ulot vositalari. 400 000 so\'mdan ortiq xarid uchun <strong style="color:var(--gold);">50 000 so\'m</strong>, 800 000 so\'mdan ortiq uchun <strong style="color:var(--gold);">100 000 so\'m</strong> avtomatik chegirma tizimi faol!',
      heroCta1: "Katalogni ko'rish",
      heroCta2: "Klub formalari",
      bentoSubtitle: "To'liq sport ekipirovkasi",
      bentoTitle: "Futbol Toifalari",
      viewAll: "Barchasi →",
      trust1Title: "100% Original Mahsulot",
      trust1Desc: "Kelme va Jako rasmiy ta'minoti",
      trust2Title: "BTS Express Yetkazish",
      trust2Desc: "O'zbekistonning barcha viloyatlariga",
      trust3Title: "-1 So'm Kafolati",
      trust3Desc: "Har bir narx yaxlit summadan 1 so'm kam",
      trust4Title: "Xavfsiz To'lov",
      trust4Desc: "Tovarni qabul qilib olganda to'lash",
      catalogSubtitle: "Ekipirovka Markazi · Navoiy",
      catalogTitle: "Futbol Mahsulotlari Katalogi",
      catalogBannerDesc: "Professional futbolchilar, havaskorlar va jamoalar uchun sifatli futbol jihozlari.",
      filters: "Filtrlar",
      reset: "Tozalash",
      filterCategories: "Kategoriyalar",
      filterBrands: "Brend",
      filterStock: "Mavjudlik",
      inStockOnly: "Faqat omborda borlar",
      filterPrice: "Narx oralig'i (so'm)",
      applyFilters: "Filtrlarni qo'llash",
      filterBtn: "Filtrlash",
      sortNew: "Yangi kelganlar",
      sortLow: "Narx: arzondan qimmatga",
      sortHigh: "Narx: qimmatdan arzonga",
      sortPopular: "Ommabopligi bo'yicha",
      emptyTitle: "Mahsulot topilmadi",
      emptyDesc: "Qidiruv yoki filtrlarni o'zgartirib ko'ring.",
      resetFilters: "Barcha filtrlarni tozalash",
      promoCardSub: "Maxsus Promokod Aksiyasi",
      promoCardTitle: "400 000 so'mdan oshganda 50 000 so'm chegirma!",
      promoCardDesc: "800 000 so'mdan ortiq xarid uchun to'liq 100 000 so'm tejab qoling. Promokodni savatda kiriting.",
      aboutSub: "Biz haqimizda",
      aboutTitle: "sport.NAVOIY — Futbol Ishtiyoqi Markazi",
      aboutText: "Do'konimiz faqat futbolga ixtisoslashgan bo'lib, professional Kelme va Jako brendlarining eng sifatli futbol formalari, butsilar, sarakanoshkalar, mashg'ulot kiyimlari va to'plarini taqdim etadi.",
      contactSub: "Aloqa Formasi",
      contactTitle: "Do'kon Bilan Bog'lanish",
      contactText: "Savollaringiz yoki jamoaviy buyurtmalaringiz bo'lsa xabar qoldiring. Xabar Telegram botimizga darhol yetkaziladi.",
      yourName: "Ismingiz",
      yourPhone: "Telefon raqamingiz",
      yourMessage: "Xabar matni",
      sendMessage: "Xabarni yuborish",
      footerNav: "Bo'limlar",
      footerCategories: "Top Toifalar",
      footerContact: "Bog'lanish",
      footerDelivery: "Yetkazib berish va to'lov",
      footerPrivacy: "Maxfiylik siyosati",
      dockHome: "Bosh sahifa",
      dockCatalog: "Katalog",
      dockCart: "Savat",
      dockAccount: "Kabinet",
      navCatalog: "Katalog",
      navAbout: "Biz haqimizda",
      navContact: "Aloqa",
      addToCart: "Savatga qo'shish",
      buyNow: "Hoziroq sotib olish",
      inStock: "OMBORDA MAVJUD",
      outOfStock: "QOLMAGAN",
      size: "O'lcham",
      color: "Rang",
      quantity: "Miqdor",
      reviews: "Sharhlar",
      leaveReview: "Sharh qoldirish",
      submitReview: "Sharhni yuborish"
    },
    ru: {
      topShipping: "BTS Express доставка по всему Узбекистану",
      themeLabel: "Тема",
      allCategories: "Все категории",
      wishlist: "Избранное",
      cart: "Корзина",
      login: "Войти",
      heroBadge: "Официальный дилер Kelme",
      heroTitle: 'KELME &amp; СБОРНАЯ УЗБЕКИСТАНА — <span class="gold-text">НОВЫЙ СЕЗОН</span>',
      heroDescription: 'Профессиональная футбольная экипировка, официальные матчевые мячи и одежда. При заказе от 400 000 сум скидка <strong style="color:var(--gold);">50 000 сум</strong>, от 800 000 сум скидка <strong style="color:var(--gold);">100 000 сум</strong>!',
      heroCta1: "Смотреть каталог",
      heroCta2: "Форма клубов",
      bentoSubtitle: "Полная экипировка",
      bentoTitle: "Футбольные категории",
      viewAll: "Все →",
      trust1Title: "100% Оригинальный товар",
      trust1Desc: "Официальные поставки Kelme и Jako",
      trust2Title: "Доставка BTS Express",
      trust2Desc: "Во все регионы Узбекистана",
      trust3Title: "Гарантия -1 Сум",
      trust3Desc: "Каждая цена на 1 сум меньше круглой суммы",
      trust4Title: "Надежная оплата",
      trust4Desc: "Оплата наличными при получении товара",
      catalogSubtitle: "Центр экипировки · Навои",
      catalogTitle: "Каталог футбольных товаров",
      catalogBannerDesc: "Качественная футбольная экипировка для профессионалов и команд.",
      filters: "Фильтры",
      reset: "Сбросить",
      filterCategories: "Категории",
      filterBrands: "Бренд",
      filterStock: "Наличие",
      inStockOnly: "Только в наличии",
      filterPrice: "Диапазон цен (сум)",
      applyFilters: "Применить",
      filterBtn: "Фильтры",
      sortNew: "Новинки",
      sortLow: "Сначала дешевые",
      sortHigh: "Сначала дорогие",
      sortPopular: "По популярности",
      emptyTitle: "Товары не найдены",
      emptyDesc: "Попробуйте изменить поисковый запрос или фильтры.",
      resetFilters: "Сбросить все фильтры",
      promoCardSub: "Акция по промокоду",
      promoCardTitle: "Скидка 50 000 сум от 400 000 сум!",
      promoCardDesc: "Экономьте 100 000 сум при покупке от 800 000 сум. Введите промокод в корзине.",
      aboutSub: "О нас",
      aboutTitle: "sport.NAVOIY — Эпицентр футбола",
      aboutText: "Наш магазин специализируется исключительно на футбольной экипировке официальных брендов Kelme и Jako.",
      contactSub: "Контакты",
      contactTitle: "Связаться с нами",
      contactText: "Задайте вопрос или оформите командный заказ. Сообщение сразу поступит в наш Telegram-бот.",
      yourName: "Ваше имя",
      yourPhone: "Номер телефона",
      yourMessage: "Текст сообщения",
      sendMessage: "Отправить сообщение",
      footerNav: "Разделы",
      footerCategories: "Категории",
      footerContact: "Контакты",
      footerDelivery: "Доставка и оплата",
      footerPrivacy: "Политика конфиденциальности",
      dockHome: "Главная",
      dockCatalog: "Каталог",
      dockCart: "Корзина",
      dockAccount: "Кабинет",
      navCatalog: "Каталог",
      navAbout: "О нас",
      navContact: "Контакты",
      addToCart: "В корзину",
      buyNow: "Купить сейчас",
      inStock: "В НАЛИЧИИ",
      outOfStock: "НЕТ В НАЛИЧИИ",
      size: "Размер",
      color: "Цвет",
      quantity: "Количество",
      reviews: "Отзывы",
      leaveReview: "Оставить отзыв",
      submitReview: "Отправить отзыв"
    },
    en: {
      topShipping: "BTS Express delivery across all Uzbekistan",
      themeLabel: "Theme",
      allCategories: "All categories",
      wishlist: "Wishlist",
      cart: "Cart",
      login: "Login",
      heroBadge: "Official Kelme Distributor",
      heroTitle: 'KELME &amp; UZBEKISTAN NT — <span class="gold-text">NEW SEASON</span> COLLECTION',
      heroDescription: 'Professional football gear, official match balls, and training kits. Orders over 400,000 UZS get <strong style="color:var(--gold);">50,000 UZS</strong> off; orders over 800,000 UZS get <strong style="color:var(--gold);">100,000 UZS</strong> off!',
      heroCta1: "Explore Catalog",
      heroCta2: "Club Kits",
      bentoSubtitle: "Complete Athletic Gear",
      bentoTitle: "Football Categories",
      viewAll: "All →",
      trust1Title: "100% Genuine Gear",
      trust1Desc: "Official Kelme & Jako supply",
      trust2Title: "BTS Express Shipping",
      trust2Desc: "To all regions of Uzbekistan",
      trust3Title: "-1 UZS Guarantee",
      trust3Desc: "Every price is 1 UZS lower than round number",
      trust4Title: "Secure Payment",
      trust4Desc: "Cash payment upon receiving the goods",
      catalogSubtitle: "Athletic Hub · Navoiy",
      catalogTitle: "Football Gear Catalog",
      catalogBannerDesc: "High performance gear for footballers, clubs and academies.",
      filters: "Filters",
      reset: "Reset",
      filterCategories: "Categories",
      filterBrands: "Brand",
      filterStock: "Availability",
      inStockOnly: "In stock only",
      filterPrice: "Price Range (UZS)",
      applyFilters: "Apply Filters",
      filterBtn: "Filters",
      sortNew: "New arrivals",
      sortLow: "Price: low to high",
      sortHigh: "Price: high to low",
      sortPopular: "Most popular",
      emptyTitle: "No products found",
      emptyDesc: "Try adjusting your search query or filter options.",
      resetFilters: "Clear all filters",
      promoCardSub: "Exclusive Promo Code",
      promoCardTitle: "50,000 UZS off on orders over 400,000 UZS!",
      promoCardDesc: "Save 100,000 UZS on orders over 800,000 UZS. Enter promo code at checkout.",
      aboutSub: "About Us",
      aboutTitle: "sport.NAVOIY — The Football Hub",
      aboutText: "We specialize exclusively in authentic football gear from official brands Kelme and Jako.",
      contactSub: "Contact Us",
      contactTitle: "Get In Touch",
      contactText: "Have questions or team orders? Send a message directly to our Telegram bot.",
      yourName: "Your name",
      yourPhone: "Phone number",
      yourMessage: "Message text",
      sendMessage: "Send Message",
      footerNav: "Navigation",
      footerCategories: "Categories",
      footerContact: "Contact",
      footerDelivery: "Shipping & Payment",
      footerPrivacy: "Privacy Policy",
      dockHome: "Home",
      dockCatalog: "Catalog",
      dockCart: "Cart",
      dockAccount: "Account",
      navCatalog: "Catalog",
      navAbout: "About Us",
      navContact: "Contact",
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      inStock: "IN STOCK",
      outOfStock: "OUT OF STOCK",
      size: "Size",
      color: "Color",
      quantity: "Quantity",
      reviews: "Reviews",
      leaveReview: "Write Review",
      submitReview: "Post Review"
    }
  };

  // Helpers
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const tr = key => I18N[state.language]?.[key] ?? I18N.uz[key] ?? key;

  const money = num => {
    return `${new Intl.NumberFormat("uz-UZ").format(Number(num) || 0)} so‘m`;
  };

  const safe = str => {
    return String(str ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  };

  function toast(message, isError = false) {
    const el = $("#toast-msg");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("error", isError);
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  async function api(url, options = {}) {
    const res = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "So‘rov bajarilmadi.");
    return data;
  }

  function getLocalizedTitle(product) {
    if (state.language === "ru") return product.title_ru || product.title;
    if (state.language === "en") return product.title_en || product.title;
    return product.title;
  }

  function fixImg(url) {
    if (!url) return "favicon.svg";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    const clean = url.replace(/^\/+/, "");
    if (window.location.protocol === "file:") {
      return "../" + clean;
    }
    return "/" + clean;
  }

  function persistStorage() {
    localStorage.setItem("sn_cart", JSON.stringify(state.cart));
    localStorage.setItem("sn_wishlist", JSON.stringify(state.wishlist));
    localStorage.setItem("sn_lang", state.language);
    localStorage.setItem("sn_theme", state.theme);
    updateBadges();
  }

  function updateBadges() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = calculateSubtotal();

    const cartBadge = $("#cart-badge");
    if (cartBadge) cartBadge.textContent = totalItems;

    const dockCartBadge = $("#dock-cart-badge");
    if (dockCartBadge) dockCartBadge.textContent = totalItems;

    const cartPrice = $("#cart-total-preview");
    if (cartPrice) cartPrice.textContent = money(subtotal);

    const wishBadge = $("#wishlist-badge");
    if (wishBadge) wishBadge.textContent = state.wishlist.length;

    const userLabel = $("#user-btn-label");
    if (userLabel) {
      userLabel.textContent = state.user ? state.user.name.split(" ")[0] : tr("login");
    }
  }

  function calculateSubtotal() {
    return state.cart.reduce((sum, item) => {
      const prod = state.products.find(p => p.id === item.id);
      return sum + (prod ? prod.price * item.quantity : 0);
    }, 0);
  }

  function calculateDiscount(subtotal = calculateSubtotal()) {
    if (!state.promoCode) return 0;
    if (subtotal > 800000) return 100000;
    if (subtotal > 400000) return 50000;
    return 0;
  }

  // ==========================================================================
  // Filtering & Rendering Products
  // ==========================================================================

  function getFilteredProducts() {
    let list = [...state.products];

    // Category filter
    if (state.selectedCategory !== "all") {
      list = list.filter(p => p.category === state.selectedCategory);
    }

    // Search query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(p => {
        const text = `${p.title} ${p.title_ru} ${p.title_en} ${p.brand} ${p.sku} ${p.category} ${p.description}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Brand filter
    if (state.selectedBrands.size > 0) {
      list = list.filter(p => state.selectedBrands.has(p.brand));
    }

    // In-stock only
    if (state.inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    // Price range
    if (state.priceMin !== null && !isNaN(state.priceMin)) {
      list = list.filter(p => p.price >= state.priceMin);
    }
    if (state.priceMax !== null && !isNaN(state.priceMax)) {
      list = list.filter(p => p.price <= state.priceMax);
    }

    // Sorting
    if (state.sort === "low") {
      list.sort((a, b) => a.price - b.price);
    } else if (state.sort === "high") {
      list.sort((a, b) => b.price - a.price);
    } else if (state.sort === "popular") {
      list.sort((a, b) => (b.reviews_count * 10 + b.rating) - (a.reviews_count * 10 + a.rating));
    } else {
      // "new"
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }

  function renderCategoryPills() {
    const container = $("#category-pills");
    if (!container) return;

    const allPill = `
      <button class="cat-nav-pill ${state.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">
        ${safe(tr("allCategories"))}
      </button>
    `;

    const catPills = state.categories.map(cat => `
      <button class="cat-nav-pill ${state.selectedCategory === cat ? 'active' : ''}" data-cat="${safe(cat)}">
        ${safe(cat)}
      </button>
    `).join("");

    const discountPill = `
      <button class="cat-nav-pill discount-pill ${state.selectedCategory === 'discount' ? 'active' : ''}" data-cat="discount">
        Chegirmalar %
      </button>
    `;

    container.innerHTML = allPill + catPills + discountPill;

    // Also populate search category select
    const searchCatSelect = $("#search-cat-filter");
    if (searchCatSelect) {
      searchCatSelect.innerHTML = `<option value="">${safe(tr("allCategories"))}</option>` +
        state.categories.map(cat => `<option value="${safe(cat)}" ${state.selectedCategory === cat ? 'selected' : ''}>${safe(cat)}</option>`).join("");
    }
  }

  function renderSidebarFilters() {
    // Categories list
    const catList = $("#category-filter-list");
    if (catList) {
      const counts = {};
      state.products.forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);

      catList.innerHTML = state.categories.map(cat => `
        <label class="filter-label">
          <span class="filter-label-left">
            <input type="radio" name="sidebar-cat" value="${safe(cat)}" ${state.selectedCategory === cat ? 'checked' : ''}/>
            <span>${safe(cat)}</span>
          </span>
          <span class="filter-count">${counts[cat] || 0}</span>
        </label>
      `).join("");
    }

    // Brands list
    const brandList = $("#brand-filter-list");
    if (brandList) {
      const brands = [...new Set(state.products.map(p => p.brand).filter(Boolean))];
      const counts = {};
      state.products.forEach(p => counts[p.brand] = (counts[p.brand] || 0) + 1);

      brandList.innerHTML = brands.map(brand => `
        <label class="filter-label">
          <span class="filter-label-left">
            <input type="checkbox" class="brand-check" value="${safe(brand)}" ${state.selectedBrands.has(brand) ? 'checked' : ''}/>
            <span>${safe(brand)}</span>
          </span>
          <span class="filter-count">${counts[brand] || 0}</span>
        </label>
      `).join("");
    }
  }

  function renderProductsGrid() {
    const grid = $("#products-grid");
    const empty = $("#catalog-empty");
    const countPill = $("#catalog-count-pill");

    let items = getFilteredProducts();

    if (state.selectedCategory === "discount") {
      items = items.filter(p => p.old_price > p.price);
    }

    if (countPill) {
      countPill.textContent = `${items.length} ta mahsulot`;
    }

    if (!items.length) {
      if (grid) grid.innerHTML = "";
      if (empty) empty.classList.remove("hidden");
      return;
    }

    if (empty) empty.classList.add("hidden");

    if (grid) {
      grid.innerHTML = items.map(product => {
        const isWish = state.wishlist.includes(product.id);
        const hasDiscount = product.old_price > product.price;
        const localizedTitle = getLocalizedTitle(product);

        let badgeHtml = "";
        if (hasDiscount) {
          badgeHtml = `<span class="card-badge badge-sale">CHEGIRMA</span>`;
        } else if (product.brand.includes("KELME")) {
          badgeHtml = `<span class="card-badge">KELME RASMIY</span>`;
        } else {
          badgeHtml = `<span class="card-badge">YANGI</span>`;
        }

        const stockHtml = product.stock > 0
          ? `<span class="card-stock-pill"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>${tr("inStock")}</span>`
          : `<span class="card-stock-pill" style="color:var(--danger);">${tr("outOfStock")}</span>`;

        const oldPriceHtml = hasDiscount
          ? `<span class="card-old-price">${money(product.old_price)}</span>`
          : "";

        return `
          <article class="product-card" data-product-id="${product.id}">
            <div class="card-img-wrap" data-open-detail="${product.id}">
              ${badgeHtml}
              <button class="card-wishlist-btn ${isWish ? 'active' : ''}" data-wish-toggle="${product.id}" type="button" aria-label="Sevimlilar">
                <span class="material-symbols-outlined text-[18px]">favorite</span>
              </button>
              <img class="card-img" src="${safe(fixImg(product.image))}" alt="${safe(localizedTitle)}" loading="lazy" onerror="this.src='favicon.svg'"/>
              ${stockHtml}
            </div>
            <div class="card-body">
              <div class="card-meta">
                <span class="card-brand">${safe(product.brand)}</span>
                <span>${safe(product.sku)}</span>
              </div>
              <h3 class="card-title" data-open-detail="${product.id}" title="${safe(localizedTitle)}">
                ${safe(localizedTitle)}
              </h3>
              <div class="card-price-row">
                <span class="card-price">${money(product.price)}</span>
                ${oldPriceHtml}
              </div>
              <button class="card-add-btn" data-quick-add="${product.id}" type="button">
                <span class="material-symbols-outlined text-[17px]">shopping_bag</span>
                <span>${safe(tr("addToCart"))}</span>
              </button>
            </div>
          </article>
        `;
      }).join("");
    }
  }

  // ==========================================================================
  // Modal Controller
  // ==========================================================================

  function openModal(html) {
    const layer = $("#main-modal-layer");
    const body = $("#modal-body");
    if (!layer || !body) return;
    body.innerHTML = html;
    layer.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const layer = $("#main-modal-layer");
    if (!layer) return;
    layer.classList.remove("show");
    document.body.style.overflow = "";
    state.activeDetailProduct = null;
  }

  // ==========================================================================
  // Product Detail Modal View with Multi-Photo Gallery & Reviews
  // ==========================================================================

  async function openProductDetail(productId) {
    let product = state.products.find(p => p.id === Number(productId));
    if (!product) return;

    try {
      const data = await api(`/api/products/${productId}`);
      if (data.product) product = data.product;
    } catch {
      // fallback to state.products
    }

    state.activeDetailProduct = product;
    state.activeDetailPhotoIdx = 0;
    state.activeReviewRating = 5;

    renderDetailModalContent();
  }

  function renderDetailModalContent() {
    const product = state.activeDetailProduct;
    if (!product) return;

    const images = ((product.images && product.images.length) ? product.images : [product.image]).map(fixImg);
    const activePhoto = images[state.activeDetailPhotoIdx] || fixImg(product.image);
    const localizedTitle = getLocalizedTitle(product);
    const hasDiscount = product.old_price > product.price;

    const isFootwear = /butsi|sarakanoshka|tapochka|poyabzal|krossovka/i.test(product.category + product.title);
    const isClothing = /forma|shortik|futbolka|kurtka|triko|kostyum|mayka/i.test(product.category + product.title);

    let sizes = ["Universal"];
    if (isFootwear) {
      sizes = ["38", "39", "40", "41", "42", "43", "44", "45"];
    } else if (isClothing) {
      sizes = ["S", "M", "L", "XL", "XXL"];
    }

    const thumbsHtml = images.length > 1 ? `
      <div class="gallery-thumbs">
        ${images.map((img, idx) => `
          <button class="thumb-btn ${idx === state.activeDetailPhotoIdx ? 'active' : ''}" data-thumb-idx="${idx}" type="button">
            <img src="${safe(img)}" alt="Rasm ${idx+1}" onerror="this.src='favicon.svg'"/>
          </button>
        `).join("")}
      </div>
    ` : "";

    const reviews = product.reviews || [];
    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "5.0";

    const reviewsHtml = reviews.length ? reviews.map(r => `
      <div class="review-item">
        <div class="review-item-top">
          <span class="review-author">${safe(r.user_name)}</span>
          <span class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
        </div>
        <div class="review-comment">${safe(r.comment)}</div>
        <div class="text-[10px] text-muted mt-1">${safe((r.created_at || "").slice(0, 10))}</div>
      </div>
    `).join("") : `<p class="text-secondary text-xs">Ushbu mahsulotga hali sharh yozilmagan. Birinchi bo'lib fikr bildiring!</p>`;

    const reviewFormHtml = state.user ? `
      <form class="mt-4 pt-3 border-t border-border" id="new-review-form">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-bold uppercase text-secondary">Baholang:</span>
          <div class="flex gap-1 text-gold cursor-pointer" id="star-rating-select">
            ${[1,2,3,4,5].map(star => `
              <span class="star-pick text-[20px]" data-star="${star}">★</span>
            `).join("")}
          </div>
        </div>
        <textarea class="w-full bg-surface-low border border-border rounded-md p-2 text-xs text-primary mb-2" id="review-comment-input" rows="2" placeholder="Mahsulot haqida fikringiz..." required minlength="3"></textarea>
        <button class="btn-primary text-xs py-1.5 px-3" type="submit">${safe(tr("submitReview"))}</button>
      </form>
    ` : `
      <div class="mt-3 p-3 bg-surface-low rounded-md border border-border text-center">
        <p class="text-xs text-secondary mb-2">Sharh qoldirish uchun hisobingizga kiring.</p>
        <button class="btn-secondary text-xs py-1 px-3 account-open" type="button">${safe(tr("login"))}</button>
      </div>
    `;

    openModal(`
      <div class="detail-grid">
        <!-- Left Photo Gallery -->
        <div class="gallery-container">
          <div class="gallery-main">
            <img id="detail-active-photo" src="${safe(activePhoto)}" alt="${safe(localizedTitle)}"/>
          </div>
          ${thumbsHtml}
        </div>

        <!-- Right Product Info -->
        <div class="detail-info">
          <div class="detail-brand-badge">
            <span class="material-symbols-outlined text-[16px]">verified</span>
            <span>${safe(product.brand)} · ${safe(product.category)}</span>
          </div>

          <h2 class="detail-title">${safe(localizedTitle)}</h2>
          <div class="detail-sku">Artikul: <strong>${safe(product.sku)}</strong></div>

          <!-- Price Box with -1 sum rule -->
          <div class="detail-price-box">
            <span class="detail-price-val">${money(product.price)}</span>
            ${hasDiscount ? `<span class="detail-old-price-val">${money(product.old_price)}</span>` : ""}
          </div>

          <!-- Stock Pill -->
          <div class="mb-4">
            ${product.stock > 0
              ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold text-xs"><span class="w-2 h-2 rounded-full bg-emerald-400"></span>Omborda ${product.stock} dona mavjud</span>`
              : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 text-red-400 font-bold text-xs">Hozircha omborda tugagan</span>`
            }
          </div>

          <!-- Size Selector -->
          <div class="detail-selector-title">${safe(tr("size"))}</div>
          <div class="chips-row" id="detail-size-chips">
            ${sizes.map((s, idx) => `
              <button class="chip-btn ${idx === 0 ? 'active' : ''}" data-size="${safe(s)}" type="button">${safe(s)}</button>
            `).join("")}
          </div>

          <!-- Color / Note -->
          <div class="detail-selector-title">${safe(tr("color"))}</div>
          <div class="mb-4">
            <input class="w-full bg-surface-low border border-border rounded-md px-3 py-1.5 text-xs text-primary" id="detail-color-input" type="text" placeholder="Masalan: Qora-oltin yoki oq" value="Asosiy rang"/>
          </div>

          <!-- Quantity Stepper -->
          <div class="detail-selector-title">${safe(tr("quantity"))}</div>
          <div class="qty-control">
            <button class="qty-btn" id="detail-qty-minus" type="button">−</button>
            <span class="qty-display" id="detail-qty-val">1</span>
            <button class="qty-btn" id="detail-qty-plus" type="button">+</button>
          </div>

          <!-- Action Buttons -->
          <div class="detail-actions">
            <button class="btn-primary" id="detail-add-cart-btn" type="button">
              <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span>${safe(tr("addToCart"))}</span>
            </button>
            <button class="btn-secondary" id="detail-buy-now-btn" type="button">
              <span class="material-symbols-outlined text-[18px]">flash_on</span>
              <span>${safe(tr("buyNow"))}</span>
            </button>
          </div>

          <!-- Description -->
          <div class="text-xs text-secondary leading-relaxed border-t border-border pt-4">
            <strong>Tavsif:</strong> ${safe(product.description)}
          </div>

          <!-- Reviews Block -->
          <div class="reviews-block">
            <div class="reviews-head">
              <h4 class="font-display font-bold text-sm text-primary flex items-center gap-2">
                <span class="material-symbols-outlined text-gold text-[18px]">star</span>
                <span>${safe(tr("reviews"))} (${reviews.length}) · ${avgRating} ★</span>
              </h4>
            </div>
            <div class="reviews-list">
              ${reviewsHtml}
            </div>
            ${reviewFormHtml}
          </div>
        </div>
      </div>
    `);
  }

  // ==========================================================================
  // Cart & 3-Step Checkout Controller
  // ==========================================================================

  function openCartModal() {
    state.checkoutStep = 1;
    renderCartStepper();
  }

  function renderCartStepper() {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const delivery = state.checkoutData.deliveryMethod === "Do‘kondan olib ketish" ? 0 : 0;
    const total = Math.max(0, subtotal - discount + delivery);

    const step1Active = state.checkoutStep === 1;
    const step2Active = state.checkoutStep === 2;
    const step3Active = state.checkoutStep === 3;

    const stepperHeader = `
      <div class="checkout-stepper">
        <div class="step-indicator ${step1Active ? 'active' : (state.checkoutStep > 1 ? 'done' : '')}">
          <span>1. Savat</span>
        </div>
        <span class="material-symbols-outlined text-muted text-[16px]">chevron_right</span>
        <div class="step-indicator ${step2Active ? 'active' : (state.checkoutStep > 2 ? 'done' : '')}">
          <span>2. Yetkazib berish</span>
        </div>
        <span class="material-symbols-outlined text-muted text-[16px]">chevron_right</span>
        <div class="step-indicator ${step3Active ? 'active' : ''}">
          <span>3. To'lov va Tasdiq</span>
        </div>
      </div>
    `;

    // STEP 1: CART ITEMS
    if (step1Active) {
      if (!state.cart.length) {
        openModal(`
          ${stepperHeader}
          <div class="py-12 text-center">
            <span class="material-symbols-outlined text-[54px] text-gold mb-3">shopping_bag</span>
            <h3 class="font-display font-bold text-lg mb-1">Savatingiz hozircha bo'sh</h3>
            <p class="text-secondary text-xs mb-4">Katalogdan o'zingizga yoqqan futbol tovarlarini tanlang.</p>
            <a class="btn-primary" href="#catalog" onclick="document.getElementById('modal-close-btn').click();">
              Katalogga o'tish
            </a>
          </div>
        `);
        return;
      }

      const cartRows = state.cart.map(item => {
        const prod = state.products.find(p => p.id === item.id);
        if (!prod) return "";
        const itemTotal = prod.price * item.quantity;
        const key = `${prod.id}|${item.size || ''}|${item.color || ''}`;

        return `
          <div class="flex items-center justify-between gap-4 py-3 border-b border-border">
            <div class="flex items-center gap-3 min-w-0">
              <img class="w-14 h-14 rounded-lg bg-surface-low object-cover border border-border flex-shrink-0" src="${safe(fixImg(prod.image))}" alt="${safe(prod.title)}" onerror="this.src='favicon.svg'"/>
              <div class="min-w-0">
                <div class="font-bold text-xs text-primary truncate">${safe(getLocalizedTitle(prod))}</div>
                <div class="text-[11px] text-muted">${safe(prod.sku)} · ${safe(item.size || 'Standart')} · ${safe(item.color || '')}</div>
                <div class="font-display font-bold text-xs text-gold mt-1">${money(prod.price)}</div>
              </div>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
              <div class="qty-control mb-0 scale-90">
                <button class="qty-btn" data-cart-qty="${safe(key)}" data-delta="-1">−</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" data-cart-qty="${safe(key)}" data-delta="1">+</button>
              </div>
              <div class="font-display font-bold text-xs min-w-[70px] text-right">${money(itemTotal)}</div>
              <button class="text-muted hover:text-red-500 p-1" data-cart-del="${safe(key)}" title="O'chirish">
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        `;
      }).join("");

      openModal(`
        ${stepperHeader}
        <h3 class="font-display font-bold text-lg mb-3">Tanlangan Mahsulotlar (${state.cart.length} xil)</h3>
        <div class="max-h-[300px] overflow-y-auto pr-1 mb-4">
          ${cartRows}
        </div>

        <!-- Promo Code Box -->
        <div class="bg-surface-low p-3 rounded-lg border border-border mb-4">
          <form class="flex items-center gap-2" id="cart-promo-form">
            <input class="flex-1 bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-primary uppercase font-bold" id="cart-promo-input" type="text" placeholder="Promokod (masalan, YANGI2026)" value="${safe(state.promoCode)}"/>
            <button class="btn-secondary text-xs py-1.5 px-3" type="submit">Qo'llash</button>
          </form>
          ${discount > 0 ? `
            <div class="mt-2 text-xs text-emerald-400 font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Promokod tasdiqlandi: ${money(discount)} chegirma berildi!</span>
            </div>
          ` : `
            <div class="mt-2 text-[11px] text-muted">
              400 000 so'mdan oshsa 50 000 so'm, 800 000 so'mdan oshsa 100 000 so'm chegirma.
            </div>
          `}
        </div>

        <!-- Summary -->
        <div class="bg-surface-low p-3.5 rounded-lg border border-border mb-4 text-xs space-y-1.5">
          <div class="flex justify-between text-secondary">
            <span>Mahsulotlar summasi:</span>
            <span class="font-bold text-primary">${money(subtotal)}</span>
          </div>
          ${discount > 0 ? `
            <div class="flex justify-between text-emerald-400 font-bold">
              <span>Promokod chegirmasi:</span>
              <span>− ${money(discount)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between text-base font-display font-bold text-primary pt-2 border-t border-border">
            <span>Jami to'lov:</span>
            <span class="text-gold text-lg">${money(total)}</span>
          </div>
        </div>

        <button class="btn-primary w-full py-2.5" id="cart-to-step2" type="button">
          <span>Yetkazib berishga o'tish</span>
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      `);
      return;
    }

    // STEP 2: SHIPPING DETAILS
    if (step2Active) {
      if (!state.user) {
        openAuthModal("checkout");
        toast("Buyurtma berish uchun tizimga kiring yoki ro'yxatdan o'ting.");
        return;
      }

      openModal(`
        ${stepperHeader}
        <h3 class="font-display font-bold text-lg mb-2">Yetkazib Berish Ma'lumotlari</h3>
        <p class="text-xs text-secondary mb-4">Buyurtmangiz BTS Express orqali xavfsiz yetkaziladi.</p>

        <form class="space-y-3" id="step2-form">
          <div class="grid grid-cols-2 gap-3">
            <div class="form-field">
              <label>Qabul qiluvchi ism</label>
              <input type="text" value="${safe(state.user.name)}" readonly style="opacity:0.8;"/>
            </div>
            <div class="form-field">
              <label>Telefon raqam</label>
              <input type="tel" value="${safe(state.user.phone)}" readonly style="opacity:0.8;"/>
            </div>
          </div>

          <div class="form-field">
            <label>Yetkazib berish usuli</label>
            <select id="checkout-method-select">
              <option value="Yetkazib berish" ${state.checkoutData.deliveryMethod === 'Yetkazib berish' ? 'selected' : ''}>BTS Express orqali yetkazib berish (O'zbekiston bo'ylab)</option>
              <option value="Do‘kondan olib ketish" ${state.checkoutData.deliveryMethod === 'Do‘kondan olib ketish' ? 'selected' : ''}>Do'kondan olib ketish (Navoiy shahri, Bepul)</option>
            </select>
          </div>

          <div class="form-field">
            <label>Viloyat / Hudud</label>
            <select id="checkout-region-select" required>
              ${UZBEKISTAN_REGIONS.map(reg => `
                <option value="${safe(reg)}" ${state.checkoutData.region === reg ? 'selected' : ''}>${safe(reg)}</option>
              `).join("")}
            </select>
          </div>

          <div class="form-field">
            <label>To'liq manzil (shahar, tuman, ko'cha, uy raqami)</label>
            <input id="checkout-address-input" type="text" placeholder="Masalan: Navoiy sh., G'alaba shoh ko'chasi, 12-uy" value="${safe(state.checkoutData.address)}" required minlength="4"/>
          </div>

          <div class="flex gap-3 pt-2">
            <button class="btn-secondary flex-1 py-2" id="back-to-step1" type="button">
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Savatga qaytish</span>
            </button>
            <button class="btn-primary flex-1 py-2" type="submit">
              <span>To'lovga o'tish</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </form>
      `);
      return;
    }

    // STEP 3: PAYMENT & CONFIRMATION
    if (step3Active) {
      openModal(`
        ${stepperHeader}
        <h3 class="font-display font-bold text-lg mb-2">To'lov Usuli va Tasdiq</h3>
        <p class="text-xs text-secondary mb-4">To'lov turini tanlang va buyurtmani tasdiqlang.</p>

        <form class="space-y-4" id="step3-form">
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase text-secondary">To'lov Turi</label>
            <div class="p-3.5 bg-surface-low border border-gold/40 rounded-lg flex items-start gap-3">
              <span class="material-symbols-outlined text-gold text-[22px] mt-0.5">handshake</span>
              <div class="flex-1">
                <input type="hidden" name="payment-method" value="Qabul qilinganda to'lash (Naqd pul)"/>
                <div class="text-xs font-bold text-primary">Qabul qilib olganda to'lash (Naqd pul)</div>
                <div class="text-[11px] text-muted mt-1 leading-relaxed">
                  Onlayn to'lov talab qilinmaydi. Buyurtmangiz yetib kelgach, mahsulotni ko'rib va tekshirib naqd pulda to'laysiz.
                </div>
              </div>
            </div>
          </div>

          <div class="form-field">
            <label>Buyurtmaga izoh (ixtiyoriy)</label>
            <textarea id="checkout-comment-input" rows="2" placeholder="Masalan: Eshik kodi, qo'ng'iroq qilish vaqti...">${safe(state.checkoutData.comment)}</textarea>
          </div>

          <!-- Final Review Box -->
          <div class="bg-surface-low p-3.5 rounded-lg border border-border text-xs space-y-1">
            <div class="font-bold text-primary mb-1">Buyurtma xulosasi:</div>
            <div class="text-muted">Mijoz: ${safe(state.user.name)} (${safe(state.user.phone)})</div>
            <div class="text-muted">Manzil: ${safe(state.checkoutData.region)}, ${safe(state.checkoutData.address)}</div>
            <div class="text-muted">Tovarlar soni: ${state.cart.reduce((s,i)=>s+i.quantity,0)} ta</div>
            <div class="flex justify-between text-base font-display font-bold text-primary pt-2 border-t border-border mt-2">
              <span>Jami summa:</span>
              <span class="text-gold text-lg">${money(total)}</span>
            </div>
          </div>

          <div class="flex gap-3">
            <button class="btn-secondary flex-1 py-2.5" id="back-to-step2" type="button">
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Orqaga</span>
            </button>
            <button class="btn-primary flex-1 py-2.5" id="submit-order-btn" type="submit">
              <span class="material-symbols-outlined text-[18px]">verified</span>
              <span>Buyurtmani tasdiqlash</span>
            </button>
          </div>
        </form>
      `);
      return;
    }
  }

  async function submitOrder() {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const total = Math.max(0, subtotal - discount);

    const payload = {
      items: state.cart,
      promo_code: discount > 0 ? state.promoCode : "",
      delivery_method: state.checkoutData.deliveryMethod,
      region: state.checkoutData.region,
      address: state.checkoutData.address,
      payment_method: state.checkoutData.paymentMethod,
      comment: state.checkoutData.comment
    };

    try {
      const res = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      // Clear cart
      state.cart = [];
      state.promoCode = "";
      state.promoDiscount = 0;
      persistStorage();

      // Show Success Screen
      openModal(`
        <div class="py-10 text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <span class="material-symbols-outlined text-[36px]">check_circle</span>
          </div>
          <h2 class="font-display font-bold text-2xl mb-1 text-primary">Buyurtmangiz Qabul Qilindi!</h2>
          <div class="font-display font-bold text-gold text-lg mb-2">Buyurtma #${res.order_id}</div>
          <p class="text-secondary text-xs max-w-sm mx-auto mb-6">
            Rahmat! Buyurtma tafsilotlari tizimga saqlandi${res.telegram_sent ? " va do'konimiz Telegram botiga yuborildi." : "."} Tez orada operatorimiz siz bilan bog'lanadi.
          </p>
          <div class="flex justify-center gap-3">
            <button class="btn-primary" onclick="document.getElementById('modal-close-btn').click();">
              Xaridni davom ettirish
            </button>
            <button class="btn-secondary account-open" type="button">
              Buyurtmalarim tarixi
            </button>
          </div>
        </div>
      `);
    } catch (err) {
      toast(err.message, true);
    }
  }

  // ==========================================================================
  // Wishlist View
  // ==========================================================================

  function openWishlistModal() {
    const items = state.products.filter(p => state.wishlist.includes(p.id));

    if (!items.length) {
      openModal(`
        <div class="py-12 text-center">
          <span class="material-symbols-outlined text-[54px] text-danger mb-3">favorite_border</span>
          <h3 class="font-display font-bold text-lg mb-1">Sevimli mahsulotlar yo'q</h3>
          <p class="text-secondary text-xs mb-4">Mahsulot kartalaridagi yurakcha belgisini bosib sevimli tovarlaringizni saqlang.</p>
          <a class="btn-primary" href="#catalog" onclick="document.getElementById('modal-close-btn').click();">
            Katalogga o'tish
          </a>
        </div>
      `);
      return;
    }

    const rows = items.map(p => `
      <div class="flex items-center justify-between gap-3 py-3 border-b border-border">
        <div class="flex items-center gap-3 min-w-0">
          <img class="w-14 h-14 rounded-lg bg-surface-low object-cover border border-border" src="${safe(fixImg(p.image))}" alt="${safe(p.title)}" onerror="this.src='favicon.svg'"/>
          <div class="min-w-0">
            <div class="font-bold text-xs text-primary truncate">${safe(getLocalizedTitle(p))}</div>
            <div class="text-[11px] text-muted">${safe(p.brand)} · ${safe(p.sku)}</div>
            <div class="font-display font-bold text-xs text-gold mt-1">${money(p.price)}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-primary text-xs py-1.5 px-3" data-quick-add="${p.id}" type="button">
            ${safe(tr("addToCart"))}
          </button>
          <button class="text-muted hover:text-red-500 p-1" data-wish-toggle="${p.id}" title="Olib tashlash">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    `).join("");

    openModal(`
      <h3 class="font-display font-bold text-lg mb-3">Sevimlilar (${items.length})</h3>
      <div class="max-h-[380px] overflow-y-auto mb-4">
        ${rows}
      </div>
      <button class="btn-secondary w-full text-xs py-2" id="wishlist-add-all-btn" type="button">
        Barchasini savatga qo'shish
      </button>
    `);
  }

  // ==========================================================================
  // User Authentication & Profile (Kabinet)
  // ==========================================================================

  function openAuthModal(mode = "login") {
    openModal(`
      <div class="max-w-md mx-auto">
        <div class="flex border-b border-border mb-4">
          <button class="flex-1 py-2 text-center font-display font-bold text-sm ${mode === 'login' ? 'text-gold border-b-2 border-gold' : 'text-secondary'}" id="auth-tab-login" type="button">
            Kirish
          </button>
          <button class="flex-1 py-2 text-center font-display font-bold text-sm ${mode === 'register' ? 'text-gold border-b-2 border-gold' : 'text-secondary'}" id="auth-tab-register" type="button">
            Ro'yxatdan o'tish
          </button>
        </div>

        ${mode === "login" ? `
          <form class="space-y-3" id="login-form">
            <div class="form-field">
              <label>Telefon raqam</label>
              <input name="phone" type="tel" placeholder="+998 90 123 45 67" required/>
            </div>
            <div class="form-field">
              <label>Parol</label>
              <input name="password" type="password" placeholder="Parolingizni kiriting" required/>
            </div>
            <button class="btn-primary w-full py-2.5 mt-2" type="submit">
              Tizimga kirish
            </button>
          </form>
        ` : `
          <form class="space-y-3" id="register-form">
            <div class="form-field">
              <label>Ismingiz</label>
              <input name="name" type="text" placeholder="Masalan: Sardor" required minlength="2"/>
            </div>
            <div class="form-field">
              <label>Telefon raqam (+998)</label>
              <input name="phone" type="tel" placeholder="+998 90 123 45 67" required/>
            </div>
            <div class="form-field">
              <label>Yangi parol (kamida 8 belgi)</label>
              <input name="password" type="password" placeholder="Kamida 8 ta belgi" required minlength="8"/>
            </div>
            <button class="btn-primary w-full py-2.5 mt-2" type="submit">
              Ro'yxatdan o'tish
            </button>
          </form>
        `}
      </div>
    `);
  }

  async function openAccountModal() {
    if (!state.user) {
      openAuthModal("login");
      return;
    }

    let orders = [];
    try {
      const res = await api("/api/account/orders");
      orders = res.orders || [];
    } catch (e) {
      console.error(e);
    }

    const orderRows = orders.length ? orders.map(ord => {
      let items = [];
      try { items = JSON.parse(ord.items_json); } catch {}
      const itemsText = items.map(i => `${safe(i.name)} (${i.quantity} dona)`).join(", ");

      let statusColor = "bg-amber-500/10 text-amber-400";
      if (ord.status === "Tasdiqlandi") statusColor = "bg-blue-500/10 text-blue-400";
      if (ord.status === "Yetkazilmoqda") statusColor = "bg-purple-500/10 text-purple-400";
      if (ord.status === "Yetkazildi") statusColor = "bg-emerald-500/10 text-emerald-400";
      if (ord.status === "Bekor qilindi") statusColor = "bg-red-500/10 text-red-400";

      return `
        <div class="p-3 bg-surface-low border border-border rounded-lg mb-2">
          <div class="flex items-center justify-between mb-1">
            <span class="font-display font-bold text-xs text-primary">Buyurtma #${ord.id}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}">${safe(ord.status)}</span>
          </div>
          <div class="text-[11px] text-secondary mb-1">${safe(itemsText || "Futbol mahsulotlari")}</div>
          <div class="flex items-center justify-between text-xs pt-1 border-t border-border/50">
            <span class="text-muted text-[10px]">${safe((ord.created_at || '').slice(0, 10))}</span>
            <span class="font-display font-bold text-gold">${money(ord.total)}</span>
          </div>
        </div>
      `;
    }).join("") : `<p class="text-xs text-secondary py-4 text-center">Hali buyurtmalaringiz yo'q.</p>`;

    openModal(`
      <div>
        <div class="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gold text-black font-display font-bold text-lg flex items-center justify-center">
              ${safe(state.user.name[0] || 'U')}
            </div>
            <div>
              <h3 class="font-display font-bold text-base text-primary">${safe(state.user.name)}</h3>
              <p class="text-xs text-secondary">${safe(state.user.phone)}</p>
            </div>
          </div>
          <button class="btn-secondary text-xs py-1.5 px-3 hover:text-red-400" id="user-logout-btn" type="button">
            Chiqish
          </button>
        </div>

        <h4 class="font-display font-bold text-sm mb-3 text-primary flex items-center gap-2">
          <span class="material-symbols-outlined text-gold text-[18px]">receipt_long</span>
          <span>Buyurtmalarim tarixi (${orders.length})</span>
        </h4>
        <div class="max-h-[320px] overflow-y-auto">
          ${orderRows}
        </div>
      </div>
    `);
  }

  // ==========================================================================
  // Static Info Modals (Delivery & Privacy)
  // ==========================================================================

  function openDeliveryModal() {
    openModal(`
      <div class="max-w-xl">
        <h3 class="font-display font-bold text-xl mb-3 flex items-center gap-2">
          <span class="material-symbols-outlined text-gold">local_shipping</span>
          <span>Yetkazib Berish va To'lov Shartlari</span>
        </h3>
        <div class="text-xs text-secondary space-y-3 leading-relaxed">
          <p>
            <strong>1. BTS Express orqali yetkazib berish:</strong><br/>
            O'zbekistonning barcha viloyatlariga (Toshkent, Samarqand, Buxoro, Andijon, Farg'ona va boshqalar) 1 kundan 3 kungacha yetkazib beriladi. Narxi buyurtma berilgan viloyatga qarab belgilanadi.
          </p>
          <p>
            <strong>2. Do'kondan olib ketish (Samovivoz):</strong><br/>
            Navoiy shahridagi do'konimizdan bepul olib ketishingiz mumkin. Manzil: Navoiy shahri, Markaziy sport majmuasi.
          </p>
          <p>
            <strong>3. To'lov usuli:</strong><br/>
            • Faqat mahsulotni qabul qilib olganda to'lash (Naqd pulda).<br/>
            • Onlayn oldindan to'lov talab qilinmaydi — buyurtmangizni kuryerdan ko'rib, tekshirib to'laysiz!
          </p>
          <p>
            <strong>4. -1 So'm qoidasi:</strong><br/>
            Barcha mahsulotlarimiz saytda yaxlit narxdan 1 so'm kamaytirib ko'rsatiladi (masalan, 250 000 o'rniga 249 999 so'm).
          </p>
        </div>
      </div>
    `);
  }

  function openPrivacyModal() {
    openModal(`
      <div class="max-w-xl">
        <h3 class="font-display font-bold text-xl mb-3 flex items-center gap-2">
          <span class="material-symbols-outlined text-gold">privacy_tip</span>
          <span>Maxfiylik Siyosati</span>
        </h3>
        <div class="text-xs text-secondary space-y-3 leading-relaxed">
          <p>
            sport.NAVOIY foydalanuvchilarning shaxsiy ma'lumotlari xavfsizligini ta'minlashga qat'iy rioya qiladi.
          </p>
          <p>
            <strong>To'planadigan ma'lumotlar:</strong><br/>
            Ismingiz, telefon raqamingiz va yetkazib berish manzilingiz faqatgina buyurtmani rasmiylashtirish, tasdiqlash va Telegram orqali xabar berish uchun ishlatiladi.
          </p>
          <p>
            <strong>Parollar xavfsizligi:</strong><br/>
            Barcha foydalanuvchi va admin parollari serverda PBKDF2-SHA256 xavfsiz kriptografik usulda xeshlanib saqlanadi va hech qayerda ochiq ko'rinmaydi.
          </p>
        </div>
      </div>
    `);
  }

  // ==========================================================================
  // Initialization & Event Listeners
  // ==========================================================================

  async function init() {
    // Theme setup
    document.body.classList.toggle("light", state.theme === "light");
    const themeIcon = $("#theme-icon");
    if (themeIcon) themeIcon.textContent = state.theme === "light" ? "light_mode" : "dark_mode";

    // Lang setup
    const langSelect = $("#lang-select");
    if (langSelect) langSelect.value = state.language;
    applyLanguageTranslations();

    // Check if running directly via file:// protocol
    if (window.location.protocol === "file:") {
      const banner = document.createElement("div");
      banner.className = "bg-amber-500/20 text-amber-300 border-b border-amber-500/40 text-center py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2";
      banner.innerHTML = `<span class="material-symbols-outlined text-[16px]">info</span><span>Diqqat: Sayt lokal fayl rejimida ochildi. Buyurtma berish, shaxsiy kabinet va Admin panel uchun <strong>Saytni_ishga_tushirish.bat</strong> faylini bosing yoki <strong>http://127.0.0.1:8000</strong> orqali kiring.</span>`;
      document.body.prepend(banner);
    }

    // Fix hero image
    const heroImg = $("#hero-featured-img");
    if (heroImg) {
      heroImg.src = fixImg("450-ming somlik butsilar/main_premium_450k.png");
    }

    // Check current session
    try {
      const res = await api("/api/me");
      state.user = res.user;
    } catch {
      state.user = null;
    }

    updateBadges();

    // Load products
    try {
      const data = await api("/api/products");
      state.products = data.products || [];
      state.categories = data.categories || [];
    } catch (err) {
      console.warn("API yuklanmadi, embedded mahsulotlar ishlatilmoqda:", err);
      if (window.EMBEDDED_PRODUCTS && window.EMBEDDED_PRODUCTS.length) {
        state.products = window.EMBEDDED_PRODUCTS;
        state.categories = [
          "Futbol formalari",
          "Futbolka va shortiklar",
          "Futbol getrlari / paypoqlar",
          "Mashg‘ulot kiyimlari",
          "Darvozabon kiyimlari va qo‘lqoplari",
          "Futbol butsalari va krossovkalari",
          "Himoya vositalari",
          "Futbol to‘plari",
          "Aksessuarlar"
        ];
      }
    }
    renderCategoryPills();
    renderSidebarFilters();
    renderProductsGrid();

    // Check if query has ?open=ID
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const openParam = urlParams.get("open");
      if (openParam) {
        const openId = parseInt(openParam, 10);
        setTimeout(() => openDetailModal(openId), 300);
      }
    } catch {}
  }

  function applyLanguageTranslations() {
    document.documentElement.lang = state.language;
    $$("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (I18N[state.language]?.[key]) {
        el.innerHTML = I18N[state.language][key];
      }
    });
  }

  // Global Click Handlers
  document.addEventListener("click", async event => {
    const target = event.target;

    // Modal Close
    if (target.closest("#modal-close-btn") || target.classList.contains("modal-backdrop")) {
      closeModal();
      return;
    }

    // Theme Toggle
    if (target.closest("#theme-toggle-btn")) {
      state.theme = state.theme === "dark" ? "light" : "dark";
      document.body.classList.toggle("light", state.theme === "light");
      const icon = $("#theme-icon");
      if (icon) icon.textContent = state.theme === "light" ? "light_mode" : "dark_mode";
      persistStorage();
      return;
    }

    // Open Cart Modal
    if (target.closest(".cart-open") || target.closest("#dock-cart-btn")) {
      openCartModal();
      return;
    }

    // Open Wishlist Modal
    if (target.closest(".wishlist-open")) {
      openWishlistModal();
      return;
    }

    // Open Account / Profile
    if (target.closest(".account-open") || target.closest("#dock-account-btn")) {
      if (state.user) openAccountModal();
      else openAuthModal("login");
      return;
    }

    // Dock Navigation
    if (target.closest("#dock-home-btn")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      $$(".dock-btn").forEach(b => b.classList.remove("active"));
      target.closest("#dock-home-btn").classList.add("active");
      return;
    }

    if (target.closest("#dock-catalog-btn")) {
      const catSec = $("#catalog");
      if (catSec) catSec.scrollIntoView({ behavior: "smooth" });
      $$(".dock-btn").forEach(b => b.classList.remove("active"));
      target.closest("#dock-catalog-btn").classList.add("active");
      return;
    }

    // Hero Kits Button
    if (target.closest("#hero-kits-btn")) {
      state.selectedCategory = "Futbol formalari";
      renderCategoryPills();
      renderProductsGrid();
      const catSec = $("#catalog");
      if (catSec) catSec.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Hero Featured Card
    if (target.closest("#hero-featured-card")) {
      // open 450k boots detail (id 13 or matching title)
      const boot = state.products.find(p => p.price === 449999 || p.title.includes("Precision"));
      if (boot) openProductDetail(boot.id);
      return;
    }

    // Bento Categories Click
    const bentoItem = target.closest(".bento-item");
    if (bentoItem) {
      const cat = bentoItem.dataset.category;
      if (cat) {
        state.selectedCategory = cat;
        renderCategoryPills();
        renderProductsGrid();
        const catSec = $("#catalog");
        if (catSec) catSec.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    // Category Pill Click
    const catPill = target.closest(".cat-nav-pill");
    if (catPill) {
      const cat = catPill.dataset.cat;
      state.selectedCategory = cat;
      renderCategoryPills();
      renderProductsGrid();
      return;
    }

    // Open Product Detail
    const detailTrigger = target.closest("[data-open-detail]");
    if (detailTrigger) {
      const id = detailTrigger.dataset.openDetail;
      if (id) openProductDetail(id);
      return;
    }

    // Quick Add to Cart from Card
    const addBtn = target.closest("[data-quick-add]");
    if (addBtn) {
      const id = Number(addBtn.dataset.quickAdd);
      const prod = state.products.find(p => p.id === id);
      if (!prod || prod.stock < 1) {
        toast("Ushbu mahsulot hozircha mavjud emas.", true);
        return;
      }
      const existing = state.cart.find(item => item.id === id);
      if (existing) {
        existing.quantity = Math.min(20, existing.quantity + 1);
      } else {
        state.cart.push({ id, quantity: 1, size: "Standart", color: "Asosiy" });
      }
      persistStorage();
      toast("Mahsulot savatga qo'shildi!");
      return;
    }

    // Toggle Wishlist
    const wishBtn = target.closest("[data-wish-toggle]");
    if (wishBtn) {
      const id = Number(wishBtn.dataset.wishToggle);
      if (state.wishlist.includes(id)) {
        state.wishlist = state.wishlist.filter(wId => wId !== id);
        toast("Sevimlilardan olib tashlandi.");
      } else {
        state.wishlist.push(id);
        toast("Sevimlilarga saqlandi!");
      }
      persistStorage();
      renderProductsGrid();
      return;
    }

    // Wishlist Add All
    if (target.closest("#wishlist-add-all-btn")) {
      state.wishlist.forEach(id => {
        const prod = state.products.find(p => p.id === id);
        if (prod && prod.stock > 0) {
          const ex = state.cart.find(c => c.id === id);
          if (ex) ex.quantity = Math.min(20, ex.quantity + 1);
          else state.cart.push({ id, quantity: 1, size: "Standart", color: "" });
        }
      });
      persistStorage();
      closeModal();
      openCartModal();
      toast("Barcha sevimlilar savatga qo'shildi!");
      return;
    }

    // Gallery Thumbnail Click in Detail
    const thumbBtn = target.closest("[data-thumb-idx]");
    if (thumbBtn) {
      const idx = Number(thumbBtn.dataset.thumbIdx);
      state.activeDetailPhotoIdx = idx;
      const prod = state.activeDetailProduct;
      if (prod && prod.images && prod.images[idx]) {
        const mainPhoto = $("#detail-active-photo");
        if (mainPhoto) mainPhoto.src = prod.images[idx];
        $$(".thumb-btn").forEach((b, i) => b.classList.toggle("active", i === idx));
      }
      return;
    }

    // Detail Size Chip Click
    const chipBtn = target.closest("#detail-size-chips .chip-btn");
    if (chipBtn) {
      $$("#detail-size-chips .chip-btn").forEach(b => b.classList.remove("active"));
      chipBtn.classList.add("active");
      return;
    }

    // Detail Qty Plus/Minus
    if (target.closest("#detail-qty-plus")) {
      const valEl = $("#detail-qty-val");
      if (valEl) valEl.textContent = Math.min(20, Number(valEl.textContent) + 1);
      return;
    }
    if (target.closest("#detail-qty-minus")) {
      const valEl = $("#detail-qty-val");
      if (valEl) valEl.textContent = Math.max(1, Number(valEl.textContent) - 1);
      return;
    }

    // Detail Add to Cart Button
    if (target.closest("#detail-add-cart-btn")) {
      const prod = state.activeDetailProduct;
      if (!prod) return;
      const activeChip = $("#detail-size-chips .chip-btn.active");
      const size = activeChip ? activeChip.dataset.size : "Standart";
      const color = ($("#detail-color-input")?.value || "").trim();
      const qty = Number($("#detail-qty-val")?.textContent || 1);

      const existing = state.cart.find(item => item.id === prod.id && item.size === size && item.color === color);
      if (existing) existing.quantity = Math.min(20, existing.quantity + qty);
      else state.cart.push({ id: prod.id, quantity: qty, size, color });

      persistStorage();
      closeModal();
      toast("Mahsulot savatga qo'shildi!");
      return;
    }

    // Detail Buy Now Button
    if (target.closest("#detail-buy-now-btn")) {
      const prod = state.activeDetailProduct;
      if (!prod) return;
      const activeChip = $("#detail-size-chips .chip-btn.active");
      const size = activeChip ? activeChip.dataset.size : "Standart";
      const color = ($("#detail-color-input")?.value || "").trim();
      const qty = Number($("#detail-qty-val")?.textContent || 1);

      const existing = state.cart.find(item => item.id === prod.id && item.size === size && item.color === color);
      if (existing) existing.quantity = Math.min(20, existing.quantity + qty);
      else state.cart.push({ id: prod.id, quantity: qty, size, color });

      persistStorage();
      closeModal();
      openCartModal();
      return;
    }

    // Star Rating Click in Review Form
    const starPick = target.closest(".star-pick");
    if (starPick) {
      const star = Number(starPick.dataset.star);
      state.activeReviewRating = star;
      $$("#star-rating-select .star-pick").forEach((s, idx) => {
        s.textContent = idx < star ? "★" : "☆";
      });
      return;
    }

    // Cart Stepper Qty Changes
    const cartQtyBtn = target.closest("[data-cart-qty]");
    if (cartQtyBtn) {
      const [id, size, color] = cartQtyBtn.dataset.cartQty.split("|");
      const delta = Number(cartQtyBtn.dataset.delta);
      const item = state.cart.find(c => c.id === Number(id) && c.size === size && c.color === color);
      if (item) {
        item.quantity += delta;
        state.cart = state.cart.filter(c => c.quantity > 0);
        persistStorage();
        renderCartStepper();
      }
      return;
    }

    // Cart Stepper Delete Item
    const cartDelBtn = target.closest("[data-cart-del]");
    if (cartDelBtn) {
      const [id, size, color] = cartDelBtn.dataset.cartDel.split("|");
      state.cart = state.cart.filter(c => !(c.id === Number(id) && c.size === size && c.color === color));
      persistStorage();
      renderCartStepper();
      return;
    }

    // Stepper Navigation
    if (target.closest("#cart-to-step2")) {
      state.checkoutStep = 2;
      renderCartStepper();
      return;
    }
    if (target.closest("#back-to-step1")) {
      state.checkoutStep = 1;
      renderCartStepper();
      return;
    }
    if (target.closest("#back-to-step2")) {
      state.checkoutStep = 2;
      renderCartStepper();
      return;
    }

    // Auth Switch Tabs
    if (target.closest("#auth-tab-login")) {
      openAuthModal("login");
      return;
    }
    if (target.closest("#auth-tab-register")) {
      openAuthModal("register");
      return;
    }

    // User Logout
    if (target.closest("#user-logout-btn")) {
      await api("/api/logout", { method: "POST" }).catch(() => {});
      state.user = null;
      updateBadges();
      closeModal();
      toast("Hisobingizdan chiqdingiz.");
      return;
    }

    // Static Modals
    if (target.closest("#footer-delivery-btn")) {
      openDeliveryModal();
      return;
    }
    if (target.closest("#footer-privacy-btn")) {
      openPrivacyModal();
      return;
    }

    // Filter Reset
    if (target.closest("#filter-reset-btn") || target.closest("#reset-empty-btn")) {
      state.selectedCategory = "all";
      state.searchQuery = "";
      state.selectedBrands.clear();
      state.inStockOnly = false;
      state.priceMin = null;
      state.priceMax = null;

      const searchInput = $("#search-input");
      if (searchInput) searchInput.value = "";
      const minP = $("#filter-price-min");
      if (minP) minP.value = "";
      const maxP = $("#filter-price-max");
      if (maxP) maxP.value = "";
      const stCheck = $("#filter-stock-only");
      if (stCheck) stCheck.checked = false;

      renderCategoryPills();
      renderSidebarFilters();
      renderProductsGrid();
      return;
    }

    // Mobile filter trigger
    if (target.closest("#mobile-filter-open-btn")) {
      const sidebar = $("#filter-sidebar");
      if (sidebar) sidebar.classList.add("mobile-open");
      return;
    }
    if (target.closest("#mobile-filter-close-btn")) {
      const sidebar = $("#filter-sidebar");
      if (sidebar) sidebar.classList.remove("mobile-open");
      return;
    }

    // View mode 3/4 cols
    if (target.closest("#btn-col-3")) {
      $$("#view-mode-toggles .view-btn").forEach(b => b.classList.remove("active"));
      target.closest("#btn-col-3").classList.add("active");
      const grid = $("#products-grid");
      if (grid) grid.classList.remove("col-4");
      return;
    }
    if (target.closest("#btn-col-4")) {
      $$("#view-mode-toggles .view-btn").forEach(b => b.classList.remove("active"));
      target.closest("#btn-col-4").classList.add("active");
      const grid = $("#products-grid");
      if (grid) grid.classList.add("col-4");
      return;
    }
  });

  // Global Form Submit Handlers
  document.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.target;

    // Contact Form
    if (form.id === "contact-form") {
      const values = Object.fromEntries(new FormData(form).entries());
      try {
        await api("/api/contact", { method: "POST", body: JSON.stringify(values) });
        form.reset();
        toast("Xabaringiz do'konga yuborildi. Rahmat!");
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    // Cart Promo Form
    if (form.id === "cart-promo-form") {
      const code = ($("#cart-promo-input")?.value || "").trim().toUpperCase();
      if (!code) {
        state.promoCode = "";
        renderCartStepper();
        return;
      }
      const subtotal = calculateSubtotal();
      try {
        await api("/api/promos/validate", {
          method: "POST",
          body: JSON.stringify({ code, subtotal })
        });
        state.promoCode = code;
        renderCartStepper();
        toast(`Promokod tasdiqlandi!`);
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    // Step 2 Shipping Form
    if (form.id === "step2-form") {
      state.checkoutData.deliveryMethod = $("#checkout-method-select")?.value || "Yetkazib berish";
      state.checkoutData.region = $("#checkout-region-select")?.value || "Navoiy viloyati";
      state.checkoutData.address = ($("#checkout-address-input")?.value || "").trim();
      state.checkoutStep = 3;
      renderCartStepper();
      return;
    }

    // Step 3 Confirmation Form
    if (form.id === "step3-form") {
      state.checkoutData.paymentMethod = form.querySelector('input[name="payment-method"]')?.value || "Qabul qilinganda to'lash (Naqd pul)";
      state.checkoutData.comment = ($("#checkout-comment-input")?.value || "").trim();
      await submitOrder();
      return;
    }

    // Login Form
    if (form.id === "login-form") {
      const values = Object.fromEntries(new FormData(form).entries());
      try {
        await api("/api/login", { method: "POST", body: JSON.stringify(values) });
        const me = await api("/api/me");
        state.user = me.user;
        updateBadges();
        closeModal();
        toast(`Xush kelibsiz, ${state.user.name}!`);
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    // Register Form
    if (form.id === "register-form") {
      const values = Object.fromEntries(new FormData(form).entries());
      try {
        await api("/api/register", { method: "POST", body: JSON.stringify(values) });
        const me = await api("/api/me");
        state.user = me.user;
        updateBadges();
        closeModal();
        toast("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    // New Review Form
    if (form.id === "new-review-form") {
      const prod = state.activeDetailProduct;
      if (!prod) return;
      const comment = ($("#review-comment-input")?.value || "").trim();
      try {
        await api(`/api/products/${prod.id}/reviews`, {
          method: "POST",
          body: JSON.stringify({ rating: state.activeReviewRating, comment })
        });
        toast("Sharhingiz qabul qilindi!");
        openProductDetail(prod.id);
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }
  });

  // Global Input & Change Handlers
  document.addEventListener("input", event => {
    const target = event.target;

    // Search desktop or mobile
    if (target.id === "search-input" || target.id === "search-input-mobile") {
      state.searchQuery = target.value.trim();
      renderProductsGrid();
      return;
    }

    // Price filters
    if (target.id === "filter-price-min") {
      state.priceMin = target.value ? Number(target.value) : null;
      renderProductsGrid();
      return;
    }
    if (target.id === "filter-price-max") {
      state.priceMax = target.value ? Number(target.value) : null;
      renderProductsGrid();
      return;
    }
  });

  document.addEventListener("change", event => {
    const target = event.target;

    // Lang select
    if (target.id === "lang-select") {
      state.language = target.value;
      persistStorage();
      applyLanguageTranslations();
      renderCategoryPills();
      renderProductsGrid();
      return;
    }

    // Search category select
    if (target.id === "search-cat-filter") {
      state.selectedCategory = target.value || "all";
      renderCategoryPills();
      renderProductsGrid();
      return;
    }

    // Sort select
    if (target.id === "catalog-sort") {
      state.sort = target.value;
      renderProductsGrid();
      return;
    }

    // Sidebar Category radio
    if (target.name === "sidebar-cat") {
      state.selectedCategory = target.value;
      renderCategoryPills();
      renderProductsGrid();
      return;
    }

    // Brand Checkbox
    if (target.classList.contains("brand-check")) {
      if (target.checked) state.selectedBrands.add(target.value);
      else state.selectedBrands.delete(target.value);
      renderProductsGrid();
      return;
    }

    // Stock only
    if (target.id === "filter-stock-only") {
      state.inStockOnly = target.checked;
      renderProductsGrid();
      return;
    }
  });

  // ==========================================================================
  // PWA (Progressive Web App) - Telefon Ilovasi
  // ==========================================================================
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  function openInstallModal() {
    openModal(`
      <div class="max-w-md mx-auto text-left">
        <div class="flex items-center gap-3 pb-3 border-b border-border mb-4">
          <div class="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[24px]">install_mobile</span>
          </div>
          <div>
            <h3 class="font-display font-bold text-base text-primary">sport.NAVOIY Ilovasini O'rnatish</h3>
            <p class="text-[11px] text-muted">Telefoningiz ekraniga 1 daqiqada ilova qilib joylashtiring</p>
          </div>
        </div>

        <div class="space-y-3 text-xs leading-relaxed">
          <!-- Android Card -->
          <div class="p-3 bg-surface-low rounded-lg border border-border">
            <div class="flex items-center gap-2 font-bold text-primary mb-1 text-xs">
              <span class="text-emerald-400">●</span> Android (Google Chrome):
            </div>
            <ol class="list-decimal list-inside space-y-1 text-secondary text-[11px]">
              <li>Brauzerning yuqori o‘ng burchagidagi <strong>3 ta nuqta (⋮)</strong> ni bosing.</li>
              <li>Chiqgan menyudan <strong>«Ilovani o‘rnatish»</strong> yoki <strong>«Bosh ekranga qo‘shish»</strong> bandini tanlang.</li>
            </ol>
          </div>

          <!-- iPhone Card -->
          <div class="p-3 bg-surface-low rounded-lg border border-border">
            <div class="flex items-center gap-2 font-bold text-primary mb-1 text-xs">
              <span class="text-blue-400">●</span> iPhone (Apple Safari):
            </div>
            <ol class="list-decimal list-inside space-y-1 text-secondary text-[11px]">
              <li>Safari pastidagi <strong>«Ulashish»</strong> (Share — kvadratdan yuqoriga strelka) belgisini bosing.</li>
              <li>Pastga tushib <strong>«Bosh ekranga» (На экран «Домой» / Add to Home Screen)</strong> bandini tanlang.</li>
            </ol>
          </div>

          <!-- Desktop Card -->
          <div class="p-3 bg-surface-low rounded-lg border border-border">
            <div class="flex items-center gap-2 font-bold text-primary mb-1 text-xs">
              <span class="text-gold">●</span> Kompyuter (Chrome / Edge):
            </div>
            <p class="text-secondary text-[11px]">Brauzer manzil qatorining o‘ng chekkasidagi <strong>«O‘rnatish» (Install)</strong> belgisini bosing.</p>
          </div>
        </div>

        <button class="btn-primary w-full mt-4 py-2 text-xs" onclick="document.getElementById('modal-close-btn').click();" type="button">
          Tushundim, rahmat!
        </button>
      </div>
    `);
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("#pwa-install-btn") || e.target.closest("#dock-install-btn")) {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
          deferredPrompt = null;
        });
      } else {
        openInstallModal();
      }
    }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  // Start Application
  window.addEventListener("DOMContentLoaded", init);
})();
