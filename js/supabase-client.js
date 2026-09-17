/**
 * Curis Health - Supabase Client Singleton
 *
 * This module initializes a single, reusable Supabase client instance for the
 * entire application. All future Supabase interactions (auth, database queries,
 * real-time subscriptions) should import this client.
 *
 * CURRENT STATUS: SDK initialized and connected. Demo mode is still active.
 * Auth, RLS, and store.js migration to Supabase come in a later phase.
 *
 * HOW TO USE:
 *   import { supabase, isSupabaseReady } from './supabase-client.js';
 *   if (isSupabaseReady()) {
 *     const { data, error } = await supabase.from('patients').select('*');
 *   }
 */

import { SUPABASE_CONFIG } from './config.js';

// Detect if Supabase CDN library has been loaded
const supabaseLib = window.supabase;

let _client = null;
let _ready = false;

function initSupabaseClient() {
  if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
    console.warn(
      '[Curis Health] Supabase CDN library not detected. ' +
      'Ensure the Supabase CDN <script> tag is in index.html before app.js.'
    );
    return null;
  }

  const { url, anonKey } = SUPABASE_CONFIG;

  // Guard against un-configured placeholder credentials
  if (url.includes('YOUR_PROJECT_ID') || anonKey.includes('YOUR_ANON_PUBLIC_KEY')) {
    console.warn(
      '[Curis Health] Supabase credentials not configured yet. ' +
      'Open js/config.js and replace the placeholder URL and anonKey with your project credentials. ' +
      'The app will continue running in Demo/Mock mode until configured.'
    );
    return null;
  }

  try {
    const client = supabaseLib.createClient(url, anonKey, {
      auth: {
        // Persist session in localStorage between page refreshes
        persistSession: true,
        // Automatically refresh the JWT token before it expires
        autoRefreshToken: true,
        // Do NOT auto-detect session from URL (we will handle auth explicitly later)
        detectSessionInUrl: false
      },
      realtime: {
        // Disable realtime globally until explicitly enabled per feature
        enabled: false
      }
    });

    console.info('[Curis Health] ✅ Supabase client initialized successfully.');
    return client;
  } catch (err) {
    console.error('[Curis Health] ❌ Failed to initialize Supabase client:', err);
    return null;
  }
}

// Initialize once on module load
_client = initSupabaseClient();
_ready = _client !== null;

/**
 * The initialized Supabase client instance.
 * Will be null if credentials are not configured or CDN failed to load.
 * @type {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const supabase = _client;

/**
 * Returns true if the Supabase client was successfully initialized.
 * Use this guard before making any Supabase calls.
 * @returns {boolean}
 */
export function isSupabaseReady() {
  return _ready;
}

/**
 * Performs a lightweight connectivity test against the Supabase instance.
 * Logs the result to the console. Does not affect app state.
 * Call this once during app initialization to confirm the connection.
 */
export async function testSupabaseConnection() {
  if (!isSupabaseReady()) {
    console.info('[Curis Health] Supabase connection test skipped — client not ready (Demo Mode active).');
    return;
  }

  try {
    // Minimal query: select nothing from a public table to verify connectivity
    const { error } = await supabase.from('patients').select('id').limit(1);
    if (error) {
      console.warn('[Curis Health] Supabase connectivity test failed:', error.message);
    } else {
      console.info('[Curis Health] ✅ Supabase connectivity test passed. Database is reachable.');
    }
  } catch (err) {
    console.warn('[Curis Health] Supabase connectivity test threw an exception:', err);
  }
}
