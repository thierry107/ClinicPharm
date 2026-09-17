/**
 * Curis Health - Supabase Client Singleton
 *
 * Uses direct ESM import from jsDelivr CDN — no <script> tag or window.supabase needed.
 * This is the single source of truth for the Supabase connection across the entire app.
 *
 * CURRENT STATUS: SDK initialized. Demo/mock mode remains active.
 * Auth and store.js migration come in later phases.
 *
 * HOW TO USE IN OTHER MODULES:
 *   import { supabase, isSupabaseReady } from './supabase-client.js';
 *   if (isSupabaseReady()) {
 *     const { data, error } = await supabase.from('patients').select('*');
 *   }
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_CONFIG } from './config.js';

let _client = null;
let _ready = false;

function initSupabaseClient() {
  const { url, anonKey } = SUPABASE_CONFIG;

  // Guard against un-configured placeholder credentials
  if (!url || url.includes('YOUR_PROJECT_ID') || !anonKey || anonKey.includes('YOUR_ANON_PUBLIC_KEY')) {
    console.warn(
      '[Curis Health] Supabase credentials not configured. ' +
      'Open js/config.js and set your project URL and anon key. ' +
      'App continues in Demo/Mock mode.'
    );
    return null;
  }

  try {
    const client = createClient(url, anonKey, {
      auth: {
        persistSession: true,       // Keep session alive across page refreshes
        autoRefreshToken: true,     // Automatically renew JWT before expiry
        detectSessionInUrl: false   // We will handle auth redirects explicitly later
      }
    });

    console.info('[Curis Health] ✅ Supabase client initialized. Project:', url);
    return client;
  } catch (err) {
    console.error('[Curis Health] ❌ Supabase client failed to initialize:', err.message);
    return null;
  }
}

_client = initSupabaseClient();
_ready = _client !== null;

/**
 * The initialized Supabase client. Null if not configured or init failed.
 * @type {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const supabase = _client;

/**
 * Returns true if Supabase is connected and ready to use.
 * Always check this before making any Supabase API calls.
 * @returns {boolean}
 */
export function isSupabaseReady() {
  return _ready;
}

/**
 * Lightweight connectivity test — pings the Supabase project.
 * Logs result to console only. Does NOT affect app state or demo mode.
 */
export async function testSupabaseConnection() {
  if (!isSupabaseReady()) {
    console.info('[Curis Health] Connection test skipped — Supabase not configured (Demo Mode).');
    return;
  }

  try {
    // Minimal round-trip: select nothing, just confirm the project responds
    const { error } = await supabase.from('patients').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "no rows found" — that's fine, it means the table exists
      console.warn('[Curis Health] Supabase connectivity issue:', error.message);
    } else {
      console.info('[Curis Health] ✅ Supabase connectivity confirmed. Database is reachable.');
    }
  } catch (err) {
    console.warn('[Curis Health] Supabase connectivity test failed:', err.message);
  }
}
