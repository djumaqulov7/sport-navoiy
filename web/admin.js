/* ==========================================================================
   sport.NAVOIY — Admin Application v2.0
   Design System: Pitch Black Gold
   ========================================================================== */

(() => {
  "use strict";

  const state = {
    authenticated: false,
    currentTab: "dashboard",
    dashboardData: null,
    ordersFilterStatus: "all",
    ordersSearch: "",
    productsSearch: "",
    usersSearch: "",
    availableImages: []
  };

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const money = num => `${new Intl.NumberFormat("uz-UZ").format(Number(num) || 0)} so‘m`;
  const safe = str => String(str ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  function toast(msg, isError = false) {
    const el = $("#admin-toast");
    if (!el) return;
    el.textContent = msg;
    el.style.borderColor = isError ? "#EF4444" : "rgba(197, 155, 39, 0.4)";
    el.style.color = isError ? "#EF4444" : "#FFFFFF";
    el.classList.remove("opacity-0", "pointer-events-none");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      el.classList.add("opacity-0", "pointer-events-none");
    }, 3000);
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

  // ==========================================================================
  // Auth Check & Login
  // ==========================================================================

  async function checkAuth() {
    try {
      const res = await api("/api/admin/me");
      if (res.admin) {
        state.authenticated = true;
        $("#admin-login-screen")?.classList.add("hidden");
        loadDashboard();
      } else {
        showLoginScreen();
      }
    } catch {
      showLoginScreen();
    }
  }

  function showLoginScreen() {
    state.authenticated = false;
    $("#admin-login-screen")?.classList.remove("hidden");
  }

  async function loadDashboard() {
    try {
      const data = await api("/api/admin/dashboard");
      state.dashboardData = data;
      renderKPIs();
      renderCurrentTab();
    } catch (err) {
      toast(err.message, true);
    }
  }

  // ==========================================================================
  // KPI Matrix Rendering
  // ==========================================================================

  function renderKPIs() {
    if (!state.dashboardData) return;
    const stats = state.dashboardData.stats || {};

    const rev = $("#stat-revenue");
    if (rev) rev.textContent = money(stats.revenue || 0);

    const ord = $("#stat-orders");
    if (ord) ord.textContent = `${stats.orders || 0} ta`;

    const pending = $("#stat-pending");
    if (pending) pending.textContent = `${stats.pending_orders || 0} ta kutilmoqda`;

    const badge = $("#pending-orders-badge");
    if (badge) badge.textContent = stats.pending_orders || 0;

    const usr = $("#stat-users");
    if (usr) usr.textContent = stats.users || 0;

    const prod = $("#stat-products");
    if (prod) prod.textContent = `${stats.products || 0} ta`;
  }

  // ==========================================================================
  // Tab Switching
  // ==========================================================================

  function switchTab(tabId) {
    state.currentTab = tabId;

    // Update Nav buttons
    $$(".nav-tab-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === tabId);
    });

    // Toggle Tab Panes
    $$(".admin-tab-pane").forEach(p => p.classList.add("hidden"));
    $(`#pane-${tabId}`)?.classList.remove("hidden");

    // Update Titles
    const titles = {
      dashboard: ["Boshqaruv Paneli", "· Asosiy statistika va do'kon faoliyati"],
      orders: ["Buyurtmalar Nazorati", "· Barcha tushgan buyurtmalar holati"],
      products: ["Mahsulotlar Boshqaruvi", "· Ombordagi tovarlar, narxlar va rasmlar"],
      users: ["Mijozlar Bazasi", "· Ro'yxatdan o'tgan foydalanuvchilar"],
      promos: ["Promokodlar", "· Chegirma kodlarini sozlash"],
      reviews: ["Sharhlar Moderatsiyasi", "· Mijozlar qoldirgan baho va fikrlar"]
    };

    if (titles[tabId]) {
      $("#admin-page-title").textContent = titles[tabId][0];
      $("#admin-page-desc").textContent = titles[tabId][1];
    }

    renderCurrentTab();
  }

  function renderCurrentTab() {
    if (!state.dashboardData) return;

    if (state.currentTab === "dashboard") renderDashboardPane();
    else if (state.currentTab === "orders") renderOrdersPane();
    else if (state.currentTab === "products") renderProductsPane();
    else if (state.currentTab === "users") renderUsersPane();
    else if (state.currentTab === "promos") renderPromosPane();
    else if (state.currentTab === "reviews") renderReviewsPane();
  }

  // ==========================================================================
  // 1. Dashboard Pane
  // ==========================================================================

  function renderDashboardPane() {
    const orders = state.dashboardData.orders || [];
    const container = $("#dashboard-recent-orders");
    if (!container) return;

    const recent = orders.slice(0, 5);
    if (!recent.length) {
      container.innerHTML = `<div class="py-8 text-center text-zinc-400">Hozircha yangi buyurtmalar yo'q.</div>`;
      return;
    }

    container.innerHTML = `
      <table class="w-full text-left text-xs text-zinc-300">
        <thead class="bg-[#111113] text-zinc-400 uppercase text-[10px] font-bold border-b border-[#27272A]">
          <tr>
            <th class="p-3">ID</th>
            <th class="p-3">Mijoz</th>
            <th class="p-3">Manzil</th>
            <th class="p-3">Tovarlar</th>
            <th class="p-3">Jami</th>
            <th class="p-3">Holati</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#27272A]">
          ${recent.map(ord => {
            let items = [];
            try { items = JSON.parse(ord.items_json); } catch {}
            const itemsSummary = items.map(i => `${safe(i.name)} × ${i.quantity}`).join(", ");

            return `
              <tr class="hover:bg-[#1E1E22] transition">
                <td class="p-3 font-display font-bold text-gold">#${ord.id}</td>
                <td class="p-3">
                  <div class="font-bold text-white">${safe(ord.customer_name)}</div>
                  <div class="text-[11px] text-zinc-400">${safe(ord.customer_phone)}</div>
                </td>
                <td class="p-3 text-[11px] text-zinc-300">${safe(ord.region)}</td>
                <td class="p-3 text-[11px] text-zinc-300 max-w-xs truncate" title="${safe(itemsSummary)}">${safe(itemsSummary)}</td>
                <td class="p-3 font-display font-bold text-white">${money(ord.total)}</td>
                <td class="p-3">
                  <select class="bg-[#111113] border border-[#27272A] rounded px-2 py-1 text-xs font-bold text-white outline-none" data-order-status-change="${ord.id}">
                    ${["Yangi", "Tasdiqlandi", "Yetkazilmoqda", "Yetkazildi", "Bekor qilindi"].map(st => `
                      <option value="${st}" ${ord.status === st ? 'selected' : ''}>${st}</option>
                    `).join("")}
                  </select>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  // ==========================================================================
  // 2. Orders Pane
  // ==========================================================================

  function renderOrdersPane() {
    let orders = state.dashboardData.orders || [];
    const container = $("#orders-list-container");
    if (!container) return;

    if (state.ordersFilterStatus !== "all") {
      orders = orders.filter(o => o.status === state.ordersFilterStatus);
    }

    if (state.ordersSearch) {
      const q = state.ordersSearch.toLowerCase();
      orders = orders.filter(o => {
        return (
          String(o.id).includes(q) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
          (o.customer_phone && o.customer_phone.toLowerCase().includes(q)) ||
          (o.region && o.region.toLowerCase().includes(q)) ||
          (o.address && o.address.toLowerCase().includes(q))
        );
      });
    }

    if (!orders.length) {
      container.innerHTML = `<div class="bg-[#18181B] border border-[#27272A] p-8 text-center text-zinc-400 rounded-xl">Buyurtmalar topilmadi.</div>`;
      return;
    }

    container.innerHTML = orders.map(ord => {
      let items = [];
      try { items = JSON.parse(ord.items_json); } catch {}

      return `
        <div class="bg-[#18181B] border border-[#27272A] rounded-xl p-5 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
            <div class="flex items-center gap-3">
              <span class="font-display font-bold text-lg text-gold">Buyurtma #${ord.id}</span>
              <span class="text-xs text-zinc-400">${safe((ord.created_at || '').replace('T', ' ').slice(0, 16))}</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-xs text-zinc-400 font-bold">Holati:</label>
              <select class="bg-[#111113] border border-gold/40 rounded-lg px-2.5 py-1 text-xs font-bold text-white outline-none cursor-pointer" data-order-status-change="${ord.id}">
                ${["Yangi", "Tasdiqlandi", "Yetkazilmoqda", "Yetkazildi", "Bekor qilindi"].map(st => `
                  <option value="${st}" ${ord.status === st ? 'selected' : ''}>${st}</option>
                `).join("")}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <!-- Customer info -->
            <div class="bg-[#111113] p-3 rounded-lg border border-[#27272A]">
              <div class="text-[10px] font-bold uppercase text-zinc-500 mb-1">Buyurtmachi</div>
              <div class="font-bold text-white text-sm">${safe(ord.customer_name)}</div>
              <div class="text-gold mt-1 font-semibold">
                <a href="tel:${safe(ord.customer_phone)}">${safe(ord.customer_phone)}</a>
              </div>
            </div>

            <!-- Shipping info -->
            <div class="bg-[#111113] p-3 rounded-lg border border-[#27272A]">
              <div class="text-[10px] font-bold uppercase text-zinc-500 mb-1">Yetkazib Berish</div>
              <div class="font-bold text-white">${safe(ord.delivery_method)}</div>
              <div class="text-zinc-300 mt-1">${safe(ord.region)}, ${safe(ord.address)}</div>
            </div>

            <!-- Payment info -->
            <div class="bg-[#111113] p-3 rounded-lg border border-[#27272A]">
              <div class="text-[10px] font-bold uppercase text-zinc-500 mb-1">To'lov va Summa</div>
              <div class="text-zinc-300">To'lov turi: <strong class="text-white">${safe(ord.payment_method)}</strong></div>
              ${ord.discount > 0 ? `<div class="text-emerald-400">Chegirma (${safe(ord.promo_code)}): -${money(ord.discount)}</div>` : ''}
              <div class="font-display font-bold text-base text-gold mt-1">Jami: ${money(ord.total)}</div>
            </div>
          </div>

          <!-- Items list -->
          <div class="pt-2">
            <div class="text-[11px] font-bold uppercase text-zinc-400 mb-2">Buyurtma tovarlari:</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              ${items.map(it => `
                <div class="flex items-center gap-2.5 p-2 bg-[#111113] rounded-lg border border-[#27272A]">
                  <img class="w-10 h-10 rounded object-cover bg-black flex-shrink-0" src="${safe(it.image || 'favicon.svg')}" onerror="this.src='favicon.svg'"/>
                  <div class="min-w-0 flex-1">
                    <div class="font-bold text-white text-xs truncate">${safe(it.name)}</div>
                    <div class="text-[10px] text-zinc-400">${safe(it.size || 'Standart')} · ${safe(it.color || '')} · ${it.quantity} dona</div>
                    <div class="font-display font-bold text-gold text-xs">${money(it.price)}</div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          ${ord.comment ? `
            <div class="text-xs text-zinc-400 bg-[#111113] p-2.5 rounded-lg border border-[#27272A]">
              <strong>Mijoz izohi:</strong> ${safe(ord.comment)}
            </div>
          ` : ''}
        </div>
      `;
    }).join("");
  }

  // ==========================================================================
  // 3. Products Pane
  // ==========================================================================

  function renderProductsPane() {
    let products = state.dashboardData.products || [];
    const tbody = $("#products-table-body");
    if (!tbody) return;

    if (state.productsSearch) {
      const q = state.productsSearch.toLowerCase();
      products = products.filter(p => `${p.title} ${p.sku} ${p.brand} ${p.category}`.toLowerCase().includes(q));
    }

    tbody.innerHTML = products.map(prod => `
      <tr class="hover:bg-[#1E1E22] transition">
        <td class="p-3">
          <img class="w-10 h-10 rounded-lg object-cover bg-black border border-[#27272A]" src="${safe(prod.image)}" onerror="this.src='favicon.svg'"/>
        </td>
        <td class="p-3 font-mono font-bold text-zinc-400">${safe(prod.sku)}</td>
        <td class="p-3">
          <div class="font-bold text-white">${safe(prod.title)}</div>
          <div class="text-[10px] text-zinc-500">${safe(prod.title_ru || '')}</div>
        </td>
        <td class="p-3 text-zinc-300">${safe(prod.category)}</td>
        <td class="p-3 font-semibold text-gold">${safe(prod.brand)}</td>
        <td class="p-3 font-display font-bold text-white">
          ${money(Math.max(0, prod.price - 1))}
          <span class="block text-[10px] text-zinc-500">Kiritilgan: ${money(prod.price)}</span>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${prod.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}">
            ${prod.stock} dona
          </span>
        </td>
        <td class="p-3 text-right space-x-2">
          <button class="text-gold hover:underline font-bold" data-edit-prod="${prod.id}">Tahrirlash</button>
          <button class="text-red-400 hover:underline" data-delete-prod="${prod.id}">O'chirish</button>
        </td>
      </tr>
    `).join("");
  }

  // ==========================================================================
  // 4. Users Pane
  // ==========================================================================

  function renderUsersPane() {
    let users = state.dashboardData.users || [];
    const tbody = $("#users-table-body");
    const countLabel = $("#users-count-label");
    if (!tbody) return;

    if (countLabel) countLabel.textContent = `${users.length} mijoz ro'yxatda`;

    if (state.usersSearch) {
      const q = state.usersSearch.toLowerCase();
      users = users.filter(u => `${u.name} ${u.phone}`.toLowerCase().includes(q));
    }

    tbody.innerHTML = users.map(user => `
      <tr class="hover:bg-[#1E1E22] transition">
        <td class="p-3 font-mono text-zinc-500">#${user.id}</td>
        <td class="p-3 font-bold text-white">${safe(user.name)}</td>
        <td class="p-3 text-gold font-mono">${safe(user.phone)}</td>
        <td class="p-3 text-zinc-400">${safe((user.created_at || '').slice(0, 10))}</td>
        <td class="p-3 font-display font-bold text-white">${user.order_count || 0} ta</td>
        <td class="p-3 text-right">
          <button class="px-2.5 py-1 rounded text-xs font-bold ${user.blocked ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}" data-user-block="${user.id}" data-blocked="${user.blocked ? '0' : '1'}">
            ${user.blocked ? 'Blokdan chiqarish' : 'Bloklash'}
          </button>
        </td>
      </tr>
    `).join("");
  }

  // ==========================================================================
  // 5. Promos Pane
  // ==========================================================================

  function renderPromosPane() {
    const promos = state.dashboardData.promos || [];
    const tbody = $("#promos-table-body");
    if (!tbody) return;

    tbody.innerHTML = promos.map(pr => `
      <tr class="hover:bg-[#1E1E22] transition">
        <td class="p-3 font-display font-bold text-gold text-sm">${safe(pr.code)}</td>
        <td class="p-3">
          <button class="px-2 py-0.5 rounded text-[10px] font-bold ${pr.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}" data-toggle-promo="${pr.id}" data-enabled="${pr.enabled ? '0' : '1'}">
            ${pr.enabled ? 'FAOL' : 'O\'CHIQ'}
          </button>
        </td>
        <td class="p-3 text-zinc-400">${safe(pr.expires_at || 'Cheklanmagan')}</td>
        <td class="p-3 text-white font-mono">${pr.uses} / ${pr.usage_limit || '∞'}</td>
        <td class="p-3 text-right">
          <button class="text-red-400 hover:underline" data-delete-promo="${pr.id}">O'chirish</button>
        </td>
      </tr>
    `).join("");
  }

  // ==========================================================================
  // 6. Reviews Moderation Pane
  // ==========================================================================

  function renderReviewsPane() {
    const reviews = state.dashboardData.reviews || [];
    const container = $("#reviews-list-container");
    if (!container) return;

    if (!reviews.length) {
      container.innerHTML = `<div class="bg-[#18181B] border border-[#27272A] p-8 text-center text-zinc-400 rounded-xl">Hozircha hech qanday sharh yo'q.</div>`;
      return;
    }

    container.innerHTML = reviews.map(rev => `
      <div class="bg-[#18181B] border border-[#27272A] p-4 rounded-xl flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-bold text-white text-sm">${safe(rev.user_name)}</span>
            <span class="text-gold font-bold text-sm">${"★".repeat(rev.rating)}</span>
            <span class="text-[11px] text-zinc-500">· ${safe(rev.product_title)}</span>
          </div>
          <p class="text-xs text-zinc-300 leading-relaxed">${safe(rev.comment)}</p>
          <div class="text-[10px] text-zinc-500 mt-1">${safe((rev.created_at || '').slice(0, 10))}</div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button class="px-2.5 py-1 rounded text-xs font-bold ${rev.hidden ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-700 text-zinc-300'}" data-toggle-review-hide="${rev.id}" data-hidden="${rev.hidden ? '0' : '1'}">
            ${rev.hidden ? 'Ko\'rsatish' : 'Yashirish'}
          </button>
          <button class="px-2.5 py-1 rounded text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20" data-delete-review="${rev.id}">
            O'chirish
          </button>
        </div>
      </div>
    `).join("");
  }

  // ==========================================================================
  // Modals (Add/Edit Product, Promos, Image Picker)
  // ==========================================================================

  function openAdminModal(html) {
    const layer = $("#admin-modal-layer");
    const content = $("#admin-modal-content");
    if (!layer || !content) return;
    content.innerHTML = html;
    layer.classList.remove("hidden");
  }

  function closeAdminModal() {
    $("#admin-modal-layer")?.classList.add("hidden");
  }

  async function openProductFormModal(productId = null) {
    let p = {
      title: "",
      title_ru: "",
      title_en: "",
      category: "Futbol formalari",
      brand: "KELME",
      sku: `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      price: 250000,
      old_price: 0,
      stock: 10,
      image: "",
      images_json: "[]",
      description: ""
    };

    if (productId) {
      const found = state.dashboardData.products.find(x => x.id === Number(productId));
      if (found) p = { ...found };
    }

    const categories = state.dashboardData?.categories || [
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

    openAdminModal(`
      <h3 class="font-display font-bold text-lg text-white mb-1">
        ${productId ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot Qo'shish"}
      </h3>
      <p class="text-xs text-zinc-400 mb-4">
        Narxni yaxlit so'mda kiriting (masalan, 250 000). Sayt avtomatik 1 so'm kamaytirib (249 999 so'm) ko'rsatadi.
      </p>

      <form class="space-y-4" id="admin-product-form" data-product-id="${productId || ''}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-zinc-400 mb-1">Nomi (UZ)</label>
            <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="title" value="${safe(p.title)}" required/>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-400 mb-1">Kategoriya</label>
            <select class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="category">
              ${categories.map(c => `
                <option value="${safe(c)}" ${p.category === c ? 'selected' : ''}>${safe(c)}</option>
              `).join("")}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-zinc-400 mb-1">Nomi (RU)</label>
            <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="title_ru" value="${safe(p.title_ru)}"/>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-400 mb-1">Nomi (EN)</label>
            <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="title_en" value="${safe(p.title_en)}"/>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-bold text-zinc-400 mb-1">Brend</label>
            <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="brand" value="${safe(p.brand)}"/>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-400 mb-1">Artikul (SKU)</label>
            <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="sku" value="${safe(p.sku)}"/>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-400 mb-1">Yaxlit narx (so'm)</label>
            <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="price" type="number" min="0" step="1000" value="${p.price}" required/>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-400 mb-1">Eski narx</label>
            <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="old_price" type="number" min="0" step="1000" value="${p.old_price}"/>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <div>
            <label class="block text-xs font-bold text-zinc-400 mb-1">Ombordagi soni</label>
            <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="stock" type="number" min="0" value="${p.stock}" required/>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-400 mb-1">Asosiy Rasm yo'li</label>
            <div class="flex gap-2">
              <input class="flex-1 bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" id="form-product-image-input" name="image" value="${safe(p.image)}" placeholder="/rasm.jpg" required/>
              <button class="bg-[#111113] border border-gold/40 text-gold hover:bg-gold hover:text-black font-bold px-3 rounded-lg text-xs transition" id="open-image-picker-btn" type="button">
                Tanlash
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-zinc-400 mb-1">Tavsif</label>
          <textarea class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="description" rows="3">${safe(p.description)}</textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button class="px-4 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-xs font-bold text-zinc-300 hover:text-white" onclick="document.getElementById('admin-modal-close-btn').click();" type="button">
            Bekor qilish
          </button>
          <button class="px-5 py-2 rounded-lg bg-gold hover:bg-gold-accent font-display font-bold text-xs text-black" type="submit">
            Saqlash
          </button>
        </div>
      </form>
    `);
  }

  async function openImagePicker() {
    let images = state.availableImages;
    if (!images.length) {
      try {
        const res = await api("/api/admin/available-images");
        state.availableImages = res.images || [];
        images = state.availableImages;
      } catch (err) {
        toast(err.message, true);
        return;
      }
    }

    const modalSheet = $("#admin-modal-sheet");
    if (!modalSheet) return;

    // Create sub-overlay inside modal
    let picker = $("#image-picker-suboverlay");
    if (!picker) {
      picker = document.createElement("div");
      picker.id = "image-picker-suboverlay";
      picker.className = "absolute inset-0 bg-[#18181B] z-20 p-6 flex flex-col";
      modalSheet.appendChild(picker);
    }

    picker.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
        <h4 class="font-display font-bold text-white text-sm">Serverdagi Rasmlar Katalogi (${images.length} ta)</h4>
        <button class="text-xs text-gold font-bold hover:underline" id="close-picker-btn">Yopish</button>
      </div>
      <div class="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pr-1">
        ${images.map(img => `
          <button class="flex flex-col items-center p-2 rounded-lg bg-[#111113] border border-[#27272A] hover:border-gold text-left transition select-photo-btn" data-img-url="${safe(img.url)}">
            <img class="w-full aspect-square object-cover rounded bg-black mb-1.5" src="${safe(img.url)}" onerror="this.src='favicon.svg'"/>
            <span class="text-[9px] text-zinc-400 w-full truncate">${safe(img.name)}</span>
          </button>
        `).join("")}
      </div>
    `;

    $("#close-picker-btn").onclick = () => picker.remove();
    picker.querySelectorAll(".select-photo-btn").forEach(btn => {
      btn.onclick = () => {
        const input = $("#form-product-image-input");
        if (input) input.value = btn.dataset.imgUrl;
        picker.remove();
      };
    });
  }

  function openPromoFormModal() {
    openAdminModal(`
      <h3 class="font-display font-bold text-lg text-white mb-1">Yangi Promokod Yaratish</h3>
      <p class="text-xs text-zinc-400 mb-4">Chegirma tizimi: 400 000 dan oshganda 50 000, 800 000 dan oshganda 100 000 so'm.</p>

      <form class="space-y-4" id="admin-promo-form">
        <div>
          <label class="block text-xs font-bold text-zinc-400 mb-1">Promokod (3–30 belgi)</label>
          <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white uppercase font-bold outline-none focus:border-gold" name="code" placeholder="Masalan: CHEMPION" required minlength="3" maxlength="30"/>
        </div>
        <div>
          <label class="block text-xs font-bold text-zinc-400 mb-1">Amal qilish muddati (ixtiyoriy)</label>
          <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="expires_at" type="date"/>
        </div>
        <div>
          <label class="block text-xs font-bold text-zinc-400 mb-1">Foydalanish limiti (0 = cheklanmagan)</label>
          <input class="w-full bg-[#111113] border border-[#27272A] rounded-lg p-2.5 text-xs text-white outline-none focus:border-gold" name="usage_limit" type="number" min="0" value="0"/>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button class="px-4 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-xs font-bold text-zinc-300" onclick="document.getElementById('admin-modal-close-btn').click();" type="button">
            Bekor qilish
          </button>
          <button class="px-5 py-2 rounded-lg bg-gold hover:bg-gold-accent font-display font-bold text-xs text-black" type="submit">
            Yaratish
          </button>
        </div>
      </form>
    `);
  }

  // ==========================================================================
  // Global Event Listeners
  // ==========================================================================

  document.addEventListener("click", async event => {
    const target = event.target;

    // Close Modal
    if (target.closest("#admin-modal-close-btn")) {
      closeAdminModal();
      return;
    }

    // Nav Tab Switching
    const tabBtn = target.closest(".nav-tab-btn");
    if (tabBtn) {
      switchTab(tabBtn.dataset.tab);
      return;
    }

    // Refresh Dashboard
    if (target.closest("#btn-refresh-dashboard")) {
      await loadDashboard();
      toast("Ma'lumotlar yangilandi.");
      return;
    }

    // Quick New Product
    if (target.closest("#btn-quick-new-product") || target.closest("#btn-add-product")) {
      openProductFormModal();
      return;
    }

    // Open Image Picker
    if (target.closest("#open-image-picker-btn")) {
      openImagePicker();
      return;
    }

    // New Promo Modal
    if (target.closest("#btn-add-promo")) {
      openPromoFormModal();
      return;
    }

    // Edit Product
    const editProdBtn = target.closest("[data-edit-prod]");
    if (editProdBtn) {
      openProductFormModal(editProdBtn.dataset.editProd);
      return;
    }

    // Delete Product
    const delProdBtn = target.closest("[data-delete-prod]");
    if (delProdBtn) {
      const id = delProdBtn.dataset.deleteProd;
      if (confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) {
        try {
          await api(`/api/admin/products/${id}`, { method: "DELETE" });
          toast("Mahsulot o'chirildi.");
          await loadDashboard();
        } catch (err) {
          toast(err.message, true);
        }
      }
      return;
    }

    // Order Status Filter
    const orderStatusFilterBtn = target.closest("#order-status-filters button");
    if (orderStatusFilterBtn) {
      state.ordersFilterStatus = orderStatusFilterBtn.dataset.status;
      $$("#order-status-filters button").forEach(b => {
        b.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-[#111113] text-zinc-300 hover:bg-[#202024]";
      });
      orderStatusFilterBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-gold text-black active-order-filter";
      renderOrdersPane();
      return;
    }

    // Toggle Promo Enabled
    const togglePromoBtn = target.closest("[data-toggle-promo]");
    if (togglePromoBtn) {
      const id = togglePromoBtn.dataset.togglePromo;
      const enabled = togglePromoBtn.dataset.enabled === "1";
      const promo = state.dashboardData.promos.find(p => p.id === Number(id));
      if (promo) {
        try {
          await api(`/api/admin/promos/${id}`, {
            method: "PUT",
            body: JSON.stringify({ enabled, expires_at: promo.expires_at, usage_limit: promo.usage_limit })
          });
          toast("Promokod holati yangilandi.");
          await loadDashboard();
        } catch (err) {
          toast(err.message, true);
        }
      }
      return;
    }

    // Delete Promo
    const delPromoBtn = target.closest("[data-delete-promo]");
    if (delPromoBtn) {
      const id = delPromoBtn.dataset.deletePromo;
      if (confirm("Promokodni o'chirishni tasdiqlaysizmi?")) {
        try {
          await api(`/api/admin/promos/${id}`, { method: "DELETE" });
          toast("Promokod o'chirildi.");
          await loadDashboard();
        } catch (err) {
          toast(err.message, true);
        }
      }
      return;
    }

    // User Block / Unblock
    const blockBtn = target.closest("[data-user-block]");
    if (blockBtn) {
      const id = blockBtn.dataset.userBlock;
      const blocked = blockBtn.dataset.blocked === "1";
      try {
        await api(`/api/admin/users/${id}`, {
          method: "PUT",
          body: JSON.stringify({ blocked })
        });
        toast(blocked ? "Mijoz bloklandi." : "Mijoz blokdan chiqarildi.");
        await loadDashboard();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    // Toggle Review Hide / Show
    const hideRevBtn = target.closest("[data-toggle-review-hide]");
    if (hideRevBtn) {
      const id = hideRevBtn.dataset.toggleReviewHide;
      const hidden = hideRevBtn.dataset.hidden === "1";
      try {
        await api(`/api/admin/reviews/${id}`, {
          method: "PUT",
          body: JSON.stringify({ hidden })
        });
        toast("Sharh holati o'zgartirildi.");
        await loadDashboard();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    // Delete Review
    const delRevBtn = target.closest("[data-delete-review]");
    if (delRevBtn) {
      const id = delRevBtn.dataset.deleteReview;
      if (confirm("Ushbu sharhni butunlay o'chirishni tasdiqlaysizmi?")) {
        try {
          await api(`/api/admin/reviews/${id}`, { method: "DELETE" });
          toast("Sharh o'chirildi.");
          await loadDashboard();
        } catch (err) {
          toast(err.message, true);
        }
      }
      return;
    }

    // Logout
    if (target.closest("#admin-logout-btn")) {
      await api("/api/admin/logout", { method: "POST" }).catch(() => {});
      showLoginScreen();
      toast("Admin sessiyasi yakunlandi.");
      return;
    }

    // Mobile Menu Toggle
    if (target.closest("#mobile-menu-toggle")) {
      const nav = $("#admin-sidebar-nav");
      if (nav) nav.classList.toggle("hidden");
      return;
    }
  });

  // Global Change Handlers
  document.addEventListener("change", async event => {
    const target = event.target;

    // Order status dropdown change
    if (target.dataset.orderStatusChange) {
      const orderId = target.dataset.orderStatusChange;
      const status = target.value;
      try {
        await api(`/api/admin/orders/${orderId}`, {
          method: "PUT",
          body: JSON.stringify({ status })
        });
        toast(`Buyurtma #${orderId} holati: ${status}`);
        await loadDashboard();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }
  });

  // Global Input Handlers
  document.addEventListener("input", event => {
    const target = event.target;

    if (target.id === "orders-search-input") {
      state.ordersSearch = target.value.trim();
      renderOrdersPane();
      return;
    }

    if (target.id === "products-search-input") {
      state.productsSearch = target.value.trim();
      renderProductsPane();
      return;
    }

    if (target.id === "users-search-input") {
      state.usersSearch = target.value.trim();
      renderUsersPane();
      return;
    }
  });

  // Global Form Submit Handlers
  document.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.target;

    // Admin Login Form
    if (form.id === "admin-login-form") {
      const values = Object.fromEntries(new FormData(form).entries());
      try {
        await api("/api/admin/login", {
          method: "POST",
          body: JSON.stringify(values)
        });
        toast("Xush kelibsiz, Admin!");
        $("#admin-login-screen")?.classList.add("hidden");
        state.authenticated = true;
        loadDashboard();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    // Add / Edit Product Form
    if (form.id === "admin-product-form") {
      const formData = new FormData(form);
      const values = Object.fromEntries(formData.entries());
      values.price = Number(values.price);
      values.old_price = Number(values.old_price || 0);
      values.stock = Number(values.stock || 0);

      const prodId = form.dataset.productId;
      try {
        if (prodId) {
          await api(`/api/admin/products/${prodId}`, {
            method: "PUT",
            body: JSON.stringify(values)
          });
          toast("Mahsulot ma'lumotlari yangilandi!");
        } else {
          await api("/api/admin/products", {
            method: "POST",
            body: JSON.stringify(values)
          });
          toast("Yangi mahsulot saqlandi!");
        }
        closeAdminModal();
        await loadDashboard();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    // Add Promo Form
    if (form.id === "admin-promo-form") {
      const values = Object.fromEntries(new FormData(form).entries());
      values.usage_limit = Number(values.usage_limit || 0);
      try {
        await api("/api/admin/promos", {
          method: "POST",
          body: JSON.stringify(values)
        });
        toast("Yangi promokod yaratildi!");
        closeAdminModal();
        await loadDashboard();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }
  });

  // Start Admin App
  window.addEventListener("DOMContentLoaded", checkAuth);
})();
