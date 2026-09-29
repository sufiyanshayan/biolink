// ============================================================================
// BIOLINK SHARED UTILITIES (loaded by every page after config.js)
// ============================================================================

const PROFILE_COLS = 'id,username,display_name,bio,avatar_url,theme,is_blocked,created_at';
const RESERVED_USERNAMES = ['admin','administrator','api','app','assets','about','biolink','config','dashboard','database','favicon','forgot','help','index','login','logout','null','package','privacy','profile','readme','register','reset','robots','root','settings','signup','sitemap','static','style','support','terms','undefined','vercel','www'];

// ---------- Safe text / URL helpers ----------
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
const escapeHTML = escapeHtml; // alias (some pages used this spelling)

function validateUsername(username) {
    return /^[a-z0-9_]{3,30}$/.test(username) && !RESERVED_USERNAMES.includes(username);
}

// Adds https:// when the scheme is missing; returns '' for anything unsafe (javascript:, data:, ...)
function sanitizeUrl(url) {
    let v = String(url || '').trim();
    if (!v) return '';
    if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = 'https://' + v.replace(/^\/+/, '');
    try {
        const u = new URL(v);
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(u.protocol)) return '';
        if (u.protocol.startsWith('http') && !u.hostname.includes('.') && u.hostname !== 'localhost') return '';
        return u.protocol.startsWith('http') ? u.href : v;
    } catch (_) {
        return '';
    }
}
function validateUrl(url) { return sanitizeUrl(url) !== ''; }

// ---------- Theme engine ----------
const THEME_FONTS = ['font-sans', 'font-serif', 'font-mono'];
const THEME_RADIUS = { 'rounded-none': '0px', 'rounded-md': '6px', 'rounded-lg': '12px', 'rounded-full': '9999px' };
const DEFAULT_THEME = { bgColor: '#0f172a', bgType: 'solid', textColor: '#ffffff', btnStyle: 'rounded-lg', btnBgColor: '#ffffff', btnTextColor: '#0f172a', fontFamily: 'font-sans', borderRadius: '12px' };

