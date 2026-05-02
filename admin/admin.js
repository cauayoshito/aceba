import { supabase, isSupabaseConfigured } from "../js/supabase-client.js";

const ADMIN_LOGIN = "login.html";
const ADMIN_DASHBOARD = "dashboard.html";

const modules = {
  partners: {
    title: "Parceiros",
    table: "partners",
    order: { column: "sort_order", ascending: true },
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "logo_url", label: "Logo URL", type: "url" },
      { name: "website_url", label: "Website URL", type: "url" },
      { name: "sort_order", label: "Ordem", type: "number" },
    ],
    summary: (row) => [row.website_url, row.logo_url].filter(Boolean).join(" · "),
  },
  projects: {
    title: "Projetos",
    table: "projects",
    order: { column: "created_at", ascending: false },
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descrição", type: "textarea", required: true },
      { name: "image_url", label: "Imagem URL", type: "url" },
    ],
    summary: (row) => row.description,
  },
  gallery_images: {
    title: "Galeria",
    table: "gallery_images",
    order: { column: "created_at", ascending: false },
    fields: [
      { name: "title", label: "Título", type: "text" },
      { name: "category", label: "Categoria", type: "text" },
      { name: "image_url", label: "Imagem URL", type: "url", required: true },
    ],
    summary: (row) => [row.category, row.image_url].filter(Boolean).join(" · "),
  },
  transparency_documents: {
    title: "Transparência",
    table: "transparency_documents",
    order: { column: "created_at", ascending: false },
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descrição", type: "textarea" },
      { name: "file_url", label: "Arquivo URL", type: "url", required: true },
    ],
    summary: (row) => row.description || row.file_url,
  },
  site_settings: {
    title: "Configurações",
    table: "site_settings",
    settings: [
      { key: "phone", label: "Telefone" },
      { key: "whatsapp", label: "WhatsApp" },
      { key: "email", label: "E-mail" },
      { key: "instagram", label: "Instagram" },
      { key: "pix_key", label: "Chave Pix" },
      { key: "address", label: "Endereço" },
    ],
  },
};

const state = {
  activeModule: "partners",
  rows: [],
  editingId: null,
};

const $ = (selector) => document.querySelector(selector);

function setStatus(message, type = "") {
  const status = $("#adminStatus") || $("#loginStatus");
  if (!status) return;
  status.textContent = message || "";
  status.className = `admin-status${type ? ` is-${type}` : ""}`;
}

function isLoginPage() {
  return window.location.pathname.endsWith(ADMIN_LOGIN);
}

function isDashboardPage() {
  return window.location.pathname.endsWith(ADMIN_DASHBOARD);
}

function redirect(path) {
  window.location.href = path;
}

async function getSession() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

async function ensureAdminSession() {
  const session = await getSession();
  if (!session) {
    redirect(ADMIN_LOGIN);
    return null;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id,email")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error || !data) {
    await supabase.auth.signOut();
    redirect(ADMIN_LOGIN);
    return null;
  }

  return session;
}

async function initLogin() {
  const form = $("#loginForm");
  if (!form) return;

  if (!isSupabaseConfigured || !supabase) {
    setStatus("Configure SUPABASE_URL e SUPABASE_ANON_KEY em js/supabase-client.js.", "error");
    return;
  }

  const session = await getSession();
  if (session) redirect(ADMIN_DASHBOARD);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Entrando...");

    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("Não foi possível entrar. Confira e-mail, senha e autorização.", "error");
      return;
    }

    redirect(ADMIN_DASHBOARD);
  });
}

function renderForm() {
  const form = $("#recordForm");
  const config = modules[state.activeModule];
  if (!form || !config) return;

  if (config.settings) {
    form.innerHTML = `
      <h2>Configurações do site</h2>
      ${config.settings
        .map(
          (field) => `
            <label>
              ${field.label}
              <input type="text" name="${field.key}" />
            </label>
          `
        )
        .join("")}
      <div class="admin-actions">
        <button type="submit" class="admin-button">Salvar configurações</button>
      </div>
    `;
    return;
  }

  form.innerHTML = `
    <h2>${state.editingId ? "Editar registro" : "Novo registro"}</h2>
    ${config.fields
      .map((field) => {
        const required = field.required ? "required" : "";
        if (field.type === "textarea") {
          return `
            <label>
              ${field.label}
              <textarea name="${field.name}" ${required}></textarea>
            </label>
          `;
        }
        return `
          <label>
            ${field.label}
            <input type="${field.type}" name="${field.name}" ${required} />
          </label>
        `;
      })
      .join("")}
    <div class="admin-actions">
      <button type="submit" class="admin-button">${state.editingId ? "Salvar alterações" : "Criar registro"}</button>
      <button type="button" class="admin-button secondary" id="clearFormButton">Limpar</button>
    </div>
  `;
}

function fillForm(row) {
  const form = $("#recordForm");
  if (!form || !row) return;
  Object.entries(row).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value ?? "";
  });
}

function fillSettings(rows) {
  const form = $("#recordForm");
  if (!form) return;
  rows.forEach((row) => {
    if (form.elements[row.key]) form.elements[row.key].value = row.value ?? "";
  });
}

