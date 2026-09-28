// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================

// 1. HARDCODED CREDENTIALS (Configure these for your production deploy)
const CONFIG_SUPABASE_URL = "https://ovzyjnoqnbpwwlqtkwit.supabase.co"; // INSERT_SUPABASE_URL_HERE
const CONFIG_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92enlqbm9xbmJwd3dscXRrd2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzA2MDIsImV4cCI6MjA5NjUwNjYwMn0.UgGC9Bvjeud6v29CjUVrnfRWBuf7jDTxmCOW0u62NRw"; // INSERT_SUPABASE_ANON_KEY_HERE

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
