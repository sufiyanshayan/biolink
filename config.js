// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================
// Paste your project's URL and *anon* key below (Supabase > Project Settings > API).
// NEVER paste the service_role key here.
var CONFIG_SUPABASE_URL = "https://ovzyjnoqnbpwwlqtkwit.supabase.co";      // e.g. "https://abcd1234.supabase.co"
var CONFIG_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92enlqbm9xbmJwd3dscXRrd2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzA2MDIsImV4cCI6MjA5NjUwNjYwMn0.UgGC9Bvjeud6v29CjUVrnfRWBuf7jDTxmCOW0u62NRw"; // e.g. "eyJhbGciOi..."

(function () {
    function readStored(key) {
        try { return localStorage.getItem(key) || ""; } catch (_) { return ""; }
    }
    var url = CONFIG_SUPABASE_URL || readStored('BIOLINK_SUPABASE_URL');
    var key = CONFIG_SUPABASE_ANON_KEY || readStored('BIOLINK_SUPABASE_ANON_KEY');

    // The CDN script exposes the library as window.supabase. Replace it with the
    // ready client (only once, so a double include can never break the page).
    if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            window.supabase = window.supabase.createClient(url, key);
        } catch (e) {
            console.error("Failed to initialize Supabase client:", e);
        }
    }
})();

function isSupabaseConfigured() {
    return !!(window.supabase && typeof window.supabase.from === 'function');
}
