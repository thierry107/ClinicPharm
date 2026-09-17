/**
 * Curis Health - Supabase Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://supabase.com and open your project dashboard
 * 2. Navigate to Settings → API
 * 3. Copy your Project URL and anon/public key
 * 4. Replace the placeholder values below
 *
 * IMPORTANT: This file contains the PUBLIC (anon) key only.
 * The anon key is safe to expose in frontend code — it respects your Supabase RLS policies.
 * NEVER put your service_role key here.
 */

export const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  anonKey: 'YOUR_ANON_PUBLIC_KEY_HERE'
};