function isValidColor(v) { return /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(String(v || '').trim()); }
function isValidGradient(v) {
    v = String(v || '').trim();
    return /^linear-gradient\([#a-zA-Z0-9%.,\s()-]{5,200}\)$/.test(v) && !/url|expression|;|\/\*/i.test(v);
}
function sanitizeTheme(theme) {
    const t = Object.assign({}, DEFAULT_THEME, theme || {});
    const bgType = t.bgType === 'gradient' ? 'gradient' : 'solid';
    const okBg = bgType === 'gradient' ? isValidGradient(t.bgColor) : isValidColor(t.bgColor);
    const btnStyle = THEME_RADIUS[t.btnStyle] ? t.btnStyle : DEFAULT_THEME.btnStyle;
    return {
        bgType,
        bgColor: okBg ? String(t.bgColor).trim() : DEFAULT_THEME.bgColor,
        textColor: isValidColor(t.textColor) ? t.textColor.trim() : DEFAULT_THEME.textColor,
        btnBgColor: isValidColor(t.btnBgColor) ? t.btnBgColor.trim() : DEFAULT_THEME.btnBgColor,
        btnTextColor: isValidColor(t.btnTextColor) ? t.btnTextColor.trim() : DEFAULT_THEME.btnTextColor,
        fontFamily: THEME_FONTS.includes(t.fontFamily) ? t.fontFamily : DEFAULT_THEME.fontFamily,
        btnStyle,
        borderRadius: THEME_RADIUS[btnStyle]
    };
}
function applyProfileTheme(el, theme) {
    if (!el) return;
    const t = sanitizeTheme(theme);
    el.style.background = t.bgColor;
    el.style.setProperty('--t-text', t.textColor);
    el.style.setProperty('--t-btn-bg', t.btnBgColor);
    el.style.setProperty('--t-btn-text', t.btnTextColor);
    el.style.setProperty('--t-radius', t.borderRadius);
    THEME_FONTS.forEach(c => el.classList.remove(c));
    el.classList.add(t.fontFamily);
    if (el.id === 'profile-container') document.body.style.background = t.bgType === 'solid' ? t.bgColor : '#000';
}

// ---------- Toasts / UI ----------
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 max-w-md w-full px-4';
        document.body.appendChild(container);
    }
    const styles = {
        success: ['bg-emerald-950 border-emerald-900 text-emerald-100', 'text-emerald-400', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'],
        error:   ['bg-rose-950 border-rose-900 text-rose-100', 'text-rose-400', 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'],
        warning: ['bg-amber-950 border-amber-900 text-amber-100', 'text-amber-400', 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'],
        info:    ['bg-zinc-900 border-zinc-800 text-zinc-100', 'text-zinc-400', 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z']
    };
    const [bg, iconColor, path] = styles[type] || styles.info;
    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bg} transform transition-all duration-300 translate-y-10 opacity-0`;
    toast.innerHTML = `
        <svg class="w-5 h-5 shrink-0 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${path}"></path></svg>
        <p class="text-sm font-medium flex-1">${escapeHtml(message)}</p>
        <button type="button" aria-label="Dismiss" class="text-zinc-400 hover:text-white text-xs p-0.5">✕</button>`;
    toast.querySelector('button').addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

function toggleLoading(buttonId, isLoading, defaultText = 'Submit') {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.disabled = !!isLoading;
    btn.textContent = isLoading ? 'Processing...' : defaultText;
}

function renderSafeText(selector, text, fallback = '') {
    const el = document.querySelector(selector);
    if (el) el.textContent = text || fallback;
}

function formatRelativeDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function checkSupabaseConnection() {
    if (isSupabaseConfigured()) return true;
    console.warn('Supabase is not configured. Set CONFIG_SUPABASE_URL and CONFIG_SUPABASE_ANON_KEY in config.js');
    if (!document.getElementById('demo-banner') && document.body) {
        const b = document.createElement('div');
        b.id = 'demo-banner';
        b.textContent = 'Demo mode: Supabase is not configured in config.js. Data is stored only in this browser.';
        document.body.prepend(b);
        document.body.classList.add('has-demo-banner');
    }
    return false;
}

// ---------- Auth helpers (real Supabase, or local demo mode) ----------
function getDemoUser() {
    try { return JSON.parse(localStorage.getItem('demo_user') || 'null'); } catch (_) { return null; }
}

async function getSession() {
    if (!isSupabaseConfigured()) return null;
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    } catch (e) {
        console.error('Session retrieve failed:', e);
        return null;
    }
}

async function getCurrentUser() {
    if (!isSupabaseConfigured()) return getDemoUser();
    const session = await getSession();
    return session ? session.user : null;
}
async function getAuthenticatedSession() { return await getCurrentUser(); }

async function protectUserRoute() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

async function checkIsBlocked(userId) {
    if (!isSupabaseConfigured()) return false;
    try {
        const { data, error } = await supabase.from('profiles').select('is_blocked').eq('id', userId).single();
        return error ? false : !!(data && data.is_blocked);
    } catch (_) { return false; }
}

async function checkIsAdmin(userId) {
    if (!isSupabaseConfigured() || !userId) return false;
    try {
        const { data, error } = await supabase.rpc('is_admin', { p_user_id: userId });
        return !error && !!data;
    } catch (_) { return false; }
}

async function handleLogout() {
    try {
        if (isSupabaseConfigured()) await supabase.auth.signOut();
        else localStorage.removeItem('demo_user');
    } catch (e) { console.error(e); }
    showToast('Signed out successfully', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
}
const logoutUser = handleLogout; // alias used by index/dashboard

// ---------- Site content (admin-editable copy) ----------
async function loadSiteContent(pageKey, fallbacks) {
    const isCallback = typeof fallbacks === 'function';
    const content = isCallback ? {} : Object.assign({}, fallbacks);
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase.from('site_content').select('content_key, content_value').eq('page_key', pageKey);
            if (!error && data) data.forEach(row => { content[row.content_key] = row.content_value; });
        } catch (e) {
            console.warn('Failed to retrieve site content, using defaults:', e);
        }
    }
    if (isCallback) fallbacks(content);
    return content;
}

function bindSiteContent(content) {
    if (!content || typeof content !== 'object') return;
    Object.entries(content).forEach(([key, value]) => {
        if (!value) return;
        document.querySelectorAll(`[data-content="${key}"]`).forEach(el => {
            if (el.tagName === 'A' && /(_url|_link)$/.test(key)) {
                const safe = sanitizeUrl(value);
                if (safe) el.href = safe;
            } else if (el.tagName === 'IMG') {
                const safe = sanitizeUrl(value);
                if (safe) el.src = safe;
            } else {
                el.textContent = value;
            }
        });
    });
}

// ---------- Public profile routing ----------
function getUsernameFromUrl() {
    const q = new URLSearchParams(window.location.search).get('u');
    let name = q || (window.location.pathname.split('/').filter(Boolean).pop() || '').replace(/\.html$/, '');
    name = (name || '').toLowerCase().trim();
    if (!name || name === 'profile') return '';
    return /^[a-z0-9_]{3,30}$/.test(name) ? name : '';
}

// ---------- QR helper (qrcode@1.4.4 browser API) ----------
function drawQr(container, text, size, level) {
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    QRCode.toCanvas(canvas, text, { width: size, margin: 1, errorCorrectionLevel: level || 'M', color: { dark: '#000000', light: '#ffffff' } }, err => {
        if (err) console.error('QR error:', err);
    });
    return canvas;
}