function getTitle(row) {
  return row.name || row.title || row.key || "Registro";
}

function renderRows() {
  const list = $("#recordsList");
  const config = modules[state.activeModule];
  if (!list || !config) return;

  if (!state.rows.length) {
    list.innerHTML = `<p class="admin-status">Nenhum registro encontrado.</p>`;
    return;
  }

  list.innerHTML = state.rows
    .map((row) => {
      const inactive = row.is_active === false ? " is-inactive" : "";
      const canToggle = Object.prototype.hasOwnProperty.call(row, "is_active");
      const summary = config.summary ? config.summary(row) : row.value;
      return `
        <article class="record-card${inactive}" data-id="${row.id}">
          <div class="record-head">
            <div>
              <div class="record-title">${getTitle(row)}</div>
              <div class="record-meta">${summary || ""}</div>
            </div>
            ${canToggle ? `<span class="record-meta">${row.is_active ? "Ativo" : "Inativo"}</span>` : ""}
          </div>
          <div class="record-actions">
            <button type="button" class="record-action" data-action="edit" data-id="${row.id}">Editar</button>
            ${
              canToggle
                ? `<button type="button" class="record-action danger" data-action="toggle" data-id="${row.id}">
                    ${row.is_active ? "Desativar" : "Ativar"}
                  </button>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadRows() {
  const config = modules[state.activeModule];
  if (!config) return;
  setStatus("Carregando...");

  let query = supabase.from(config.table).select("*");
  if (config.order) {
    query = query.order(config.order.column, { ascending: config.order.ascending });
  } else {
    query = query.order("key", { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    setStatus("Erro ao carregar registros. Verifique RLS e permissões.", "error");
    return;
  }

  state.rows = data || [];
  renderRows();
  if (config.settings) fillSettings(state.rows);
  setStatus("");
}

function collectPayload() {
  const config = modules[state.activeModule];
  const form = $("#recordForm");
  const payload = {};

  config.fields.forEach((field) => {
    const value = form.elements[field.name]?.value.trim() || "";
    if (field.type === "number") {
      payload[field.name] = value === "" ? 0 : Number(value);
    } else {
      payload[field.name] = value || null;
    }
  });

  return payload;
}

async function handleRecordSubmit(event) {
  event.preventDefault();
  const config = modules[state.activeModule];
  if (!config) return;

  if (config.settings) {
    const rows = config.settings.map((field) => ({
      key: field.key,
      value: event.currentTarget.elements[field.key]?.value.trim() || "",
    }));
    const { error } = await supabase.from(config.table).upsert(rows, { onConflict: "key" });
    if (error) {
      setStatus("Erro ao salvar configurações.", "error");
      return;
    }
    setStatus("Configurações salvas.", "success");
    await loadRows();
    return;
  }

  const payload = collectPayload();
  const query = state.editingId
    ? supabase.from(config.table).update(payload).eq("id", state.editingId)
    : supabase.from(config.table).insert(payload);

  const { error } = await query;
  if (error) {
    setStatus("Erro ao salvar registro.", "error");
    return;
  }

  state.editingId = null;
  renderForm();
  setStatus("Registro salvo.", "success");
  await loadRows();
}

async function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const row = state.rows.find((item) => item.id === button.dataset.id);
  if (!row) return;

  if (button.dataset.action === "edit") {
    state.editingId = row.id;
    renderForm();
    fillForm(row);
    setStatus("");
    return;
  }

  if (button.dataset.action === "toggle") {
    const config = modules[state.activeModule];
    const { error } = await supabase
      .from(config.table)
      .update({ is_active: !row.is_active })
      .eq("id", row.id);

    if (error) {
      setStatus("Erro ao alterar status.", "error");
      return;
    }

    setStatus("Status atualizado.", "success");
    await loadRows();
  }
}

async function switchModule(moduleName) {
  state.activeModule = moduleName;
  state.editingId = null;
  const config = modules[moduleName];
  $("#sectionTitle").textContent = config.title;
  $("#listTitle").textContent = config.settings ? "Valores cadastrados" : "Registros";
  document.querySelectorAll(".admin-nav-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.section === moduleName);
  });
  renderForm();
  await loadRows();
}

async function initDashboard() {
  if (!isSupabaseConfigured || !supabase) {
    setStatus("Configure SUPABASE_URL e SUPABASE_ANON_KEY em js/supabase-client.js.", "error");
    return;
  }

  const session = await ensureAdminSession();
  if (!session) return;

  const email = $("#sessionEmail");
  if (email) email.textContent = session.user.email || "";

  $("#logoutButton")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    redirect(ADMIN_LOGIN);
  });

  document.querySelectorAll(".admin-nav-item").forEach((button) => {
    button.addEventListener("click", () => switchModule(button.dataset.section));
  });

  $("#recordForm")?.addEventListener("submit", handleRecordSubmit);
  $("#recordForm")?.addEventListener("click", (event) => {
    if (event.target.closest("#clearFormButton")) {
      state.editingId = null;
      renderForm();
      setStatus("");
    }
  });
  $("#recordsList")?.addEventListener("click", handleListClick);

  await switchModule(state.activeModule);
}

if (isLoginPage()) initLogin();
if (isDashboardPage()) initDashboard();

