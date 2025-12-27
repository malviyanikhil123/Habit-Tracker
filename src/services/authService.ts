/**
 * Authentication Service
 * 
 * Handles all authentication operations using Supabase Auth.
 * Provides signup, login, logout, and session management functions.
 * 
 * Features:
 * - Email/Password authentication
 * - Session-based auth with automatic refresh
 * - Auth state change subscriptions
 */

import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Type for auth operation results
export interface AuthResult {
    success: boolean;
    error?: string;
    user?: User | null;
}

/**
 * Sign up a new user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password (minimum 6 characters)
 * @param name - User's display name (stored in user metadata)
 * @returns AuthResult with success status and optional error message
 */
export const signUp = async (
    email: string,
    password: string,
    name: string
): Promise<AuthResult> => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Store additional user data in metadata
                data: {
                    name,
                    full_name: name
                }
            }
        });

        if (error) {
            return {
                success: false,
                error: getErrorMessage(error)
            };
        }

        return {
            success: true,
            user: data.user
        };
    } catch (err) {
        return {
            success: false,
            error: 'An unexpected error occurred during signup'
        };
    }
};

/**
 * Sign in an existing user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns AuthResult with success status and optional error message
 */
export const signIn = async (
    email: string,
    password: string
): Promise<AuthResult> => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return {
                success: false,
                error: getErrorMessage(error)
            };
        }

        return {
            success: true,
            user: data.user
        };
    } catch (err) {
        return {
            success: false,
            error: 'An unexpected error occurred during login'
        };
    }
};

/**
 * Sign out the current user
 * Clears the session from localStorage and Supabase
 * 
 * @returns AuthResult with success status
 */
export const signOut = async (): Promise<AuthResult> => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error: getErrorMessage(error)
            };
        }

        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: 'An unexpected error occurred during logout'
        };
    }
};

/**
 * Get the current session
 * Useful for checking if a user is logged in
 * 
 * @returns The current session or null
 */
export const getSession = async (): Promise<Session | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

/**
 * Get the current user
 * 
 * @returns The current user or null
 */
export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

/**
 * Subscribe to auth state changes
 * Call this to react to login/logout/token refresh events
 * 
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (
    callback: (event: string, session: Session | null) => void
) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            callback(event, session);
        }
    );

    // Return unsubscribe function for cleanup
    return () => {
        subscription.unsubscribe();
    };
};

/**
 * Convert Supabase AuthError to user-friendly message
 */
const getErrorMessage = (error: AuthError): string => {
    switch (error.message) {
        case 'Invalid login credentials':
            return 'Invalid email or password';
        case 'Email not confirmed':
            return 'Please verify your email before logging in';
        case 'User already registered':
            return 'An account with this email already exists';
        case 'Password should be at least 6 characters':
            return 'Password must be at least 6 characters';
        default:
            return error.message || 'An error occurred';
    }
};
