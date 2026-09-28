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
        showSetupModal();
        return false;
    }
    return true;
}

// Render configuration overlay helper
function showSetupModal() {
    // Check if the modal already exists to prevent duplicates
    if (document.getElementById('supabase-setup-modal')) return;

    const modalHtml = `
        <div id="supabase-setup-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div class="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white shadow-2xl animate-in fade-in duration-200">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold">Configure Supabase</h3>
                        <p class="text-xs text-zinc-400">Provide your credentials to activate the platform.</p>
                    </div>
                </div>
                
                <form id="supabase-setup-form" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-zinc-400 mb-1">SUPABASE URL</label>
                        <input type="url" id="setup-url" required placeholder="https://xxxx.supabase.co" class="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-zinc-400 mb-1">SUPABASE ANON KEY</label>
                        <input type="text" id="setup-key" required placeholder="eyJhbGciOi..." class="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    
                    <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer">
                        Save and Initialize
                    </button>
                </form>
                
                <div class="mt-4 pt-4 border-t border-zinc-800 text-center">
                    <p class="text-[11px] text-zinc-500">
                        Credentials will be saved securely to your browser's local storage and used exclusively for your session.
                    </p>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Populate existing values if any
    const localUrl = localStorage.getItem('BIOLINK_SUPABASE_URL') || "";
    const localKey = localStorage.getItem('BIOLINK_SUPABASE_ANON_KEY') || "";
    if (localUrl) document.getElementById('setup-url').value = localUrl;
    if (localKey) document.getElementById('setup-key').value = localKey;

    document.getElementById('supabase-setup-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const urlInput = document.getElementById('setup-url').value.trim();
        const keyInput = document.getElementById('setup-key').value.trim();

        if (urlInput && keyInput) {
            localStorage.setItem('BIOLINK_SUPABASE_URL', urlInput);
            localStorage.setItem('BIOLINK_SUPABASE_ANON_KEY', keyInput);
            window.location.reload();
        }
    });
}

// Auto-check on page load after document is parsed
window.addEventListener('DOMContentLoaded', () => {
    // Add developer quick-config toggle in bottom-right of preview
    const configBtn = document.createElement('div');
    configBtn.className = "fixed bottom-4 right-4 z-40 p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full shadow-lg cursor-pointer transition-all";
    configBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        </svg>
    `;
    configBtn.title = "Supabase DB Configuration";
    configBtn.addEventListener('click', showSetupModal);
    document.body.appendChild(configBtn);

    if (!isSupabaseConfigured()) {
        showSetupModal();
    }
});
