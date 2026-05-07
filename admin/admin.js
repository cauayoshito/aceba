/* ================================================================
   ACEBA Admin v3 — Painel Institucional
   Módulos: Parcerias · Notícias · Galeria · Configurações
   Upload real p/ Supabase Storage · CRUD completo
   ================================================================ */

(function () {
  "use strict";

  /* ──────────────────────────────────────────────────────────────
     CONSTANTES + CONFIGURAÇÃO
  ─────────────────────────────────────────────────────────────── */
  var ADMIN_LOGIN     = "./login.html";
  var ADMIN_DASHBOARD = "./dashboard.html";

  function getClient() {
    return window.acebaSupabaseClient || null;
  }

  function isSupabaseReady() {
    return Boolean(window.isSupabaseConfigured) && Boolean(getClient());
  }

  /* Ícones SVG para o dashboard */
  var ICO = {
    partners: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    news:     '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    gallery:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  };

  /* ──────────────────────────────────────────────────────────────
     MÓDULOS
  ─────────────────────────────────────────────────────────────── */
  var MODULES = {

    partners: {
      title:    "Parcerias",
      subtitle: "Empresas, instituições e apoiadores que caminham com a ACEBA.",
      table:    "partners",
      newLabel: "+ Adicionar parceria",
      orderBy:  { column: "sort_order", ascending: true },
      layout:   "partners",
      hasActive: true,
      titleField: "name",
      summary: function (r) { return r.description || r.website_url || ""; },
      fields: [
        { name: "name",        label: "Nome do parceiro",    type: "text",     required: true, placeholder: "Ex.: Prefeitura de Camaçari" },
        { name: "description", label: "Descrição",           type: "textarea", rows: 2,        placeholder: "Breve descrição da parceria..." },
        { name: "logo_url",    label: "Logo",                type: "upload",   bucket: "logos",  accept: "image/*", placeholder: "https://..." },
        { name: "website_url", label: "Site (URL)",          type: "url",      placeholder: "https://..." },
        { name: "sort_order",  label: "Ordem de exibição",   type: "number",   default: 0 },
        { name: "is_active",   label: "Ativo no site",       type: "checkbox", default: true },
      ],
    },

    news: {
      title:    "Notícias",
      subtitle: "Publicações e atualizações do Instituto.",
      table:    "news",
      newLabel: "+ Nova notícia",
      orderBy:  { column: "published_at", ascending: false },
      layout:   "news",
      hasActive: true,
      titleField: "title",
      summary: function (r) { return r.excerpt || ""; },
      fields: [
        { name: "title",        label: "Título",             type: "text",     required: true },
        { name: "category",     label: "Categoria",          type: "text",     placeholder: "Ex.: EDUCAÇÃO, ESPORTE, PARCERIA" },
        { name: "cover_url",    label: "Imagem de capa",     type: "upload",   bucket: "gallery", accept: "image/*", placeholder: "https://..." },
        { name: "excerpt",      label: "Resumo",             type: "textarea", rows: 3,  placeholder: "Breve descrição para listagem..." },
        { name: "content",      label: "Conteúdo completo",  type: "textarea", rows: 9 },
        { name: "published_at", label: "Data de publicação", type: "date",     defaultToday: true },
        { name: "is_active",    label: "Publicar no site",   type: "checkbox", default: true },
      ],
    },

    gallery_images: {
      title:    "Galeria",
      subtitle: "Fotos e registros de atividades.",
      table:    "gallery_images",
      newLabel: "+ Adicionar imagem",
      orderBy:  { column: "created_at", ascending: false },
      layout:   "gallery",
      hasActive: true,
      titleField: "title",
      summary: function (r) { return r.category ? "Categoria: " + r.category : ""; },
      fields: [
        { name: "image_url", label: "Imagem",     type: "upload",   bucket: "gallery", required: true, accept: "image/*", placeholder: "https://..." },
        { name: "title",     label: "Título",     type: "text",     placeholder: "Breve descrição..." },
        { name: "category",  label: "Categoria",  type: "text",     placeholder: "Ex.: educação, eventos, capoeira" },
        { name: "is_active", label: "Ativa no site", type: "checkbox", default: true },
      ],
    },

    site_settings: {
      title:      "Configurações",
      subtitle:   "Dados de contato e informações institucionais exibidos no site.",
      table:      "site_settings",
      isSettings: true,
      settings: [
        { key: "whatsapp",  label: "WhatsApp (números com DDI)", type: "text",     placeholder: "5571999999999" },
        { key: "phone",     label: "Telefone",                   type: "text",     placeholder: "(71) 99999-9999" },
        { key: "email",     label: "E-mail institucional",       type: "email",    placeholder: "contato@aceba.org.br" },
        { key: "address",   label: "Endereço completo",          type: "textarea", rows: 3 },
        { key: "pix_key",   label: "Chave Pix / CNPJ",          type: "text",     placeholder: "05.133.450/0001-76" },
        { key: "instagram", label: "Instagram (URL)",            type: "url",      placeholder: "https://instagram.com/aceba" },
        { key: "facebook",  label: "Facebook (URL)",             type: "url",      placeholder: "https://facebook.com/aceba" },
      ],
    },
  };

  var SECTION_ORDER = ["dashboard", "partners", "news", "gallery_images", "site_settings"];

  /* ──────────────────────────────────────────────────────────────
     ESTADO
  ─────────────────────────────────────────────────────────────── */
  var state = {
    activeSection: "dashboard",
    rows:  [],
    counts: { partners: 0, news: 0, gallery_images: 0 },
    modal: { isOpen: false, type: null, editingId: null },
  };

  /* ──────────────────────────────────────────────────────────────
     HELPERS
  ─────────────────────────────────────────────────────────────── */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  function isLoginPage()     { return /login\.html$/i.test(window.location.pathname); }
  function isDashboardPage() { return /dashboard\.html$/i.test(window.location.pathname); }
  function redirect(path)    { window.location.href = path; }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDate(val) {
    if (!val) return "";
    try {
      var d = new Date(val + "T12:00:00");
      return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric", month: "short", year: "numeric"
      }).format(d);
    } catch (e) { return val; }
  }

  /* ──────────────────────────────────────────────────────────────
     LOGIN STATUS
  ─────────────────────────────────────────────────────────────── */
  function setLoginStatus(msg, type) {
    var el = $("#loginStatus");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "admin-status" + (type ? " is-" + type : "");
  }

  /* ──────────────────────────────────────────────────────────────
     TOAST
  ─────────────────────────────────────────────────────────────── */
  var toastTimer = null;
  function toast(msg, type) {
    var el = $("#adminToast");
    if (!el) return;
    el.textContent = msg;
    el.className = "admin-toast is-visible" + (type ? " is-" + type : "");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, 3400);
  }

  /* ──────────────────────────────────────────────────────────────
     SESSÃO
  ─────────────────────────────────────────────────────────────── */
  async function getSession() {
    var client = getClient();
    if (!client || !isSupabaseReady()) return null;
    var r = await client.auth.getSession();
    return r && r.data ? r.data.session : null;
  }

  async function requireAuth() {
    var client = getClient();

    if (!client) {
      console.error("Supabase não configurado");
      window.location.href = ADMIN_LOGIN;
      return null;
    }

    var result = await client.auth.getSession();
    var data = result.data;
    var error = result.error;

    console.log("SESSION CHECK:", data && data.session ? data.session : null, error);

    if (error) {
      console.error(error);
      return null;
    }

    if (!data || !data.session) {
      window.location.href = ADMIN_LOGIN;
      return null;
    }

    var session = data.session;
    var adminCheck = await client.from("admin_users").select("id,email").eq("id", session.user.id).maybeSingle();

    console.log("ADMIN CHECK:", {
      userId: session.user.id,
      email: session.user.email,
      admin: adminCheck.data,
      error: adminCheck.error
    });

    if (adminCheck.error || !adminCheck.data) {
      var content = document.querySelector("#adminContent");
      if (content) {
        content.innerHTML =
          '<div class="admin-empty">' +
            '<div class="admin-empty-icon">!</div>' +
            '<h3>Usuário sem permissão administrativa</h3>' +
            '<p>Usuário autenticado, mas ainda não autorizado como administrador. Cadastre este usuário na tabela admin_users.</p>' +
            '<p><strong>E-mail:</strong> ' + esc(session.user.email || "") + '</p>' +
            '<p><strong>ID:</strong> ' + esc(session.user.id || "") + '</p>' +
          '</div>';
      }

      return null;
    }

    return session;
  }

  async function handleLogout() {
    var client = getClient();
    try { if (client) await client.auth.signOut(); } catch (_) {}
    redirect(ADMIN_LOGIN);
  }

  /* ──────────────────────────────────────────────────────────────
     LOGIN INIT
  ─────────────────────────────────────────────────────────────── */
  async function initLogin() {
    var form = $("#loginForm");
    if (!form) return;

    if (!isSupabaseReady()) {
      setLoginStatus("Configure SUPABASE_URL e SUPABASE_ANON_KEY em js/supabase-client.js.", "error");
      return;
    }

    var session = await getSession();
    if (session) { redirect(ADMIN_DASHBOARD); return; }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      setLoginStatus("Entrando…");
      var email    = form.elements.email.value.trim();
      var password = form.elements.password.value;

      var client = getClient();
      var r = await client.auth.signInWithPassword({ email: email, password: password });
      if (r.error) {
        setLoginStatus("E-mail ou senha incorretos. Verifique seus dados.", "error");
        return;
      }
      await new Promise(function (resolve) { setTimeout(resolve, 300); });
      window.location.href = ADMIN_DASHBOARD;
    });
  }

  /* ──────────────────────────────────────────────────────────────
     CONTADORES
  ─────────────────────────────────────────────────────────────── */
  async function refreshCounts() {
    if (!isSupabaseReady()) return;
    var tables = ["partners", "news", "gallery_images"];
    await Promise.all(tables.map(async function (t) {
      var r = await getClient().from(t).select("id", { count: "exact", head: true });
      if (!r.error) state.counts[t] = r.count || 0;
    }));
    renderCounts();
  }

  function renderCounts() {
    Object.keys(state.counts).forEach(function (key) {
      var el = document.querySelector('[data-count="' + key + '"]');
      if (el) el.textContent = String(state.counts[key]);
    });
  }

  /* ──────────────────────────────────────────────────────────────
     DASHBOARD
  ─────────────────────────────────────────────────────────────── */
  function loadDashboard() {
    var content = $("#adminContent");
    if (!content) return;

    $("#sectionTitle").textContent    = "Início";
    $("#sectionSubtitle").textContent = "Visão geral do painel administrativo da ACEBA.";
    $("#primaryActionButton").classList.add("is-hidden");

    var c = state.counts;

    content.innerHTML =
      '<div class="dash-grid">' +

        /* Welcome */
        '<div class="dash-welcome">' +
          '<h2>Bem-vindo ao painel</h2>' +
          '<p>Aqui você gerencia parcerias, notícias e galeria do site da ACEBA.</p>' +
        '</div>' +

        /* Stat cards */
        '<div class="dash-stats">' +
          statCard("Parcerias",          c.partners,       ICO.partners, "partners",       "green") +
          statCard("Notícias publicadas", c.news,           ICO.news,     "news",           "blue") +
          statCard("Imagens na galeria",  c.gallery_images, ICO.gallery,  "gallery_images", "orange") +
        '</div>' +

        /* Quick actions */
        '<section class="dash-actions">' +
          '<h3 class="dash-actions-title">Ações rápidas</h3>' +
          '<div class="dash-actions-grid">' +
            quickAction("Nova parceria",    "Adicionar parceiro ao site", "partners",       "green") +
            quickAction("Nova notícia",     "Publicar atualização",       "news",           "blue") +
            quickAction("Adicionar imagem", "Nova foto na galeria",       "gallery_images", "orange") +
          '</div>' +
        '</section>' +

      '</div>';

    /* bind stat cards */
    $$(".stat-card[data-target]", content).forEach(function (el) {
      el.addEventListener("click", function () { switchSection(el.getAttribute("data-target")); });
    });

    /* bind quick actions */
    $$(".dash-action-btn", content).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-target");
        switchSection(target).then(function () {
          if (target !== "site_settings") openModal(target, null);
        });
      });
    });
  }

  function statCard(label, value, icon, target, color) {
    return (
      '<div class="stat-card stat-card--' + color + '" data-target="' + esc(target) + '">' +
        '<div class="stat-icon stat-icon--' + color + '">' + icon + '</div>' +
        '<div>' +
          '<p class="stat-value">' + esc(String(value)) + '</p>' +
          '<p class="stat-label">' + esc(label) + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function quickAction(title, sub, target, color) {
    return (
      '<button type="button" class="dash-action-btn" data-target="' + esc(target) + '">' +
        '<span class="action-plus action-plus--' + color + '">+</span>' +
        '<span class="action-title">' + esc(title) + '</span>' +
        '<span class="action-sub">' + esc(sub) + '</span>' +
      '</button>'
    );
  }

  /* ──────────────────────────────────────────────────────────────
     CARREGAMENTO DE MÓDULOS
  ─────────────────────────────────────────────────────────────── */
  async function loadModule(moduleKey) {
    var config  = MODULES[moduleKey];
    if (!config) return;

    var content = $("#adminContent");
    var newBtn  = $("#primaryActionButton");

    $("#sectionTitle").textContent    = config.title;
    $("#sectionSubtitle").textContent = config.subtitle || "";

    if (config.isSettings) {
      newBtn.classList.add("is-hidden");
      content.innerHTML = '<div class="admin-loading">Carregando configurações…</div>';
      await loadSettings();
      return;
    }

    newBtn.classList.remove("is-hidden");
    newBtn.textContent = config.newLabel || "+ Novo";
    newBtn.onclick = function () { openModal(moduleKey, null); };

    content.innerHTML = '<div class="admin-loading">Carregando ' + esc(config.title.toLowerCase()) + '…</div>';

    var query = getClient().from(config.table).select("*");
    if (config.orderBy) {
      query = query.order(config.orderBy.column, { ascending: config.orderBy.ascending });
    }

    var resp = await query;
    if (resp.error) {
      content.innerHTML =
        '<div class="admin-empty">' +
          '<div class="admin-empty-icon">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
          '</div>' +
          '<h3>Erro ao carregar</h3>' +
          '<p>' + esc(resp.error.message || "Não foi possível ler os dados. Verifique as permissões do Supabase.") + '</p>' +
        '</div>';
      return;
    }

    state.rows = resp.data || [];

    if (Object.prototype.hasOwnProperty.call(state.counts, moduleKey)) {
      state.counts[moduleKey] = state.rows.length;
      renderCounts();
    }

    renderRecordsList(moduleKey);
  }

  /* ──────────────────────────────────────────────────────────────
     RENDERIZAÇÃO DE LISTAS
  ─────────────────────────────────────────────────────────────── */
  function renderRecordsList(moduleKey) {
    var config  = MODULES[moduleKey];
    var content = $("#adminContent");
    var layout  = config.layout || "default";

    if (!state.rows.length) {
      content.innerHTML =
        '<div class="admin-empty">' +
          '<div class="admin-empty-icon">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          '</div>' +
          '<h3>Nada por aqui ainda</h3>' +
          '<p>Crie o primeiro registro de ' + esc(config.title.toLowerCase()) + '.</p>' +
          '<button type="button" class="admin-button" id="emptyCreateBtn">' + esc(config.newLabel) + '</button>' +
        '</div>';
      var emptyBtn = $("#emptyCreateBtn");
      if (emptyBtn) emptyBtn.addEventListener("click", function () { openModal(moduleKey, null); });
      return;
    }

    var gridClass = gridClassFor(layout);
    var cardsHtml = state.rows.map(function (row) { return renderCard(layout, row); }).join("");

    content.innerHTML =
      '<div class="list-shell">' +
        '<div class="' + gridClass + '">' + cardsHtml + '</div>' +
      '</div>';

    bindRecordEvents(moduleKey);
  }

  function gridClassFor(layout) {
    if (layout === "news")     return "records-grid--news";
    if (layout === "gallery")  return "records-grid--gallery";
    if (layout === "partners") return "records-grid--partners";
    return "records-grid--partners";
  }

  /* ──────────────────────────────────────────────────────────────
     CARDS POR LAYOUT
  ─────────────────────────────────────────────────────────────── */
  function renderCard(layout, row) {
    if (layout === "partners") return renderPartnerCard(row);
    if (layout === "news")     return renderNewsCard(row);
    if (layout === "gallery")  return renderGalleryCard(row);
    return renderPartnerCard(row);
  }

  function renderPartnerCard(row) {
    var inactive = row.is_active === false ? " is-inactive" : "";
    var logo = row.logo_url
      ? '<img src="' + esc(row.logo_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
      : '<span class="logo-initial">' + esc((row.name || "P").trim().charAt(0).toUpperCase()) + '</span>';

    return (
      '<article class="partner-card' + inactive + '" data-id="' + esc(row.id) + '">' +
        '<div class="partner-logo-box">' + logo + '</div>' +
        '<div class="partner-info">' +
          '<p class="partner-name">' + esc(row.name || "Sem nome") + '</p>' +
          (row.description ? '<p class="partner-desc">' + esc(row.description) + '</p>' : '') +
          (typeof row.sort_order === "number" ? '<span class="partner-order">Ordem: ' + row.sort_order + '</span>' : '') +
        '</div>' +
        '<div class="card-actions">' +
          '<button type="button" class="record-action" data-action="edit"   data-id="' + esc(row.id) + '">Editar</button>' +
          '<button type="button" class="record-action is-danger" data-action="delete" data-id="' + esc(row.id) + '">Excluir</button>' +
        '</div>' +
      '</article>'
    );
  }

  function renderNewsCard(row) {
    var inactive = row.is_active === false ? " is-inactive" : "";
    var cover = row.cover_url
      ? '<img src="' + esc(row.cover_url) + '" alt="" loading="lazy">'
      : '';
    var badge = row.category
      ? '<span class="news-badge">' + esc(row.category) + '</span>'
      : '';

    return (
      '<article class="news-card' + inactive + '" data-id="' + esc(row.id) + '">' +
        '<div class="news-cover">' + cover + badge + '</div>' +
        '<div class="news-body">' +
          '<h3 class="news-title">' + esc(row.title || "Sem título") + '</h3>' +
          (row.excerpt ? '<p class="news-excerpt">' + esc(row.excerpt) + '</p>' : '') +
          (row.published_at ? '<p class="news-date">' + esc(formatDate(row.published_at)) + '</p>' : '') +
        '</div>' +
        '<footer class="news-actions">' +
          '<button type="button" class="record-action" data-action="edit"   data-id="' + esc(row.id) + '">Editar</button>' +
          '<button type="button" class="record-action is-danger" data-action="delete" data-id="' + esc(row.id) + '">Excluir</button>' +
        '</footer>' +
      '</article>'
    );
  }

  function renderGalleryCard(row) {
    var inactive = row.is_active === false ? " is-inactive" : "";
    var img = row.image_url
      ? '<img src="' + esc(row.image_url) + '" alt="" loading="lazy">'
      : '<div class="gallery-placeholder">🖼</div>';

    return (
      '<article class="gallery-card' + inactive + '" data-id="' + esc(row.id) + '">' +
        '<div class="gallery-img">' + img + '</div>' +
        '<div class="gallery-footer">' +
          '<p class="gallery-caption">' + esc(row.title || "—") + '</p>' +
          '<div class="gallery-actions">' +
            '<button type="button" class="record-action small" data-action="edit"   data-id="' + esc(row.id) + '">Editar</button>' +
            '<button type="button" class="record-action small is-danger" data-action="delete" data-id="' + esc(row.id) + '">Excluir</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  /* ──────────────────────────────────────────────────────────────
     BIND EVENTOS NOS CARDS
  ─────────────────────────────────────────────────────────────── */
  function bindRecordEvents(moduleKey) {
    $$(".record-action").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-action");
        var id     = btn.getAttribute("data-id");
        var row    = state.rows.find(function (r) { return String(r.id) === String(id); });
        if (!row) return;

        if (action === "edit") {
          openModal(moduleKey, row);
        } else if (action === "delete") {
          if (window.confirm("Excluir este registro? Esta ação não pode ser desfeita.")) {
            deleteRecord(MODULES[moduleKey].table, row.id);
          }
        }
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────
     CONFIGURAÇÕES
  ─────────────────────────────────────────────────────────────── */
  async function loadSettings() {
    var content = $("#adminContent");
    var config  = MODULES.site_settings;

    var resp = await getClient().from("site_settings").select("*");
    if (resp.error) {
      content.innerHTML =
        '<div class="admin-empty"><div class="admin-empty-icon">!</div>' +
        '<h3>Erro ao carregar</h3><p>' + esc(resp.error.message) + '</p></div>';
      return;
    }

    var existing = {};
    (resp.data || []).forEach(function (r) { existing[r.key] = r.value; });

    var fieldsHtml = config.settings.map(function (f) {
      var val = existing[f.key] != null ? existing[f.key] : "";
      var input;
      if (f.type === "textarea") {
        input = '<textarea name="' + esc(f.key) + '" rows="' + (f.rows || 3) + '" placeholder="' + esc(f.placeholder || "") + '">' + esc(val) + '</textarea>';
      } else {
        input = '<input type="' + esc(f.type) + '" name="' + esc(f.key) + '" value="' + esc(val) + '" placeholder="' + esc(f.placeholder || "") + '" />';
      }
      return '<label>' + esc(f.label) + input + '</label>';
    }).join("");

    content.innerHTML =
      '<form class="admin-settings" id="settingsForm" novalidate>' +
        '<h2>Dados institucionais</h2>' +
        '<p class="help">Esses valores são lidos pelo site público. Altere apenas com cuidado.</p>' +
        '<div class="admin-settings-grid">' + fieldsHtml + '</div>' +
        '<div class="admin-settings-actions">' +
          '<button type="submit" class="admin-button">Salvar configurações</button>' +
        '</div>' +
      '</form>';

    $("#settingsForm").addEventListener("submit", function (e) { e.preventDefault(); saveSettings(); });
  }

  async function saveSettings() {
    var form   = $("#settingsForm");
    var config = MODULES.site_settings;
    if (!form) return;

    var rows = config.settings.map(function (f) {
      var el  = form.elements[f.key];
      var val = el ? String(el.value || "").trim() : "";
      return { key: f.key, value: val };
    });

    var resp = await getClient().from("site_settings").upsert(rows, { onConflict: "key" });
    if (resp.error) { toast("Erro ao salvar: " + resp.error.message, "error"); return; }
    toast("Configurações salvas com sucesso", "success");
  }

  /* ──────────────────────────────────────────────────────────────
     MODAL CRUD
  ─────────────────────────────────────────────────────────────── */
  function openModal(type, data) {
    var config = MODULES[type];
    if (!config || config.isSettings) return;

    state.modal.isOpen    = true;
    state.modal.type      = type;
    state.modal.editingId = data ? data.id : null;

    var modal  = $("#adminModal");
    var title  = $("#adminModalTitle");
    var form   = $("#adminModalForm");
    var submit = $("#adminModalSubmit");

    title.textContent = data
      ? "Editar registro"
      : config.newLabel.replace(/^\+\s*/, "");

    form.innerHTML = renderModalForm(config, data);
    bindUploadButtons(form);

    submit.onclick = function () { saveRecord(type); };
    form.onsubmit  = function (e) { e.preventDefault(); saveRecord(type); };

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    var first = form.querySelector("input:not([type=file]), textarea, select");
    if (first && typeof first.focus === "function") {
      setTimeout(function () { first.focus(); }, 50);
    }
  }

  function closeModal() {
    var modal = $("#adminModal");
    state.modal.isOpen    = false;
    state.modal.type      = null;
    state.modal.editingId = null;
    if (modal) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }
    var form = $("#adminModalForm");
    if (form) form.innerHTML = "";
  }

  function renderModalForm(config, data) {
    return config.fields.map(function (f) {
      var current;
      if (data && Object.prototype.hasOwnProperty.call(data, f.name)) {
        current = data[f.name];
      } else {
        if (f.defaultToday)              current = today();
        else if (f.default != null)      current = f.default;
        else                             current = "";
      }

      /* Upload field */
      if (f.type === "upload") {
        var uVal     = current ? String(current) : "";
        var preview  = uVal ? '<div class="upload-preview-wrap"><img src="' + esc(uVal) + '" alt="" /></div>' : "";
        var uploadEl = isSupabaseReady()
          ? '<button type="button" class="upload-btn" data-field="' + esc(f.name) + '" data-bucket="' + esc(f.bucket || "gallery") + '">Carregar arquivo</button>' +
            '<input type="file" class="file-trigger" data-field="' + esc(f.name) + '" data-bucket="' + esc(f.bucket || "gallery") + '" accept="' + esc(f.accept || "image/*") + '" style="display:none" />'
          : "";
        return (
          '<label>' + esc(f.label) +
            preview +
            '<div class="upload-row">' +
              '<input type="url" name="' + esc(f.name) + '" value="' + esc(uVal) + '" placeholder="' + esc(f.placeholder || "") + '" ' + (f.required ? "required" : "") + ' />' +
              uploadEl +
            '</div>' +
          '</label>'
        );
      }

      /* Checkbox */
      if (f.type === "checkbox") {
        var checked = current === false ? "" : "checked";
        return (
          '<label data-checkbox style="display:flex;flex-direction:row;align-items:center;gap:10px;text-transform:none;letter-spacing:0;font-weight:600;font-size:0.88rem;cursor:pointer;">' +
            '<input type="checkbox" name="' + esc(f.name) + '" ' + checked + ' style="width:auto;min-height:auto;margin:0;cursor:pointer;" />' +
            '<span>' + esc(f.label) + '</span>' +
          '</label>'
        );
      }

      /* Textarea */
      if (f.type === "textarea") {
        return (
          '<label>' + esc(f.label) +
            '<textarea name="' + esc(f.name) + '" rows="' + (f.rows || 4) + '" ' + (f.required ? "required" : "") +
              ' placeholder="' + esc(f.placeholder || "") + '">' + esc(current) + '</textarea>' +
          '</label>'
        );
      }

      /* All other inputs */
      var val = (current === 0 || current) ? String(current) : "";
      return (
        '<label>' + esc(f.label) +
          '<input type="' + esc(f.type) + '" name="' + esc(f.name) + '" value="' + esc(val) + '" ' +
            (f.required ? "required" : "") + ' placeholder="' + esc(f.placeholder || "") + '" />' +
        '</label>'
      );
    }).join("");
  }

  /* ──────────────────────────────────────────────────────────────
     UPLOAD PARA SUPABASE STORAGE
  ─────────────────────────────────────────────────────────────── */
  function bindUploadButtons(form) {
    $$(".upload-btn", form).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var field     = btn.getAttribute("data-field");
        var filePicker = form.querySelector('.file-trigger[data-field="' + field + '"]');
        if (filePicker) filePicker.click();
      });
    });

    $$(".file-trigger", form).forEach(function (input) {
      input.addEventListener("change", function () { handleFileUpload(input); });
    });
  }

  async function handleFileUpload(fileInput) {
    var file   = fileInput.files[0];
    if (!file) return;

    var bucket    = fileInput.getAttribute("data-bucket") || "gallery";
    var field     = fileInput.getAttribute("data-field");
    var urlInput  = document.querySelector('[name="' + field + '"][type="url"]');
    var btn       = document.querySelector('.upload-btn[data-field="' + field + '"]');
    var prevWrap  = btn ? btn.closest("label").querySelector(".upload-preview-wrap") : null;

    if (btn) { btn.textContent = "Enviando…"; btn.disabled = true; }

    try {
      var ext  = (file.name.split(".").pop() || "jpg").toLowerCase();
      var safe = ["jpg","jpeg","png","webp","gif","svg"].includes(ext) ? ext : "jpg";
      var path = Date.now() + "-" + Math.random().toString(36).slice(2, 10) + "." + safe;

      var resp = await getClient().storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

      if (resp.error) { toast("Erro no upload: " + resp.error.message, "error"); return; }

      var urlResp   = getClient().storage.from(bucket).getPublicUrl(path);
      var publicUrl = urlResp.data.publicUrl;

      if (urlInput) urlInput.value = publicUrl;

      /* atualiza preview inline */
      if (prevWrap) {
        prevWrap.innerHTML = '<img src="' + esc(publicUrl) + '" alt="" />';
      } else if (urlInput) {
        var newWrap = document.createElement("div");
        newWrap.className = "upload-preview-wrap";
        newWrap.innerHTML = '<img src="' + esc(publicUrl) + '" alt="" />';
        urlInput.closest(".upload-row").insertAdjacentElement("beforebegin", newWrap);
      }

      toast("Imagem enviada com sucesso", "success");
    } catch (err) {
      toast("Erro inesperado no upload", "error");
    } finally {
      if (btn) { btn.textContent = "Carregar arquivo"; btn.disabled = false; }
      fileInput.value = "";
    }
  }

  /* ──────────────────────────────────────────────────────────────
     COLETA + VALIDAÇÃO DO FORMULÁRIO
  ─────────────────────────────────────────────────────────────── */
  function collectModalPayload() {
    var type   = state.modal.type;
    var config = MODULES[type];
    var form   = $("#adminModalForm");
    var payload = {};

    config.fields.forEach(function (f) {
      var el = form.elements[f.name];
      if (!el) return;

      if (f.type === "checkbox") { payload[f.name] = !!el.checked; return; }

      if (f.type === "upload") {
        var raw = String(el.value || "").trim();
        payload[f.name] = raw || null;
        return;
      }

      if (f.type === "number") {
        var raw2 = String(el.value || "").trim();
        payload[f.name] = raw2 === "" ? (f.default != null ? f.default : 0) : (isNaN(Number(raw2)) ? 0 : Number(raw2));
        return;
      }

      var v = String(el.value || "").trim();
      payload[f.name] = v === "" ? null : v;
    });

    return payload;
  }

  function validatePayload(config, payload) {
    var missing = [];
    config.fields.forEach(function (f) {
      if (!f.required) return;
      var val = payload[f.name];
      if (val == null || (typeof val === "string" && val.trim() === "")) {
        missing.push(f.label);
      }
    });
    return missing;
  }

  /* ──────────────────────────────────────────────────────────────
     SAVE / DELETE
  ─────────────────────────────────────────────────────────────── */
  async function saveRecord(type) {
    var config  = MODULES[type];
    if (!config) return;

    var payload = collectModalPayload();
    var missing = validatePayload(config, payload);
    if (missing.length) { toast("Preencha: " + missing.join(", "), "error"); return; }

    var submit = $("#adminModalSubmit");
    if (submit) { submit.textContent = "Salvando…"; submit.disabled = true; }

    var resp;
    if (state.modal.editingId) {
      resp = await getClient().from(config.table).update(payload).eq("id", state.modal.editingId);
    } else {
      resp = await getClient().from(config.table).insert(payload);
    }

    if (submit) { submit.textContent = "Salvar"; submit.disabled = false; }

    if (resp.error) { toast("Erro ao salvar: " + resp.error.message, "error"); return; }

    toast(state.modal.editingId ? "Registro atualizado" : "Registro criado com sucesso", "success");
    closeModal();
    await loadModule(type);
    await refreshCounts();
  }

  async function deleteRecord(table, id) {
    var resp = await getClient().from(table).delete().eq("id", id);
    if (resp.error) { toast("Erro ao excluir: " + resp.error.message, "error"); return; }
    toast("Registro excluído", "success");
    await loadModule(state.activeSection);
    await refreshCounts();
  }

  /* ──────────────────────────────────────────────────────────────
     NAVEGAÇÃO
  ─────────────────────────────────────────────────────────────── */
  async function switchSection(section) {
    if (!section || SECTION_ORDER.indexOf(section) === -1) section = "dashboard";
    state.activeSection = section;

    $$(".nav-item").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-section") === section);
    });

    if (section === "dashboard") { loadDashboard(); return; }
    await loadModule(section);
  }

  /* ──────────────────────────────────────────────────────────────
     INIT DASHBOARD
  ─────────────────────────────────────────────────────────────── */
  async function initDashboard(session) {
    if (!isSupabaseReady()) {
      var content = $("#adminContent");
      if (content) {
        content.innerHTML =
          '<div class="admin-empty">' +
            '<div class="admin-empty-icon">!</div>' +
            '<h3>Supabase não configurado</h3>' +
            '<p>Defina SUPABASE_URL e SUPABASE_ANON_KEY em <code>js/supabase-client.js</code>.</p>' +
          '</div>';
      }
      return;
    }

    var emailEl = $("#sessionEmail");
    if (emailEl) emailEl.textContent = session.user.email || "";

    /* sidebar nav */
    $$(".nav-item").forEach(function (btn) {
      btn.addEventListener("click", function () { switchSection(btn.getAttribute("data-section")); });
    });

    /* logout */
    var logoutBtn = $("#logoutButton");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

    /* modal close */
    var modal = $("#adminModal");
    if (modal) {
      $$("[data-modal-close]", modal).forEach(function (el) {
        el.addEventListener("click", closeModal);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.modal.isOpen) closeModal();
    });

    /* first render */
    await refreshCounts();
    await switchSection("dashboard");
  }

  /* ──────────────────────────────────────────────────────────────
     API PÚBLICA
  ─────────────────────────────────────────────────────────────── */
  window.acebaAdmin = {
    requireAuth:   requireAuth,
    handleLogout:  handleLogout,
    switchSection: switchSection,
    loadDashboard: loadDashboard,
    loadSettings:  loadSettings,
    saveSettings:  saveSettings,
    saveRecord:    saveRecord,
    deleteRecord:  deleteRecord,
    openModal:     openModal,
    closeModal:    closeModal,
    toast:         toast,
    esc:           esc,
    refreshCounts: refreshCounts,
  };

  /* ──────────────────────────────────────────────────────────────
     BOOTSTRAP
  ─────────────────────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", async function () {
    if (isLoginPage()) {
      await initLogin();
      return;
    }

    if (isDashboardPage()) {
      var session = await requireAuth();
      if (!session) return;
      await initDashboard(session);
    }
  });

})();
