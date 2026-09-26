/* =========================================================
   LINKFOLIO — Shared helpers + Supabase client
   ========================================================= */
(function () {
  'use strict';

  const CFG = window.__APP_CONFIG__ || {};
  if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY ||
      CFG.SUPABASE_URL.includes('YOUR-PROJECT-REF')) {
    console.error('[Linkfolio] config.js not configured.');
  }

  const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'linkfolio_auth'
    }
  });

  /* ----------------------- Safe DOM helpers ----------------------- */
  function el(tag, opts = {}, children = []) {
    const node = document.createElement(tag);
    if (opts.class) node.className = opts.class;
    if (opts.text) node.textContent = opts.text;
    if (opts.attrs) for (const k in opts.attrs) node.setAttribute(k, opts.attrs[k]);
    if (opts.on) for (const k in opts.on) node.addEventListener(k, opts.on[k]);
    for (const c of [].concat(children)) if (c) node.appendChild(c);
    return node;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[m]);
  }
  function $(sel, root = document) { return root.querySelector(sel); }
  function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  /* ----------------------- Validation ----------------------- */
  const RESERVED = new Set([
    'index','login','signup','dashboard','profile','admin-login','admin-panel',
    'forgot-password','reset-password','404','config','app','style','readme',
    'database','api','www','static','assets','storage','admin','root'
  ]);
  const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

  function validateUsername(raw) {
    const u = String(raw || '').trim().toLowerCase();
    if (!u) return { ok: false, msg: 'Username required' };
    if (u.length < 3) return { ok: false, msg: 'At least 3 characters' };
    if (u.length > 30) return { ok: false, msg: 'Maximum 30 characters' };
    if (!USERNAME_RE.test(u)) return { ok: false, msg: 'Only a-z, 0-9, _ allowed' };
    if (RESERVED.has(u)) return { ok: false, msg: 'This username is reserved' };
    return { ok: true, value: u };
  }
  function validateEmail(e) {
    const v = String(e || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? { ok: true, value: v } : { ok: false, msg: 'Invalid email' };
  }
  function validatePassword(p) {
    if (!p || p.length < 8) return { ok: false, msg: 'Minimum 8 characters' };
    if (p.length > 72) return { ok: false, msg: 'Maximum 72 characters' };
    return { ok: true };
  }
  function validateUrl(u) {
    try {
      const url = new URL(String(u).trim());
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return { ok: false, msg: 'URL must start with http:// or https://' };
      return { ok: true, value: url.toString() };
    } catch { return { ok: false, msg: 'Invalid URL' }; }
  }

  /* ----------------------- Alert UI ----------------------- */
  function showAlert(container, type, message) {
    if (!container) return;
    clear(container);
    const box = el('div', { class: `alert ${type}`, text: message, attrs: { role: 'alert' } });
    container.appendChild(box);
  }
  function clearAlert(container) { if (container) clear(container); }

  /* ----------------------- Async button ----------------------- */
  function setLoading(btn, loading, textWhenLoading = 'Please wait…') {
    if (!btn) return;
    if (loading) {
      btn.dataset._orig = btn.innerHTML;
      btn.disabled = true;
      clear(btn);
      btn.appendChild(el('span', { class: 'spinner' }));
      btn.appendChild(document.createTextNode(' ' + textWhenLoading));
    } else {
      btn.disabled = false;
      if (btn.dataset._orig) { btn.innerHTML = btn.dataset._orig; delete btn.dataset._orig; }
    }
  }

  /* ----------------------- Friendly errors ----------------------- */
  function friendlyError(err) {
    const msg = (err && err.message) ? String(err.message) : 'Something went wrong';
    if (/Invalid login credentials/i.test(msg)) return 'Invalid email or password.';
    if (/Email not confirmed/i.test(msg)) return 'Please verify your email first.';
    if (/User already registered/i.test(msg)) return 'This email is already registered.';
    if (/duplicate key.*username/i.test(msg)) return 'That username is already taken.';
    if (/username_reserved/i.test(msg)) return 'This username is reserved.';
    if (/rate limit/i.test(msg)) return 'Too many attempts. Try again later.';
    if (/not_authenticated/i.test(msg)) return 'Please sign in.';
    if (/network|fetch/i.test(msg)) return 'Network error. Check your connection.';
    return msg.length > 160 ? 'Something went wrong. Please try again.' : msg;
  }

  /* ----------------------- Session helpers ----------------------- */
  async function getSession() {
    const { data } = await sb.auth.getSession();
    return data ? data.session : null;
  }
  async function requireAuth(redirect = 'login.html') {
    const s = await getSession();
    if (!s) { window.location.replace(redirect); return null; }
    return s;
  }
  async function requireAdmin() {
    const s = await getSession();
    if (!s) { window.location.replace('admin-login.html'); return null; }
    const { data, error } = await sb.from('admins')
      .select('role,is_active').eq('user_id', s.user.id).maybeSingle();
    if (error || !data || !data.is_active) {
      await sb.auth.signOut();
      window.location.replace('admin-login.html');
      return null;
    }
    return { session: s, admin: data };
  }

  /* ----------------------- Site content loader ----------------------- */
  async function loadSiteContent(pageKey) {
    const fallback = {};
    try {
      const { data, error } = await sb.from('site_content')
        .select('content_key,content_value').eq('page_key', pageKey);
      if (error) throw error;
      (data || []).forEach(r => { fallback[r.content_key] = r.content_value; });
    } catch (e) { console.warn('[content] fallback used for', pageKey, e.message); }
    return fallback;
  }
  function applyContent(content) {
    $$('[data-content]').forEach(node => {
      const key = node.getAttribute('data-content');
      if (content[key]) node.textContent = content[key];
    });
    $$('[data-content-placeholder]').forEach(node => {
      const key = node.getAttribute('data-content-placeholder');
      if (content[key]) node.setAttribute('placeholder', content[key]);
    });
  }

  /* ----------------------- Theme ----------------------- */
  const DEFAULT_THEME = {
    bg_type: 'gradient',
    bg_color: '#0f172a',
    bg_gradient_from: '#6366f1',
    bg_gradient_to: '#0ea5e9',
    card_color: '#ffffff',
    text_color: '#0f172a',
    accent_color: '#6366f1',
    button_style: 'filled',
    border_radius: 16,
    font: 'Inter',
    mode: 'light'
  };
  function safeColor(v, fallback) {
    if (typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
    return fallback;
  }
  function safeFont(v) {
    const allowed = ['Inter','Poppins','Roboto','Lora','Playfair Display','system-ui'];
    return allowed.includes(v) ? v : 'Inter';
  }
  function applyTheme(root, theme) {
    const t = Object.assign({}, DEFAULT_THEME, theme || {});
    const r = root.style;
    if (t.bg_type === 'gradient') {
      r.background = `linear-gradient(135deg, ${safeColor(t.bg_gradient_from, '#6366f1')} 0%, ${safeColor(t.bg_gradient_to, '#0ea5e9')} 100%)`;
    } else {
      r.background = safeColor(t.bg_color, '#0f172a');
    }
    root.dataset.mode = t.mode === 'dark' ? 'dark' : 'light';
    root.style.setProperty('--pf-card', safeColor(t.card_color, '#ffffff'));
    root.style.setProperty('--pf-text', safeColor(t.text_color, '#0f172a'));
    root.style.setProperty('--pf-accent', safeColor(t.accent_color, '#6366f1'));
    root.style.setProperty('--pf-radius', Math.max(0, Math.min(32, Number(t.border_radius) || 16)) + 'px');
    root.style.setProperty('--pf-font', `'${safeFont(t.font)}', system-ui, sans-serif`);
    root.style.fontFamily = `'${safeFont(t.font)}', system-ui, sans-serif`;
  }

  /* ----------------------- QR (lazy) ----------------------- */
  async function ensureQrLib() {
    if (window.QRCode) return;
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  async function renderQr(canvas, text, size = 220) {
    await ensureQrLib();
    await window.QRCode.toCanvas(canvas, text, { width: size, margin: 1 });
  }

  /* ----------------------- Public profile URL ----------------------- */
  function publicProfileUrl(username) {
    const base = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}`;
    return `${base}profile.html?u=${encodeURIComponent(username)}`;
  }

  /* ----------------------- Debounce ----------------------- */
  function debounce(fn, ms = 350) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  /* ----------------------- Exports ----------------------- */
  window.App = {
    sb, el, clear, escapeHtml, $, $$,
    validateUsername, validateEmail, validatePassword, validateUrl,
    showAlert, clearAlert, setLoading, friendlyError,
    getSession, requireAuth, requireAdmin,
    loadSiteContent, applyContent,
    applyTheme, DEFAULT_THEME,
    renderQr, publicProfileUrl,
    debounce, RESERVED
  };
})();