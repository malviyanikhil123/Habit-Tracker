/**
 * Supabase Client Configuration
 * 
 * This file creates and exports a reusable Supabase client instance.
 * The client is configured with environment variables for security.
 * 
 * Usage:
 * import { supabase } from '@/lib/supabase';
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Get Supabase credentials from environment variables
// These are prefixed with VITE_ to be accessible in the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. ' +
        'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    );
}

/**
 * Supabase client instance
 * 
 * This client is configured with:
 * - Type safety using Database types
 * - Auto refresh token for session management
 * - Persistent sessions in localStorage
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Automatically refresh the token before it expires
        autoRefreshToken: true,
        // Persist session in localStorage
        persistSession: true,
        // Detect session from URL (for OAuth callbacks)
        detectSessionInUrl: true
    }
});

/**
 * Helper to get the current user's ID
 * Returns null if no user is logged in
 */
export const getCurrentUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
};
