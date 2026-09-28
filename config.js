// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================

// 1. HARDCODED CREDENTIALS (Configure these for your production deploy)
const CONFIG_SUPABASE_URL = ""; // INSERT_SUPABASE_URL_HERE
const CONFIG_SUPABASE_ANON_KEY = ""; // INSERT_SUPABASE_ANON_KEY_HERE

// 2. RUNTIME RESOLUTION
// Fallbacks to localStorage to allow interactive configuration directly in the preview.
const SUPABASE_URL = CONFIG_SUPABASE_URL || localStorage.getItem('BIOLINK_SUPABASE_URL') || "";
const SUPABASE_ANON_KEY = CONFIG_SUPABASE_ANON_KEY || localStorage.getItem('BIOLINK_SUPABASE_ANON_KEY') || "";

// 3. INITIALIZE CLIENT
// Do not declare supabase to avoid global identifier collision with the Supabase CDN script
if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== "INSERT_SUPABASE_URL_HERE" && SUPABASE_ANON_KEY !== "INSERT_SUPABASE_ANON_KEY_HERE") {
    try {
        window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
    }
}

function isSupabaseConfigured() {
    return window.supabase && typeof window.supabase.from === 'function';
}

// 4. HELPER: EXPORT AND NOTIFY CONFIG REQUIRED
function checkSupabaseConnection() {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase is not configured yet. Please configure CONFIG_SUPABASE_URL and CONFIG_SUPABASE_ANON_KEY in config.js");
        return false;
    }
    return true;
}
