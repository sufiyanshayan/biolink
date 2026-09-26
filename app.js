// =====================================================================
// APP.JS — shared utilities used by every page.
// Requires config.js and the Supabase JS SDK to be loaded first.
// =====================================================================

const supabase = window.supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

const SITE_URL = window.APP_CONFIG.SITE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------
function ensureToastContainer() {
  let c = document.getElementById("toast-container");
  if (!c) {
    c = document.createElement("div");
    c.id = "toast-container";
    document.body.appendChild(c);
  }
  return c;
}

function showToast(message, type = "info", timeout = 4000) {
  const c = ensureToastContainer();
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message; // textContent only — never innerHTML with user content
  c.appendChild(el);
  setTimeout(() => el.remove(), timeout);
}

function friendlyError(err) {
  // Never leak raw technical/DB error text to the user.
  const msg = (err && err.message) || String(err || "");
  const known = {
    "Invalid login credentials": "Incorrect email or password.",
    "User already registered": "An account with this email already exists.",
    "Email not confirmed": "Please verify your email before logging in.",
  };
  for (const k in known) {
    if (msg.includes(k)) return known[k];
  }
  if (msg.toLowerCase().includes("username_format")) return "Username can only contain lowercase letters, numbers, and underscores (3–20 characters).";
  if (msg.toLowerCase().includes("duplicate key") && msg.includes("username")) return "That username is already taken.";
  if (msg.toLowerCase().includes("failed to fetch")) return "Network error. Please check your connection and try again.";
  return "Something went wrong. Please try again.";
}

function renderAlert(container, message, type = "error") {
  container.innerHTML = "";
  if (!message) return;
  const div = document.createElement("div");
  div.className = `alert alert-${type}`;
  div.textContent = message; // textContent only — safe even if message ever contains user input
  container.appendChild(div);
}

// ---------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

function isValidUsername(u) {
  return USERNAME_RE.test((u || "").toLowerCase());
}
function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");
}
function isValidPassword(p) {
  return (p || "").length >= 8;
}
function isValidUrl(u) {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function setButtonLoading(btn, loading, loadingText = "Please wait…") {
  if (loading) {
    btn.dataset.originalText = btn.dataset.originalText || btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> ${loadingText}`;
  } else {
    btn.disabled = false;
    if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
  }
}

// ---------------------------------------------------------------------
// Auth session helpers
// ---------------------------------------------------------------------
async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Redirect unauthenticated users away from protected pages.
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

// Redirect authenticated users away from login/signup pages.
async function redirectIfLoggedIn(target = "dashboard.html") {
  const session = await getSession();
  if (session) window.location.href = target;
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

// Confirms the caller is an active admin (checked against the DB, not email).
async function requireAdmin() {
  const session = await requireAuth();
  if (!session) return null;
  const { data, error } = await supabase
    .from("admins")
    .select("role,is_active")
    .eq("user_id", session.user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) {
    window.location.href = "admin-login.html";
    return null;
  }
  return { session, role: data.role };
}

// ---------------------------------------------------------------------
// Site content loader (with fallback defaults baked into each page)
// ---------------------------------------------------------------------
async function loadSiteContent(pageKey, fallbackMap) {
  const result = { ...fallbackMap };
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("content_key,content_value")
      .eq("page_key", pageKey);
    if (!error && data) {
      data.forEach((row) => {
        result[row.content_key] = row.content_value;
      });
    }
  } catch {
    // network/DB unavailable — fallback text already in `result`
  }
  return result;
}

function applyTextContent(map) {
  Object.entries(map).forEach(([key, value]) => {
    document.querySelectorAll(`[data-content="${key}"]`).forEach((el) => {
      el.textContent = value; // safe: textContent, never innerHTML
    });
  });
}

// ---------------------------------------------------------------------
// Theme application (public profile) — values are constrained, never
// raw CSS strings, to avoid unsafe CSS/HTML injection.
// ---------------------------------------------------------------------
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const SAFE_FONTS = ["Inter", "system-ui", "Georgia", "Courier New", "Poppins"];
const SAFE_BUTTON_STYLES = ["solid", "outline", "soft"];
const SAFE_MODES = ["light", "dark"];

function sanitizeTheme(theme) {
  const t = theme || {};
  const safe = (v, fallback) => (HEX_RE.test(v) ? v : fallback);
  return {
    background: safe(t.background, "#0b0f19"),
    gradient: safe(t.gradient, ""),
    cardColor: safe(t.cardColor, "#141a29"),
    textColor: safe(t.textColor, "#f1f5f9"),
    accentColor: safe(t.accentColor, "#6366f1"),
    buttonStyle: SAFE_BUTTON_STYLES.includes(t.buttonStyle) ? t.buttonStyle : "solid",
    borderRadius: /^[0-9]{1,2}$/.test(String(t.borderRadius)) ? String(t.borderRadius) : "16",
    font: SAFE_FONTS.includes(t.font) ? t.font : "Inter",
    mode: SAFE_MODES.includes(t.mode) ? t.mode : "dark",
  };
}

function applyThemeToProfilePage(theme) {
  const t = sanitizeTheme(theme);
  const root = document.documentElement;
  root.style.setProperty("--p-bg", t.gradient ? t.gradient : t.background);
  root.style.setProperty("--p-card", t.cardColor);
  root.style.setProperty("--p-text", t.textColor);
  root.style.setProperty("--p-accent", t.accentColor);
  root.style.setProperty("--p-radius", t.borderRadius + "px");
  root.style.setProperty("--p-font", `"${t.font}", system-ui, sans-serif`);
  document.body.dataset.buttonStyle = t.buttonStyle;
  document.body.dataset.mode = t.mode;
}

// ---------------------------------------------------------------------
// Account deletion (self) — storage cleanup client-side, then DB+auth
// deletion via the secure RPC. See database.sql delete_my_account().
// ---------------------------------------------------------------------
async function deleteMyAccount(uid) {
  try {
    const { data: files } = await supabase.storage.from("avatars").list(uid);
    if (files && files.length) {
      const paths = files.map((f) => `${uid}/${f.name}`);
      await supabase.storage.from("avatars").remove(paths);
    }
  } catch {
    // best-effort; the RPC also attempts storage.objects cleanup server-side
  }
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw error;
  await supabase.auth.signOut();
}

// ---------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------
function debounce(fn, wait = 400) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function profileUrlFor(username) {
  return `${SITE_URL}/${username}`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => showToast("Copied to clipboard", "success"),
    () => showToast("Could not copy — please copy manually", "error")
  );
}
