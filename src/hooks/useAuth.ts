/**
 * useAuth Hook - Supabase Integration
 * 
 * Manages authentication state using Supabase Auth.
 * Handles login, signup, logout, and session management.
 * 
 * Features:
 * - Automatic session restoration on page load
 * - Real-time auth state changes
 * - Loading states for better UX
 * - Error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import {
    signIn,
    signUp,
    signOut,
    getSession,
    onAuthStateChange
} from '@/services/authService';

// User type for the app (simplified from Supabase User)
export interface AppUser {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export interface AuthState {
    user: AppUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface UseAuthReturn extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
    logout: () => Promise<void>;
    isNewSignup: boolean;
    clearNewSignupFlag: () => void;
}

/**
 * Convert Supabase User to App User format
 */
const toAppUser = (user: SupabaseUser): AppUser => ({
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    createdAt: user.created_at
});

export const useAuth = (): UseAuthReturn => {
    // Auth state
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true // Start loading until we check session
    });

    // Track if this is a new signup (to show onboarding) - check localStorage first
    const [isNewSignup, setIsNewSignup] = useState(() => {
        return localStorage.getItem('habitTracker_isNewSignup') === 'true';
    });

    const clearNewSignupFlag = useCallback(() => {
        setIsNewSignup(false);
        localStorage.removeItem('habitTracker_isNewSignup');
    }, []);

    /**
     * Initialize auth state by checking existing session
     * Called on mount
     */
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const session = await getSession();

                if (mounted) {
                    if (session?.user) {
                        setAuthState({
                            user: toAppUser(session.user),
                            isAuthenticated: true,
                            isLoading: false
                        });
                    } else {
                        setAuthState({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false
                        });
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                if (mounted) {
                    setAuthState({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                }
            }
        };

        initializeAuth();

        // Subscribe to auth state changes
        const unsubscribe = onAuthStateChange((event: string, session: Session | null) => {
            if (!mounted) return;

            console.log('Auth state changed:', event);

            switch (event) {
                case 'SIGNED_IN':
                case 'TOKEN_REFRESHED':
                    if (session?.user) {
                        setAuthState({
                            user: toAppUser(session.user),
                            isAuthenticated: true,
                            isLoading: false
                        });
                    }
                    break;

                case 'SIGNED_OUT':
                    setAuthState({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    break;

                case 'USER_UPDATED':
                    if (session?.user) {
                        setAuthState(prev => ({
                            ...prev,
                            user: toAppUser(session.user)
                        }));
                    }
                    break;
            }
        });

        // Cleanup subscription on unmount
        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    /**
     * Login with email and password
     * @returns Object with success status and optional error
     */
    const login = useCallback(async (
        email: string,
        password: string
    ): Promise<{ success: boolean; error?: string }> => {
        // Basic validation
        if (!email || !password) {
            return { success: false, error: 'Please fill in all fields' };
        }

        if (!email.includes('@')) {
            return { success: false, error: 'Please enter a valid email' };
        }

        const result = await signIn(email, password);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        // Auth state will be updated by the onAuthStateChange listener
        return { success: true };
    }, []);

    /**
     * Sign up a new user
     * @returns Object with success status and optional error
     */
    const signup = useCallback(async (
        name: string,
        email: string,
        password: string
    ): Promise<{ success: boolean; error?: string; isNewUser?: boolean }> => {
        // Validation
        if (!name || !email || !password) {
            return { success: false, error: 'Please fill in all fields' };
        }

        if (!email.includes('@')) {
            return { success: false, error: 'Please enter a valid email' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        const result = await signUp(email, password, name);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        // Mark this as a new signup for onboarding - persist in localStorage
        setIsNewSignup(true);
        localStorage.setItem('habitTracker_isNewSignup', 'true');

        // Auth state will be updated by the onAuthStateChange listener
        return { success: true, isNewUser: true };
    }, []);

    /**
     * Logout the current user
     */
    const logout = useCallback(async (): Promise<void> => {
        // Clear the new signup flag on logout
        localStorage.removeItem('habitTracker_isNewSignup');
        await signOut();
        // Auth state will be updated by the onAuthStateChange listener
    }, []);

    return {
        ...authState,
        login,
        signup,
        logout,
        isNewSignup,
        clearNewSignupFlag
    };
};
