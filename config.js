// ============================================================================
// BIOLINK — SUPABASE CLIENT CONFIGURATION
// ============================================================================
// STEP 1: https://supabase.com এ যান → আপনার প্রজেক্ট খুলুন
// STEP 2: বাম মেনু → ⚙️ Project Settings → API
// STEP 3: "Project URL" এবং "anon / public" key কপি করুন
// STEP 4: নিচের "ENTER_YOUR_PROJECT_URL" এবং "ENTER_YOUR_ANON_KEY" এর জায়গায় paste করুন
// STEP 5: সেভ করে হোস্টিংয়ে আপলোড করুন → ব্রাউজারে Ctrl+Shift+R
// ============================================================================


// ---------------------------------------------------------------------------
// 🔧 আপনার ক্রেডেনশিয়াল এখানে বসান
// ---------------------------------------------------------------------------

// Supabase Project URL
// উদাহরণ: https://abcdefghijklm.supabase.co
const CONFIG_SUPABASE_URL = "https://ovzyjnoqnbpwwlqtkwit.supabase.co";

// Supabase anon / public key (eyJhbGciOi... দিয়ে শুরু হয়)
const CONFIG_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92enlqbm9xbmJwd3dscXRrd2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzA2MDIsImV4cCI6MjA5NjUwNjYwMn0.UgGC9Bvjeud6v29CjUVrnfRWBuf7jDTxmCOW0u62NRw";


// ---------------------------------------------------------------------------
// ⚙️ নিচের কোড পরিবর্তন করার দরকার নেই
// ---------------------------------------------------------------------------

const SUPABASE_URL = CONFIG_SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG_SUPABASE_ANON_KEY;

// Supabase ক্লায়েন্ট ইনিশিয়ালাইজ
(function initializeSupabase() {
    const url = (SUPABASE_URL || "").trim();
    const key = (SUPABASE_ANON_KEY || "").trim();

    if (!url || !key || url === "ENTER_YOUR_PROJECT_URL" || key === "ENTER_YOUR_ANON_KEY") {
        console.warn(
            "[BioLink] Supabase credentials not set. " +
            "Please replace ENTER_YOUR_PROJECT_URL and ENTER_YOUR_ANON_KEY inside config.js"
        );
        return;
    }

    if (typeof window.supabase === "undefined") {
        console.error(
            "[BioLink] Supabase CDN not loaded. " +
            "Make sure <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2\"></script> " +
            "is included BEFORE config.js in your HTML."
        );
        return;
    }

    try {
        window.supabase = window.supabase.createClient(url, key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
        console.log("[BioLink] Supabase client initialized successfully.");
    } catch (err) {
        console.error("[BioLink] Failed to initialize Supabase client:", err);
    }
})();


// ---------------------------------------------------------------------------
// ✅ হেল্পার ফাংশন (পুরো সাইটে ব্যবহৃত)
// ---------------------------------------------------------------------------

/**
 * Supabase ঠিকমতো configured এবং ready কিনা চেক করে।
 * @returns {boolean}
 */
function isSupabaseConfigured() {
    return (
        window.supabase &&
        typeof window.supabase.from === "function" &&
        typeof window.supabase.auth === "object"
    );
}

/**
 * Supabase সংযোগ চেক করে।
 * Configured না হলে শুধু console-এ warning দেয় (modal দেখায় না)।
 * @returns {boolean}
 */
function checkSupabaseConnection() {
    if (!isSupabaseConfigured()) {
        console.warn(
            "[BioLink] Supabase is not configured. " +
            "Some features (login, signup, dashboard) will not work. " +
            "Please add your credentials inside config.js"
        );
        return false;
    }
    return true;
}